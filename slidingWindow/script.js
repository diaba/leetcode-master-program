/* -------------------------
           Local storage keys & helpers
           ------------------------- */
const DEBUG_HISTORY_KEY = "sw_debug_history_v1";
const PRACTICE_KEY = "sw_practice_set_v1";

function loadDebugHistory() {
  const raw = localStorage.getItem(DEBUG_HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveDebugAttempt(attempt) {
  const list = loadDebugHistory();
  list.push(attempt);
  localStorage.setItem(DEBUG_HISTORY_KEY, JSON.stringify(list));
  updateReportPreview();
}
function clearDebugHistory() {
  if (!confirm("Clear debug history?")) return;
  localStorage.removeItem(DEBUG_HISTORY_KEY);
  updateReportPreview();
  alert("Debug history cleared.");
}

/* -------------------------
           Debug questions (same as before)
           ------------------------- */
const debugQuestions = [
  {
    id: "q1",
    title: "Off-by-one in fixed window sum (JS)",
    snippet: `// Find max sum of subarray size k
let windowSum = 0;
for (let i = 0; i <= k; i++) {
  windowSum += arr[i];
}
let maxSum = windowSum;`,
    type: "mcq",
    options: [
      "Loop should run i < k not i <= k",
      "Use arr.slice(0,k).reduce instead",
      "Initialize windowSum to arr[0] only",
      "No bug — code is fine",
    ],
    answer: 0,
    explanation:
      "The loop uses <= k which reads k+1 elements; use i < k to sum first k elements.",
    points: 8,
  },
  {
    id: "q2",
    title: "Removing from set while iterating (Java)",
    snippet: `// Longest unique substring
Set<Character> set = new HashSet<>();
int left = 0, maxLen = 0;
for (int right = 0; right < s.length(); right++) {
    if (set.contains(s.charAt(right))) {
        set.remove(s.charAt(right));
        left++;
    }
    set.add(s.charAt(right));
    maxLen = Math.max(maxLen, right - left + 1);
}`,
    type: "mcq",
    options: [
      "Should remove s.charAt(left) not s.charAt(right)",
      "HashSet cannot store characters",
      "left should not be incremented",
      "Use map instead of set",
    ],
    answer: 0,
    explanation:
      "When duplicate found, remove the char at left and increment left until duplicate is gone; removing right is wrong.",
    points: 10,
  },
  {
    id: "q3",
    title: "Fix the update line (JS) — free text",
    snippet: `// Sliding window update
windowSum += arr[right] - arr[right - k]; // assume right starts at k`,
    type: "fix",
    prompt:
      "Provide the corrected expression if the code mistakenly used arr[right - k + 1] instead of arr[right - k]",
    answer: "windowSum += arr[right] - arr[right - k];",
    explanation:
      "The correct update subtracts the element leaving the window at index right - k.",
    points: 6,
  },
  {
    id: "q4",
    title: "Deque usage bug (JS)",
    snippet: `// Maintain deque of indices for max
while (deque.length && nums[deque[deque.length-1]] <= nums[i]) {
  deque.pop();
}
deque.push(i);
if (deque[0] <= i - k) deque.shift();`,
    type: "mcq",
    options: [
      "Comparison should be < not <= to keep equal elements",
      "Condition to remove old indices should be < i - k not <=",
      "deque.shift() should be called before push",
      "No bug",
    ],
    answer: 1,
    explanation:
      "To remove indices outside the window, check deque[0] < i - k + 1 or <= i - k depending on indexing; ensure consistent boundary. Here the safer check is deque[0] <= i - k.",
    points: 7,
  },
];

/* -------------------------
           Track attempts for report
           ------------------------- */
function recordAttempt(questionId, correct, userAnswer, notes) {
  const q = debugQuestions.find((x) => x.id === questionId) || {
    id: questionId,
  };
  const attempt = {
    id: q.id || questionId,
    title: q.title || "",
    timestamp: new Date().toISOString(),
    correct: !!correct,
    userAnswer: userAnswer || "",
    explanation: q.explanation || notes || "",
    points: q.points || 0,
  };
  saveDebugAttempt(attempt);
}

/* -------------------------
           Export debug report
           ------------------------- */
function buildReportData() {
  const attempts = loadDebugHistory();
  if (attempts.length === 0) return null;

  // Summarize mistakes and tips
  const mistakes = attempts.filter((a) => !a.correct);
  const correctCount = attempts.length - mistakes.length;
  const totalPoints = attempts.reduce(
    (s, a) => s + (a.correct ? a.points : 0),
    0
  );

  // Group mistakes by question
  const byQuestion = {};
  mistakes.forEach((m) => {
    if (!byQuestion[m.id])
      byQuestion[m.id] = {
        title: m.title,
        count: 0,
        examples: [],
        explanation: m.explanation,
      };
    byQuestion[m.id].count++;
    byQuestion[m.id].examples.push({ when: m.timestamp, answer: m.userAnswer });
  });

  // Suggested practice (simple heuristics)
  const suggestions = [];
  if (byQuestion["q1"])
    suggestions.push(
      "Practice off-by-one and boundary checks for loops and window indices."
    );
  if (byQuestion["q2"])
    suggestions.push(
      "Practice set/map removal patterns and two-pointer window maintenance."
    );
  if (byQuestion["q3"])
    suggestions.push(
      "Practice index arithmetic for updates when sliding windows move."
    );
  if (byQuestion["q4"])
    suggestions.push(
      "Practice deque/monotonic queue patterns and boundary conditions."
    );

  if (suggestions.length === 0)
    suggestions.push(
      "Review sliding window templates and try more debug problems."
    );

  return {
    generatedAt: new Date().toISOString(),
    totalAttempts: attempts.length,
    correctCount,
    totalPoints,
    mistakesSummary: Object.values(byQuestion),
    suggestions,
    rawAttempts: attempts,
  };
}

function exportDebugReport(format = "md") {
  const data = buildReportData();
  if (!data) {
    alert("No debug attempts recorded yet. Take the Debug Quiz first.");
    return;
  }

  let content = "";
  if (format === "md") {
    content += `# Debugging Report — Sliding Window Playground\n\n`;
    content += `**Generated:** ${data.generatedAt}\n\n`;
    content += `**Total attempts:** ${data.totalAttempts}\n\n`;
    content += `**Correct:** ${data.correctCount}\n\n`;
    content += `**Points earned:** ${data.totalPoints}\n\n`;
    content += `## Mistakes Summary\n\n`;
    if (data.mistakesSummary.length === 0) {
      content += `No mistakes recorded — great job!\n\n`;
    } else {
      data.mistakesSummary.forEach((m, i) => {
        content += `### ${i + 1}. ${m.title}\n\n`;
        content += `- **Times missed:** ${m.count}\n`;
        content += `- **Tip:** ${m.explanation}\n`;
        content += `- **Examples:**\n`;
        m.examples.slice(0, 3).forEach((ex) => {
          content += `  - ${ex.when}: "${ex.answer}"\n`;
        });
        content += `\n`;
      });
    }
    content += `## Practice Suggestions\n\n`;
    data.suggestions.forEach((s) => (content += `- ${s}\n`));
    content += `\n---\n\n`;
    content += `## Raw Attempts\n\n`;
    data.rawAttempts.forEach((a) => {
      content += `- ${a.timestamp} | ${a.title} | ${
        a.correct ? "Correct" : "Wrong"
      } | Answer: ${a.userAnswer}\n`;
    });
  } else {
    // plain text
    content += `DEBUGGING REPORT — Sliding Window Playground\n\n`;
    content += `Generated: ${data.generatedAt}\n\n`;
    content += `Total attempts: ${data.totalAttempts}\n`;
    content += `Correct: ${data.correctCount}\n`;
    content += `Points earned: ${data.totalPoints}\n\n`;
    content += `MISTAKES SUMMARY\n\n`;
    if (data.mistakesSummary.length === 0) {
      content += `No mistakes recorded — great job!\n\n`;
    } else {
      data.mistakesSummary.forEach((m, i) => {
        content += `${i + 1}. ${m.title}\n`;
        content += `  Times missed: ${m.count}\n`;
        content += `  Tip: ${m.explanation}\n`;
        content += `  Examples:\n`;
        m.examples.slice(0, 3).forEach((ex) => {
          content += `    - ${ex.when}: "${ex.answer}"\n`;
        });
        content += `\n`;
      });
    }
    content += `PRACTICE SUGGESTIONS\n\n`;
    data.suggestions.forEach((s) => (content += `- ${s}\n`));
    content += `\nRAW ATTEMPTS\n\n`;
    data.rawAttempts.forEach((a) => {
      content += `${a.timestamp} | ${a.title} | ${
        a.correct ? "Correct" : "Wrong"
      } | Answer: ${a.userAnswer}\n`;
    });
  }

  // show preview
  document.getElementById("reportPreview").textContent = content;

  // create downloadable file
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `debug-report-${new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[:T]/g, "-")}.${format === "md" ? "md" : "txt"}`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* -------------------------
           Practice generator
           ------------------------- */
const practiceTemplates = [
  {
    type: "fixed-sum",
    prompt: "Find the maximum sum of any subarray of size k",
    generator: (n) => {
      const arr = Array.from({ length: n }, () =>
        Math.floor(Math.random() * 10)
      );
      const k = Math.max(2, Math.floor(n / 3));
      return {
        title: "Max subarray sum (fixed window)",
        arr,
        k,
        hint: "Use fixed-size sliding window: add new, subtract old.",
      };
    },
  },
  {
    type: "longest-unique",
    prompt:
      "Find the length of the longest substring without repeating characters",
    generator: (n) => {
      const chars = "abcde12345xyz";
      const s = Array.from(
        { length: n },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
      return {
        title: "Longest unique substring",
        s,
        hint: "Use a set or map and two pointers.",
      };
    },
  },
  {
    type: "min-window",
    prompt:
      "Find the minimum window substring that contains all characters of pattern",
    generator: (n) => {
      const letters = "abcde";
      const s = Array.from(
        { length: n },
        () => letters[Math.floor(Math.random() * letters.length)]
      ).join("");
      const pattern = letters.slice(0, Math.min(3, letters.length));
      return {
        title: "Minimum window substring (practice)",
        s,
        pattern,
        hint: "Use frequency map and variable-size window.",
      };
    },
  },
  {
    type: "deque-max",
    prompt: "Find maximum in each sliding window (monotonic deque)",
    generator: (n) => {
      const arr = Array.from({ length: n }, () =>
        Math.floor(Math.random() * 20)
      );
      const k = Math.max(2, Math.floor(n / 4) + 1);
      return {
        title: "Sliding window maximum (deque)",
        arr,
        k,
        hint: "Maintain indices in a decreasing deque.",
      };
    },
  },
];

function generatePractice() {
  const count = Math.max(
    1,
    Math.min(20, Number(document.getElementById("practiceCount").value) || 5)
  );
  const list = [];
  for (let i = 0; i < count; i++) {
    const t =
      practiceTemplates[Math.floor(Math.random() * practiceTemplates.length)];
    const item = t.generator(6 + Math.floor(Math.random() * 8));
    list.push(item);
  }
  localStorage.setItem(PRACTICE_KEY, JSON.stringify(list));
  renderPracticeList(list);
}

function renderPracticeList(list) {
  const container = document.getElementById("practiceList");
  container.innerHTML = "";
  if (!list || list.length === 0) {
    container.innerHTML =
      '<div class="small">No practice problems generated yet.</div>';
    return;
  }
  list.forEach((p, idx) => {
    const el = document.createElement("div");
    el.className = "practice-item";
    let html = `<strong>Problem ${idx + 1}:</strong> ${
      p.title
    }<div style="margin-top:6px">`;
    if (p.arr) html += `Array: [${p.arr.join(", ")}]`;
    if (p.k) html += `; k = ${p.k}`;
    if (p.s) html += `String: "${p.s}"`;
    if (p.pattern) html += `; Pattern: "${p.pattern}"`;
    html += `</div><div class="small" style="margin-top:6px">Hint: ${p.hint}</div>`;
    el.innerHTML = html;
    container.appendChild(el);
  });
}

function downloadPractice() {
  const raw = localStorage.getItem(PRACTICE_KEY);
  if (!raw) {
    alert("No practice set generated yet. Click Generate Practice first.");
    return;
  }
  const list = JSON.parse(raw);
  let content = "Practice Set — Sliding Window Playground\n\n";
  list.forEach((p, i) => {
    content += `Problem ${i + 1}: ${p.title}\n`;
    if (p.arr) content += `Array: [${p.arr.join(", ")}]\n`;
    if (p.k) content += `k = ${p.k}\n`;
    if (p.s) content += `String: "${p.s}"\n`;
    if (p.pattern) content += `Pattern: "${p.pattern}"\n`;
    content += `Hint: ${p.hint}\n\n`;
  });
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sliding-window-practice-${new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[:T]/g, "-")}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* -------------------------
           Debug quiz UI & logic (records attempts)
           ------------------------- */
function openDebugQuiz() {
  const area = document.getElementById("quizArea");
  area.innerHTML = "";
  const container = document.createElement("div");
  container.innerHTML = `<div class="card-title">Debug the Code Quiz</div><div class="small">Spot bugs or provide fixes. Attempts are recorded for reports.</div>`;
  const qList = document.createElement("div");
  qList.style.marginTop = "12px";

  debugQuestions.forEach((q, idx) => {
    const qbox = document.createElement("div");
    qbox.style.marginBottom = "14px";
    qbox.innerHTML = `<div style="font-weight:700">${idx + 1}. ${
      q.title
    }</div><pre>${q.snippet}</pre>`;
    if (q.type === "mcq") {
      const opts = document.createElement("div");
      opts.className = "options";
      q.options.forEach((opt, i) => {
        const el = document.createElement("div");
        el.className = "option";
        el.textContent = opt;
        el.onclick = () => {
          Array.from(opts.children).forEach((c) => (c.onclick = null));
          const correct = i === q.answer;
          if (correct) {
            el.classList.add("correct");
            recordAttempt(q.id, true, opt);
            alert(`Correct! +${q.points} points`);
          } else {
            el.classList.add("wrong");
            recordAttempt(q.id, false, opt);
            alert(`Not quite. Tip: ${q.explanation}`);
          }
        };
        opts.appendChild(el);
      });
      qbox.appendChild(opts);
    } else if (q.type === "fix") {
      const promptLabel = document.createElement("div");
      promptLabel.className = "small";
      promptLabel.style.marginTop = "8px";
      promptLabel.textContent = q.prompt;
      const input = document.createElement("input");
      input.type = "text";
      input.style.marginTop = "6px";
      const submit = document.createElement("button");
      submit.className = "btn secondary";
      submit.textContent = "Submit Fix";
      submit.onclick = () => {
        const user = input.value.trim();
        if (!user) {
          alert("Please enter a fix");
          return;
        }
        const norm = user.replace(/\s+/g, " ").trim();
        const expected = q.answer.replace(/\s+/g, " ").trim();
        const correct = norm === expected;
        if (correct) {
          recordAttempt(q.id, true, user);
          alert(`Correct fix! +${q.points} points`);
        } else {
          recordAttempt(q.id, false, user);
          alert(`Not quite. Expected: ${q.answer}\nTip: ${q.explanation}`);
        }
        submit.disabled = true;
        input.disabled = true;
      };
      qbox.appendChild(promptLabel);
      qbox.appendChild(input);
      qbox.appendChild(submit);
    }
    qList.appendChild(qbox);
  });

  container.appendChild(qList);
  area.appendChild(container);
}

/* -------------------------
           View attempts (simple viewer)
           ------------------------- */
function viewAttempts() {
  const attempts = loadDebugHistory();
  if (attempts.length === 0) {
    alert("No attempts recorded yet. Take the Debug Quiz first.");
    return;
  }
  let text = "Debug Attempts:\n\n";
  attempts.forEach((a, i) => {
    text += `${i + 1}. ${a.timestamp}\n   ${a.title}\n   ${
      a.correct ? "Correct" : "Wrong"
    }\n   Answer: ${a.userAnswer}\n   Tip: ${a.explanation}\n\n`;
  });
  // show in modal-like prompt (simple)
  const w = window.open("", "_blank", "width=700,height=600,scrollbars=yes");
  w.document.write(
    '<pre style="white-space:pre-wrap;font-family:monospace;padding:12px;background:#071028;color:#dbeafe;">' +
      escapeHtml(text) +
      "</pre>"
  );
}

/* -------------------------
           Report preview update
           ------------------------- */
function updateReportPreview() {
  const data = buildReportData();
  const preview = document.getElementById("reportPreview");
  if (!data) {
    preview.textContent =
      "No report yet. Run the Debug Quiz and export a report to see a summary here.";
    return;
  }
  let short = `Generated: ${data.generatedAt}\nAttempts: ${data.totalAttempts}  Correct: ${data.correctCount}  Points: ${data.totalPoints}\n\n`;
  if (data.mistakesSummary.length === 0) {
    short += "No mistakes recorded — great job!\n";
  } else {
    short += "Mistakes:\n";
    data.mistakesSummary.forEach((m, i) => {
      short += `${i + 1}. ${m.title} — missed ${m.count} times\n   Tip: ${
        m.explanation
      }\n`;
    });
  }
  short += "\nPractice suggestions:\n";
  data.suggestions.forEach((s) => (short += `- ${s}\n`));
  preview.textContent = short;
}

/* -------------------------
           Utility & init
           ------------------------- */
function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

/* Minimal chart setup (static until used) */
const sumCtx = document.getElementById("sumChart").getContext("2d");
const windowCtx = document.getElementById("windowChart").getContext("2d");
const sumChart = new Chart(sumCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Window Sum",
        data: [],
        borderColor: "#6c8cff",
        backgroundColor: "rgba(108,140,255,0.12)",
        tension: 0.3,
      },
    ],
  },
  options: { responsive: true, maintainAspectRatio: false },
});
const windowChart = new Chart(windowCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Window Size",
        data: [],
        backgroundColor: "rgba(255,183,77,0.14)",
      },
    ],
  },
  options: { responsive: true, maintainAspectRatio: false },
});

