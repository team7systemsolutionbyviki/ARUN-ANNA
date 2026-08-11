/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - PUBLIC VIEWS MODULE
   ========================================================================== */

import { DEFAULT_SERVICES, FAQS } from '../config/default-data.js';
import { AuthService } from '../services/auth-service.js';
import { DBService } from '../services/db-service.js';
import { PricingEngine } from '../services/pricing-engine.js';
import { StorageService } from '../services/storage-service.js';
import { NotificationService } from '../services/notification-service.js';
import { I18nService } from '../services/i18n-service.js';
import { formatCurrency, getStatusBadgeHTML, formatDate, formatTime } from '../utils/formatters.js';

export const PublicViews = {
  // --- HOME PAGE ---
  async renderHome() {
    const settings = await DBService.getSettings();
    const pricing = PricingEngine.getPricingData();
    const app = document.getElementById('app-content');

    app.innerHTML = `
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-grid">
            <div class="animate-fade-in">
              <span class="badge badge-approved mb-2" style="font-size:0.85rem;">${I18nService.t('hero_badge')}</span>
              <h1 class="hero-title">${I18nService.t('hero_title')}</h1>
              <p class="hero-subtitle">${I18nService.t('hero_subtitle')}</p>
              
              <div class="flex gap-2 items-center" style="flex-wrap:wrap;">
                <a href="#order" class="btn btn-lg btn-primary glow-effect">${I18nService.t('btn_print_now')}</a>
                <a href="#track" class="btn btn-lg btn-secondary">${I18nService.t('btn_track_order')}</a>
              </div>

              <div class="hero-stats">
                <div>
                  <div class="stat-number">15,000+</div>
                  <div class="stat-label">${I18nService.t('stat_completed')}</div>
                </div>
                <div>
                  <div class="stat-number">100%</div>
                  <div class="stat-label">${I18nService.t('stat_quality')}</div>
                </div>
                <div>
                  <div class="stat-number">2 - 4 Hrs</div>
                  <div class="stat-label">${I18nService.t('stat_speed')}</div>
                </div>
              </div>
            </div>

            <!-- Hero Floating Card -->
            <div class="glass-panel hero-card glow-effect animate-fade-in" style="padding:1.75rem;">
              <h3 style="margin-bottom:1rem; font-size:1.4rem;">${I18nService.t('calc_title')}</h3>
              
              <div class="form-group">
                <label class="form-label">${I18nService.t('calc_size')}</label>
                <select class="form-select" id="quick-size">
                  ${Object.entries(pricing.paperSizes || {}).map(([sKey, sObj]) => `
                    <option value="${sKey}">${sObj.label || sKey}</option>
                  `).join('')}
                </select>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                <div class="form-group">
                  <label class="form-label">${I18nService.t('calc_color')}</label>
                  <select class="form-select" id="quick-color">
                    <option value="Black & White">${I18nService.t('color_bw')}</option>
                    <option value="Color">${I18nService.t('color_full')}</option>
                    <option value="Custom Split">${I18nService.t('color_split')}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">${I18nService.t('calc_pages')}</label>
                  <input type="number" class="form-control" id="quick-pages" value="20" min="1">
                </div>
              </div>

              <!-- Custom Split Color Ranges Input -->
              <div class="form-group" id="quick-split-container" style="display:none; background:rgba(59,130,246,0.06); padding:0.85rem; border-radius:10px; border:1px dashed rgba(59,130,246,0.3); margin-bottom:1rem;">
                <label class="form-label" style="font-size:0.82rem; font-weight:700; color:var(--primary); margin-bottom:0.35rem;">🎨 Color Page Numbers / Ranges</label>
                <input type="text" class="form-control" id="quick-color-pages" placeholder="e.g. 1-3, 10, 15-20" value="1-3" style="font-size:0.85rem;">
                <span style="font-size:0.72rem; color:var(--text-muted); margin-top:0.25rem; display:block;">Specified pages will print in Color. Remaining pages print in B&W.</span>
              </div>

              <div class="form-group">
                <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
                  <span>${I18nService.t('calc_binding')}</span>
                  <button type="button" class="btn btn-sm btn-link" style="padding:0; border:none; background:none; font-size:0.75rem; color:var(--primary); text-decoration:underline; cursor:pointer;" onclick="window.showBindingInfoModal()" title="What is document binding?">
                    ${I18nService.t('calc_what_is_binding')}
                  </button>
                </label>
                <select class="form-select" id="quick-binding">
                  ${Object.entries(pricing.bindings || {}).map(([bKey, bObj]) => `
                    <option value="${bKey}">${bKey} ${bObj.price > 0 ? `(₹${bObj.price})` : '(Free - No Binding)'}</option>
                  `).join('')}
                </select>
              </div>

              <!-- Live Split Breakdown Details Card -->
              <div id="quick-split-breakdown" style="display:none; background:var(--bg-card); padding:0.75rem 1rem; border-radius:10px; border:1px solid var(--border-color); font-size:0.82rem; margin-top:0.75rem;">
              </div>

              <div style="background:var(--primary-light); padding:1rem; border-radius:12px; margin-top:1rem; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <span style="font-size:0.8rem; color:var(--text-muted);">${I18nService.t('calc_estimated')}</span>
                  <div style="font-size:1.5rem; font-weight:800; color:var(--primary);" id="quick-price-val">₹65.00</div>
                </div>
                <a href="#order" class="btn btn-sm btn-primary">${I18nService.t('btn_print_now')} →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section id="services-section" style="padding: 4rem 0; background-color: var(--bg-card); border-top: 1px solid var(--border-color);">
        <div class="container">
          <div class="text-center mb-4">
            <h2 style="font-size: 2.25rem;">${I18nService.t('services_heading')}</h2>
            <p class="text-muted" style="max-width: 600px; margin: 0.5rem auto 0;">${I18nService.t('services_subheading')}</p>
          </div>

          <div class="services-grid">
            ${(await (async () => {
              try {
                const cat = await DBService.getServicesCatalog();
                const active = (cat || []).filter(s => s.status !== 'Inactive');
                return active.length > 0 ? active : DEFAULT_SERVICES;
              } catch(e) { return DEFAULT_SERVICES; }
            })()).map(s => `
              <div class="service-card">
                <div class="service-icon">${s.icon || '📄'}</div>
                <h3 style="margin-bottom: 0.5rem;">${s.title}</h3>
                <p class="text-muted" style="font-size: 0.9rem; flex:1;">${s.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                  <span style="font-weight:700; font-size:0.9rem; color:var(--primary);">${s.startingPrice}</span>
                  <a href="#order" class="btn btn-sm btn-outline">Order Now</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section id="how-it-works-section" style="padding: 4rem 0;">
        <div class="container">
          <div class="text-center mb-4">
            <h2 style="font-size: 2.25rem;">${I18nService.t('how_it_works_title')}</h2>
            <p class="text-muted">${I18nService.t('how_it_works_sub')}</p>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:2rem;">
            <div class="glass-panel" style="padding:1.75rem; text-align:center;">
              <div style="width:48px; height:48px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; margin:0 auto 1rem;">1</div>
              <h4>${I18nService.t('step1_title')}</h4>
              <p class="text-muted" style="font-size:0.875rem; margin-top:0.5rem;">${I18nService.t('step1_desc')}</p>
            </div>
            <div class="glass-panel" style="padding:1.75rem; text-align:center;">
              <div style="width:48px; height:48px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; margin:0 auto 1rem;">2</div>
              <h4>${I18nService.t('step2_title')}</h4>
              <p class="text-muted" style="font-size:0.875rem; margin-top:0.5rem;">${I18nService.t('step2_desc')}</p>
            </div>
            <div class="glass-panel" style="padding:1.75rem; text-align:center;">
              <div style="width:48px; height:48px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; margin:0 auto 1rem;">3</div>
              <h4>${I18nService.t('step3_title')}</h4>
              <p class="text-muted" style="font-size:0.875rem; margin-top:0.5rem;">${I18nService.t('step3_desc')}</p>
            </div>
            <div class="glass-panel" style="padding:1.75rem; text-align:center;">
              <div style="width:48px; height:48px; background:var(--success); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; margin:0 auto 1rem;">4</div>
              <h4>${I18nService.t('step4_title')}</h4>
              <p class="text-muted" style="font-size:0.875rem; margin-top:0.5rem;">${I18nService.t('step4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Customer Reviews & Map -->
      <section style="padding: 4rem 0; background: var(--bg-card); border-top: 1px solid var(--border-color);">
        <div class="container">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:3rem;">
            <div>
              <h2 style="font-size: 2rem; margin-bottom: 1.5rem;">Customer Reviews</h2>
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <div class="glass-panel" style="padding:1.25rem;">
                  <div style="color:#f59e0b; font-size:1.1rem; margin-bottom:0.35rem;">⭐⭐⭐⭐⭐</div>
                  <p style="font-style:italic; font-size:0.95rem;">"Super fast print service for my final thesis! Spiral binding was very neat and delivered on time."</p>
                  <div style="font-weight:700; font-size:0.875rem; margin-top:0.5rem;">— Ananya R., Anna University</div>
                </div>
                <div class="glass-panel" style="padding:1.25rem;">
                  <div style="color:#f59e0b; font-size:1.1rem; margin-bottom:0.35rem;">⭐⭐⭐⭐⭐</div>
                  <p style="font-style:italic; font-size:0.95rem;">"Easy online payment via UPI QR code. Live order tracking feature kept me updated."</p>
                  <div style="font-weight:700; font-size:0.875rem; margin-top:0.5rem;">— Karthik S., IT Professional</div>
                </div>
              </div>
            </div>

            <div>
              <h2 style="font-size: 2rem; margin-bottom: 1.5rem;">Visit Our Shop</h2>
              <div style="border-radius: var(--radius-lg); overflow:hidden; border:1px solid var(--border-color); height: 280px;">
                <iframe src="${settings.googleMapUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
              </div>
              <p style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted);">📍 ${settings.address}</p>
            </div>
          </div>
        </div>
      </section>
    `;

    // Quick Calculator Logic
    const updateQuickCalc = () => {
      const paperSize = document.getElementById('quick-size')?.value || "A4";
      const colorMode = document.getElementById('quick-color')?.value || "Black & White";
      const pages = parseInt(document.getElementById('quick-pages')?.value) || 1;
      const binding = document.getElementById('quick-binding')?.value || "None";
      const colorPageRange = document.getElementById('quick-color-pages')?.value || "";

      const splitContainer = document.getElementById('quick-split-container');
      const breakdownEl = document.getElementById('quick-split-breakdown');

      if (colorMode === 'Custom Split') {
        if (splitContainer) splitContainer.style.display = 'block';
      } else {
        if (splitContainer) splitContainer.style.display = 'none';
      }

      const quote = PricingEngine.calculateQuote({
        paperSize,
        colorMode: colorMode === 'Custom Split' ? 'Custom Split' : colorMode,
        colorPageRange: colorMode === 'Custom Split' ? colorPageRange : '',
        binding,
        copies: 1
      }, pages);

      const el = document.getElementById('quick-price-val');
      if (el) el.innerText = formatCurrency(quote.total);

      // Render live split breakdown details if Custom Split mode is active
      if (breakdownEl) {
        if (colorMode === 'Custom Split') {
          breakdownEl.style.display = 'block';
          breakdownEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
              <span>⬛ B&W Pages: <b>${quote.bwPagesCount || 0} pgs</b></span>
              <span style="font-weight:700;">${formatCurrency(quote.paperCost)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
              <span>🎨 Color Pages: <b>${quote.colorPagesCount || 0} pgs</b></span>
              <span style="font-weight:700; color:#059669;">${formatCurrency(quote.colorCost)}</span>
            </div>
            ${quote.bindingCost > 0 ? `
            <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-color); padding-top:0.25rem; margin-top:0.25rem;">
              <span>📚 Binding:</span>
              <span style="font-weight:700;">${formatCurrency(quote.bindingCost)}</span>
            </div>` : ''}
          `;
        } else {
          breakdownEl.style.display = 'none';
        }
      }
    };

    ['quick-size', 'quick-color', 'quick-pages', 'quick-binding', 'quick-color-pages'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', updateQuickCalc);
      document.getElementById(id)?.addEventListener('input', updateQuickCalc);
    });
    updateQuickCalc();
  },

  // --- SERVICES PAGE ---
  async renderServices() {
    const catalog = await DBService.getServicesCatalog();
    const activeServices = catalog.filter(s => s.status !== 'Inactive');
    const isAdmin = AuthService.isAdmin();

    const app = document.getElementById('app-content');
    app.innerHTML = `
      <section style="padding: 4rem 0;">
        <div class="container">
          <div class="text-center mb-4">
            <h1 style="font-size:2.5rem;">Our Printing Services Catalog</h1>
            <p class="text-muted" style="max-width:650px; margin:0.5rem auto 0;">Explore our full suite of professional document printing, thesis binding, CAD plot rendering, and protective lamination services.</p>
          </div>

          <div class="services-grid" style="margin-top:3rem;">
            ${activeServices.map(s => `
              <div class="service-card" style="position:relative;">
                ${s.popular ? `<span class="badge badge-approved" style="position:absolute; top:1rem; right:1rem; font-size:0.7rem;">Popular</span>` : ''}
                <div class="service-icon">${s.icon || '📄'}</div>
                <h3 style="margin-bottom: 0.5rem; font-size:1.35rem;">${s.title}</h3>
                <p class="text-muted" style="font-size: 0.925rem; flex:1; margin-bottom:1.5rem;">${s.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1.25rem; border-top:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Starting At</div>
                    <div style="font-weight:800; font-size:1.1rem; color:var(--primary);">${s.startingPrice}</div>
                  </div>
                  <a href="#order" class="btn btn-primary btn-sm">Order Print →</a>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="glass-panel text-center glow-effect" style="margin-top:4rem; padding:3rem 2rem;">
            <h2 style="font-size:2rem; margin-bottom:0.75rem;">Need Custom Bulk Printing?</h2>
            <p class="text-muted" style="max-width:550px; margin:0 auto 1.5rem;">We offer bulk volume discounts for schools, colleges, architecture firms, and enterprise offices.</p>
            <a href="#contact" class="btn btn-lg btn-primary">Contact Sales Team</a>
          </div>
        </div>
      </section>
    `;
  },

  // --- PRICE LIST PAGE ---
  async renderPriceList() {
    const pricing = PricingEngine.getPricingData();
    const app = document.getElementById('app-content');

    app.innerHTML = `
      <section style="padding: 4rem 0;">
        <div class="container">
          <div class="text-center mb-4">
            <h1 style="font-size:2.5rem;">Complete Printing Price List</h1>
            <p class="text-muted">Transparent rates for paper sizes, qualities, color modes, and bindings.</p>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem;">
            <!-- Paper Sizes & Rates -->
            <div class="table-card">
              <div style="padding:1.25rem; font-weight:700; font-size:1.1rem; border-bottom:1px solid var(--border-color);">
                📄 Paper Sizes (Base Rate per Page)
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Paper Size</th>
                    <th>Specification</th>
                    <th style="text-align:right;">Base Rate</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(pricing.paperSizes).map(([size, item]) => `
                    <tr>
                      <td><b>${size}</b></td>
                      <td>${item.label}</td>
                      <td style="text-align:right; font-weight:700; color:var(--primary);">${formatCurrency(item.baseRate)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Binding Prices -->
            <div class="table-card">
              <div style="padding:1.25rem; font-weight:700; font-size:1.1rem; border-bottom:1px solid var(--border-color);">
                📚 Book Binding Rates
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Binding Type</th>
                    <th style="text-align:right;">Cost per Book</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(pricing.bindings).map(([name, item]) => `
                    <tr>
                      <td><b>${name} Binding</b></td>
                      <td style="text-align:right; font-weight:700; color:var(--primary);">${formatCurrency(item.price)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  // --- ORDER PRINT WIZARD PAGE ---
  async renderOrderPrint() {
    const settings = await DBService.getSettings();
    const pricing = PricingEngine.getPricingData();
    const app = document.getElementById('app-content');

    let state = {
      files: [], // { name, size, dataUrl, pages }
      totalPages: 1,
      options: {
        paperSize: 'A4',
        paperQuality: '70 GSM',
        colorMode: 'Black & White',
        printSide: 'Single',
        orientation: 'Portrait',
        copies: 1,
        binding: 'None',
        lamination: 'No',
        notes: ''
      },
      customer: {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      payment: {
        utr: '',
        payerName: '',
        screenshotUrl: ''
      }
    };

    app.innerHTML = `
      <section style="padding: 3rem 0;">
        <div class="container">
          <div class="text-center mb-4">
            <h1 style="font-size:2.5rem;">Online Document Order System</h1>
            <p class="text-muted">Upload your files, choose print options, pay via Business UPI QR code, and track live!</p>
          </div>

          <div class="wizard-container">
            <!-- Left Wizard Form Area -->
            <div>
              <div class="wizard-steps-bar">
                <div class="wizard-step-tab active" id="tab-1">${I18nService.t('wizard_step1')}</div>
                <div class="wizard-step-tab" id="tab-2">${I18nService.t('wizard_step2')}</div>
                <div class="wizard-step-tab" id="tab-3">${I18nService.t('wizard_step3')}</div>
              </div>

              <!-- Step 1: Upload Files -->
              <div id="step-1-content" class="glass-panel" style="padding:2rem;">
                <h3 style="margin-bottom:1rem;">${I18nService.t('wizard_step1')}</h3>

                <!-- PDF Only Format Notice & Word/Excel/PPT/Image Conversion Guide Banner -->
                <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(239, 68, 68, 0.08) 100%); border: 1.5px solid rgba(245, 158, 11, 0.45); border-radius: 12px; padding: 0.95rem 1.25rem; margin-bottom: 1.25rem; font-size: 0.86rem; display: flex; gap: 0.85rem; align-items: flex-start; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.08);">
                  <div style="font-size: 1.5rem; flex-shrink: 0; background: rgba(245, 158, 11, 0.2); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(245, 158, 11, 0.5);">
                    ⚠️
                  </div>
                  <div style="line-height: 1.5;">
                    <div style="font-weight: 800; color: #d97706; font-size: 0.925rem; margin-bottom: 0.2rem;">
                      ${I18nService.t('pdf_only_title')}
                    </div>
                    <div style="color: var(--text-main); font-weight: 600;">
                      ${I18nService.t('pdf_only_desc')}
                    </div>
                  </div>
                </div>

                <div class="dropzone" id="file-dropzone">
                  <div class="dropzone-icon">📁</div>
                  <h4 style="margin-bottom:0.25rem;">${I18nService.t('upload_drop')}</h4>
                  <p class="text-muted" style="font-size:0.875rem; margin-bottom:1rem;">${I18nService.t('upload_note')}</p>
                  <button type="button" class="btn btn-sm btn-primary" id="btn-browse-trigger">📁 Browse Files</button>
                </div>
                <input type="file" id="file-input" multiple accept=".pdf,application/pdf" style="display:none;" />

                <!-- File List with Per-File Print Options -->
                <div id="file-list-preview" style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;"></div>

                <div class="flex justify-between mt-4">
                  <div></div>
                  <button class="btn btn-primary" id="btn-to-step-2">${I18nService.t('btn_proceed_contact')}</button>
                </div>
              </div>

              <!-- Step 2: Contact Info -->
              <div id="step-2-content" class="glass-panel" style="padding:2rem; display:none;">
                <h3 style="margin-bottom:1.5rem;">${I18nService.t('wizard_step2')}</h3>

                <div class="form-group">
                  <label class="form-label">${I18nService.t('cust_name_label')}</label>
                  <input type="text" class="form-control" id="cust-name" placeholder="Enter your full name" required>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
                  <div class="form-group">
                    <label class="form-label">${I18nService.t('cust_phone_label')}</label>
                    <input type="tel" class="form-control" id="cust-phone" placeholder="10-digit mobile number" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email Address (Optional)</label>
                    <input type="email" class="form-control" id="cust-email" placeholder="email@example.com">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">${I18nService.t('delivery_zone_label')}</label>
                  <select class="form-select" id="cust-delivery-zone" style="font-weight:600; color:var(--primary);">
                    ${Object.entries(pricing.deliveryZones || {}).map(([key, item]) => `
                      <option value="${key}">${item.label}</option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">${I18nService.t('delivery_address_label')}</label>
                  <textarea class="form-control" id="cust-address" placeholder="Enter full address if requesting doorstep delivery"></textarea>
                </div>

                <div class="flex justify-between mt-4">
                  <button class="btn btn-secondary" id="btn-back-to-step-1">${I18nService.t('back_btn')}</button>
                  <button class="btn btn-primary" id="btn-to-step-3">${I18nService.t('proceed_payment')}</button>
                </div>
              </div>

              <!-- Step 3: UPI Payment -->
              <div id="step-3-content" class="glass-panel" style="padding:2rem; display:none;">
                <h3 style="margin-bottom:1rem;">${I18nService.t('payment_heading')}</h3>
                <p class="text-muted" style="margin-bottom:1.5rem; font-size:0.9rem;">${I18nService.t('payment_sub')}</p>

                <div style="display:grid; grid-template-columns: 220px 1fr; gap:2rem; background:var(--bg-card); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg); margin-bottom:1.5rem; align-items:center;">
                  <div style="text-align:center;">
                    <div id="upi-qr-canvas-box" style="background:white; padding:10px; border-radius:14px; display:inline-block; border:1px solid var(--border-color); box-shadow:var(--shadow-md);">
                      <!-- QR Code dynamically generated here -->
                      <div style="width:180px; height:180px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; border-radius:8px;">
                        <span style="font-size:3rem;">⏳</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
                      <span style="font-size:1.2rem;">🏪</span>
                      <h4 style="color:var(--primary); font-size:1.15rem; font-weight:800; margin:0;">${settings.merchantName || settings.shopName}</h4>
                    </div>
                    <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:0.5rem;">UPI ID: <b style="color:var(--text-main); font-family:monospace; background:var(--primary-light); padding:0.2rem 0.5rem; border-radius:6px; border:1px solid var(--border-color);" id="merchant-upi-text">${settings.upiId}</b></p>
                    <p style="font-size:1.6rem; font-weight:800; color:var(--primary); margin:0.5rem 0;" id="qr-payable-amount">₹0.00</p>
                    
                    <div style="background:var(--primary-light); padding:0.85rem 1rem; border-radius:10px; border:1px solid var(--border-color); font-size:0.85rem; line-height:1.4;">
                      ${I18nService.t('instructions_title')}
                      <ol style="margin:0.35rem 0 0 1.1rem; padding:0;">
                        <li>Open <b>Google Pay / PhonePe / Paytm / BHIM</b> on your mobile.</li>
                        <li>Scan the <b>Business QR Code</b> on left or click the direct button.</li>
                        <li>Pay exact amount of <b style="color:var(--primary);" id="instructions-amount">₹0.00</b>.</li>
                        <li>Enter the 12-digit UTR/UPI Ref Number & Payer Name below.</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <!-- Payment Details Submission Form -->
                <div style="border-top:1px solid var(--border-color); padding-top:1.5rem;">
                  <h4 style="margin-bottom:1rem;">Submit Payment Verification</h4>

                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
                    <div class="form-group">
                      <label class="form-label">${I18nService.t('utr_label')}</label>
                      <input type="text" class="form-control" id="pay-utr" placeholder="E.g., 329817264512" maxlength="18" required>
                    </div>

                    <div class="form-group">
                      <label class="form-label">${I18nService.t('payer_name_label')}</label>
                      <input type="text" class="form-control" id="pay-name" placeholder="Name shown in UPI app" required>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">${I18nService.t('screenshot_label')}</label>
                    <input type="file" class="form-control" id="pay-screenshot" accept="image/*">
                  </div>

                  <div class="flex justify-between mt-4">
                    <button class="btn btn-secondary" id="btn-back-to-step-2">${I18nService.t('back_btn')}</button>
                    <button class="btn btn-success btn-lg glow-effect" id="btn-submit-final-order">${I18nService.t('submit_order')}</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Dynamic Price Box -->
            <div class="price-summary-box glow-effect">
              <h3 style="margin-bottom:1rem; font-size:1.25rem;">${I18nService.t('summary_title')}</h3>

              <div id="summary-file-count" style="font-size:0.875rem; color:var(--text-muted); margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
                No files uploaded yet.
              </div>

              <div class="price-row" id="row-print-cost">
                <span id="label-print-cost">${I18nService.t('summary_printing')}</span>
                <span id="price-paper">₹0.00</span>
              </div>
              <div class="price-row" id="row-color" style="display:none;">
                <span id="label-color-cost">${I18nService.t('summary_color_extra')}</span>
                <span id="price-color">₹0.00</span>
              </div>
              <div class="price-row" id="row-binding" style="display:none;">
                <span style="display:inline-flex; align-items:center; gap:0.3rem;">
                  <span id="label-binding-cost">${I18nService.t('summary_binding')}</span>
                  <button type="button" class="btn btn-sm btn-link" style="padding:0; border:none; background:none; font-size:0.75rem; color:var(--primary); text-decoration:underline; cursor:pointer;" onclick="window.showBindingInfoModal()" title="What is document binding?">
                    ${I18nService.t('calc_what_is_binding')}
                  </button>
                </span>
                <span id="price-binding">₹0.00</span>
              </div>
              <div class="price-row" id="row-lamination" style="display:none;">
                <span>${I18nService.t('summary_lamination')}</span>
                <span id="price-lamination">₹0.00</span>
              </div>
              <div class="price-row" id="row-delivery" style="display:none;">
                <span>${I18nService.t('summary_delivery')}</span>
                <span id="price-delivery">₹0.00</span>
              </div>

              <div class="price-row total-row">
                <span>${I18nService.t('summary_grand_total')}</span>
                <span id="price-grand-total">₹0.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // --- Interactive Wizard Controller Logic ---
    const updateCalculations = () => {
      const selectedZoneKey = document.getElementById('cust-delivery-zone')?.value || 'Pickup';

      // Aggregate pricing across all files using per-file options
      let totalPaper = 0, totalColor = 0, totalBinding = 0, totalLamination = 0;
      let totalBwPages = 0, totalColorPages = 0;
      state.files.forEach(f => {
        const q = PricingEngine.calculateQuote(f.options, f.pages);
        totalPaper += q.paperCost;
        totalColor += q.colorCost;
        totalBinding += q.bindingCost;
        totalLamination += q.laminationCost;
        totalBwPages += (q.bwPagesCount || 0) * (q.copies || 1);
        totalColorPages += (q.colorPagesCount || 0) * (q.copies || 1);
      });

      const deliveryZones = pricing.deliveryZones || {};
      const deliveryFee = Number((deliveryZones[selectedZoneKey]?.fee || 0).toFixed(2));

      const subtotal = totalPaper + totalColor + totalBinding + totalLamination + deliveryFee;
      const total = subtotal;
      const quote = { paperCost: totalPaper, colorCost: totalColor, bindingCost: totalBinding, laminationCost: totalLamination, deliveryFee, deliveryZone: selectedZoneKey, gst: 0, total };

      const labelPrintCostEl = document.getElementById('label-print-cost');
      if (labelPrintCostEl) {
        labelPrintCostEl.innerText = totalColorPages > 0 ? `B&W Print (${totalBwPages} pgs):` : `Printing (${totalBwPages} pgs):`;
      }
      const paperEl = document.getElementById('price-paper');
      if (paperEl) paperEl.innerText = formatCurrency(totalPaper);

      const colorRow = document.getElementById('row-color');
      if (colorRow) colorRow.style.display = totalColor > 0 ? '' : 'none';
      const labelColorCostEl = document.getElementById('label-color-cost');
      if (labelColorCostEl) {
        labelColorCostEl.innerText = `Color Print (${totalColorPages} pgs):`;
      }
      const colorEl = document.getElementById('price-color');
      if (colorEl) colorEl.innerText = formatCurrency(totalColor);

      const bindingRow = document.getElementById('row-binding');
      if (bindingRow) bindingRow.style.display = totalBinding > 0 ? '' : 'none';
      const labelBindingEl = document.getElementById('label-binding-cost');
      if (labelBindingEl) {
        const bindingNames = Array.from(new Set(state.files.map(f => f.options?.binding).filter(b => b && b !== 'None')));
        labelBindingEl.innerText = bindingNames.length > 0 ? `Binding (${bindingNames.join(', ')}):` : `Binding Cost:`;
      }
      const bindingEl = document.getElementById('price-binding');
      if (bindingEl) bindingEl.innerText = formatCurrency(totalBinding);

      const laminationRow = document.getElementById('row-lamination');
      if (laminationRow) laminationRow.style.display = totalLamination > 0 ? '' : 'none';
      const laminationEl = document.getElementById('price-lamination');
      if (laminationEl) laminationEl.innerText = formatCurrency(totalLamination);

      const deliveryRow = document.getElementById('row-delivery');
      if (deliveryRow) deliveryRow.style.display = deliveryFee > 0 ? '' : 'none';
      const deliveryEl = document.getElementById('price-delivery');
      if (deliveryEl) deliveryEl.innerText = formatCurrency(deliveryFee);

      const grandTotalEl = document.getElementById('price-grand-total');
      if (grandTotalEl) grandTotalEl.innerText = formatCurrency(total);

      const qrPayableEl = document.getElementById('qr-payable-amount');
      if (qrPayableEl) qrPayableEl.innerText = formatCurrency(total);

      const instructionsAmountEl = document.getElementById('instructions-amount');
      if (instructionsAmountEl) instructionsAmountEl.innerText = formatCurrency(total);

      const merchantUpi = settings.upiId || '9789123456@upi';
      const merchantName = settings.merchantName || settings.shopName || 'TEAM 7 SYSTEM SOLUTION';
      const upiString = `upi://pay?pa=${encodeURIComponent(merchantUpi)}&pn=${encodeURIComponent(merchantName)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Print Order Payment')}`;

      const qrBox = document.getElementById('upi-qr-canvas-box');
      if (qrBox) {
        renderUpiQrCode(qrBox, upiString, total.toFixed(2));
      }

      const fileCountText = document.getElementById('summary-file-count');
      if (fileCountText) {
        const totalPages = state.files.reduce((a, f) => a + f.pages, 0);
        fileCountText.innerText = state.files.length > 0
          ? `${state.files.length} file(s) • ~${totalPages} total page(s)`
          : 'No files uploaded yet.';
      }
      return quote;
    };

    function renderUpiQrCode(containerEl, upiString, amount) {
      if (!containerEl) return;

      const encodedData = encodeURIComponent(upiString);
      const primaryQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedData}&margin=8`;
      const fallbackQrUrl = `https://quickchart.io/qr?text=${encodedData}&size=220&margin=2`;

      containerEl.innerHTML = `
        <div style="text-align:center;">
          <div style="position:relative; display:inline-block; padding:10px; background:white; border-radius:14px; border:2px solid var(--primary); box-shadow:var(--shadow-md);">
            <img src="${primaryQrUrl}" alt="UPI QR Code for ₹${amount}" style="width:180px; height:180px; display:block; border-radius:8px;" 
              onerror="this.onerror=null; this.src='${fallbackQrUrl}';" />
            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:4px 8px; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.2); border:1.5px solid #cbd5e1; font-weight:800; font-size:0.75rem; color:var(--primary); font-family:sans-serif;">
              UPI
            </div>
          </div>
          <div style="margin-top:0.85rem;">
            <a href="${upiString}" class="btn btn-sm btn-primary glow-effect" style="font-size:0.8rem; padding:0.45rem 0.9rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem;">
              📱 Pay with GPay / PhonePe / Paytm ➔
            </a>
          </div>
        </div>
      `;
    }

    const deliverySelect = document.getElementById('cust-delivery-zone');
    if (deliverySelect) {
      deliverySelect.onchange = () => updateCalculations();
    }

    const setStep = (stepNum) => {
      [1, 2, 3].forEach(n => {
        document.getElementById(`step-${n}-content`).style.display = n === stepNum ? 'block' : 'none';
        document.getElementById(`tab-${n}`).classList.toggle('active', n === stepNum);
      });
      window.scrollTo(0, 200);
    };

    // File Drag & Drop Setup
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');

    const browseBtn = document.getElementById('btn-browse-trigger');

    if (dropzone && fileInput) {
      dropzone.onclick = (e) => {
        if (e.target !== fileInput) {
          fileInput.click();
        }
      };
      if (browseBtn) {
        browseBtn.onclick = (e) => {
          e.stopPropagation();
          fileInput.click();
        };
      }
      dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('dragover'); };
      dropzone.ondragleave = () => dropzone.classList.remove('dragover');
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFiles(e.dataTransfer.files);
        }
      };
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFiles(e.target.files);
          fileInput.value = ''; // Clear value so re-selecting same file triggers change
        }
      };
    }

    // Default print options template
    const defaultFileOptions = (totalPages = 1) => ({
      paperSize: Object.keys(pricing.paperSizes)[0] || 'A4',
      paperQuality: Object.keys(pricing.paperQualities)[0] || '70 GSM',
      colorMode: 'Black & White',
      printSide: 'Single',
      orientation: 'Portrait',
      copies: 1,
      binding: 'None',
      lamination: 'No',
      pageRange: `1-${totalPages}`,
      colorPageRange: '',
      notes: ''
    });

    async function handleFiles(fileList) {
      const filesArray = Array.from(fileList);
      if (filesArray.length === 0) return;

      const validFiles = filesArray.filter(file => {
        if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
          NotificationService.showToast(`⚠️ "${file.name}" is not a PDF file. Word, Excel, PPT & Images not allowed! Please convert to PDF first (File → Save As → PDF).`, 'warning');
          return false;
        }
        if (file.size > 200 * 1024 * 1024) {
          NotificationService.showToast(`File ${file.name} exceeds 200MB limit!`, 'error');
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Locate or create status container above file preview
      let statusBox = document.getElementById('upload-status-box');
      if (!statusBox) {
        const previewContainer = document.getElementById('file-list-preview');
        statusBox = document.createElement('div');
        statusBox.id = 'upload-status-box';
        statusBox.style.marginTop = '1.25rem';
        if (previewContainer && previewContainer.parentNode) {
          previewContainer.parentNode.insertBefore(statusBox, previewContainer);
        }
      }

      // Step 1: Render Animated Processing Screen
      statusBox.innerHTML = `
        <div style="background:var(--bg-card); border:2px dashed var(--primary); border-radius:14px; padding:1.5rem; text-align:center; box-shadow:var(--shadow-md);" class="animate-fade-in">
          <div style="display:inline-block; font-size:2.75rem; margin-bottom:0.5rem; animation: spin 1.5s linear infinite;">⚙️</div>
          <h4 style="font-size:1.15rem; font-weight:700; color:var(--primary); margin-bottom:0.25rem;">Processing & Scanning PDF Files...</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Reading page count, parsing PDF structure & storing locally for high-speed printing...</p>
          
          <!-- Animated Progress Bar -->
          <div style="width:100%; height:12px; background:var(--bg-body); border-radius:20px; overflow:hidden; border:1px solid var(--border-color); margin-bottom:0.75rem;">
            <div id="pdf-progress-bar" style="width: 20%; height:100%; background:linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); transition: width 0.25s ease;"></div>
          </div>
          
          <div style="display:flex; justify-content:space-between; font-size:0.82rem; font-weight:600; color:var(--text-muted);">
            <span id="pdf-progress-text">Processing: ${validFiles[0].name}...</span>
            <span id="pdf-progress-percent">20%</span>
          </div>
        </div>
      `;

      const updateProgress = (pct, filename) => {
        const bar = document.getElementById('pdf-progress-bar');
        const txt = document.getElementById('pdf-progress-text');
        const perc = document.getElementById('pdf-progress-percent');
        if (bar) bar.style.width = pct + '%';
        if (txt && filename) txt.innerText = `Processing: ${filename}...`;
        if (perc) perc.innerText = pct + '%';
      };

      let newlyUploadedCount = 0;
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];

        // 1. Validate file format and 200MB size limit
        const val = StorageService.validateFile(file);
        if (!val.valid) {
          NotificationService.showToast(val.error, 'error');
          continue;
        }

        updateProgress(5, file.name);

        try {
          const estPages = await StorageService.estimatePdfPages(file);

          // 2. Perform Resumable Upload to Firebase Storage with live progress callback
          const uploaded = await StorageService.uploadFileResumable(file, 'orders', (pct) => {
            updateProgress(pct, file.name);
          });

          state.files.push({
            fileName: file.name,
            name: file.name,
            fileType: file.type || 'application/pdf',
            type: file.type || 'application/pdf',
            fileSize: uploaded.fileSize || StorageService.formatBytes(file.size),
            size: uploaded.fileSize || StorageService.formatBytes(file.size),
            storagePath: uploaded.storagePath || '',
            downloadURL: uploaded.downloadURL || uploaded.url || '',
            url: uploaded.downloadURL || uploaded.url || '',
            dataUrl: uploaded.dataUrl || '',
            idbKey: uploaded.idbKey || '',
            uploadStatus: 'uploaded',
            uploadedAt: uploaded.uploadedAt || new Date().toISOString(),
            expiresAt: uploaded.expiresAt || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
            pages: estPages || 1,
            options: defaultFileOptions(estPages || 1)
          });
          newlyUploadedCount++;
        } catch (err) {
          console.error('File upload error:', err);
          NotificationService.showToast(`Upload failed for ${file.name}. Please check network and retry.`, 'error');
          statusBox.innerHTML = `
            <div style="background:rgba(239,68,68,0.1); border:2px solid #ef4444; border-radius:14px; padding:1.25rem; text-align:center;">
              <h4 style="color:#dc2626; font-weight:800;">❌ Upload Failed</h4>
              <p style="font-size:0.875rem; color:var(--text-main); margin-top:0.35rem;">
                Could not upload <b>${file.name}</b> to online storage. Please check your internet connection.
              </p>
              <button class="btn btn-danger mt-2" onclick="document.getElementById('file-input').click()">🔄 Select File & Retry Upload</button>
            </div>
          `;
          return;
        }
      }

      updateProgress(100, 'Upload Complete!');
      await new Promise(r => setTimeout(r, 200));

      // Render PDF Upload Successful Screen
      const lastUploadedFile = state.files[state.files.length - 1];
      statusBox.innerHTML = `
        <div style="background:linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(5,150,105,0.08) 100%); border:2px solid #10b981; border-radius:14px; padding:1.25rem 1.5rem; box-shadow:0 6px 20px rgba(16,185,129,0.18); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;" class="animate-fade-in">
          <div style="display:flex; align-items:center; gap:1rem;">
            <div style="width:48px; height:48px; background:#10b981; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.75rem; font-weight:bold; box-shadow:0 4px 14px rgba(16,185,129,0.4); flex-shrink:0;">
              ✓
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <h4 style="font-size:1.15rem; font-weight:800; color:#10b981; margin:0;">File Uploaded Successfully!</h4>
                <span style="background:#10b981; color:white; font-size:0.75rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:12px;">Stored Online Safely ✓</span>
              </div>
              <p style="font-size:0.875rem; color:var(--text-main); margin-top:0.25rem;">
                <b>${newlyUploadedCount} file(s)</b> uploaded to cloud storage (~${lastUploadedFile ? lastUploadedFile.pages : 1} pages).
              </p>
            </div>
          </div>
          <div style="font-size:0.82rem; font-weight:700; color:#10b981; background:rgba(16,185,129,0.18); padding:0.55rem 1rem; border-radius:10px; border:1px solid rgba(16,185,129,0.35);">
            📄 Configure Print Options Below 👇
          </div>
        </div>
      `;

      NotificationService.showToast(`File Uploaded Successfully to Cloud Storage!`, 'success');

      state.totalPages = state.files.reduce((acc, f) => acc + f.pages, 0) || 1;
      renderFileList();
      updateCalculations();
    }

    function renderFileList() {
      const container = document.getElementById('file-list-preview');
      if (!container) return;
      if (state.files.length === 0) {
        container.innerHTML = '';
        return;
      }
      const paperSizeOptions = Object.entries(pricing.paperSizes).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('');
      const paperQualityOptions = Object.entries(pricing.paperQualities).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('');

      container.innerHTML = state.files.map((f, idx) => {
        const fileQuote = PricingEngine.calculateQuote(f.options, f.pages);
        return `
        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; overflow:hidden; margin-bottom:1rem;">
          <!-- File Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.85rem 1rem; background:var(--primary-light); cursor:pointer;" onclick="window.toggleFileOptions(${idx})">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <span style="font-size:1.3rem;">📄</span>
              <div>
                <div style="font-weight:700; font-size:0.9rem; display:flex; align-items:center; gap:0.5rem;">
                  ${f.name}
                  <span style="background:rgba(16,185,129,0.18); color:#10b981; font-weight:700; font-size:0.7rem; padding:0.15rem 0.5rem; border-radius:10px; border:1px solid rgba(16,185,129,0.4);">✓ Uploaded</span>
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${f.size} &nbsp;•&nbsp; ~${f.pages} page(s)</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:0.75rem; color:var(--primary); font-weight:600;" id="file-toggle-label-${idx}">⚙️ Configure ▼</span>
              <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); window.removeWizardFile(${idx})">✕ Remove</button>
            </div>
          </div>

          <!-- Per-File Print Options Panel -->
          <div id="file-options-${idx}" style="padding:1rem 1.25rem; border-top:1px solid var(--border-color);">
            <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:0.85rem; margin-bottom:0.85rem;">
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">${I18nService.t('calc_size')}</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'paperSize',this.value)">
                  ${Object.entries(pricing.paperSizes).map(([k,v]) => `<option value="${k}" ${f.options.paperSize===k?'selected':''}>${v.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">${I18nService.t('paper_quality')}</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'paperQuality',this.value)">
                  ${Object.entries(pricing.paperQualities).map(([k,v]) => `<option value="${k}" ${f.options.paperQuality===k?'selected':''}>${v.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">${I18nService.t('calc_color')}</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'colorMode',this.value)">
                  <option value="Black & White" ${f.options.colorMode==='Black & White'?'selected':''}>⬛ ${I18nService.t('color_bw')}</option>
                  <option value="Color" ${f.options.colorMode==='Color'?'selected':''}>🎨 ${I18nService.t('color_full')}</option>
                  <option value="Custom Split" ${f.options.colorMode==='Custom Split'?'selected':''}>🔀 ${I18nService.t('color_split')}</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">${I18nService.t('print_side')}</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'printSide',this.value)">
                  <option value="Single" ${f.options.printSide==='Single'?'selected':''}>${I18nService.t('single_side')}</option>
                  <option value="Double" ${f.options.printSide==='Double'?'selected':''}>${I18nService.t('double_side')}</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">${I18nService.t('orientation')}</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'orientation',this.value)">
                  <option value="Portrait" ${f.options.orientation==='Portrait'?'selected':''}>${I18nService.t('portrait')}</option>
                  <option value="Landscape" ${f.options.orientation==='Landscape'?'selected':''}>${I18nService.t('landscape')}</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">${I18nService.t('copies')}</label>
                <input type="number" class="form-control" style="font-size:0.82rem;" min="1" max="500" value="${f.options.copies || 1}" onchange="window.updateFileOption(${idx},'copies',parseInt(this.value)||1)">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem; display:flex; justify-content:space-between; align-items:center;">
                  <span>${I18nService.t('calc_binding')}</span>
                  <button type="button" class="btn btn-sm btn-link" style="padding:0; border:none; background:none; font-size:0.7rem; color:var(--primary); text-decoration:underline; cursor:pointer;" onclick="window.showBindingInfoModal()" title="What is document binding?">
                    ${I18nService.t('calc_what_is_binding')}
                  </button>
                </label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'binding',this.value)">
                  ${Object.entries(pricing.bindings || {}).map(([k, v]) => `
                    <option value="${k}" ${f.options.binding===k?'selected':''}>${k} ${v.price > 0 ? `(₹${v.price})` : ''}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">${I18nService.t('lamination_label')}</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'lamination',this.value)">
                  ${Object.entries(pricing.lamination || {}).map(([k, v]) => `
                    <option value="${k}" ${f.options.lamination===k?'selected':''}>${v.label || k} ${v.pricePerPage > 0 ? `(₹${v.pricePerPage}/pg)` : ''}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Page Range & Color/B&W Page Selector Box -->
            <div style="background:var(--primary-light); padding:0.85rem 1rem; border-radius:10px; border:1px solid var(--border-color); margin-bottom:0.85rem; display:grid; grid-template-columns:1fr 1fr; gap:1rem; align-items:flex-start;">
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem; font-weight:700; color:var(--primary);">
                  📄 Pages to Print (Doc Total: ${f.pages} pgs)
                </label>
                <input type="text" class="form-control" style="font-size:0.82rem;" placeholder="E.g., 1-${f.pages} or 1, 3, 5-20" value="${f.options.pageRange !== undefined ? f.options.pageRange : `1-${f.pages}`}" oninput="window.updateFileOption(${idx},'pageRange',this.value)">
                <span style="font-size:0.7rem; color:var(--text-muted); margin-top:0.2rem; display:block;">
                  Enter page ranges to print (e.g. <code>1-${f.pages}</code> or <code>1-50</code>).
                </span>
              </div>

              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem; font-weight:700; color:${f.options.colorMode === 'Custom Split' ? '#10b981' : 'var(--text-main)'};">
                  🎨 Color Page Numbers / Ranges
                </label>
                <input type="text" class="form-control" style="font-size:0.82rem; ${f.options.colorMode === 'Custom Split' ? 'border-color:#10b981; box-shadow:0 0 0 2px rgba(16,185,129,0.2);' : ''}" placeholder="${f.options.colorMode === 'Color' ? 'All pages are Full Color' : f.options.colorMode === 'Black & White' ? 'All pages are Black & White' : 'E.g., 1, 5, 10-15'}" value="${f.options.colorPageRange || ''}" oninput="window.updateFileOption(${idx},'colorPageRange',this.value)">
                <span style="font-size:0.7rem; color:var(--text-muted); margin-top:0.2rem; display:block;">
                  Enter page numbers to print in <b>Color</b> (e.g. <code>1, 5, 10-15</code>). Others print in <b>B&amp;W</b>.
                </span>
              </div>
            </div>

            <!-- Per-File Live Price Calculation Breakdown -->
            <div id="file-calc-breakdown-${idx}" style="background:var(--bg-card); border:1px solid var(--border-color); padding:0.65rem 0.85rem; border-radius:8px; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem;">
              <div>
                <span style="font-weight:700; color:var(--text-main);">📊 Print Calculation:</span>
                ${fileQuote.colorPagesCount > 0 ? `<span style="color:#10b981; font-weight:700; margin-left:0.4rem;">🎨 ${fileQuote.colorPagesCount} Color pgs (@ ${formatCurrency(fileQuote.colorPaperRate)})</span>` : ''}
                ${fileQuote.bwPagesCount > 0 ? `<span style="color:var(--text-muted); font-weight:600; margin-left:0.4rem;">⬛ ${fileQuote.bwPagesCount} B&amp;W pgs (@ ${formatCurrency(fileQuote.basePaperRate)})</span>` : ''}
                <span style="color:var(--text-muted); margin-left:0.3rem;">• ${f.options.copies || 1} copy(ies)</span>
              </div>
              <div style="font-weight:800; color:var(--primary); font-size:0.875rem;">
                File Cost: ${formatCurrency(fileQuote.paperCost + fileQuote.colorCost + fileQuote.bindingCost + fileQuote.laminationCost)}
              </div>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:0.78rem;">Special Instructions for this file</label>
              <input type="text" class="form-control" style="font-size:0.82rem;" placeholder="E.g., Print page 1 in color only..." value="${f.options.notes || ''}" oninput="window.updateFileOption(${idx},'notes',this.value)">
            </div>
          </div>
        </div>
        `;
      }).join('');
    }

    window.toggleFileOptions = (idx) => {
      const panel = document.getElementById(`file-options-${idx}`);
      const label = document.getElementById(`file-toggle-label-${idx}`);
      if (!panel) return;
      const isHidden = panel.style.display === 'none';
      panel.style.display = isHidden ? '' : 'none';
      if (label) label.textContent = isHidden ? '⚙️ Configure ▲' : '⚙️ Configure ▼';
    };

    window.showBindingInfoModal = () => {
      const pricing = PricingEngine.getPricingData();
      const bindingsObj = pricing.bindings || DEFAULT_PRICING.bindings;

      const modalHTML = `
        <div style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">
          <p style="margin-bottom:1.1rem; color:var(--text-muted);">
            <b>Document Binding</b> holds loose printed pages together into a neat, organized, and durable book, project report, or booklet.
          </p>

          <div style="display:flex; flex-direction:column; gap:0.85rem;">
            ${Object.entries(bindingsObj).map(([name, item]) => {
              let badgeColor = 'background:rgba(59,130,246,0.08); border:1.5px solid rgba(59,130,246,0.25);';
              let titleColor = 'color:var(--primary);';
              let icon = '🌀';

              if (name.toLowerCase().includes('soft')) {
                badgeColor = 'background:rgba(16,185,129,0.08); border:1.5px solid rgba(16,185,129,0.25);';
                titleColor = 'color:#059669;';
                icon = '📘';
              } else if (name.toLowerCase().includes('hard') || name.toLowerCase().includes('thesis')) {
                badgeColor = 'background:rgba(245,158,11,0.08); border:1.5px solid rgba(245,158,11,0.25);';
                titleColor = 'color:#d97706;';
                icon = '📕';
              } else if (name === 'None') {
                badgeColor = 'background:var(--bg-card); border:1px solid var(--border-color);';
                titleColor = 'color:var(--text-muted);';
                icon = '📄';
              }

              const descText = item.description || item.label || (
                name === 'Spiral' ? 'Durable plastic spiral coil with clear transparent sheet on front & heavy cardstock back cover. Standard for lab manuals & reports.' :
                name === 'Soft' ? 'Thermal glued spine with soft printed cardstock cover wrapping around the book. Clean paperback finish.' :
                name === 'Hard' ? 'Heavy rigid hardboard cover with luxury gold foil embossed lettering on front & spine. Mandatory for university theses.' :
                name === 'None' ? 'Loose printed sheets delivered in correct sequence without any binding.' : 'Custom document binding finish.'
              );

              return `
                <div style="${badgeColor} padding:0.85rem 1rem; border-radius:10px;">
                  <div style="font-weight:800; ${titleColor} font-size:0.95rem; display:flex; justify-content:space-between; align-items:center;">
                    <span>${icon} ${name} Binding</span>
                    <span class="badge ${item.price > 0 ? 'badge-approved' : ''}" style="font-size:0.75rem;">${item.price > 0 ? formatCurrency(item.price) + ' / book' : 'Free (₹0.00)'}</span>
                  </div>
                  <div style="font-size:0.85rem; color:var(--text-main); margin-top:0.35rem; line-height:1.45;">
                    ${descText}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="text-align:right; margin-top:1.25rem;">
            <button type="button" class="btn btn-primary" onclick="if(window.ModalComponent) window.ModalComponent.close(); else document.getElementById('active-modal-overlay')?.remove();">Understood ✓</button>
          </div>
        </div>
      `;

      const modal = ModalComponent || window.ModalComponent;
      if (modal) {
        modal.show({
          title: `📚 What is Document Binding?`,
          bodyHTML: modalHTML,
          width: '560px'
        });
      }
    };

    window.updateFileOption = (idx, key, value) => {
      if (state.files[idx]) {
        state.files[idx].options[key] = value;

        // Auto switch colorMode to Custom Split if typing in colorPageRange
        if (key === 'colorPageRange' && value.trim() !== '' && state.files[idx].options.colorMode !== 'Custom Split') {
          state.files[idx].options.colorMode = 'Custom Split';
          const selectEls = document.querySelectorAll(`#file-options-${idx} select`);
          if (selectEls && selectEls[2]) selectEls[2].value = 'Custom Split';
        }

        // Live update file price calculation breakdown
        const calcBox = document.getElementById(`file-calc-breakdown-${idx}`);
        if (calcBox && typeof PricingEngine !== 'undefined') {
          const f = state.files[idx];
          const fileQuote = PricingEngine.calculateQuote(f.options, f.pages);
          calcBox.innerHTML = `
            <div>
              <span style="font-weight:700; color:var(--text-main);">📊 Print Calculation:</span>
              ${fileQuote.colorPagesCount > 0 ? `<span style="color:#10b981; font-weight:700; margin-left:0.4rem;">🎨 ${fileQuote.colorPagesCount} Color pgs (@ ${formatCurrency(fileQuote.colorPaperRate)})</span>` : ''}
              ${fileQuote.bwPagesCount > 0 ? `<span style="color:var(--text-muted); font-weight:600; margin-left:0.4rem;">⬛ ${fileQuote.bwPagesCount} B&amp;W pgs (@ ${formatCurrency(fileQuote.basePaperRate)})</span>` : ''}
              <span style="color:var(--text-muted); margin-left:0.3rem;">• ${f.options.copies || 1} copy(ies)</span>
            </div>
            <div style="font-weight:800; color:var(--primary); font-size:0.875rem;">
              File Cost: ${formatCurrency(fileQuote.paperCost + fileQuote.colorCost + fileQuote.bindingCost + fileQuote.laminationCost)}
            </div>
          `;
        }

        updateCalculations();
      }
    };

    window.removeWizardFile = (index) => {
      state.files.splice(index, 1);
      state.totalPages = state.files.reduce((acc, f) => acc + f.pages, 0) || 1;
      if (state.files.length === 0) {
        const box = document.getElementById('upload-status-box');
        if (box) box.remove();
      }
      renderFileList();
      updateCalculations();
    };

    // Step Navigation Event Handlers
    const btnToStep2 = document.getElementById('btn-to-step-2');
    if (btnToStep2) {
      btnToStep2.onclick = () => {
        if (state.files.length === 0) {
          NotificationService.showToast('Please upload at least one PDF document before continuing to Contact Details.', 'warning');
          return;
        }
        updateCalculations();
        setStep(2);
      };
    }

    const btnBackToStep1 = document.getElementById('btn-back-to-step-1');
    if (btnBackToStep1) btnBackToStep1.onclick = () => setStep(1);

    const btnToStep3 = document.getElementById('btn-to-step-3');
    if (btnToStep3) {
      btnToStep3.onclick = () => {
        const name = document.getElementById('cust-name')?.value.trim() || '';
        const phone = document.getElementById('cust-phone')?.value.trim() || '';

        if (!name || !phone) {
          NotificationService.showToast('Please enter your Name and Mobile Phone Number.', 'warning');
          return;
        }

        state.customer.name = name;
        state.customer.phone = phone;
        state.customer.email = document.getElementById('cust-email')?.value.trim() || '';
        state.customer.address = document.getElementById('cust-address')?.value.trim() || '';
        updateCalculations();
        setStep(3);
      };
    }

    const btnBackToStep2 = document.getElementById('btn-back-to-step-2');
    if (btnBackToStep2) btnBackToStep2.onclick = () => setStep(2);

    // Clickable Wizard Tab Header Tabs
    const tab1 = document.getElementById('tab-1');
    const tab2 = document.getElementById('tab-2');
    const tab3 = document.getElementById('tab-3');
    if (tab1) tab1.onclick = () => setStep(1);
    if (tab2) {
      tab2.onclick = () => {
        if (state.files.length === 0) {
          NotificationService.showToast('Please upload at least one PDF document before continuing.', 'warning');
          return;
        }
        updateCalculations();
        setStep(2);
      };
    }
    if (tab3) {
      tab3.onclick = () => {
        if (state.files.length === 0) {
          NotificationService.showToast('Please upload at least one PDF document before continuing.', 'warning');
          return;
        }
        const name = document.getElementById('cust-name')?.value.trim() || '';
        const phone = document.getElementById('cust-phone')?.value.trim() || '';
        if (!name || !phone) {
          NotificationService.showToast('Please enter your Name and Mobile Phone Number.', 'warning');
          setStep(2);
          return;
        }
        updateCalculations();
        setStep(3);
      };
    }

    // Per-file options update via global helpers (already handled inline via window.updateFileOption)

    // Submit Order
    const btnSubmit = document.getElementById('btn-submit-final-order');
    if (btnSubmit) {
      btnSubmit.onclick = async () => {
        const utr = document.getElementById('pay-utr')?.value.trim() || '';
        const payerName = document.getElementById('pay-name')?.value.trim() || '';
        const screenshotInput = document.getElementById('pay-screenshot');

        const custName = state.customer.name || document.getElementById('cust-name')?.value.trim() || '';
        const custPhone = state.customer.phone || document.getElementById('cust-phone')?.value.trim() || '';
        const custEmail = state.customer.email || document.getElementById('cust-email')?.value.trim() || '';
        const custAddress = state.customer.address || document.getElementById('cust-address')?.value.trim() || '';

        if (state.files.length === 0) {
          NotificationService.showToast('Please upload at least one PDF document before submitting.', 'warning');
          setStep(1);
          return;
        }

        if (!custName || !custPhone) {
          NotificationService.showToast('Please enter your Customer Name and Phone Number in Step 2.', 'warning');
          setStep(2);
          return;
        }

        if (!utr || utr.length < 6) {
          NotificationService.showToast('Please enter a valid 12-digit UTR / UPI Ref Number.', 'warning');
          document.getElementById('pay-utr')?.focus();
          return;
        }

        if (!payerName) {
          NotificationService.showToast('Please enter the Payer / UPI Account Name.', 'warning');
          document.getElementById('pay-name')?.focus();
          return;
        }

        const originalText = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '⏳ Submitting...';

        // Show Full-Screen Loading Overlay
        let loadingOverlay = document.getElementById('order-submit-overlay');
        if (!loadingOverlay) {
          loadingOverlay = document.createElement('div');
          loadingOverlay.id = 'order-submit-overlay';
          document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.style.cssText = `
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(10, 10, 20, 0.88);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeInOverlay 0.35s ease;
        `;
        // Inject keyframes if not already present
        if (!document.getElementById('overlay-anim-style')) {
          const style = document.createElement('style');
          style.id = 'overlay-anim-style';
          style.textContent = `
            @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeOutOverlay { from { opacity: 1; } to { opacity: 0; } }
            @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
            @keyframes successPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 50% { box-shadow: 0 0 0 22px rgba(16,185,129,0); } }
            @keyframes confettiFall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }
        loadingOverlay.innerHTML = `
          <div style="text-align:center; padding:2.5rem; max-width:420px; width:90%;">
            <div style="position:relative; width:90px; height:90px; margin:0 auto 1.75rem;">
              <div style="position:absolute; inset:0; border-radius:50%; border:4px solid rgba(255,255,255,0.1);"></div>
              <div style="position:absolute; inset:0; border-radius:50%; border:4px solid transparent; border-top-color:#3b82f6; border-right-color:#8b5cf6; animation: spinRing 1.1s linear infinite;"></div>
              <div style="position:absolute; inset:10px; border-radius:50%; border:3px solid transparent; border-bottom-color:#10b981; animation: spinRing 0.75s linear infinite reverse;"></div>
              <div style="position:absolute; inset:22px; border-radius:50%; background:linear-gradient(135deg,#3b82f6,#8b5cf6); display:flex; align-items:center; justify-content:center; font-size:1.35rem;">🖨️</div>
            </div>
            <h3 style="color:#fff; font-size:1.45rem; font-weight:800; margin-bottom:0.6rem; letter-spacing:-0.01em;">Submitting Your Order...</h3>
            <p style="color:rgba(255,255,255,0.65); font-size:0.92rem; line-height:1.6; margin-bottom:1.5rem;">Processing payment details &amp; uploading your order to our system. Please wait...</p>
            <div style="background:rgba(255,255,255,0.07); border-radius:12px; padding:0.85rem 1.25rem; border:1px solid rgba(255,255,255,0.12);">
              <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.45rem;">
                <span style="width:8px; height:8px; border-radius:50%; background:#3b82f6; display:inline-block; animation: spinRing 1s linear infinite;"></span>
                <span style="color:rgba(255,255,255,0.75); font-size:0.82rem; font-weight:600;">Saving payment details</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.45rem;">
                <span style="width:8px; height:8px; border-radius:50%; background:#8b5cf6; display:inline-block; animation: spinRing 1.3s linear infinite;"></span>
                <span style="color:rgba(255,255,255,0.75); font-size:0.82rem; font-weight:600;">Syncing order to cloud database</span>
              </div>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <span style="width:8px; height:8px; border-radius:50%; background:#10b981; display:inline-block; animation: spinRing 0.9s linear infinite;"></span>
                <span style="color:rgba(255,255,255,0.75); font-size:0.82rem; font-weight:600;">Sending confirmation notification</span>
              </div>
            </div>
          </div>
        `;

        try {
          let screenshotUrl = '';
          let screenshotIdbKey = '';
          let screenshotDataUrl = '';
          if (screenshotInput && screenshotInput.files && screenshotInput.files[0]) {
            try {
              const screenshotFile = screenshotInput.files[0];
              screenshotDataUrl = await StorageService.readFileAsDataURL(screenshotFile);
              const uploaded = await StorageService.uploadFile(screenshotFile, 'receipts');
              screenshotUrl = uploaded.url || screenshotDataUrl || '';
              screenshotIdbKey = uploaded.idbKey || '';
            } catch (err) {
              console.warn('Screenshot processing failed, proceeding with dataUrl:', err);
            }
          }

          const quote = updateCalculations();

          const newOrder = await DBService.createOrder({
            customerName: custName,
            customerPhone: custPhone,
            customerEmail: custEmail,
            customerAddress: custAddress,
            files: state.files.map(f => ({
              name: f.name,
              size: f.size,
              url: f.url,
              dataUrl: f.dataUrl || '',
              idbKey: f.idbKey || '',
              storagePath: f.storagePath || '',
              uploadedAt: f.uploadedAt || '',
              expiresAt: f.expiresAt || '',
              pages: f.pages,
              options: f.options
            })),
            options: state.files.length > 0 ? state.files[0].options : {},
            pricing: quote,
            payment: {
              method: 'UPI QR',
              utr: utr,
              payerName: payerName,
              screenshotUrl: screenshotUrl || screenshotDataUrl,
              screenshotDataUrl: screenshotDataUrl,
              screenshotIdbKey: screenshotIdbKey,
              status: 'Waiting Verification'
            }
          });

          // === SUCCESS SCREEN ===
          // Spawn confetti particles
          const confettiColors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
          for (let c = 0; c < 36; c++) {
            const dot = document.createElement('div');
            const size = 8 + Math.random() * 10;
            dot.style.cssText = `
              position: fixed;
              left: ${10 + Math.random() * 80}vw;
              top: -20px;
              width: ${size}px;
              height: ${size}px;
              border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
              background: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
              z-index: 100000;
              pointer-events: none;
              animation: confettiFall ${1.8 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards;
            `;
            document.body.appendChild(dot);
            setTimeout(() => dot.remove(), 4500);
          }

          loadingOverlay.innerHTML = `
            <div style="text-align:center; padding:2.5rem 2rem; max-width:460px; width:90%; animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;">
              <div style="width:88px; height:88px; border-radius:50%; background:linear-gradient(135deg,#10b981,#059669); display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; font-size:2.5rem; animation: successPulse 2s ease infinite, popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; box-shadow: 0 0 0 0 rgba(16,185,129,0.5);">
                ✓
              </div>
              <h2 style="color:#fff; font-size:1.7rem; font-weight:900; margin-bottom:0.5rem; letter-spacing:-0.02em;">Order Placed Successfully! 🎉</h2>
              <p style="color:rgba(255,255,255,0.7); font-size:0.95rem; margin-bottom:1.75rem; line-height:1.6;">Your order <strong style="color:#10b981;">${newOrder.id}</strong> has been submitted. We'll verify your payment and start printing shortly.</p>
              <div style="background:rgba(16,185,129,0.12); border:1.5px solid rgba(16,185,129,0.35); border-radius:14px; padding:1rem 1.25rem; margin-bottom:1.5rem; text-align:left;">
                <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:0.45rem;">
                  <span style="color:rgba(255,255,255,0.55);">Order ID</span>
                  <span style="color:#10b981; font-weight:800;">${newOrder.id}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:0.45rem;">
                  <span style="color:rgba(255,255,255,0.55);">Customer</span>
                  <span style="color:#fff; font-weight:600;">${custName}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.875rem;">
                  <span style="color:rgba(255,255,255,0.55);">Payment Status</span>
                  <span style="background:#f59e0b; color:#000; font-size:0.75rem; font-weight:700; padding:0.15rem 0.55rem; border-radius:8px;">⏳ Waiting Verification</span>
                </div>
              </div>
              <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;">
                <button id="overlay-track-btn" style="background:linear-gradient(135deg,#3b82f6,#6366f1); color:#fff; border:none; border-radius:10px; padding:0.75rem 1.5rem; font-size:0.95rem; font-weight:700; cursor:pointer; box-shadow:0 4px 14px rgba(59,130,246,0.4); transition:transform 0.15s;">
                  📦 Track My Order
                </button>
                <button id="overlay-close-btn" style="background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:10px; padding:0.75rem 1.25rem; font-size:0.95rem; font-weight:600; cursor:pointer; transition:transform 0.15s;">
                  ✕ Close
                </button>
              </div>
              <p style="color:rgba(255,255,255,0.35); font-size:0.78rem; margin-top:1.25rem;">Redirecting to tracking page in <span id="overlay-countdown">5</span>s...</p>
            </div>
          `;

          // Countdown + auto-redirect
          let countdown = 5;
          const countdownEl = document.getElementById('overlay-countdown');
          const countdownTimer = setInterval(() => {
            countdown--;
            if (countdownEl) countdownEl.textContent = countdown;
            if (countdown <= 0) {
              clearInterval(countdownTimer);
              loadingOverlay.style.animation = 'fadeOutOverlay 0.35s ease forwards';
              setTimeout(() => {
                loadingOverlay.remove();
                window.location.hash = `#track?id=${newOrder.id}`;
              }, 350);
            }
          }, 1000);

          document.getElementById('overlay-track-btn')?.addEventListener('click', () => {
            clearInterval(countdownTimer);
            loadingOverlay.style.animation = 'fadeOutOverlay 0.35s ease forwards';
            setTimeout(() => {
              loadingOverlay.remove();
              window.location.hash = `#track?id=${newOrder.id}`;
            }, 350);
          });

          document.getElementById('overlay-close-btn')?.addEventListener('click', () => {
            clearInterval(countdownTimer);
            loadingOverlay.style.animation = 'fadeOutOverlay 0.35s ease forwards';
            setTimeout(() => {
              loadingOverlay.remove();
              window.location.hash = `#track?id=${newOrder.id}`;
            }, 350);
          });

          NotificationService.showToast(`Order ${newOrder.id} submitted successfully!`, 'success');

        } catch (err) {
          console.error('Order creation error:', err);
          // Remove loading overlay on failure
          if (loadingOverlay) {
            loadingOverlay.style.animation = 'fadeOutOverlay 0.3s ease forwards';
            setTimeout(() => loadingOverlay.remove(), 300);
          }
          NotificationService.showToast('Failed to submit order. Please try again.', 'error');
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = originalText;
        }
      };
    }


    updateCalculations();
  },

  // --- TRACK ORDER PAGE ---
  async renderTrackOrder(queryStr = '') {
    const app = document.getElementById('app-content');
    const paramId = new URLSearchParams(queryStr).get('id') || '';

    app.innerHTML = `
      <section style="padding: 4rem 0;">
        <div class="container" style="max-width:800px;">
          <div class="text-center mb-4">
            <h1 style="font-size:2.5rem;">${I18nService.t('track_title')}</h1>
            <p class="text-muted">${I18nService.t('track_subtitle')}</p>
          </div>

          <!-- Search Box -->
          <div class="glass-panel" style="padding:1.5rem; margin-bottom:2rem;">
            <div style="display:flex; gap:0.75rem;">
              <input type="text" class="form-control" id="track-search-input" placeholder="${I18nService.t('track_order_id')} / ${I18nService.t('track_phone')}..." value="${paramId}">
              <button class="btn btn-primary" id="btn-perform-track">${I18nService.t('track_btn')}</button>
            </div>
          </div>

          <!-- Search Results Container -->
          <div id="track-results-container"></div>
        </div>
      </section>
    `;

    const renderOrderTrackCard = (order) => {
      const isCompleted = order.status === 'Completed';
      const isReady = order.status === 'Ready for Pickup';
      const isPrinting = order.status === 'Printing';
      const isApproved = order.status === 'Payment Approved';

      return `
      <div class="glass-panel" style="padding:2rem; margin-bottom:1.5rem; border-left: 5px solid ${isCompleted ? '#10b981' : isReady ? '#3b82f6' : 'var(--primary)'}; shadow: var(--shadow-md);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <h3 style="color:var(--primary); font-size:1.4rem; margin:0;">${order.id}</h3>
              <span style="font-size:0.72rem; background:rgba(16,185,129,0.15); color:#059669; font-weight:700; padding:0.2rem 0.55rem; border-radius:12px; border:1px solid rgba(16,185,129,0.3); display:inline-flex; align-items:center; gap:0.3rem;">
                <span style="display:inline-block; width:7px; height:7px; background:#10b981; border-radius:50%;"></span>
                Live Sync Active
              </span>
            </div>
            <p class="text-muted" style="font-size:0.85rem; margin-top:0.25rem;">Placed on: ${formatDate(order.createdAt)} at ${formatTime(order.createdAt)}</p>
          </div>
          <div>
            ${getStatusBadgeHTML(order.status)}
          </div>
        </div>

        <!-- Order Status Progress Flow Visualizer -->
        <div style="margin:1.5rem 0;">
          <h4 style="font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Order Progression Timeline:</h4>
          <div class="timeline">
            <div class="timeline-item ${order.status !== 'Pending Payment' ? 'completed' : 'active'}">
              <div class="timeline-icon">✓</div>
              <div class="timeline-content">
                <div style="font-weight:700;">Order Received & Verified</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Payment submitted via UPI UTR: <code>${order.payment?.utr || 'N/A'}</code></div>
              </div>
            </div>

            <div class="timeline-item ${['Payment Approved', 'Printing', 'Ready for Pickup', 'Completed'].includes(order.status) ? 'completed' : isApproved || isPrinting ? 'active' : ''}">
              <div class="timeline-icon">${isPrinting ? '🖨️' : '💳'}</div>
              <div class="timeline-content">
                <div style="font-weight:700;">Payment Approved & Document Printing</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${isPrinting ? '🖨️ Currently printing your document packages...' : 'Payment verified by shop desk'}</div>
              </div>
            </div>

            <div class="timeline-item ${['Ready for Pickup', 'Completed'].includes(order.status) ? 'completed' : ''}">
              <div class="timeline-icon">📦</div>
              <div class="timeline-content">
                <div style="font-weight:700;">${(order.pricing?.deliveryFee && order.pricing.deliveryFee > 0) ? 'Out for Delivery' : 'Ready for Store Pickup'}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${isCompleted ? '✅ Order Completed & Delivered!' : `Est. Ready: ${formatDate(order.estimatedReady)} at ${formatTime(order.estimatedReady)}`}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary info -->
        <div style="background:var(--bg-card); padding:1rem 1.25rem; border-radius:10px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <span style="font-size:0.85rem; color:var(--text-muted);">Customer:</span> <b>${order.customerName || 'Customer'}</b> (${order.customerPhone || 'N/A'})
            <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">
              📄 ${order.files?.length || 1} file(s) attached • ${(order.files?.[0]?.options || order.options)?.paperSize || 'A4'} (${(order.files?.[0]?.options || order.options)?.colorMode || 'B&W'})
            </div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.85rem; color:var(--text-muted);">Grand Total:</span>
            <div style="font-size:1.35rem; font-weight:800; color:var(--primary);">${formatCurrency(order.pricing?.total)}</div>
          </div>
        </div>
      </div>
      `;
    };

    const searchAction = async (isSilentUpdate = false) => {
      const val = document.getElementById('track-search-input')?.value.trim();
      const container = document.getElementById('track-results-container');
      if (!container) return;

      if (!val) {
        if (!isSilentUpdate) {
          container.innerHTML = `<div class="text-center text-muted">Please enter an Order ID or Mobile Number above.</div>`;
        }
        return;
      }

      const results = await DBService.searchOrders(val);
      if (results.length === 0) {
        if (!isSilentUpdate) {
          container.innerHTML = `
            <div class="glass-panel text-center" style="padding:2.5rem;">
              <div style="font-size:3rem;">🔍</div>
              <h3>No orders found</h3>
              <p class="text-muted" style="margin-top:0.5rem;">We couldn't find any order matching "${val}". Please check the ID or Phone number.</p>
            </div>
          `;
        }
        return;
      }

      // Check if status changed compared to previous render
      let statusChanged = false;
      results.forEach(freshOrder => {
        const lastStatus = window._lastTrackedStatuses ? window._lastTrackedStatuses[freshOrder.id] : null;
        if (lastStatus && lastStatus !== freshOrder.status) {
          statusChanged = true;
          NotificationService.showToast(`🔔 Status Update: Order ${freshOrder.id} is now '${freshOrder.status}'!`, 'success');
        }
        if (!window._lastTrackedStatuses) window._lastTrackedStatuses = {};
        window._lastTrackedStatuses[freshOrder.id] = freshOrder.status;
      });

      if (!isSilentUpdate || statusChanged || !container.innerHTML.includes(results[0].id)) {
        container.innerHTML = results.map(order => renderOrderTrackCard(order)).join('');
      }
    };

    const searchBtn = document.getElementById('btn-perform-track');
    if (searchBtn) searchBtn.onclick = () => searchAction(false);
    if (paramId) searchAction(false);

    // --- LIVE REFRESH SYNC TIMER FOR TRACK ORDER PAGE (3-second Polling) ---
    if (window._trackOrderSyncTimer) {
      clearInterval(window._trackOrderSyncTimer);
    }

    window._trackOrderSyncTimer = setInterval(() => {
      if (!window.location.hash.startsWith('#track')) {
        clearInterval(window._trackOrderSyncTimer);
        window._trackOrderSyncTimer = null;
        return;
      }
      searchAction(true);
    }, 3000);
  },

  // --- FAQ PAGE ---
  async renderFAQ() {
    const app = document.getElementById('app-content');
    app.innerHTML = `
      <section style="padding: 4rem 0;">
        <div class="container" style="max-width:800px;">
          <div class="text-center mb-4">
            <h1 style="font-size:2.5rem;">${I18nService.t('faq_heading')}</h1>
            <p class="text-muted">${I18nService.t('faq_subheading')}</p>
          </div>

          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            ${FAQS.map(faq => `
              <div class="glass-panel" style="padding:1.5rem;">
                <h3 style="font-size:1.15rem; margin-bottom:0.5rem; color:var(--primary);">Q: ${faq.q}</h3>
                <p class="text-muted" style="font-size:0.95rem;">${faq.a}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  },

  // --- CONTACT PAGE ---
  async renderContact() {
    const settings = await DBService.getSettings();
    const app = document.getElementById('app-content');
    app.innerHTML = `
      <section style="padding: 4rem 0;">
        <div class="container">
          <div class="text-center mb-4">
            <h1 style="font-size:2.5rem;">${I18nService.t('contact_heading')}</h1>
            <p class="text-muted">${I18nService.t('contact_subheading')}</p>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:3rem;">
            <div class="glass-panel" style="padding:2rem;">
              <h3 style="margin-bottom:1.5rem;">Get in Touch</h3>
              
              <div style="display:flex; flex-direction:column; gap:1.25rem;">
                <div>
                  <h4 style="font-size:0.9rem; color:var(--text-muted); text-transform:uppercase;">Shop Address</h4>
                  <p style="font-weight:600; margin-top:0.25rem;">${settings.address}</p>
                </div>

                <div>
                  <h4 style="font-size:0.9rem; color:var(--text-muted); text-transform:uppercase;">Support Call Phone</h4>
                  <p style="font-weight:600; margin-top:0.25rem;">${settings.phone} ${settings.altPhone ? `/ ${settings.altPhone}` : ''}</p>
                </div>

                <div style="background:rgba(16,185,129,0.1); border:1.5px solid rgba(16,185,129,0.35); padding:1rem 1.15rem; border-radius:10px;">
                  <h4 style="font-size:0.85rem; color:#059669; text-transform:uppercase; font-weight:800; margin:0;">💬 Direct WhatsApp Business</h4>
                  <p style="font-weight:800; font-size:1.05rem; margin-top:0.35rem; color:var(--text-main);">${settings.whatsappNumber || settings.phone}</p>
                  <a href="https://wa.me/${((settings.whatsappNumber || settings.phone || '').replace(/\D/g,'').length === 10 ? '91' : '') + (settings.whatsappNumber || settings.phone || '').replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${settings.shopName || 'Team 7'}! I would like to inquire about printing.`)}" target="_blank" class="btn btn-sm btn-success mt-2" style="display:inline-flex; align-items:center; gap:0.4rem; font-weight:700;">
                    💬 Open WhatsApp Chat
                  </a>
                </div>

                <div>
                  <h4 style="font-size:0.9rem; color:var(--text-muted); text-transform:uppercase;">Email Address</h4>
                  <p style="font-weight:600; margin-top:0.25rem;">${settings.email}</p>
                </div>

                <div>
                  <h4 style="font-size:0.9rem; color:var(--text-muted); text-transform:uppercase;">Business Hours</h4>
                  <p style="font-weight:600; margin-top:0.25rem;">${settings.businessHours}</p>
                </div>
              </div>
            </div>

            <div class="glass-panel" style="padding:2rem;">
              <h3 style="margin-bottom:1.5rem;">Send Us a Message</h3>

              <div class="form-group">
                <label class="form-label">Your Name</label>
                <input type="text" class="form-control" placeholder="Enter your name">
              </div>
              <div class="form-group">
                <label class="form-label">Email or Phone</label>
                <input type="text" class="form-control" placeholder="Enter email or mobile number">
              </div>
              <div class="form-group">
                <label class="form-label">Message</label>
                <textarea class="form-control" placeholder="Tell us about your bulk print requirements..."></textarea>
              </div>

              <button class="btn btn-primary w-full mt-2" onclick="window.NotificationService.showToast('Message sent! We will contact you shortly.', 'success')">Send Message</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }
};
