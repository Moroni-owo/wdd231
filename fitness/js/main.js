/**
 * Main JavaScript Module
 * Handles navigation, program loading, filtering, and UI interactions
 */

import { getClasses } from './fetch.js';
import { openModal, closeModal, initializeModal } from './modal.js';
import { savePreference, getPreference } from './storage.js';

// ========================================
// CONSTANTS
// ========================================

const SELECTORS = {
  menuToggle: '#menu-toggle',
  navLinks: '#nav-links',
  programsContainer: '#programs',
  loadingIndicator: '#loading',
  errorMessage: '#error',
  emptyState: '#empty',
  filterButtons: '.filter-btn',
  scrollToTop: '#scroll-to-top'
};

const CLASSES = {
  active: 'active',
  hidden: 'hidden'
};

// ========================================
// STATE
// ========================================

let allClasses = [];
let currentFilter = 'all';

// ========================================
// MOBILE NAVIGATION
// ========================================

function initializeMobileNav() {
  const menuToggle = document.querySelector(SELECTORS.menuToggle);
  const navLinks = document.querySelector(SELECTORS.navLinks);
  
  if (!menuToggle || !navLinks) return;
  
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle(CLASSES.active);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isExpanded ? '' : 'hidden';
  });
  
  // Close menu when clicking on a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove(CLASSES.active);
      document.body.style.overflow = '';
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
      menuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove(CLASSES.active);
      document.body.style.overflow = '';
    }
  });
}

// ========================================
// PROGRAMS FUNCTIONALITY
// ========================================

/**
 * Show loading state
 */
function showLoading() {
  const loading = document.querySelector(SELECTORS.loadingIndicator);
  const error = document.querySelector(SELECTORS.errorMessage);
  const empty = document.querySelector(SELECTORS.emptyState);
  
  if (loading) loading.hidden = false;
  if (error) error.hidden = true;
  if (empty) empty.hidden = true;
}

/**
 * Hide loading state
 */
function hideLoading() {
  const loading = document.querySelector(SELECTORS.loadingIndicator);
  if (loading) loading.hidden = true;
}

/**
 * Show error state
 */
function showError() {
  const error = document.querySelector(SELECTORS.errorMessage);
  const empty = document.querySelector(SELECTORS.emptyState);
  
  hideLoading();
  if (error) error.hidden = false;
  if (empty) empty.hidden = true;
}

/**
 * Show empty state
 */
function showEmpty() {
  const empty = document.querySelector(SELECTORS.emptyState);
  const error = document.querySelector(SELECTORS.errorMessage);
  
  hideLoading();
  if (empty) empty.hidden = false;
  if (error) error.hidden = true;
}

/**
 * Create a program card element
 * @param {Object} program - Program data
 * @returns {HTMLElement} Card element
 */
function createProgramCard(program) {
  const card = document.createElement('article');
  card.classList.add('card');
  card.setAttribute('role', 'listitem');
  card.dataset.type = program.type;
  
  // Create card content
  card.innerHTML = `
    <h3>${escapeHtml(program.name)}</h3>
    <p><strong>Tipo:</strong> ${escapeHtml(program.type)}</p>
    <p><strong>Duración:</strong> ${escapeHtml(program.duration)}</p>
    <p><strong>Nivel:</strong> ${escapeHtml(program.level)}</p>
    <p><strong>Entrenador:</strong> ${escapeHtml(program.trainer)}</p>
    <button type="button" aria-label="Ver detalles de ${escapeHtml(program.name)}">
      Ver Detalles
    </button>
  `;
  
  // Add click event to button
  const button = card.querySelector('button');
  button.addEventListener('click', () => handleProgramClick(program));
  
  return card;
}

/**
 * Handle program card click
 * @param {Object} program - Program data
 */
function handleProgramClick(program) {
  const modalContent = `
    <p><strong>Entrenador:</strong> ${escapeHtml(program.trainer)}</p>
    <p><strong>Tipo:</strong> ${escapeHtml(program.type)}</p>
    <p><strong>Duración:</strong> ${escapeHtml(program.duration)}</p>
    <p><strong>Nivel:</strong> ${escapeHtml(program.level)}</p>
  `;
  
  openModal(program.name, modalContent);
  savePreference(program.type);
}

