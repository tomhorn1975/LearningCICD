// ── Adaptive Learning System ──────────────────────────────────────────────────

const ADAPTIVE_API_KEY      = 'cicd_adaptive_api_key';
const ADAPTIVE_STORE        = 'cicd_adaptive_lessons';
const MASTERY_STORE         = 'cicd_question_mastery';
const REPLACEMENT_STORE     = 'cicd_replacement_qs';
const ADVANCED_MOD_STORE    = 'cicd_advanced_modules';

// Track which module is currently being generated (null = none)
let generatingAdvancedModule = null;

function getApiKey()      { return localStorage.getItem(ADAPTIVE_API_KEY) || ''; }
function setApiKey(k)     { localStorage.setItem(ADAPTIVE_API_KEY, k); }

function getAdaptiveStore() {
  try { return JSON.parse(localStorage.getItem(ADAPTIVE_STORE)) || {}; }
  catch { return {}; }
}
function saveAdaptiveStore(s) { localStorage.setItem(ADAPTIVE_STORE, JSON.stringify(s)); }

function getModuleAvgScore(moduleId) {
  const mod = CURRICULUM.find(m => m.id === moduleId);
  if (!mod) return 0;
  const scores = mod.lessons.map(l => getLessonState(l.id).score).filter(s => s !== null);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function isModuleAllComplete(moduleId) {
  const mod = CURRICULUM.find(m => m.id === moduleId);
  return !!mod && mod.lessons.every(l => getLessonState(l.id).status === 'complete');
}

// ── API Call ──────────────────────────────────────────────────────────────────

async function fetchAdaptiveLesson(moduleId) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_KEY');

  const mod = CURRICULUM.find(m => m.id === moduleId);
  const avgScore = getModuleAvgScore(moduleId);
  const isAdvanced = avgScore >= 80;

  const levelLabel  = isAdvanced ? 'ADVANCED' : 'FOUNDATIONS REVIEW';
  const levelGuide  = isAdvanced
    ? 'advanced concepts, edge cases, real-world banking trade-offs, and strategic considerations a Senior TPM needs when leading CI/CD initiatives'
    : 'clear foundational explanations, simple analogies, step-by-step breakdowns, and practical examples that reinforce the core concepts the student is struggling with';

  const prompt = `You are a CI/CD expert teaching a Senior Technical Product Manager at a financial institution.

The student just completed the "${mod.title}" module with an average quiz score of ${avgScore}%.
Module topics covered: ${mod.lessons.map(l => l.title).join(', ')}.

Generate a ${levelLabel} follow-up lesson focusing on ${levelGuide}.

Respond with ONLY a valid JSON object — no markdown fences, no commentary. Use exactly this structure:
{
  "title": "${isAdvanced ? 'Advanced' : 'Foundations'}: [a specific descriptive topic]",
  "duration": "[N] min read",
  "content": "[400-600 words of HTML using <h3>, <p>, <ul>, <li>, <strong>, <em>, and <div class=\\"tip\\"> for TPM-specific callouts]",
  "takeaways": ["point 1", "point 2", "point 3", "point 4"],
  "quiz": [
    {"q": "question text", "options": ["A", "B", "C", "D"], "answer": 2, "explanation": "why this answer is correct"},
    {"q": "question text", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "why this answer is correct"},
    {"q": "question text", "options": ["A", "B", "C", "D"], "answer": 3, "explanation": "why this answer is correct"}
  ]
}

IMPORTANT: "answer" is the zero-based index of the correct option (0=A, 1=B, 2=C, 3=D). Distribute correct answers across all four positions — do not default to the same position for every question. Write each question so the correct answer could be ANY of the four options, then set "answer" accordingly.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const raw  = data.content[0].text.trim();
  return JSON.parse(raw);
}

// ── Entry Point ───────────────────────────────────────────────────────────────

async function startContinueLearning(moduleId) {
  currentModule      = moduleId;
  currentIsAdaptive  = true;
  adaptiveError      = '';
  currentView        = 'adaptive-loading';
  render();

  try {
    const lesson = await fetchAdaptiveLesson(moduleId);
    const avg    = getModuleAvgScore(moduleId);

    adaptiveLesson = lesson;

    const store = getAdaptiveStore();
    store[moduleId] = { lesson, avgScore: avg, generatedAt: Date.now(), quizScore: null };
    saveAdaptiveStore(store);

    currentView = 'adaptive-lesson';
    render();
  } catch (e) {
    adaptiveError = e.message === 'NO_KEY'
      ? 'No API key configured. Please save your Anthropic API key first.'
      : e.message;
    currentView       = 'adaptive-error';
    currentIsAdaptive = false;
    render();
  }
}

function resumeAdaptiveLesson(moduleId) {
  const store = getAdaptiveStore();
  if (!store[moduleId]) return;
  adaptiveLesson     = store[moduleId].lesson;
  currentModule      = moduleId;
  currentIsAdaptive  = true;
  currentView        = 'adaptive-lesson';
  render();
}

// ── Views ─────────────────────────────────────────────────────────────────────

function renderApiKeySetup() {
  const key = getApiKey();
  return `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin-top:16px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:8px;">🔑 Enable Adaptive Learning</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:12px;">
        Enter your Anthropic API key to unlock AI-generated follow-up lessons tailored to your quiz performance.
        Your key is stored only in this browser.
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <input type="password" id="adaptive-api-key" value="${key}"
          placeholder="sk-ant-..."
          style="flex:1;min-width:200px;padding:8px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;background:white;color:var(--text);">
        <button class="btn btn-primary btn-sm" onclick="saveApiKeyAndRefresh()">Save Key</button>
      </div>
      ${key ? '<div style="font-size:12px;color:#16a34a;margin-top:8px;">✓ API key is saved</div>' : ''}
    </div>`;
}

function saveApiKeyAndRefresh() {
  const input = document.getElementById('adaptive-api-key');
  if (input && input.value.trim()) {
    setApiKey(input.value.trim());
    render();
  }
}

function renderModuleCompletePrompt(moduleId) {
  const mod        = CURRICULUM.find(m => m.id === moduleId);
  const avg        = getModuleAvgScore(moduleId);
  const isAdv      = avg >= 80;
  const store      = getAdaptiveStore();
  const existing   = store[moduleId];
  const hasKey     = !!getApiKey();
  const advStored  = getStoredAdvancedModule(moduleId);
  const advInCurr  = CURRICULUM.find(c => c.id === `adv-${moduleId}`);
  const isGenAdv   = generatingAdvancedModule === moduleId;

  const levelBadge = isAdv
    ? `<span style="background:#dcfce7;color:#166534;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600;">Advanced Track</span>`
    : `<span style="background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600;">Foundations Review</span>`;

  // ── Adaptive lesson section ──
  let adaptiveHTML;
  if (existing) {
    adaptiveHTML = `
      <p style="font-size:14px;color:var(--muted);margin:12px 0;">You have a saved adaptive lesson for this module.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-success" onclick="resumeAdaptiveLesson('${moduleId}')">📖 Continue Saved Lesson</button>
        <button class="btn btn-outline btn-sm" onclick="startContinueLearning('${moduleId}')">↺ Generate New Lesson</button>
      </div>`;
  } else if (!hasKey) {
    adaptiveHTML = renderApiKeySetup();
  } else {
    adaptiveHTML = `
      <p style="font-size:14px;color:var(--muted);margin:12px 0;">
        ${isAdv ? 'Great scores! Ready to go deeper with advanced material?' : "Let's reinforce the fundamentals with targeted content based on your results."}
      </p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-success" onclick="startContinueLearning('${moduleId}')">
          ${isAdv ? '🚀 Yes, Fetch Advanced Content' : '📚 Yes, Help Me Learn the Basics'}
        </button>
        <button class="btn btn-outline" onclick="navigate('module','${moduleId}')">No Thanks</button>
      </div>`;
  }

  // ── Advanced module section ──
  let advModHTML = '';
  if (advInCurr) {
    // Already unlocked — link to it
    advModHTML = `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px;margin-top:16px;text-align:center;">
        <div style="font-size:14px;font-weight:700;color:#166534;margin-bottom:6px;">🎓 Advanced Module Unlocked</div>
        <p style="font-size:13px;color:#4b5563;margin-bottom:12px;">"${advInCurr.title}" is available in your curriculum.</p>
        <button class="btn btn-success btn-sm" onclick="navigate('module','${advInCurr.id}')">Go to Advanced Module →</button>
      </div>`;
  } else if (isGenAdv) {
    advModHTML = `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px;margin-top:16px;text-align:center;">
        <div style="font-size:28px;display:inline-block;animation:spin 1.2s linear infinite;">⚙</div>
        <div style="font-size:14px;font-weight:700;color:#1d4ed8;margin-top:8px;">Generating Advanced Module…</div>
        <p style="font-size:13px;color:var(--muted);margin-top:4px;">Creating two new lessons tailored to your progress. This takes a moment.</p>
      </div>`;
  } else if (hasKey) {
    advModHTML = `
      <div style="background:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:18px;margin-top:16px;text-align:center;">
        <div style="font-size:14px;font-weight:700;margin-bottom:6px;">🎓 Unlock an Advanced Module</div>
        <p style="font-size:13px;color:var(--muted);margin-bottom:12px;">
          Generate a permanent 2-lesson advanced module for <strong>${mod.title}</strong> that will appear in your dashboard curriculum.
        </p>
        <button class="btn btn-primary btn-sm" onclick="startGenerateAdvancedModule('${moduleId}')">Generate Advanced Module</button>
      </div>`;
  }

  return `
    <div style="background:linear-gradient(135deg,#1a3a5f 0%,#2358a5 100%);color:white;border-radius:12px;padding:28px;margin-top:24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🎉</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:6px;">Module Complete!</div>
      <div style="opacity:.85;font-size:14px;margin-bottom:10px;">
        You've finished all lessons in <strong>${mod.title}</strong> — average score: <strong>${avg}%</strong>
      </div>
      ${levelBadge}
      <div style="margin-top:16px;color:white;">
        <div style="font-size:16px;font-weight:600;margin-bottom:4px;">Would you like to continue learning?</div>
      </div>
      <div style="color:var(--text);">
        ${adaptiveHTML}
        ${advModHTML}
      </div>
    </div>`;
}

function renderAdaptiveLoading() {
  const mod = CURRICULUM.find(m => m.id === currentModule);
  const avg = getModuleAvgScore(currentModule);
  return `
    <div class="quiz-wrap" style="text-align:center;padding:80px 20px;">
      <div style="font-size:52px;display:inline-block;animation:spin 1.2s linear infinite;">⚙</div>
      <div style="font-size:22px;font-weight:700;margin:20px 0 8px;">Generating Your Personalized Lesson</div>
      <div style="font-size:14px;color:var(--muted);">
        Creating ${avg >= 80 ? 'advanced' : 'foundational'} content for <strong>${mod?.title}</strong>…
      </div>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>`;
}

function renderAdaptiveError() {
  return `
    <div class="quiz-wrap" style="text-align:center;padding:60px 20px;">
      <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:8px;color:#991b1b;">Could Not Generate Lesson</div>
      <div style="font-size:14px;color:var(--muted);max-width:400px;margin:0 auto 24px;">${adaptiveError}</div>
      ${renderApiKeySetup()}
      <button class="btn btn-outline btn-sm" style="margin-top:16px;" onclick="navigate('dashboard')">← Back to Dashboard</button>
    </div>`;
}

// ── Question Mastery Tracking ─────────────────────────────────────────────────

function getMasteryStore() {
  try { return JSON.parse(localStorage.getItem(MASTERY_STORE)) || {}; } catch { return {}; }
}
function saveMasteryStore(s) { localStorage.setItem(MASTERY_STORE, JSON.stringify(s)); }

function getLessonMastery(lessonId) { return getMasteryStore()[lessonId] || {}; }

function markQuestionMastered(lessonId, qi) {
  const s = getMasteryStore();
  if (!s[lessonId]) s[lessonId] = {};
  s[lessonId][qi] = true;
  saveMasteryStore(s);
}

// ── Replacement Question Cache ────────────────────────────────────────────────

function getReplacementStore() {
  try { return JSON.parse(localStorage.getItem(REPLACEMENT_STORE)) || {}; } catch { return {}; }
}
function saveReplacementStore(s) { localStorage.setItem(REPLACEMENT_STORE, JSON.stringify(s)); }

function getCachedReplacement(lessonId, qi) {
  return getReplacementStore()[lessonId]?.[qi] || null;
}
function cacheReplacement(lessonId, qi, q) {
  const s = getReplacementStore();
  if (!s[lessonId]) s[lessonId] = {};
  s[lessonId][qi] = q;
  saveReplacementStore(s);
}

// Build the quiz question list for a lesson, swapping in replacements for mastered questions
function buildAdaptiveQuestions(lessonId, baseQuestions) {
  const mastery = getLessonMastery(lessonId);
  return baseQuestions.map((q, i) => {
    if (!mastery[i]) return q;
    const replacement = getCachedReplacement(lessonId, i);
    // _isReplacement flag used by renderQuizView to show the "upgraded" badge
    return replacement ? { ...replacement, _isReplacement: true } : q;
  });
}

// Fire-and-forget: fetch a harder replacement from Claude API after a correct answer
async function fetchAndCacheReplacement(lessonId, qi, originalQ, lessonTitle) {
  const apiKey = getApiKey();
  if (!apiKey) return;

  const prompt = `You are a CI/CD expert teaching a Senior Technical Product Manager at a financial institution.

The student has mastered this quiz question from the lesson "${lessonTitle}":
Question: "${originalQ.q}"
Correct answer: "${originalQ.options[originalQ.answer]}"
Explanation: "${originalQ.explanation}"

Generate ONE harder follow-up question on the SAME specific topic. It should require deeper understanding, test an edge case, or apply the concept to a real-world banking scenario beyond the basic definition.

Respond with ONLY valid JSON — no markdown fences, no extra text:
{"q":"question text","options":["A","B","C","D"],"answer":2,"explanation":"why this is correct"}

IMPORTANT: "answer" is the zero-based index of the correct option (0=A, 1=B, 2=C, 3=D). Write the question so the correct answer could be at any position — do not always place it at index 2 or any fixed position. Set "answer" to match whichever option is actually correct.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) return;
    const data = await res.json();
    const raw  = data.content[0].text.trim();
    const q    = JSON.parse(raw);
    // Validate structure before caching
    if (q.q && Array.isArray(q.options) && q.options.length === 4 && typeof q.answer === 'number') {
      cacheReplacement(lessonId, qi, q);
    }
  } catch { /* silently fail — next retake will try again */ }
}

