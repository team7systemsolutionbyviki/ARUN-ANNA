/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - AUTHENTICATION SERVICE
   ========================================================================== */

import { getServices } from '../config/firebase-config.js';

const AUTH_KEY = 'team7_auth_session';

export const AuthService = {
  // Get current active user session
  getCurrentUser() {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    return null;
  },

  // Check if current user has Admin privileges
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'ADMIN';
  },

  // Admin Login Handler
  async loginAdmin(email, password) {
    const { auth, isDemo } = getServices();

    if (!isDemo && auth) {
      const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const session = {
          uid: cred.user.uid,
          email: cred.user.email,
          role: 'ADMIN',
          displayName: 'System Admin'
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        return { success: true, user: session };
      } catch (error) {
        return { success: false, message: error.message };
      }
    } else {
      // Demo Credentials Validation
      if ((email === 'admin@team7.com' || email === 'admin') && (password === 'admin123' || password === 'admin')) {
        const session = {
          uid: 'admin-demo-123',
          email: 'admin@team7.com',
          role: 'ADMIN',
          displayName: 'Administrator (Team 7)'
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        return { success: true, user: session };
      } else {
        return { success: false, message: 'Invalid admin credentials. (Try: admin@team7.com / admin123)' };
      }
    }
  },

  // Customer Quick Session Handler
  loginCustomer(phone, name = 'Valued Customer', email = '') {
    const session = {
      uid: 'cust-' + phone.replace(/\D/g, ''),
      phone: phone,
      displayName: name,
      email: email,
      role: 'CUSTOMER'
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  },

  // Sign out user
  async logout() {
    const { auth } = getServices();
    if (auth && auth.currentUser) {
      try {
        await auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem(AUTH_KEY);
  }
};
