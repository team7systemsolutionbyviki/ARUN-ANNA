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
  // Fetch all orders (Unified Local Storage + Firestore merge)
  async getOrders() {
    this.initLocalStore();
    const localStr = localStorage.getItem(ORDERS_KEY);
    let localOrders = localStr ? JSON.parse(localStr) : [];

    const { db, isDemo } = getServices();
    if (!isDemo && db) {
      try {
        const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const remoteOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Merge remote and local orders by ID, keeping local un-synced orders
        const map = new Map();
        remoteOrders.forEach(o => map.set(o.id, o));
        localOrders.forEach(o => {
          if (!map.has(o.id)) map.set(o.id, o);
        });

        const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        localStorage.setItem(ORDERS_KEY, JSON.stringify(merged));
        return merged;
      } catch (err) {
        console.warn('Firestore fetch error, fallback to local storage:', err);
      }
    }
    return localOrders;
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

  // Create new Order
  async createOrder(orderData) {
    this.initLocalStore();
    const newId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: newId,
      ...orderData,
      status: 'Waiting Verification',
      createdAt: new Date().toISOString(),
      estimatedReady: new Date(Date.now() + 4 * 3600 * 1000).toISOString()
    };

    // Save Local
    try {
      const orders = await this.getOrders();
      orders.unshift(newOrder);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (err) {
      console.warn("Local storage save error:", err);
    }

    // Save Firestore if connected
    const { db, isDemo } = getServices();
    if (!isDemo && db) {
      try {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await setDoc(doc(db, "orders", newId), newOrder);
      } catch (err) {
        console.warn("Firestore order insert error:", err);
      }
    }

    return newOrder;
  },

  // Update order status (Admin operation)
  async updateOrderStatus(orderId, newStatus) {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = newStatus;
      if (newStatus === 'Payment Approved' && orders[index].payment) {
        orders[index].payment.status = 'Verified';
      }
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

      const { db, isDemo } = getServices();
      if (!isDemo && db) {
        try {
          const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
          await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        } catch (e) {}
      }
      return orders[index];
    }
    return null;
  },

  // Delete Order (Admin operation)
  async deleteOrder(orderId) {
    let orders = await this.getOrders();
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    const { db, isDemo } = getServices();
    if (!isDemo && db) {
      try {
        const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await deleteDoc(doc(db, "orders", orderId));
      } catch (e) {}
    }
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
