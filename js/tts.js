// Text-to-speech via Web Speech API
let _ttsLesson = null;
let _ttsState  = 'stopped'; // 'stopped' | 'playing' | 'paused'
let _ttsUtt    = null;

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

function ttsPlay() {
  if (!window.speechSynthesis) {
    alert('Text-to-speech is not supported in your browser.');
    return;
  }
  if (!_ttsLesson) return;

  if (_ttsState === 'paused') {
    window.speechSynthesis.resume();
    _ttsState = 'playing';
    ttsUpdateUI();
    return;
  }

  window.speechSynthesis.cancel();
  _ttsUtt = new SpeechSynthesisUtterance(_ttsGetText(_ttsLesson));
  _ttsUtt.rate = 0.92;
  _ttsUtt.pitch = 1.0;
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
