/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - DATABASE SERVICE
   Firebase-Only Engine (Firestore + Realtime Database)
   In-memory cache for instant UI — Firebase is the single source of truth
   ========================================================================== */

import { getServices } from '../config/firebase-config.js';
import { DEFAULT_SETTINGS, DEFAULT_PRICING, DEFAULT_SERVICES } from '../config/default-data.js';

// ── In-memory caches (zero-latency on second access, no localStorage) ───────
let _ordersCache   = null;   // Array<Order>  | null
let _settingsCache = null;   // Object        | null
let _pricingCache  = null;   // Object        | null
let _catalogCache  = null;   // Array<Service>| null
let _cloudSyncBusy = false;

// ── Lazy-load Firebase module references (cached by JS engine) ───────────────
let _fsModule   = null;   // Firestore module
let _rtdbModule = null;   // RTDB module

async function fs() {
  if (!_fsModule) _fsModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
  return _fsModule;
}
async function rtdb() {
  if (!_rtdbModule) _rtdbModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
  return _rtdbModule;
}

// ── Helper: get Firestore & RTDB service handles ─────────────────────────────
function svc() { return getServices(); }

export const DBService = {

  // No-op: kept for call-site compatibility — Firebase handles its own init
  initLocalStore() {},

  // ══════════════════════════════════════════════════════════════════════
  //  SETTINGS
  // ══════════════════════════════════════════════════════════════════════

  async getSettings() {
    // 1. Return in-memory cache immediately (< 1ms)
    if (_settingsCache) return _settingsCache;

    const { db, isDemo } = svc();

    // 2. Fetch from Firestore
    if (!isDemo && db) {
      try {
        const { doc, getDoc } = await fs();
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
          _settingsCache = snap.data();
          return _settingsCache;
        }
      } catch (e) {
        console.warn('Firestore settings fetch:', e);
      }
    }

    // 3. Nothing in Firebase yet — use defaults (and seed Firebase)
    _settingsCache = { ...DEFAULT_SETTINGS };
    if (!isDemo && db) {
      (async () => {
        try {
          const { doc, setDoc } = await fs();
          await setDoc(doc(db, 'settings', 'general'), _settingsCache);
        } catch (e) {}
      })();
    }
    return _settingsCache;
  },

  async saveSettings(settings) {
    _settingsCache = { ...settings };
    const { db, isDemo } = svc();
    if (!isDemo && db) {
      try {
        const { doc, setDoc } = await fs();
        await setDoc(doc(db, 'settings', 'general'), settings);
      } catch (e) {
        console.warn('Save settings error:', e);
      }
    }
    return true;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  PRICING
  // ══════════════════════════════════════════════════════════════════════

  async getPricing() {
    if (_pricingCache) return _pricingCache;
    const { db, isDemo } = svc();
    if (!isDemo && db) {
      try {
        const { doc, getDoc } = await fs();
        const snap = await getDoc(doc(db, 'settings', 'pricing'));
        if (snap.exists()) {
          _pricingCache = snap.data();
          return _pricingCache;
        }
      } catch (e) {}
    }
    _pricingCache = { ...DEFAULT_PRICING };
    return _pricingCache;
  },

  async savePricing(pricing) {
    _pricingCache = { ...pricing };
    const { db, isDemo } = svc();
    if (!isDemo && db) {
      try {
        const { doc, setDoc } = await fs();
        await setDoc(doc(db, 'settings', 'pricing'), pricing);
      } catch (e) {
        console.warn('Save pricing error:', e);
      }
    }
    return true;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  ORDER MERGE HELPER
  // ══════════════════════════════════════════════════════════════════════

  mergeOrderObjects(existing, incoming) {
    if (!existing) return incoming;
    if (!incoming) return existing;
    const merged = { ...existing, ...incoming };

    // Smart-merge files array
    if (existing.files || incoming.files) {
      const l1 = existing.files || [], l2 = incoming.files || [];
      const max = Math.max(l1.length, l2.length);
      const mergedFiles = [];
      for (let i = 0; i < max; i++) {
        const f1 = l1[i] || {}, f2 = l2[i] || {};
        const u1 = f1.url || f1.dataUrl || '', u2 = f2.url || f2.dataUrl || '';
        let bestUrl = u1;
        if (u2.startsWith('https://') || u2.startsWith('http://')) bestUrl = u2;
        else if (u1.startsWith('https://') || u1.startsWith('http://')) bestUrl = u1;
        else if (u2.length > u1.length) bestUrl = u2;
        const bestData  = (f2.dataUrl && f2.dataUrl.length > 500) ? f2.dataUrl : (f1.dataUrl || (bestUrl.startsWith('data:') ? bestUrl : ''));
        const bestPath  = f2.storagePath || f1.storagePath || '';
        mergedFiles.push({ ...f1, ...f2, url: bestUrl, dataUrl: bestData, storagePath: bestPath });
      }
      merged.files = mergedFiles;
    }

    // Smart-merge payment screenshot
    if (existing.payment || incoming.payment) {
      const p1 = existing.payment || {}, p2 = incoming.payment || {};
      const s1 = p1.screenshotUrl || p1.screenshotDataUrl || '';
      const s2 = p2.screenshotUrl || p2.screenshotDataUrl || '';
      const best = s2.length > s1.length ? s2 : (s1 || s2);
      merged.payment = {
        ...p1, ...p2,
        screenshotUrl:     best,
        screenshotDataUrl: p2.screenshotDataUrl || p1.screenshotDataUrl || (best.startsWith('data:') ? best : '')
      };
    }
    return merged;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  GET ALL ORDERS — Firebase only, parallel fetch, memory cache
  // ══════════════════════════════════════════════════════════════════════

  async getOrders() {
    // 1. Return in-memory cache immediately
    if (_ordersCache) return _ordersCache;

    const { db, firebaseApp, isDemo } = svc();

    if (isDemo || !firebaseApp) {
      // No Firebase configured — return empty list
      _ordersCache = [];
      return _ordersCache;
    }

    // 2. Parallel fetch from Firestore + RTDB
    _cloudSyncBusy = true;
    try {
      const map = new Map();

      const [fsResult, rtResult] = await Promise.allSettled([
        // Firestore
        (async () => {
          if (!db) return [];
          const { collection, getDocs, query, orderBy } = await fs();
          const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        })(),
        // Realtime Database
        (async () => {
          const { getDatabase, ref, get } = await rtdb();
          const db2 = getDatabase(firebaseApp);
          const snap = await get(ref(db2, 'orders'));
          if (!snap.exists()) return [];
          return Object.entries(snap.val()).map(([id, o]) => ({ id, ...o }));
        })()
      ]);

      if (fsResult.status === 'fulfilled') {
        fsResult.value.forEach(o => map.set(o.id, this.mergeOrderObjects(map.get(o.id), o)));
      }
      if (rtResult.status === 'fulfilled') {
        rtResult.value.forEach(o => map.set(o.id, this.mergeOrderObjects(map.get(o.id), o)));
      }

      _ordersCache = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      console.warn('getOrders error:', e);
      _ordersCache = _ordersCache || [];
    } finally {
      _cloudSyncBusy = false;
    }

    return _ordersCache;
  },

  invalidateOrdersCache() {
    _ordersCache = null;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  SEARCH & GET BY ID
  // ══════════════════════════════════════════════════════════════════════

  async searchOrders(queryStr) {
    const orders = await this.getOrders();
    const q = queryStr.trim().toLowerCase();
    return orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      (o.customerPhone || '').includes(q) ||
      (o.customerName || '').toLowerCase().includes(q)
    );
  },

  async getOrderById(orderId) {
    // Try cache first
    if (_ordersCache) {
      const found = _ordersCache.find(o => o.id === orderId);
      if (found) return found;
    }
    // Direct Firestore lookup (fast single-doc read)
    const { db, isDemo } = svc();
    if (!isDemo && db) {
      try {
        const { doc, getDoc } = await fs();
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) return { id: snap.id, ...snap.data() };
      } catch (e) {}
    }
    return null;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  SANITIZE FOR CLOUD (keep large dataUrls; strip from Firestore if huge)
  // ══════════════════════════════════════════════════════════════════════

  sanitizeForCloud(order, isFirestore = false) {
    if (!order) return order;
    try {
      const cloud = JSON.parse(JSON.stringify(order));
      if (cloud.files && Array.isArray(cloud.files)) {
        cloud.files.forEach(f => {
          const url = f.url || f.dataUrl || '';
          if (url.startsWith('https://') || url.startsWith('http://')) {
            f.url = url;
            delete f.dataUrl;
          } else if (url.startsWith('data:')) {
            if (isFirestore && url.length > 800000) {
              f.url = f.storagePath ? '' : url;
              if (f.storagePath && f.dataUrl) delete f.dataUrl;
            } else {
              f.url = url;
              f.dataUrl = url;
            }
          }
        });
      }
      if (cloud.payment) {
        const scr = cloud.payment.screenshotUrl || cloud.payment.screenshotDataUrl || '';
        if (scr) { cloud.payment.screenshotUrl = scr; cloud.payment.screenshotDataUrl = scr; }
      }
      return cloud;
    } catch (e) { return order; }
  },

  // ══════════════════════════════════════════════════════════════════════
  //  CREATE ORDER — instant memory update + parallel Firebase writes
  // ══════════════════════════════════════════════════════════════════════

  async createOrder(orderData) {
    const newId     = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const firstFile = orderData.files?.[0] || {};
    const createdAt = new Date().toISOString();

    const newOrder = {
      id:              newId,
      orderId:         newId,
      customerName:    orderData.customerName    || 'Customer',
      customerPhone:   orderData.customerPhone   || '',
      customerEmail:   orderData.customerEmail   || '',
      customerAddress: orderData.customerAddress || '',
      fileName:        firstFile.fileName || firstFile.name || 'document.pdf',
      fileType:        firstFile.fileType || firstFile.type || 'application/pdf',
      fileSize:        firstFile.fileSize || firstFile.size || 'N/A',
      storagePath:     firstFile.storagePath || null,
      downloadURL:     firstFile.downloadURL || firstFile.url || null,
      uploadedAt:      firstFile.uploadedAt || createdAt,
      uploadStatus:    firstFile.uploadStatus || 'uploaded',
      expiresAt:       firstFile.expiresAt || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      printSettings:   orderData.options || {},
      totalAmount:     orderData.pricing?.total || 0,
      paymentStatus:   'Waiting Verification',
      orderStatus:     'Waiting Verification',
      status:          'Waiting Verification',
      createdAt,
      updatedAt:       createdAt,
      estimatedReady:  new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      ...orderData
    };

    // 1. Update in-memory cache immediately (UI sees it instantly)
    if (_ordersCache) _ordersCache.unshift(newOrder);
    else _ordersCache = [newOrder];

    // 2. Parallel writes to Firestore + RTDB (non-blocking)
    const { db, firebaseApp, isDemo } = svc();
    if (!isDemo && firebaseApp) {
      Promise.allSettled([
        db ? (async () => {
          const { doc, setDoc } = await fs();
          await setDoc(doc(db, 'orders', newId), this.sanitizeForCloud(newOrder, true));
          console.log('✅ Firestore:', newId);
        })() : Promise.resolve(),
        (async () => {
          const { getDatabase, ref, set } = await rtdb();
          const db2 = getDatabase(firebaseApp);
          await set(ref(db2, 'orders/' + newId), this.sanitizeForCloud(newOrder, false));
          console.log('✅ RTDB:', newId);
        })()
      ]).catch(e => console.warn('Cloud write:', e));
    }

    return newOrder;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  UPDATE ORDER STATUS — instant memory + parallel cloud writes
  // ══════════════════════════════════════════════════════════════════════

  async updateOrderStatus(orderId, newStatus, isLocked = null) {
    // Work directly from in-memory cache
    const orders = _ordersCache || (await this.getOrders());
    const idx    = orders.findIndex(o => o.id === orderId);

    if (idx !== -1) {
      orders[idx].status    = newStatus;
      orders[idx].updatedAt = new Date().toISOString();

      if (isLocked !== null) {
        orders[idx].isStatusLocked = isLocked;
      } else if (newStatus === 'Completed' || newStatus === 'Rejected') {
        orders[idx].isStatusLocked = true;
      }
      if (newStatus === 'Payment Approved' && orders[idx].payment) {
        orders[idx].payment.status = 'Verified';
      }

      _ordersCache = orders; // keep in-memory up to date

      const updateObj = {
        status:    newStatus,
        updatedAt: orders[idx].updatedAt
      };
      if (orders[idx].isStatusLocked !== undefined) updateObj.isStatusLocked = orders[idx].isStatusLocked;
      if (newStatus === 'Payment Approved') updateObj['payment.status'] = 'Verified';

      // Parallel Firebase writes
      const { db, firebaseApp, isDemo } = svc();
      if (!isDemo && firebaseApp) {
        Promise.allSettled([
          db ? (async () => {
            const { doc, updateDoc } = await fs();
            await updateDoc(doc(db, 'orders', orderId), updateObj);
          })() : Promise.resolve(),
          (async () => {
            const { getDatabase, ref, update } = await rtdb();
            const db2 = getDatabase(firebaseApp);
            await update(ref(db2, 'orders/' + orderId), updateObj);
          })()
        ]).catch(e => console.warn('Status sync:', e));
      }

      return orders[idx];
    }
    return null;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  DELETE ORDER — instant memory remove + parallel cloud delete
  // ══════════════════════════════════════════════════════════════════════

  deleteOrder(orderId) {
    // Instant memory remove
    if (_ordersCache) _ordersCache = _ordersCache.filter(o => o.id !== orderId);

    // Parallel Firebase deletes (non-blocking)
    (async () => {
      const { db, firebaseApp, isDemo } = svc();
      if (!isDemo && firebaseApp) {
        await Promise.allSettled([
          db ? (async () => {
            const { doc, deleteDoc } = await fs();
            await deleteDoc(doc(db, 'orders', orderId));
          })() : Promise.resolve(),
          (async () => {
            const { getDatabase, ref, remove } = await rtdb();
            const db2 = getDatabase(firebaseApp);
            await remove(ref(db2, 'orders/' + orderId));
          })()
        ]);
      }
    })();

    return true;
  },

  // ══════════════════════════════════════════════════════════════════════
  //  UPDATE ORDER IN CLOUD (used by storage cleanup callback)
  // ══════════════════════════════════════════════════════════════════════

  async updateOrderInCloud(order) {
    if (!order?.id) return;
    const { db, firebaseApp, isDemo } = svc();
    if (isDemo || !firebaseApp) return;
    await Promise.allSettled([
      db ? (async () => {
        const { doc, setDoc } = await fs();
        await setDoc(doc(db, 'orders', order.id), this.sanitizeForCloud(order, true));
      })() : Promise.resolve(),
      (async () => {
        const { getDatabase, ref, set } = await rtdb();
        const db2 = getDatabase(firebaseApp);
        await set(ref(db2, 'orders/' + order.id), this.sanitizeForCloud(order, false));
      })()
    ]);
  },

  // ══════════════════════════════════════════════════════════════════════
  //  CUSTOMERS (aggregate from live order cache)
  // ══════════════════════════════════════════════════════════════════════

  async getCustomers() {
    const orders = await this.getOrders();
    const map = {};
    orders.forEach(o => {
      const phone = o.customerPhone || 'unknown';
      if (!map[phone]) {
        map[phone] = {
          name:          o.customerName,
          phone:         o.customerPhone,
          email:         o.customerEmail || 'N/A',
          totalOrders:   0,
          totalSpent:    0,
          lastOrderDate: o.createdAt
        };
      }
      map[phone].totalOrders += 1;
      if (o.status !== 'Rejected') map[phone].totalSpent += (o.pricing?.total || 0);
      if (new Date(o.createdAt) > new Date(map[phone].lastOrderDate)) map[phone].lastOrderDate = o.createdAt;
    });
    return Object.values(map);
  },

  // ══════════════════════════════════════════════════════════════════════
  //  SERVICE CATALOG — Firestore backed, memory cached
  // ══════════════════════════════════════════════════════════════════════

  async getServicesCatalog() {
    if (_catalogCache) return _catalogCache;
    const { db, isDemo } = svc();
    if (!isDemo && db) {
      try {
        const { collection, getDocs } = await fs();
        const snap = await getDocs(collection(db, 'services'));
        if (!snap.empty) {
          _catalogCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          return _catalogCache;
        }
      } catch (e) {
        console.warn('Catalog fetch:', e);
      }
    }
    // Seed with defaults
    _catalogCache = DEFAULT_SERVICES.map(s => ({ category: 'General Printing', status: 'Active', ...s }));
    if (!isDemo && db) {
      (async () => {
        try {
          const { doc, setDoc } = await fs();
          for (const item of _catalogCache) {
            if (item.id) await setDoc(doc(db, 'services', item.id), item);
          }
        } catch (e) {}
      })();
    }
    return _catalogCache;
  },

  async saveCatalogItem(serviceData) {
    const catalog = await this.getServicesCatalog();
    let targetItem = null;

    if (serviceData.id) {
      const idx = catalog.findIndex(s => s.id === serviceData.id);
      if (idx !== -1) {
        catalog[idx] = { ...catalog[idx], ...serviceData };
        targetItem = catalog[idx];
      }
    }

    if (!targetItem) {
      targetItem = {
        id:       'srv-' + Date.now(),
        category: serviceData.category || 'General Printing',
        status:   serviceData.status   || 'Active',
        popular:  !!serviceData.popular,
        icon:     serviceData.icon     || '📄',
        ...serviceData
      };
      catalog.unshift(targetItem);
    }

    _catalogCache = catalog;

    const { db, isDemo } = svc();
    if (!isDemo && db) {
      try {
        const { doc, setDoc } = await fs();
        await setDoc(doc(db, 'services', targetItem.id), targetItem);
      } catch (e) { console.warn('Save catalog item:', e); }
    }
    return targetItem;
  },

  async deleteCatalogItem(serviceId) {
    const catalog = await this.getServicesCatalog();
    _catalogCache = catalog.filter(s => s.id !== serviceId);
    const { db, isDemo } = svc();
    if (!isDemo && db) {
      try {
        const { doc, deleteDoc } = await fs();
        await deleteDoc(doc(db, 'services', serviceId));
      } catch (e) {}
    }
    return true;
  }
};
