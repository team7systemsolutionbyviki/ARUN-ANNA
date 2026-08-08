/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - NAVBAR & THEME COMPONENT
   ========================================================================== */

import { AuthService } from '../services/auth-service.js';
import { DBService } from '../services/db-service.js';

export const NavbarComponent = {
  async render() {
    const user = AuthService.getCurrentUser();
    const settings = await DBService.getSettings();
    const currentTheme = localStorage.getItem('team7_theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    const isDashboard = window.location.hash.startsWith('#admin');
    if (isDashboard) {
      return; // Admin Dashboard has its own sidebar & topbar
    }

    const navContainer = document.getElementById('navbar-wrapper');
    if (!navContainer) return;

    const brandLogoText = (settings.shopName || 'SHOP').slice(0, 2).toUpperCase();
    const brandName = settings.shopName || 'TEAM 7 SYSTEM SOLUTION';

    // Update Footer Brand & Document Title dynamically
    const footerBrand = document.querySelector('.footer-brand');
    if (footerBrand && settings.shopName) {
      footerBrand.innerHTML = `<span style="color:var(--primary);">${settings.shopName}</span>`;
    }
    if (settings.shopName) {
      document.title = `${settings.shopName} | Online Document Printing & Management`;
    }

    navContainer.innerHTML = `
      <nav class="navbar">
        <div class="container">
          <a href="#home" class="nav-brand">
            <div class="nav-brand-logo">${brandLogoText}</div>
            <span>${brandName}</span>
          </a>

          <ul class="nav-links">
            <li><a href="#home" class="nav-link">Home</a></li>
            <li><a href="#services" class="nav-link">Services</a></li>
            <li><a href="#pricing" class="nav-link">Price List</a></li>
            <li><a href="#how-it-works" class="nav-link">How It Works</a></li>
            <li><a href="#order" class="nav-link">Order Print</a></li>
            <li><a href="#track" class="nav-link">Track Order</a></li>
            <li><a href="#faq" class="nav-link">FAQ</a></li>
            <li><a href="#contact" class="nav-link">Contact</a></li>
          </ul>

          <div class="nav-actions">
            <button class="theme-toggle-btn" id="theme-toggle-btn" title="Toggle Theme">
              ${currentTheme === 'dark' ? '☀️' : '🌙'}
            </button>

            ${(user && user.role === 'CUSTOMER') ? `
              <a href="#customer-dashboard" class="btn btn-sm btn-primary">My Dashboard</a>
            ` : `
              <a href="#order" class="btn btn-sm btn-primary glow-effect">Print Now</a>
            `}

            <button class="mobile-nav-toggle" id="mobile-nav-toggle">☰</button>
          </div>
        </div>
      </nav>
    `;

    // Bind Theme Switcher Event
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.onclick = () => {
        const active = document.documentElement.getAttribute('data-theme');
        const next = active === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('team7_theme', next);
        themeBtn.innerHTML = next === 'dark' ? '☀️' : '🌙';
      };
    }
  }
};
