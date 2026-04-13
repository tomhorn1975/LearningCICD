// ── State ─────────────────────────────────────────────────────────────────────
const STATE_KEY = 'cicd_learning_hub';

// ── Adaptive State ────────────────────────────────────────────────────────────
let adaptiveLesson         = null;   // current AI-generated lesson object
let currentIsAdaptive      = false;  // true when in adaptive lesson/quiz/results
let adaptiveError          = '';     // error message from fetch

function loadState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {}; }
  catch { return {}; }
}
function saveState(s) { localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

let state = loadState();
// state[lessonId] = { status: 'complete'|'in-progress'|'not-started'|'needs-review', score: 0-100, attempts: n, lastAttempt: timestamp }

function getLessonState(lessonId) {
  return state[lessonId] || { status: 'not-started', score: null, attempts: 0 };
}
function setLessonState(lessonId, update) {
  state[lessonId] = { ...getLessonState(lessonId), ...update };
  saveState(state);
}

// ── Navigation ────────────────────────────────────────────────────────────────
let currentView = 'dashboard';
let currentModule = null;
let currentLesson = null;
let currentQuizState = null;

function navigate(view, moduleId, lessonId) {
  currentView = view;
  currentModule = moduleId || null;
  currentLesson = lessonId || null;
  currentQuizState = null;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-' + view);
  if (btn) btn.classList.add('active');
  render();
}

function render() {
  const root = document.getElementById('root');
  if (currentView === 'dashboard') {
    document.getElementById('btn-dashboard').classList.add('active');
    document.getElementById('btn-progress').classList.remove('active');
    root.innerHTML = renderDashboard();
  } else if (currentView === 'progress') {
    document.getElementById('btn-progress').classList.add('active');
    document.getElementById('btn-dashboard').classList.remove('active');
    root.innerHTML = renderProgress();
  } else if (currentView === 'module') {
    root.innerHTML = renderModuleView();
  } else if (currentView === 'lesson') {
    root.innerHTML = renderLessonView();
  } else if (currentView === 'quiz') {
    root.innerHTML = renderQuizView();
  } else if (currentView === 'results') {
    root.innerHTML = renderResultsView();
  } else if (currentView === 'adaptive-loading') {
    root.innerHTML = renderAdaptiveLoading();
  } else if (currentView === 'adaptive-lesson') {
    root.innerHTML = renderAdaptiveLessonView();
  } else if (currentView === 'adaptive-error') {
    root.innerHTML = renderAdaptiveError();
  }
}

// ── Stats Helpers ─────────────────────────────────────────────────────────────
function getAllLessons() {
  return CURRICULUM.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id })));
}
function totalLessons() { return getAllLessons().length; }
function completedLessons() { return getAllLessons().filter(l => getLessonState(l.id).status === 'complete').length; }
function needsReviewLessons() { return getAllLessons().filter(l => getLessonState(l.id).status === 'needs-review'); }
function avgScore() {
  const scored = getAllLessons().filter(l => getLessonState(l.id).score !== null);
  if (!scored.length) return null;
  return Math.round(scored.reduce((a, l) => a + getLessonState(l.id).score, 0) / scored.length);
}

function moduleProgress(module) {
  const total = module.lessons.length;
  const done = module.lessons.filter(l => getLessonState(l.id).status === 'complete').length;
  const inProg = module.lessons.filter(l => getLessonState(l.id).status === 'in-progress').length;
  const review = module.lessons.filter(l => getLessonState(l.id).status === 'needs-review').length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  let status = 'not-started';
  if (done === total) status = 'complete';
  else if (review > 0) status = 'needs-review';
  else if (done > 0 || inProg > 0) status = 'in-progress';
  return { total, done, inProg, review, pct, status };
}

