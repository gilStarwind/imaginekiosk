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

const generateQR = (text) => {
  // Placeholder draws fallback text. Replace with local QR library for scannable codes.
  drawFallbackQR(text);
};

export const openQR = (url) => {
  try {
    generateQR(url);
  } catch (err) {
    drawFallbackQR(url);
  }
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
