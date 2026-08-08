/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - ADMIN VIEWS MODULE
   ========================================================================== */

import { AuthService } from '../services/auth-service.js';
import { DBService } from '../services/db-service.js';
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
                        📄 ${f.name || `Document_${idx+1}.pdf`} <span style="font-size:0.7rem; color:var(--text-muted);">(${f.pages || 1} pgs)</span>
                      </div>
                    `).join('')}
                  </td>
                  <td>
                    ${filesList.map((f, idx) => `
                      <div style="font-size:0.75rem;">
                        ${filesList.length > 1 ? `<b>Doc ${idx+1}:</b> ` : ''}${(f.options || o.options)?.paperSize || 'A4'} • ${(f.options || o.options)?.colorMode || 'B&W'} • ${(f.options || o.options)?.copies || 1} copy
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
              `;}).join('')}
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
              <option value="Rejected">Rejected</option>
            </select>
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
                <th>Specs & Copies</th>
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
                        <div style="font-size:0.8rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;" title="${f.name || 'Document.pdf'}">📄 ${f.name || `Document_${fIdx+1}.pdf`} <span style="font-size:0.7rem; color:var(--text-muted);">(${f.pages || 1} pgs)</span></div>
                        <div style="display:flex; gap:0.35rem; margin-top:0.25rem;">
                          <button class="btn btn-sm btn-outline" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="window.previewOrderFile('${o.id}', ${fIdx})">👁️ Preview</button>
                          <button class="btn btn-sm btn-primary" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="window.downloadOrderFile('${o.id}', ${fIdx})">📥 Download</button>
                        </div>
                      </div>
                    `).join('')}
                  </td>
                  <td>
                    ${filesList.map((f, fIdx) => `
                      <div style="margin-bottom:0.35rem; padding-bottom:0.35rem; ${fIdx < filesList.length - 1 ? 'border-bottom:1px dashed var(--border-color);' : ''}">
                        <div style="font-size:0.8rem; font-weight:600;">${filesList.length > 1 ? `Doc ${fIdx + 1}: ` : ''}${(f.options || o.options)?.paperSize || 'A4'} (${(f.options || o.options)?.paperQuality || '70 GSM'})</div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${(f.options || o.options)?.colorMode || 'B&W'} • ${(f.options || o.options)?.copies || 1} copy(ies) ${(f.options || o.options)?.binding && (f.options || o.options).binding !== 'None' ? `• ${(f.options || o.options).binding} binding` : ''}</div>
                      </div>
                    `).join('')}
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

      const isImageDataUri = file.url && file.url.startsWith('data:image');
      const isImageFileExt = (file.url && file.url.match(/\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i)) ||
                             (file.name && file.name.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i));

      const isImage = isImageDataUri || isImageFileExt;

      if (isImage) {
        previewHTML = `
          <div style="text-align:center; padding:0.5rem; background:var(--bg-card); border-radius:8px;">
            <img src="${file.url}" alt="${file.name}" style="max-width:100%; max-height:68vh; border-radius:8px; border:1px solid var(--border-color); box-shadow:var(--shadow-md); object-fit:contain;" />
          </div>
        `;
      } else if (file.url) {
        let viewUrl = file.url;
        let activeBlobUrl = null;

        // Convert base64 data:application/pdf to Blob URL on the fly so Chrome iframe security policy permits embedding
        if (viewUrl.startsWith('data:application/pdf')) {
          try {
            const arr = viewUrl.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            activeBlobUrl = URL.createObjectURL(blob);
            viewUrl = activeBlobUrl;
          } catch (err) {
            console.warn('PDF Data URL to Blob conversion failed:', err);
          }
        }

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
            ${file.url ? `<button class="btn btn-primary" onclick="window.downloadOrderFile('${orderId}', ${fileIndex})">📥 Download File</button>` : ''}
            ${file.url ? `<button class="btn btn-outline" onclick="window.openFullScreenFile('${orderId}', ${fileIndex})">🔗 Open Full Screen ↗</button>` : ''}
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
      let url = file.url;
      if (!url) {
        NotificationService.showToast('File URL unavailable', 'error');
        return;
      }

      if (url.startsWith('data:')) {
        try {
          const arr = url.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          url = URL.createObjectURL(blob);
        } catch (e) {
          console.warn('Blob conversion error:', e);
        }
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
      let bodyHTML = '';

      if (pay.screenshotUrl && pay.screenshotUrl.trim() !== '') {
        bodyHTML = `
          <div style="text-align:center; padding:0.5rem;">
            <img src="${pay.screenshotUrl}" alt="Payment Screenshot" style="max-width:100%; max-height:65vh; border-radius:12px; border:1px solid var(--border-color); box-shadow:var(--shadow-md); display:inline-block;" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'text-center text-muted\\' style=\\'padding:2rem;\\'>⚠️ Screenshot preview unavailable or expired.<br><a href=\\'${pay.screenshotUrl}\\' target=\\'_blank\\' class=\\'btn btn-sm btn-primary mt-2\\'>Open Link in New Tab</a></div>';" />
            <div style="margin-top:1rem; font-size:0.9rem; background:var(--bg-card); padding:0.75rem 1rem; border-radius:8px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
              <div>UTR / Ref: <b style="color:var(--primary); font-family:monospace;">${pay.utr || 'N/A'}</b></div>
              <div>Payer Name: <b>${pay.payerName || order.customerName}</b></div>
            </div>
          </div>
        `;
      } else {
        bodyHTML = `
          <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:white; padding:2rem; border-radius:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:1rem; margin-bottom:1.5rem;">
              <div>
                <div style="color:#10b981; font-weight:700; font-size:0.85rem; text-transform:uppercase;">✓ UPI Payment Verification</div>
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
                <div style="font-size:1.1rem; font-weight:700; font-family:monospace; color:#f1f5f9;">${pay.utr || 'N/A'}</div>
              </div>
              <div>
                <div style="font-size:0.75rem; color:#94a3b8;">PAYER NAME</div>
                <div style="font-size:1.05rem; font-weight:700; color:#f1f5f9;">${pay.payerName || order.customerName}</div>
              </div>
            </div>

            <div style="margin-top:1.25rem; font-size:0.8rem; color:#94a3b8; text-align:center;">
              No payment screenshot file was attached for this order.
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

    window.updateOrderStatusFromTable = async (orderId, newStatus) => {
      await DBService.updateOrderStatus(orderId, newStatus);
      NotificationService.showToast(`Order ${orderId} updated to '${newStatus}'`, 'success');
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

          <!-- Area-Wise Delivery Charges -->
          <div style="grid-column: span 2; border-top:1px solid var(--border-color); padding-top:1.5rem; margin-top:0.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
              <h4 style="margin:0;">🚚 Area-Wise Delivery Charges & Zones</h4>
              <button class="btn btn-sm btn-primary" onclick="window.openAddDeliveryZoneModal()">➕ Add New Delivery Zone / Fee</button>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
              ${Object.entries(pricing.deliveryZones || {}).map(([zone, item]) => `
                <div class="glass-panel" style="padding:1.1rem; border-radius:12px; position:relative;">
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
            </div>
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
