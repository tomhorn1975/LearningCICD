// Text-to-speech via Web Speech API — with voice picker + speed control
const TTS_PREFS_KEY = 'cicd_tts_prefs';

let _ttsVoices  = [];
let _ttsVoice   = null;
let _ttsRate    = 0.92;
let _ttsLesson  = null;
let _ttsState   = 'stopped'; // 'stopped' | 'playing' | 'paused'
let _ttsUtt     = null;

// ── Prefs ──────────────────────────────────────────────────────────────────────
function _ttsLoadPrefs() {
  try { return JSON.parse(localStorage.getItem(TTS_PREFS_KEY)) || {}; } catch { return {}; }
}
function _ttsSavePrefs(p) { localStorage.setItem(TTS_PREFS_KEY, JSON.stringify(p)); }

// ── Voice loading ──────────────────────────────────────────────────────────────
function _ttsScoreVoice(v) {
  const n = v.name.toLowerCase();
  const l = v.lang.toLowerCase();
  if (!l.startsWith('en')) return -1;
  let score = 0;
  if (n.includes('natural') || n.includes('neural')) score += 100;
  if (n.includes('online'))                           score += 50;
  if (n.includes('microsoft') || n.includes('google')) score += 30;
  if (l === 'en-us')           score += 10;
  else if (l === 'en-gb')      score += 8;
  else if (l.startsWith('en')) score += 5;
  return score;
}

function _ttsLoadVoices() {
  const all = window.speechSynthesis.getVoices();
  const english = all.filter(v => v.lang.toLowerCase().startsWith('en'));
  english.sort((a, b) => _ttsScoreVoice(b) - _ttsScoreVoice(a));
  _ttsVoices = english;

  const prefs = _ttsLoadPrefs();
  _ttsVoice = (prefs.voiceName && english.find(v => v.name === prefs.voiceName)) || english[0] || null;
  _ttsRate  = prefs.rate || 0.92;

  _ttsPopulateVoicePicker();
  _ttsSetRateSelect();
}

function _ttsVoiceLabel(v) {
  // Clean up long Microsoft/Google voice names for display
  return v.name
    .replace(' Online (Natural)', ' ✦')
    .replace('Microsoft ', '')
    .replace(' - English (United States)', '')
    .replace(' - English (United Kingdom)', '')
    .replace(' - English (Australia)', '');
}

function _ttsVoiceOptionsHTML() {
  if (!_ttsVoices.length) return '<option>Loading voices...</option>';
  return _ttsVoices.map(v =>
    `<option value="${v.name}" ${_ttsVoice?.name === v.name ? 'selected' : ''}>${_ttsVoiceLabel(v)} (${v.lang})</option>`
  ).join('');
}

function _ttsRateOptionsHTML() {
  const rates = [
    { v: 0.75, label: 'Slow' },
    { v: 0.92, label: 'Normal' },
    { v: 1.1,  label: 'Fast' },
    { v: 1.3,  label: 'Faster' }
  ];
  return rates.map(r =>
    `<option value="${r.v}" ${Math.abs(_ttsRate - r.v) < 0.05 ? 'selected' : ''}>${r.label}</option>`
  ).join('');
}

function _ttsPopulateVoicePicker() {
  const sel = document.getElementById('tts-voice-select');
  if (sel) sel.innerHTML = _ttsVoiceOptionsHTML();
}

function _ttsSetRateSelect() {
  const sel = document.getElementById('tts-rate-select');
  if (!sel) return;
  for (const opt of sel.options) {
    opt.selected = Math.abs(parseFloat(opt.value) - _ttsRate) < 0.05;
  }
}

// ── Public: voice / rate setters ───────────────────────────────────────────────
function ttsSetVoice(name) {
  _ttsVoice = _ttsVoices.find(v => v.name === name) || _ttsVoice;
  const prefs = _ttsLoadPrefs();
  _ttsSavePrefs({ ...prefs, voiceName: name });
  if (_ttsState !== 'stopped') { ttsStop(); ttsPlay(); }
}

function ttsSetRate(rate) {
  _ttsRate = rate;
  const prefs = _ttsLoadPrefs();
  _ttsSavePrefs({ ...prefs, rate });
  if (_ttsState !== 'stopped') { ttsStop(); ttsPlay(); }
}

// ── UI update ──────────────────────────────────────────────────────────────────
function ttsUpdateUI() {
  const btn = document.getElementById('tts-btn');
  const bar = document.getElementById('tts-bar');
  if (!btn) return;
  if (_ttsState === 'playing') {
    btn.innerHTML = '<span class="tts-icon">⏸</span> Pause';
    btn.classList.add('tts-active');
    if (bar) bar.classList.add('tts-bar-active');
  } else if (_ttsState === 'paused') {
    btn.innerHTML = '<span class="tts-icon">▶</span> Resume';
    btn.classList.remove('tts-active');
    if (bar) bar.classList.add('tts-bar-active');
  } else {
    btn.innerHTML = '<span class="tts-icon">🔊</span> Listen';
    btn.classList.remove('tts-active');
    if (bar) bar.classList.remove('tts-bar-active');
  }
}

// ── Text extraction ────────────────────────────────────────────────────────────
function _ttsStripHtml(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
}

function _ttsGetText(lesson) {
  return [
    lesson.title + '.',
    _ttsStripHtml(lesson.content),
    'Key takeaways:',
    lesson.takeaways.join('. ') + '.'
  ].join(' ');
}

// ── Playback controls ──────────────────────────────────────────────────────────
function ttsPlay() {
  if (!window.speechSynthesis) { alert('Text-to-speech is not supported in your browser.'); return; }
  if (!_ttsLesson) return;

  if (_ttsState === 'paused') {
    window.speechSynthesis.resume();
    _ttsState = 'playing';
    ttsUpdateUI();
    return;
  }

  window.speechSynthesis.cancel();
  _ttsUtt = new SpeechSynthesisUtterance(_ttsGetText(_ttsLesson));
  _ttsUtt.rate  = _ttsRate;
  _ttsUtt.pitch = 1.0;
  if (_ttsVoice) _ttsUtt.voice = _ttsVoice;
  _ttsUtt.onstart  = () => { _ttsState = 'playing'; ttsUpdateUI(); };
  _ttsUtt.onend    = () => { _ttsState = 'stopped'; ttsUpdateUI(); };
  _ttsUtt.onerror  = () => { _ttsState = 'stopped'; ttsUpdateUI(); };
  _ttsUtt.onpause  = () => { _ttsState = 'paused';  ttsUpdateUI(); };
  _ttsUtt.onresume = () => { _ttsState = 'playing'; ttsUpdateUI(); };
  window.speechSynthesis.speak(_ttsUtt);
}

function ttsPause() {
  if (_ttsState === 'playing' && window.speechSynthesis) {
    window.speechSynthesis.pause();
    _ttsState = 'paused';
    ttsUpdateUI();
  }
}

function ttsStop() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  _ttsState  = 'stopped';
  _ttsLesson = null;
  ttsUpdateUI();
}

function ttsToggle() {
  if (_ttsState === 'playing') ttsPause();
  else ttsPlay();
}

function ttsSetLesson(lesson) {
  if (_ttsLesson && _ttsLesson.id !== lesson.id) ttsStop();
  _ttsLesson = lesson;
}

// ── Init ───────────────────────────────────────────────────────────────────────
window.speechSynthesis.onvoiceschanged = _ttsLoadVoices;
document.addEventListener('DOMContentLoaded', _ttsLoadVoices);
