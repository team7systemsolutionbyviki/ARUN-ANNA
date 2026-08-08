/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - AUTOMATIC PRICING ENGINE
   ========================================================================== */

import { DEFAULT_PRICING, DEFAULT_SETTINGS } from '../config/default-data.js';

export const PricingEngine = {
  // Get active pricing data (from settings/DB or fallback)
  getPricingData() {
    const custom = localStorage.getItem('team7_pricing');
    if (custom) {
      try {
        return JSON.parse(custom);
      } catch (e) {}
    }
    return DEFAULT_PRICING;
  },

  // Save updated pricing (Admin action)
  savePricingData(newPricing) {
    localStorage.setItem('team7_pricing', JSON.stringify(newPricing));
  },

  // Calculate order quote instantly
  calculateQuote(options = {}, totalPages = 1) {
    const pricing = this.getPricingData();

    const paperSize = options.paperSize || 'A4';
    const paperQuality = options.paperQuality || '70 GSM';
    const colorMode = options.colorMode || 'Black & White';
    const printSide = options.printSide || 'Single';
    const copies = Math.max(1, parseInt(options.copies) || 1);
    const binding = options.binding || 'None';
    const lamination = options.lamination || 'No';

    const isColor = colorMode === 'Color';

    // Base rate from paper size + quality + side
    const sizeConfig = pricing.paperSizes[paperSize] || { baseRate: 1.50 };
    const qualityConfig = pricing.paperQualities[paperQuality] || { multiplier: 1.0 };
    const sideConfig = pricing.sides[printSide] || { multiplier: 1.0 };
    const colorConfig = pricing.colorModes[colorMode] || { costPerPage: 1.50 };

    const basePaperRate = sizeConfig.baseRate * qualityConfig.multiplier * sideConfig.multiplier;
    // Total per-page rate includes the color/bw cost per page
    const totalRatePerPage = basePaperRate + (colorConfig.costPerPage || 0);
    const totalPrintCost = Number((totalRatePerPage * totalPages * copies).toFixed(2));

    // Route the full print cost into either paperCost (B&W) or colorCost (Color)
    const paperCost = isColor ? 0 : totalPrintCost;
    const colorCost = isColor ? totalPrintCost : 0;

    // Binding Cost
    const bindingConfig = pricing.bindings[binding] || { price: 0 };
    const bindingCost = Number((bindingConfig.price * copies).toFixed(2));

    // Lamination Cost
    const laminationConfig = pricing.lamination[lamination] || { pricePerPage: 0 };
    const laminationCost = Number((laminationConfig.pricePerPage * totalPages * copies).toFixed(2));

    // Bulk Quantity Discount (>= 5 copies = 5% off, >= 10 copies = 10% off)
    let discountPercent = 0;
    if (copies >= 10) discountPercent = 0.10;
    else if (copies >= 5) discountPercent = 0.05;

    const subtotal = Number((totalPrintCost + bindingCost + laminationCost).toFixed(2));
    const discount = Number((subtotal * discountPercent).toFixed(2));
    const total = Number((subtotal - discount).toFixed(2));

    return {
      paperCost,
      colorCost,
      bindingCost,
      laminationCost,
      subtotal,
      gst: 0,
      discount,
      total,
      totalPages,
      copies
    };
  }
};