/* Simple simulation functions reused from earlier versions */
function parseArrayInput() {
  const raw = document.getElementById("inputArray").value.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}
function startFixed() {
  const arr = parseArrayInput();
  const k = Number(document.getElementById("inputK").value) || 1;
  if (k > arr.length) {
    alert("Window size larger than array length");
    return;
  }
  const sums = [];
  let sum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  sums.push({ window: arr.slice(0, k), sum });
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k];
    sums.push({ window: arr.slice(i - k + 1, i + 1), sum });
  }
  sumChart.data.labels = sums.map((s, i) => `W${i + 1}`);
  sumChart.data.datasets[0].data = sums.map((s) => s.sum);
  sumChart.update();
  windowChart.data.labels = sums.map((s, i) => `W${i + 1}`);
  windowChart.data.datasets[0].data = sums.map((s) => s.window.length);
  windowChart.update();
  document.getElementById("simLog").innerHTML = sums
    .map((s, i) => `Window ${i + 1}: [${s.window.join(", ")}] → Sum = ${s.sum}`)
    .join("<br>");
  updateReportPreview();
}
function startAnimatedFixed() {
  startFixed();
}
function startVariable() {
  const s = document.getElementById("inputString").value || "";
  const seen = new Set();
  let left = 0;
  const windows = [];
  let maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    const cur = s.slice(left, right + 1);
    windows.push({ window: cur, len: cur.length });
    maxLen = Math.max(maxLen, cur.length);
  }
  sumChart.data.labels = windows.map((w, i) => `S${i + 1}`);
  sumChart.data.datasets[0].data = windows.map((w) => w.len);
  sumChart.update();
  windowChart.data.labels = windows.map((w, i) => `S${i + 1}`);
  windowChart.data.datasets[0].data = windows.map((w) => w.len);
  windowChart.update();
  document.getElementById("simLog").innerHTML = windows
    .map((w, i) => `Step ${i + 1}: "${w.window}" (len ${w.len})`)
    .join("<br>");
  updateReportPreview();
}
function startAnimatedVariable() {
  startVariable();
}

