/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - STORAGE SERVICE (HIGH-SPEED INDEXEDDB + HYBRID CLOUD)
   ========================================================================== */

import { getServices } from '../config/firebase-config.js';

let dbPromise = null;
const blobUrlCache = new Map();
let firebaseStorageModule = null;

// Initialize IndexedDB instance for zero-latency local binary file storage
function getIDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open('Team7StorageDB', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files');
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (err) => {
        console.warn("IndexedDB open error:", err);
        resolve(null);
      };
    } catch (e) {
      console.warn("IndexedDB initialization error:", e);
      resolve(null);
    }
  });
  return dbPromise;
}

export const StorageService = {
  // Save raw binary File/Blob into IndexedDB
  async saveToIDB(idbKey, fileOrBlob) {
    const db = await getIDB();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        const req = store.put(fileOrBlob, idbKey);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        console.warn("IDB save error:", e);
        resolve(false);
      }
    });
  },

  // Get raw binary File/Blob from IndexedDB by idbKey
  async getFromIDB(idbKey) {
    if (!idbKey) return null;
    const db = await getIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const req = store.get(idbKey);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (e) {
        console.warn("IDB fetch error:", e);
        resolve(null);
      }
    });
  },

  // Delete raw binary File/Blob from IndexedDB (Auto-Deletion Engine)
  async deleteFromIDB(idbKey) {
    if (!idbKey) return false;
    const db = await getIDB();
    if (!db) return false;
    if (blobUrlCache.has(idbKey)) {
      try {
        URL.revokeObjectURL(blobUrlCache.get(idbKey));
      } catch (e) {}
      blobUrlCache.delete(idbKey);
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        const req = store.delete(idbKey);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        console.warn("IDB delete error:", e);
        resolve(false);
      }
    });
  },

  // Auto-delete PDF document binary files for an order (Data Safety & Confidentiality)
  async deleteOrderFiles(order) {
    if (!order) return;
    const filesList = order.files && order.files.length > 0 ? order.files : (order.file ? [order.file] : []);
    for (const f of filesList) {
      const idbKey = f.idbKey || (f.url && f.url.startsWith('idb://') ? f.url.replace('idb://', '') : null);
      if (idbKey) {
        await this.deleteFromIDB(idbKey);
      }
    }
  },

  // Get Blob object from file record
  async getFileBlob(fileObj) {
    if (!fileObj) return null;
    if (fileObj.idbKey) {
      const blob = await this.getFromIDB(fileObj.idbKey);
      if (blob) return blob;
    }
    const url = fileObj.url || (typeof fileObj === 'string' ? fileObj : '');
    if (url.startsWith('idb://')) {
      const key = url.replace('idb://', '');
      const blob = await this.getFromIDB(key);
      if (blob) return blob;
    }
    if (url.startsWith('data:')) {
      try {
        const arr = url.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      } catch (e) {
        console.warn("Base64 to blob conversion failed:", e);
      }
    }
    return null;
  },

  // Get usable browser URL (blob URL, HTTPS URL, Data URL, or live Firebase Storage lookup)
  async getFileUrl(fileObj) {
    if (!fileObj) return '';
    let target = fileObj;
    if (typeof fileObj === 'string') {
      target = { url: fileObj };
    }

    const url = target.url || target.screenshotUrl || '';
    const dataUrl = target.dataUrl || target.screenshotDataUrl || target.fallbackData || '';
    const idbKey = target.idbKey || target.screenshotIdbKey || (url.startsWith('idb://') ? url.replace('idb://', '') : '');
    const storagePath = target.storagePath || '';

    // 1. Direct Web HTTPS, HTTP, Blob, or valid Base64 Data URLs (Works cross-device)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    if (url.startsWith('data:') && url.length > 500) {
      return url;
    }
    if (dataUrl && (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || (dataUrl.startsWith('data:') && dataUrl.length > 500))) {
      return dataUrl;
    }

    // 2. Fetch live from Firebase Storage if storagePath is recorded or perform dynamic candidate path lookup
    const { storage, isDemo } = getServices();
    if (!isDemo && storage) {
      try {
        if (!firebaseStorageModule) {
          firebaseStorageModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
        }
        const { ref, getDownloadURL } = firebaseStorageModule;
        
        // A. Primary recorded storagePath
        if (storagePath) {
          try {
            const cloudUrl = await getDownloadURL(ref(storage, storagePath));
            if (cloudUrl) return cloudUrl;
          } catch (e) {}
        }
        
        // B. Dynamic candidate path lookup based on filename
        if (target.name) {
          try {
            const cleanName = target.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const candidatePath = `customer_docs/${cleanName}`;
            const cloudUrl = await getDownloadURL(ref(storage, candidatePath));
            if (cloudUrl) return cloudUrl;
          } catch (e) {}
        }
      } catch (e) {
        console.warn("Cloud URL resolution warning:", e);
      }
    }

    // 3. Check in-memory blob cache
    if (idbKey && blobUrlCache.has(idbKey)) {
      return blobUrlCache.get(idbKey);
    }

    // 4. Try local IndexedDB (Same device)
    if (idbKey) {
      const blob = await this.getFromIDB(idbKey);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        blobUrlCache.set(idbKey, blobUrl);
        return blobUrl;
      }
    }

    return '';
  },

  // Read file as Data URL (Base64 string)
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },

  // File Validation: Type (PDF, DOC, DOCX, JPG, PNG, WEBP) & Size (Max 200MB)
  validateFile(file) {
    if (!file) return { valid: false, error: 'No file selected.' };
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      return { valid: false, error: `File "${file.name}" exceeds maximum allowed size of 200MB (${this.formatBytes(file.size)}).` };
    }

    const allowedExts = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileName = file.name ? file.name.toLowerCase() : '';
    const hasValidExt = allowedExts.some(ext => fileName.endsWith(ext));

    const allowedMIMEs = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    const hasValidMIME = !file.type || allowedMIMEs.includes(file.type.toLowerCase()) || file.type.startsWith('image/');

    if (!hasValidExt && !hasValidMIME) {
      return { valid: false, error: `File "${file.name}" has an unsupported format. Allowed formats: PDF, DOC, DOCX, JPG, PNG, WEBP.` };
    }

    return { valid: true };
  },

  // Resumable Firebase Cloud Storage Upload with Live Progress Callback (Zero-Memory Main-Thread Streaming)
  async uploadFileResumable(file, orderId = 'temp', onProgress = null) {
    const val = this.validateFile(file);
    if (!val.valid) {
      throw new Error(val.error);
    }

    const uploadedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(); // 7 days

    const { storage, auth, isDemo } = getServices();
    let downloadUrl = '';
    let storagePath = '';

    console.log("[UPLOAD DIAGNOSTIC] Starting file upload processing...");
    console.log("[UPLOAD DIAGNOSTIC] File name:", file.name);
    console.log("[UPLOAD DIAGNOSTIC] File size:", file.size, `(${this.formatBytes(file.size)})`);
    console.log("[UPLOAD DIAGNOSTIC] File type:", file.type);
    console.log("[UPLOAD DIAGNOSTIC] Mode:", isDemo ? 'DEMO' : 'FIREBASE');
    console.log("[UPLOAD DIAGNOSTIC] Storage Bucket:", storage?.app?.options?.storageBucket || 'None');
    console.log("[UPLOAD DIAGNOSTIC] Auth User UID:", auth?.currentUser?.uid || 'Unauthenticated (Anonymous session missing)');

    if (!isDemo && storage) {
      try {
        if (!firebaseStorageModule) {
          firebaseStorageModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
        }
        const { ref, uploadBytesResumable, getDownloadURL } = firebaseStorageModule;
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        storagePath = `orders/${orderId}/original/${Date.now()}_${cleanFileName}`;
        const fileRef = ref(storage, storagePath);

        console.log("[UPLOAD DIAGNOSTIC] Created Storage Reference:", storagePath);
        console.log("[UPLOAD DIAGNOSTIC] Initiating uploadBytesResumable task...");

        const metadata = {
          contentType: file.type || 'application/pdf',
          customMetadata: {
            originalName: file.name,
            orderId: orderId,
            uploadedAt: uploadedAt
          }
        };

        const uploadTask = uploadBytesResumable(fileRef, file, metadata);
        console.log("[UPLOAD DIAGNOSTIC] uploadBytesResumable Task Object created successfully:", uploadTask);
        const startTime = Date.now();

        // Wrap uploadTask in a Promise to track live progress
        downloadUrl = await new Promise((resolve, reject) => {
          let hasReceivedProgress = false;

          // 10-Second Timeout Monitor: If 0% progress after 10s, report connection diagnostic
          const progressMonitorTimeout = setTimeout(() => {
            if (!hasReceivedProgress) {
              console.warn("[UPLOAD DIAGNOSTIC WARNING] No upload progress received after 10s. Checking Storage connectivity...");
            }
          }, 10000);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              hasReceivedProgress = true;
              clearTimeout(progressMonitorTimeout);

              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              const now = Date.now();
              const elapsed = (now - startTime) / 1000; // total elapsed seconds
              const speed = elapsed > 0.2 ? (snapshot.bytesTransferred / elapsed) : 0; // average bytes/sec
              const remainingBytes = Math.max(0, snapshot.totalBytes - snapshot.bytesTransferred);
              const remainingSecs = speed > 0 ? Math.ceil(remainingBytes / speed) : 0;

              console.log(`[UPLOAD DIAGNOSTIC] Progress: ${snapshot.bytesTransferred} / ${snapshot.totalBytes} (${progress}%) @ ${this.formatBytes(speed)}/s`);

              if (typeof onProgress === 'function') {
                onProgress({
                  progress: progress,
                  bytesTransferred: snapshot.bytesTransferred,
                  totalBytes: snapshot.totalBytes,
                  speed: speed,
                  remainingSecs: remainingSecs,
                  state: snapshot.state
                });
              }
            },
            (error) => {
              clearTimeout(progressMonitorTimeout);
              console.error('[UPLOAD DIAGNOSTIC ERROR] Firebase Storage Upload Task Error:', error);
              console.error('[UPLOAD DIAGNOSTIC ERROR CODE]:', error.code);
              console.error('[UPLOAD DIAGNOSTIC ERROR MESSAGE]:', error.message);
              reject(error);
            },
            async () => {
              clearTimeout(progressMonitorTimeout);
              try {
                console.log("[UPLOAD DIAGNOSTIC] Upload Task 100% Complete. Resolving Download URL...");
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("[UPLOAD DIAGNOSTIC SUCCESS] Download URL resolved:", url);
                resolve(url);
              } catch (err) {
                console.error("[UPLOAD DIAGNOSTIC ERROR] Failed to fetch Download URL after upload:", err);
                reject(err);
              }
            }
          );
        });

        console.log('✅ Original file successfully stored in Firebase Storage:', storagePath);
      } catch (err) {
        console.warn('Firebase Storage upload failed:', err);
        throw new Error(`Cloud upload failed for "${file.name}". ${err.message || 'Please check connection.'}`);
      }
    } else {
      // Demo / Fallback mode
      console.log("[UPLOAD DIAGNOSTIC] Running in Demo mode / fallback.");
      downloadUrl = URL.createObjectURL(file);
      if (typeof onProgress === 'function') onProgress(100, 'SUCCESS');
    }

    return {
      uploadStatus: 'uploaded',
      downloadURL: downloadUrl,
      url: downloadUrl,
      storagePath: storagePath,
      fileName: file.name,
      name: file.name,
      fileType: file.type || 'application/pdf',
      type: file.type || 'application/pdf',
      fileSize: this.formatBytes(file.size),
      size: this.formatBytes(file.size),
      rawSize: file.size,
      uploadedAt: uploadedAt,
      expiresAt: expiresAt
    };
  },

  // Universal upload wrapper (maintains backward compatibility)
  async uploadFile(file, pathFolder = 'uploads', onProgress = null) {
    const val = this.validateFile(file);
    if (!val.valid) {
      throw new Error(val.error);
    }
    return this.uploadFileResumable(file, pathFolder.replace(/[^a-zA-Z0-9_-]/g, '_'), onProgress);
  },

  // Delete a file from Firebase Storage by its storagePath
  async deleteFileByPath(storagePath) {
    if (!storagePath || storagePath === '') return false;
    const { storage, isDemo } = getServices();
    if (isDemo || !storage) return false;
    try {
      if (!firebaseStorageModule) {
        firebaseStorageModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
      }
      const { ref, deleteObject } = firebaseStorageModule;
      await deleteObject(ref(storage, storagePath));
      console.log('🗑️ Firebase Storage file deleted:', storagePath);
      return true;
    } catch (err) {
      console.warn('Storage delete warning (may already be deleted):', storagePath, err.code);
      return false;
    }
  },

  // Auto-cleanup: delete expired Firebase Storage files while preserving the Firestore order document
  async cleanupExpiredFiles(orders, updateOrderCallback) {
    if (!orders || orders.length === 0) return;
    const now = Date.now();
    for (const order of orders) {
      if (!order.files) continue;
      let changed = false;
      for (const f of order.files) {
        if (f.uploadStatus === 'expired' || f.expired) continue; // already marked expired
        if (!f.expiresAt) continue; // no expiry set
        if (new Date(f.expiresAt).getTime() > now) continue; // not yet expired

        // File is expired — delete actual file from Firebase Storage
        if (f.storagePath) {
          await this.deleteFileByPath(f.storagePath);
        }

        // Keep order document intact in Firestore, update file status to 'expired'
        f.uploadStatus = 'expired';
        f.expired = true;
        f.downloadURL = null;
        f.url = '';
        f.dataUrl = '';
        f.storagePath = null;
        changed = true;
      }

      if (changed && typeof updateOrderCallback === 'function') {
        await updateOrderCallback(order);
      }
    }
  },

  // Helper format bytes
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  // Ultra-Fast PDF Page Count Estimator (< 5ms)
  async estimatePdfPages(file) {
    if (!file) return 1;
    const isPdf = file.name && file.name.toLowerCase().endsWith('.pdf');
    const fallbackEst = Math.max(1, Math.ceil(file.size / (120 * 1024)));
    if (!isPdf) return fallbackEst;

    return new Promise((resolve) => {
      // Fast chunk reading: first 128KB and last 128KB of PDF
      const chunkSize = 128 * 1024;
      const headChunk = file.slice(0, chunkSize);
      const tailChunk = file.size > chunkSize ? file.slice(Math.max(0, file.size - chunkSize)) : null;

      let pagesFound = 0;
      let pendingReads = tailChunk ? 2 : 1;

      const checkFinish = () => {
        pendingReads--;
        if (pendingReads <= 0) {
          resolve(pagesFound > 0 ? pagesFound : fallbackEst);
        }
      };

      const processText = (text) => {
        if (!text) return;
        // Search for /Count N in PDF catalog/tree
        const countMatches = [...text.matchAll(/\/Count\s+(\d+)/g)];
        for (const match of countMatches) {
          const countVal = parseInt(match[1], 10);
          if (!isNaN(countVal) && countVal > pagesFound) {
            pagesFound = countVal;
          }
        }
        // Fallback: search for /Type /Page
        if (pagesFound === 0) {
          const pageMatches = text.match(/\/Type\s*\/Page\b/g);
          if (pageMatches && pageMatches.length > pagesFound) {
            pagesFound = pageMatches.length;
          }
        }
      };

      const readerHead = new FileReader();
      readerHead.onload = (e) => {
        processText(e.target.result);
        checkFinish();
      };
      readerHead.onerror = checkFinish;
      readerHead.readAsText(headChunk);

      if (tailChunk) {
        const readerTail = new FileReader();
        readerTail.onload = (e) => {
          processText(e.target.result);
          checkFinish();
        };
        readerTail.onerror = checkFinish;
        readerTail.readAsText(tailChunk);
      }
    });
  }
};

// Expose standalone test upload helper for diagnostic testing via DevTools console
window.debugUploadFile = async (file) => {
  console.log("=== MINIMAL DIAGNOSTIC UPLOAD TEST START ===");
  try {
    const res = await StorageService.uploadFileResumable(file, 'diagnostic_test', (metrics) => {
      console.log(`[TEST UPLOAD PROGRESS] ${metrics.progress}% (${metrics.bytesTransferred}/${metrics.totalBytes})`);
    });
    console.log("=== MINIMAL DIAGNOSTIC UPLOAD TEST SUCCESS ===", res);
    return res;
  } catch (err) {
    console.error("=== MINIMAL DIAGNOSTIC UPLOAD TEST FAILED ===", err);
    throw err;
  }
};
