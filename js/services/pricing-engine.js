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
        const parsed = JSON.parse(custom);
        if (!parsed.deliveryZones) {
          parsed.deliveryZones = DEFAULT_PRICING.deliveryZones;
        }
        return parsed;
      } catch (e) {}
    }
    return DEFAULT_PRICING;
  },

  // Save updated pricing (Admin action)
  savePricingData(newPricing) {
    localStorage.setItem('team7_pricing', JSON.stringify(newPricing));
  },

  // Parse page range strings e.g. "1-5, 10, 15-20" or "All"
  parsePageRanges(rangeStr, maxPages = 1) {
    if (!rangeStr || typeof rangeStr !== 'string') return new Set();
    const clean = rangeStr.trim();
    if (!clean || clean.toLowerCase() === 'all') {
      const s = new Set();
      for (let i = 1; i <= maxPages; i++) s.add(i);
      return s;
    }

    const pageSet = new Set();
    const parts = clean.split(/[,;\s]+/);

    for (let part of parts) {
      if (!part) continue;
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        let start = parseInt(startStr, 10);
        let end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          if (start > end) [start, end] = [end, start];
          start = Math.max(1, start);
          end = Math.min(maxPages, end);
          for (let p = start; p <= end; p++) {
            pageSet.add(p);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= maxPages) {
          pageSet.add(p);
        }
      }
    }
    return pageSet;
  },

  // Calculate order quote instantly with per-page color & B&W range support
  calculateQuote(options = {}, totalPages = 1) {
    const pricing = this.getPricingData();

    const paperSize = options.paperSize || 'A4';
    const paperQuality = options.paperQuality || '70 GSM';
    const colorMode = options.colorMode || 'Black & White';
    const printSide = options.printSide || 'Single';
    const copies = Math.max(1, parseInt(options.copies) || 1);
    const binding = options.binding || 'None';
    const lamination = options.lamination || 'No';
    const deliveryZone = options.deliveryZone || 'Pickup';

    const maxDocPages = Math.max(1, parseInt(totalPages) || 1);

    // 1. Determine which pages are printed
    const printPagesSet = this.parsePageRanges(options.pageRange || 'All', maxDocPages);
    const printedPagesCount = printPagesSet.size > 0 ? printPagesSet.size : maxDocPages;

    // 2. Determine Color vs B&W pages count
    let colorPagesCount = 0;
    let bwPagesCount = 0;

    if (colorMode === 'Color') {
      colorPagesCount = printedPagesCount;
      bwPagesCount = 0;
    } else if (colorMode === 'Black & White') {
      colorPagesCount = 0;
      bwPagesCount = printedPagesCount;
    } else {
      // Custom Range / Mixed Mode
      const explicitColorSet = this.parsePageRanges(options.colorPageRange || '', maxDocPages);
      // Count how many selected print pages overlap with color set
      for (const p of printPagesSet) {
        if (explicitColorSet.has(p)) {
          colorPagesCount++;
        }
      }
      bwPagesCount = Math.max(0, printedPagesCount - colorPagesCount);
    }

    // Base rates
    const sizeConfig = pricing.paperSizes[paperSize] || { baseRate: 1.50 };
    const qualityConfig = pricing.paperQualities[paperQuality] || { multiplier: 1.0 };
    const sideConfig = pricing.sides[printSide] || { multiplier: 1.0 };

    const colorExtraRate = (pricing.colorModes['Color']?.costPerPage) || 1.50;

    const basePaperRate = sizeConfig.baseRate * qualityConfig.multiplier * sideConfig.multiplier;
    const colorPaperRate = basePaperRate + colorExtraRate;

    // Calculations
    const paperCost = Number((bwPagesCount * basePaperRate * copies).toFixed(2));
    const colorCost = Number((colorPagesCount * colorPaperRate * copies).toFixed(2));
    const totalPrintCost = Number((paperCost + colorCost).toFixed(2));

    // Binding Cost
    const bindingConfig = pricing.bindings[binding] || { price: 0 };
    const bindingCost = Number((bindingConfig.price * copies).toFixed(2));

    // Lamination Cost
    const laminationConfig = pricing.lamination[lamination] || { pricePerPage: 0 };
    const laminationCost = Number((laminationConfig.pricePerPage * printedPagesCount * copies).toFixed(2));

    // Area-Wise Delivery Fee
    const deliveryZones = pricing.deliveryZones || DEFAULT_PRICING.deliveryZones;
    const deliveryConfig = deliveryZones[deliveryZone] || { fee: 0 };
    const deliveryFee = Number((deliveryConfig.fee || 0).toFixed(2));

    // Bulk Quantity Discount (>= 5 copies = 5% off, >= 10 copies = 10% off)
    let discountPercent = 0;
    if (copies >= 10) discountPercent = 0.10;
    else if (copies >= 5) discountPercent = 0.05;

    const subtotal = Number((totalPrintCost + bindingCost + laminationCost + deliveryFee).toFixed(2));
    const discount = Number((subtotal * discountPercent).toFixed(2));
    const total = Number((subtotal - discount).toFixed(2));

    return {
      paperCost,
      colorCost,
      bindingCost,
      laminationCost,
      deliveryFee,
      deliveryZone,
      subtotal,
      gst: 0,
      discount,
      total,
      totalPages: maxDocPages,
      printedPagesCount,
      colorPagesCount,
      bwPagesCount,
      basePaperRate,
      colorPaperRate,
      copies
    };
  }
};
