/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - NAVBAR & THEME & LANGUAGE COMPONENT
   ========================================================================== */

import { AuthService } from '../services/auth-service.js';
import { DBService } from '../services/db-service.js';
import { I18nService } from '../services/i18n-service.js';

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

    // Update Footer Brand & Document Title & Footer Text dynamically
    const footerBrand = document.querySelector('.footer-brand');
    if (footerBrand && settings.shopName) {
      footerBrand.innerHTML = `<span style="color:var(--primary);">${settings.shopName}</span>`;
    }
    if (settings.shopName) {
      document.title = `${settings.shopName} | Online Document Printing & Management`;
    }
    const footerTitles = document.querySelectorAll('.footer-title');
    if (footerTitles.length >= 2) {
      footerTitles[0].innerText = I18nService.t('footer_quick_links');
      footerTitles[1].innerText = I18nService.t('nav_faq');
    }
    const footerCopyright = document.querySelector('.footer-bottom div:first-child');
    if (footerCopyright) {
      footerCopyright.innerText = `© 2026 ${settings.shopName || 'TEAM 7 SYSTEM SOLUTION'}. ${I18nService.t('footer_copyright')}`;
    }

    const activeLang = I18nService.getCurrentLanguageInfo();
    const availableLangs = I18nService.getAvailableLanguages();

    navContainer.innerHTML = `
      <nav class="navbar">
        <div class="container">
          <a href="#home" class="nav-brand">
            <div class="nav-brand-logo">${brandLogoText}</div>
            <span>${brandName}</span>
          </a>

          <ul class="nav-links">
            <li><a href="#home" class="nav-link">${I18nService.t('nav_home')}</a></li>
            <li><a href="#services" class="nav-link">${I18nService.t('nav_services')}</a></li>
            <li><a href="#pricing" class="nav-link">${I18nService.t('nav_pricing')}</a></li>
            <li><a href="#how-it-works" class="nav-link">${I18nService.t('nav_how_it_works')}</a></li>
            <li><a href="#order" class="nav-link">${I18nService.t('nav_order')}</a></li>
            <li><a href="#track" class="nav-link">${I18nService.t('nav_track')}</a></li>
            <li><a href="#faq" class="nav-link">${I18nService.t('nav_faq')}</a></li>
            <li><a href="#contact" class="nav-link">${I18nService.t('nav_contact')}</a></li>
          </ul>

          <div class="nav-actions">
            <!-- Modern Language Switcher Dropdown -->
            <div class="lang-switcher-wrapper" id="lang-switcher-wrapper">
              <button type="button" 
                      class="lang-switcher-btn" 
                      id="lang-switcher-toggle"
                      aria-haspopup="true" 
                      aria-expanded="false" 
                      aria-label="Select Language"
                      title="Select Language">
                <span class="lang-flag">${activeLang.flag}</span>
                <span class="lang-name">${activeLang.name}</span>
                <span class="lang-arrow">▼</span>
              </button>

              <div class="lang-dropdown-menu" id="lang-dropdown-menu" role="menu">
                ${availableLangs.map(l => `
                  <button type="button" 
                          class="lang-option-item ${l.code === activeLang.code ? 'active' : ''}" 
                          data-lang="${l.code}" 
                          role="menuitem"
                          tabindex="0">
                    <span style="display:flex; align-items:center; gap:0.5rem;">
                      <span>${l.flag}</span>
                      <span>${l.name}</span>
                    </span>
                    ${l.code === activeLang.code ? '<span class="lang-check">✓</span>' : ''}
                  </button>
                `).join('')}
              </div>
            </div>

            <button class="theme-toggle-btn" id="theme-toggle-btn" title="Toggle Theme">
              ${currentTheme === 'dark' ? '☀️' : '🌙'}
            </button>

            ${(user && user.role === 'CUSTOMER') ? `
              <a href="#customer-dashboard" class="btn btn-sm btn-primary">${I18nService.t('nav_my_dashboard')}</a>
            ` : `
              <a href="#order" class="btn btn-sm btn-primary glow-effect">${I18nService.t('nav_print_now')}</a>
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

    // Bind Language Switcher Dropdown Events & Keyboard Accessibility
    const langWrapper = document.getElementById('lang-switcher-wrapper');
    const langToggle = document.getElementById('lang-switcher-toggle');
    const langMenu = document.getElementById('lang-dropdown-menu');

    if (langWrapper && langToggle && langMenu) {
      const toggleDropdown = (show) => {
        const isOpen = show !== undefined ? show : !langWrapper.classList.contains('open');
        langWrapper.classList.toggle('open', isOpen);
        langToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };

      langToggle.onclick = (e) => {
        e.stopPropagation();
        toggleDropdown();
      };

      // Keyboard navigation for trigger button
      langToggle.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          toggleDropdown(true);
          const firstOption = langMenu.querySelector('.lang-option-item');
          if (firstOption) firstOption.focus();
        } else if (e.key === 'Escape') {
          toggleDropdown(false);
        }
      };

      // Handle language option clicks & key navigation
      const options = langMenu.querySelectorAll('.lang-option-item');
      options.forEach(opt => {
        const handleSelect = (e) => {
          e.stopPropagation();
          const langCode = opt.getAttribute('data-lang');
          toggleDropdown(false);
          if (langCode && langCode !== I18nService.getLanguage()) {
            I18nService.setLanguage(langCode);
          }
        };

        opt.onclick = handleSelect;
        opt.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(e);
          } else if (e.key === 'Escape') {
            toggleDropdown(false);
            langToggle.focus();
          }
        };
      });

      // Close dropdown on outside click
      document.addEventListener('click', (e) => {
        if (!langWrapper.contains(e.target)) {
          toggleDropdown(false);
        }
      });
    }

    // ── Mobile Hamburger Drawer ───────────────────────────────────────────────
    const mobileToggle = document.getElementById('mobile-nav-toggle');

    // Remove any pre-existing drawer (page re-render safety)
    const existingDrawer = document.getElementById('mobile-nav-drawer');
    const existingOverlay = document.getElementById('mobile-nav-overlay');
    if (existingDrawer) existingDrawer.remove();
    if (existingOverlay) existingOverlay.remove();

    // Build drawer HTML
    const drawerOverlay = document.createElement('div');
    drawerOverlay.id = 'mobile-nav-overlay';
    drawerOverlay.className = 'mobile-nav-overlay';

    const drawer = document.createElement('div');
    drawer.id = 'mobile-nav-drawer';
    drawer.className = 'mobile-nav-drawer';
    drawer.innerHTML = `
      <div class="mobile-drawer-header">
        <a href="#home" class="nav-brand" style="font-size:1.1rem;">
          <div class="nav-brand-logo" style="width:34px; height:34px; font-size:1rem;">${brandLogoText}</div>
          <span>${brandName}</span>
        </a>
        <button id="mobile-drawer-close" style="background:transparent; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-muted); padding:0.25rem;">✕</button>
      </div>
      <div class="mobile-drawer-links">
        <a href="#home"         class="mobile-drawer-link">🏠 ${I18nService.t('nav_home')}</a>
        <a href="#services"     class="mobile-drawer-link">🖨️ ${I18nService.t('nav_services')}</a>
        <a href="#pricing"      class="mobile-drawer-link">💰 ${I18nService.t('nav_pricing')}</a>
        <a href="#how-it-works" class="mobile-drawer-link">📋 ${I18nService.t('nav_how_it_works')}</a>
        <a href="#order"        class="mobile-drawer-link">📄 ${I18nService.t('nav_order')}</a>
        <a href="#track"        class="mobile-drawer-link">🔍 ${I18nService.t('nav_track')}</a>
        <a href="#faq"          class="mobile-drawer-link">❓ ${I18nService.t('nav_faq')}</a>
        <a href="#contact"      class="mobile-drawer-link">📞 ${I18nService.t('nav_contact')}</a>
        <a href="#order" class="btn btn-primary" style="margin:0.75rem 0; justify-content:center; min-height:48px;">
          🖨️ ${I18nService.t('nav_print_now')}
        </a>
      </div>
      <div class="mobile-drawer-footer">
        <span style="font-size:0.82rem; color:var(--text-muted); font-weight:600;">Theme:</span>
        <button id="mobile-theme-toggle" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.35rem 0.75rem; cursor:pointer; font-size:0.9rem; color:var(--text-main);">
          ${currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    `;

    document.body.appendChild(drawerOverlay);
    document.body.appendChild(drawer);

    const openDrawer = () => {
      drawer.classList.add('open');
      drawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      drawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (mobileToggle) mobileToggle.onclick = openDrawer;
    drawerOverlay.onclick = closeDrawer;
    document.getElementById('mobile-drawer-close')?.addEventListener('click', closeDrawer);

    // Close drawer on any link tap
    drawer.querySelectorAll('.mobile-drawer-link, .btn').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Theme toggle inside drawer
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    if (mobileThemeToggle) {
      mobileThemeToggle.onclick = () => {
        const active = document.documentElement.getAttribute('data-theme');
        const next = active === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('team7_theme', next);
        mobileThemeToggle.innerHTML = next === 'dark' ? '☀️ Light' : '🌙 Dark';
        const desktopThemeBtn = document.getElementById('theme-toggle-btn');
        if (desktopThemeBtn) desktopThemeBtn.innerHTML = next === 'dark' ? '☀️' : '🌙';
      };
    }
  }
};
