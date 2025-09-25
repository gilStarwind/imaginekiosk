import { parseLinks } from './helpers.js';

const parseRow = (row) => {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
};

export const parseCsvText = (text) => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines.shift().split(',').map((header) => header.trim());
  return lines.map((line) => {
    const columns = parseRow(line).map((col) => col.trim());
    const record = {};
    headers.forEach((header, index) => {
      record[header] = columns[index] || '';
    });
    return {
      id: record.id || record.title?.toLowerCase().replace(/\s+/g, '-') || String(Math.random()).slice(2),
      title: record.title || '',
      subtitle: record.subtitle || '',
      focus: record.focus || '',
      involved: record.involved || '',
      contact: record.contact || '',
      body: record.body || '',
      image: record.image || '',
      links: parseLinks(record.links || '')
    };
  });
};

export const fetchCsv = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  return parseCsvText(text);
};
