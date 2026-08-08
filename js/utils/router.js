/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - SPA ROUTER
   ========================================================================== */

import { AuthService } from '../services/auth-service.js';

export const Router = {
  routes: {},

  register(path, handler) {
    this.routes[path] = handler;
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());

    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '') {
      window.location.hash = '#home';
    }
    this.handleRoute();
  },

  navigate(path) {
    window.location.hash = path;
  },

  async handleRoute() {
    let hash = window.location.hash.slice(1) || 'home';
    let [path, queryStr] = hash.split('?');

    // Route Guard for Admin paths (Auto authenticate admin for seamless access)
    if (path.startsWith('admin')) {
      if (!AuthService.isAdmin()) {
        AuthService.autoLoginAdmin();
      }
    }

    // Scroll to top on navigate
    window.scrollTo(0, 0);

    const handler = this.routes[path] || this.routes['404'] || this.routes['home'];
    if (handler) {
      await handler(queryStr);
    }
  }
};
