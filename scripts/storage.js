import { clone } from './helpers.js';

export const saveMissions = (missions, meta) => {
  try {
    localStorage.setItem('missions:data', JSON.stringify(missions));
    meta.updatedAt = Date.now();
    localStorage.setItem('missions:meta', JSON.stringify(meta));
  } catch (err) {
    console.warn('local save failed', err);
  }
};

export const loadMissions = () => {
  try {
    const raw = localStorage.getItem('missions:data');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length) {
      return clone(data);
    }
  } catch (err) {
    console.warn('local load failed', err);
  }
  return null;
};

export const loadMeta = (meta) => {
  try {
    const raw = localStorage.getItem('missions:meta');
    if (!raw) return;
    const stored = JSON.parse(raw);
    if (stored && typeof stored.updatedAt === 'number') {
      meta.updatedAt = stored.updatedAt;
    }
  } catch (err) {
    console.warn('meta load failed', err);
  }
};

export const loadSettings = (defaults) => {
  let settings = { ...defaults };
  try {
    const raw = localStorage.getItem('missions:settings');
    if (raw) {
      const stored = JSON.parse(raw);
      if (stored && typeof stored === 'object') {
        settings = { ...settings, ...stored };
      }
    }
  } catch (err) {
    console.warn('settings load failed', err);
  }
  return settings;
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem('missions:settings', JSON.stringify(settings));
  } catch (err) {
    console.warn('settings save failed', err);
  }
};

export const getViewsFor = (id) => {
  return parseInt(localStorage.getItem(`views:${id}`) || '0', 10) || 0;
};

export const incrementViewsFor = (id) => {
  const next = getViewsFor(id) + 1;
  localStorage.setItem(`views:${id}`, String(next));
  return next;
};

export const getTotalViews = (list) => {
  return (list || []).reduce((sum, mission) => sum + getViewsFor(mission.id), 0);
};