// ── Status Helpers ────────────────────────────────────────────────────────────
const STATUS_ICONS = { 'complete': '✓', 'in-progress': '▶', 'not-started': '○', 'needs-review': '!' };
const STATUS_LABELS = { 'complete': 'Complete', 'in-progress': 'In Progress', 'not-started': 'Not Started', 'needs-review': 'Needs Review' };
const STATUS_CLASSES = { 'complete': 'badge-complete', 'in-progress': 'badge-in-progress', 'not-started': 'badge-not-started', 'needs-review': 'badge-needs-review' };
const ICON_CLASSES = { 'complete': 'status-complete', 'in-progress': 'status-in-progress', 'not-started': 'status-not-started', 'needs-review': 'status-needs-review' };

function scoreClass(score) {
  if (score === null) return 'score-none';
  if (score >= 80) return 'score-good';
  if (score >= 60) return 'score-ok';
  return 'score-low';
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const total = totalLessons();
  const completed = completedLessons();
  const avg = avgScore();
  const review = needsReviewLessons().length;
  const overallPct = total ? Math.round((completed / total) * 100) : 0;

  const statsHTML = `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${completed}/${total}</div>
        <div class="stat-label">Lessons Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${overallPct}%</div>
        <div class="stat-label">Overall Progress</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${avg !== null ? avg + '%' : '—'}</div>
        <div class="stat-label">Average Quiz Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${review}</div>
        <div class="stat-label">Areas to Review</div>
      </div>
    </div>`;

  const progressHTML = `
    <div class="overall-bar">
      <div class="overall-bar-label">
        <span>Overall Curriculum Progress</span>
        <span>${overallPct}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${overallPct === 100 ? 'complete' : ''}" style="width:${overallPct}%"></div>
      </div>
    </div>`;

  const modulesHTML = CURRICULUM.map(m => {
    const prog = moduleProgress(m);
    const advBadge = m.isAdvanced
      ? `<span style="font-size:10px;font-weight:700;background:#f3e8ff;color:#6b21a8;padding:2px 7px;border-radius:99px;margin-left:6px;vertical-align:middle;">ADVANCED</span>`
      : '';
    return `
      <div class="module-card${m.isAdvanced ? ' module-card-advanced' : ''}" onclick="navigate('module','${m.id}')">
        <div class="module-card-header">
          <div class="module-icon">${m.icon}</div>
          <div>
            <div class="module-title">${m.title}${advBadge}</div>
            <div class="module-desc">${m.desc}</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${prog.status === 'complete' ? 'complete' : prog.status === 'needs-review' ? 'danger' : ''}"
               style="width:${prog.pct}%"></div>
        </div>
        <div class="module-footer">
          <div class="lesson-count">${m.lessons.length} lesson${m.lessons.length !== 1 ? 's' : ''}</div>
          <span class="module-badge ${STATUS_CLASSES[prog.status]}">${STATUS_LABELS[prog.status]}</span>
        </div>
      </div>`;
  }).join('');

  let reviewHTML = '';
  const reviewItems = needsReviewLessons();
  if (reviewItems.length) {
    const items = reviewItems.map(l => {
      const ls = getLessonState(l.id);
      return `<div class="weak-item" onclick="navigate('lesson','${l.moduleId}','${l.id}')">
        <span>⚠</span>
        <div>
          <strong>${l.title}</strong>
          <div style="font-size:12px;color:#9a3412;">Score: ${ls.score}% — needs improvement</div>
        </div>
        <span style="margin-left:auto;font-size:13px;color:#9a3412;">Review →</span>
      </div>`;
    }).join('');
    reviewHTML = `
      <div class="weak-areas-card">
        <div class="weak-title">⚠ Areas Needing Review</div>
        ${items}
      </div>`;
  }

  return `
    ${statsHTML}
    ${progressHTML}
    ${reviewHTML}
    <div class="section-title">📚 Learning Modules</div>
    <div class="modules-grid">${modulesHTML}</div>`;
}