// Called after quiz submit: marks mastered questions and kicks off background replacements
function processQuizMastery(lessonId, questions, answers) {
  const allLessons = CURRICULUM.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title })));
  const lesson = allLessons.find(l => l.id === lessonId);
  if (!lesson) return;

  questions.forEach((q, i) => {
    if (answers[i] === q.answer) {
      markQuestionMastered(lessonId, i);
      // Always refresh replacement when question is answered correctly
      fetchAndCacheReplacement(lessonId, i, q, lesson.title);
    }
  });
}

// ── Advanced Module Generation ────────────────────────────────────────────────

function getAdvancedModulesStore() {
  try { return JSON.parse(localStorage.getItem(ADVANCED_MOD_STORE)) || {}; } catch { return {}; }
}
function saveAdvancedModulesStore(s) { localStorage.setItem(ADVANCED_MOD_STORE, JSON.stringify(s)); }
function getStoredAdvancedModule(moduleId)     { return getAdvancedModulesStore()[moduleId] || null; }
function storeAdvancedModule(moduleId, mod)    {
  const s = getAdvancedModulesStore(); s[moduleId] = mod; saveAdvancedModulesStore(s);
}
function getAllStoredAdvancedModules() { return Object.values(getAdvancedModulesStore()); }

// Called once at boot: inject any stored advanced modules into the CURRICULUM array
function initAdvancedModules() {
  getAllStoredAdvancedModules().forEach(mod => {
    if (!CURRICULUM.find(c => c.id === mod.id)) {
      CURRICULUM.push(mod);
    }
  });
}

