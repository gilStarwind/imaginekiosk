import { state, THEMES, DEFAULT_MISSIONS, MISSION_IMAGE_DIR, GENERAL_IMAGE_DIR, FS_SUPPORTED, ADMIN_PIN } from './data.js';
import { dom } from './dom.js';
import { clone, parseLinks } from './helpers.js';
import { summaryCards, adminMissionRowTemplate } from './templates.js';
import { getTotalViews, saveMissions, saveSettings } from './storage.js';
import { renderHome, applyTheme, updateAnnouncement, updateFooter } from './render.js';
import { parseCsvText } from './csv.js';

const setDirLabel = (label, handle) => {
  if (!label) return;
  label.textContent = handle ? handle.name || '(selected)' : 'Not selected';
};

export const updateImageUI = () => {
  if (!dom.imageStatus) return;
  if (!FS_SUPPORTED) {
    dom.imageStatus.textContent = 'Direct upload not supported in this browser. Use the OS to copy images.';
    dom.imageStatus.classList.add('text-red-300');
    dom.pickMissionsDirBtn?.setAttribute('disabled', 'true');
    dom.pickGeneralDirBtn?.setAttribute('disabled', 'true');
    dom.imageFileBrowse?.setAttribute('disabled', 'true');
    if (dom.imageTargetSelect) dom.imageTargetSelect.disabled = true;
    if (dom.imageDrop) dom.imageDrop.classList.add('opacity-60');
    return;
  }
  dom.imageStatus.textContent = 'Select a destination, then drag images or browse files. Changes persist immediately.';
};

const ensurePermission = async (handle) => {
  if (!handle) return false;
  if (handle.requestPermission) {
    const options = { mode: 'readwrite' };
    if ((await handle.queryPermission(options)) === 'granted') return true;
    return (await handle.requestPermission(options)) === 'granted';
  }
  return true;
};

const writeFileToDir = async (dirHandle, file) => {
  if (!dirHandle) throw new Error('Directory not selected');
  const permitted = await ensurePermission(dirHandle);
  if (!permitted) throw new Error('Permission denied');
  const targetHandle = await dirHandle.getFileHandle(file.name, { create: true });
  const writable = await targetHandle.createWritable();
  await writable.write(file);
  await writable.close();
  return `${dirHandle.name}/${file.name}`;
};

const handleImageFiles = async (fileList) => {
  if (!FS_SUPPORTED) return;
  if (!fileList || !fileList.length) return;
  const target = dom.imageTargetSelect?.value || 'missions';
  const dirHandle = target === 'general' ? state.generalDirHandle : state.missionsDirHandle;
  if (!dirHandle) {
    if (dom.imageStatus) {
      dom.imageStatus.textContent = `Select a ${target} folder before uploading.`;
      dom.imageStatus.classList.add('text-red-300');
    }
    return;
  }
  if (dom.imageStatus) {
    dom.imageStatus.classList.remove('text-red-300');
    dom.imageStatus.textContent = 'Saving files...';
  }
  const saved = [];
  const errors = [];
  for (const file of fileList) {
    try {
      await writeFileToDir(dirHandle, file);
      saved.push(file.name);
    } catch (err) {
      console.warn('Save failed', err);
      errors.push(`${file.name}: ${err.message || 'error'}`);
    }
  }
  const prefix = target === 'general' ? GENERAL_IMAGE_DIR : MISSION_IMAGE_DIR;
  const lines = [];
  if (saved.length) {
    lines.push(`Saved ${saved.length} file${saved.length > 1 ? 's' : ''}. Reference paths like <code>${prefix}${saved[0]}</code>${saved.length > 1 ? ` (or ${prefix}${saved[1]})` : ''}`);
  }
  if (errors.length) {
    lines.push(`<span class="text-red-300">Errors:</span> ${errors.join(', ')}`);
  }
  if (dom.imageStatus) {
    dom.imageStatus.innerHTML = lines.join('<br/>') || 'No files processed.';
  }
};

const renderAdminSummary = () => {
  if (!dom.adminSummary) return;
  const missions = state.pendingMissions.length ? state.pendingMissions : state.missions;
  dom.adminSummary.innerHTML = summaryCards(missions, state.meta.updatedAt, getTotalViews(missions));
};

