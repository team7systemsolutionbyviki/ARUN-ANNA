/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - CUSTOMER PORTAL VIEWS
   ========================================================================== */

import { AuthService } from '../services/auth-service.js';
import { DBService } from '../services/db-service.js';
import { formatCurrency, getStatusBadgeHTML, formatDate } from '../utils/formatters.js';

export const CustomerViews = {
  async renderCustomerDashboard() {
    const user = AuthService.getCurrentUser();
    const app = document.getElementById('app-content');

    // If customer is not logged in, display Phone Login / Order Lookup Form
    if (!user) {
      app.innerHTML = `
        <section style="min-height:75vh; display:flex; align-items:center; justify-content:center; padding:3rem 1rem;">
          <div class="glass-panel glow-effect" style="width:100%; max-width:440px; padding:2.5rem;">
            <div class="text-center mb-4">
              <div style="font-size:3rem; margin-bottom:0.5rem;">📱</div>
              <h2 style="font-size:1.75rem;">Customer Portal Access</h2>
              <p class="text-muted" style="font-size:0.875rem; margin-top:0.35rem;">Enter your mobile phone number to view all your document print orders and live status timeline.</p>
            </div>
            <form id="cust-login-form" onsubmit="event.preventDefault(); window.handleCustomerLogin();">
              <div class="form-group mb-3">
                <label class="form-label">Customer Mobile Phone Number *</label>
                <input type="tel" class="form-control" id="cust-login-phone" placeholder="E.g., 9876543210" required autofocus>
              </div>
              <div class="form-group mb-4">
                <label class="form-label">Your Name (Optional)</label>
                <input type="text" class="form-control" id="cust-login-name" placeholder="E.g., Ananya Sharma">
              </div>
              <button type="submit" class="btn btn-primary w-full glow-effect">Access My Dashboard ➔</button>
            </form>
            <div class="text-center mt-4">
              <a href="#order" class="btn btn-sm btn-outline" style="font-size:0.8rem;">+ Place New Order Instead</a>
            </div>
          </div>
        </section>
      `;

      window.handleCustomerLogin = () => {
        const phone = document.getElementById('cust-login-phone')?.value.trim();
        const name = document.getElementById('cust-login-name')?.value.trim() || 'Valued Customer';
        if (!phone) return;
        AuthService.loginCustomer(phone, name);
        this.renderCustomerDashboard();
      };
      return;
    }

    const orders = await DBService.getOrders();
    const userPhoneClean = (user.phone || '').replace(/\D/g, '');
    const myOrders = orders.filter(o => {
      const oPhoneClean = (o.customerPhone || '').replace(/\D/g, '');
      return (userPhoneClean && oPhoneClean && oPhoneClean === userPhoneClean) ||
             (user.displayName && o.customerName === user.displayName);
    });

    app.innerHTML = `
      <section style="padding: 3rem 0;">
        <div class="container">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
            <div>
              <h1 style="font-size:2.25rem;">My Customer Portal</h1>
              <p class="text-muted">Logged in as: <b>${user.displayName}</b> (${user.phone || 'Guest'})</p>
            </div>
            <button class="btn btn-outline btn-sm" id="cust-logout-btn">🚪 Switch Phone / Logout</button>
          </div>

          <div class="table-card">
            <div class="table-toolbar">
              <h3>My Order History (${myOrders.length} orders)</h3>
              <a href="#order" class="btn btn-sm btn-primary">+ Place New Print Order</a>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Specifications & Files</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${myOrders.length === 0 ? `
                    <tr>
                      <td colspan="6" class="text-center text-muted" style="padding:3.5rem;">
                        <div style="font-size:2.5rem; margin-bottom:0.5rem;">📄</div>
                        <h4>No print orders found for ${user.phone || user.displayName}</h4>
                        <p style="font-size:0.875rem; margin-top:0.25rem;">If you recently submitted an order, make sure you used this phone number.</p>
                        <a href="#order" class="btn btn-sm btn-primary mt-3">+ Place New Order Now</a>
                      </td>
                    </tr>
                  ` : myOrders.map(o => {
                    const filesList = (o.files && o.files.length > 0) ? o.files : (o.file ? [o.file] : []);
                    const firstFile = filesList[0] || {};
                    const opts = firstFile.options || o.options || {};
                    const specSummary = `${opts.paperSize || 'A4'} (${opts.paperQuality || '70 GSM'}, ${opts.colorMode || 'B&W'}) • ${opts.copies || 1} copy(ies)${filesList.length > 1 ? ` (${filesList.length} PDFs)` : ''}`;

                    return `
                    <tr>
                      <td>
                        <b>${o.id}</b>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${formatDate(o.createdAt)}</div>
                      </td>
                      <td>${formatDate(o.createdAt)}</td>
                      <td>
                        <div style="font-weight:600; font-size:0.875rem;">${specSummary}</div>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
                          ${filesList.map(f => f.name || 'Document.pdf').join(', ')}
                        </div>
                      </td>
                      <td><b>${formatCurrency(o.pricing?.total)}</b></td>
                      <td>${getStatusBadgeHTML(o.status)}</td>
                      <td>
                        <a href="#track?id=${o.id}" class="btn btn-sm btn-secondary">🔍 Track Order</a>
                      </td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    `;

    document.getElementById('cust-logout-btn').onclick = async () => {
      await AuthService.logout();
      this.renderCustomerDashboard();
    };
  }
};