/**
 * Render programs to the DOM
 * @param {Array} programs - Array of program objects
 */
function renderPrograms(programs) {
  const container = document.querySelector(SELECTORS.programsContainer);
  
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Check if programs array is empty
  if (programs.length === 0) {
    showEmpty();
    return;
  }
  
  hideLoading();
  
  // Create and append program cards
  const fragment = document.createDocumentFragment();
  programs.forEach(program => {
    const card = createProgramCard(program);
    fragment.appendChild(card);
  });
  
  container.appendChild(fragment);
}

/**
 * Filter programs by type
 * @param {string} type - Program type to filter by
 */
function filterPrograms(type) {
  currentFilter = type;
  
  const filtered = type === 'all' 
    ? allClasses 
    : allClasses.filter(program => program.type === type);
  
  renderPrograms(filtered);
}

/**
 * Initialize filter buttons
 */
function initializeFilters() {
  const filterButtons = document.querySelectorAll(SELECTORS.filterButtons);
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove(CLASSES.active));
      button.classList.add(CLASSES.active);
      
      // Filter programs
      const filterType = button.dataset.filter;
      filterPrograms(filterType);
    });
  });
}

/**
 * Load and display programs
 */
async function loadPrograms() {
  const container = document.querySelector(SELECTORS.programsContainer);
  
  if (!container) return;
  
  showLoading();
  
  try {
    allClasses = await getClasses();
    
    if (!allClasses || allClasses.length === 0) {
      showError();
      return;
    }
    
    renderPrograms(allClasses);
    
    // Apply saved preference filter if exists
    const savedPreference = getPreference();
    if (savedPreference) {
      const filterButton = document.querySelector(`[data-filter="${savedPreference}"]`);
      if (filterButton) {
        filterButton.click();
      }
    }
  } catch (error) {
    console.error('Error loading programs:', error);
    showError();
  }
}

// ========================================
// SCROLL TO TOP
// ========================================

function initializeScrollToTop() {
  const scrollButton = document.querySelector(SELECTORS.scrollToTop);
  
  if (!scrollButton) return;
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollButton.hidden = false;
    } else {
      scrollButton.hidden = true;
    }
  });
  
  // Scroll to top on click
  scrollButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ========================================
// FORM VALIDATION
// ========================================

function initializeFormValidation() {
  const form = document.querySelector('.contact-form');
  
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    
    let isValid = true;
    
    // Validate name
    if (nameInput && !nameInput.value.trim()) {
      e.preventDefault();
      showFormError(nameInput, 'Por favor ingresa tu nombre');
      isValid = false;
    } else if (nameInput) {
      clearFormError(nameInput);
    }
    
    // Validate email
    if (emailInput && !isValidEmail(emailInput.value)) {
      e.preventDefault();
      showFormError(emailInput, 'Por favor ingresa un email válido');
      isValid = false;
    } else if (emailInput) {
      clearFormError(emailInput);
    }
  });
  
  // Real-time validation
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        showFormError(input, 'Este campo es requerido');
      } else {
        clearFormError(input);
      }
    });
    
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        clearFormError(input);
      }
    });
  });
}

/**
 * Show form error message
 */
function showFormError(input, message) {
  const errorId = `${input.id}-error`;
  let errorElement = document.getElementById(errorId);
  
  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.id = errorId;
    errorElement.className = 'form-error';
    errorElement.setAttribute('role', 'alert');
    input.parentElement.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorId);
}

/**
 * Clear form error message
 */
function clearFormError(input) {
  const errorId = `${input.id}-error`;
  const errorElement = document.getElementById(errorId);
  
  if (errorElement) {
    errorElement.textContent = '';
  }
  
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize all functionality
 */
function init() {
  // Core functionality
  initializeMobileNav();
  initializeModal();
  initializeScrollToTop();
  initializeFormValidation();
  
  // Programs page specific
  if (document.querySelector(SELECTORS.programsContainer)) {
    loadPrograms();
    initializeFilters();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for use in other modules if needed
export { filterPrograms, renderPrograms };
