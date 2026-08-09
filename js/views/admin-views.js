/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - ADMIN VIEWS MODULE
   ========================================================================== */

import { AuthService } from '../services/auth-service.js';
import { DBService } from '../services/db-service.js';
import { StorageService } from '../services/storage-service.js';
import { PricingEngine } from '../services/pricing-engine.js';
import { NotificationService } from '../services/notification-service.js';
import { ChartsEngine } from '../components/charts.js';
import { InvoiceComponent } from '../components/invoice.js';
import { ModalComponent } from '../components/modal.js';
import { formatCurrency, getStatusBadgeHTML, formatDate, formatTime } from '../utils/formatters.js';
import { exportToCSV } from '../utils/export-excel.js';

export const AdminViews = {
  // --- ADMIN LOGIN PAGE ---
  renderLogin() {
    const app = document.getElementById('app-content');
    app.innerHTML = `
      <section style="min-height:80vh; display:flex; align-items:center; justify-content:center; padding:2.5rem 1rem;">
        <div class="glass-panel glow-effect" style="width:100%; max-width:440px; padding:2.5rem; border-radius:16px;">
          <div class="text-center mb-4">
            <div class="nav-brand-logo" style="margin:0 auto 1rem; width:58px; height:58px; font-size:1.8rem; background:linear-gradient(135deg, var(--primary), var(--accent)); color:white; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:800;">T7</div>
            <h2 style="font-size:1.85rem; font-weight:800;">Admin Portal</h2>
            <p class="text-muted" style="font-size:0.875rem; margin-top:0.25rem;">Management Portal Sign In</p>
          </div>

          <form id="admin-login-form">
            <div class="form-group mb-3">
              <label class="form-label" style="font-weight:600;">Admin Username / Email</label>
              <input type="text" class="form-control" id="login-email" value="" placeholder="Enter Username / Email" required autofocus>
            </div>

            <div class="form-group mb-4">
              <label class="form-label" style="font-weight:600;">Password</label>
              <input type="password" class="form-control" id="login-password" value="" placeholder="Enter Password" required>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full glow-effect" style="font-weight:700;">Sign In to Admin Dashboard ➔</button>
          </form>
        </div>
      </section>
    `;

    document.getElementById('admin-login-form').onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const res = await AuthService.loginAdmin(email, password);
      if (res.success) {
        NotificationService.showToast('Welcome back, Administrator!', 'success');
        window.location.hash = '#admin-dashboard';
      } else {
        NotificationService.showToast(res.message, 'error');
      }
    };
  },

  // Helper Layout Wrapper for Admin Portal
  async renderAdminLayout(activeTab, contentHTML) {
    const user = AuthService.getCurrentUser();
    const settings = await DBService.getSettings();
    const brandLogoText = (settings.shopName || 'SHOP').slice(0, 2).toUpperCase();
    const brandName = settings.shopName || 'Admin Portal';
    const app = document.getElementById('app-content');

    if (!app) return;

    app.innerHTML = `
      <div class="dashboard-wrapper">
        <!-- Sidebar Navigation -->
        <aside class="sidebar" id="admin-sidebar">
          <div class="sidebar-header">
            <div class="nav-brand-logo" style="width:34px; height:34px; font-size:1.1rem;">${brandLogoText}</div>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${brandName}">${brandName}</span>
          </div>

          <div class="sidebar-nav">
            <a href="#admin-dashboard" class="sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}">
              <span class="sidebar-link-icon">📊</span> Overview Dashboard
            </a>
            <a href="#admin-orders" class="sidebar-link ${activeTab === 'orders' ? 'active' : ''}">
              <span class="sidebar-link-icon">📄</span> Order Pipeline
            </a>
            <a href="#admin-pricing" class="sidebar-link ${activeTab === 'pricing' ? 'active' : ''}">
              <span class="sidebar-link-icon">🏷️</span> Price Manager
            </a>
            <a href="#admin-catalog" class="sidebar-link ${activeTab === 'catalog' ? 'active' : ''}">
              <span class="sidebar-link-icon">📚</span> Service Catalog (CRUD)
            </a>
            <a href="#admin-customers" class="sidebar-link ${activeTab === 'customers' ? 'active' : ''}">
              <span class="sidebar-link-icon">👥</span> Customer Directory
            </a>
            <a href="#admin-reports" class="sidebar-link ${activeTab === 'reports' ? 'active' : ''}">
              <span class="sidebar-link-icon">📈</span> Reports & Analytics
            </a>
            <a href="#admin-settings" class="sidebar-link ${activeTab === 'settings' ? 'active' : ''}">
              <span class="sidebar-link-icon">⚙️</span> Shop Settings
            </a>
          </div>

          <div class="sidebar-footer">
            <button class="btn btn-sm btn-outline w-full" id="admin-logout-btn">🚪 Sign Out</button>
          </div>
        </aside>

        <!-- Main Dashboard Body -->
        <main class="dashboard-main">
          <header class="dashboard-topbar">
            <div style="font-weight:700; font-size:1.1rem; font-family:'Outfit', sans-serif;">
              ${settings.shopName}
            </div>

            <div style="display:flex; align-items:center; gap:1rem;">
              <span class="badge badge-approved">● Live System</span>
              <div style="font-size:0.875rem; font-weight:600;">👤 ${user?.displayName || 'Administrator'}</div>
            </div>
          </header>

          <div class="dashboard-content">
            ${contentHTML}
          </div>
        </main>
      </div>
    `;

    document.getElementById('admin-logout-btn').onclick = async () => {
      await AuthService.logout();
      NotificationService.showToast('Signed out successfully.', 'info');
      window.location.hash = '#home';
    };
  },

  // --- OVERVIEW DASHBOARD ---
  async renderDashboard() {
    const orders = await DBService.getOrders();

    // Metrics Calculations (Excludes Rejected orders from Net Revenue / Gain Amount)
    const validOrders = orders.filter(o => o.status !== 'Rejected');
    const rejectedOrders = orders.filter(o => o.status === 'Rejected');

    const todayRevenue = validOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
    const pendingVerification = orders.filter(o => o.status === 'Waiting Verification').length;
    const printingQueue = orders.filter(o => o.status === 'Printing').length;
    const rejectedCount = rejectedOrders.length;

    const html = `
      <!-- Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon" style="background:rgba(99,102,241,0.15); color:var(--primary);">💰</div>
          <div>
            <div class="metric-val">${formatCurrency(todayRevenue)}</div>
            <div class="metric-title">Net Revenue (Gain Amount)</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon" style="background:rgba(59,130,246,0.15); color:#2563eb;">📄</div>
          <div>
            <div class="metric-val">${validOrders.length}</div>
            <div class="metric-title">Valid Orders ${rejectedCount > 0 ? `<span style="font-size:0.75rem; color:#ef4444;">(${rejectedCount} rejected)</span>` : ''}</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon" style="background:rgba(245,158,11,0.15); color:#d97706;">⏳</div>
          <div>
            <div class="metric-val" style="color:#d97706;">${pendingVerification}</div>
            <div class="metric-title">Pending Verification</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon" style="background:rgba(139,92,246,0.15); color:#7c3aed;">🖨️</div>
          <div>
            <div class="metric-val" style="color:#7c3aed;">${printingQueue}</div>
            <div class="metric-title">Printing Queue</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h3>📈 Sales Revenue Trend</h3>
            <span class="text-muted" style="font-size:0.8rem;">Weekly Overview</span>
          </div>
          <div id="chart-revenue-container" class="chart-canvas-container"></div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>📊 Print Services breakdown</h3>
          </div>
          <div id="chart-services-container" style="height:240px;"></div>
        </div>
      </div>

      <!-- Recent Orders Table -->
      <div class="table-card">
        <div class="table-toolbar">
          <h3>Recent Orders</h3>
          <a href="#admin-orders" class="btn btn-sm btn-outline">View All Pipeline →</a>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>PDF Documents</th>
                <th>Specs & Copies</th>
                <th>Amount</th>
                <th>Payment UTR</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${orders.slice(0, 5).map(o => {
      const filesList = (o.files && o.files.length > 0) ? o.files : (o.file ? [o.file] : []);
      return `
                <tr>
                  <td><b>${o.id}</b></td>
                  <td>${o.customerName || 'Customer'}<br><span class="text-muted" style="font-size:0.8rem;">${o.customerPhone || 'N/A'}</span></td>
                  <td>
                    ${filesList.map((f, idx) => `
                      <div style="font-size:0.8rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;" title="${f.name || 'Document.pdf'}">
                        📄 ${f.name || `Document_${idx + 1}.pdf`} <span style="font-size:0.7rem; color:var(--text-muted);">(${f.pages || 1} pgs)</span>
                      </div>
                    `).join('')}
                  </td>
                  <td>
                    ${filesList.map((f, idx) => `
                      <div style="font-size:0.75rem;">
                        ${filesList.length > 1 ? `<b>Doc ${idx + 1}:</b> ` : ''}${(f.options || o.options)?.paperSize || 'A4'} • ${(f.options || o.options)?.colorMode || 'B&W'} • ${(f.options || o.options)?.copies || 1} copy
                      </div>
                    `).join('')}
                  </td>
                  <td><b>${formatCurrency(o.pricing?.total)}</b></td>
                  <td><code>${o.payment?.utr || 'N/A'}</code></td>
                  <td>${getStatusBadgeHTML(o.status)}</td>
                  <td>
                    <button class="btn btn-sm btn-secondary" onclick="window.location.hash='#admin-orders?id=${o.id}'">Inspect</button>
                  </td>
                </tr>
              `;
    }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    await this.renderAdminLayout('dashboard', html);

    // Render Charts
    setTimeout(() => {
      ChartsEngine.renderRevenueLineChart('chart-revenue-container');
      ChartsEngine.renderBarChart('chart-services-container');
    }, 100);
  },

  // --- ORDERS MANAGEMENT PIPELINE ---
  async renderOrders(queryStr = '') {
    const orders = await DBService.getOrders();
    const settings = await DBService.getSettings();

    const paramId = new URLSearchParams(queryStr).get('id') || '';

    // Check if viewing single printable invoice
    const paramInvoice = new URLSearchParams(queryStr).get('invoice');
    if (paramInvoice) {
      const order = orders.find(o => o.id === paramInvoice);
      if (order) {
        document.getElementById('app-content').innerHTML = InvoiceComponent.renderHTML(order, settings);
        return;
      }
    }

    const html = `
      <div class="table-card mb-4">
        <div class="table-toolbar" style="flex-direction:column; align-items:stretch; gap:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
              <h3 style="margin:0;">Order Management Pipeline (<span id="pipeline-total-count">${orders.length}</span> orders)</h3>
              <p class="text-muted" style="font-size:0.85rem; margin-top:0.25rem;">Live order processing queue & status workflow management</p>
            </div>
            
            <div style="display:flex; gap:0.75rem; align-items:center;">
              <input type="text" class="form-control" id="order-search-field" placeholder="Search ID, Name, Phone, UTR..." value="${paramId}">
              <select class="form-select" id="order-status-filter" style="width:200px;">
                <option value="">All Statuses</option>
                <option value="Waiting Verification">⏳ Waiting Verification</option>
                <option value="Payment Approved">💳 Payment Approved</option>
                <option value="Printing">🖨️ Printing</option>
                <option value="Ready for Pickup">📦 Ready for Pickup</option>
                <option value="Completed">✅ Completed</option>
                <option value="Rejected">❌ Rejected</option>
              </select>
            </div>
          </div>

          <!-- Quick Status Filter Pills Bar -->
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; border-top:1px solid var(--border-color); padding-top:0.85rem;" id="pipeline-status-pills">
            <button class="btn btn-sm btn-outline active-pill" id="pill-all" onclick="window.filterPipelineByPill('')">All (<span id="count-all">${orders.length}</span>)</button>
            <button class="btn btn-sm btn-outline" id="pill-waiting" onclick="window.filterPipelineByPill('Waiting Verification')">⏳ Waiting (<span id="count-waiting">${orders.filter(o => o.status === 'Waiting Verification').length}</span>)</button>
            <button class="btn btn-sm btn-outline" id="pill-approved" onclick="window.filterPipelineByPill('Payment Approved')">💳 Approved (<span id="count-approved">${orders.filter(o => o.status === 'Payment Approved').length}</span>)</button>
            <button class="btn btn-sm btn-outline" id="pill-printing" onclick="window.filterPipelineByPill('Printing')">🖨️ Printing (<span id="count-printing">${orders.filter(o => o.status === 'Printing').length}</span>)</button>
            <button class="btn btn-sm btn-outline" id="pill-ready" onclick="window.filterPipelineByPill('Ready for Pickup')">📦 Ready (<span id="count-ready">${orders.filter(o => o.status === 'Ready for Pickup').length}</span>)</button>
            <button class="btn btn-sm btn-outline" id="pill-completed" onclick="window.filterPipelineByPill('Completed')">✅ Completed (<span id="count-completed">${orders.filter(o => o.status === 'Completed').length}</span>)</button>
            <button class="btn btn-sm btn-outline" id="pill-rejected" onclick="window.filterPipelineByPill('Rejected')">❌ Rejected (<span id="count-rejected">${orders.filter(o => o.status === 'Rejected').length}</span>)</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="orders-main-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Info</th>
                <th>Delivery Area & Address</th>
                <th>Files (${orders.reduce((acc, o) => acc + (o.files?.length || 1), 0)} Total PDFs)</th>
                <th style="background:rgba(59,130,246,0.1); color:var(--primary); font-weight:800; font-size:0.9rem;">📋 Specs & Copies</th>
                <th>Amount</th>
                <th>UTR Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${orders.length === 0 ? `
                <tr>
                  <td colspan="9" class="text-center text-muted" style="padding:3.5rem;">
                    <div style="font-size:3rem; margin-bottom:0.5rem;">📄</div>
                    <h4>No Orders in Pipeline Yet</h4>
                    <p style="font-size:0.875rem; margin-top:0.25rem;">Orders submitted online by customers will automatically show up here live.</p>
                    <a href="#order" class="btn btn-sm btn-primary mt-3">+ Place Test Order</a>
                  </td>
                </tr>
              ` : orders.map(o => {
      const filesList = (o.files && o.files.length > 0) ? o.files : (o.file ? [o.file] : []);
      return `
                <tr id="order-row-${o.id}">
                  <td>
                    <b>${o.id}</b>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${formatDate(o.createdAt)}</div>
                  </td>
                  <td>
                    <b>${o.customerName || 'Customer'}</b><br>
                    <span style="font-size:0.825rem; color:var(--text-muted);">${o.customerPhone || 'N/A'}</span>
                  </td>
                  <td>
                    <div style="font-weight:700; font-size:0.825rem; color:var(--primary);">
                      ${(o.pricing?.deliveryFee && o.pricing.deliveryFee > 0)
          ? `🚚 ${o.pricing?.deliveryZone || 'Doorstep Delivery'} (+${formatCurrency(o.pricing.deliveryFee)})`
          : '🏪 Store Pickup (Free)'}
                    </div>
                    <div style="font-size:0.775rem; color:var(--text-muted); margin-top:0.25rem; max-width:200px;" title="${o.customerAddress || 'No address provided (Store Pickup)'}">
                      📍 ${o.customerAddress || 'Self Pickup at Shop'}
                    </div>
                  </td>
                  <td>
                    ${filesList.map((f, fIdx) => `
                      <div style="margin-bottom:0.5rem; background:var(--bg-card); padding:0.4rem 0.6rem; border-radius:6px; border:1px solid var(--border-color);">
                        <div style="font-size:0.8rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;" title="${f.name || 'Document.pdf'}">📄 ${f.name || `Document_${fIdx + 1}.pdf`} <span style="font-size:0.7rem; color:var(--text-muted);">(${f.pages || 1} pgs)</span></div>
                        <div style="display:flex; gap:0.35rem; margin-top:0.25rem;">
                          <button class="btn btn-sm btn-outline" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="window.previewOrderFile('${o.id}', ${fIdx})">👁️ Preview</button>
                          <button class="btn btn-sm btn-primary" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="window.downloadOrderFile('${o.id}', ${fIdx})">📥 Download</button>
                        </div>
                      </div>
                    `).join('')}
                  </td>
                  <td style="min-width:230px;">
                    ${filesList.map((f, fIdx) => {
            const opts = f.options || o.options || {};
            const paperSize = opts.paperSize || 'A4';
            const paperQuality = opts.paperQuality || '70 GSM';
            const copies = opts.copies || 1;
            const colorMode = opts.colorMode || 'B&W';
            const binding = opts.binding && opts.binding !== 'None' ? opts.binding : null;
            const lamination = opts.lamination && opts.lamination !== 'No' ? opts.lamination : null;

            let colorBadge = '';
            if (colorMode === 'Custom Split') {
              colorBadge = `<span style="background:rgba(16,185,129,0.18); color:#059669; font-weight:700; font-size:0.78rem; padding:0.18rem 0.5rem; border-radius:6px; border:1px solid rgba(16,185,129,0.35);">🎨 Color Pgs: ${opts.colorPageRange || 'Selected'}</span>`;
            } else if (colorMode === 'Color') {
              colorBadge = `<span style="background:rgba(16,185,129,0.18); color:#059669; font-weight:700; font-size:0.78rem; padding:0.18rem 0.5rem; border-radius:6px; border:1px solid rgba(16,185,129,0.35);">🎨 Full Color</span>`;
            } else {
              colorBadge = `<span style="background:var(--bg-body); color:var(--text-main); font-weight:700; font-size:0.78rem; padding:0.18rem 0.5rem; border-radius:6px; border:1px solid var(--border-color);">⬛ B&W</span>`;
            }

            const rangeBadge = opts.pageRange && opts.pageRange !== 'All'
              ? `<span style="background:rgba(59,130,246,0.15); color:#2563eb; font-weight:700; font-size:0.78rem; padding:0.18rem 0.5rem; border-radius:6px;">📄 Pgs: ${opts.pageRange}</span>`
              : '';

            return `
                      <div style="margin-bottom:0.5rem; background:rgba(59,130,246,0.06); border:1.5px solid rgba(59,130,246,0.22); padding:0.65rem 0.75rem; border-radius:10px; box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                        <div style="font-size:0.9rem; font-weight:800; color:var(--text-main); display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                          <span>${filesList.length > 1 ? `Doc ${fIdx + 1}: ` : ''}📋 ${paperSize} <span style="font-weight:600; font-size:0.8rem; color:var(--text-muted);">(${paperQuality})</span></span>
                          <span style="background:var(--primary); color:#ffffff; font-weight:900; font-size:0.82rem; padding:0.2rem 0.6rem; border-radius:12px; white-space:nowrap; box-shadow:0 2px 4px rgba(59,130,246,0.25);">
                            ⚡ ${copies} ${copies > 1 ? 'Copies' : 'Copy'}
                          </span>
                        </div>

                        <div style="display:flex; gap:0.4rem; flex-wrap:wrap; align-items:center; margin-top:0.35rem;">
                          ${colorBadge}
                          ${rangeBadge}
                          ${binding ? `<span style="background:rgba(139,92,246,0.15); color:#6d28d9; font-weight:700; font-size:0.78rem; padding:0.18rem 0.5rem; border-radius:6px;">📘 ${binding} Binding</span>` : ''}
                          ${lamination ? `<span style="background:rgba(245,158,11,0.18); color:#b45309; font-weight:700; font-size:0.78rem; padding:0.18rem 0.5rem; border-radius:6px;">✨ ${lamination} Lamination</span>` : ''}
                        </div>
                      </div>
                      `;
          }).join('')}
                  </td>
                  <td><b>${formatCurrency(o.pricing?.total)}</b></td>
                  <td>
                    <code>${o.payment?.utr || 'N/A'}</code><br>
                    <button class="btn btn-sm btn-outline" style="font-size:0.7rem; padding:0.2rem 0.5rem; margin-top:0.35rem;" onclick="window.viewOrderScreenshot('${o.id}')">🖼️ View Screenshot</button>
                  </td>
                  <td>
                    ${(() => {
          const isLocked = o.isStatusLocked || o.status === 'Completed' || o.status === 'Rejected';
          const isComp = o.status === 'Completed';
          if (isLocked) {
            return `
                        <div id="status-cell-container-${o.id}" style="display:flex; flex-direction:column; gap:0.25rem;">
                          <span style="background:${isComp ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.15)'}; color:${isComp ? '#059669' : '#dc2626'}; font-weight:800; font-size:0.8rem; padding:0.35rem 0.6rem; border-radius:8px; border:1.5px solid ${isComp ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.35)'}; white-space:nowrap; display:inline-flex; align-items:center; gap:0.3rem;">
                            🔒 ${isComp ? '✅ Completed (Confirmed)' : '❌ Rejected (Confirmed)'}
                          </span>
                          <button class="btn btn-sm btn-link" style="font-size:0.7rem; color:var(--text-muted); padding:0; text-decoration:underline; text-align:left; border:none; background:none; cursor:pointer;" onclick="window.unlockOrderStatus('${o.id}')" title="Unlock status if edit is required">
                            🔓 Unlock Status
                          </button>
                        </div>
                        `;
          }
          return `
                      <div id="status-cell-container-${o.id}">
                        <select class="form-select" style="font-size:0.8rem; padding:0.35rem 0.5rem; font-weight:600;" onchange="window.updateOrderStatusFromTable('${o.id}', this.value)" id="select-status-${o.id}">
                          <option value="Waiting Verification" ${o.status === 'Waiting Verification' ? 'selected' : ''}>⏳ Waiting Verification</option>
                          <option value="Payment Approved" ${o.status === 'Payment Approved' ? 'selected' : ''}>💳 Payment Approved</option>
                          <option value="Printing" ${o.status === 'Printing' ? 'selected' : ''}>🖨️ Printing</option>
                          <option value="Ready for Pickup" ${o.status === 'Ready for Pickup' ? 'selected' : ''}>📦 Ready for Pickup</option>
                          <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>✅ Completed (Confirm & Lock)</option>
                          <option value="Rejected" ${o.status === 'Rejected' ? 'selected' : ''}>❌ Rejected (Confirm & Lock)</option>
                        </select>
                      </div>
                      `;
        })()}
                  </td>
                  <td>
                    <div style="display:flex; gap:0.35rem; align-items:center; flex-wrap:wrap;">
                      <a href="#admin-orders?invoice=${o.id}" class="btn btn-sm btn-secondary" title="View Tax Invoice">🧾 Invoice</a>
                      <button class="btn btn-sm btn-success" onclick="window.sendWhatsAppInvoice('${o.id}')" title="Send Invoice via WhatsApp">💬 WhatsApp</button>
                      <button class="btn btn-sm btn-danger" onclick="window.deleteOrderRecord('${o.id}')" title="Delete Order Record">🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
                `;
    }).join('')}
              <tr id="order-no-match-row" style="display:none;">
                <td colspan="9" class="text-center text-muted" style="padding:2.5rem;">
                  <div style="font-size:2rem; margin-bottom:0.35rem;">🔍</div>
                  <h4>No orders match your search filter</h4>
                  <p style="font-size:0.85rem; margin-top:0.25rem;">Try clearing the search box or changing the status filter dropdown.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    await this.renderAdminLayout('orders', html);

    // Global Order Action Helpers
    window.deleteOrderRecord = async (orderId) => {
      if (confirm(`Are you sure you want to permanently delete order "${orderId}"? This action cannot be undone.`)) {
        const res = await DBService.deleteOrder(orderId);
        if (res) {
          NotificationService.showToast(`Order ${orderId} deleted permanently!`, 'info');
          this.renderOrders(queryStr);
        } else {
          NotificationService.showToast('Failed to delete order.', 'error');
        }
      }
    };
    window.downloadOrderFile = async (orderId, fileIndex) => {
      const order = await DBService.getOrderById(orderId);
      if (!order || !order.files || !order.files[fileIndex]) {
        NotificationService.showToast('File not found', 'error');
        return;
      }
      const file = order.files[fileIndex];
      const url = await StorageService.getFileUrl(file);

      if (!url) {
        NotificationService.showToast('File data URL unavailable', 'error');
        return;
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || `Document_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      NotificationService.showToast(`Downloading ${file.name}...`, 'success');
    };

    window.previewOrderFile = async (orderId, fileIndex) => {
      const order = await DBService.getOrderById(orderId);
      if (!order || !order.files || !order.files[fileIndex]) {
        NotificationService.showToast('File not found', 'error');
        return;
      }
      const file = order.files[fileIndex];
      let previewHTML = '';

      const viewUrl = await StorageService.getFileUrl(file);

      const isImageDataUri = viewUrl && viewUrl.startsWith('data:image');
      const isImageFileExt = (viewUrl && viewUrl.match(/\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i)) ||
        (file.name && file.name.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i));

      const isImage = isImageDataUri || isImageFileExt;

      if (isImage) {
        previewHTML = `
          <div style="text-align:center; padding:0.5rem; background:var(--bg-card); border-radius:8px;">
            <img src="${viewUrl}" alt="${file.name}" style="max-width:100%; max-height:68vh; border-radius:8px; border:1px solid var(--border-color); box-shadow:var(--shadow-md); object-fit:contain;" />
          </div>
        `;
      } else if (viewUrl) {
        previewHTML = `
          <div style="width:100%; height:68vh; background:var(--bg-card); border-radius:8px; overflow:hidden; border:1px solid var(--border-color);">
            <object data="${viewUrl}" type="application/pdf" style="width:100%; height:100%;">
              <iframe src="${viewUrl}" style="width:100%; height:100%; border:none;">
                <div style="text-align:center; padding:3rem 2rem;">
                  <div style="font-size:3.5rem; margin-bottom:0.5rem;">📄</div>
                  <h3 style="font-size:1.3rem;">${file.name}</h3>
                  <p style="color:var(--text-muted); font-size:0.875rem; margin-top:0.35rem;">Size: ${file.size || 'N/A'} • ~${file.pages || 1} page(s)</p>
                  <button class="btn btn-sm btn-primary mt-2" onclick="window.openFullScreenFile('${orderId}', ${fileIndex})">Open Document in New Tab ↗</button>
                </div>
              </iframe>
            </object>
          </div>
        `;
      } else {
        previewHTML = `
          <div style="text-align:center; padding:3rem 2rem; background:var(--primary-light); border-radius:12px;">
            <div style="font-size:3.5rem; margin-bottom:0.5rem;">📄</div>
            <h3 style="font-size:1.3rem;">${file.name}</h3>
            <p style="color:var(--text-muted); font-size:0.875rem; margin-top:0.35rem;">Size: ${file.size || 'N/A'} • ~${file.pages || 1} page(s)</p>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.75rem;">(Sample document record without local binary preview attached)</p>
          </div>
        `;
      }

      const modal = ModalComponent || window.ModalComponent;
      if (modal) {
        modal.show({
          title: `Document Preview - ${file.name}`,
          bodyHTML: previewHTML,
          footerHTML: `
            ${viewUrl ? `<button class="btn btn-primary" onclick="window.downloadOrderFile('${orderId}', ${fileIndex})">📥 Download File</button>` : ''}
            ${viewUrl ? `<button class="btn btn-outline" onclick="window.openFullScreenFile('${orderId}', ${fileIndex})">🔗 Open Full Screen ↗</button>` : ''}
            <button class="btn btn-secondary" onclick="if(window.ModalComponent) window.ModalComponent.close(); else document.getElementById('active-modal-overlay')?.remove();">Close</button>
          `,
          width: '850px'
        });
      } else {
        NotificationService.showToast(`Preview: ${file.name}`, 'info');
      }
    };

    window.openFullScreenFile = async (orderId, fileIndex) => {
      const order = await DBService.getOrderById(orderId);
      if (!order || !order.files || !order.files[fileIndex]) {
        NotificationService.showToast('File not found', 'error');
        return;
      }
      const file = order.files[fileIndex];
      const url = await StorageService.getFileUrl(file);
      if (!url) {
        NotificationService.showToast('File URL unavailable', 'error');
        return;
      }

      const newWin = window.open(url, '_blank');
      if (!newWin) {
        window.location.href = url;
      }
    };

    window.viewOrderScreenshot = async (orderId) => {
      const order = await DBService.getOrderById(orderId);
      if (!order) {
        NotificationService.showToast('Order not found', 'error');
        return;
      }

      const pay = order.payment || {};
      const possibleUrl = pay.screenshotUrl || pay.screenshotDataUrl || pay.screenshot || order.screenshotUrl || '';
      const possibleDataUrl = pay.screenshotDataUrl || pay.fallbackData || (possibleUrl.startsWith('data:') ? possibleUrl : '');
      const possibleIdbKey = pay.screenshotIdbKey || (possibleUrl.startsWith('idb://') ? possibleUrl.replace('idb://', '') : '');

      const screenshotUrl = await StorageService.getFileUrl({ 
        url: possibleUrl, 
        dataUrl: possibleDataUrl, 
        idbKey: possibleIdbKey 
      });

      let bodyHTML = '';

      if (screenshotUrl && screenshotUrl.trim() !== '') {
        bodyHTML = `
          <div style="text-align:center; padding:0.5rem;">
            <div style="background:var(--bg-card); padding:0.75rem 1rem; border-radius:8px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div>UTR / Ref: <b style="color:var(--primary); font-family:monospace; font-size:1rem;">${pay.utr || 'N/A'}</b></div>
              <div>Payer Name: <b>${pay.payerName || order.customerName}</b></div>
            </div>
            
            <div style="position:relative; display:inline-block; max-width:100%;">
              <img src="${screenshotUrl}" alt="Payment Screenshot" style="max-width:100%; max-height:65vh; border-radius:12px; border:1px solid var(--border-color); box-shadow:var(--shadow-md); display:inline-block; object-fit:contain;" 
                onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'text-center text-muted\\' style=\\'padding:2rem;\\'>⚠️ Screenshot preview unavailable on this device.<br><a href=\\'${screenshotUrl}\\' target=\\'_blank\\' class=\\'btn btn-sm btn-primary mt-2\\'>Open Screenshot Link ↗</a></div>';" />
            </div>

            <div style="margin-top:1rem; display:flex; gap:0.75rem; justify-content:center;">
              <a href="${screenshotUrl}" target="_blank" download="Payment_Receipt_${orderId}.png" class="btn btn-sm btn-primary">
                📥 Download Screenshot
              </a>
              <a href="${screenshotUrl}" target="_blank" class="btn btn-sm btn-outline">
                🔗 Open in New Tab ↗
              </a>
            </div>
          </div>
        `;
      } else {
        bodyHTML = `
          <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:white; padding:2rem; border-radius:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:1rem; margin-bottom:1.5rem;">
              <div>
                <div style="color:#10b981; font-weight:700; font-size:0.85rem; text-transform:uppercase;">✓ UPI Payment Details Submitted</div>
                <h3 style="font-size:1.4rem; margin-top:0.2rem;">TEAM 7 SYSTEM SOLUTION</h3>
              </div>
              <div style="font-size:2.5rem;">📱</div>
            </div>

            <div style="margin-bottom:1.5rem;">
              <div style="font-size:0.8rem; color:#94a3b8; text-transform:uppercase;">Total Amount Payable</div>
              <div style="font-size:2.25rem; font-weight:800; color:#38bdf8;">${formatCurrency(order.pricing?.total)}</div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
              <div>
                <div style="font-size:0.75rem; color:#94a3b8;">12-DIGIT UTR / REF NO.</div>
                <div style="font-size:1.1rem; font-weight:700; font-family:monospace; color:#f1f5f9;">${pay.utr || 'N/A'}</div>
              </div>
              <div>
                <div style="font-size:0.75rem; color:#94a3b8;">PAYER NAME</div>
                <div style="font-size:1.05rem; font-weight:700; color:#f1f5f9;">${pay.payerName || order.customerName}</div>
              </div>
            </div>

            <div style="margin-top:1.25rem; font-size:0.82rem; color:#94a3b8; text-align:center; background:rgba(255,255,255,0.04); padding:0.75rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
              ℹ️ Customer submitted payment with UTR Ref <b>${pay.utr || 'N/A'}</b> & Payer Name <b>${pay.payerName || order.customerName}</b> without attaching an optional screenshot image.
            </div>
          </div>
        `;
      }

      const modal = ModalComponent || window.ModalComponent;
      if (modal) {
        modal.show({
          title: `Payment Receipt Inspection - ${order.id}`,
          bodyHTML: bodyHTML,
          footerHTML: `<button class="btn btn-secondary" onclick="if(window.ModalComponent) window.ModalComponent.close(); else document.getElementById('active-modal-overlay')?.remove();">Close</button>`,
          width: '650px'
        });
      } else {
        NotificationService.showToast(`UTR: ${pay.utr} | Payer: ${pay.payerName}`, 'info');
      }
    };

    const updatePipelineCounts = () => {
      const getC = (st) => st ? orders.filter(o => o.status === st).length : orders.length;
      const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
      setTxt('pipeline-total-count', orders.length);
      setTxt('count-all', getC(''));
      setTxt('count-waiting', getC('Waiting Verification'));
      setTxt('count-approved', getC('Payment Approved'));
      setTxt('count-printing', getC('Printing'));
      setTxt('count-ready', getC('Ready for Pickup'));
      setTxt('count-completed', getC('Completed'));
      setTxt('count-rejected', getC('Rejected'));
    };

    window.filterPipelineByPill = (st) => {
      if (statusFilter) {
        statusFilter.value = st;
      }
      const pills = document.querySelectorAll('#pipeline-status-pills .btn');
      pills.forEach(p => {
        p.classList.remove('btn-primary', 'active-pill');
        p.classList.add('btn-outline');
      });

      const mapPillId = {
        '': 'pill-all',
        'Waiting Verification': 'pill-waiting',
        'Payment Approved': 'pill-approved',
        'Printing': 'pill-printing',
        'Ready for Pickup': 'pill-ready',
        'Completed': 'pill-completed',
        'Rejected': 'pill-rejected'
      };
      const activeBtn = document.getElementById(mapPillId[st] || 'pill-all');
      if (activeBtn) {
        activeBtn.classList.remove('btn-outline');
        activeBtn.classList.add('btn-primary', 'active-pill');
      }
      applyFilters();
    };

    window.updateOrderStatusFromTable = async (orderId, newStatus) => {
      const targetOrder = orders.find(o => o.id === orderId);
      const isFinalStatus = newStatus === 'Completed' || newStatus === 'Rejected';

      if (isFinalStatus) {
        const actionLabel = newStatus === 'Completed' ? 'COMPLETED' : 'REJECTED';
        if (!confirm(`🔒 Confirm marking Order "${orderId}" as ${actionLabel}?\n\nOnce confirmed, this status will be locked and cannot be accidentally changed.`)) {
          // Reset select box back to previous status
          const selectEl = document.getElementById(`select-status-${orderId}`);
          if (selectEl && targetOrder) selectEl.value = targetOrder.status;
          return;
        }
      }

      await DBService.updateOrderStatus(orderId, newStatus, isFinalStatus ? true : false);
      if (targetOrder) {
        targetOrder.status = newStatus;
        targetOrder.isStatusLocked = isFinalStatus;
      }

      // Flash row highlight animation
      const row = document.getElementById(`order-row-${orderId}`);
      if (row) {
        row.style.transition = 'background-color 0.4s ease';
        row.style.backgroundColor = newStatus === 'Completed' ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.2)';
        setTimeout(() => { if (row) row.style.backgroundColor = ''; }, 1400);
      }

      // Replace status cell with locked badge if finalized
      const cellContainer = document.getElementById(`status-cell-container-${orderId}`);
      if (cellContainer && cellContainer.parentNode && isFinalStatus) {
        const isComp = newStatus === 'Completed';
        cellContainer.parentNode.innerHTML = `
          <div id="status-cell-container-${orderId}" style="display:flex; flex-direction:column; gap:0.25rem;">
            <span style="background:${isComp ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.15)'}; color:${isComp ? '#059669' : '#dc2626'}; font-weight:800; font-size:0.8rem; padding:0.35rem 0.6rem; border-radius:8px; border:1.5px solid ${isComp ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.35)'}; white-space:nowrap; display:inline-flex; align-items:center; gap:0.3rem;">
              🔒 ${isComp ? '✅ Completed (Confirmed)' : '❌ Rejected (Confirmed)'}
            </span>
            <button class="btn btn-sm btn-link" style="font-size:0.7rem; color:var(--text-muted); padding:0; text-decoration:underline; text-align:left; border:none; background:none; cursor:pointer;" onclick="window.unlockOrderStatus('${orderId}')" title="Unlock status if edit is required">
              🔓 Unlock Status
            </button>
          </div>
        `;
      }

      if (newStatus === 'Completed') {
        NotificationService.showToast(`🔒 Order ${orderId} CONFIRMED & COMPLETED! Status locked.`, 'success');
      } else {
        NotificationService.showToast(`Order ${orderId} updated to '${newStatus}'`, 'info');
      }

      updatePipelineCounts();
      applyFilters();
    };

    window.unlockOrderStatus = async (orderId) => {
      if (confirm(`🔓 Are you sure you want to UNLOCK the status for Order "${orderId}"? This will allow changing the status again.`)) {
        const targetOrder = orders.find(o => o.id === orderId);
        if (targetOrder) {
          targetOrder.isStatusLocked = false;
          await DBService.updateOrderStatus(orderId, targetOrder.status, false);

          const cellContainer = document.getElementById(`status-cell-container-${orderId}`);
          if (cellContainer && cellContainer.parentNode) {
            cellContainer.parentNode.innerHTML = `
              <div id="status-cell-container-${orderId}">
                <select class="form-select" style="font-size:0.8rem; padding:0.35rem 0.5rem; font-weight:600;" onchange="window.updateOrderStatusFromTable('${orderId}', this.value)" id="select-status-${orderId}">
                  <option value="Waiting Verification" ${targetOrder.status === 'Waiting Verification' ? 'selected' : ''}>⏳ Waiting Verification</option>
                  <option value="Payment Approved" ${targetOrder.status === 'Payment Approved' ? 'selected' : ''}>💳 Payment Approved</option>
                  <option value="Printing" ${targetOrder.status === 'Printing' ? 'selected' : ''}>🖨️ Printing</option>
                  <option value="Ready for Pickup" ${targetOrder.status === 'Ready for Pickup' ? 'selected' : ''}>📦 Ready for Pickup</option>
                  <option value="Completed" ${targetOrder.status === 'Completed' ? 'selected' : ''}>✅ Completed (Confirm & Lock)</option>
                  <option value="Rejected" ${targetOrder.status === 'Rejected' ? 'selected' : ''}>❌ Rejected (Confirm & Lock)</option>
                </select>
              </div>
            `;
          }
          NotificationService.showToast(`🔓 Status unlocked for Order ${orderId}`, 'info');
        }
      }
    };

    window.sendWhatsAppInvoice = async (orderId) => {
      const order = await DBService.getOrderById(orderId);
      const settings = await DBService.getSettings();
      if (!order) {
        NotificationService.showToast('Order not found', 'error');
        return;
      }

      let rawPhone = (order.customerPhone || '').replace(/\D/g, '');
      if (rawPhone.length === 10) {
        rawPhone = '91' + rawPhone;
      }

      if (!rawPhone) {
        NotificationService.showToast('Customer phone number is missing.', 'warning');
        return;
      }

      const orderTotal = formatCurrency(order.pricing?.total);
      const fileCount = order.files ? order.files.length : 0;
      const statusEmoji = order.status === 'Completed' ? '✅' : order.status === 'Printing' ? '🖨️' : '⚡';

      const invoiceUrl = `${window.location.origin}${window.location.pathname}#track?id=${order.id}`;

      const message = `Hello ${order.customerName || 'Customer'} 👋,

Here is your Order & Payment Invoice from *${settings.shopName || 'TEAM 7 SYSTEM SOLUTION'}*:

📄 *Order ID:* ${order.id}
📌 *Status:* ${statusEmoji} ${order.status}
🖨️ *Documents:* ${fileCount} file(s) (${order.options?.paperSize || 'A4'} ${order.options?.colorMode || 'B&W'})
💳 *Payment UTR:* ${order.payment?.utr || 'N/A'}
💰 *Grand Total:* ${orderTotal}

🔍 *View Tax Invoice & Track Order Timeline:*
${invoiceUrl}

Thank you for choosing ${settings.shopName}!
📞 Shop Support: ${settings.phone}`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${rawPhone}?text=${encodedMessage}`;

      window.open(waUrl, '_blank');
      NotificationService.showToast(`Opening WhatsApp chat for Order ${order.id}...`, 'success');
    };

    // Table Search Filter Logic
    const searchField = document.getElementById('order-search-field');
    const statusFilter = document.getElementById('order-status-filter');

    const applyFilters = () => {
      const q = searchField?.value.trim().toLowerCase() || '';
      const st = statusFilter?.value || '';
      let visibleCount = 0;

      orders.forEach(o => {
        const row = document.getElementById(`order-row-${o.id}`);
        if (!row) return;
        const idStr = (o.id || '').toLowerCase();
        const nameStr = (o.customerName || '').toLowerCase();
        const phoneStr = (o.customerPhone || '').toLowerCase();
        const utrStr = (o.payment?.utr || '').toLowerCase();
        const addrStr = (o.customerAddress || '').toLowerCase();
        const zoneStr = (o.pricing?.deliveryZone || '').toLowerCase();

        const matchQ = !q || idStr.includes(q) || nameStr.includes(q) || phoneStr.includes(q) || utrStr.includes(q) || addrStr.includes(q) || zoneStr.includes(q);
        const matchSt = !st || o.status === st;

        const visible = matchQ && matchSt;
        row.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
      });

      const noMatchRow = document.getElementById('order-no-match-row');
      if (noMatchRow) {
        noMatchRow.style.display = (visibleCount === 0 && orders.length > 0) ? '' : 'none';
      }
    };

    searchField?.addEventListener('input', applyFilters);
    statusFilter?.addEventListener('change', (e) => {
      window.filterPipelineByPill(e.target.value);
    });
    if (paramId) applyFilters();

    // --- LIVE REALTIME RECEPTION & SYNC ENGINE FOR ADMIN PIPELINE ---
    if (window._adminPipelineSyncTimer) {
      clearInterval(window._adminPipelineSyncTimer);
    }

    let previousOrderCount = orders.length;

    window._adminPipelineSyncTimer = setInterval(async () => {
      // Auto-stop if user navigated away from pipeline page
      if (!window.location.hash.startsWith('#admin-orders')) {
        clearInterval(window._adminPipelineSyncTimer);
        window._adminPipelineSyncTimer = null;
        return;
      }

      const freshOrders = await DBService.getOrders();
      if (freshOrders.length > previousOrderCount) {
        const diff = freshOrders.length - previousOrderCount;
        previousOrderCount = freshOrders.length;
        NotificationService.showToast(`🔔 ${diff} New Customer Order(s) Received! Live updating pipeline...`, 'success');
        this.renderOrders(queryStr);
      } else {
        freshOrders.forEach(fo => {
          const target = orders.find(o => o.id === fo.id);
          if (target && target.status !== fo.status) {
            target.status = fo.status;
            const selectEl = document.querySelector(`#order-row-${fo.id} select`);
            if (selectEl) selectEl.value = fo.status;
          }
        });
        updatePipelineCounts();
        applyFilters();
      }
    }, 5000);
  },

  // --- PRICING & PRODUCTS MANAGEMENT EDITOR (FULL CRUD) ---
  async renderPricing() {
    const pricing = PricingEngine.getPricingData();

    const html = `
      <div class="table-card mb-4">
        <div class="table-toolbar" style="flex-wrap:wrap; gap:1rem;">
          <div>
            <h3>Dynamic Price & Product Manager (CRUD)</h3>
            <p class="text-muted" style="font-size:0.85rem;">Create, edit, or delete paper sizes, GSM qualities, binding choices, color rates, and delivery charges with full CRUD control.</p>
          </div>
          <div style="display:flex; gap:0.75rem; align-items:center;">
            <a href="#admin-catalog" class="btn btn-outline">🛠️ Manage Services Catalog (CRUD)</a>
            <button class="btn btn-success" id="btn-save-all-pricing">💾 Save Price Updates</button>
          </div>
        </div>

        <div style="padding:1.5rem; display:grid; grid-template-columns:1fr 1fr; gap:2rem;">
          
          <!-- 1. Paper Base Rates (CRUD) -->
          <div class="glass-panel" style="padding:1.25rem; border-radius:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.6rem;">
              <h4 style="margin:0; font-size:1.05rem; color:var(--primary);">📄 Paper Sizes & Base Rates (per page)</h4>
              <button class="btn btn-sm btn-primary" onclick="window.openAddPaperSizeModal()">➕ Add Size</button>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              ${Object.entries(pricing.paperSizes || {}).map(([size, item]) => `
                <div style="background:var(--bg-card); padding:0.75rem 1rem; border-radius:10px; border:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between; gap:0.75rem;">
                  <div style="flex:1;">
                    <div style="font-weight:700; font-size:0.9rem;">${size}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${item.label || size}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span style="font-size:0.8rem; font-weight:600;">₹</span>
                    <input type="number" step="0.25" min="0" class="form-control form-control-sm price-input-field" data-type="paperSizes" data-key="${size}" data-prop="baseRate" value="${item.baseRate}" style="width:85px; font-weight:700;">
                    <button class="btn btn-sm btn-danger" style="font-size:0.7rem; padding:0.25rem 0.45rem;" onclick="window.deletePaperSize('${size}')" title="Delete Paper Size">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 2. Paper Qualities (GSM) & Multipliers (CRUD) -->
          <div class="glass-panel" style="padding:1.25rem; border-radius:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.6rem;">
              <h4 style="margin:0; font-size:1.05rem; color:var(--primary);">📜 Paper Qualities (GSM) Multipliers</h4>
              <button class="btn btn-sm btn-primary" onclick="window.openAddPaperQualityModal()">➕ Add Quality</button>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              ${Object.entries(pricing.paperQualities || {}).map(([quality, item]) => `
                <div style="background:var(--bg-card); padding:0.75rem 1rem; border-radius:10px; border:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between; gap:0.75rem;">
                  <div style="flex:1;">
                    <div style="font-weight:700; font-size:0.9rem;">${quality}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${item.label || quality}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span style="font-size:0.75rem; color:var(--text-muted);">x</span>
                    <input type="number" step="0.1" min="0.1" class="form-control form-control-sm price-input-field" data-type="paperQualities" data-key="${quality}" data-prop="multiplier" value="${item.multiplier}" style="width:85px; font-weight:700;">
                    <button class="btn btn-sm btn-danger" style="font-size:0.7rem; padding:0.25rem 0.45rem;" onclick="window.deletePaperQuality('${quality}')" title="Delete Quality">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 3. Book Binding Costs (CRUD) -->
          <div class="glass-panel" style="padding:1.25rem; border-radius:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.6rem;">
              <h4 style="margin:0; font-size:1.05rem; color:var(--primary);">📚 Book Binding Options & Rates (CRUD)</h4>
              <button class="btn btn-sm btn-primary" onclick="window.openAddBindingModal()">➕ Add Binding</button>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              ${Object.entries(pricing.bindings || {}).map(([name, item]) => `
                <div style="background:var(--bg-card); padding:0.85rem 1rem; border-radius:10px; border:1px solid var(--border-color); display:flex; flex-direction:column; gap:0.5rem;">
                  <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem;">
                    <div style="flex:1;">
                      <div style="font-weight:700; font-size:0.9rem; color:var(--primary);">📚 ${name}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <span style="font-size:0.8rem; font-weight:600;">₹</span>
                      <input type="number" step="5" min="0" class="form-control form-control-sm price-input-field" data-type="bindings" data-key="${name}" data-prop="price" value="${item.price}" style="width:85px; font-weight:700;">
                      <button class="btn btn-sm btn-outline" style="font-size:0.7rem; padding:0.25rem 0.45rem;" onclick="window.openAddBindingModal('${name}')" title="Edit Binding & Explanation">✏️ Edit</button>
                      ${name !== 'None' ? `
                        <button class="btn btn-sm btn-danger" style="font-size:0.7rem; padding:0.25rem 0.45rem;" onclick="window.deleteBinding('${name}')" title="Delete Binding Option">🗑️</button>
                      ` : ''}
                    </div>
                  </div>
                  <div style="font-size:0.78rem; color:var(--text-muted); background:var(--bg-body); padding:0.4rem 0.6rem; border-radius:6px; border:1px solid var(--border-color);">
                    💡 <b>Explanation ("What is binding?"):</b> ${item.description || item.label || 'Standard document binding finish.'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 4. Color & Extra Finishing Rates (CRUD) -->
          <div class="glass-panel" style="padding:1.25rem; border-radius:12px; grid-column: span 2;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.6rem; flex-wrap:wrap; gap:0.5rem;">
              <h4 style="margin:0; font-size:1.05rem; color:var(--primary);">🎨 Color & Extra Finishing Rates</h4>
              <button class="btn btn-sm btn-primary" onclick="window.openAddFinishingModal()">➕ Add Finishing Option</button>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
              <!-- Standard Color Page Surcharge Rate -->
              <div style="background:var(--bg-card); padding:1rem; border-radius:10px; border:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between; gap:1rem;">
                <div>
                  <div style="font-weight:700; font-size:0.925rem; color:var(--primary);">🎨 Color Page Surcharge Rate</div>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">Additional surcharge per color page printed</div>
                </div>
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <span style="font-size:0.85rem; font-weight:700;">+₹</span>
                  <input type="number" step="0.5" min="0" class="form-control form-control-sm price-input-field" data-type="colorModes" data-key="Color" data-prop="costPerPage" value="${pricing.colorModes?.['Color']?.costPerPage || 6.00}" style="width:90px; font-weight:700;">
                </div>
              </div>

              <!-- List of Dynamic Finishing / Lamination Options (CRUD) -->
              ${Object.entries(pricing.lamination || {}).map(([key, item]) => `
                <div style="background:var(--bg-card); padding:1rem; border-radius:10px; border:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between; gap:1rem;">
                  <div style="flex:1;">
                    <div style="font-weight:700; font-size:0.9rem;">🛡️ ${key}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">${item.label || key}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span style="font-size:0.8rem; font-weight:600;">₹</span>
                    <input type="number" step="0.5" min="0" class="form-control form-control-sm price-input-field" data-type="lamination" data-key="${key}" data-prop="pricePerPage" value="${item.pricePerPage || 0}" style="width:85px; font-weight:700;">
                    ${key !== 'No' ? `
                      <button class="btn btn-sm btn-danger" style="font-size:0.7rem; padding:0.25rem 0.45rem;" onclick="window.deleteFinishingOption('${key}')" title="Delete Finishing Option">🗑️</button>
                    ` : '<span class="badge badge-approved" style="font-size:0.68rem;">Default</span>'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 5. Area-Wise Delivery Charges & Zones (CRUD) -->
          <div style="grid-column: span 2; border-top:1px solid var(--border-color); padding-top:1.5rem; margin-top:0.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; border-bottom:1px solid var(--border-color); padding-bottom:0.85rem; flex-wrap:wrap; gap:1rem;">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <h4 style="margin:0;">🚚 Area-Wise Delivery Charges & Zones</h4>
                <span class="badge" style="background:var(--primary-light); color:var(--primary); font-weight:700; font-size:0.75rem; padding:0.25rem 0.65rem; border-radius:12px; border:1px solid var(--border-color);">
                  ${Object.keys(pricing.deliveryZones || {}).length} Total Zones
                </span>
              </div>

              <div style="display:flex; gap:0.75rem; align-items:center; flex-grow:1; max-width:440px; justify-content:flex-end;">
                <div style="position:relative; width:100%; max-width:260px;">
                  <input type="text" class="form-control form-control-sm" id="delivery-zone-search-input" placeholder="🔍 Search area or zone name..." style="padding-left:2.1rem; border-radius:20px;">
                  <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); font-size:0.8rem; opacity:0.6;">🔍</span>
                </div>
                <button class="btn btn-sm btn-primary" onclick="window.openAddDeliveryZoneModal()" style="white-space:nowrap;">➕ Add New Zone</button>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;" id="delivery-zones-grid">
              ${Object.entries(pricing.deliveryZones || {}).map(([zone, item]) => `
                <div class="glass-panel zone-card-item" data-zone-key="${zone.toLowerCase()}" data-zone-label="${(item.label || '').toLowerCase()}" style="padding:1.1rem; border-radius:12px; position:relative;">
                  <div style="font-weight:700; font-size:0.9rem; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--primary);">📍 ${zone}</span>
                    ${zone !== 'Pickup' ? `
                      <button class="btn btn-sm btn-danger" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="window.deleteDeliveryZone('${zone}')">🗑️ Delete Zone</button>
                    ` : '<span class="badge badge-approved" style="font-size:0.7rem;">Default</span>'}
                  </div>

                  <div class="form-group mb-2">
                    <label class="form-label" style="font-size:0.75rem;">Customer Display Label</label>
                    <input type="text" class="form-control form-control-sm zone-label-field" data-key="${zone}" value="${item.label}">
                  </div>

                  <div class="form-group mb-0">
                    <label class="form-label" style="font-size:0.75rem;">Delivery Fee (₹)</label>
                    <input type="number" step="5" min="0" class="form-control form-control-sm price-input-field" data-type="deliveryZones" data-key="${zone}" data-prop="fee" value="${item.fee}">
                  </div>
                </div>
              `).join('')}

              <div id="no-zone-match-msg" style="display:none; grid-column:span 2; text-align:center; padding:2.5rem 1rem; color:var(--text-muted); background:var(--bg-card); border-radius:12px; border:1px dashed var(--border-color);">
                <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
                <h5>No delivery zones match your search</h5>
                <p style="font-size:0.85rem; margin-top:0.25rem;">Try searching for a different area name or clear the search input field.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.renderAdminLayout('pricing', html);

    // Live Search Filter for Delivery Zones
    const zoneSearchInput = document.getElementById('delivery-zone-search-input');
    if (zoneSearchInput) {
      zoneSearchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        const cards = document.querySelectorAll('.zone-card-item');
        let visibleCount = 0;
        cards.forEach(card => {
          const key = card.dataset.zoneKey || '';
          const label = card.dataset.zoneLabel || '';
          const matches = !val || key.includes(val) || label.includes(val);
          card.style.display = matches ? '' : 'none';
          if (matches) visibleCount++;
        });

        const noMatchMsg = document.getElementById('no-zone-match-msg');
        if (noMatchMsg) {
          noMatchMsg.style.display = (visibleCount === 0 && cards.length > 0) ? '' : 'none';
        }
      });
    }

    document.getElementById('btn-save-all-pricing').onclick = () => {
      const inputs = document.querySelectorAll('.price-input-field');
      inputs.forEach(input => {
        const type = input.dataset.type;
        const key = input.dataset.key;
        const prop = input.dataset.prop;
        const val = parseFloat(input.value) || 0;
        if (pricing[type] && pricing[type][key]) {
          pricing[type][key][prop] = val;
        }
      });

      const labelInputs = document.querySelectorAll('.zone-label-field');
      labelInputs.forEach(input => {
        const key = input.dataset.key;
        if (pricing.deliveryZones && pricing.deliveryZones[key]) {
          pricing.deliveryZones[key].label = input.value;
        }
      });

      PricingEngine.savePricingData(pricing);
      NotificationService.showToast('All pricing structure & delivery fees saved successfully!', 'success');
    };

    // Paper Size Add Modal & Handler
    window.openAddPaperSizeModal = () => {
      const modalHTML = `
        <form id="add-paper-size-form" onsubmit="event.preventDefault(); window.saveNewPaperSize();">
          <div class="form-group mb-3">
            <label class="form-label">Paper Size Code / Name *</label>
            <input type="text" class="form-control" id="new-size-name" placeholder="E.g., A2, B5, Arch D" required autofocus>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">Base Rate per Page (₹) *</label>
            <input type="number" step="0.25" min="0" class="form-control" id="new-size-rate" value="5.00" required>
          </div>
          <div class="form-group mb-4">
            <label class="form-label">Display Label *</label>
            <input type="text" class="form-control" id="new-size-label" placeholder="E.g., A2 Poster (420 x 594 mm)" required>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button type="button" class="btn btn-secondary" onclick="if(window.ModalComponent) window.ModalComponent.close();">Cancel</button>
            <button type="submit" class="btn btn-success">➕ Add Paper Size</button>
          </div>
        </form>
      `;
      (ModalComponent || window.ModalComponent).show({
        title: `📄 Add New Paper Size Option`,
        bodyHTML: modalHTML,
        width: '500px'
      });
    };

    window.saveNewPaperSize = () => {
      const name = document.getElementById('new-size-name')?.value.trim();
      const baseRate = parseFloat(document.getElementById('new-size-rate')?.value) || 0;
      const label = document.getElementById('new-size-label')?.value.trim();

      if (!name || !label) {
        NotificationService.showToast('Please fill out size name and label.', 'warning');
        return;
      }

      if (!pricing.paperSizes) pricing.paperSizes = {};
      pricing.paperSizes[name] = { baseRate, label };
      PricingEngine.savePricingData(pricing);
      if (window.ModalComponent) window.ModalComponent.close();
      NotificationService.showToast(`Paper Size "${name}" added successfully!`, 'success');
      this.renderPricing();
    };

    window.deletePaperSize = (sizeKey) => {
      if (confirm(`🗑️ Delete Paper Size "${sizeKey}"? Customers will no longer be able to select this size.`)) {
        delete pricing.paperSizes[sizeKey];
        PricingEngine.savePricingData(pricing);
        NotificationService.showToast(`Paper Size "${sizeKey}" deleted.`, 'info');
        this.renderPricing();
      }
    };

    // Paper Quality Add Modal & Handler
    window.openAddPaperQualityModal = () => {
      const modalHTML = `
        <form id="add-paper-quality-form" onsubmit="event.preventDefault(); window.saveNewPaperQuality();">
          <div class="form-group mb-3">
            <label class="form-label">Paper Quality GSM / Type Name *</label>
            <input type="text" class="form-control" id="new-quality-name" placeholder="E.g., 120 GSM, Velvet Matte, Canvas" required autofocus>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">Price Multiplier (e.g. 1.0 = standard, 1.5 = +50%) *</label>
            <input type="number" step="0.1" min="0.1" class="form-control" id="new-quality-multiplier" value="1.5" required>
          </div>
          <div class="form-group mb-4">
            <label class="form-label">Display Label *</label>
            <input type="text" class="form-control" id="new-quality-label" placeholder="E.g., 120 GSM Heavy Cardstock" required>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button type="button" class="btn btn-secondary" onclick="if(window.ModalComponent) window.ModalComponent.close();">Cancel</button>
            <button type="submit" class="btn btn-success">➕ Add Paper Quality</button>
          </div>
        </form>
      `;
      (ModalComponent || window.ModalComponent).show({
        title: `📜 Add New Paper Quality (GSM)`,
        bodyHTML: modalHTML,
        width: '500px'
      });
    };

    window.saveNewPaperQuality = () => {
      const name = document.getElementById('new-quality-name')?.value.trim();
      const multiplier = parseFloat(document.getElementById('new-quality-multiplier')?.value) || 1.0;
      const label = document.getElementById('new-quality-label')?.value.trim();

      if (!name || !label) {
        NotificationService.showToast('Please fill out quality name and label.', 'warning');
        return;
      }

      if (!pricing.paperQualities) pricing.paperQualities = {};
      pricing.paperQualities[name] = { multiplier, label };
      PricingEngine.savePricingData(pricing);
      if (window.ModalComponent) window.ModalComponent.close();
      NotificationService.showToast(`Paper Quality "${name}" added!`, 'success');
      this.renderPricing();
    };

    window.deletePaperQuality = (qualityKey) => {
      if (confirm(`🗑️ Delete Paper Quality "${qualityKey}"?`)) {
        delete pricing.paperQualities[qualityKey];
        PricingEngine.savePricingData(pricing);
        NotificationService.showToast(`Paper Quality "${qualityKey}" deleted.`, 'info');
        this.renderPricing();
      }
    };

    // Binding Add/Edit Modal & Handler
    window.openAddBindingModal = (bindingKey = null) => {
      const item = bindingKey ? pricing.bindings[bindingKey] : null;
      const modalHTML = `
        <form id="add-binding-form" onsubmit="event.preventDefault(); window.saveNewBinding('${bindingKey || ''}');">
          <div class="form-group mb-3">
            <label class="form-label">Binding Type Name *</label>
            <input type="text" class="form-control" id="new-binding-name" value="${bindingKey || ''}" placeholder="E.g., Spiral, Soft Cover, Hard Bound, Comb Binding" required ${bindingKey === 'None' ? 'readonly' : ''} autofocus>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">Price per Book (₹) *</label>
            <input type="number" step="5" min="0" class="form-control" id="new-binding-price" value="${item ? item.price : 35}" required>
          </div>
          <div class="form-group mb-4">
            <label class="form-label">Customer Explanation Text ("What is Binding?") *</label>
            <textarea class="form-control" id="new-binding-desc" rows="3" placeholder="Explain what this binding option is for customers..." required>${item ? (item.description || item.label || '') : ''}</textarea>
            <span style="font-size:0.72rem; color:var(--text-muted); margin-top:0.25rem; display:block;">This description is shown to customers when they click "ℹ️ What is binding?"</span>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button type="button" class="btn btn-secondary" onclick="if(window.ModalComponent) window.ModalComponent.close();">Cancel</button>
            <button type="submit" class="btn btn-success">💾 ${bindingKey ? 'Update Binding Option' : 'Add Binding Option'}</button>
          </div>
        </form>
      `;
      (ModalComponent || window.ModalComponent).show({
        title: bindingKey ? `✏️ Edit Binding Option: "${bindingKey}"` : `📚 Add New Book Binding Option`,
        bodyHTML: modalHTML,
        width: '560px'
      });
    };

    window.saveNewBinding = (origKey = '') => {
      const name = document.getElementById('new-binding-name')?.value.trim();
      const price = parseFloat(document.getElementById('new-binding-price')?.value) || 0;
      const description = document.getElementById('new-binding-desc')?.value.trim() || '';

      if (!name) {
        NotificationService.showToast('Please enter a binding name.', 'warning');
        return;
      }

      if (!pricing.bindings) pricing.bindings = {};
      if (origKey && origKey !== name) {
        delete pricing.bindings[origKey];
      }

      pricing.bindings[name] = { price, description, label: description };
      PricingEngine.savePricingData(pricing);
      if (window.ModalComponent) window.ModalComponent.close();
      NotificationService.showToast(`Binding Option "${name}" updated successfully!`, 'success');
      this.renderPricing();
    };

    window.deleteBinding = (bindingKey) => {
      if (confirm(`🗑️ Delete Binding Option "${bindingKey}"?`)) {
        delete pricing.bindings[bindingKey];
        PricingEngine.savePricingData(pricing);
        NotificationService.showToast(`Binding Option "${bindingKey}" deleted.`, 'info');
        this.renderPricing();
      }
    };

    // Finishing / Lamination Add Modal & Handlers
    window.openAddFinishingModal = () => {
      const modalHTML = `
        <form id="add-finishing-form" onsubmit="event.preventDefault(); window.saveNewFinishingOption();">
          <div class="form-group mb-3">
            <label class="form-label">Finishing Option Name *</label>
            <input type="text" class="form-control" id="new-finishing-name" placeholder="E.g., Matt Velvet Lamination, Hole Punching, UV Gloss" required autofocus>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">Rate per Page / Unit (₹) *</label>
            <input type="number" step="0.5" min="0" class="form-control" id="new-finishing-rate" value="15.00" required>
          </div>
          <div class="form-group mb-4">
            <label class="form-label">Customer Display Label *</label>
            <input type="text" class="form-control" id="new-finishing-label" placeholder="E.g., Premium Soft-Touch Velvet Thermal Lamination" required>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button type="button" class="btn btn-secondary" onclick="if(window.ModalComponent) window.ModalComponent.close();">Cancel</button>
            <button type="submit" class="btn btn-success">➕ Save Finishing Option</button>
          </div>
        </form>
      `;
      (ModalComponent || window.ModalComponent).show({
        title: `🛡️ Add New Finishing / Lamination Option`,
        bodyHTML: modalHTML,
        width: '520px'
      });
    };

    window.saveNewFinishingOption = () => {
      const name = document.getElementById('new-finishing-name')?.value.trim();
      const pricePerPage = parseFloat(document.getElementById('new-finishing-rate')?.value) || 0;
      const label = document.getElementById('new-finishing-label')?.value.trim();

      if (!name || !label) {
        NotificationService.showToast('Please enter finishing name and display label.', 'warning');
        return;
      }

      if (!pricing.lamination) pricing.lamination = {};
      pricing.lamination[name] = { pricePerPage, label };
      PricingEngine.savePricingData(pricing);
      if (window.ModalComponent) window.ModalComponent.close();
      NotificationService.showToast(`Finishing Option "${name}" added!`, 'success');
      this.renderPricing();
    };

    window.deleteFinishingOption = (finishingKey) => {
      if (finishingKey === 'No') {
        NotificationService.showToast('Cannot delete default "No Lamination" option.', 'warning');
        return;
      }
      if (confirm(`🗑️ Delete Finishing Option "${finishingKey}"?`)) {
        if (pricing.lamination && pricing.lamination[finishingKey]) {
          delete pricing.lamination[finishingKey];
          PricingEngine.savePricingData(pricing);
          NotificationService.showToast(`Finishing Option "${finishingKey}" deleted.`, 'info');
          this.renderPricing();
        }
      }
    };

    window.openAddDeliveryZoneModal = () => {
      const modalHTML = `
        <form id="add-zone-form" onsubmit="event.preventDefault(); window.saveNewDeliveryZone();">
          <div class="form-group mb-3">
            <label class="form-label">Delivery Zone Name *</label>
            <input type="text" class="form-control" id="new-zone-name" placeholder="E.g., Zone 4 (Avadi / Poonamallee)" required autofocus>
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Delivery Fee Amount (₹) *</label>
            <input type="number" step="5" min="0" class="form-control" id="new-zone-fee" value="60" required>
          </div>

          <div class="form-group mb-4">
            <label class="form-label">Customer Display Label *</label>
            <input type="text" class="form-control" id="new-zone-label" placeholder="E.g., Western Zone 4 (Avadi Area) - ₹60" required>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button type="button" class="btn btn-secondary" onclick="if(window.ModalComponent) window.ModalComponent.close(); else document.getElementById('active-modal-overlay')?.remove();">Cancel</button>
            <button type="submit" class="btn btn-success">➕ Save Delivery Zone</button>
          </div>
        </form>
      `;

      const modal = ModalComponent || window.ModalComponent;
      if (modal) {
        modal.show({
          title: `🚚 Add New Area Delivery Zone & Fee`,
          bodyHTML: modalHTML,
          width: '520px'
        });
      }
    };

    window.saveNewDeliveryZone = () => {
      const zoneName = document.getElementById('new-zone-name')?.value.trim();
      const fee = parseFloat(document.getElementById('new-zone-fee')?.value) || 0;
      const label = document.getElementById('new-zone-label')?.value.trim();

      if (!zoneName || !label) {
        NotificationService.showToast('Please enter zone name and label.', 'warning');
        return;
      }

      if (!pricing.deliveryZones) pricing.deliveryZones = {};
      pricing.deliveryZones[zoneName] = { fee, label };
      PricingEngine.savePricingData(pricing);

      if (window.ModalComponent) window.ModalComponent.close();
      NotificationService.showToast(`Delivery Zone "${zoneName}" added!`, 'success');
      this.renderPricing();
    };

    window.deleteDeliveryZone = (zoneName) => {
      if (zoneName === 'Pickup') {
        NotificationService.showToast('Cannot delete default Store Pickup zone.', 'warning');
        return;
      }
      if (confirm(`Are you sure you want to delete delivery zone "${zoneName}"?`)) {
        if (pricing.deliveryZones && pricing.deliveryZones[zoneName]) {
          delete pricing.deliveryZones[zoneName];
          PricingEngine.savePricingData(pricing);
          NotificationService.showToast(`Delivery Zone "${zoneName}" deleted!`, 'info');
          this.renderPricing();
        }
      }
    };
  },

  // --- CUSTOMER DIRECTORY ---
  async renderCustomers() {
    const customers = await DBService.getCustomers();

    const html = `
      <div class="table-card">
        <div class="table-toolbar">
          <h3>Customer Directory (${customers.length} registered)</h3>
          <button class="btn btn-sm btn-outline" id="btn-export-cust-excel">📊 Export to Excel CSV</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>Email</th>
                <th>Total Orders</th>
                <th>Total Revenue</th>
                <th>Last Order Date</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(c => `
                <tr>
                  <td><b>${c.name}</b></td>
                  <td>${c.phone}</td>
                  <td>${c.email}</td>
                  <td><span class="badge badge-waiting">${c.totalOrders} order(s)</span></td>
                  <td><b>${formatCurrency(c.totalSpent)}</b></td>
                  <td>${formatDate(c.lastOrderDate)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    await this.renderAdminLayout('customers', html);

    document.getElementById('btn-export-cust-excel').onclick = () => {
      exportToCSV('Team7_Customers_Report.csv', customers);
      NotificationService.showToast('Customer directory exported to CSV!', 'success');
    };
  },

  // --- REPORTS & ANALYTICS FULL SYSTEM ---
  async renderReports() {
    const orders = await DBService.getOrders();

    const html = `
      <div class="table-card mb-4">
        <div class="table-toolbar" style="flex-wrap:wrap; gap:1rem;">
          <div>
            <h3>📊 Full Executive Business Performance & Financial Reports</h3>
            <p class="text-muted" style="font-size:0.85rem;">Filter sales records, analyze paper volume, track delivery revenues, and export full transaction ledgers.</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline" id="btn-print-report-summary">🖨️ Print Summary Report</button>
            <button class="btn btn-sm btn-primary" id="btn-export-sales-csv">📊 Export Full Sales Ledger (CSV)</button>
          </div>
        </div>

        <!-- Filter Control Toolbar -->
        <div style="background:var(--bg-card); padding:1rem 1.5rem; border-bottom:1px solid var(--border-color); display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-weight:700; font-size:0.85rem; color:var(--text-muted);">Period:</span>
            <select class="form-select form-select-sm" id="report-period-filter" style="width:160px;">
              <option value="all" selected>All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div id="custom-date-container" style="display:none; gap:0.5rem; align-items:center;">
            <input type="date" class="form-control form-control-sm" id="report-date-from" style="width:140px;">
            <span style="font-size:0.8rem; color:var(--text-muted);">to</span>
            <input type="date" class="form-control form-control-sm" id="report-date-to" style="width:140px;">
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-weight:700; font-size:0.85rem; color:var(--text-muted);">Status Filter:</span>
            <select class="form-select form-select-sm" id="report-status-filter" style="width:170px;">
              <option value="all" selected>All Orders</option>
              <option value="valid">Valid Net Orders (Non-Rejected)</option>
              <option value="Completed">Completed Only</option>
              <option value="Rejected">Rejected / Deducted Only</option>
            </select>
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem; margin-left:auto;">
            <input type="text" class="form-control form-control-sm" id="report-search-ledger" placeholder="Search Order ID, Customer, UTR..." style="width:200px;">
          </div>
        </div>

        <!-- Metrics Grid Cards -->
        <div style="padding:1.5rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.25rem;" id="report-metrics-grid">
          <!-- Dynamically Populated Metrics -->
        </div>

        <!-- Sales Ledger Table -->
        <div class="table-responsive" style="padding:0 1.5rem 1.5rem;">
          <h4 style="margin-bottom:1rem; font-size:1.1rem;">📑 Itemized Sales & Transaction Ledger</h4>
          <table class="data-table" id="report-ledger-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Order ID</th>
                <th>Customer Info</th>
                <th>Delivery Area</th>
                <th>Files & Pages</th>
                <th>Delivery Fee</th>
                <th>Total Paid</th>
                <th>UTR Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="report-ledger-body">
              <!-- Dynamically Populated Rows -->
            </tbody>
            <tfoot id="report-ledger-foot" style="font-weight:700; background:rgba(0,0,0,0.03);">
              <!-- Dynamically Populated Foot Totals -->
            </tfoot>
          </table>
        </div>
      </div>
    `;

    await this.renderAdminLayout('reports', html);

    // Dynamic Filter Engine
    const periodSelect = document.getElementById('report-period-filter');
    const customContainer = document.getElementById('custom-date-container');
    const dateFromInput = document.getElementById('report-date-from');
    const dateToInput = document.getElementById('report-date-to');
    const statusSelect = document.getElementById('report-status-filter');
    const searchLedgerInput = document.getElementById('report-search-ledger');

    periodSelect.onchange = () => {
      customContainer.style.display = periodSelect.value === 'custom' ? 'flex' : 'none';
      applyReportFilters();
    };

    [dateFromInput, dateToInput, statusSelect, searchLedgerInput].forEach(el => {
      el?.addEventListener('input', applyReportFilters);
      el?.addEventListener('change', applyReportFilters);
    });

    function applyReportFilters() {
      const period = periodSelect.value;
      const statusF = statusSelect.value;
      const searchQ = (searchLedgerInput.value || '').toLowerCase().trim();

      const now = new Date();
      const todayStr = new Date().toISOString().slice(0, 10);

      const filtered = orders.filter(o => {
        const oDate = new Date(o.createdAt || Date.now());
        const oDateStr = oDate.toISOString().slice(0, 10);

        // Period filter
        if (period === 'today') {
          if (oDateStr !== todayStr) return false;
        } else if (period === 'week') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (oDate < oneWeekAgo) return false;
        } else if (period === 'month') {
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (oDate < oneMonthAgo) return false;
        } else if (period === 'custom') {
          const fromV = dateFromInput.value;
          const toV = dateToInput.value;
          if (fromV && oDateStr < fromV) return false;
          if (toV && oDateStr > toV) return false;
        }

        // Status filter
        if (statusF === 'valid') {
          if (o.status === 'Rejected') return false;
        } else if (statusF !== 'all') {
          if (o.status !== statusF) return false;
        }

        // Search query
        if (searchQ) {
          const idStr = (o.id || '').toLowerCase();
          const nameStr = (o.customerName || '').toLowerCase();
          const phoneStr = (o.customerPhone || '').toLowerCase();
          const utrStr = (o.payment?.utr || '').toLowerCase();
          const areaStr = (o.pricing?.deliveryZone || '').toLowerCase();
          if (!idStr.includes(searchQ) && !nameStr.includes(searchQ) && !phoneStr.includes(searchQ) && !utrStr.includes(searchQ) && !areaStr.includes(searchQ)) {
            return false;
          }
        }

        return true;
      });

      // Recalculate Financial Metrics
      const validOrders = filtered.filter(o => o.status !== 'Rejected');
      const rejectedOrders = filtered.filter(o => o.status === 'Rejected');

      const netRevenue = validOrders.reduce((acc, o) => acc + (o.pricing?.total || 0), 0);
      const totalDeliveryFees = validOrders.reduce((acc, o) => acc + (o.pricing?.deliveryFee || 0), 0);
      const rejectedAmount = rejectedOrders.reduce((acc, o) => acc + (o.pricing?.total || 0), 0);
      const avgOrderValue = validOrders.length ? netRevenue / validOrders.length : 0;

      let totalPagesPrinted = 0;
      validOrders.forEach(o => {
        const filesList = (o.files && o.files.length > 0) ? o.files : (o.file ? [o.file] : []);
        filesList.forEach(f => {
          const copies = (f.options || o.options)?.copies || 1;
          const pages = f.pages || 1;
          totalPagesPrinted += (pages * copies);
        });
      });

      // Update Metrics HTML
      const metricsGrid = document.getElementById('report-metrics-grid');
      metricsGrid.innerHTML = `
        <div class="glass-panel" style="padding:1.25rem;">
          <h4 style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Net Sales Revenue</h4>
          <div style="font-size:1.75rem; font-weight:800; color:var(--primary); margin-top:0.35rem;">${formatCurrency(netRevenue)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">(Excludes rejected orders)</div>
        </div>

        <div class="glass-panel" style="padding:1.25rem;">
          <h4 style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Valid Orders Count</h4>
          <div style="font-size:1.75rem; font-weight:800; color:var(--accent); margin-top:0.35rem;">${validOrders.length} Orders</div>
          <div style="font-size:0.75rem; color:#ef4444; margin-top:0.2rem;">${rejectedOrders.length} rejected</div>
        </div>

        <div class="glass-panel" style="padding:1.25rem;">
          <h4 style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Delivery Fees Collected</h4>
          <div style="font-size:1.75rem; font-weight:800; color:#2563eb; margin-top:0.35rem;">${formatCurrency(totalDeliveryFees)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">Doorstep delivery revenue</div>
        </div>

        <div class="glass-panel" style="padding:1.25rem;">
          <h4 style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Avg Valid Order Value</h4>
          <div style="font-size:1.75rem; font-weight:800; color:var(--success); margin-top:0.35rem;">${formatCurrency(avgOrderValue)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">Per customer order</div>
        </div>

        <div class="glass-panel" style="padding:1.25rem;">
          <h4 style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Total Pages Printed</h4>
          <div style="font-size:1.75rem; font-weight:800; color:#7c3aed; margin-top:0.35rem;">${totalPagesPrinted} Pages</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">Paper volume printed</div>
        </div>

        <div class="glass-panel" style="padding:1.25rem;">
          <h4 style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Rejected / Deducted</h4>
          <div style="font-size:1.75rem; font-weight:800; color:#ef4444; margin-top:0.35rem;">-${formatCurrency(rejectedAmount)}</div>
          <div style="font-size:0.75rem; color:#ef4444; margin-top:0.2rem;">${rejectedOrders.length} order(s) deducted</div>
        </div>
      `;

      // Update Sales Ledger Table Rows
      const tbody = document.getElementById('report-ledger-body');
      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="text-center text-muted" style="padding:3rem;">
              🔍 No sales transactions found matching selected period and filters.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = filtered.map(o => {
          const filesList = (o.files && o.files.length > 0) ? o.files : (o.file ? [o.file] : []);
          const totalPgs = filesList.reduce((acc, f) => acc + (f.pages || 1) * ((f.options || o.options)?.copies || 1), 0);

          return `
            <tr>
              <td style="font-size:0.8rem;">${formatDate(o.createdAt)}<br><span style="color:var(--text-muted);">${formatTime(o.createdAt)}</span></td>
              <td><b>${o.id}</b></td>
              <td>
                <b>${o.customerName || 'Customer'}</b><br>
                <span style="font-size:0.75rem; color:var(--text-muted);">${o.customerPhone || 'N/A'}</span>
              </td>
              <td style="font-size:0.8rem;">
                ${o.pricing?.deliveryZone ? `🚚 ${o.pricing.deliveryZone}` : '🏪 Pickup'}
              </td>
              <td style="font-size:0.8rem;">
                <b>${filesList.length} file(s)</b> • ${totalPgs} pgs
              </td>
              <td>${formatCurrency(o.pricing?.deliveryFee || 0)}</td>
              <td><b style="color:${o.status === 'Rejected' ? '#ef4444' : 'var(--primary)'};">${formatCurrency(o.pricing?.total)}</b></td>
              <td><code>${o.payment?.utr || 'N/A'}</code></td>
              <td>${getStatusBadgeHTML(o.status)}</td>
            </tr>
          `;
        }).join('');
      }

      // Update Table Footer Totals
      const tfoot = document.getElementById('report-ledger-foot');
      tfoot.innerHTML = `
        <tr>
          <td colspan="5">Summary Total (${filtered.length} Filtered Transactions)</td>
          <td><b>${formatCurrency(filtered.reduce((sum, o) => sum + (o.status !== 'Rejected' ? (o.pricing?.deliveryFee || 0) : 0), 0))}</b></td>
          <td style="color:var(--primary); font-size:1.05rem;"><b>${formatCurrency(netRevenue)}</b></td>
          <td colspan="2">Net Gain (Excludes Rejected)</td>
        </tr>
      `;
    }

    // Initial render
    applyReportFilters();

    // Export Full Sales Ledger to CSV
    document.getElementById('btn-export-sales-csv').onclick = () => {
      const exportRows = orders.map(o => {
        const filesList = (o.files && o.files.length > 0) ? o.files : (o.file ? [o.file] : []);
        return {
          OrderID: o.id,
          Date: formatDate(o.createdAt),
          Time: formatTime(o.createdAt),
          CustomerName: o.customerName || 'N/A',
          Phone: o.customerPhone || 'N/A',
          DeliveryZone: o.pricing?.deliveryZone || 'Store Pickup',
          Address: o.customerAddress || 'Self Pickup',
          TotalFiles: filesList.length,
          PrintCost: (o.pricing?.paperCost || 0) + (o.pricing?.colorCost || 0),
          BindingCost: o.pricing?.bindingCost || 0,
          DeliveryFee: o.pricing?.deliveryFee || 0,
          TotalAmount: o.pricing?.total || 0,
          PaymentUTR: o.payment?.utr || 'N/A',
          OrderStatus: o.status
        };
      });
      exportToCSV('Team7_Full_Sales_Ledger.csv', exportRows);
      NotificationService.showToast('Full Sales Ledger exported to Excel CSV!', 'success');
    };

    // Print Report Summary
    document.getElementById('btn-print-report-summary').onclick = () => {
      window.print();
    };
  },

  // --- SHOP SETTINGS ---
  async renderSettings() {
    const settings = await DBService.getSettings();

    const html = `
      <div class="table-card">
        <div class="table-toolbar">
          <h3>Shop & UPI Payment Settings</h3>
          <button class="btn btn-success" id="btn-save-settings-form">💾 Save Shop Settings</button>
        </div>

        <div style="padding:1.5rem;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="form-group">
              <label class="form-label">Shop / Business Name</label>
              <input type="text" class="form-control" id="st-name" value="${settings.shopName}">
            </div>

            <div class="form-group">
              <label class="form-label">Business UPI ID (For Payment QR)</label>
              <input type="text" class="form-control" id="st-upi" value="${settings.upiId}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="form-group">
              <label class="form-label">Merchant Name (UPI Display Name)</label>
              <input type="text" class="form-control" id="st-merchant" value="${settings.merchantName}">
            </div>

            <div class="form-group">
              <label class="form-label">GST Number (GSTIN)</label>
              <input type="text" class="form-control" id="st-gst" value="${settings.gstNumber}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.25rem;">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Support Call Phone</label>
              <input type="text" class="form-control" id="st-phone" value="${settings.phone || ''}">
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#059669;">💬 WhatsApp Business Phone *</label>
              <input type="text" class="form-control" id="st-whatsapp" value="${settings.whatsappNumber || settings.phone || ''}" placeholder="E.g., 919789123456 or +91 97891 23456" style="border-color:rgba(16,185,129,0.5);">
              <span style="font-size:0.72rem; color:var(--text-muted); margin-top:0.25rem; display:block;">Powers floating WhatsApp button, contact page & order chat links.</span>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Contact Email</label>
              <input type="email" class="form-control" id="st-email" value="${settings.email || ''}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Shop Address</label>
            <textarea class="form-control" id="st-address">${settings.address || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Google Map Embed URL</label>
            <input type="text" class="form-control" id="st-map" value="${settings.googleMapUrl || ''}">
          </div>
        </div>
      </div>
    `;

    await this.renderAdminLayout('settings', html);

    document.getElementById('btn-save-settings-form').onclick = async () => {
      settings.shopName = document.getElementById('st-name').value;
      settings.upiId = document.getElementById('st-upi').value;
      settings.merchantName = document.getElementById('st-merchant').value;
      settings.gstNumber = document.getElementById('st-gst').value;
      settings.phone = document.getElementById('st-phone').value;
      settings.whatsappNumber = document.getElementById('st-whatsapp').value.trim();
      settings.email = document.getElementById('st-email').value;
      settings.address = document.getElementById('st-address').value;
      settings.googleMapUrl = document.getElementById('st-map').value;

      await DBService.saveSettings(settings);
      if (window.updateFloatingButtons) window.updateFloatingButtons();
      NotificationService.showToast('Shop & WhatsApp Settings updated successfully!', 'success');
    };
  },

  // --- SERVICE CATALOG MANAGER (FULL CRUD) ---
  async renderCatalog() {
    const catalog = await DBService.getServicesCatalog();

    const html = `
      <div class="table-card">
        <div class="table-toolbar">
          <div>
            <h3>Services Catalog Management (CRUD)</h3>
            <p class="text-muted" style="font-size:0.85rem;">Create, edit, or delete offerings displayed on the customer services page.</p>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <a href="#services" class="btn btn-outline" title="Preview Public Services Catalog">👁️ View Customer Page ↗</a>
            <button class="btn btn-success" onclick="window.openCatalogModal()">➕ Add New Service Offer</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="catalog-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Service Title</th>
                <th>Category</th>
                <th>Starting Rate</th>
                <th>Description</th>
                <th>Badge</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${catalog.length === 0 ? `
                <tr>
                  <td colspan="8" class="text-center text-muted" style="padding:3rem;">
                    No services created in catalog yet. Click "+ Add New Service Offer" to create one.
                  </td>
                </tr>
              ` : catalog.map(s => `
                <tr>
                  <td style="font-size:1.5rem; text-align:center;">${s.icon || '📄'}</td>
                  <td>
                    <b>${s.title}</b>
                    <div style="font-size:0.75rem; color:var(--text-muted);">ID: ${s.id}</div>
                  </td>
                  <td><span class="badge badge-waiting" style="font-size:0.75rem;">${s.category || 'General'}</span></td>
                  <td><b style="color:var(--primary);">${s.startingPrice}</b></td>
                  <td style="font-size:0.825rem; color:var(--text-muted); max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${s.description}">
                    ${s.description}
                  </td>
                  <td>
                    ${s.popular ? '<span class="badge badge-approved">Popular</span>' : '<span class="badge" style="background:var(--border-color); color:var(--text-muted);">Standard</span>'}
                  </td>
                  <td>
                    ${s.status === 'Inactive' ? '<span class="badge badge-rejected">● Inactive</span>' : '<span class="badge badge-approved">● Active</span>'}
                  </td>
                  <td>
                    <div style="display:flex; gap:0.35rem;">
                      <button class="btn btn-sm btn-outline" style="padding:0.25rem 0.5rem;" onclick="window.openCatalogModal('${s.id}')">✏️ Edit</button>
                      <button class="btn btn-sm btn-danger" style="padding:0.25rem 0.5rem;" onclick="window.deleteCatalogItem('${s.id}')">🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    await this.renderAdminLayout('catalog', html);

    // Global Modal & Actions for Catalog CRUD
    window.openCatalogModal = async (serviceId = null) => {
      const allItems = await DBService.getServicesCatalog();
      const existing = serviceId ? allItems.find(item => item.id === serviceId) : null;

      const modalHTML = `
        <form id="catalog-form" onsubmit="event.preventDefault(); window.saveCatalogForm('${serviceId || ''}');">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label class="form-label">Service Title *</label>
              <input type="text" class="form-control" id="cat-title" value="${existing?.title || ''}" placeholder="E.g., Passport Photo Printing" required>
            </div>
            <div class="form-group">
              <label class="form-label">Category *</label>
              <input type="text" class="form-control" id="cat-category" value="${existing?.category || 'General Printing'}" placeholder="E.g., Document, Binding, Photo" required>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label class="form-label">Starting Price Tag *</label>
              <input type="text" class="form-control" id="cat-price" value="${existing?.startingPrice || '₹10.00 / unit'}" placeholder="E.g., ₹25.00 / sheet" required>
            </div>
            <div class="form-group">
              <label class="form-label">Icon Emoji</label>
              <input type="text" class="form-control" id="cat-icon" value="${existing?.icon || '📄'}" placeholder="E.g., 📄, 📸, 📚, 🏷️">
            </div>
            <div class="form-group">
              <label class="form-label">Catalog Status</label>
              <select class="form-select" id="cat-status">
                <option value="Active" ${existing?.status !== 'Inactive' ? 'selected' : ''}>Active</option>
                <option value="Inactive" ${existing?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Service Description *</label>
            <textarea class="form-control" id="cat-desc" rows="3" placeholder="Brief description of service offerings for customers..." required>${existing?.description || ''}</textarea>
          </div>

          <div class="form-group" style="display:flex; align-items:center; gap:0.5rem;">
            <input type="checkbox" id="cat-popular" ${existing?.popular ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
            <label for="cat-popular" style="margin:0; font-weight:600; cursor:pointer;">Highlight as "Popular Service" Badge</label>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-secondary" onclick="if(window.ModalComponent) window.ModalComponent.close(); else document.getElementById('active-modal-overlay')?.remove();">Cancel</button>
            <button type="submit" class="btn btn-success">💾 ${serviceId ? 'Update Service' : 'Create New Service'}</button>
          </div>
        </form>
      `;

      const modal = ModalComponent || window.ModalComponent;
      if (modal) {
        modal.show({
          title: serviceId ? `✏️ Edit Service Offering` : `➕ Create New Service Offering`,
          bodyHTML: modalHTML,
          width: '650px'
        });
      }
    };

    window.saveCatalogForm = async (serviceId) => {
      const title = document.getElementById('cat-title')?.value.trim();
      const category = document.getElementById('cat-category')?.value.trim();
      const startingPrice = document.getElementById('cat-price')?.value.trim();
      const icon = document.getElementById('cat-icon')?.value.trim() || '📄';
      const status = document.getElementById('cat-status')?.value || 'Active';
      const description = document.getElementById('cat-desc')?.value.trim();
      const popular = document.getElementById('cat-popular')?.checked || false;

      if (!title || !startingPrice || !description) {
        NotificationService.showToast('Please fill out all required service fields.', 'warning');
        return;
      }

      await DBService.saveCatalogItem({
        ...(serviceId ? { id: serviceId } : {}),
        title,
        category,
        startingPrice,
        icon,
        status,
        description,
        popular
      });

      if (window.ModalComponent) window.ModalComponent.close();
      NotificationService.showToast(serviceId ? 'Service catalog item updated!' : 'New service offering added!', 'success');
      this.renderCatalog();
    };

    window.deleteCatalogItem = async (serviceId) => {
      if (confirm('Are you sure you want to delete this service from the catalog?')) {
        await DBService.deleteCatalogItem(serviceId);
        NotificationService.showToast('Service deleted from catalog.', 'info');
        this.renderCatalog();
      }
    };
  }
};
