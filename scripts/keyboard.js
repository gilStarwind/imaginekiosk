import { dom } from './dom.js';

const INPUT_SELECTOR = 'input[type="text"],input[type="password"],input[type="email"],input[type="number"],input[type="search"],textarea';

let oskEl = null;
let currentEl = null;
let shift = false;
let symbols = false;
let minimized = false;

const LETTER_ROWS = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['⇧','z','x','c','v','b','n','m','⌫'],
  ['123','.','\u002c','space','enter','hide']
];

const SYMBOL_ROWS = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['!','@','#','$','%','&','*','(',')','/'],
  ['-','_','+','=','[',']','{','}','\\'],
  ['ABC','.',':',';','\"','\'','?','⌫'],
  ['.','@','\u002c','space','enter','hide']
];

const NUMERIC_ROWS = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['-','+','.',',','@'],
  ['hide','⌫','enter']
];

function buildRow(keys) {
  const row = document.createElement('div');
  row.className = 'osk-row';
  keys.forEach((key) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'osk-key';
    let label = key;
    let value = key;
    if (key === 'space') { btn.classList.add('osk-key--space'); label = 'space'; value = ' '; }
    if (key === 'enter') { btn.classList.add('osk-key--wide'); }
    if (key === 'hide') { btn.classList.add('osk-key--wide'); }
    if (key === '⇧' || key === 'ABC' || key === '123') { btn.classList.add('osk-key--wide'); }
    if (key === '\u002c') { label = ','; value = ','; }
    btn.textContent = label;
    btn.dataset.key = value;
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', onKeyClick);
    row.appendChild(btn);
  });
  return row;
}

function renderLayout(typeHint) {
  if (!oskEl) return;
  oskEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'osk-wrap';
  const head = document.createElement('div');
  head.className = 'osk-head';
  head.innerHTML = `<div>On-screen keyboard</div>`;

  const right = document.createElement('div');
  right.style.display = 'flex';
  right.style.gap = '8px';

  const minimizeBtn = document.createElement('button');
  minimizeBtn.className = 'osk-hide';
  minimizeBtn.textContent = minimized ? 'Show' : 'Minimize';
  minimizeBtn.addEventListener('click', () => {
    minimized = !minimized;
    renderLayout(typeHint);
  });
  right.appendChild(minimizeBtn);

  const hide = document.createElement('button');
  hide.className = 'osk-hide';
  hide.textContent = 'Hide';
  hide.addEventListener('click', hideOSK);
  right.appendChild(hide);

  head.appendChild(right);
  wrap.appendChild(head);

  if (minimized) {
    oskEl.classList.add('osk--min');
    oskEl.appendChild(wrap);
    return;
  } else {
    oskEl.classList.remove('osk--min');
  }

  let rows;
  if (typeHint === 'number') {
    rows = NUMERIC_ROWS;
  } else if (symbols) {
    rows = SYMBOL_ROWS;
  } else {
    rows = LETTER_ROWS;
  }

  rows.forEach((keys) => wrap.appendChild(buildRow(keys)));
  oskEl.appendChild(wrap);
  applyCasing();
}

function applyCasing() {
  if (!oskEl) return;
  oskEl.querySelectorAll('.osk-key').forEach((btn) => {
    const k = btn.dataset.key || '';
    if (k.length === 1 && /[a-z]/i.test(k) && !symbols) {
      const newLabel = shift ? k.toUpperCase() : k.toLowerCase();
      btn.textContent = newLabel;
      btn.dataset.key = newLabel;
    }
  });
}

function showOSK(typeHint) {
  if (!oskEl) return;
  minimized = false; // expand when focusing an input
  renderLayout(typeHint);
  oskEl.classList.remove('hidden');
  document.body.classList.add('osk-open');
}

function hideOSK() {
  if (oskEl) {
    oskEl.classList.add('hidden');
  }
  currentEl = null;
  shift = false;
  symbols = false;
  minimized = false;
  document.body.classList.remove('osk-open');
}

function insertText(txt) {
  if (!currentEl) return;
  const el = currentEl;
  const isTextarea = el.tagName === 'TEXTAREA';
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  const before = el.value.slice(0, start);
  const after = el.value.slice(end);
  el.value = before + txt + after;
  const pos = start + txt.length;
  try { el.setSelectionRange(pos, pos); } catch (_) {}
  el.dispatchEvent(new Event('input', { bubbles: true }));
  if (!isTextarea) {
    // keep focus so caret stays visible
    el.focus();
  }
}

function backspace() {
  if (!currentEl) return;
  const el = currentEl;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  if (start === 0 && end === 0) return;
  if (start !== end) {
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    el.value = before + after;
    try { el.setSelectionRange(start, start); } catch (_) {}
  } else {
    const before = el.value.slice(0, start - 1);
    const after = el.value.slice(end);
    el.value = before + after;
    const pos = start - 1;
    try { el.setSelectionRange(pos, pos); } catch (_) {}
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.focus();
}

function onKeyClick(ev) {
  if (!currentEl) return;
  const val = ev.currentTarget.dataset.key;
  if (val === '⇧') { shift = !shift; symbols = false; applyCasing(); return; }
  if (val === 'ABC') { symbols = false; shift = false; renderLayout(); return; }
  if (val === '123') { symbols = true; shift = false; renderLayout(); return; }
  if (val === 'hide') { hideOSK(); return; }
  if (val === '⌫') { backspace(); return; }
  if (val === 'enter') {
    if (currentEl.tagName === 'TEXTAREA') {
      insertText('\n');
    } else {
      currentEl.blur();
      hideOSK();
    }
    return;
  }
  insertText(val);
  if (shift && !symbols) {
    shift = false;
    applyCasing();
  }
}

function eligible(el) {
  if (!el) return false;
  if (!dom.adminModal || dom.adminModal.classList.contains('hidden')) return false;
  return el.matches && el.matches(INPUT_SELECTOR);
}

export function initKeyboard() {
  const setup = () => {
    oskEl = document.getElementById('osk');
    if (!oskEl) return;
    document.addEventListener('focusin', (ev) => {
      const t = ev.target;
      if (!eligible(t)) return;
      currentEl = t;
      const typeHint = (t.getAttribute('type') || '').toLowerCase();
      showOSK(typeHint);
    });
    // Hide when admin closes
    document.addEventListener('click', (ev) => {
      const closeTarget = ev.target && ev.target.dataset && ev.target.dataset.close;
      if (closeTarget === 'admin') hideOSK();
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}