const renderAdminMissions = () => {
  if (!dom.adminMissionList) return;
  if (!state.pendingMissions.length) {
    dom.adminMissionList.innerHTML = '<div class="text-center text-teal-200/60 py-6">No missions loaded yet.</div>';
    renderAdminSummary();
    return;
  }
  dom.adminMissionList.innerHTML = state.pendingMissions
    .map((mission, index) => adminMissionRowTemplate(mission, index))
    .join('');

  dom.adminMissionList.querySelectorAll('[data-index]').forEach((row) => {
    const index = Number(row.dataset.index);
    row.querySelectorAll('[data-field]').forEach((input) => {
      const field = input.dataset.field;
      input.addEventListener('input', (event) => {
        const value = event.target.value;
        if (field === 'links') {
          state.pendingMissions[index].links = parseLinks(value);
        } else {
          state.pendingMissions[index][field] = value;
        }
      });
    });

    row.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'remove') {
          state.pendingMissions.splice(index, 1);
        }
        if (action === 'up' && index > 0) {
          const [current] = state.pendingMissions.splice(index, 1);
          state.pendingMissions.splice(index - 1, 0, current);
        }
        if (action === 'down' && index < state.pendingMissions.length - 1) {
          const [current] = state.pendingMissions.splice(index, 1);
          state.pendingMissions.splice(index + 1, 0, current);
        }
        renderAdminMissions();
        renderAdminSummary();
      });
    });
  });

  renderAdminSummary();
};