// ── Module View ───────────────────────────────────────────────────────────────
function renderModuleView() {
  const module = CURRICULUM.find(m => m.id === currentModule);
  if (!module) return '<p>Module not found.</p>';
  const prog = moduleProgress(module);

  const lessonsHTML = module.lessons.map(l => {
    const ls = getLessonState(l.id);
    const scoreLabel = ls.score !== null
      ? `<span class="lesson-score ${scoreClass(ls.score)}">${ls.score}%</span>`
      : `<span class="lesson-score score-none">Not taken</span>`;
    return `
      <div class="lesson-item" onclick="navigate('lesson','${module.id}','${l.id}')">
        <div class="lesson-status-icon ${ICON_CLASSES[ls.status]}">${STATUS_ICONS[ls.status]}</div>
        <div class="lesson-info">
          <div class="lesson-title">${l.title}</div>
          <div class="lesson-meta">⏱ ${l.duration} · ${l.quiz.length} quiz questions${ls.attempts > 0 ? ' · ' + ls.attempts + ' attempt' + (ls.attempts !== 1 ? 's' : '') : ''}</div>
        </div>
        ${scoreLabel}
      </div>`;
  }).join('');

  const moduleCompleteHTML = isModuleAllComplete(module.id)
    ? renderModuleCompletePrompt(module.id)
    : '';

  return `
    <div class="breadcrumb">
      <a onclick="navigate('dashboard')">Dashboard</a>
      <span class="breadcrumb-sep">›</span>
      <span>${module.title}</span>
    </div>
    <div class="module-header">
      <div class="module-header-icon">${module.icon}</div>
      <div>
        <div class="module-header-title">${module.title}</div>
        <div class="module-header-desc">${module.desc}</div>
        <div style="margin-top:10px;font-size:13px;opacity:.75;">${prog.done}/${prog.total} lessons complete · ${prog.pct}%</div>
      </div>
    </div>
    <div class="lesson-list">${lessonsHTML}</div>
    ${moduleCompleteHTML}`;
}

// ── Lesson View ───────────────────────────────────────────────────────────────
function renderLessonView() {
  const module = CURRICULUM.find(m => m.id === currentModule);
  const lesson = module?.lessons.find(l => l.id === currentLesson);
  if (!lesson) return '<p>Lesson not found.</p>';
  const ls = getLessonState(lesson.id);
  if (ls.status === 'not-started') {
    setLessonState(lesson.id, { status: 'in-progress' });
  }

  const takeawaysHTML = lesson.takeaways.map(t => `
    <div class="takeaway-item">
      <div class="takeaway-dot"></div>
      <div>${t}</div>
    </div>`).join('');

  const resourcesHTML = lesson.resources.slice(0, 3).map(r => `
    <div style="margin-bottom:10px;">
      <span class="resource-type-badge badge-${r.type}">${r.type}</span>
      <span style="font-size:13px;font-weight:600;margin-left:8px;">${r.title}</span>
    </div>`).join('');

  return `
    <div class="breadcrumb">
      <a onclick="navigate('dashboard')">Dashboard</a>
      <span class="breadcrumb-sep">›</span>
      <a onclick="navigate('module','${module.id}')">${module.title}</a>
      <span class="breadcrumb-sep">›</span>
      <span>${lesson.title}</span>
    </div>
    <div class="lesson-layout">
      <div>
        <div class="lesson-content">
          <div class="lesson-content-title">${lesson.title}</div>
          <div class="lesson-duration">⏱ ${lesson.duration}</div>
          <div class="lesson-body">${lesson.content}</div>
        </div>
      </div>
      <div class="lesson-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-card-title">Key Takeaways</div>
          ${takeawaysHTML}
        </div>
        <div class="sidebar-card">
          <div class="sidebar-card-title">Resources</div>
          ${resourcesHTML}
          <button class="btn btn-outline" style="margin-top:10px;" onclick="navigate('results_resources','${module.id}','${lesson.id}')">View All Resources</button>
        </div>
        <div class="sidebar-card">
          <div class="sidebar-card-title">Your Progress</div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:12px;">
            ${ls.score !== null ? `Last score: <strong style="color:var(--text)">${ls.score}%</strong> · ${ls.attempts} attempt${ls.attempts !== 1 ? 's' : ''}` : 'Not yet quizzed'}
          </div>
          <button class="btn btn-primary" onclick="startQuiz()">
            ${ls.attempts > 0 ? '🔄 Retake Quiz' : '▶ Take Quiz'}
          </button>
          ${ls.attempts > 0 ? `<button class="btn btn-outline" style="margin-top:8px;" onclick="navigate('module','${module.id}')">← Back to Module</button>` : ''}
        </div>
      </div>
    </div>`;
}

