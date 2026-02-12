/**
 * Local Storage Module
 * Handles browser storage operations with error handling and data validation
 */

// ========================================
// CONSTANTS
// ========================================

const STORAGE_KEYS = {
  preferredTraining: 'fitness_preferred_training',
  userPreferences: 'fitness_user_preferences',
  recentClasses: 'fitness_recent_classes'
};

const MAX_RECENT_ITEMS = 10;

// ========================================
// STORAGE AVAILABILITY CHECK
// ========================================

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('localStorage is not available:', e);
    return false;
  }
}

// ========================================
// CORE STORAGE FUNCTIONS
// ========================================

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
function setItem(key, value) {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, data will not persist');
    return false;
  }
  
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Retrieved value or default
 */
function getItem(key, defaultValue = null) {
  if (!isLocalStorageAvailable()) {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue;
    }
    
    return JSON.parse(item);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
function removeItem(key) {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

/**
 * Clear all app data from localStorage
 * @returns {boolean} Success status
 */
function clearAll() {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

// ========================================
// PREFERENCE MANAGEMENT
// ========================================

/**
 * Save user's preferred training type
 * @param {string} type - Training type
 * @returns {boolean} Success status
 */
export function savePreference(type) {
  if (!type || typeof type !== 'string') {
    console.warn('Invalid training type provided');
    return false;
  }
  
  const success = setItem(STORAGE_KEYS.preferredTraining, type);
  
  if (success) {
    console.log(`Saved preference: ${type}`);
    
    // Also add to recent classes for tracking
    addRecentClass(type);
  }
  
  return success;
}

/**
 * Get user's preferred training type
 * @returns {string|null} Preferred training type or null
 */
export function getPreference() {
  return getItem(STORAGE_KEYS.preferredTraining);
}

/**
 * Remove saved preference
 * @returns {boolean} Success status
 */
export function removePreference() {
  return removeItem(STORAGE_KEYS.preferredTraining);
}

// ========================================
// USER PREFERENCES
// ========================================

/**
 * Save user preferences object
 * @param {Object} preferences - User preferences
 * @returns {boolean} Success status
 */
export function saveUserPreferences(preferences) {
  if (!preferences || typeof preferences !== 'object') {
    console.warn('Invalid preferences object provided');
    return false;
  }
  
  return setItem(STORAGE_KEYS.userPreferences, preferences);
}

/**
 * Get user preferences
 * @returns {Object} User preferences object
 */
export function getUserPreferences() {
  return getItem(STORAGE_KEYS.userPreferences, {
    theme: 'light',
    notifications: true,
    language: 'es'
  });
}

/**
 * Update specific user preference
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 * @returns {boolean} Success status
 */
export function updateUserPreference(key, value) {
  const preferences = getUserPreferences();
  preferences[key] = value;
  return saveUserPreferences(preferences);
}

// ========================================
// RECENT CLASSES TRACKING
// ========================================

/**
 * Add class to recent history
 * @param {string} className - Class name or type
 */
export function addRecentClass(className) {
  if (!className || typeof className !== 'string') {
    return;
  }
  
  let recent = getItem(STORAGE_KEYS.recentClasses, []);
  
  // Remove if already exists
  recent = recent.filter(item => item !== className);
  
  // Add to beginning
  recent.unshift(className);
  
  // Limit to max items
  if (recent.length > MAX_RECENT_ITEMS) {
    recent = recent.slice(0, MAX_RECENT_ITEMS);
  }
  
  setItem(STORAGE_KEYS.recentClasses, recent);
}

/**
 * Get recent classes
 * @param {number} limit - Maximum number of items to return
 * @returns {Array} Array of recent class names
 */
export function getRecentClasses(limit = MAX_RECENT_ITEMS) {
  const recent = getItem(STORAGE_KEYS.recentClasses, []);
  return recent.slice(0, limit);
}

/**
 * Clear recent classes history
 * @returns {boolean} Success status
 */
export function clearRecentClasses() {
  return removeItem(STORAGE_KEYS.recentClasses);
}

// ========================================
// DATA EXPORT/IMPORT
// ========================================

/**
 * Export all user data
 * @returns {Object} All stored user data
 */
export function exportData() {
  return {
    preferredTraining: getPreference(),
    userPreferences: getUserPreferences(),
    recentClasses: getRecentClasses(),
    exportDate: new Date().toISOString()
  };
}

/**
 * Import user data
 * @param {Object} data - Data to import
 * @returns {boolean} Success status
 */
export function importData(data) {
  if (!data || typeof data !== 'object') {
    console.warn('Invalid data format for import');
    return false;
  }
  
  try {
    if (data.preferredTraining) {
      savePreference(data.preferredTraining);
    }
    
    if (data.userPreferences) {
      saveUserPreferences(data.userPreferences);
    }
    
    if (data.recentClasses && Array.isArray(data.recentClasses)) {
      setItem(STORAGE_KEYS.recentClasses, data.recentClasses);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

// ========================================
// STORAGE INFO
// ========================================

/**
 * Get storage usage information
 * @returns {Object} Storage info
 */
export function getStorageInfo() {
  if (!isLocalStorageAvailable()) {
    return {
      available: false,
      used: 0,
      total: 0
    };
  }
  
  try {
    // Calculate approximate size
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    return {
      available: true,
      used: totalSize,
      usedKB: (totalSize / 1024).toFixed(2),
      itemCount: localStorage.length
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      available: true,
      used: 0,
      total: 0
    };
  }
}

// ========================================
// CLEANUP
// ========================================

/**
 * Clear all application data
 * @returns {boolean} Success status
 */
export function resetAllData() {
  const confirmed = confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.');
  
  if (confirmed) {
    return clearAll();
  }
  
  return false;
}

// ========================================
// EXPORT DEFAULT
// ========================================

export default {
  // Preferences
  savePreference,
  getPreference,
  removePreference,
  
  // User settings
  saveUserPreferences,
  getUserPreferences,
  updateUserPreference,
  
  // Recent history
  addRecentClass,
  getRecentClasses,
  clearRecentClasses,
  
  // Data management
  exportData,
  importData,
  resetAllData,
  
  // Info
  getStorageInfo,
  isAvailable: isLocalStorageAvailable
};
