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

  // Auto Login Admin Helper
  autoLoginAdmin() {
    const session = {
      uid: 'super-admin-viki',
      email: 'viki@team7.com',
      role: 'ADMIN',
      isSuperAdmin: true,
      displayName: 'Super Admin (VIKI)'
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  },

  // Admin Login Handler (Support Super Admin VIKI & Admin ARUN)
  async loginAdmin(email = '', password = '') {
    const u = (email || '').trim().toUpperCase();
    const p = (password || '').trim().toUpperCase();

    const isSuperAdmin = (u === 'VIKI' || u === 'VIKI@TEAM7.COM') && p === 'VIKI1101';
    const isAdminArun = (u === 'ARUN' || u === 'ARUN@TEAM7.COM') && p === 'ARUN1101';

    let displayName = 'Administrator';
    let uid = 'admin-session-' + Date.now();

    if (isSuperAdmin) {
      displayName = 'Super Admin (VIKI)';
      uid = 'super-admin-viki';
    } else if (isAdminArun) {
      displayName = 'Admin (ARUN)';
      uid = 'admin-arun';
    } else if (email) {
      displayName = `Admin (${email.split('@')[0]})`;
    }

    const session = {
      uid: uid,
      email: email || (isAdminArun ? 'arun@team7.com' : 'viki@team7.com'),
      role: 'ADMIN',
      isSuperAdmin: isSuperAdmin,
      displayName: displayName
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, user: session, isSuperAdmin: isSuperAdmin };
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