function startQuiz() {
  currentView = 'quiz';
  const module = CURRICULUM.find(m => m.id === currentModule);
  const lesson = module?.lessons.find(l => l.id === currentLesson);
  // Use adaptive questions: mastered questions are swapped for harder cached replacements
  const questions = buildAdaptiveQuestions(lesson.id, lesson.quiz);
  currentQuizState = {
    questions,
    baseQuestions: lesson.quiz,   // always the originals, used for mastery processing
    current: 0,
    answers: new Array(questions.length).fill(null),
    revealed: new Array(questions.length).fill(false)
  };
  render();
}

function startAdaptiveQuiz() {
  if (!adaptiveLesson) return;
  currentIsAdaptive = true;
  currentView = 'quiz';
  const questions = adaptiveLesson.quiz;
  currentQuizState = {
    questions,
    current: 0,
    answers: new Array(questions.length).fill(null),
    revealed: new Array(questions.length).fill(false)
  };
  render();
}

// ── Quiz View ─────────────────────────────────────────────────────────────────
function renderQuizView() {
  const module = CURRICULUM.find(m => m.id === currentModule);
  const lesson = module?.lessons.find(l => l.id === currentLesson);
  if (!currentQuizState) return '';

  const qs = currentQuizState;
  const q = qs.questions[qs.current];
  const answered = qs.answers[qs.current] !== null;
  const revealed = qs.revealed[qs.current];
  const pct = Math.round(((qs.current) / qs.questions.length) * 100);

  const optionsHTML = q.options.map((opt, i) => {
    let cls = '';
    if (revealed) {
      if (i === q.answer) cls = 'correct';
      else if (i === qs.answers[qs.current]) cls = 'incorrect';
    } else if (qs.answers[qs.current] === i) {
      cls = 'selected';
    }
    const letters = ['A', 'B', 'C', 'D'];
    return `<button class="option-btn ${cls}" onclick="selectAnswer(${i})" ${revealed ? 'disabled' : ''}>
      <span class="option-letter">${letters[i]}</span>
      ${opt}
    </button>`;
  }).join('');

  const explanationHTML = revealed ? `
    <div class="explanation">
      <strong>${qs.answers[qs.current] === q.answer ? '✓ Correct!' : '✗ Incorrect.'}</strong> ${q.explanation}
    </div>` : '';

  const isLast = qs.current === qs.questions.length - 1;
  const actionHTML = revealed
    ? `<button class="btn btn-primary" onclick="${isLast ? 'submitQuiz()' : 'nextQuestion()'}">${isLast ? 'See Results' : 'Next Question →'}</button>`
    : `<button class="btn btn-primary" onclick="revealAnswer()" ${!answered ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>Check Answer</button>`;

  const quizTitle    = currentIsAdaptive ? adaptiveLesson?.title : lesson?.title;
  const quizBreadcrumb = currentIsAdaptive
    ? `<a onclick="navigate('dashboard')">Dashboard</a>
       <span class="breadcrumb-sep">›</span>
       <a onclick="navigate('module','${module?.id}')">${module?.title}</a>
       <span class="breadcrumb-sep">›</span>
       <a onclick="navigate('adaptive-lesson')">Adaptive Lesson</a>
       <span class="breadcrumb-sep">›</span>
       <span>Quiz</span>`
    : `<a onclick="navigate('dashboard')">Dashboard</a>
       <span class="breadcrumb-sep">›</span>
       <a onclick="navigate('module','${module?.id}')">${module?.title}</a>
       <span class="breadcrumb-sep">›</span>
       <a onclick="navigate('lesson','${module?.id}','${lesson?.id}')">${lesson?.title}</a>
       <span class="breadcrumb-sep">›</span>
       <span>Quiz</span>`;

  const upgradedBadge = q._isReplacement
    ? `<span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;margin-left:8px;vertical-align:middle;">⬆ Harder Question</span>`
    : '';

  return `
    <div class="breadcrumb">${quizBreadcrumb}</div>
    <div class="quiz-wrap">
      <div class="quiz-header">
        <div class="quiz-header-title">${quizTitle} — Quiz</div>
        <div class="quiz-header-sub">Question ${qs.current + 1} of ${qs.questions.length}</div>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="question-card">
        <div class="question-num">Question ${qs.current + 1}${upgradedBadge}</div>
        <div class="question-text">${q.q}</div>
        <div class="options">${optionsHTML}</div>
        ${explanationHTML}
      </div>
      <div class="quiz-actions">${actionHTML}</div>
    </div>`;
}

