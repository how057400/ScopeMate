const questions = [
  {
    id: "projectType",
    title: "어떤 유형의 프로젝트인가요?",
    options: [
      { label: "랜딩 / 브랜드 / PIP", badge: "단일 페이지 중심", value: "single", factor: "단일페이지", hours: 32, risk: 0 },
      { label: "웹사이트 구축", badge: "여러 페이지로 구성된 사이트", value: "site", factor: "웹사이트 구축", hours: 56, risk: 2 },
      { label: "기타", value: "etc", factor: "기타", hours: 40, risk: 1 }
    ]
  },
  {
    id: "responsive",
    title: "반응형이 포함되나요?",
    options: [
      { label: "PC", value: "pc", factor: "PC 기준 작업", hours: 0, risk: 0 },
      { label: "PC + Mobile", value: "pcMobile", factor: "PC+MO 대응", hours: 14, risk: 1 },
      { label: "PC + Tablet + Mobile", value: "all", factor: "PC + Tab + MO 대응", hours: 24, risk: 2 }
    ]
  },
  {
    id: "designSystem",
    title: "기존 디자인 시스템을 활용할 수 있나요?",
    options: [
      { label: "대부분 활용", value: "mostly", factor: "기존 시스템 활용", hours: -4, risk: -1 },
      { label: "일부 활용", value: "partial", factor: "일부 시스템 활용", hours: 0, risk: 0 },
      { label: "신규 구축", value: "new", factor: "신규 시스템 필요", hours: 18, risk: 2 }
    ]
  },
  {
    id: "interaction",
    title: "인터랙션 수준은 어느 정도인가요?",
    options: [
      { label: "없음", value: "none", factor: "인터랙션 없음", hours: 0, risk: 0 },
      { label: "일반", badge: "Hover, Tab, Slider", value: "normal", factor: "일부 인터랙션 포함", hours: 8, risk: 1 },
      { label: "고난도", badge: "Scroll Animation, Parallax, Motion", value: "high", factor: "고난도 인터랙션 포함", hours: 18, risk: 2 }
    ]
  },
  {
    id: "cms",
    title: "CMS 대응이 필요한가요?",
    options: [
      { label: "없음", value: "none", factor: "CMS 없음", hours: 0, risk: 0 },
      { label: "일부", value: "partial", factor: "일부 CMS 적용", hours: 8, risk: 1 },
      { label: "대부분", value: "mostly", factor: "CMS 적용", hours: 18, risk: 2 }
    ]
  },
  {
    id: "handoff",
    title: "개발 전달용 가이드가 필요한가요?",
    options: [
      { label: "디자인 전달만", value: "designOnly", factor: "개발 가이드 불필요", hours: 0, risk: 0 },
      { label: "간단한 가이드", value: "simple", factor: "간단한 개발 가이드 필요", hours: 6, risk: 1 },
      { label: "상세 개발 가이드", value: "detail", factor: "상세 개발 가이드", hours: 14, risk: 2 }
    ]
  }
];

const $ = (id) => document.getElementById(id);

const introScreen = $("introScreen");
const questionScreen = $("questionScreen");
const loadingScreen = $("loadingScreen");
const resultScreen = $("resultScreen");
const startBtn = $("startBtn");
const prevBtn = $("prevBtn");
const nextBtn = $("nextBtn");
const resultBackBtn = $("resultBackBtn");
const restartBtn = $("restartBtn");
const progressFill = $("progressFill");
const questionTitle = $("questionTitle");
const optionList = $("optionList");
const resultHours = $("resultHours");
const resultDays = $("resultDays");
const resultFactors = $("resultFactors");
const resultComment = $("resultComment");
const copyBtn = $("copyBtn");
const loadingText = $("loadingText");

let current = 0;
let answers = {};
let loadingTimer = null;

const loadingMessages = [
  "프로젝트를 분석하고 있습니다.",
  "페이지 구성을 검토하고 있습니다.",
  "인터랙션 난이도를 계산하고 있습니다.",
  "CMS 적용 여부를 확인하고 있습니다.",
  "개발 전달 범위를 확인하고 있습니다.",
  "예상 공수를 산정하고 있습니다."
];

function setScreen(name) {
  [introScreen, questionScreen, loadingScreen, resultScreen].forEach((screen) => {
    screen.classList.remove("is-active");
  });

  document.body.classList.toggle("is-result", name === "result");
  document.body.classList.remove("is-copied");

  if (name === "intro") introScreen.classList.add("is-active");
  if (name === "question") questionScreen.classList.add("is-active");
  if (name === "loading") loadingScreen.classList.add("is-active");
  if (name === "result") resultScreen.classList.add("is-active");
}

function getCurrentQuestion() {
  return questions[current];
}

function getSelected(question) {
  return question.options.find((option) => option.value === answers[question.id]);
}

function renderQuestion() {
  const question = getCurrentQuestion();
  const selected = answers[question.id];

  progressFill.style.width = `${(current / questions.length) * 100}%`;
  questionTitle.textContent = question.title;
  optionList.innerHTML = "";

  question.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", option.value === selected ? "true" : "false");

    if (option.value === selected) btn.classList.add("is-selected");

    btn.innerHTML = `
      <span class="option-radio" aria-hidden="true"></span>
      <span class="option-label">
        <span>${option.label}</span>
        ${option.badge ? `<span class="badge">${option.badge}</span>` : ""}
      </span>
    `;

    btn.addEventListener("click", () => {
      answers[question.id] = option.value;
      renderQuestion();
    });

    optionList.appendChild(btn);
  });

  prevBtn.disabled = current === 0;
  nextBtn.disabled = !selected;
}

