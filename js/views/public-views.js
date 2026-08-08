/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - PUBLIC VIEWS MODULE
   ========================================================================== */

import { DEFAULT_SERVICES, FAQS } from '../config/default-data.js';
import { AuthService } from '../services/auth-service.js';
import { DBService } from '../services/db-service.js';
import { PricingEngine } from '../services/pricing-engine.js';
import { StorageService } from '../services/storage-service.js';
import { NotificationService } from '../services/notification-service.js';
import { formatCurrency, getStatusBadgeHTML, formatDate, formatTime } from '../utils/formatters.js';

export const PublicViews = {
  // --- HOME PAGE ---
  async renderHome() {
    const settings = await DBService.getSettings();
    const app = document.getElementById('app-content');

    app.innerHTML = `
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-grid">
            <div class="animate-fade-in">
              <span class="badge badge-approved mb-2" style="font-size:0.85rem;">⚡ Instant Online Document Printing</span>
              <h1 class="hero-title">High Quality Printing Delivered Right To Your Doorstep</h1>
              <p class="hero-subtitle">Upload your documents, customize paper GSM, color & binding options, pay securely via Business UPI QR, and get your prints fast!</p>
              
              <div class="flex gap-2 items-center" style="flex-wrap:wrap;">
                <a href="#order" class="btn btn-lg btn-primary glow-effect">🖨️ Print Documents Now</a>
                <a href="#track" class="btn btn-lg btn-secondary">🔍 Track Your Order</a>
              </div>

              <div class="hero-stats">
                <div>
                  <div class="stat-number">15,000+</div>
                  <div class="stat-label">Orders Completed</div>
                </div>
                <div>
                  <div class="stat-number">100%</div>
                  <div class="stat-label">Quality Guaranteed</div>
                </div>
                <div>
                  <div class="stat-number">2 - 4 Hrs</div>
                  <div class="stat-label">Fast Pickup Time</div>
                </div>
              </div>
            </div>

            <!-- Hero Floating Card -->
            <div class="glass-panel hero-card glow-effect animate-fade-in">
              <h3 style="margin-bottom:1rem; font-size:1.4rem;">⚡ Quick Print Calculator</h3>
              
              <div class="form-group">
                <label class="form-label">Paper Size</label>
                <select class="form-select" id="quick-size">
                  <option value="A4">A4 Standard (210x297mm)</option>
                  <option value="A5">A5 Compact</option>
                  <option value="Legal">Legal Size</option>
                  <option value="A3">A3 Large Poster</option>
                </select>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                <div class="form-group">
                  <label class="form-label">Color Mode</label>
                  <select class="form-select" id="quick-color">
                    <option value="Black & White">Black & White</option>
                    <option value="Color">Full Color</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Pages</label>
                  <input type="number" class="form-control" id="quick-pages" value="20" min="1">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Binding Option</label>
                <select class="form-select" id="quick-binding">
                  <option value="None">No Binding</option>
                  <option value="Spiral">Spiral Binding (₹35)</option>
                  <option value="Soft">Soft Cover (₹65)</option>
                  <option value="Hard">Hard Book Bound (₹140)</option>
                </select>
              </div>

              <div style="background:var(--primary-light); padding:1rem; border-radius:12px; margin-top:1rem; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <span style="font-size:0.8rem; color:var(--text-muted);">Estimated Total</span>
                  <div style="font-size:1.5rem; font-weight:800; color:var(--primary);" id="quick-price-val">₹65.00</div>
                </div>
                <a href="#order" class="btn btn-sm btn-primary">Start Order →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section id="services-section" style="padding: 4rem 0; background-color: var(--bg-card); border-top: 1px solid var(--border-color);">
        <div class="container">
          <div class="text-center mb-4">
            <h2 style="font-size: 2.25rem;">Our Printing Services</h2>
            <p class="text-muted" style="max-width: 600px; margin: 0.5rem auto 0;">From project reports to hardbound books, we deliver high-precision print solutions.</p>
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
            <h2 style="font-size: 2.25rem;">How Ordering Works</h2>
            <p class="text-muted">4 simple steps to get your documents printed effortlessly.</p>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:2rem;">
            <div class="glass-panel" style="padding:1.75rem; text-align:center;">
              <div style="width:48px; height:48px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; margin:0 auto 1rem;">1</div>
              <h4>Upload Files</h4>
              <p class="text-muted" style="font-size:0.875rem; margin-top:0.5rem;">Drop PDF, Word, Excel, PowerPoint or Image files up to 200MB.</p>
            </div>
            <div class="glass-panel" style="padding:1.75rem; text-align:center;">
              <div style="width:48px; height:48px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; margin:0 auto 1rem;">2</div>
              <h4>Customize Options</h4>
              <p class="text-muted" style="font-size:0.875rem; margin-top:0.5rem;">Select paper size (A4, A3), GSM, B&W/Color, and binding type.</p>
            </div>
            <div class="glass-panel" style="padding:1.75rem; text-align:center;">
              <div style="width:48px; height:48px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; margin:0 auto 1rem;">3</div>
              <h4>UPI QR Payment</h4>
              <p class="text-muted" style="font-size:0.875rem; margin-top:0.5rem;">Scan Business UPI QR Code using GooglePay/PhonePe & submit UTR.</p>
            </div>
            <div class="glass-panel" style="padding:1.75rem; text-align:center;">
              <div style="width:48px; height:48px; background:var(--success); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; margin:0 auto 1rem;">4</div>
              <h4>Pickup or Delivery</h4>
              <p class="text-muted" style="font-size:0.875rem; margin-top:0.5rem;">Track order status online and collect your print package!</p>
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

      const quote = PricingEngine.calculateQuote({
        paperSize,
        colorMode,
        binding,
        copies: 1
      }, pages);

      const el = document.getElementById('quick-price-val');
      if (el) el.innerText = formatCurrency(quote.total);
    };

    ['quick-size', 'quick-color', 'quick-pages', 'quick-binding'].forEach(id => {
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
                <div class="wizard-step-tab active" id="tab-1">1. Upload &amp; Configure</div>
                <div class="wizard-step-tab" id="tab-2">2. Contact Details</div>
                <div class="wizard-step-tab" id="tab-3">3. UPI Payment</div>
              </div>

              <!-- Step 1: Upload Files -->
              <div id="step-1-content" class="glass-panel" style="padding:2rem;">
                <h3 style="margin-bottom:1rem;">Upload Documents</h3>
                <div style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.35); border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:1.25rem; font-size:0.875rem; display:flex; gap:0.6rem; align-items:flex-start;">
                  <span style="font-size:1.1rem; flex-shrink:0;">💡</span>
                  <span><b>Note:</b> Word documents (.doc / .docx), Excel, PowerPoint (PPT) and Image files are <b>not accepted</b>. Please <b>convert your Word / Excel / PPT / Image file to PDF</b> first, then upload the PDF here. Use <i>File → Save As → PDF</i> in Microsoft Word or Google Docs.</span>
                </div>
                <p class="text-muted" style="margin-bottom:1.5rem; font-size:0.9rem;">Accepted formats: <b>PDF only</b>. Max file size: 200MB.</p>

                <div class="dropzone" id="file-dropzone">
                  <div class="dropzone-icon">📁</div>
                  <h4 style="margin-bottom:0.25rem;">Drag & Drop your files here</h4>
                  <p class="text-muted" style="font-size:0.875rem; margin-bottom:1rem;">Only <b>PDF</b> files accepted &nbsp;•&nbsp; Max 200MB per file</p>
                  <button type="button" class="btn btn-sm btn-primary" id="btn-browse-trigger">📁 Browse Files from Device</button>
                </div>
                <input type="file" id="file-input" multiple accept=".pdf,application/pdf" style="display:none;" />

                <!-- File List with Per-File Print Options -->
                <div id="file-list-preview" style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;"></div>

                <div class="flex justify-between mt-4">
                  <div></div>
                  <button class="btn btn-primary" id="btn-to-step-2">Continue to Contact Details →</button>
                </div>
              </div>

              <!-- Step 2: Contact Info -->

              <div id="step-2-content" class="glass-panel" style="padding:2rem; display:none;">
                <h3 style="margin-bottom:1.5rem;">Customer Details</h3>

                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-control" id="cust-name" placeholder="Enter your full name" required>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
                  <div class="form-group">
                    <label class="form-label">Mobile Phone Number *</label>
                    <input type="tel" class="form-control" id="cust-phone" placeholder="10-digit mobile number" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email Address (Optional)</label>
                    <input type="email" class="form-control" id="cust-email" placeholder="email@example.com">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Delivery Zone / Area Selection *</label>
                  <select class="form-select" id="cust-delivery-zone" style="font-weight:600; color:var(--primary);">
                    ${Object.entries(pricing.deliveryZones || {}).map(([key, item]) => `
                      <option value="${key}">${item.label}</option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Delivery Address (Optional for Pickup)</label>
                  <textarea class="form-control" id="cust-address" placeholder="Enter full address if requesting doorstep delivery"></textarea>
                </div>

                <div class="flex justify-between mt-4">
                  <button class="btn btn-secondary" id="btn-back-to-step-1">← Back</button>
                  <button class="btn btn-primary" id="btn-to-step-3">Proceed to UPI Payment →</button>
                </div>
              </div>

              <!-- Step 3: UPI Payment -->
              <div id="step-3-content" class="glass-panel" style="padding:2rem; display:none;">
                <h3 style="margin-bottom:1rem;">Business UPI QR Payment</h3>
                <p class="text-muted" style="margin-bottom:1.5rem; font-size:0.9rem;">Scan the merchant QR code with Google Pay, PhonePe, Paytm or BHIM UPI to complete payment.</p>

                <div style="display:grid; grid-template-columns: 220px 1fr; gap:2rem; background:var(--bg-card); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg); margin-bottom:1.5rem;">
                  <div style="text-align:center;">
                    <div id="upi-qr-canvas-box" style="background:white; padding:10px; border-radius:12px; display:inline-block; border:1px solid #cbd5e1;">
                      <!-- QR Canvas rendered here -->
                      <div style="width:180px; height:180px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; border-radius:8px;">
                        <span style="font-size:3rem;">📱</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style="color:var(--primary); font-size:1.1rem; margin-bottom:0.35rem;">${settings.merchantName}</h4>
                    <p style="font-size:0.875rem; color:var(--text-muted);">UPI ID: <b style="color:var(--text-main);" id="merchant-upi-text">${settings.upiId}</b></p>
                    <p style="font-size:1.4rem; font-weight:800; color:var(--primary); margin:0.75rem 0;" id="qr-payable-amount">₹0.00</p>
                    
                    <div style="background:var(--primary-light); padding:0.75rem 1rem; border-radius:8px; font-size:0.825rem;">
                      💡 <b>Instructions:</b> Open any UPI App ➔ Scan QR ➔ Pay Exact Amount ➔ Copy the 12-digit UTR/Ref Number and paste below.
                    </div>
                  </div>
                </div>

                <!-- Payment Details Submission Form -->
                <div style="border-top:1px solid var(--border-color); padding-top:1.5rem;">
                  <h4 style="margin-bottom:1rem;">Submit Payment Verification</h4>

                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
                    <div class="form-group">
                      <label class="form-label">12-Digit UTR / UPI Ref Number *</label>
                      <input type="text" class="form-control" id="pay-utr" placeholder="E.g., 329817264512" maxlength="18" required>
                    </div>

                    <div class="form-group">
                      <label class="form-label">Payer Name / UPI Account Name *</label>
                      <input type="text" class="form-control" id="pay-name" placeholder="Name shown in UPI app" required>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Upload Payment Screenshot (Optional but speeds up verification)</label>
                    <input type="file" class="form-control" id="pay-screenshot" accept="image/*">
                  </div>

                  <div class="flex justify-between mt-4">
                    <button class="btn btn-secondary" id="btn-back-to-step-2">← Back</button>
                    <button class="btn btn-success btn-lg glow-effect" id="btn-submit-final-order">🚀 Submit Order &amp; Payment</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Dynamic Price Box -->
            <div class="price-summary-box glow-effect">
              <h3 style="margin-bottom:1rem; font-size:1.25rem;">Order Price Summary</h3>

              <div id="summary-file-count" style="font-size:0.875rem; color:var(--text-muted); margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
                No files uploaded yet.
              </div>

              <div class="price-row" id="row-print-cost">
                <span id="label-print-cost">Printing:</span>
                <span id="price-paper">₹0.00</span>
              </div>
              <div class="price-row" id="row-color" style="display:none;">
                <span>Color Printing Extra:</span>
                <span id="price-color">₹0.00</span>
              </div>
              <div class="price-row" id="row-binding" style="display:none;">
                <span>Binding Cost:</span>
                <span id="price-binding">₹0.00</span>
              </div>
              <div class="price-row" id="row-lamination" style="display:none;">
                <span>Lamination:</span>
                <span id="price-lamination">₹0.00</span>
              </div>
              <div class="price-row" id="row-delivery" style="display:none;">
                <span>Delivery Charge:</span>
                <span id="price-delivery">₹0.00</span>
              </div>

              <div class="price-row total-row">
                <span>Grand Total:</span>
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
      state.files.forEach(f => {
        const q = PricingEngine.calculateQuote(f.options, f.pages);
        totalPaper += q.paperCost;
        totalColor += q.colorCost;
        totalBinding += q.bindingCost;
        totalLamination += q.laminationCost;
      });

      const deliveryZones = pricing.deliveryZones || {};
      const deliveryFee = Number((deliveryZones[selectedZoneKey]?.fee || 0).toFixed(2));

      const subtotal = totalPaper + totalColor + totalBinding + totalLamination + deliveryFee;
      const total = subtotal;
      const quote = { paperCost: totalPaper, colorCost: totalColor, bindingCost: totalBinding, laminationCost: totalLamination, deliveryFee, deliveryZone: selectedZoneKey, gst: 0, total };

      const paperEl = document.getElementById('price-paper');
      if (paperEl) paperEl.innerText = formatCurrency(totalPaper);

      const colorRow = document.getElementById('row-color');
      if (colorRow) colorRow.style.display = totalColor > 0 ? '' : 'none';
      const colorEl = document.getElementById('price-color');
      if (colorEl) colorEl.innerText = formatCurrency(totalColor);

      const bindingRow = document.getElementById('row-binding');
      if (bindingRow) bindingRow.style.display = totalBinding > 0 ? '' : 'none';
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

      const fileCountText = document.getElementById('summary-file-count');
      if (fileCountText) {
        const totalPages = state.files.reduce((a, f) => a + f.pages, 0);
        fileCountText.innerText = state.files.length > 0
          ? `${state.files.length} file(s) • ~${totalPages} total page(s)`
          : 'No files uploaded yet.';
      }
      return quote;
    };

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
    const defaultFileOptions = () => ({
      paperSize: Object.keys(pricing.paperSizes)[0] || 'A4',
      paperQuality: Object.keys(pricing.paperQualities)[0] || '70GSM',
      colorMode: 'Black & White',
      printSide: 'Single',
      orientation: 'Portrait',
      copies: 1,
      binding: 'None',
      lamination: 'No',
      notes: ''
    });

    async function handleFiles(fileList) {
      for (let file of Array.from(fileList)) {
        if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
          NotificationService.showToast(`${file.name} is not a PDF file. Only PDF accepted!`, 'error');
          continue;
        }
        if (file.size > 200 * 1024 * 1024) {
          NotificationService.showToast(`File ${file.name} exceeds 200MB limit!`, 'error');
          continue;
        }
        try {
          const estPages = await StorageService.estimatePdfPages(file);
          const uploaded = await StorageService.uploadFile(file, 'customer_docs');
          state.files.push({
            name: file.name,
            size: uploaded.size || 'N/A',
            url: uploaded.url || '',
            pages: estPages || 1,
            options: defaultFileOptions()
          });
          NotificationService.showToast(`Uploaded ${file.name}`, 'success');
        } catch (err) {
          console.error('File processing error:', err);
          NotificationService.showToast(`Failed to process ${file.name}`, 'error');
        }
      }
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

      container.innerHTML = state.files.map((f, idx) => `
        <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; overflow:hidden;">
          <!-- File Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.85rem 1rem; background:var(--primary-light); cursor:pointer;" onclick="window.toggleFileOptions(${idx})">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <span style="font-size:1.3rem;">📄</span>
              <div>
                <div style="font-weight:700; font-size:0.9rem;">${f.name}</div>
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
                <label class="form-label" style="font-size:0.78rem;">Paper Size</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'paperSize',this.value)">
                  ${Object.entries(pricing.paperSizes).map(([k,v]) => `<option value="${k}" ${f.options.paperSize===k?'selected':''}>${v.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">Paper Quality</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'paperQuality',this.value)">
                  ${Object.entries(pricing.paperQualities).map(([k,v]) => `<option value="${k}" ${f.options.paperQuality===k?'selected':''}>${v.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">Color Mode</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'colorMode',this.value)">
                  <option value="Black & White" ${f.options.colorMode==='Black & White'?'selected':''}>Black &amp; White</option>
                  <option value="Color" ${f.options.colorMode==='Color'?'selected':''}>Full Color</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">Print Side</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'printSide',this.value)">
                  <option value="Single" ${f.options.printSide==='Single'?'selected':''}>Single Side</option>
                  <option value="Double" ${f.options.printSide==='Double'?'selected':''}>Double Side</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">Orientation</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'orientation',this.value)">
                  <option value="Portrait" ${f.options.orientation==='Portrait'?'selected':''}>Portrait</option>
                  <option value="Landscape" ${f.options.orientation==='Landscape'?'selected':''}>Landscape</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">Copies</label>
                <input type="number" class="form-control" style="font-size:0.82rem;" min="1" max="500" value="${f.options.copies}" onchange="window.updateFileOption(${idx},'copies',parseInt(this.value)||1)">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">Binding</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'binding',this.value)">
                  <option value="None" ${f.options.binding==='None'?'selected':''}>No Binding</option>
                  <option value="Spiral" ${f.options.binding==='Spiral'?'selected':''}>Spiral (₹35)</option>
                  <option value="Soft" ${f.options.binding==='Soft'?'selected':''}>Soft Cover (₹65)</option>
                  <option value="Hard" ${f.options.binding==='Hard'?'selected':''}>Hard Bound (₹140)</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.78rem;">Lamination</label>
                <select class="form-select" style="font-size:0.82rem;" onchange="window.updateFileOption(${idx},'lamination',this.value)">
                  <option value="No" ${f.options.lamination==='No'?'selected':''}>No Lamination</option>
                  <option value="Yes" ${f.options.lamination==='Yes'?'selected':''}>Thermal (₹12/pg)</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:0.78rem;">Special Instructions for this file</label>
              <input type="text" class="form-control" style="font-size:0.82rem;" placeholder="E.g., Print page 1 in color only..." value="${f.options.notes}" oninput="window.updateFileOption(${idx},'notes',this.value)">
            </div>
          </div>
        </div>
      `).join('');
    }

    window.toggleFileOptions = (idx) => {
      const panel = document.getElementById(`file-options-${idx}`);
      const label = document.getElementById(`file-toggle-label-${idx}`);
      if (!panel) return;
      const isHidden = panel.style.display === 'none';
      panel.style.display = isHidden ? '' : 'none';
      if (label) label.textContent = isHidden ? '⚙️ Configure ▲' : '⚙️ Configure ▼';
    };

    window.updateFileOption = (idx, key, value) => {
      if (state.files[idx]) {
        state.files[idx].options[key] = value;
        updateCalculations();
      }
    };

    window.removeWizardFile = (index) => {
      state.files.splice(index, 1);
      state.totalPages = state.files.reduce((acc, f) => acc + f.pages, 0) || 1;
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
        btnSubmit.innerHTML = '⏳ Submitting Order & Payment...';

        try {
          let screenshotUrl = '';
          if (screenshotInput && screenshotInput.files && screenshotInput.files[0]) {
            try {
              const uploaded = await StorageService.uploadFile(screenshotInput.files[0], 'receipts');
              screenshotUrl = uploaded.url || '';
            } catch (err) {
              console.warn('Screenshot processing failed, proceeding without screenshot:', err);
            }
          }

          const quote = updateCalculations();

          const newOrder = await DBService.createOrder({
            customerName: custName,
            customerPhone: custPhone,
            customerEmail: custEmail,
            customerAddress: custAddress,
            files: state.files.map(f => ({ name: f.name, size: f.size, url: f.url, pages: f.pages, options: f.options })),
            options: state.files.length > 0 ? state.files[0].options : {},
            pricing: quote,
            payment: {
              method: 'UPI QR',
              utr: utr,
              payerName: payerName,
              screenshotUrl: screenshotUrl,
              status: 'Waiting Verification'
            }
          });

          NotificationService.showToast(`Order ${newOrder.id} submitted successfully!`, 'success');
          window.location.hash = `#track?id=${newOrder.id}`;
        } catch (err) {
          console.error('Order creation error:', err);
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
            <h1 style="font-size:2.5rem;">Track Your Order</h1>
            <p class="text-muted">Enter your Order ID (e.g. ORD-2026-1001) or Mobile Phone Number.</p>
          </div>

          <!-- Search Box -->
          <div class="glass-panel" style="padding:1.5rem; margin-bottom:2rem;">
            <div style="display:flex; gap:0.75rem;">
              <input type="text" class="form-control" id="track-search-input" placeholder="Enter Order ID or Mobile Number..." value="${paramId}">
              <button class="btn btn-primary" id="btn-perform-track">Search Order</button>
            </div>
          </div>

          <!-- Search Results Container -->
          <div id="track-results-container"></div>
        </div>
      </section>
    `;

    const searchAction = async () => {
      const val = document.getElementById('track-search-input').value.trim();
      const container = document.getElementById('track-results-container');

      if (!val) {
        container.innerHTML = `<div class="text-center text-muted">Please enter a search term above.</div>`;
        return;
      }

      const results = await DBService.searchOrders(val);
      if (results.length === 0) {
        container.innerHTML = `
          <div class="glass-panel text-center" style="padding:2.5rem;">
            <div style="font-size:3rem;">🔍</div>
            <h3>No orders found</h3>
            <p class="text-muted" style="margin-top:0.5rem;">We couldn't find any order matching "${val}". Please check the ID or Phone number.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = results.map(order => `
        <div class="glass-panel" style="padding:2rem; margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.25rem;">
            <div>
              <h3 style="color:var(--primary); font-size:1.4rem;">${order.id}</h3>
              <p class="text-muted" style="font-size:0.85rem;">Placed on: ${formatDate(order.createdAt)} at ${formatTime(order.createdAt)}</p>
            </div>
            <div>
              ${getStatusBadgeHTML(order.status)}
            </div>
          </div>

          <!-- Order Status Progress Flow Visualizer -->
          <div style="margin:1.5rem 0;">
            <h4 style="font-size:0.9rem; color:var(--text-muted); margin-bottom:0.75rem; text-transform:uppercase;">Order Progression Timeline:</h4>
            <div class="timeline">
              <div class="timeline-item ${order.status !== 'Pending Payment' ? 'completed' : 'active'}">
                <div class="timeline-icon">✓</div>
                <div class="timeline-content">
                  <div style="font-weight:700;">Waiting Verification</div>
                  <div style="font-size:0.8rem; color:var(--text-muted);">Payment submitted via UPI UTR: ${order.payment?.utr || 'N/A'}</div>
                </div>
              </div>

              <div class="timeline-item ${['Payment Approved', 'Printing', 'Quality Check', 'Ready for Pickup', 'Completed'].includes(order.status) ? 'completed' : ''}">
                <div class="timeline-icon">⚙️</div>
                <div class="timeline-content">
                  <div style="font-weight:700;">Payment Approved & Printing</div>
                  <div style="font-size:0.8rem; color:var(--text-muted);">Print queue processing</div>
                </div>
              </div>

              <div class="timeline-item ${['Ready for Pickup', 'Completed'].includes(order.status) ? 'completed' : ''}">
                <div class="timeline-icon">📦</div>
                <div class="timeline-content">
                  <div style="font-weight:700;">Ready for Pickup / Delivery</div>
                  <div style="font-size:0.8rem; color:var(--text-muted);">Est. Ready: ${formatDate(order.estimatedReady)} at ${formatTime(order.estimatedReady)}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary info -->
          <div style="background:var(--bg-card); padding:1rem; border-radius:8px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-size:0.85rem; color:var(--text-muted);">Customer:</span> <b>${order.customerName}</b> (${order.customerPhone})
              <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.2rem;">${order.files?.length || 0} document(s) attached • ${order.options?.paperSize} (${order.options?.colorMode})</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.85rem; color:var(--text-muted);">Total Amount:</span>
              <div style="font-size:1.3rem; font-weight:800; color:var(--primary);">${formatCurrency(order.pricing?.total)}</div>
            </div>
          </div>
        </div>
      `).join('');
    };

    document.getElementById('btn-perform-track').onclick = searchAction;
    if (paramId) searchAction();
  },

  // --- FAQ PAGE ---
  async renderFAQ() {
    const app = document.getElementById('app-content');
    app.innerHTML = `
      <section style="padding: 4rem 0;">
        <div class="container" style="max-width:800px;">
          <div class="text-center mb-4">
            <h1 style="font-size:2.5rem;">Frequently Asked Questions</h1>
            <p class="text-muted">Find quick answers to common questions regarding document printing, payment, and delivery.</p>
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
            <h1 style="font-size:2.5rem;">Contact ${settings.shopName}</h1>
            <p class="text-muted">Have a special bulk print inquiry? Reach out to our customer support team.</p>
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
                  <h4 style="font-size:0.9rem; color:var(--text-muted); text-transform:uppercase;">Phone Numbers</h4>
                  <p style="font-weight:600; margin-top:0.25rem;">${settings.phone} / ${settings.altPhone}</p>
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
