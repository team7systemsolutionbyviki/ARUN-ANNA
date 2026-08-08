/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - ADMIN VIEWS MODULE
   ========================================================================== */

import { AuthService } from '../services/auth-service.js';
import { DBService } from '../services/db-service.js';
import { PricingEngine } from '../services/pricing-engine.js';
import { NotificationService } from '../services/notification-service.js';
import { ChartsEngine } from '../components/charts.js';
import { InvoiceComponent } from '../components/invoice.js';
import { formatCurrency, getStatusBadgeHTML, formatDate, formatTime } from '../utils/formatters.js';
import { exportToCSV } from '../utils/export-excel.js';

export const AdminViews = {
  // --- ADMIN LOGIN PAGE ---
  renderLogin() {
    const app = document.getElementById('app-content');
    app.innerHTML = `
      <section style="min-height:80vh; display:flex; align-items:center; justify-content:center; padding:2rem 0;">
        <div class="glass-panel glow-effect" style="width:100%; max-width:440px; padding:2.5rem;">
          <div class="text-center mb-4">
            <div class="nav-brand-logo" style="margin:0 auto 1rem; width:54px; height:54px; font-size:1.6rem;">T7</div>
            <h2 style="font-size:1.75rem;">Admin Portal</h2>
            <p class="text-muted" style="font-size:0.875rem;">TEAM 7 SYSTEM SOLUTION Management</p>
          </div>

          <form id="admin-login-form">
            <div class="form-group">
              <label class="form-label">Admin Email</label>
              <input type="email" class="form-control" id="login-email" value="admin@team7.com" required>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" id="login-password" value="admin123" required>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full mt-2 glow-effect">Sign In to Dashboard</button>
          </form>

          <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border-color); text-align:center; font-size:0.8rem; color:var(--text-muted);">
            🔑 Demo Login: <b>admin@team7.com</b> / <b>admin123</b>
          </div>
        </div>
      </section>
    `;

    document.getElementById('admin-login-form').onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      const res = await AuthService.loginAdmin(email, password);
      if (res.success) {
        NotificationService.showToast('Welcome back, Admin!', 'success');
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
    const app = document.getElementById('app-content');

    app.innerHTML = `
      <div class="dashboard-wrapper">
        <!-- Sidebar Navigation -->
        <aside class="sidebar" id="admin-sidebar">
          <div class="sidebar-header">
            <div class="nav-brand-logo" style="width:34px; height:34px; font-size:1.1rem;">T7</div>
            <span>TEAM 7 ADMIN</span>
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
    
    // Metrics Calculations
    const todayRevenue = orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
    const pendingVerification = orders.filter(o => o.status === 'Waiting Verification').length;
    const printingQueue = orders.filter(o => o.status === 'Printing').length;
    const readyCount = orders.filter(o => o.status === 'Ready for Pickup').length;
    const completedCount = orders.filter(o => o.status === 'Completed').length;

    const html = `
      <!-- Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon" style="background:rgba(99,102,241,0.15); color:var(--primary);">💰</div>
          <div>
            <div class="metric-val">${formatCurrency(todayRevenue)}</div>
            <div class="metric-title">Total Revenue</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon" style="background:rgba(59,130,246,0.15); color:#2563eb;">📄</div>
          <div>
            <div class="metric-val">${orders.length}</div>
            <div class="metric-title">Total Orders</div>
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
                <th>Paper / Color</th>
                <th>Amount</th>
                <th>Payment UTR</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${orders.slice(0, 5).map(o => `
                <tr>
                  <td><b>${o.id}</b></td>
                  <td>${o.customerName}<br><span class="text-muted" style="font-size:0.8rem;">${o.customerPhone}</span></td>
                  <td>${o.options?.paperSize || 'A4'} • ${o.options?.colorMode || 'B&W'}</td>
                  <td><b>${formatCurrency(o.pricing?.total)}</b></td>
                  <td><code>${o.payment?.utr || 'N/A'}</code></td>
                  <td>${getStatusBadgeHTML(o.status)}</td>
                  <td>
                    <button class="btn btn-sm btn-secondary" onclick="window.location.hash='#admin-orders?id=${o.id}'">Inspect</button>
                  </td>
                </tr>
              `).join('')}
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
        <div class="table-toolbar">
          <h3>Order Management Pipeline (${orders.length} orders)</h3>
          
          <div style="display:flex; gap:0.75rem;">
            <input type="text" class="form-control" id="order-search-field" placeholder="Search ID, Name, Phone, UTR..." value="${paramId}">
            <select class="form-select" id="order-status-filter">
              <option value="">All Statuses</option>
              <option value="Waiting Verification">Waiting Verification</option>
              <option value="Payment Approved">Payment Approved</option>
              <option value="Printing">Printing</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="orders-main-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Info</th>
                <th>Files</th>
                <th>Specs & Copies</th>
                <th>Amount</th>
                <th>UTR Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr id="order-row-${o.id}">
                  <td>
                    <b>${o.id}</b>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${formatDate(o.createdAt)}</div>
                  </td>
                  <td>
                    <b>${o.customerName}</b><br>
                    <span style="font-size:0.825rem; color:var(--text-muted);">${o.customerPhone}</span>
                  </td>
                  <td>
                    ${(o.files || []).map((f, fIdx) => `
                      <div style="margin-bottom:0.5rem; background:var(--bg-card); padding:0.4rem 0.6rem; border-radius:6px; border:1px solid var(--border-color);">
                        <div style="font-size:0.8rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;" title="${f.name}">📄 ${f.name}</div>
                        <div style="display:flex; gap:0.35rem; margin-top:0.25rem;">
                          <button class="btn btn-sm btn-outline" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="window.previewOrderFile('${o.id}', ${fIdx})">👁️ Preview</button>
                          <button class="btn btn-sm btn-primary" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="window.downloadOrderFile('${o.id}', ${fIdx})">📥 Download</button>
                        </div>
                      </div>
                    `).join('')}
                  </td>
                  <td>
                    <span style="font-size:0.85rem;">${o.options?.paperSize} (${o.options?.paperQuality})</span><br>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${o.options?.colorMode} • ${o.options?.copies} copy(ies) • ${o.options?.binding} binding</span>
                  </td>
                  <td><b>${formatCurrency(o.pricing?.total)}</b></td>
                  <td>
                    <code>${o.payment?.utr || 'N/A'}</code><br>
                    <button class="btn btn-sm btn-outline" style="font-size:0.7rem; padding:0.2rem 0.5rem; margin-top:0.35rem;" onclick="window.viewOrderScreenshot('${o.id}')">🖼️ View Screenshot</button>
                  </td>
                  <td>
                    <select class="form-select" style="font-size:0.8rem; padding:0.35rem 0.5rem;" onchange="window.updateOrderStatusFromTable('${o.id}', this.value)">
                      <option value="Waiting Verification" ${o.status === 'Waiting Verification' ? 'selected' : ''}>Waiting Verification</option>
                      <option value="Payment Approved" ${o.status === 'Payment Approved' ? 'selected' : ''}>Payment Approved</option>
                      <option value="Printing" ${o.status === 'Printing' ? 'selected' : ''}>Printing</option>
                      <option value="Ready for Pickup" ${o.status === 'Ready for Pickup' ? 'selected' : ''}>Ready for Pickup</option>
                      <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>Completed</option>
                      <option value="Rejected" ${o.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                  </td>
                  <td>
                    <a href="#admin-orders?invoice=${o.id}" class="btn btn-sm btn-secondary" title="Tax Invoice">🧾 Invoice</a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    await this.renderAdminLayout('orders', html);

    // Global Order Action Helpers
    window.downloadOrderFile = async (orderId, fileIndex) => {
      const order = await DBService.getOrderById(orderId);
      if (!order || !order.files || !order.files[fileIndex]) {
        NotificationService.showToast('File not found', 'error');
        return;
      }
      const file = order.files[fileIndex];
      let url = file.url;

      if (!url) {
        NotificationService.showToast('File data URL unavailable', 'error');
        return;
      }

      if (url.startsWith('data:')) {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        url = URL.createObjectURL(blob);
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

      if (file.url && (file.url.startsWith('data:image') || file.url.match(/\.(jpeg|jpg|png|gif|svg)$/i))) {
        previewHTML = `<div style="text-align:center;"><img src="${file.url}" style="max-width:100%; max-height:65vh; border-radius:8px; border:1px solid var(--border-color);" /></div>`;
      } else if (file.url && file.url.startsWith('data:application/pdf')) {
        previewHTML = `<iframe src="${file.url}" style="width:100%; height:65vh; border:none; border-radius:8px;"></iframe>`;
      } else {
        previewHTML = `
          <div style="text-align:center; padding:2.5rem; background:var(--primary-light); border-radius:12px;">
            <div style="font-size:3.5rem;">📄</div>
            <h3 style="margin-top:0.5rem; font-size:1.3rem;">${file.name}</h3>
            <p style="color:var(--text-muted); font-size:0.875rem; margin-top:0.25rem;">Size: ${file.size || 'N/A'} • ~${file.pages || 1} page(s)</p>
          </div>
        `;
      }

      window.ModalComponent.show({
        title: `Preview Document - ${file.name}`,
        bodyHTML: previewHTML,
        footerHTML: `
          <button class="btn btn-primary" onclick="window.downloadOrderFile('${orderId}', ${fileIndex})">📥 Download File</button>
          <button class="btn btn-secondary" onclick="window.ModalComponent.close()">Close</button>
        `,
        width: '750px'
      });
    };

    window.viewOrderScreenshot = async (orderId) => {
      const order = await DBService.getOrderById(orderId);
      if (!order) {
        NotificationService.showToast('Order not found', 'error');
        return;
      }

      const pay = order.payment || {};
      let bodyHTML = '';

      if (pay.screenshotUrl && pay.screenshotUrl.startsWith('data:image')) {
        bodyHTML = `
          <div style="text-align:center;">
            <img src="${pay.screenshotUrl}" alt="Payment Screenshot" style="max-width:100%; max-height:65vh; border-radius:12px; border:1px solid var(--border-color); box-shadow:var(--shadow-md);" />
            <div style="margin-top:1rem; font-size:0.9rem; color:var(--text-muted);">
              UTR: <b style="color:var(--text-main);">${pay.utr || 'N/A'}</b> | Payer Name: <b style="color:var(--text-main);">${pay.payerName || 'N/A'}</b>
            </div>
          </div>
        `;
      } else {
        bodyHTML = `
          <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:white; padding:2rem; border-radius:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:1rem; margin-bottom:1.5rem;">
              <div>
                <div style="color:#10b981; font-weight:700; font-size:0.85rem; text-transform:uppercase;">✓ UPI Payment Details</div>
                <h3 style="font-size:1.4rem; margin-top:0.2rem;">TEAM 7 SYSTEM SOLUTION</h3>
              </div>
              <div style="font-size:2.5rem;">📱</div>
            </div>

            <div style="margin-bottom:1.5rem;">
              <div style="font-size:0.8rem; color:#94a3b8; text-transform:uppercase;">Total Amount Paid</div>
              <div style="font-size:2.25rem; font-weight:800; color:#38bdf8;">${formatCurrency(order.pricing?.total)}</div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
              <div>
                <div style="font-size:0.75rem; color:#94a3b8;">12-DIGIT UTR / REF NO.</div>
                <div style="font-size:1.1rem; font-weight:700; font-family:monospace; color:#f1f5f9;">${pay.utr || '329817264512'}</div>
              </div>
              <div>
                <div style="font-size:0.75rem; color:#94a3b8;">PAYER NAME</div>
                <div style="font-size:1.05rem; font-weight:700; color:#f1f5f9;">${pay.payerName || order.customerName}</div>
              </div>
            </div>

            <div style="margin-top:1.25rem; font-size:0.8rem; color:#94a3b8; text-align:center;">
              Transaction Verified for Order ID: ${order.id}
            </div>
          </div>
        `;
      }

      window.ModalComponent.show({
        title: `Payment Receipt Inspection - ${order.id}`,
        bodyHTML: bodyHTML,
        footerHTML: `<button class="btn btn-secondary" onclick="window.ModalComponent.close()">Close</button>`,
        width: '650px'
      });
    };

    window.updateOrderStatusFromTable = async (orderId, newStatus) => {
      await DBService.updateOrderStatus(orderId, newStatus);
      NotificationService.showToast(`Order ${orderId} updated to '${newStatus}'`, 'success');
    };

    // Table Search Filter Logic
    const searchField = document.getElementById('order-search-field');
    const statusFilter = document.getElementById('order-status-filter');

    const applyFilters = () => {
      const q = searchField.value.toLowerCase();
      const st = statusFilter.value;
      orders.forEach(o => {
        const row = document.getElementById(`order-row-${o.id}`);
        if (!row) return;
        const matchQ = o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q) || (o.payment?.utr || '').toLowerCase().includes(q);
        const matchSt = !st || o.status === st;
        row.style.display = (matchQ && matchSt) ? '' : 'none';
      });
    };

    searchField?.addEventListener('input', applyFilters);
    statusFilter?.addEventListener('change', applyFilters);
    if (paramId) applyFilters();
  },

  // --- PRICING MANAGEMENT EDITOR ---
  async renderPricing() {
    const pricing = PricingEngine.getPricingData();

    const html = `
      <div class="table-card mb-4">
        <div class="table-toolbar">
          <div>
            <h3>Dynamic Price Manager</h3>
            <p class="text-muted" style="font-size:0.85rem;">Modify costs for paper sizes, GSM qualities, binding, and color modes instantly without code changes.</p>
          </div>
          <button class="btn btn-success" id="btn-save-all-pricing">💾 Save Price Updates</button>
        </div>

        <div style="padding:1.5rem; display:grid; grid-template-columns:1fr 1fr; gap:2rem;">
          <!-- Paper Base Rates -->
          <div>
            <h4 style="margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">📄 Paper Size Base Rates (₹)</h4>
            ${Object.entries(pricing.paperSizes).map(([size, item]) => `
              <div class="form-group">
                <label class="form-label">${size} Base Rate (per page)</label>
                <input type="number" step="0.25" class="form-control price-input-field" data-type="paperSizes" data-key="${size}" data-prop="baseRate" value="${item.baseRate}">
              </div>
            `).join('')}
          </div>

          <!-- Binding Costs -->
          <div>
            <h4 style="margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">📚 Book Binding Costs (₹)</h4>
            ${Object.entries(pricing.bindings).map(([name, item]) => `
              <div class="form-group">
                <label class="form-label">${name} Binding Rate</label>
                <input type="number" step="5" class="form-control price-input-field" data-type="bindings" data-key="${name}" data-prop="price" value="${item.price}">
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    await this.renderAdminLayout('pricing', html);

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

      PricingEngine.savePricingData(pricing);
      NotificationService.showToast('Pricing structure saved successfully across system!', 'success');
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

  // --- REPORTS & ANALYTICS ---
  async renderReports() {
    const orders = await DBService.getOrders();
    const totalRev = orders.reduce((acc, o) => acc + (o.pricing?.total || 0), 0);

    const html = `
      <div class="table-card mb-4">
        <div class="table-toolbar">
          <h3>Business Performance Reports</h3>
          <button class="btn btn-sm btn-primary" id="btn-export-sales-csv">📥 Download Sales CSV</button>
        </div>

        <div style="padding:1.5rem; display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.5rem;">
          <div class="glass-panel" style="padding:1.5rem;">
            <h4 style="color:var(--text-muted); font-size:0.85rem; text-transform:uppercase;">Total Lifetime Revenue</h4>
            <div style="font-size:2rem; font-weight:800; color:var(--primary); margin-top:0.5rem;">${formatCurrency(totalRev)}</div>
          </div>

          <div class="glass-panel" style="padding:1.5rem;">
            <h4 style="color:var(--text-muted); font-size:0.85rem; text-transform:uppercase;">Total Volume Printed</h4>
            <div style="font-size:2rem; font-weight:800; color:var(--accent); margin-top:0.5rem;">${orders.length} Orders</div>
          </div>

          <div class="glass-panel" style="padding:1.5rem;">
            <h4 style="color:var(--text-muted); font-size:0.85rem; text-transform:uppercase;">Average Order Value</h4>
            <div style="font-size:2rem; font-weight:800; color:var(--success); margin-top:0.5rem;">${formatCurrency(orders.length ? totalRev / orders.length : 0)}</div>
          </div>
        </div>
      </div>
    `;

    await this.renderAdminLayout('reports', html);

    document.getElementById('btn-export-sales-csv').onclick = () => {
      const exportRows = orders.map(o => ({
        OrderID: o.id,
        Date: formatDate(o.createdAt),
        Customer: o.customerName,
        Phone: o.customerPhone,
        Total: o.pricing?.total || 0,
        Status: o.status,
        UTR: o.payment?.utr || ''
      }));
      exportToCSV('Team7_SalesReport.csv', exportRows);
      NotificationService.showToast('Sales Report exported!', 'success');
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

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="form-group">
              <label class="form-label">Contact Phone</label>
              <input type="text" class="form-control" id="st-phone" value="${settings.phone}">
            </div>

            <div class="form-group">
              <label class="form-label">Contact Email</label>
              <input type="email" class="form-control" id="st-email" value="${settings.email}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Shop Address</label>
            <textarea class="form-control" id="st-address">${settings.address}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Google Map Embed URL</label>
            <input type="text" class="form-control" id="st-map" value="${settings.googleMapUrl}">
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
      settings.email = document.getElementById('st-email').value;
      settings.address = document.getElementById('st-address').value;
      settings.googleMapUrl = document.getElementById('st-map').value;

      await DBService.saveSettings(settings);
      NotificationService.showToast('Shop Settings updated successfully!', 'success');
    };
  }
};
