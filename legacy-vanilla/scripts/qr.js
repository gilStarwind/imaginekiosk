import { dom } from './dom.js';

const drawFallbackQR = (text) => {
  if (!dom.qrCanvas) return;
  const ctx = dom.qrCanvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 300, 300);
  ctx.fillStyle = '#000';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Scan not available offline', 150, 135);
  ctx.fillText(text, 150, 165);
};

const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
  document.head.appendChild(s);
});

const ensureQrLib = async () => {
  // Prefer local vendor bundle if present
  if (window.QRCode) return true;
  try { await loadScript('scripts/vendor/qrcode.min.js'); } catch (_) {}
  if (window.QRCode) return true;
  // Online fallback
  try { await loadScript('https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js'); } catch (_) {}
  return !!window.QRCode;
};

const generateQR = async (text) => {
  try {
    const ok = await ensureQrLib();
    if (ok) {
      const size = 240;
      // Support the npm 'qrcode' API when available
      if (typeof window.QRCode.toCanvas === 'function' && dom.qrCanvas) {
        await window.QRCode.toCanvas(dom.qrCanvas, text, { width: size, margin: 2, color: { dark: '#000', light: '#fff' } });
        return;
      }
      // Support davidshimjs QRCode.js constructor API
      if (typeof window.QRCode === 'function' && dom.qrCanvasWrap) {
        // Clear any prior contents
        dom.qrCanvasWrap.innerHTML = '';
        /* eslint-disable no-new */
        new window.QRCode(dom.qrCanvasWrap, { text, width: size, height: size, correctLevel: window.QRCode.CorrectLevel && window.QRCode.CorrectLevel.M || 0 });
        return;
      }
    }
  } catch (_) {}
  // Fallback text if library unavailable (offline without vendor file)
  drawFallbackQR(text);
};

export const openQR = (url) => {
  try { generateQR(url); } catch (err) { drawFallbackQR(url); }
  dom.qrModal?.classList.remove('hidden');
};

export const closeQR = () => {
  dom.qrModal?.classList.add('hidden');
};

export const initQR = () => {
  document.addEventListener('qr:open', (event) => {
    if (!event.detail) return;
    openQR(event.detail);
  });
};
