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

    if (!user) {
      window.location.hash = '#order';
      return;
    }

    const orders = await DBService.getOrders();
    const myOrders = orders.filter(o => o.customerPhone === user.phone || o.customerName === user.displayName);

    app.innerHTML = `
      <section style="padding: 3rem 0;">
        <div class="container">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
            <div>
              <h1 style="font-size:2.25rem;">My Customer Portal</h1>
              <p class="text-muted">Logged in as: <b>${user.displayName}</b> (${user.phone})</p>
            </div>
            <button class="btn btn-outline" id="cust-logout-btn">Sign Out</button>
          </div>

          <div class="table-card">
            <div class="table-toolbar">
              <h3>My Order History (${myOrders.length})</h3>
              <a href="#order" class="btn btn-sm btn-primary">+ Place New Print Order</a>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Specifications</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${myOrders.length === 0 ? `
                    <tr><td colspan="6" class="text-center text-muted" style="padding:2rem;">No orders placed yet. <a href="#order" style="text-decoration:underline;">Click here to order prints!</a></td></tr>
                  ` : myOrders.map(o => `
                    <tr>
                      <td><b>${o.id}</b></td>
                      <td>${formatDate(o.createdAt)}</td>
                      <td>${o.options?.paperSize} (${o.options?.colorMode}) • ${o.options?.copies} copy(ies)</td>
                      <td><b>${formatCurrency(o.pricing?.total)}</b></td>
                      <td>${getStatusBadgeHTML(o.status)}</td>
                      <td>
                        <a href="#track?id=${o.id}" class="btn btn-sm btn-secondary">🔍 Track Timeline</a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    `;

    document.getElementById('cust-logout-btn').onclick = async () => {
      await AuthService.logout();
      window.location.hash = '#home';
    };
  }
};
