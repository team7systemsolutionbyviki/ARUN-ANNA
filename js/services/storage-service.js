/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - STORAGE SERVICE
   ========================================================================== */

import { getServices } from '../config/firebase-config.js';

export const StorageService = {
  // Read file as Data URL (for local preview/storage fallback)
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },

  // Upload file with persistent Data URL fallback
  async uploadFile(file, pathFolder = 'uploads') {
    let localUrl = await this.readFileAsDataURL(file);

    const { storage, isDemo } = getServices();

    if (!isDemo && storage) {
      try {
        const uploadPromise = (async () => {
          const { ref, uploadBytes, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js");
          const fileRef = ref(storage, `${pathFolder}/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          return await getDownloadURL(fileRef);
        })();

        // 1.2s timeout so network blocks or missing Firebase Storage buckets never freeze file selection
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Storage timeout")), 1200));
        const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);

        return {
          url: downloadUrl,
          name: file.name,
          size: this.formatBytes(file.size),
          type: file.type || 'application/octet-stream'
        };
      } catch (err) {
        console.warn("Storage upload network timeout/fallback to instant Blob URL:", err);
      }
    }

    return {
      url: localUrl,
      name: file.name,
      size: this.formatBytes(file.size),
      type: file.type || 'application/octet-stream'
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

  // Estimate PDF or Document Page Count safely
  async estimatePdfPages(file) {
    if (!file) return 1;
    const est = Math.max(1, Math.ceil(file.size / (100 * 1024)));
    const isPdf = file.name && file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return est;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(est), 400);
      const reader = new FileReader();
      reader.onload = (e) => {
        clearTimeout(timeout);
        try {
          const content = e.target.result || '';
          const matches = content.match(/\/Type\s*\/Page\b/g);
          if (matches && matches.length > 0) resolve(matches.length);
          else resolve(est);
        } catch (err) {
          resolve(est);
        }
      };
      reader.onerror = () => { clearTimeout(timeout); resolve(est); };
      try {
        reader.readAsText(file.slice(0, 512 * 1024));
      } catch (e) {
        clearTimeout(timeout);
        resolve(est);
      }
    });
  }
};
