/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - NAVBAR & THEME COMPONENT
   ========================================================================== */

import { AuthService } from '../services/auth-service.js';

export const NavbarComponent = {
  render() {
    const user = AuthService.getCurrentUser();
    const currentTheme = localStorage.getItem('team7_theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    const isDashboard = window.location.hash.startsWith('#admin') || window.location.hash.startsWith('#customer-dashboard');
    if (isDashboard) {
      return; // Dashboard has its own sidebar & topbar
    }

    const navContainer = document.getElementById('navbar-wrapper');
    if (!navContainer) return;

    navContainer.innerHTML = `
      <nav class="navbar">
        <div class="container">
          <a href="#home" class="nav-brand">
            <div class="nav-brand-logo">T7</div>
            <span>TEAM 7 SYSTEM</span>
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

            ${user ? `
              <a href="${user.role === 'ADMIN' ? '#admin-dashboard' : '#customer-dashboard'}" class="btn btn-sm btn-primary">
                ${user.role === 'ADMIN' ? 'Admin Dashboard' : 'My Dashboard'}
              </a>
            ` : `
              <a href="#order" class="btn btn-sm btn-primary glow-effect">Print Now</a>
              <a href="#admin-login" class="btn btn-sm btn-secondary">Admin</a>
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
