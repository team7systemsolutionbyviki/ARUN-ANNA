/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - MODAL UTILITY
   ========================================================================== */

export const ModalComponent = {
  show({ title, bodyHTML, footerHTML = '', width = '600px' }) {
    this.close(); // Close any existing modal

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'active-modal-overlay';

    modalOverlay.innerHTML = `
      <div class="modal-content" style="max-width: ${width};">
        <div class="modal-header">
          <h3>${title}</h3>
          <button style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:var(--text-muted);" onclick="window.ModalComponent.close()">✕</button>
        </div>
        <div class="modal-body">
          ${bodyHTML}
        </div>
        ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
      </div>
    `;

    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';

    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) this.close();
    };
  },

  close() {
    const existing = document.getElementById('active-modal-overlay');
    if (existing) {
      existing.remove();
      document.body.style.overflow = '';
    }
  },

  showImagePreview(imageUrl, title = "Payment Screenshot") {
    this.show({
      title: title,
      bodyHTML: `
        <div style="text-align:center;">
          <img src="${imageUrl}" alt="Preview" style="max-width:100%; max-height:70vh; border-radius:8px; border:1px solid var(--border-color);" />
        </div>
      `,
      footerHTML: `<button class="btn btn-secondary" onclick="window.ModalComponent.close()">Close</button>`,
      width: "700px"
    });
  }
};

window.ModalComponent = ModalComponent;
