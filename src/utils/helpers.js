export const helpers = {
  // Generate portfolio URL
  getPortfolioUrl: (username) => {
    const base = window.location.origin;
    return `${base}/portfolio/${username}`;
  },

  // Copy text to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  },

  // Parse JSON safely
  parseJSON: (str, fallback = []) => {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  },

  // Format date string
  formatDate: (dateStr) => {
    if (!dateStr) return '';
    return dateStr;
  },

  // Generate initials from name
  getInitials: (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },

  // Slugify username
  slugify: (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .replace(/^-+|-+$/g, '');
  }
};

export default helpers;
