const scenarios = [
  {
    time: "00:00",
    second: 0,
    title: "医院病房问询",
    type: "禁止广告",
    color: "red",
    subtitle: "医院病房问询，系统保护观看沉浸",
    reason: "病房、医护和人物问询同屏，这里不应该出现商业打扰。",
    adCategory: "",
    adTitle: "",
    adCopy: "",
    coupon: "",
  },
  {
    time: "00:24",
    second: 24,
    title: "病房问询延续",
    type: "禁止广告",
    color: "red",
    subtitle: "病房问询延续，系统继续禁止广告",
    reason: "仍处于医疗空间和人物问询段落，不适合商业露出。",
    adCategory: "",
    adTitle: "",
    adCopy: "",
    coupon: "",
  },
  {
    time: "00:48",
    second: 48,
    title: "路边线索交接",
    type: "轻广告",
    color: "yellow",
    subtitle: "路边线索交接，适合低打扰出行类剧情彩蛋",
    reason: "室外路边对话，旁边有出租车和出行语境，可以出现低打扰彩蛋。",
    adCategory: "打车",
    adTitle: "查线索要跑远路，先叫辆车。",
    adCopy: "附近打车券轻量出现，不挡人物和字幕。",
    coupon: "领取打车券",
  },
  {
    time: "01:12",
    second: 72,
    title: "夜间药店场景",
    type: "可广告",
    color: "green",
    subtitle: "夜间药店场景，可做不遮挡主体的生活服务入口",
    reason: "夜间店内环境稳定，适合可关闭的药店跑腿或热饮入口。",
    adCategory: "药店跑腿",
    adTitle: "夜里临时买药，不用多跑一趟。",
    adCopy: "附近药店跑腿券轻量出现，用户愿意点再展开。",
    coupon: "领取跑腿券",
  },
];

const toneCopiesByScenario = {
  路边线索交接: [
    ["查线索要跑远路，先叫辆车。", "附近打车券轻量出现，不挡人物和字幕。"],
    ["线索都到路边了，车也该到了。", "打车券只在出行语境里出现，点一下就领。"],
    ["从路边出发，下一站更快到。", "出行服务轻量提示，可关闭，不遮挡剧情。"],
  ],
  夜间药店场景: [
    ["夜里临时买药，不用多跑一趟。", "附近药店跑腿券轻量出现，用户愿意点再展开。"],
    ["都到药店门口了，别白跑。", "附近药店服务一键查看，不遮挡人物。"],
    ["夜间药店还亮着，服务也能跟上。", "药店跑腿入口在稳定店内场景轻量露出。"],
  ],
};

const scenarioGrid = document.querySelector("#scenarioGrid");
const scenarioVerdict = document.querySelector("#scenarioVerdict");
const oldVideo = document.querySelector("#oldVideo");
const smartVideo = document.querySelector("#smartVideo");
const oldAd = document.querySelector("#oldAd");
const oldSubtitle = document.querySelector("#oldSubtitle");
const smartSubtitle = document.querySelector("#smartSubtitle");
const oldTime = document.querySelector("#oldTime");
const smartTime = document.querySelector("#smartTime");
const runOld = document.querySelector("#runOld");
const skipOld = document.querySelector("#skipOld");
const runSmart = document.querySelector("#runSmart");
const continueSmart = document.querySelector("#continueSmart");
const readChip = document.querySelector("#readChip");
const smartAd = document.querySelector("#smartAd");
const blockCard = document.querySelector("#blockCard");
const blockCopy = document.querySelector("#blockCopy");
const adContext = document.querySelector("#adContext");
const smartAdTitle = document.querySelector("#smartAdTitle");
const smartAdCopy = document.querySelector("#smartAdCopy");
const claimCoupon = document.querySelector("#claimCoupon");
const changeTone = document.querySelector("#changeTone");
const couponToast = document.querySelector("#couponToast");
const decisionList = document.querySelector("#decisionList");
const oldNote = document.querySelector("#oldNote");

let selectedIndex = 2;
let timers = [];
let toneIndex = 0;

function clearTimers() {
  timers.forEach((timer) => clearTimeout(timer));
  timers = [];
}

function setVideoTime(video, second) {
  try {
    video.currentTime = second;
  } catch {
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = second;
    }, { once: true });
  }
}

function pauseVideos() {
  oldVideo.pause();
  smartVideo.pause();
}

