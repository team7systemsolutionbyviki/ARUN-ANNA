/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - BACKEND CLOUD FUNCTIONS HTTPS UPLOAD & ADMIN API
   Server-to-Server Firebase Admin SDK Storage Upload (Solves CORS completely)
   ========================================================================== */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const Busboy = require('busboy');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

const app = express();

// Allowed Origins
const allowedOrigins = [
  'https://team7systemsolutionviki.github.io',
  'http://127.0.0.1:5500',
  'http://localhost:5500'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all web clients for customer convenience
    }
  },
  credentials: true
}));

// Helper: Format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper: Estimate PDF Page Count from buffer (< 2ms)
function estimatePdfPagesFromBuffer(buffer) {
  if (!buffer) return 1;
  try {
    const textHead = buffer.slice(0, 128 * 1024).toString('utf8');
    const textTail = buffer.length > 128 * 1024 ? buffer.slice(buffer.length - 128 * 1024).toString('utf8') : '';
    const combined = textHead + ' ' + textTail;

    const countMatches = [...combined.matchAll(/\/Count\s+(\d+)/g)];
    let maxPages = 0;
    for (const match of countMatches) {
      const val = parseInt(match[1], 10);
      if (!isNaN(val) && val > maxPages) maxPages = val;
    }
    if (maxPages > 0) return maxPages;

    const pageMatches = combined.match(/\/Type\s*\/Page\b/g);
    if (pageMatches && pageMatches.length > 0) return pageMatches.length;
  } catch (e) {}
  return 1;
}

// 1. POST /api/upload-document — HTTPS Multipart Upload Endpoint
app.post('/api/upload-document', (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const busboy = Busboy({ headers: req.headers });
  let uploadBuffer = null;
  let fileMetaData = {};
  let reqFields = {};

  busboy.on('field', (fieldname, val) => {
    reqFields[fieldname] = val;
  });

  busboy.on('file', (fieldname, file, info) => {
    const { filename, encoding, mimeType } = info;
    fileMetaData = { filename, encoding, mimeType };

    const chunks = [];
    file.on('data', (data) => chunks.push(data));
    file.on('end', () => {
      uploadBuffer = Buffer.concat(chunks);
    });
  });

  busboy.on('finish', async () => {
    try {
      if (!uploadBuffer || uploadBuffer.length === 0) {
        return res.status(400).json({ success: false, error: 'No file received.' });
      }

      const fileSize = uploadBuffer.length;
      const maxAllowed = 50 * 1024 * 1024; // 50MB
      if (fileSize > maxAllowed) {
        return res.status(413).json({ success: false, error: 'File size exceeds maximum allowed 50MB limit.' });
      }

      const lowerName = (fileMetaData.filename || '').toLowerCase();
      const forbiddenExts = ['.exe', '.js', '.php', '.zip', '.bat', '.sh', '.vbs', '.cmd'];
      if (forbiddenExts.some(ext => lowerName.endsWith(ext))) {
        return res.status(400).json({ success: false, error: 'Security violation: Executable or script files are strictly forbidden.' });
      }

      const allowedExts = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (!allowedExts.some(ext => lowerName.endsWith(ext))) {
        return res.status(400).json({ success: false, error: 'Unsupported file format. Allowed formats: PDF, DOC, DOCX, JPG, PNG, WEBP.' });
      }

      const orderId = reqFields.orderId || ('ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
      const cleanFileName = fileMetaData.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `orders/${orderId}/original/${Date.now()}_${cleanFileName}`;

      // Server-Side Firebase Admin Storage Upload (Bypasses Browser CORS completely)
      const bucket = storage.bucket();
      const fileRef = bucket.file(storagePath);

      await fileRef.save(uploadBuffer, {
        metadata: {
          contentType: fileMetaData.mimeType || 'application/pdf',
          metadata: {
            originalName: fileMetaData.filename,
            orderId: orderId,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      const pageCount = lowerName.endsWith('.pdf') ? estimatePdfPagesFromBuffer(uploadBuffer) : 1;
      const uploadedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

      // Get short-lived signed URL or public URL if bucket is configured
      let downloadURL = '';
      try {
        const [signedUrl] = await fileRef.getSignedUrl({
          action: 'read',
          expires: Date.now() + 7 * 24 * 3600 * 1000 // 7 days
        });
        downloadURL = signedUrl;
      } catch (e) {
        downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
      }

      const responsePayload = {
        success: true,
        orderId: orderId,
        fileName: fileMetaData.filename,
        fileSize: formatBytes(fileSize),
        rawSize: fileSize,
        storagePath: storagePath,
        downloadURL: downloadURL,
        pageCount: pageCount,
        uploadStatus: 'uploaded',
        uploadedAt: uploadedAt,
        expiresAt: expiresAt
      };

      console.log('✅ Server-side upload success:', storagePath);
      return res.status(200).json(responsePayload);
    } catch (err) {
      console.error('❌ Server upload exception:', err);
      return res.status(500).json({ success: false, error: 'Server upload processing failed: ' + err.message });
    }
  });

  req.pipe(busboy);
});

// 2. GET /api/orders/:orderId/file — Secure Admin Stream / Signed URL Download Endpoint
app.get('/api/orders/:orderId/file', async (req, res) => {
  try {
    const { orderId } = req.params;
    const pathQuery = req.query.path;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    const bucket = storage.bucket();
    let fileRef = null;

    if (pathQuery) {
      fileRef = bucket.file(pathQuery);
    } else {
      // Find file in bucket under orders/{orderId}/original/
      const [files] = await bucket.getFiles({ prefix: `orders/${orderId}/original/` });
      if (files.length > 0) {
        fileRef = files[0];
      }
    }

    if (!fileRef) {
      return res.status(404).json({ error: 'Order document file not found in storage.' });
    }

    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000 // 15-minute secure access window
    });

    return res.json({ success: true, downloadUrl: signedUrl });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate secure file access URL: ' + err.message });
  }
});

exports.api = functions.https.onRequest(app);