/* Presets & init */
function loadPreset(name) {
  if (name === "classic") {
    document.getElementById("inputArray").value = "2,1,5,1,3,2";
    document.getElementById("inputK").value = 3;
    document.getElementById("inputString").value = "abcabcbb";
  } else if (name === "peaks") {
    document.getElementById("inputArray").value = "1,8,6,2,5,9,3,7";
    document.getElementById("inputK").value = 4;
    document.getElementById("inputString").value = "pwwkew";
  } else {
    const arr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
    document.getElementById("inputArray").value = arr.join(",");
    document.getElementById("inputK").value = 3 + Math.floor(Math.random() * 3);
    document.getElementById("inputString").value = "randomstr";
  }
}
function showLeaderboardModal() {
  document.getElementById("leaderboardModal").style.display = "flex";
}
function closeLeaderboardModal() {
  document.getElementById("leaderboardModal").style.display = "none";
}

/* Initialize preview and practice list if present */
(function init() {
  updateReportPreview();
  const rawPractice = localStorage.getItem(PRACTICE_KEY);
  if (rawPractice) renderPracticeList(JSON.parse(rawPractice));
  loadPreset("classic");
})();

/* Copy helpers for the practical Java section */
function copySnippet(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.textContent || el.innerText || "";
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const toast = document.createElement("div");
      toast.textContent = "Copied";
      toast.style.position = "fixed";
      toast.style.right = "18px";
      toast.style.bottom = "18px";
      toast.style.background = "#6c8cff";
      toast.style.color = "#071028";
      toast.style.padding = "8px 12px";
      toast.style.borderRadius = "8px";
      toast.style.fontWeight = "700";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1200);
    })
    .catch(() => alert("Copy failed. Clipboard access may be blocked."));
}

function copyAllJavaPractical() {
  const ids = [
    "javaDequePractical",
    "javaSetMapPractical",
    "javaFreqPractical",
    "javaFixedPractical",
  ];
  let all = "";
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) all += el.textContent + "\n\n";
  });
  navigator.clipboard
    .writeText(all)
    .then(() => {
      const toast = document.createElement("div");
      toast.textContent = "All Java copied";
      toast.style.position = "fixed";
      toast.style.right = "18px";
      toast.style.bottom = "18px";
      toast.style.background = "#6c8cff";
      toast.style.color = "#071028";
      toast.style.padding = "8px 12px";
      toast.style.borderRadius = "8px";
      toast.style.fontWeight = "700";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1200);
    })
    .catch(() => alert("Copy failed. Clipboard access may be blocked."));
}

function scrollToJavaPractical() {
  const panel = document.getElementById("javaConceptsPractical");
  if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
}


