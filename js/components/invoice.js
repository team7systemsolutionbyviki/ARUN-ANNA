/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - TAX INVOICE COMPONENT
   ========================================================================== */

import { formatCurrency, formatDate } from '../utils/formatters.js';

export const InvoiceComponent = {
  renderHTML(order, shopSettings) {
    const opts = order.options || {};
    const pricing = order.pricing || {};

    return `
      <div class="invoice-container" id="printable-invoice">
        <div class="no-print" style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center;">
          <a href="#admin-orders" class="btn btn-sm btn-secondary">← Back to Orders</a>
          <div style="display:flex; gap:0.5rem;">
            <button onclick="if(window.sendWhatsAppInvoice) window.sendWhatsAppInvoice('${order.id}')" class="btn btn-sm btn-success">💬 Send via WhatsApp</button>
            <button onclick="window.print()" class="btn btn-sm btn-primary">🖨️ Print Invoice</button>
          </div>
        </div>

        <div class="invoice-header">
          <div>
            <h2 style="color:var(--primary); font-size:1.6rem; font-weight:800; font-family:'Outfit', sans-serif;">${shopSettings.shopName}</h2>
            <p style="font-size:0.85rem; color:#64748b; margin-top:0.25rem;">${shopSettings.address}</p>
            <p style="font-size:0.85rem; color:#64748b;">Phone: ${shopSettings.phone} | Email: ${shopSettings.email}</p>
            <p style="font-size:0.85rem; font-weight:700; color:#0f172a; margin-top:0.35rem;">GSTIN: ${shopSettings.gstNumber}</p>
          </div>
          <div style="text-align:right;">
            <h1 style="font-size:1.8rem; letter-spacing:0.05em; color:#0f172a;">TAX INVOICE</h1>
            <p style="font-weight:700; font-size:1.1rem; color:var(--primary); margin-top:0.25rem;">${order.id}</p>
            <p style="font-size:0.85rem; color:#64748b;">Date: ${formatDate(order.createdAt)}</p>
          </div>
        </div>

        <!-- Customer & Order Specs -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-bottom:1.5rem;">
          <div style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0;">
            <h4 style="margin-bottom:0.5rem; font-size:0.9rem; text-transform:uppercase; color:#64748b;">Billed To:</h4>
            <p style="font-weight:700; font-size:1.05rem;">${order.customerName}</p>
            <p style="font-size:0.875rem;">Phone: ${order.customerPhone}</p>
            ${order.customerEmail ? `<p style="font-size:0.875rem;">Email: ${order.customerEmail}</p>` : ''}
            ${order.customerAddress ? `<p style="font-size:0.875rem;">Address: ${order.customerAddress}</p>` : ''}
          </div>

          <div style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0;">
            <h4 style="margin-bottom:0.5rem; font-size:0.9rem; text-transform:uppercase; color:#64748b;">Print Specifications:</h4>
            <p style="font-size:0.875rem;"><b>Paper:</b> ${opts.paperSize} (${opts.paperQuality})</p>
            <p style="font-size:0.875rem;"><b>Color & Side:</b> ${opts.colorMode} | ${opts.printSide} Side</p>
            <p style="font-size:0.875rem;"><b>Binding & Lamination:</b> ${opts.binding} Binding | Lamination: ${opts.lamination}</p>
            <p style="font-size:0.875rem;"><b>Quantity:</b> ${opts.copies} Copy(ies)</p>
          </div>
        </div>

        <!-- Item Table -->
        <table class="invoice-table">
          <thead>
            <tr style="background:#f1f5f9; font-weight:700;">
              <th>Description</th>
              <th>Qty / Pages</th>
              <th>Rate</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Printing & Paper (${opts.paperSize}, ${opts.paperQuality}, ${opts.colorMode})</td>
              <td>${pricing.totalPages || 1} pgs x ${opts.copies} copies</td>
              <td>Base</td>
              <td style="text-align:right;">${formatCurrency(pricing.paperCost + pricing.colorCost)}</td>
            </tr>
            ${pricing.bindingCost > 0 ? `
              <tr>
                <td>${opts.binding} Binding</td>
                <td>${opts.copies} unit(s)</td>
                <td>-</td>
                <td style="text-align:right;">${formatCurrency(pricing.bindingCost)}</td>
              </tr>
            ` : ''}
            ${pricing.laminationCost > 0 ? `
              <tr>
                <td>Lamination</td>
                <td>${pricing.totalPages || 1} pgs</td>
                <td>-</td>
                <td style="text-align:right;">${formatCurrency(pricing.laminationCost)}</td>
              </tr>
            ` : ''}
            ${pricing.deliveryFee > 0 ? `
              <tr>
                <td>Delivery Charge (${pricing.deliveryZone || 'Doorstep Delivery'})</td>
                <td>1 shipment</td>
                <td>-</td>
                <td style="text-align:right;">${formatCurrency(pricing.deliveryFee)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="invoice-totals">
          <div class="invoice-totals-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(pricing.subtotal)}</span>
          </div>
          ${pricing.discount > 0 ? `
            <div class="invoice-totals-row" style="color:#059669;">
              <span>Discount:</span>
              <span>-${formatCurrency(pricing.discount)}</span>
            </div>
          ` : ''}
          <div class="invoice-totals-row">
            <span>CGST + SGST (${shopSettings.gstPercentage}%):</span>
            <span>${formatCurrency(pricing.gst)}</span>
          </div>
          <div class="invoice-totals-row" style="border-top:2px solid #0f172a; padding-top:0.5rem; margin-top:0.5rem; font-weight:800; font-size:1.2rem; color:var(--primary);">
            <span>Grand Total:</span>
            <span>${formatCurrency(pricing.total)}</span>
          </div>
        </div>

        <!-- Payment Info Footer -->
        <div style="margin-top:2.5rem; border-top:1px solid #e2e8f0; padding-top:1rem; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#64748b;">
          <div>
            <p><b>Payment Status:</b> <span style="color:#059669; font-weight:700;">${order.payment?.status || 'Paid via UPI'}</span></p>
            <p><b>UPI UTR Ref:</b> ${order.payment?.utr || 'N/A'}</p>
          </div>
          <div style="text-align:right;">
            <p style="font-weight:700; color:#0f172a;">Thank you for choosing ${shopSettings.shopName}!</p>
            <p>Computer Generated Tax Invoice - No Signature Required.</p>
          </div>
        </div>
      </div>
    `;
  }
};
