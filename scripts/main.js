import { state, DEFAULT_MISSIONS, THEMES, SHEET_CSV_URL } from './data.js';
import { dom } from './dom.js';
import { loadMissions, loadSettings, loadMeta } from './storage.js';
import { applyTheme, updateFooter, updateAnnouncement, updateSplash, renderHome, startApp, gotoHome, back, resetIdle, triggerBounce, returnToIntro } from './render.js';
import { initAdmin, openAdmin, closeAdmin } from './admin.js';
import { initQR, closeQR } from './qr.js';
import { initWeb, closeWeb, openWeb } from './webview.js';
import { initKeyboard } from './keyboard.js';
import { fetchCsv } from './csv.js';
import { clone } from './helpers.js';

const hydrateState = async () => {
  loadMeta(state.meta);
  state.settings = loadSettings(state.settings);
  if (!THEMES[state.settings.theme]) {
    state.settings.theme = 'evergreen';
  }
  applyTheme(state.settings.theme);
  updateFooter();

  try {
    const stored = loadMissions();
    if (stored) {
      state.missions = stored;
    } else if (SHEET_CSV_URL) {
      const remote = await fetchCsv(SHEET_CSV_URL);
      if (Array.isArray(remote) && remote.length) {
        state.missions = remote;
      }
    }
  } catch (err) {
    console.warn('CSV load failed', err);
    state.missions = clone(DEFAULT_MISSIONS);
  }

  updateAnnouncement();
  updateSplash();
  state.pendingSettings = { ...state.settings };
};

const registerGestures = () => {
  const titleNode = document.querySelector('header .portrait-wrap span');
  if (!titleNode) return;
  let taps = 0;
  let last = 0;
  titleNode.addEventListener('click', () => {
    const now = Date.now();
    if (now - last > 1500) {
      taps = 0;
    }
    taps += 1;
    last = now;
    if (taps >= 5) {
      taps = 0;
      openAdmin();
    }
  });
};

const registerIdleReset = () => {
  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    document.addEventListener(eventName, resetIdle, { passive: true });
  });
};

const registerModalClosers = () => {
  document.addEventListener('click', (event) => {
    const closeTarget = event.target.dataset?.close;
    if (closeTarget === 'qr') {
      closeQR();
    }
    if (closeTarget === 'admin') {
      closeAdmin();
    }
    if (closeTarget === 'web') {
      closeWeb();
    }
  });
};

const registerButtons = () => {
  dom.startBtn?.addEventListener('click', startApp);
  dom.startBtn?.addEventListener('pointerdown', () => triggerBounce(dom.startBtn));
  dom.backBtn?.addEventListener('click', back);
  dom.homeBtn?.addEventListener('click', gotoHome);
  dom.homeBtn?.addEventListener('pointerdown', () => triggerBounce(dom.homeBtn));
  dom.splashBtn?.addEventListener('click', returnToIntro);
  dom.splashBtn?.addEventListener('pointerdown', () => triggerBounce(dom.splashBtn));
  dom.settingsBtn?.addEventListener('click', openAdmin);
  dom.settingsBtn?.addEventListener('pointerdown', () => triggerBounce(dom.settingsBtn));
  dom.introScreen?.addEventListener('pointerdown', (event) => {
    if (state.appStarted) return;
    const onButton = event.target?.closest?.('button, a, input, textarea, select, [role="button"]');
    if (onButton && onButton === dom.settingsBtn) return;
    startApp();
  });
};

const registerScrollFallback = () => {
  const hasNativeTouch = typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints || 0) > 0;
  const hasFinePointer = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(any-pointer: fine)').matches;
  // Skip the fallback on pure touch setups; hybrids still benefit because their drag reports as mouse.
  if (hasNativeTouch && !hasFinePointer) return;

  const allowSelector = 'input, textarea, select, [contenteditable="true"], .allow-text-selection';
  const isEditableTarget = (node) => node && typeof node.closest === 'function' && node.closest(allowSelector);

  let activePointer = null;
  let lastY = 0;
  let startY = 0;
  let isDragging = false;
  let scrollTarget = window;
  let captureTarget = null;

  const DRAG_THRESHOLD = 4; // pixels before we treat movement as a scroll gesture
  const SCROLL_MULTIPLIER = 1.25; // give a slight boost so small drags produce visible scroll

  const findScrollContainer = (node) => {
    let current = node;
    while (current && current !== document.body) {
      if (isEditableTarget(current) && current === node) {
        current = current.parentElement;
        continue;
      }
      const style = window.getComputedStyle(current);
      const overflowY = style.overflowY;
      const canScroll = (overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight;
      if (canScroll) {
        return current;
      }
      current = current.parentElement;
    }
    return window;
  };

  const endDrag = () => {
    if (captureTarget && typeof captureTarget.releasePointerCapture === 'function' && activePointer !== null) {
      try {
        captureTarget.releasePointerCapture(activePointer);
      } catch (err) {
        // ignore release errors
      }
    }
    activePointer = null;
    isDragging = false;
    scrollTarget = window;
    captureTarget = null;
  };

  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    activePointer = event.pointerId;
    lastY = event.clientY;
    startY = event.clientY;
    isDragging = false;
    const origin = findScrollContainer(event.target) || window;
    scrollTarget = origin;
    if (event.target?.setPointerCapture) {
      try {
        event.target.setPointerCapture(event.pointerId);
        captureTarget = event.target;
      } catch (err) {
        captureTarget = null;
      }
    }
  });

  document.addEventListener('pointermove', (event) => {
    if (event.pointerId !== activePointer) return;
    const deltaY = event.clientY - lastY;
    if (!isDragging) {
      const totalDelta = event.clientY - startY;
      if (Math.abs(totalDelta) < DRAG_THRESHOLD) return;
      isDragging = true;
    }
    event.preventDefault();
    if (Math.abs(deltaY) < 1) return;
    const adjustedDelta = deltaY * SCROLL_MULTIPLIER;
    if (scrollTarget === window) {
      window.scrollBy({ top: -adjustedDelta, behavior: 'auto' });
    } else if (scrollTarget && typeof scrollTarget.scrollTop === 'number') {
      scrollTarget.scrollTop -= adjustedDelta;
    }
    lastY = event.clientY;
  }, { passive: false });

  ['pointerup', 'pointercancel', 'pointerout', 'pointerleave'].forEach((type) => {
    document.addEventListener(type, endDrag);
  });
};

const bootstrap = async () => {
  initQR();
  initWeb();
  initAdmin();
  initKeyboard();
  registerButtons();
  registerModalClosers();
  registerGestures();
  registerIdleReset();
  registerScrollFallback();
  dom.dImage?.addEventListener('pointerdown', () => triggerBounce(dom.dImage));
  // Delegate clicks for in-app web links
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-openweb]');
    if (a && a.dataset.openweb) {
      e.preventDefault();
      openWeb(a.dataset.openweb);
    }
  });

  await hydrateState();
};

bootstrap();
