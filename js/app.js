/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - MAIN APPLICATION ENTRY POINT
   Firebase-Only Engine: No localStorage for app data
   ========================================================================== */

import { initFirebase } from './config/firebase-config.js';
import { Router } from './utils/router.js';
import { NavbarComponent } from './components/navbar.js';
import { PublicViews } from './views/public-views.js';
import { AdminViews } from './views/admin-views.js';
import { CustomerViews } from './views/customer-views.js';
import { DBService } from './services/db-service.js';
import { PricingEngine } from './services/pricing-engine.js';
import { ModalComponent } from './components/modal.js';
import { NotificationService } from './services/notification-service.js';
import { I18nService } from './services/i18n-service.js';

window.ModalComponent = ModalComponent;
window.NotificationService = NotificationService;
window.I18nService = I18nService;

// ── Floating buttons ──────────────────────────────────────────────────────────
window.updateFloatingButtons = async () => {
  try {
    const settings = await DBService.getSettings();
    const rawWa   = (settings.whatsappNumber || settings.phone || '919789123456').replace(/\D/g, '');
    const cleanWa = rawWa.length === 10 ? '91' + rawWa : rawWa;
    const waBtn   = document.getElementById('floating-whatsapp-btn');
    if (waBtn) waBtn.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hi ${settings.shopName || 'TEAM 7 SYSTEM SOLUTION'}! I have a printing inquiry.`)}`;

    const rawPhone  = (settings.phone || '9789123456').replace(/\D/g, '');
    const cleanCall = rawPhone.length === 10 ? '+91' + rawPhone : '+' + rawPhone;
    const callBtn   = document.getElementById('floating-call-btn');
    if (callBtn) callBtn.href = `tel:${cleanCall}`;
  } catch (e) {
    console.warn('updateFloatingButtons:', e);
  }
};

const initApp = async () => {
  // ── Step 1: Start Firebase parallel SDK load immediately ──────────────────
  const firebaseReady = initFirebase();

  // ── Step 2: Wait for Firebase to be ready, then warm up all caches ────────
  await firebaseReady;

  // Pre-fetch Settings, Orders, and Pricing from Firebase in parallel
  await Promise.allSettled([
    DBService.getSettings(),
    DBService.getOrders(),
    PricingEngine.preload(DBService)   // primes the synchronous getPricingData() cache
  ]);

  // ── Step 3: Register I18n change listener ─────────────────────────────────
  I18nService.onChange(() => {
    NavbarComponent.render();
    Router.handleRoute();
  });

  // Update floating buttons (uses cached settings)
  window.updateFloatingButtons();

  // ── Step 4: Register all SPA routes ──────────────────────────────────────
  Router.register('home',        (q) => { NavbarComponent.render(); PublicViews.renderHome(q);      window.updateFloatingButtons(); });
  Router.register('services',    (q) => { NavbarComponent.render(); PublicViews.renderServices(q);  window.updateFloatingButtons(); });
  Router.register('pricing',     (q) => { NavbarComponent.render(); PublicViews.renderPriceList(q); window.updateFloatingButtons(); });
  Router.register('how-it-works', async (q) => {
    NavbarComponent.render();
    await PublicViews.renderHome(q);
    setTimeout(() => {
      const el = document.getElementById('how-it-works-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    window.updateFloatingButtons();
  });
  Router.register('faq',     (q) => { NavbarComponent.render(); PublicViews.renderFAQ(q);         window.updateFloatingButtons(); });
  Router.register('order',   (q) => { NavbarComponent.render(); PublicViews.renderOrderPrint(q);  window.updateFloatingButtons(); });
  Router.register('track',   (q) => { NavbarComponent.render(); PublicViews.renderTrackOrder(q);  window.updateFloatingButtons(); });
  Router.register('contact', (q) => { NavbarComponent.render(); PublicViews.renderContact(q);     window.updateFloatingButtons(); });

  // Admin Routes
  Router.register('admin-login',        (q) => { NavbarComponent.render(); AdminViews.renderLogin(q); });
  Router.register('admin-dashboard',    (q) => { AdminViews.renderDashboard(q); });
  Router.register('admin-orders',       (q) => { AdminViews.renderOrders(q); });
  Router.register('admin-pricing',      (q) => { AdminViews.renderPricing(q); });
  Router.register('admin-catalog',      (q) => { AdminViews.renderCatalog(q); });
  Router.register('admin-customers',    (q) => { AdminViews.renderCustomers(q); });
  Router.register('admin-reports',      (q) => { AdminViews.renderReports(q); });
  Router.register('admin-settings',     (q) => { AdminViews.renderSettings(q); });

  // Customer Route
  Router.register('customer-dashboard', (q) => { NavbarComponent.render(); CustomerViews.renderCustomerDashboard(q); });

  // ── Step 5: Start router (renders from in-memory cache — fast) ────────────
  Router.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
