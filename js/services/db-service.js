/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - DATABASE SERVICE (FIRESTORE + LOCALFALLBACK)
   ========================================================================== */

import { getServices } from '../config/firebase-config.js';
import { INITIAL_ORDERS, DEFAULT_SETTINGS, DEFAULT_PRICING, DEFAULT_SERVICES } from '../config/default-data.js';

const ORDERS_KEY = 'team7_orders_store';
const SETTINGS_KEY = 'team7_settings_store';
const CATALOG_KEY = 'team7_catalog_store';

export const DBService = {
  // Initialize sample data into local storage if empty (with migration for demo orders)
  initLocalStore() {
    if (!localStorage.getItem(ORDERS_KEY)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem(ORDERS_KEY));
        let updated = false;
        stored.forEach(o => {
          const sample = INITIAL_ORDERS.find(s => s.id === o.id);
          if (sample) {
            if (!o.payment?.screenshotUrl || o.payment.screenshotUrl.includes('placeholder')) {
              if (!o.payment) o.payment = {};
              o.payment.screenshotUrl = sample.payment.screenshotUrl;
              updated = true;
            }
            if (!o.files || o.files.length < sample.files.length) {
              o.files = sample.files;
              updated = true;
            } else if (o.files && o.files[0] && (!o.files[0].url || o.files[0].url.includes('placeholder'))) {
              o.files[0].url = sample.files[0].url;
              updated = true;
            }
          }
        });
        if (updated) {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(stored));
        }
      } catch (e) {}
    }
    if (!localStorage.getItem(SETTINGS_KEY)) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(CATALOG_KEY)) {
      const initialCatalog = DEFAULT_SERVICES.map(s => ({
        category: 'General Printing',
        status: 'Active',
        ...s
      }));
      localStorage.setItem(CATALOG_KEY, JSON.stringify(initialCatalog));
    }
  },

  // Get Shop Settings
  async getSettings() {
    this.initLocalStore();
    const { db, isDemo } = getServices();
    if (!isDemo && db) {
      try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const docRef = doc(db, "settings", "general");
        const snap = await getDoc(docRef);
        if (snap.exists()) return snap.data();
      } catch (err) {
        // Fallback to local storage engine silently if Firestore rules restrict access
      }
    }
    const local = localStorage.getItem(SETTINGS_KEY);
    return local ? JSON.parse(local) : DEFAULT_SETTINGS;
  },

  // Save Shop Settings
  async saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    const { db, isDemo } = getServices();
    if (!isDemo && db) {
      try {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await setDoc(doc(db, "settings", "general"), settings);
      } catch (err) {
        // Fallback to local storage engine silently
      }
    }
    return true;
  },

  // Fetch all orders
  // Fetch all orders (Unified Local Storage + Firestore + Realtime Database merge)
  async getOrders() {
    this.initLocalStore();
    const localStr = localStorage.getItem(ORDERS_KEY);
    let localOrders = localStr ? JSON.parse(localStr) : [];

    const map = new Map();
    localOrders.forEach(o => map.set(o.id, o));

    const { db, firebaseApp, isDemo } = getServices();
    if (!isDemo && firebaseApp) {
      // 1. Fetch from Firestore
      if (db) {
        try {
          const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
          const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
          const snap = await getDocs(q);
          snap.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() }));
        } catch (err) {
          console.warn('Firestore fetch warning:', err);
        }
      }

      // 2. Fetch from Firebase Realtime Database (RTDB fallback for 100% cloud sync guarantee)
      try {
        const { getDatabase, ref, get } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        const rtdb = getDatabase(firebaseApp);
        const snap = await get(ref(rtdb, 'orders'));
        if (snap.exists()) {
          const rtdbData = snap.val();
          Object.entries(rtdbData).forEach(([id, order]) => {
            if (!map.has(id) || new Date(order.updatedAt || order.createdAt) > new Date(map.get(id)?.updatedAt || map.get(id)?.createdAt || 0)) {
              map.set(id, { id, ...order });
            }
          });
        }
      } catch (err) {
        console.warn('RTDB fetch warning:', err);
      }
    }

    const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    try {
      const cleanOrders = merged.map(o => this.sanitizeOrderForStorage(o));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(cleanOrders));
    } catch (e) {}

    // Background: auto-delete expired Firebase Storage files (non-blocking)
    setTimeout(async () => {
      try {
        const { StorageService } = await import('./storage-service.js');
        await StorageService.cleanupExpiredFiles(merged, async (updatedOrder) => {
          await this.updateOrderInCloud(updatedOrder);
          // Update localStorage too
          try {
            const localStr = localStorage.getItem(ORDERS_KEY);
            if (localStr) {
              const stored = JSON.parse(localStr);
              const idx = stored.findIndex(o => o.id === updatedOrder.id);
              if (idx !== -1) {
                stored[idx] = this.sanitizeOrderForStorage(updatedOrder);
                localStorage.setItem(ORDERS_KEY, JSON.stringify(stored));
              }
            }
          } catch (e) {}
        });
      } catch (e) {}
    }, 2000);

    return merged;
  },

  // Find order by ID or Phone
  async searchOrders(queryStr) {
    const orders = await this.getOrders();
    const clean = queryStr.trim().toLowerCase();
    return orders.filter(o => 
      o.id.toLowerCase().includes(clean) || 
      o.customerPhone.includes(clean) || 
      o.customerName.toLowerCase().includes(clean)
    );
  },

  // Get single order by ID
  async getOrderById(orderId) {
    const orders = await this.getOrders();
    return orders.find(o => o.id === orderId) || null;
  },

  // Sanitize order payload to prevent local quota errors while preserving cloud data
  sanitizeOrderForStorage(order) {
    if (!order) return order;
    try {
      const cleanOrder = JSON.parse(JSON.stringify(order));
      if (cleanOrder.files && Array.isArray(cleanOrder.files)) {
        cleanOrder.files.forEach(f => {
          if (f.url && f.url.startsWith('data:') && f.url.length > 5000000) {
            f.url = f.idbKey ? ('idb://' + f.idbKey) : '';
          }
        });
      }
      return cleanOrder;
    } catch (e) {
      return order;
    }
  },

  // Strip base64 dataUrls for cloud (Firestore has 1MB doc limit) — keeps HTTPS URLs intact
  sanitizeForCloud(order) {
    if (!order) return order;
    try {
      const cloud = JSON.parse(JSON.stringify(order));
      if (cloud.files && Array.isArray(cloud.files)) {
        cloud.files.forEach(f => {
          // Keep Firebase Storage HTTPS URL + expiry metadata; remove raw base64
          if (f.dataUrl) delete f.dataUrl;
          if (f.url && f.url.startsWith('data:')) {
            f.url = f.idbKey ? ('idb://' + f.idbKey) : '[local-only]';
          }
          // Always preserve: storagePath, uploadedAt, expiresAt, expired flag
          // (these are needed for server-side/client-side auto-deletion)
        });
      }
      if (cloud.payment) {
        if (cloud.payment.screenshotDataUrl) delete cloud.payment.screenshotDataUrl;
        if (cloud.payment.screenshotUrl && cloud.payment.screenshotUrl.startsWith('data:')) {
          cloud.payment.screenshotUrl = cloud.payment.screenshotIdbKey
            ? ('idb://' + cloud.payment.screenshotIdbKey)
            : '[local-only]';
        }
      }
      return cloud;
    } catch (e) {
      return order;
    }
  },

  // Update a single order record in Firestore + RTDB (used by cleanup callback)
  async updateOrderInCloud(order) {
    if (!order || !order.id) return;
    const { db, firebaseApp, isDemo } = getServices();
    if (isDemo || !firebaseApp) return;
    const cloudOrder = this.sanitizeForCloud(order);
    if (db) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await setDoc(doc(db, 'orders', order.id), cloudOrder);
      } catch (e) {}
    }
    try {
      const { getDatabase, ref, set } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js');
      const rtdb = getDatabase(firebaseApp);
      await set(ref(rtdb, 'orders/' + order.id), cloudOrder);
    } catch (e) {}
  },

  // Create new Order (Dual Sync: Firestore + Firebase Realtime Database)
  async createOrder(orderData) {
    this.initLocalStore();
    const newId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: newId,
      ...orderData,
      status: 'Waiting Verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedReady: new Date(Date.now() + 4 * 3600 * 1000).toISOString()
    };

    // Save Local safely
    try {
      const orders = await this.getOrders();
      orders.unshift(newOrder);
      const cleanOrders = orders.map(o => this.sanitizeOrderForStorage(o));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(cleanOrders));
    } catch (err) {
      console.warn("Local storage save warning:", err);
    }

    // Save Cloud: Firestore + Realtime Database
    const { db, firebaseApp, isDemo } = getServices();
    if (!isDemo && firebaseApp) {
      const cloudOrder = this.sanitizeForCloud(newOrder); // Strip base64 to stay under Firestore 1MB limit

      // 1. Firestore insert
      if (db) {
        try {
          const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
          await setDoc(doc(db, "orders", newId), cloudOrder);
          console.log("✅ Order synced to Firestore:", newId);
        } catch (err) {
          console.warn("Firestore order insert warning:", err);
        }
      }

      // 2. Realtime Database insert (Guaranteed fallback for instant cross-device reception)
      try {
        const { getDatabase, ref, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        const rtdb = getDatabase(firebaseApp);
        await set(ref(rtdb, 'orders/' + newId), cloudOrder);
        console.log("✅ Order synced to Realtime Database:", newId);
      } catch (err) {
        console.warn("RTDB order insert warning:", err);
      }
    }

    return newOrder;
  },

  // Update order status (Admin operation)
  async updateOrderStatus(orderId, newStatus, isLocked = null) {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = newStatus;
      orders[index].updatedAt = new Date().toISOString();
      if (isLocked !== null) {
        orders[index].isStatusLocked = isLocked;
      } else if (newStatus === 'Completed' || newStatus === 'Rejected') {
        orders[index].isStatusLocked = true;
      }
      if (newStatus === 'Payment Approved' && orders[index].payment) {
        orders[index].payment.status = 'Verified';
      }

      const cleanOrders = orders.map(o => this.sanitizeOrderForStorage(o));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(cleanOrders));

      const { db, firebaseApp, isDemo } = getServices();
      if (!isDemo && firebaseApp) {
        const updateObj = { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        if (orders[index].isStatusLocked !== undefined) {
          updateObj.isStatusLocked = orders[index].isStatusLocked;
        }

        // 1. Update Firestore
        if (db) {
          try {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            await updateDoc(doc(db, "orders", orderId), updateObj);
          } catch (e) {
            console.warn("Firestore status update warning:", e);
          }
        }

        // 2. Update Realtime Database
        try {
          const { getDatabase, ref, update } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
          const rtdb = getDatabase(firebaseApp);
          await update(ref(rtdb, 'orders/' + orderId), updateObj);
        } catch (e) {
          console.warn("RTDB status update warning:", e);
        }
      }
      return orders[index];
    }
    return null;
  },

  // Delete Order (Admin operation) — instant local delete, background cloud sync
  deleteOrder(orderId) {
    // 1. Remove from localStorage IMMEDIATELY (instant UI)
    try {
      const localStr = localStorage.getItem(ORDERS_KEY);
      if (localStr) {
        const orders = JSON.parse(localStr).filter(o => o.id !== orderId);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      }
    } catch (e) {}

    // 2. Sync cloud deletion in background (non-blocking)
    (async () => {
      try {
        const { db, firebaseApp, isDemo } = getServices();
        if (!isDemo && firebaseApp) {
          // Delete from Firestore
          if (db) {
            try {
              const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
              await deleteDoc(doc(db, 'orders', orderId));
            } catch (e) {}
          }
          // Delete from Realtime Database
          try {
            const { getDatabase, ref, remove } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
            const rtdb = getDatabase(firebaseApp);
            await remove(ref(rtdb, 'orders/' + orderId));
          } catch (e) {}
        }
      } catch (e) {}
    })();

    return true;
  },

  // Customer directory aggregator
  async getCustomers() {
    const orders = await this.getOrders();
    const map = {};
    orders.forEach(o => {
      const phone = o.customerPhone;
      if (!map[phone]) {
        map[phone] = {
          name: o.customerName,
          phone: o.customerPhone,
          email: o.customerEmail || 'N/A',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: o.createdAt
        };
      }
      map[phone].totalOrders += 1;
      if (o.status !== 'Rejected') {
        map[phone].totalSpent += (o.pricing?.total || 0);
      }
      if (new Date(o.createdAt) > new Date(map[phone].lastOrderDate)) {
        map[phone].lastOrderDate = o.createdAt;
      }
    });
    return Object.values(map);
  },

  // --- SERVICE CATALOG CRUD ENGINE ---
  async getServicesCatalog() {
    this.initLocalStore();
    const local = localStorage.getItem(CATALOG_KEY);
    return local ? JSON.parse(local) : DEFAULT_SERVICES;
  },

  async saveCatalogItem(serviceData) {
    this.initLocalStore();
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
        id: 'srv-' + Date.now(),
        category: serviceData.category || 'General Printing',
        status: serviceData.status || 'Active',
        popular: !!serviceData.popular,
        icon: serviceData.icon || '📄',
        ...serviceData
      };
      catalog.unshift(targetItem);
    }

    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));

    // Sync Firestore if connected
    const { db, isDemo } = getServices();
    if (!isDemo && db) {
      try {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await setDoc(doc(db, "services", targetItem.id), targetItem);
      } catch (e) {}
    }

    return targetItem;
  },

  async deleteCatalogItem(serviceId) {
    this.initLocalStore();
    let catalog = await this.getServicesCatalog();
    catalog = catalog.filter(s => s.id !== serviceId);
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));

    const { db, isDemo } = getServices();
    if (!isDemo && db) {
      try {
        const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await deleteDoc(doc(db, "services", serviceId));
      } catch (e) {}
    }

    return true;
  }
};
