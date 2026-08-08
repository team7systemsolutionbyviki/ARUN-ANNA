/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - DATABASE SERVICE (FIRESTORE + LOCALFALLBACK)
   ========================================================================== */

import { getServices } from '../config/firebase-config.js';
import { INITIAL_ORDERS, DEFAULT_SETTINGS, DEFAULT_PRICING } from '../config/default-data.js';

const ORDERS_KEY = 'team7_orders_store';
const SETTINGS_KEY = 'team7_settings_store';

export const DBService = {
  // Initialize sample data into local storage if empty
  initLocalStore() {
    if (!localStorage.getItem(ORDERS_KEY)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(SETTINGS_KEY)) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
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
        console.warn("Firestore fetch error, fallback to local:", err);
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
        console.warn("Firestore save error:", err);
      }
    }
    return true;
  },

  // Fetch all orders
  async getOrders() {
    this.initLocalStore();
    const { db, isDemo } = getServices();
    if (!isDemo && db) {
      try {
        const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("Firestore orders fetch error:", err);
      }
    }
    const local = localStorage.getItem(ORDERS_KEY);
    return local ? JSON.parse(local) : [];
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
    const orders = await this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

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
      map[phone].totalSpent += (o.pricing?.total || 0);
      if (new Date(o.createdAt) > new Date(map[phone].lastOrderDate)) {
        map[phone].lastOrderDate = o.createdAt;
      }
    });
    return Object.values(map);
  }
};
