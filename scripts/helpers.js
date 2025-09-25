export const qs = (selector) => document.querySelector(selector);
export const qsa = (selector) => Array.from(document.querySelectorAll(selector));

export const clone = (value) => JSON.parse(JSON.stringify(value || []));

export const parseLinks = (input) => {
  if (!input) return [];
  return input
    .split(';')
    .map((piece) => piece.trim())
    .filter(Boolean)
    .map((pair) => {
      const [label, href] = pair.split('|');
      return {
        label: (label || 'Open').trim(),
        href: (href || '#').trim()
      };
    });
};

export const serializeLinks = (links) => {
  if (!Array.isArray(links)) return '';
  return links
    .map((link) => `${link.label || 'Link'}|${link.href || '#'}`)
    .join('; ');
};

export const escapeAttr = (value) => {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
};

export const escapeHTML = (value) => {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'Never';
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch (err) {
    return 'Never';
  }
};

export const html = (strings, ...values) => {
  return strings.reduce((result, chunk, index) => {
    const value = values[index];
    if (Array.isArray(value)) {
      return result + chunk + value.join('');
    }
    if (value === undefined || value === null) {
      return result + chunk;
    }
    return result + chunk + value;
  }, '');
};
