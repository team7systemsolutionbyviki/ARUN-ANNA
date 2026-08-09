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

  // Get usable browser URL (blob URL, HTTPS URL, or Data URL)
  async getFileUrl(fileObj) {
    if (!fileObj) return '';
    let target = fileObj;
    if (typeof fileObj === 'string') {
      target = { url: fileObj };
    }

    const url = target.url || target.screenshotUrl || '';
    const dataUrl = target.dataUrl || target.screenshotDataUrl || target.fallbackData || '';
    const idbKey = target.idbKey || target.screenshotIdbKey || (url.startsWith('idb://') ? url.replace('idb://', '') : '');

    // 1. Direct Web HTTPS, HTTP, Blob, or Data URLs (Works cross-device)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }

    // 2. Check in-memory blob cache
    if (idbKey && blobUrlCache.has(idbKey)) {
      return blobUrlCache.get(idbKey);
    }

    // 3. Try local IndexedDB (Same device)
    if (idbKey) {
      const blob = await this.getFromIDB(idbKey);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        blobUrlCache.set(idbKey, blobUrl);
        return blobUrl;
      }
    }

    // 4. Fallback to Data URL if stored in file object (Cross-device fallback)
    if (dataUrl && dataUrl.startsWith('data:')) {
      return dataUrl;
    }

    return url.startsWith('idb://') ? '' : url;
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

  // Universal Cross-Device Upload Function: Firebase Cloud Storage + Base64 Data URL fallback + IndexedDB
  async uploadFile(file, pathFolder = 'uploads') {
    const idbKey = 'idb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

    // Save to IndexedDB immediately (< 10ms for local device fast access)
    const savedLocally = await this.saveToIDB(idbKey, file);
    if (savedLocally) {
      const objectUrl = URL.createObjectURL(file);
      blobUrlCache.set(idbKey, objectUrl);
    }

    let downloadUrl = '';
    let dataUrl = '';

    // Convert file to Base64 Data URL for universal fallback sync (files <= 25MB or images)
    if (file.size <= 25 * 1024 * 1024) {
      try {
        dataUrl = await this.readFileAsDataURL(file);
      } catch (e) {
        console.warn("Data URL conversion warning:", e);
      }
    }

    // Try Firebase Storage upload for universal cloud URL
    const { storage, isDemo } = getServices();
    if (!isDemo && storage) {
      try {
        if (!firebaseStorageModule) {
          firebaseStorageModule = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js");
        }
        const { ref, uploadBytes, getDownloadURL } = firebaseStorageModule;
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileRef = ref(storage, `${pathFolder}/${Date.now()}_${cleanFileName}`);

        // Try upload with 15 second timeout
        const uploadPromise = uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef));
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Cloud upload timeout")), 15000));

        const cloudUrl = await Promise.race([uploadPromise, timeoutPromise]);
        if (cloudUrl) {
          downloadUrl = cloudUrl;
        }
      } catch (err) {
        console.warn("Firebase Cloud storage upload warning, using Data URL / local store:", err);
      }
    }

    // Final downloadUrl resolution order: Cloud HTTPS URL -> Data URL -> idb:// key
    if (!downloadUrl) {
      if (dataUrl) {
        downloadUrl = dataUrl;
      } else {
        downloadUrl = 'idb://' + idbKey;
      }
    }

    return {
      url: downloadUrl,
      dataUrl: dataUrl,
      idbKey: idbKey,
      name: file.name,
      size: this.formatBytes(file.size),
      type: file.type || 'application/pdf'
    };
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
