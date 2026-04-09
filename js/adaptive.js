// ── Adaptive Learning System ──────────────────────────────────────────────────

const ADAPTIVE_API_KEY  = 'cicd_adaptive_api_key';
const ADAPTIVE_STORE    = 'cicd_adaptive_lessons';

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
    {"q": "question text", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "why this answer is correct"},
    {"q": "question text", "options": ["A", "B", "C", "D"], "answer": 1, "explanation": "why this answer is correct"},
    {"q": "question text", "options": ["A", "B", "C", "D"], "answer": 2, "explanation": "why this answer is correct"}
  ]
}`;

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
  const mod      = CURRICULUM.find(m => m.id === moduleId);
  const avg      = getModuleAvgScore(moduleId);
  const isAdv    = avg >= 80;
  const store    = getAdaptiveStore();
  const existing = store[moduleId];
  const hasKey   = !!getApiKey();

  const levelBadge = isAdv
    ? `<span style="background:#dcfce7;color:#166534;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600;">Advanced Track</span>`
    : `<span style="background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600;">Foundations Review</span>`;

  let actionHTML;
  if (existing) {
    actionHTML = `
      <p style="font-size:14px;color:var(--muted);margin:12px 0;">You have a saved adaptive lesson for this module.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-success" onclick="resumeAdaptiveLesson('${moduleId}')">📖 Continue Saved Lesson</button>
        <button class="btn btn-outline btn-sm" onclick="startContinueLearning('${moduleId}')">↺ Generate New Lesson</button>
      </div>`;
  } else if (!hasKey) {
    actionHTML = renderApiKeySetup();
  } else {
    actionHTML = `
      <p style="font-size:14px;color:var(--muted);margin:12px 0;">
        ${isAdv
          ? `Great scores! Ready to go deeper with advanced material?`
          : `Let's reinforce the fundamentals with targeted content based on your results.`}
      </p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-success" onclick="startContinueLearning('${moduleId}')">
          ${isAdv ? '🚀 Yes, Fetch Advanced Content' : '📚 Yes, Help Me Learn the Basics'}
        </button>
        <button class="btn btn-outline" onclick="navigate('module','${moduleId}')">No Thanks</button>
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
        ${actionHTML}
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
