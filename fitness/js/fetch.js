/**
 * Data Fetching Module
 * Handles API calls and data retrieval with error handling and retry logic
 */

// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
  dataPath: 'data/classes.json',
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 5000
};

// ========================================
// FETCH WITH TIMEOUT
// ========================================

/**
 * Fetch with timeout support
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, timeout = CONFIG.timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ========================================
// RETRY LOGIC
// ========================================

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise<any>}
 */
async function retry(fn, retries = CONFIG.maxRetries, delay = CONFIG.retryDelay) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with increased delay
    return retry(fn, retries - 1, delay * 2);
  }
}

// ========================================
// DATA VALIDATION
// ========================================

/**
 * Validate class data structure
 * @param {Object} classData - Class object to validate
 * @returns {boolean}
 */
function isValidClass(classData) {
  const requiredFields = ['name', 'type', 'duration', 'level', 'trainer'];
  
  if (!classData || typeof classData !== 'object') {
    return false;
  }
  
  return requiredFields.every(field => {
    return classData.hasOwnProperty(field) && 
           typeof classData[field] === 'string' && 
           classData[field].trim() !== '';
  });
}

/**
 * Validate array of classes
 * @param {Array} classes - Array of class objects
 * @returns {Array} Validated classes
 */
function validateClasses(classes) {
  if (!Array.isArray(classes)) {
    throw new Error('Invalid data format: expected an array');
  }
  
  const validClasses = classes.filter(isValidClass);
  
  if (validClasses.length === 0) {
    throw new Error('No valid classes found in data');
  }
  
  if (validClasses.length < classes.length) {
    console.warn(`${classes.length - validClasses.length} invalid classes were filtered out`);
  }
  
  return validClasses;
}

// ========================================
// MAIN FETCH FUNCTION
// ========================================

/**
 * Fetch classes data from JSON file
 * @returns {Promise<Array>} Array of class objects
 */
export async function getClasses() {
  try {
    // Attempt to fetch with retry logic
    const data = await retry(async () => {
      const response = await fetchWithTimeout(CONFIG.dataPath);
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid content type: expected JSON');
      }
      
      // Parse JSON
      const data = await response.json();
      
      // Validate data
      return validateClasses(data);
    });
    
    return data;
    
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching classes:', error);
    
    // Provide user-friendly error message
    if (error.name === 'AbortError') {
      console.error('Request timeout: The server took too long to respond');
    } else if (error.message.includes('HTTP error')) {
      console.error('Server error: Unable to fetch data');
    } else if (error.message.includes('JSON')) {
      console.error('Data format error: Invalid JSON received');
    } else {
      console.error('Network error: Please check your connection');
    }
    
    // Return empty array as fallback
    return [];
  }
}

// ========================================
// ADDITIONAL UTILITY FUNCTIONS
// ========================================

/**
 * Filter classes by type
 * @param {Array} classes - Array of class objects
 * @param {string} type - Type to filter by
 * @returns {Array} Filtered classes
 */
export function filterByType(classes, type) {
  if (!type || type === 'all') {
    return classes;
  }
  
  return classes.filter(classData => 
    classData.type.toLowerCase() === type.toLowerCase()
  );
}

/**
 * Filter classes by level
 * @param {Array} classes - Array of class objects
 * @param {string} level - Level to filter by
 * @returns {Array} Filtered classes
 */
export function filterByLevel(classes, level) {
  if (!level || level === 'all') {
    return classes;
  }
  
  return classes.filter(classData => 
    classData.level.toLowerCase() === level.toLowerCase()
  );
}

/**
 * Filter classes by trainer
 * @param {Array} classes - Array of class objects
 * @param {string} trainer - Trainer name to filter by
 * @returns {Array} Filtered classes
 */
export function filterByTrainer(classes, trainer) {
  if (!trainer || trainer === 'all') {
    return classes;
  }
  
  return classes.filter(classData => 
    classData.trainer.toLowerCase() === trainer.toLowerCase()
  );
}

/**
 * Search classes by name
 * @param {Array} classes - Array of class objects
 * @param {string} query - Search query
 * @returns {Array} Matching classes
 */
export function searchClasses(classes, query) {
  if (!query || query.trim() === '') {
    return classes;
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return classes.filter(classData => 
    classData.name.toLowerCase().includes(searchTerm) ||
    classData.type.toLowerCase().includes(searchTerm) ||
    classData.trainer.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get unique types from classes
 * @param {Array} classes - Array of class objects
 * @returns {Array} Array of unique types
 */
export function getUniqueTypes(classes) {
  const types = classes.map(classData => classData.type);
  return [...new Set(types)].sort();
}

/**
 * Get unique trainers from classes
 * @param {Array} classes - Array of class objects
 * @returns {Array} Array of unique trainer names
 */
export function getUniqueTrainers(classes) {
  const trainers = classes.map(classData => classData.trainer);
  return [...new Set(trainers)].sort();
}

/**
 * Get classes by trainer with count
 * @param {Array} classes - Array of class objects
 * @returns {Object} Object with trainer names as keys and counts as values
 */
export function getClassCountByTrainer(classes) {
  return classes.reduce((acc, classData) => {
    acc[classData.trainer] = (acc[classData.trainer] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Get classes by type with count
 * @param {Array} classes - Array of class objects
 * @returns {Object} Object with types as keys and counts as values
 */
export function getClassCountByType(classes) {
  return classes.reduce((acc, classData) => {
    acc[classData.type] = (acc[classData.type] || 0) + 1;
    return acc;
  }, {});
}