function goNext() {
  const question = getCurrentQuestion();
  if (!answers[question.id]) return;

  if (current < questions.length - 1) {
    current += 1;
    renderQuestion();
    return;
  }

  setScreen("loading");
  startLoadingMessages();

  setTimeout(() => {
    stopLoadingMessages();
    renderResult();
    setScreen("result");
  }, 2600);
}

function goPrev() {
  if (current === 0) return;
  current -= 1;
  renderQuestion();
}

function roundTo(value, unit) {
  return Math.round(value / unit) * unit;
}

function calculate() {
  let total = 0;
  let risk = 0;
  const factors = [];

  questions.forEach((q) => {
    const selected = getSelected(q);
    if (!selected) return;

    total += selected.hours || 0;
    risk += selected.risk || 0;

    if (!["designSystem", "interaction"].includes(q.id)) {
      factors.push(selected.factor);
    }

    if (q.id === "designSystem" && selected.value === "new") {
      factors.push(selected.factor);
    }

    if (q.id === "interaction" && selected.value !== "none") {
      factors.push(selected.factor);
    }
  });

  // MVP estimate model:
  // Uses additive effort instead of multipliers to avoid excessive inflation
  // when responsive, CMS, interaction, and handoff are all selected.
  const center = Math.max(6, Math.round(total));

  // Range width expands slightly as risk increases.
  const rangeRate = risk >= 7 ? 0.18 : risk >= 3 ? 0.16 : 0.14;
  const minHours = Math.max(6, roundTo(center * (1 - rangeRate), 6));
  const maxHours = Math.max(minHours + 6, roundTo(center * (1 + rangeRate), 6));

  const minDays = Math.max(1, Math.ceil(minHours / 8));
  const maxDays = Math.max(minDays, Math.ceil(maxHours / 8));

  let level = "low";
  if (risk >= 7 || maxHours >= 112) level = "high";
  else if (risk >= 3 || maxHours >= 56) level = "medium";

  return { minHours, maxHours, minDays, maxDays, factors, level };
}

function commentFor(level) {
  if (level === "low") {
    return "작업 범위가 비교적 명확한 편입니다.\n큰 변동이 없다면 짧은 일정 안에서도 진행 가능해 보입니다.";
  }

  if (level === "medium") {
    return "반응형과 인터랙션이 포함되어\n기본 작업보다 공수가 증가합니다.";
  }

  return "작업 범위가 크고 운영 대응 요소가 많아 공수 변동 가능성이 높습니다.\n초기 일정 산정 시 20-30% 이상의 버퍼를 확보하는 것을 권장합니다.";
}


function shuffleMessages(messages) {
  return [...messages].sort(() => Math.random() - 0.5);
}

function startLoadingMessages() {
  if (!loadingText) return;
  if (loadingTimer) clearInterval(loadingTimer);

  const messages = shuffleMessages(loadingMessages);
  let index = 0;

  loadingText.textContent = messages[index];

  loadingTimer = setInterval(() => {
    index = (index + 1) % messages.length;
    loadingText.textContent = messages[index];
  }, 900);
}

function stopLoadingMessages() {
  if (loadingTimer) {
    clearInterval(loadingTimer);
    loadingTimer = null;
  }
}

function animateNumberRange(element, min, max, suffix) {
  if (!element) return;

  const duration = 700;
  const start = performance.now();

  element.classList.add("counting");

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOutQuart(progress);

    const currentMin = Math.round(min * eased);
    const currentMax = Math.round(max * eased);

    if (min === max) {
      element.textContent = `${currentMax}${suffix}`;
    } else {
      element.textContent = `${currentMin}-${currentMax}${suffix}`;
    }

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      element.textContent = min === max ? `${max}${suffix}` : `${min}-${max}${suffix}`;
      element.classList.remove("counting");
    }
  }

  requestAnimationFrame(frame);
}

function renderResult() {
  const result = calculate();

  resultFactors.textContent = result.factors.join(" / ");
  resultComment.textContent = commentFor(result.level);

  animateNumberRange(resultHours, result.minHours, result.maxHours, "시간");
  animateNumberRange(resultDays, result.minDays, result.maxDays, "영업일");
}

function start() {
  stopLoadingMessages();
  current = 0;
  answers = {};
  renderQuestion();
  setScreen("question");
}

function restart() {
  stopLoadingMessages();
  current = 0;
  answers = {};
  progressFill.style.width = "0%";
  setScreen("intro");
}



function getCopyText() {
  return [
    "[ScopeMate 공수 계산 결과]",
    "",
    `예상 공수: ${resultHours.textContent}`,
    `권장 일정: ${resultDays.textContent}`,
    `주요 영향 요소: ${resultFactors.textContent}`,
    "",
    resultComment.textContent.trim()
  ].join("\n");
}

async function copyResult() {
  const text = getCopyText();

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  document.body.classList.add("is-copied");
  window.setTimeout(() => {
    document.body.classList.remove("is-copied");
  }, 1200);
}

startBtn.addEventListener("click", start);
nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);
restartBtn.addEventListener("click", restart);
copyBtn?.addEventListener("click", copyResult);
resultBackBtn.addEventListener("click", () => {
  current = questions.length - 1;
  renderQuestion();
  setScreen("question");
});

document.addEventListener("keydown", (e) => {
  if (!questionScreen.classList.contains("is-active")) return;
  if (e.key === "Enter" || e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
});
