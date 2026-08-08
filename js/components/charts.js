/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - CANVAS / SVG CHARTS ENGINE
   ========================================================================== */

export const ChartsEngine = {
  // Render smooth line chart for sales revenue
  renderRevenueLineChart(containerId, data = [1200, 1900, 3000, 5000, 2400, 4200, 6800], labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = 240;
    const padding = 40;

    const maxVal = Math.max(...data, 1000) * 1.15;
    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - (val / maxVal) * (height - 2 * padding);
      return { x, y, val, label: labels[idx] };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    const svgHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="overflow:visible;">
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.35" />
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Y Axis Lines -->
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="var(--border-color)" stroke-dasharray="4" />
        <line x1="${padding}" y1="${height/2}" x2="${width - padding}" y2="${height/2}" stroke="var(--border-color)" stroke-dasharray="4" />
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border-color)" />

        <!-- Area Fill -->
        <path d="${pathD} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z" fill="url(#chartGlow)" />

        <!-- Smooth Path -->
        <path d="${pathD}" fill="none" stroke="var(--primary)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Points & Labels -->
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--bg-card)" stroke="var(--primary)" stroke-width="3" />
          <text x="${p.x}" y="${height - 12}" font-size="11" fill="var(--text-muted)" text-anchor="middle">${p.label}</text>
        `).join('')}
      </svg>
    `;

    container.innerHTML = svgHTML;
  },

  // Render Bar Chart for popular services
  renderBarChart(containerId, data = [45, 30, 20, 15], labels = ['Doc Print', 'Spiral Bind', 'Lamination', 'Posters']) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const max = Math.max(...data, 10);
    const html = `
      <div style="display:flex; flex-direction:column; gap:0.85rem; height:100%; justify-content:center;">
        ${data.map((val, i) => {
          const pct = Math.round((val / max) * 100);
          return `
            <div>
              <div style="display:flex; justify-between; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">
                <span>${labels[i]}</span>
                <span>${val} orders</span>
              </div>
              <div style="background:var(--border-color); height:10px; border-radius:10px; overflow:hidden;">
                <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, var(--primary), var(--accent)); border-radius:10px; transition:width 0.6s ease;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = html;
  }
};
