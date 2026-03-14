import { dom } from './dom.js';
import { state } from './data.js';

let webTimer = null;
const getBlocklist = () => (state.settings?.webBlocklist || []).map((d) => String(d || '').toLowerCase());
const isBlockedHost = (host) => {
  if (!host) return false;
  const list = getBlocklist();
  return list.some((d) => host === d || host.endsWith(`.${d}`));
};

const hostnameOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./,''); } catch (_) { return ''; }
};

export const openWeb = (url) => {
  if (!dom.webModal || !dom.webFrame) return;
  // Reset state
  if (webTimer) { clearTimeout(webTimer); webTimer = null; }
  if (dom.webError) dom.webError.classList.add('hidden');
  if (dom.webErrorUrl) dom.webErrorUrl.textContent = url || '';
  if (dom.webModal) dom.webModal.dataset.url = url || '';

  const target = url || 'about:blank';
  const host = hostnameOf(target);
  if (isBlockedHost(host)) {
    // Known to block embedding — show error immediately
    dom.webModal.classList.remove('hidden');
    if (dom.webError) dom.webError.classList.remove('hidden');
    return;
  }
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
  if (dom.webCopyBtn) {
    dom.webCopyBtn.addEventListener('click', async () => {
      const url = dom.webModal?.dataset.url || '';
      try {
        await navigator.clipboard.writeText(url);
      } catch (_) {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }
    });
  }
  if (dom.webQrBtn) {
    dom.webQrBtn.addEventListener('click', () => {
      const url = dom.webModal?.dataset.url || '';
      if (url) document.dispatchEvent(new CustomEvent('qr:open', { detail: url }));
    });
  }
};