function selectAnswer(i) {
  if (!currentQuizState || currentQuizState.revealed[currentQuizState.current]) return;
  currentQuizState.answers[currentQuizState.current] = i;
  render();
}

function revealAnswer() {
  if (!currentQuizState) return;
  currentQuizState.revealed[currentQuizState.current] = true;
  render();
}

function nextQuestion() {
  if (!currentQuizState) return;
  currentQuizState.current++;
  render();
}

function submitQuiz() {
  if (!currentQuizState) return;
  const qs = currentQuizState;
  const correct = qs.answers.filter((a, i) => a === qs.questions[i].answer).length;
  const score = Math.round((correct / qs.questions.length) * 100);

  if (currentIsAdaptive) {
    // Save adaptive quiz score
    const store = getAdaptiveStore();
    if (store[currentModule]) {
      store[currentModule].quizScore = score;
      store[currentModule].quizStatus = score >= 80 ? 'complete' : 'needs-review';
      saveAdaptiveStore(store);
    }
  } else {
    const ls = getLessonState(currentLesson);
    const status = score >= 80 ? 'complete' : 'needs-review';
    setLessonState(currentLesson, {
      status,
      score,
      attempts: (ls.attempts || 0) + 1,
      lastAttempt: Date.now(),
      lastAnswers: qs.answers
    });
    // Track per-question mastery and kick off background replacement fetches
    processQuizMastery(currentLesson, qs.questions, qs.answers);
  }
  currentView = 'results';
  render();
}

