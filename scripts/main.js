import { state, DEFAULT_MISSIONS, THEMES, SHEET_CSV_URL } from './data.js';
import { dom } from './dom.js';
import { loadMissions, loadSettings, loadMeta } from './storage.js';
import { applyTheme, updateFooter, updateAnnouncement, updateSplash, renderHome, startApp, gotoHome, back, resetIdle, triggerBounce, returnToIntro } from './render.js';
import { initAdmin, openAdmin, closeAdmin } from './admin.js';
import { initQR, closeQR } from './qr.js';
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
};

const bootstrap = async () => {
  initQR();
  initAdmin();
  initKeyboard();
  registerButtons();
  registerModalClosers();
  registerGestures();
  registerIdleReset();
  dom.dImage?.addEventListener('pointerdown', () => triggerBounce(dom.dImage));

  await hydrateState();
  renderHome();
};

bootstrap();