const downloadData = () => {
  try {
    const payload = {
      missions: state.missions,
      settings: state.settings,
      updatedAt: state.meta.updatedAt
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `missions-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.warn('download failed', err);
  }
};

const closeAdminInternal = () => {
  dom.adminModal.classList.add('hidden');
  applyTheme(state.settings.theme);
  updateAnnouncement();
  updateFooter();
};

const initAdminPanel = () => {
  state.pendingMissions = clone(state.missions);
  state.pendingSettings = { ...state.settings };
  dom.adminAnnouncementInput.value = state.pendingSettings.announcement || '';
  dom.adminIdleInput.value = Math.round((state.pendingSettings.idleMs || 60000) / 1000);
  dom.adminHighlightInput.value = Math.round((state.pendingSettings.highlightMs || 8000) / 1000);

  if (dom.adminThemeSelect) {
    dom.adminThemeSelect.innerHTML = Object.entries(THEMES)
      .map(([key, theme]) => `<option value="${key}">${theme.label}</option>`)
      .join('');
    dom.adminThemeSelect.value = state.pendingSettings.theme || state.settings.theme;
  }

  updateImageUI();
  setDirLabel(dom.missionsDirLabel, state.missionsDirHandle);
  setDirLabel(dom.generalDirLabel, state.generalDirHandle);
  if (dom.imageTargetLabel) {
    const target = dom.imageTargetSelect?.value === 'general' ? GENERAL_IMAGE_DIR : MISSION_IMAGE_DIR;
    dom.imageTargetLabel.textContent = target;
  }

  renderAdminSummary();
  renderAdminMissions();
};

export const openAdmin = () => {
  dom.adminModal.classList.remove('hidden');
  dom.adminPinWrap.classList.remove('hidden');
  dom.adminBody.classList.add('hidden');
  dom.adminPin.value = '';
  dom.adminPinMsg.classList.add('hidden');
};

export const closeAdmin = () => {
  closeAdminInternal();
};

const applyPendingChanges = () => {
  if (!state.pendingMissions.length) return;
  if (!state.pendingSettings) state.pendingSettings = { ...state.settings };
  state.missions = clone(state.pendingMissions);
  state.settings = { ...state.settings, ...state.pendingSettings };
  saveMissions(state.missions, state.meta);
  saveSettings(state.settings);
  applyTheme(state.settings.theme);
  updateAnnouncement();
  updateFooter();
  renderHome();
  closeAdminInternal();
};

const handleCsvText = (text) => {
  const parsed = parseCsvText(text);
  if (!parsed.length) return;
  state.pendingMissions = clone(parsed);
  renderAdminMissions();
  renderAdminSummary();
};

export const initAdmin = () => {
  dom.adminPinBtn?.addEventListener('click', () => {
    if (dom.adminPin.value === ADMIN_PIN) {
      dom.adminPinWrap.classList.add('hidden');
      dom.adminBody.classList.remove('hidden');
      dom.adminPinMsg.classList.add('hidden');
      initAdminPanel();
    } else {
      dom.adminPinMsg.classList.remove('hidden');
    }
  });

  dom.csvInput?.addEventListener('change', async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    const text = await file.text();
    handleCsvText(text);
    event.target.value = '';
  });

  dom.adminSaveBtn?.addEventListener('click', applyPendingChanges);

  dom.adminClearBtn?.addEventListener('click', () => {
    localStorage.removeItem('missions:data');
    localStorage.removeItem('missions:meta');
    state.meta.updatedAt = null;
    state.missions = clone(DEFAULT_MISSIONS);
    state.pendingMissions = clone(state.missions);
    renderHome();
    renderAdminSummary();
    renderAdminMissions();
  });

  dom.adminDownloadBtn?.addEventListener('click', downloadData);

  dom.adminAnnouncementInput?.addEventListener('input', (event) => {
    if (!state.pendingSettings) state.pendingSettings = { ...state.settings };
    state.pendingSettings.announcement = event.target.value;
    dom.announceText.textContent = event.target.value;
    if (event.target.value.trim()) {
      dom.announceBar.classList.remove('hidden');
    } else {
      dom.announceBar.classList.add('hidden');
    }
  });

  dom.adminIdleInput?.addEventListener('input', (event) => {
    if (!state.pendingSettings) state.pendingSettings = { ...state.settings };
    const seconds = Math.max(10, parseInt(event.target.value, 10) || 60);
    state.pendingSettings.idleMs = seconds * 1000;
    if (dom.footerIdle) dom.footerIdle.textContent = seconds;
  });

  dom.adminHighlightInput?.addEventListener('input', (event) => {
    if (!state.pendingSettings) state.pendingSettings = { ...state.settings };
    const seconds = Math.max(3, parseInt(event.target.value, 10) || 8);
    state.pendingSettings.highlightMs = seconds * 1000;
  });

  dom.adminThemeSelect?.addEventListener('change', (event) => {
    if (!state.pendingSettings) state.pendingSettings = { ...state.settings };
    state.pendingSettings.theme = event.target.value;
    applyTheme(state.pendingSettings.theme);
  });

  dom.adminAddMission?.addEventListener('click', () => {
    if (!state.pendingMissions.length) {
      state.pendingMissions = clone(state.missions);
    }
    state.pendingMissions.push({
      id: `mission-${Date.now()}`,
      title: 'New Mission',
      subtitle: '',
      focus: '',
      involved: '',
      contact: '',
      body: '',
      image: '',
      links: []
    });
    renderAdminMissions();
    renderAdminSummary();
  });

  dom.pickMissionsDirBtn?.addEventListener('click', async () => {
    if (!FS_SUPPORTED) return;
    try {
      const handle = await window.showDirectoryPicker();
      state.missionsDirHandle = handle;
      setDirLabel(dom.missionsDirLabel, handle);
      if (dom.imageStatus) {
        dom.imageStatus.classList.remove('text-red-300');
        dom.imageStatus.textContent = `Ready to save into ${handle.name}.`;
      }
    } catch (err) {
      console.warn('Directory pick cancelled', err);
    }
  });

  dom.pickGeneralDirBtn?.addEventListener('click', async () => {
    if (!FS_SUPPORTED) return;
    try {
      const handle = await window.showDirectoryPicker();
      state.generalDirHandle = handle;
      setDirLabel(dom.generalDirLabel, handle);
      if (dom.imageStatus) {
        dom.imageStatus.classList.remove('text-red-300');
        dom.imageStatus.textContent = `Ready to save into ${handle.name}.`;
      }
    } catch (err) {
      console.warn('Directory pick cancelled', err);
    }
  });

  dom.imageTargetSelect?.addEventListener('change', (event) => {
    if (dom.imageTargetLabel) {
      dom.imageTargetLabel.textContent = event.target.value === 'general' ? GENERAL_IMAGE_DIR : MISSION_IMAGE_DIR;
    }
    if (dom.imageStatus) {
      const handle = event.target.value === 'general' ? state.generalDirHandle : state.missionsDirHandle;
      dom.imageStatus.textContent = handle ? `Ready to save into ${handle.name}.` : `Select a ${event.target.value} folder before uploading.`;
    }
  });

  dom.imageFileBrowse?.addEventListener('click', () => dom.imageFileInput?.click());

  dom.imageFileInput?.addEventListener('change', (event) => {
    handleImageFiles(Array.from(event.target.files || []));
    event.target.value = '';
  });

  if (dom.imageDrop) {
    ['dragenter', 'dragover'].forEach((evt) => dom.imageDrop.addEventListener(evt, (event) => {
      event.preventDefault();
      dom.imageDrop.classList.add('dragover');
    }));
    ['dragleave', 'drop'].forEach((evt) => dom.imageDrop.addEventListener(evt, (event) => {
      event.preventDefault();
      dom.imageDrop.classList.remove('dragover');
    }));
    dom.imageDrop.addEventListener('drop', (event) => {
      handleImageFiles(Array.from(event.dataTransfer?.files || []));
    });
    dom.imageDrop.addEventListener('click', () => dom.imageFileInput?.click());
  }

  document.addEventListener('missions:updated', renderAdminSummary);
  document.addEventListener('missions:viewed', renderAdminSummary);
};