// ── Results View ──────────────────────────────────────────────────────────────
function renderResultsView() {
  if (!currentQuizState) return '';

  const qs = currentQuizState;
  const correct = qs.answers.filter((a, i) => a === qs.questions[i].answer).length;
  const score = Math.round((correct / qs.questions.length) * 100);
  const pass = score >= 80;
  const ok = score >= 60;

  const ringClass   = pass ? 'ring-pass' : ok ? 'ring-ok' : 'ring-fail';
  const resultTitle = pass ? 'Excellent Work!' : ok ? 'Good Effort' : 'Keep Practicing';
  const resultSub   = pass
    ? `You scored ${score}% — lesson marked as complete.`
    : ok
      ? `You scored ${score}% — review the material and try again when ready.`
      : `You scored ${score}% — this topic needs more review. Re-read the content and try again.`;

  const reviewItems = qs.questions.map((q, i) => {
    const isCorrect = qs.answers[i] === q.answer;
    return `
      <div style="background:${isCorrect ? '#f0fdf4' : '#fef2f2'};border:1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'};border-radius:8px;padding:14px 16px;margin-bottom:10px;">
        <div style="font-size:13px;font-weight:600;color:${isCorrect ? '#166534' : '#991b1b'};margin-bottom:6px;">
          ${isCorrect ? '✓ Correct' : '✗ Incorrect'} — Q${i + 1}
        </div>
        <div style="font-size:14px;font-weight:600;margin-bottom:6px;">${q.q}</div>
        ${!isCorrect ? `<div style="font-size:13px;color:#6b7280;margin-bottom:4px;">Your answer: <em>${q.options[qs.answers[i]] || 'No answer'}</em></div>
        <div style="font-size:13px;color:#166534;">Correct: <em>${q.options[q.answer]}</em></div>` : ''}
        <div style="font-size:13px;color:#374151;margin-top:8px;padding-top:8px;border-top:1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}">${q.explanation}</div>
      </div>`;
  }).join('');

  // ── Adaptive lesson results ──────────────────────────────────────────────
  if (currentIsAdaptive) {
    const mod = CURRICULUM.find(m => m.id === currentModule);
    return `
      <div class="breadcrumb">
        <a onclick="navigate('dashboard')">Dashboard</a>
        <span class="breadcrumb-sep">›</span>
        <a onclick="navigate('module','${mod?.id}')">${mod?.title}</a>
        <span class="breadcrumb-sep">›</span>
        <span>Adaptive Lesson Results</span>
      </div>
      <div class="quiz-wrap">
        <div class="results-hero">
          <div class="results-score-ring ${ringClass}">${score}%</div>
          <div class="results-title">${resultTitle}</div>
          <div class="results-subtitle">${resultSub}</div>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="startAdaptiveQuiz()">🔄 Retake Quiz</button>
            <button class="btn btn-outline btn-sm" onclick="navigate('adaptive-lesson')">📖 Re-read Lesson</button>
            <button class="btn btn-outline btn-sm" onclick="navigate('module','${mod?.id}')">← Module Overview</button>
          </div>
          ${pass ? '' : `
          <div style="margin-top:16px;">
            <button class="btn btn-success" onclick="startContinueLearning('${mod?.id}')">↺ Generate a New Lesson</button>
          </div>`}
        </div>
        <div class="section-title" style="margin-top:24px;">Question Review</div>
        ${reviewItems}
      </div>`;
  }

  // ── Regular lesson results ───────────────────────────────────────────────
  const module = CURRICULUM.find(m => m.id === currentModule);
  const lesson = module?.lessons.find(l => l.id === currentLesson);

  const resourcesHTML = lesson.resources.map(r => `
    <div class="resource-item">
      <span class="resource-type-badge badge-${r.type}">${r.type}</span>
      <div>
        <div class="resource-title">${r.title}</div>
        <div class="resource-desc">${r.desc}</div>
      </div>
      <a class="resource-link" href="${r.url}" target="_blank" rel="noopener">Open →</a>
    </div>`).join('');

  // Next lesson (within same module or next module)
  const allLessons = getAllLessons();
  const currentIdx = allLessons.findIndex(l => l.id === currentLesson);
  const nextLesson = allLessons[currentIdx + 1];
  const nextHTML = nextLesson ? `
    <button class="btn btn-success" style="margin-top:8px;" onclick="navigate('lesson','${nextLesson.moduleId}','${nextLesson.id}')">
      Next: ${nextLesson.title} →
    </button>` : '';

  // Module complete prompt (shown when all lessons in module are done)
  const moduleCompleteHTML = isModuleAllComplete(module.id)
    ? renderModuleCompletePrompt(module.id)
    : '';

  return `
    <div class="breadcrumb">
      <a onclick="navigate('dashboard')">Dashboard</a>
      <span class="breadcrumb-sep">›</span>
      <a onclick="navigate('module','${module.id}')">${module.title}</a>
      <span class="breadcrumb-sep">›</span>
      <span>Results</span>
    </div>
    <div class="quiz-wrap">
      <div class="results-hero">
        <div class="results-score-ring ${ringClass}">${score}%</div>
        <div class="results-title">${resultTitle}</div>
        <div class="results-subtitle">${resultSub}</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="startQuiz()">🔄 Retake Quiz</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('lesson','${module.id}','${lesson.id}')">📖 Re-read Lesson</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('module','${module.id}')">← Module Overview</button>
        </div>
        ${nextHTML}
      </div>

      ${moduleCompleteHTML}

      <div class="section-title" style="margin-top:24px;">Question Review</div>
      ${reviewItems}

      <div class="resources-section">
        <div class="section-title">📚 Additional Resources</div>
        ${resourcesHTML}
      </div>
    </div>`;
}

