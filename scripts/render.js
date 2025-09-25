import { state, THEMES, LOGO_URL } from './data.js';
import { dom } from './dom.js';
import { missionCardTemplate } from './templates.js';
import { html, escapeHTML, escapeAttr } from './helpers.js';
import { incrementViewsFor } from './storage.js';

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.evergreen;
  Object.entries(theme.vars).forEach(([key, value]) => {
    dom.documentElement.style.setProperty(key, value);
  });
  dom.documentElement.style.setProperty('--bg-gradient', theme.gradient);
  dom.body.style.background = theme.gradient;
  dom.body.style.color = theme.vars['--text-base'] || '#f8fafc';
}

export function updateFooter() {
  if (dom.footerIdle) {
    dom.footerIdle.textContent = Math.round((state.settings.idleMs || 60000) / 1000);
  }
}

export function updateAnnouncement() {
  const text = (state.settings.announcement || '').trim();
  if (!dom.announceBar) return;
  if (text) {
    dom.announceText.textContent = text;
    dom.announceBar.classList.remove('hidden');
  } else {
    dom.announceBar.classList.add('hidden');
  }
}

export function updateSplash(custom) {
  const settings = custom || state.settings;
  if (dom.introTitle) {
    dom.introTitle.textContent = settings.splashTitle || 'Welcome to Imagine Church';
  }
  if (dom.introSubtitle) {
    dom.introSubtitle.textContent = settings.splashSubtitle || 'Tap below to explore how Imagine Church is moving through missions and outreach.';
  }
  if (dom.introImage && dom.introMedia) {
    const src = (settings.splashImage || '').trim();
    if (src) {
      dom.introImage.onload = () => dom.introMedia.classList.remove('hidden');
      dom.introImage.onerror = () => {
        dom.introMedia.classList.add('hidden');
        dom.introImage.removeAttribute('src');
      };
      dom.introImage.src = src;
      dom.introMedia.classList.remove('hidden');
    } else {
      dom.introMedia.classList.add('hidden');
      dom.introImage.removeAttribute('src');
    }
  }
}

export function triggerBounce(element) {
  if (!element) return;
  element.classList.remove('bounce-once');
  void element.offsetWidth;
  element.classList.add('bounce-once');
}

export function showView(view) {
  if (view === 'home') {
    dom.homeView?.classList.remove('hidden');
    dom.detailView?.classList.add('hidden');
  } else {
    dom.homeView?.classList.add('hidden');
    dom.detailView?.classList.remove('hidden');
  }
  if (state.appStarted) {
    resetIdle();
  }
}

export function gotoHome() {
  state.historyStack = [];
  showView('home');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function gotoDetail(id) {
  const mission = state.missions.find((item) => item.id === id);
  if (!mission) return;

  state.historyStack.push('home');

  dom.dTitle.textContent = mission.title;
  dom.dSubtitle.textContent = mission.subtitle || '';
  dom.dFocus.textContent = mission.focus || '—';
  dom.dInvolved.textContent = mission.involved || '—';
  dom.dBody.textContent = mission.body || '';
  dom.dImage.src = mission.image || '';
  triggerBounce(dom.dImage);

  dom.dContact.innerHTML = mission.contact
    ? html`<a class="inline-flex items-center gap-2 text-cyan-200 underline decoration-cyan-300/70 decoration-2 underline-offset-4" href="mailto:${mission.contact}">${escapeHTML(mission.contact)}</a>`
    : '—';

  dom.dLinks.innerHTML = html`${(mission.links || []).map(
    (link) => html`<a class="btn btn-primary touch inline-flex items-center justify-center" target="_blank" rel="noopener" href="${escapeAttr(link.href)}">${escapeHTML(link.label)}</a>`
  )}`;

  const viewCount = incrementViewsFor(mission.id);
  dom.dViews.textContent = `Views: ${viewCount}`;

  const deepLink = mission.links && mission.links[0]?.href && mission.links[0].href !== '#'
    ? mission.links[0].href
    : location.href;
  if (dom.qrBtn) {
    dom.qrBtn.onclick = () => document.dispatchEvent(new CustomEvent('qr:open', { detail: deepLink }));
  }

  showView('detail');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.dispatchEvent(new CustomEvent('missions:viewed'));
}

export function back() {
  if (state.historyStack.length === 0) {
    gotoHome();
    return;
  }
  const previous = state.historyStack.pop();
  if (previous === 'home') gotoHome();
}

export function renderHome() {
  if (dom.logoEl) {
    dom.logoEl.src = LOGO_URL;
    dom.logoEl.onerror = () => {
      const fallback = document.createElement('div');
      fallback.className = 'text-2xl font-black';
      fallback.textContent = 'Imagine Church';
      dom.logoEl.replaceWith(fallback);
    };
  }

  if (dom.grid) {
    if (state.missions.length === 0) {
      dom.grid.innerHTML = '<div class="text-center text-teal-200/60 py-6">No missions loaded yet.</div>';
    } else {
      dom.grid.innerHTML = state.missions.map(missionCardTemplate).join('');
      dom.grid.querySelectorAll('button[data-id]').forEach((button) => {
        const { id } = button.dataset;
        const img = button.querySelector('.mission-visual');
        button.onclick = () => gotoDetail(id);
        button.onpointerdown = () => triggerBounce(img || button);
      });
    }
  }

  if (dom.hlOpen) {
    dom.hlOpen.onpointerdown = () => triggerBounce(dom.hlImage);
  }

  let index = 0;
  const setHighlight = (idx) => {
    const mission = state.missions[idx % state.missions.length];
    if (!mission) return;
    dom.hlTitle.textContent = mission.title || '';
    dom.hlBlurb.textContent = mission.subtitle || '';
    dom.hlImage.src = mission.image || '';
    dom.hlOpen.onclick = () => gotoDetail(mission.id);
  };

  if (state.highlightTimer) clearInterval(state.highlightTimer);
  if (state.missions.length > 0) {
    setHighlight(0);
    if (state.missions.length > 1) {
      const interval = Math.max(3000, state.settings.highlightMs || 8000);
      state.highlightTimer = setInterval(() => {
        index = (index + 1) % state.missions.length;
        setHighlight(index);
      }, interval);
    }
  }

  updateAnnouncement();
  document.dispatchEvent(new CustomEvent('missions:updated'));
}

export function startApp() {
  if (state.appStarted) return;
  state.appStarted = true;
  dom.introScreen?.classList.add('hidden');
  dom.headerEl?.classList.remove('hidden');
  dom.mainEl?.classList.remove('hidden');
  if (!state.highlightTimer) {
    renderHome();
  }
  showView('home');
  resetIdle();
}

export function returnToIntro() {
  if (state.highlightTimer) {
    clearInterval(state.highlightTimer);
    state.highlightTimer = null;
  }
  if (state.idleTimer) {
    clearTimeout(state.idleTimer);
    state.idleTimer = null;
  }
  state.historyStack = [];
  state.appStarted = false;
  dom.detailView?.classList.add('hidden');
  dom.homeView?.classList.add('hidden');
  dom.mainEl?.classList.add('hidden');
  dom.headerEl?.classList.add('hidden');
  dom.introScreen?.classList.remove('hidden');
  dom.adminModal?.classList.add('hidden');
  dom.qrModal?.classList.add('hidden');
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

export function resetIdle() {
  if (!state.appStarted) return;
  if (state.idleTimer) {
    clearTimeout(state.idleTimer);
  }
  state.idleTimer = setTimeout(gotoHome, state.settings.idleMs || 60000);
}
