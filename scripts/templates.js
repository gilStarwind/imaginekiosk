import { html, escapeAttr, escapeHTML, serializeLinks, formatDate } from './helpers.js';
import { PLACEHOLDER_IMAGE } from './data.js';
import { getViewsFor } from './storage.js';

export const missionCardTemplate = (mission) => {
  return html`
    <button class="mission-card group touch text-left p-5 rounded-3xl border transition-transform active:scale-[0.99]" data-id="${escapeAttr(mission.id)}">
      <div class="flex items-start gap-3">
        <div class="grow">
          <div class="text-xs uppercase tracking-wider t-muted">Mission</div>
          <div class="mt-1 text-2xl font-bold">${escapeHTML(mission.title)}</div>
          <div class="mt-2 t-subtle">${escapeHTML(mission.subtitle || '')}</div>
        </div>
        <div class="mission-chip shrink-0 w-24 h-24 rounded-2xl overflow-hidden border">
          <img class="mission-visual w-full h-full object-cover" src="${escapeAttr(mission.image || PLACEHOLDER_IMAGE)}" alt="${escapeAttr(mission.title)}" />
        </div>
      </div>
    </button>
  `;
};

export const adminSummaryTemplate = (cards) => {
  return html`${cards.map(
    (card) => html`
      <div class="admin-card">
        <div class="text-xs text-teal-200/70 uppercase tracking-widest">${escapeHTML(card.label)}</div>
        <div class="mt-3 text-3xl font-bold">${escapeHTML(String(card.value))}</div>
      </div>
    `
  )}`;
};

export const adminMissionRowTemplate = (mission, index) => {
  const viewCount = getViewsFor(mission.id);
  return html`
    <div class="admin-card space-y-3" data-index="${index}">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="font-semibold">${index + 1}. ${escapeHTML(mission.title || 'Untitled Mission')}</div>
          <div class="text-xs text-teal-200/60">Views: ${viewCount}</div>
        </div>
        <div class="flex gap-2 text-xs">
          <button class="admin-icon-btn" data-action="up" title="Move up">↑</button>
          <button class="admin-icon-btn" data-action="down" title="Move down">↓</button>
          <button class="admin-icon-btn admin-icon-btn--danger" data-action="remove" title="Remove">✕</button>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="block space-y-1 text-xs uppercase tracking-wide text-teal-200/70">
          <span>Title</span>
          <input class="input-field" data-field="title" value="${escapeAttr(mission.title)}" />
        </label>
        <label class="block space-y-1 text-xs uppercase tracking-wide text-teal-200/70">
          <span>Subtitle</span>
          <input class="input-field" data-field="subtitle" value="${escapeAttr(mission.subtitle)}" />
        </label>
      </div>
      <label class="block space-y-1 text-xs uppercase tracking-wide text-teal-200/70">
        <span>Focus</span>
        <textarea class="textarea-field" data-field="focus">${escapeHTML(mission.focus)}</textarea>
      </label>
      <label class="block space-y-1 text-xs uppercase tracking-wide text-teal-200/70">
        <span>How to Get Involved</span>
        <textarea class="textarea-field" data-field="involved">${escapeHTML(mission.involved)}</textarea>
      </label>
      <label class="block space-y-1 text-xs uppercase tracking-wide text-teal-200/70">
        <span>Body Copy</span>
        <textarea class="textarea-field" data-field="body">${escapeHTML(mission.body)}</textarea>
      </label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="block space-y-1 text-xs uppercase tracking-wide text-teal-200/70">
          <span>Contact</span>
          <input class="input-field" data-field="contact" value="${escapeAttr(mission.contact)}" />
        </label>
        <label class="block space-y-1 text-xs uppercase tracking-wide text-teal-200/70">
          <span>Image URL</span>
          <input class="input-field" data-field="image" value="${escapeAttr(mission.image)}" />
        </label>
      </div>
      <div class="flex items-center gap-3">
        <div class="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-emerald-800/50 bg-slate-800/50 flex items-center justify-center">
          ${mission.image
            ? html`<img data-role="thumb" alt="image preview" class="w-full h-full object-cover" src="${escapeAttr(mission.image)}"/>`
            : html`<div data-role="thumb-empty" class="text-[10px] text-teal-200/60 px-1 text-center">No image</div>`}
        </div>
        <input type="file" accept="image/*" class="hidden" data-role="file" />
        <button class="admin-icon-btn" data-action="choose-image">Choose Image</button>
        <div class="text-xs text-teal-200/70" data-role="imgStatus"></div>
      </div>
      <div class="text-xs text-teal-200/60">Tip: you can also drag or paste an image anywhere onto this card to set it.</div>
      <label class="block space-y-1 text-xs uppercase tracking-wide text-teal-200/70">
        <span>Links (Label|URL; another|URL)</span>
        <textarea class="textarea-field" data-field="links">${escapeHTML(serializeLinks(mission.links))}</textarea>
      </label>
    </div>
  `;
};

export const summaryCards = (missions, updatedAt, totalViews) => {
  const cards = [
    { label: 'Missions', value: missions.length },
    { label: 'Last Update', value: formatDate(updatedAt) },
    { label: 'Total Views', value: totalViews }
  ];
  return adminSummaryTemplate(cards);
};