// ── Resources-only view (from sidebar) ───────────────────────────────────────
function renderResultsResourcesView() {
  const module = CURRICULUM.find(m => m.id === currentModule);
  const lesson = module?.lessons.find(l => l.id === currentLesson);
  const resourcesHTML = lesson.resources.map(r => `
    <div class="resource-item">
      <span class="resource-type-badge badge-${r.type}">${r.type}</span>
      <div>
        <div class="resource-title">${r.title}</div>
        <div class="resource-desc">${r.desc}</div>
      </div>
      <a class="resource-link" href="${r.url}" target="_blank" rel="noopener">Open →</a>
    </div>`).join('');
  return `
    <div class="breadcrumb">
      <a onclick="navigate('dashboard')">Dashboard</a>
      <span class="breadcrumb-sep">›</span>
      <a onclick="navigate('module','${module.id}')">${module.title}</a>
      <span class="breadcrumb-sep">›</span>
      <a onclick="navigate('lesson','${module.id}','${lesson.id}')">${lesson.title}</a>
      <span class="breadcrumb-sep">›</span>
      <span>Resources</span>
    </div>
    <div class="section-title">📚 Additional Resources — ${lesson.title}</div>
    ${resourcesHTML}
    <button class="btn btn-outline btn-sm" style="margin-top:16px;" onclick="navigate('lesson','${module.id}','${lesson.id}')">← Back to Lesson</button>`;
}

// Patch navigate to handle resources and adaptive views
const _origNavigate = navigate;
window.navigate = function(view, moduleId, lessonId) {
  // Reset adaptive mode when leaving adaptive views
  if (!['adaptive-lesson', 'adaptive-loading', 'adaptive-error', 'quiz', 'results'].includes(view)) {
    currentIsAdaptive = false;
  }

  currentView = view;
  currentModule = moduleId || currentModule || null;
  currentLesson = lessonId || null;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-' + view);
  if (btn) btn.classList.add('active');

  if (view === 'results_resources') {
    document.getElementById('root').innerHTML = renderResultsResourcesView();
    return;
  }
  if (view === 'adaptive-lesson') {
    document.getElementById('root').innerHTML = renderAdaptiveLessonView();
    return;
  }
  render();
};

