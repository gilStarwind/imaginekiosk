import { dom } from './dom.js';

let webTimer = null;

export const openWeb = (url) => {
  if (!dom.webModal || !dom.webFrame) return;
  // Reset state
  if (webTimer) { clearTimeout(webTimer); webTimer = null; }
  if (dom.webError) dom.webError.classList.add('hidden');

  const target = url || 'about:blank';
  let loaded = false;
  try {
    dom.webFrame.onload = () => { loaded = true; if (dom.webError) dom.webError.classList.add('hidden'); };
    dom.webFrame.src = target;
    dom.webModal.classList.remove('hidden');
  } catch (_) {
    // If setting src fails, show error inline
    if (dom.webError) dom.webError.classList.remove('hidden');
    return;
  }
  // If the site blocks embedding or fails to load promptly, show error message
  webTimer = setTimeout(() => {
    if (!loaded && dom.webError) dom.webError.classList.remove('hidden');
  }, 2500);
};

export const closeWeb = () => {
  if (!dom.webModal || !dom.webFrame) return;
  dom.webModal.classList.add('hidden');
  if (webTimer) { clearTimeout(webTimer); webTimer = null; }
  // Reset src to stop any media and free resources
  try { dom.webFrame.src = 'about:blank'; } catch (_) {}
  if (dom.webError) dom.webError.classList.add('hidden');
};

export const initWeb = () => {
  // nothing additional required for now
};
