import { clone } from './helpers.js';

export const saveMissions = async (missions, meta) => {
  try {
    await fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(missions),
    });
    // meta.updatedAt is no longer stored on the client
  } catch (err) {
    console.warn('remote save failed', err);
    throw err; // Re-throw to notify caller
  }
};

export const loadMissions = async () => {
  try {
    const response = await fetch('/api/missions');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return clone(data);
    }
  } catch (err) {
    console.warn('remote load failed', err);
  }
  return null;
};

// This function is no longer required as the last-updated timestamp
// is not a primary concern in the new file-based model.
export const loadMeta = (meta) => {};

export const loadSettings = async (defaults) => {
  let settings = { ...defaults };
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const stored = await response.json();
    if (stored && typeof stored === 'object') {
      settings = { ...settings, ...stored };
    }
  } catch (err) {
    console.warn('settings load failed', err);
  }
  return settings;
};

export const saveSettings = async (settings) => {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  } catch (err) {
    console.warn('settings save failed', err);
    throw err; // Re-throw to notify caller
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
