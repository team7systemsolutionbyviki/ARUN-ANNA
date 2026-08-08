/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - MAIN APPLICATION ENTRY POINT
   ========================================================================== */

import { initFirebase } from './config/firebase-config.js';
import { Router } from './utils/router.js';
import { NavbarComponent } from './components/navbar.js';
import { PublicViews } from './views/public-views.js';
import { AdminViews } from './views/admin-views.js';
import { CustomerViews } from './views/customer-views.js';
import { DBService } from './services/db-service.js';
import { ModalComponent } from './components/modal.js';
import { NotificationService } from './services/notification-service.js';

window.ModalComponent = ModalComponent;
window.NotificationService = NotificationService;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Database seed / Firebase
  await initFirebase();
  DBService.initLocalStore();

  // Register All SPA Routes
  Router.register('home', (q) => { NavbarComponent.render(); PublicViews.renderHome(q); });
  Router.register('services', (q) => { NavbarComponent.render(); PublicViews.renderServices(q); });
  Router.register('pricing', (q) => { NavbarComponent.render(); PublicViews.renderPriceList(q); });
  Router.register('how-it-works', async (q) => { 
    NavbarComponent.render(); 
    await PublicViews.renderHome(q); 
    setTimeout(() => {
      const el = document.getElementById('how-it-works-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  });
  Router.register('faq', (q) => { NavbarComponent.render(); PublicViews.renderFAQ(q); });
  Router.register('order', (q) => { NavbarComponent.render(); PublicViews.renderOrderPrint(q); });
  Router.register('track', (q) => { NavbarComponent.render(); PublicViews.renderTrackOrder(q); });
  Router.register('contact', (q) => { NavbarComponent.render(); PublicViews.renderContact(q); });

  // Admin Routes
  Router.register('admin-login', (q) => { NavbarComponent.render(); AdminViews.renderLogin(q); });
  Router.register('admin-dashboard', (q) => { AdminViews.renderDashboard(q); });
  Router.register('admin-orders', (q) => { AdminViews.renderOrders(q); });
  Router.register('admin-pricing', (q) => { AdminViews.renderPricing(q); });
  Router.register('admin-catalog', (q) => { AdminViews.renderCatalog(q); });
  Router.register('admin-customers', (q) => { AdminViews.renderCustomers(q); });
  Router.register('admin-reports', (q) => { AdminViews.renderReports(q); });
  Router.register('admin-settings', (q) => { AdminViews.renderSettings(q); });

  // Customer Route
  Router.register('customer-dashboard', (q) => { NavbarComponent.render(); CustomerViews.renderCustomerDashboard(q); });

  // Start Router
  Router.init();
});