async function fetchAdvancedModule(moduleId) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_KEY');

  const mod    = CURRICULUM.find(m => m.id === moduleId);
  const avg    = getModuleAvgScore(moduleId);

  const prompt = `You are a CI/CD curriculum designer creating an ADVANCED follow-up module for a Senior Technical Product Manager at a large financial institution.

The student has completed the "${mod.title}" module (average quiz score: ${avg}%) covering: ${mod.lessons.map(l => l.title).join(', ')}.

Create a 2-lesson advanced module that goes significantly deeper. Topics must cover:
- Complex architectural trade-offs and design decisions
- Real-world banking/financial industry scenarios and regulatory context
- Strategic considerations a Senior TPM needs for executive conversations
- Edge cases and failure modes that occur in enterprise environments

Respond with ONLY valid JSON — no markdown fences, no commentary:
{
  "title": "Advanced: [specific descriptive title for this subject area]",
  "desc": "One sentence describing this advanced module",
  "lessons": [
    {
      "title": "Lesson title",
      "duration": "[N] min read",
      "content": "[500-700 words of HTML using <h3>, <p>, <ul>, <li>, <strong>, <em>, <div class=\\"tip\\">, <div class=\\"warning\\"> — no inline style attributes]",
      "takeaways": ["point 1", "point 2", "point 3", "point 4"],
      "quiz": [
        {"q": "question", "options": ["A","B","C","D"], "answer": 1, "explanation": "why correct"},
        {"q": "question", "options": ["A","B","C","D"], "answer": 3, "explanation": "why correct"},
        {"q": "question", "options": ["A","B","C","D"], "answer": 0, "explanation": "why correct"},
        {"q": "question", "options": ["A","B","C","D"], "answer": 2, "explanation": "why correct"}
      ]
    },
    {
      "title": "Lesson 2 title",
      "duration": "[N] min read",
      "content": "[500-700 words of HTML same format]",
      "takeaways": ["point 1", "point 2", "point 3", "point 4"],
      "quiz": [
        {"q": "question", "options": ["A","B","C","D"], "answer": 2, "explanation": "why correct"},
        {"q": "question", "options": ["A","B","C","D"], "answer": 0, "explanation": "why correct"},
        {"q": "question", "options": ["A","B","C","D"], "answer": 3, "explanation": "why correct"},
        {"q": "question", "options": ["A","B","C","D"], "answer": 1, "explanation": "why correct"}
      ]
    }
  ]
}

IMPORTANT: "answer" is the zero-based index of the correct option (0=A, 1=B, 2=C, 3=D). For EVERY question, write all four options as plausible answers, then place the correct one at a varied position — spread answers across A, B, C, and D. Never default to the same letter for multiple questions in a row.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data       = await res.json();
  const raw        = data.content[0].text.trim();
  const moduleData = JSON.parse(raw);
  const advId      = `adv-${moduleId}`;

  return {
    id:           advId,
    title:        moduleData.title,
    icon:         '🎓',
    desc:         moduleData.desc,
    prerequisite: moduleId,
    isAdvanced:   true,
    lessons:      moduleData.lessons.map((l, i) => ({
      id:        `${advId}-l${i + 1}`,
      title:     l.title,
      duration:  l.duration,
      content:   l.content,
      takeaways: l.takeaways,
      resources: [],
      quiz:      l.quiz
    }))
  };
}

async function startGenerateAdvancedModule(moduleId) {
  generatingAdvancedModule = moduleId;
  render();
  try {
    const mod = await fetchAdvancedModule(moduleId);
    storeAdvancedModule(moduleId, mod);
    if (!CURRICULUM.find(c => c.id === mod.id)) CURRICULUM.push(mod);
    generatingAdvancedModule = null;
    navigate('module', mod.id);
  } catch (e) {
    generatingAdvancedModule = null;
    alert(e.message === 'NO_KEY'
      ? 'No API key configured. Please save your Anthropic API key first.'
      : 'Could not generate advanced module: ' + e.message);
    render();
  }
}

// ── Updated renderModuleCompletePrompt ────────────────────────────────────────

function renderAdaptiveLessonView() {
  if (!adaptiveLesson) { navigate('dashboard'); return ''; }
  const mod   = CURRICULUM.find(m => m.id === currentModule);
  const store = getAdaptiveStore();
  const saved = store[currentModule];
  const avg   = saved?.avgScore ?? getModuleAvgScore(currentModule);
  const isAdv = avg >= 80;

  const takeawaysHTML = adaptiveLesson.takeaways.map(t => `
    <div class="takeaway-item">
      <div class="takeaway-dot"></div>
      <div>${t}</div>
    </div>`).join('');

  const badgeStyle = isAdv
    ? 'background:#dcfce7;color:#166534'
    : 'background:#fef3c7;color:#92400e';
  const badgeLabel = isAdv ? '🚀 Advanced Content' : '📚 Foundations Review';

  return `
    <div class="breadcrumb">
      <a onclick="navigate('dashboard')">Dashboard</a>
      <span class="breadcrumb-sep">›</span>
      <a onclick="navigate('module','${mod?.id}')">${mod?.title}</a>
      <span class="breadcrumb-sep">›</span>
      <span>${adaptiveLesson.title}</span>
    </div>
    <div class="lesson-layout">
      <div>
        <div class="lesson-content">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <div class="lesson-content-title" style="margin-bottom:0;">${adaptiveLesson.title}</div>
            <span style="${badgeStyle};padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600;white-space:nowrap;">${badgeLabel}</span>
          </div>
          <div class="lesson-duration">⏱ ${adaptiveLesson.duration} · AI-Generated · Based on your ${avg}% module average</div>
          <div class="lesson-body">${adaptiveLesson.content}</div>
        </div>
      </div>
      <div class="lesson-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-card-title">Key Takeaways</div>
          ${takeawaysHTML}
        </div>
        <div class="sidebar-card">
          <div class="sidebar-card-title">Your Progress</div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:12px;">
            ${saved?.quizScore != null
              ? `Last score: <strong style="color:var(--text)">${saved.quizScore}%</strong>`
              : 'Take the quiz to test your understanding'}
          </div>
          <button class="btn btn-primary" onclick="startAdaptiveQuiz()">
            ${saved?.quizScore != null ? '🔄 Retake Quiz' : '▶ Take Quiz'}
          </button>
          <button class="btn btn-outline" style="margin-top:8px;" onclick="navigate('module','${mod?.id}')">← Back to Module</button>
        </div>
      </div>
    </div>`;
}
