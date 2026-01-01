// Week 1: Fundamentals & Linear Patterns

//     Goal: Master basic data structures and their common manipulation patterns.
//     Topics: Arrays, Strings, Two Pointers, and Sliding Window.
//  explain common patterns and when to use them.
//     Action: Solve 3–5 "Easy" problems daily focusing on these patterns.
//     Resources: LeetCode, HackerRank, and GeeksforGeeks for practice problems.
// add simulated problem examples step by step.
//     Action: Solve 3–5 "Easy" problems daily to build muscle memory.
//     Resources: LeetCode, HackerRank, and GeeksforGeeks for practice problems.

// Example Problem: Two Sum (Easy)
// Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target

const roadmapData = [
  { id: 1, name: "Two Sum", link: "leetcode.com", pattern: "Hashing" },
  {
    id: 2,
    name: "Valid Palindrome",
    link: "leetcode.com",
    pattern: "Two Pointers",
  },
  {
    id: 3,
    name: "Best Time to Buy/Sell Stock",
    link: "leetcode.com",
    pattern: "Sliding Window",
  },
  // Add up to 10 items here...
];

const labState = {
  array: [2, 1, 5, 1, 3, 2],
  k: 3,
  step: 0,
  steps: [
    { sum: 8, text: "Initial Window [2,1,5]. Sum = 8" },
    { sum: 7, text: "Slide! Subtract 2, Add 1. New Sum = 7" },
    { sum: 9, text: "Slide! Subtract 1, Add 3. New Sum = 9 (NEW MAX)" },
    { sum: 6, text: "Slide! Subtract 5, Add 2. New Sum = 6" },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  initPracticeList();
  renderArray();

  document.getElementById("next-btn").addEventListener("click", () => {
    if (labState.step < labState.steps.length - 1) {
      labState.step++;
      updateUI();
    }
  });

  document.getElementById("prev-btn").addEventListener("click", () => {
    if (labState.step > 0) {
      labState.step--;
      updateUI();
    }
  });
});

function renderArray() {
  const container = document.getElementById("array-display");
  container.innerHTML = labState.array
    .map((val, i) => `<div class="array-item" id="item-${i}">${val}</div>`)
    .join("");
  updateUI();
}

function updateUI() {
  const { step, steps, k } = labState;
  // Highlight window logic
  labState.array.forEach((_, i) => {
    const el = document.getElementById(`item-${i}`);
    el.classList.toggle("in-window", i >= step && i < step + k);
  });

  document.getElementById("step-description").innerText = steps[step].text;
}

function initPracticeList() {
  const list = document.getElementById("exercise-list");
  list.innerHTML = roadmapData
    .map(
      (ex) => `
        <li class="exercise-item">
            <input type="checkbox" id="ex-${ex.id}" onchange="calculateProgress()">
            <label for="ex-${ex.id}">${ex.name} (${ex.pattern})</label>
            <a href="${ex.link}" target="_blank" aria-label="Solve ${ex.name} on LeetCode">Solve ↗</a>
        </li>
    `
    )
    .join("");
}

function calculateProgress() {
  const total = roadmapData.length;
  const checked = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  ).length;
  const percentage = Math.round((checked / total) * 100);

  const bar = document.getElementById("mastery-progress");
  const text = document.getElementById("progress-text");

  bar.value = percentage;
  text.innerText = `${percentage}%`;
}
// https://www.anygen.io/share/2EQIsW8plH5Em3m71uwO04