function renderScenarios() {
  scenarioGrid.innerHTML = scenarios
    .map(
      (item, index) => `
        <button class="scenario-btn ${index === selectedIndex ? "active" : ""}" data-index="${index}" type="button">
          <span>${item.time} · ${item.type}</span>
          <strong>${item.title}</strong>
          <small>${item.reason}</small>
        </button>
      `,
    )
    .join("");

  scenarioGrid.querySelectorAll(".scenario-btn").forEach((button) => {
    button.addEventListener("click", () => {
      selectScenario(Number(button.dataset.index));
    });
  });
}

function renderDecision(activeCount = 0) {
  const item = scenarios[selectedIndex];
  const allowed = item.color !== "red";
  const rows = [
    ["当前剧情", item.title],
    ["机会地图", item.type],
    ["用户行为", "主动暂停"],
    ["频控检查", "通过"],
    ["遮挡检查", allowed ? "不遮挡人物和字幕" : "禁入区无需展示"],
    ["最终决策", allowed ? "展示右下角剧情彩蛋" : "不展示广告，保护剧情"],
  ];

  decisionList.innerHTML = rows
    .map(
      ([label, value], index) => `
        <div class="decision-item ${index < activeCount ? "active" : ""}">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
}

function resetOverlays() {
  clearTimers();
  oldAd.classList.add("hidden");
  readChip.classList.add("hidden");
  smartAd.classList.add("hidden");
  smartAd.classList.remove("show");
  blockCard.classList.add("hidden");
  blockCard.classList.remove("show");
  couponToast.classList.add("hidden");
  runSmart.textContent = "暂停，体验我的广告";
  runOld.textContent = "体验传统广告";
  renderDecision(0);
}

function selectScenario(index) {
  selectedIndex = index;
  const item = scenarios[selectedIndex];
  toneIndex = 0;
  renderScenarios();
  resetOverlays();
  scenarioVerdict.textContent = `当前：${item.title}，${item.type}`;
  oldSubtitle.textContent = item.subtitle;
  smartSubtitle.textContent = item.subtitle;
  oldTime.textContent = item.time;
  smartTime.textContent = item.time;
  oldNote.textContent = "传统规则只看时间点，不知道这段剧情适不适合被打断。";
  setVideoTime(oldVideo, item.second);
  setVideoTime(smartVideo, item.second);
  pauseVideos();
}

function runOldExperience() {
  resetOverlays();
  runOld.textContent = "广告即将出现...";
  oldVideo.play().catch(() => {});
  timers.push(
    setTimeout(() => {
      oldVideo.pause();
      oldAd.classList.remove("hidden");
      runOld.textContent = "重新体验传统广告";
      oldNote.textContent = "结果：广告直接盖住画面，和当前剧情情绪无关。";
    }, 1200),
  );
}

function runSmartExperience() {
  resetOverlays();
  const item = scenarios[selectedIndex];
  const allowed = item.color !== "red";
  runSmart.textContent = "轻量判断中...";
  readChip.classList.remove("hidden");
  smartVideo.pause();

  for (let i = 1; i <= 6; i += 1) {
    timers.push(setTimeout(() => renderDecision(i), i * 260));
  }

  timers.push(
    setTimeout(() => {
      readChip.classList.add("hidden");
      if (allowed) {
        adContext.textContent = `${item.title} · 推荐${item.adCategory}`;
        smartAdTitle.textContent = item.adTitle;
        smartAdCopy.textContent = item.adCopy;
        claimCoupon.textContent = item.coupon;
        smartAd.classList.remove("hidden");
        requestAnimationFrame(() => smartAd.classList.add("show"));
        runSmart.textContent = "重新体验我的广告";
      } else {
        blockCopy.textContent = item.reason;
        blockCard.classList.remove("hidden");
        requestAnimationFrame(() => blockCard.classList.add("show"));
        runSmart.textContent = "换个剧情点再试";
      }
    }, 1800),
  );
}

function continueSmartVideo() {
  resetOverlays();
  smartVideo.play().catch(() => {});
}

function changeAdTone() {
  const item = scenarios[selectedIndex];
  const toneCopies = toneCopiesByScenario[item.title] || [
    [item.adTitle, item.adCopy],
  ];
  toneIndex = (toneIndex + 1) % toneCopies.length;
  const [title, copy] = toneCopies[toneIndex];
  smartAdTitle.textContent = title;
  smartAdCopy.textContent = copy;
  couponToast.classList.add("hidden");
}

runOld.addEventListener("click", runOldExperience);
skipOld.addEventListener("click", () => oldAd.classList.add("hidden"));
runSmart.addEventListener("click", runSmartExperience);
continueSmart.addEventListener("click", continueSmartVideo);
changeTone.addEventListener("click", changeAdTone);
claimCoupon.addEventListener("click", () => couponToast.classList.remove("hidden"));

renderScenarios();
selectScenario(selectedIndex);
