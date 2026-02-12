/**
 * Modal Module
 * Handles modal dialog functionality with accessibility features
 */

// ========================================
// CONSTANTS
// ========================================

const SELECTORS = {
  modal: '#modal',
  modalTitle: '#modal-title',
  modalContent: '#modal-content',
  modalDetails: '#modal-details',
  modalCta: '#modal-cta',
  closeButton: '#closeModal'
};

const KEYS = {
  escape: 'Escape',
  tab: 'Tab'
};

// ========================================
// STATE
// ========================================

let focusedElementBeforeModal = null;
let modalElement = null;

// ========================================
// FOCUS MANAGEMENT
// ========================================

/**
 * Get all focusable elements within the modal
 * @param {HTMLElement} modal - Modal element
 * @returns {Array} Array of focusable elements
 */
function getFocusableElements(modal) {
  const focusableSelectors = [
    'a[href]',
    'area[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  return Array.from(modal.querySelectorAll(focusableSelectors.join(', ')));
}

/**
 * Trap focus within modal
 * @param {KeyboardEvent} e - Keyboard event
 */
function trapFocus(e) {
  if (e.key !== KEYS.tab) return;
  
  const focusableElements = getFocusableElements(modalElement);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (e.shiftKey && document.activeElement === firstElement) {
    // Shift + Tab on first element -> focus last element
    e.preventDefault();
    lastElement.focus();
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    // Tab on last element -> focus first element
    e.preventDefault();
    firstElement.focus();
  }
}

/**
 * Set initial focus in modal
 */
function setInitialFocus() {
  const closeButton = modalElement.querySelector(SELECTORS.closeButton);
  if (closeButton) {
    closeButton.focus();
  }
}

/**
 * Restore focus to element that opened the modal
 */
function restoreFocus() {
  if (focusedElementBeforeModal && focusedElementBeforeModal.focus) {
    focusedElementBeforeModal.focus();
  }
}

// ========================================
// MODAL CONTROL
// ========================================

/**
 * Open modal with content
 * @param {string} title - Modal title
 * @param {string} content - Modal content (HTML string)
 */
export function openModal(title, content) {
  if (!modalElement) {
    console.error('Modal element not found');
    return;
  }
  
  // Store currently focused element
  focusedElementBeforeModal = document.activeElement;
  
  // Set modal content
  const titleElement = modalElement.querySelector(SELECTORS.modalTitle);
  const contentElement = modalElement.querySelector(SELECTORS.modalContent);
  const detailsElement = modalElement.querySelector(SELECTORS.modalDetails);
  
  if (titleElement) {
    titleElement.textContent = title;
  }
  
  if (detailsElement) {
    detailsElement.innerHTML = content;
  }
  
  if (contentElement) {
    contentElement.innerHTML = '';
  }
  
  // Show modal
  modalElement.showModal();
  
  // Set initial focus
  setTimeout(() => setInitialFocus(), 100);
  
  // Add event listeners
  document.addEventListener('keydown', handleKeyDown);
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
export function closeModal() {
  if (!modalElement) return;
  
  // Close modal
  modalElement.close();
  
  // Remove event listeners
  document.removeEventListener('keydown', handleKeyDown);
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  // Restore focus
  restoreFocus();
}

/**
 * Handle keyboard events
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyDown(e) {
  if (e.key === KEYS.escape) {
    closeModal();
  } else {
    trapFocus(e);
  }
}

/**
 * Handle click on modal backdrop
 * @param {MouseEvent} e - Click event
 */
function handleBackdropClick(e) {
  const modalContent = modalElement.querySelector('.modal-content');
  
  // Close if clicking on backdrop (not modal content)
  if (e.target === modalElement && !modalContent.contains(e.target)) {
    closeModal();
  }
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize modal functionality
 */
export function initializeModal() {
  modalElement = document.querySelector(SELECTORS.modal);
  
  if (!modalElement) return;
  
  // Close button click handler
  const closeButton = modalElement.querySelector(SELECTORS.closeButton);
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }
  
  // CTA button click handler
  const ctaButton = modalElement.querySelector(SELECTORS.modalCta);
  if (ctaButton) {
    ctaButton.addEventListener('click', () => {
      // TODO: Implement booking functionality
      console.log('Booking functionality to be implemented');
      closeModal();
    });
  }
  
  // Backdrop click handler
  modalElement.addEventListener('click', handleBackdropClick);
  
  // Handle native dialog cancel event (ESC key)
  modalElement.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeModal();
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if modal is open
 * @returns {boolean}
 */
export function isModalOpen() {
  return modalElement && modalElement.open;
}

/**
 * Update modal content dynamically
 * @param {Object} options - Content options
 * @param {string} options.title - New title
 * @param {string} options.content - New content
 */
export function updateModalContent({ title, content }) {
  if (!isModalOpen()) {
    console.warn('Cannot update content: modal is not open');
    return;
  }
  
  if (title) {
    const titleElement = modalElement.querySelector(SELECTORS.modalTitle);
    if (titleElement) {
      titleElement.textContent = title;
    }
  }
  
  if (content) {
    const contentElement = modalElement.querySelector(SELECTORS.modalContent);
    if (contentElement) {
      contentElement.innerHTML = content;
    }
  }
}

/**
 * Add custom modal action
 * @param {string} buttonText - Button text
 * @param {Function} callback - Click handler
 */
export function addModalAction(buttonText, callback) {
  if (!isModalOpen()) {
    console.warn('Cannot add action: modal is not open');
    return;
  }
  
  const footer = modalElement.querySelector('.modal-footer');
  if (!footer) return;
  
  const button = document.createElement('button');
  button.className = 'btn btn-secondary';
  button.textContent = buttonText;
  button.addEventListener('click', () => {
    callback();
    closeModal();
  });
  
  footer.appendChild(button);
}

// ========================================
// EXPORT
// ========================================

export default {
  open: openModal,
  close: closeModal,
  initialize: initializeModal,
  isOpen: isModalOpen,
  updateContent: updateModalContent,
  addAction: addModalAction
};
