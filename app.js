'use strict';
const byId = id => document.getElementById(id);
const editor = byId('editor');
const mirror = byId('mirror');
const rail = byId('rail');
const menu = byId('notes');
const search = byId('search');
const status = byId('status');
const key = 'paper-desk-v1';
const fresh = () => ({ id: crypto.randomUUID(), text: '' });
let state = { notes: [], active: null, sound: true, lamp: false, pale: false };
let storageOK = true;
try {
  const raw = localStorage.getItem(key);
  if (raw) state = JSON.parse(raw);
} catch {
  storageOK = false;
}
if (!state.notes.length) state.notes.push(fresh());
if (!state.notes.some(note => note.id === state.active)) state.active = state.notes[0].id;

const current = () => state.notes.find(note => note.id === state.active);
function save() {
  try {
    if (!storageOK) throw new Error('Storage unavailable');
    localStorage.setItem(key, JSON.stringify(state));
    status.textContent = '이 브라우저에 저장됨';
  } catch {
    status.textContent = '저장할 수 없습니다. 창을 닫기 전에 글을 복사하세요.';
  }
}
function list() {
  const query = search.value.toLocaleLowerCase();
  menu.replaceChildren();
  for (const note of state.notes) {
    if (!note.text.toLocaleLowerCase().includes(query)) continue;
    const button = document.createElement('button');
    button.textContent = note.text.trim().split('\n')[0] || '새 메모';
    button.setAttribute('aria-current', String(note.id === state.active));
    button.addEventListener('click', () => openNote(note.id));
    menu.append(button);
  }
}
function openNote(id) {
  state.active = id;
  editor.value = current().text;
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
  list();
  save();
  requestAnimationFrame(positionCapsule);
}
function add() {
  const note = fresh();
  state.notes.unshift(note);
  search.value = '';
  openNote(note.id);
}
function positionCapsule() {
  mirror.style.width = editor.clientWidth + 'px';
  const position = editor.selectionEnd;
  const cursor = document.createElement('span');
  cursor.textContent = '\u200b';
  mirror.replaceChildren(editor.value.slice(0, position), cursor, editor.value.slice(position));
  const y = cursor.offsetTop - editor.scrollTop;
  rail.hidden = y < 8 || y > editor.clientHeight;
  rail.style.top = (y - 5) + 'px';
  rail.style.setProperty('--capsule', Math.max(10, Math.min(editor.clientWidth - 34, cursor.offsetLeft - 12)) + 'px');
}
function updateSettings() {
  document.body.classList.toggle('pale', state.pale);
  document.body.classList.toggle('lamp', state.lamp);
  byId('lamp').setAttribute('aria-pressed', String(state.lamp));
  byId('sound').setAttribute('aria-pressed', String(state.sound));
}

let audio;
let strike;
function playStrike(returnKey) {
  if (!state.sound) return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  audio ||= new Audio();
  if (audio.state === 'suspended') audio.resume().catch(() => {});
  if (!strike) {
    strike = audio.createBuffer(1, Math.floor(audio.sampleRate * .065), audio.sampleRate);
    const samples = strike.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      const time = i / audio.sampleRate;
      samples[i] = (Math.random() - .5 + .3 * Math.sin(time * 2100)) * Math.exp(-time * 95);
    }
  }
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = strike;
  source.playbackRate.value = returnKey ? .65 : .9 + Math.random() * .25;
  gain.gain.value = returnKey ? .33 : .22;
  source.connect(gain).connect(audio.destination);
  source.start();
}
let composing = false;
let frame;
function queuePosition() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(positionCapsule);
}
function commit() {
  current().text = editor.value;
  save();
  list();
  queuePosition();
}
editor.addEventListener('compositionstart', () => { composing = true; });
editor.addEventListener('compositionend', () => { composing = false; commit(); });
editor.addEventListener('input', event => {
  if (!composing && !event.isComposing) commit();
  else queuePosition();
});
editor.addEventListener('keydown', event => {
  if (!event.metaKey && !event.ctrlKey && !event.altKey &&
      (event.key.length === 1 || event.isComposing || ['Enter','Backspace','Delete','Process'].includes(event.key))) {
    playStrike(event.key === 'Enter');
  }
});
for (const event of ['keyup', 'scroll', 'click', 'select']) editor.addEventListener(event, queuePosition);
new ResizeObserver(queuePosition).observe(editor);
byId('add').onclick = add;
byId('sidebar').onclick = () => {
  const aside = document.querySelector('aside');
  aside.hidden = !aside.hidden;
  byId('sidebar').setAttribute('aria-expanded', String(!aside.hidden));
};
for (const [id, field] of [['sound','sound'],['lamp','lamp'],['tone','pale']]) {
  byId(id).onclick = () => { state[field] = !state[field]; updateSettings(); save(); };
}
search.addEventListener('input', list);
updateSettings();
openNote(state.active);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(console.error);
