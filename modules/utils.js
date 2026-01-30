/**
 * WebConvert+ Utils
 * Shared helper functions for logging, storage, and DOM manipulation.
 */

const Utils = {
  debugMode: true,

  log: (...args) => {
    if (Utils.debugMode) {
      console.log('[WebConvert+]', ...args);
    }
  },

  error: (...args) => {
    console.error('[WebConvert+]', ...args);
  },

  /**
   * Debounce function to limit rate of execution
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Safe storage wrapper
   */
  storage: {
    get: (keys) => new Promise((resolve) => chrome.storage.local.get(keys, resolve)),
    set: (items) => new Promise((resolve) => chrome.storage.local.set(items, resolve)),
    remove: (keys) => new Promise((resolve) => chrome.storage.local.remove(keys, resolve))
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHTML: (str) => {
    return str.replace(/[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag]));
  },

  /**
   * Check if an element is visible
   */
  isVisible: (elem) => {
    if (!(elem instanceof Element)) return false;
    const style = getComputedStyle(elem);
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (style.opacity < 0.1) return false;
    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
  },

  /**
   * Check if a node should be skipped (e.g. script, style, editable)
   */
  shouldSkipNode: (node) => {
    if (node.nodeType !== Node.TEXT_NODE) return true;
    const parent = node.parentElement;
    if (!parent) return true;

    const tagName = parent.tagName;
    const skippedTags = ['SCRIPT', 'STYLE', 'PRE', 'CODE', 'TEXTAREA', 'INPUT', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'AUDIO', 'VIDEO', 'CANVAS', 'SVG', 'MATH'];

    if (skippedTags.includes(tagName)) return true;
    if (parent.isContentEditable) return true;
    if (parent.getAttribute('translate') === 'no') return true;
    if (parent.classList.contains('notranslate')) return true;

    // Skip already processed nodes
    if (parent.hasAttribute('data-webconverted')) return true;

    return false;
  }
};

// Expose to global scope for other modules
window.Utils = Utils;