// ── Progress View ─────────────────────────────────────────────────────────────
function renderProgress() {
  const total = totalLessons();
  const completed = completedLessons();
  const avg = avgScore();
  const overallPct = total ? Math.round((completed / total) * 100) : 0;

  const weakAreas = needsReviewLessons();
  const weakHTML = weakAreas.length ? `
    <div class="weak-areas-card" style="margin-bottom:24px;">
      <div class="weak-title">⚠ Topics Needing More Attention</div>
      ${weakAreas.map(l => {
        const ls = getLessonState(l.id);
        return `<div class="weak-item" onclick="navigate('lesson','${l.moduleId}','${l.id}')">
          <span>⚠</span>
          <div>
            <strong>${l.title}</strong>
            <div style="font-size:12px;color:#9a3412;">Score: ${ls.score}% · ${ls.attempts} attempt${ls.attempts !== 1 ? 's' : ''}</div>
          </div>
          <span style="margin-left:auto;font-size:13px;color:#9a3412;">Review →</span>
        </div>`;
      }).join('')}
    </div>` : `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:24px;font-size:14px;color:#166534;">
      <strong>✓ No weak areas!</strong> ${completed > 0 ? 'All quizzed topics are scoring 80% or above.' : 'Complete some lessons and quizzes to see your progress.'}
    </div>`;

  const modulesHTML = CURRICULUM.map(m => {
    const prog = moduleProgress(m);
    const lessonsHTML = m.lessons.map(l => {
      const ls = getLessonState(l.id);
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="navigate('lesson','${m.id}','${l.id}')">
          <div class="lesson-status-icon ${ICON_CLASSES[ls.status]}" style="width:28px;height:28px;font-size:12px;">${STATUS_ICONS[ls.status]}</div>
          <div style="flex:1;font-size:14px;">${l.title}</div>
          ${ls.score !== null ? `<span class="lesson-score ${scoreClass(ls.score)}">${ls.score}%</span>` : `<span class="lesson-score score-none">—</span>`}
        </div>`;
    }).join('');

    return `
      <div class="progress-module">
        <div class="progress-module-header">
          <span class="progress-module-icon">${m.icon}</span>
          <div>
            <div class="progress-module-title">${m.title}</div>
            <div class="progress-module-stats">${prog.done}/${prog.total} complete · ${prog.pct}%</div>
          </div>
          <span class="module-badge ${STATUS_CLASSES[prog.status]}" style="margin-left:auto;">${STATUS_LABELS[prog.status]}</span>
        </div>
        <div class="progress-bar" style="margin-bottom:14px;">
          <div class="progress-fill ${prog.status === 'complete' ? 'complete' : ''}" style="width:${prog.pct}%"></div>
        </div>
        ${lessonsHTML}
      </div>`;
  }).join('');

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:8px;">
      <div class="section-title" style="margin-bottom:0;">📊 My Learning Progress</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-outline btn-sm" onclick="exportProgress()">⬇ Export Progress</button>
        <label class="btn btn-outline btn-sm" style="cursor:pointer;margin:0;">
          ⬆ Import Progress
          <input type="file" accept=".json" style="display:none;" onchange="importProgress(event)">
        </label>
      </div>
    </div>
    <div class="stats-row" style="margin-bottom:24px;">
      <div class="stat-card">
        <div class="stat-value">${completed}/${total}</div>
        <div class="stat-label">Lessons Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${overallPct}%</div>
        <div class="stat-label">Overall Progress</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${avg !== null ? avg + '%' : '—'}</div>
        <div class="stat-label">Average Quiz Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${weakAreas.length}</div>
        <div class="stat-label">Areas to Strengthen</div>
      </div>
    </div>
    ${weakHTML}
    <div class="section-title">Module Breakdown</div>
    ${modulesHTML}
    <div style="margin-top:24px;text-align:center;">
      <button class="btn btn-outline btn-sm" onclick="if(confirm('Reset all progress? This cannot be undone.')) { localStorage.removeItem('${STATE_KEY}'); state={}; navigate('dashboard'); }">Reset Progress</button>
    </div>`;
}

// ── Export / Import Progress ──────────────────────────────────────────────────
function exportProgress() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    state: JSON.parse(localStorage.getItem(STATE_KEY) || '{}'),
    adaptiveStore: JSON.parse(localStorage.getItem(ADAPTIVE_STORE) || '{}')
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cicd-progress-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.state) { alert('Invalid progress file.'); return; }
      if (!confirm('This will replace your current progress. Continue?')) return;
      localStorage.setItem(STATE_KEY, JSON.stringify(data.state));
      state = data.state;
      if (data.adaptiveStore) {
        localStorage.setItem('cicd_adaptive_lessons', JSON.stringify(data.adaptiveStore));
      }
      navigate('progress');
      alert('Progress imported successfully!');
    } catch {
      alert('Could not read the file. Make sure it is a valid progress export.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ── Boot ──────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initAdvancedModules();   // load any saved advanced modules into CURRICULUM
  document.getElementById('btn-dashboard').classList.add('active');
  render();
});
