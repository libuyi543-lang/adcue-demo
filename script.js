const stages = [...document.querySelectorAll(".stage")];
const navButtons = [...document.querySelectorAll(".nav-btn")];
const stageTargets = [...document.querySelectorAll("[data-stage-target]")];
const countdownEl = document.querySelector("#countdown");
const traditionalAd = document.querySelector("#traditionalAd");
const skipAd = document.querySelector("#skipAd");
const runAi = document.querySelector("#runAi");
const pauseChip = document.querySelector("#pauseChip");
const analysisList = document.querySelector("#analysisList");
const eggCard = document.querySelector("#eggCard");
const decisionOverlay = document.querySelector("#decisionOverlay");
const decisionTitle = document.querySelector("#decisionTitle");
const decisionCopy = document.querySelector("#decisionCopy");
const couponBtn = document.querySelector("#couponBtn");
const continueBtn = document.querySelector("#continueBtn");
const couponResult = document.querySelector("#couponResult");
const eggTitle = document.querySelector("#eggTitle");
const eggCopy = document.querySelector("#eggCopy");
const sceneMeta = document.querySelector("#sceneMeta");
const subtitleLine = document.querySelector("#subtitleLine");
const playerMomentLabel = document.querySelector("#playerMomentLabel");
const currentNodeTitle = document.querySelector("#currentNodeTitle");
const currentNodeType = document.querySelector("#currentNodeType");
const currentTimeLabel = document.querySelector("#currentTimeLabel");
const timelineScrubber = document.querySelector("#timelineScrubber");
const sceneButtons = document.querySelector("#sceneButtons");
const timelineList = document.querySelector("#timelineList");
const generateMap = document.querySelector("#generateMap");
const preprocessStatus = document.querySelector("#preprocessStatus");
const inputList = document.querySelector("#inputList");
const outputList = document.querySelector("#outputList");
const shuffleStyle = document.querySelector("#shuffleStyle");
const togglePlayback = document.querySelector("#togglePlayback");
const episodeVideos = [...document.querySelectorAll(".episode-video")];
const heroVideo = document.querySelector('[data-video-role="hero"]');
const beforeVideo = document.querySelector('[data-video-role="before"]');
const afterVideo = document.querySelector('[data-video-role="after"]');

let countdownTimer = null;
let aiTimers = [];
let preprocessTimers = [];
let currentStyleIndex = 0;
let selectedNodeIndex = 1;
let userStartedPlayback = false;
let lastRenderedDecisionKey = "";

const episodeAnalysis = [
  {
    time: "00:00",
    second: 0,
    title: "信息密集段落",
    type: "禁止广告",
    color: "red",
    reason: "人物信息密集，插入广告会削弱信任和情绪连续性",
    adCategories: [],
    subtitle: "信息密集段落，系统保护观看沉浸",
    decision: "不展示广告",
  },
  {
    time: "00:24",
    second: 24,
    title: "生活化转场",
    type: "轻广告",
    color: "yellow",
    reason: "人物互动轻松，适合热饮、便利店等低打扰剧情彩蛋",
    adCategories: ["便利店", "水饮", "社区团购"],
    subtitle: "生活化转场，情绪轻松，适合低打扰剧情彩蛋",
    decision: "展示剧情彩蛋广告",
  },
  {
    time: "00:48",
    second: 48,
    title: "情绪敏感段落",
    type: "禁止广告",
    color: "red",
    reason: "人物情绪升高，是高敏感情绪区，不适合任何商业打断",
    adCategories: [],
    subtitle: "情绪升高，系统标记为广告禁入区",
    decision: "不展示广告",
  },
  {
    time: "01:12",
    second: 72,
    title: "稳定环境镜头",
    type: "可广告",
    color: "green",
    reason: "对白弱、画面稳定，适合做可关闭的生活服务入口",
    adCategories: ["清洁用品", "本地生活", "公益倡议"],
    subtitle: "稳定环境镜头，可做不遮挡主体的生活服务入口",
    decision: "展示互动广告",
  },
];

const adStyles = [
  {
    id: "gentle",
    name: "温柔版",
    title: "桦林的夜有点冷，先喝口热的。",
    copy: "附近便利店热饮券，暂停时轻轻出现，不挡剧情。",
  },
  {
    id: "bullet",
    name: "弹幕版",
    title: "别硬扛东北夜风了，整杯热豆浆。",
    copy: "热饮券已备好，点一下就领，不点就继续看。",
  },
  {
    id: "brand",
    name: "品牌版",
    title: "夜路、冷风、热饮，都在附近。",
    copy: "本地便利店热饮优惠，适合转场间隙轻量露出。",
  },
];

const adCopyByCategory = {
  餐饮: {
    title: "食堂这口热乎劲，附近也有。",
    copy: "本地餐饮券轻量提示，适合生活过场，不遮挡人物对白。",
    coupon: "领取餐饮券",
  },
  水饮: {
    title: "桦林的夜有点冷，先喝口热的。",
    copy: "附近便利店热饮券，暂停时轻轻出现，不挡剧情。",
    coupon: "领取热饮券",
  },
  便利店: {
    title: "顺路去趟小卖部，热饮和水都备着。",
    copy: "附近便利店优惠，适合生活间隙，不抢戏。",
    coupon: "领取便利店券",
  },
  清洁用品: {
    title: "旧楼道也要亮堂一点。",
    copy: "家清用品小额券，可关闭浮层，不影响继续观看。",
    coupon: "领取家清券",
  },
  助眠用品: {
    title: "夜深了，把声音放轻一点。",
    copy: "助眠好物轻提示，只在低对白段落出现。",
    coupon: "领取助眠券",
  },
  互动广告: {
    title: "这一集看完了，留个线索再走。",
    copy: "片尾互动任务，答对剧情线索可领会员权益。",
    coupon: "参与片尾互动",
  },
  会员权益: {
    title: "继续追桦林旧事，少一点等待。",
    copy: "会员权益在片头片尾提示，不插进正片情绪点。",
    coupon: "查看会员权益",
  },
};

function setVideoTime(video, second) {
  if (!video) return;

  const nextTime = Math.max(0, Number(second) || 0);

  if (Number.isFinite(video.duration) && nextTime > video.duration) {
    video.currentTime = Math.max(0, video.duration - 1);
    return;
  }

  try {
    video.currentTime = nextTime;
  } catch {
    video.addEventListener(
      "loadedmetadata",
      () => {
        video.currentTime = nextTime;
      },
      { once: true },
    );
  }
}

function pauseAllVideos(exceptVideo = null) {
  episodeVideos.forEach((video) => {
    if (video !== exceptVideo) {
      video.pause();
    }
  });
}

function syncStageVideo(stageId) {
  if (stageId === "hero") {
    setVideoTime(heroVideo, episodeAnalysis[selectedNodeIndex].second);
    pauseAllVideos(heroVideo);
  }

  if (stageId === "before") {
    setVideoTime(beforeVideo, 48);
    pauseAllVideos(beforeVideo);
  }

  if (stageId === "after") {
    setVideoTime(afterVideo, episodeAnalysis[selectedNodeIndex].second);
    pauseAllVideos(afterVideo);
  }
}

function createRealtimeDecision(node, currentTime) {
  const isBlocked = node.color === "red";
  const isLight = node.color === "yellow";

  return [
    ["当前时间点", currentTime],
    ["剧情阶段", node.title],
    ["机会地图", node.type],
    ["用户行为", "主动暂停"],
    ["频控检查", "通过"],
    ["遮挡检查", isBlocked ? "无需检测，禁入区不展示" : "不遮挡人物和字幕"],
    ["最终决策", isBlocked ? "不展示广告，保护剧情连续性" : isLight ? "展示剧情彩蛋广告" : node.decision],
  ];
}

function showStage(id) {
  stages.forEach((stage) => {
    stage.classList.toggle("active", stage.id === id);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.stage === id);
  });

  if (id === "before") {
    resetTraditionalAd();
  }

  if (id === "after") {
    resetAiDemo();
    updatePlayback(episodeAnalysis[selectedNodeIndex].second);
  }

  if (id === "preprocess") {
    resetPreprocess();
  }

  syncStageVideo(id);
}

function resetTraditionalAd() {
  clearInterval(countdownTimer);
  let count = 15;
  countdownEl.textContent = count;
  traditionalAd.style.display = "grid";

  countdownTimer = setInterval(() => {
    count -= 1;
    countdownEl.textContent = count;

    if (count <= 0) {
      clearInterval(countdownTimer);
    }
  }, 1000);
}

function resetAiDemo() {
  aiTimers.forEach((timer) => clearTimeout(timer));
  aiTimers = [];
  pauseChip.classList.remove("show");
  [...document.querySelectorAll(".analysis-item")].forEach((item) => item.classList.remove("active"));
  eggCard.classList.add("hidden");
  eggCard.classList.remove("show");
  decisionOverlay.classList.add("hidden");
  decisionOverlay.classList.remove("show");
  couponResult.classList.add("hidden");
  couponResult.textContent = "已领取优惠券。接下来 5 分钟减少广告打扰。";
  runAi.textContent = "暂停并读取机会地图";
  togglePlayback.textContent = afterVideo?.paused ? "播放片段" : "暂停片段";
  setAdStyle("gentle");
}

function runAiDemo() {
  resetAiDemo();
  runAi.textContent = "轻量判断中...";
  togglePlayback.textContent = "播放片段";
  pauseChip.classList.add("show");
  pauseAllVideos();
  renderDecisionSteps();

  const items = [...document.querySelectorAll(".analysis-item")];
  const node = episodeAnalysis[selectedNodeIndex];
  const shouldShowAd = node.color !== "red";

  items.forEach((item, index) => {
    aiTimers.push(
      setTimeout(() => {
        item.classList.add("active");
      }, 360 + index * 360),
    );
  });

  aiTimers.push(
    setTimeout(() => {
      if (shouldShowAd) {
        updateAdCard(node);
        eggCard.classList.remove("hidden");
      } else {
        decisionTitle.textContent = "这里不出现广告";
        decisionCopy.textContent = `${node.title}属于广告禁入区：${node.reason}。`;
        decisionOverlay.classList.remove("hidden");
      }
      requestAnimationFrame(() => {
        if (shouldShowAd) {
          eggCard.classList.add("show");
        } else {
          decisionOverlay.classList.add("show");
        }
      });
      runAi.textContent = shouldShowAd ? "重新生成彩蛋" : "换个时间点再试";
    }, 3200),
  );
}

function setAdStyle(style) {
  const selectedIndex = adStyles.findIndex((item) => item.id === style);
  const selected = adStyles[selectedIndex] || adStyles[0];
  currentStyleIndex = selectedIndex >= 0 ? selectedIndex : 0;
  eggTitle.textContent = selected.title;
  eggCopy.textContent = selected.copy;

  document.querySelectorAll(".style-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.style === selected.id);
  });
}

function cycleAdStyle() {
  currentStyleIndex = (currentStyleIndex + 1) % adStyles.length;
  setAdStyle(adStyles[currentStyleIndex].id);
  couponResult.classList.add("hidden");
}

function renderTimeline() {
  timelineList.innerHTML = episodeAnalysis
    .map((item, index) => {
      const categories = item.adCategories.length ? item.adCategories.join(" / ") : "不匹配商品";

      return `
        <button class="timeline-item ${item.color}" data-node-index="${index}" type="button">
          <time>${item.time}</time>
          <div>
            <div class="timeline-title">
              <strong>${item.title}</strong>
              <span>${item.type}</span>
            </div>
            <p>${item.reason}</p>
            <small>${categories}</small>
          </div>
        </button>
      `;
    })
    .join("");

  timelineList.querySelectorAll(".timeline-item").forEach((item) => {
    item.addEventListener("click", () => {
      const nodeIndex = Number(item.dataset.nodeIndex);
      selectNode(nodeIndex);
      showStage("after");
    });
  });
}

function renderDecisionSteps() {
  const node = episodeAnalysis[selectedNodeIndex];
  const decisionSteps = createRealtimeDecision(node, currentTimeLabel.textContent);
  const decisionKey = `${selectedNodeIndex}:${currentTimeLabel.textContent}`;

  if (decisionKey === lastRenderedDecisionKey && analysisList.children.length) {
    return;
  }

  lastRenderedDecisionKey = decisionKey;

  analysisList.innerHTML = decisionSteps
    .map(
      ([label, value], index) => `
        <div class="analysis-item" data-step="${index + 1}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${label}</strong>
            <p>${value}</p>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderSceneButtons() {
  sceneButtons.innerHTML = episodeAnalysis
    .map(
      (item, index) => `
        <button class="scene-button" data-node-index="${index}" type="button">
          <span>${item.time}</span>${item.title}
        </button>
      `,
    )
    .join("");

  sceneButtons.querySelectorAll(".scene-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectNode(Number(button.dataset.nodeIndex));
      resetAiDemo();
    });
  });
}

function getNearestNode(second) {
  return episodeAnalysis.reduce((nearest, item, index) => {
    const distance = Math.abs(item.second - second);
    return distance < nearest.distance ? { index, distance } : nearest;
  }, { index: 0, distance: Infinity });
}

function formatTime(second) {
  const numericSecond = Math.max(0, Number(second) || 0);
  const hour = Math.floor(numericSecond / 3600);
  const minute = Math.floor((numericSecond % 3600) / 60);
  const rest = numericSecond % 60;

  if (hour > 0) {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  return `${String(minute).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function selectNode(index) {
  const node = episodeAnalysis[index] || episodeAnalysis[0];
  selectedNodeIndex = index;
  timelineScrubber.value = node.second;
  updatePlayback(node.second);
}

function updatePlayback(second, options = {}) {
  const { syncVideo = true } = options;
  const nodeResult = getNearestNode(Number(second));
  const node = episodeAnalysis[nodeResult.index];
  const previousNodeIndex = selectedNodeIndex;
  selectedNodeIndex = nodeResult.index;
  const displayTime = formatTime(Number(second));

  currentTimeLabel.textContent = displayTime;
  playerMomentLabel.textContent = `${displayTime} ${node.title}`;
  currentNodeTitle.textContent = node.title;
  currentNodeType.textContent = node.type;
  currentNodeType.dataset.color = node.color;
  subtitleLine.textContent = node.subtitle;
  runAi.textContent = "暂停并读取机会地图";

  if (syncVideo) {
    setVideoTime(afterVideo, Number(second));
    setVideoTime(heroVideo, node.second);
  }

  document.querySelectorAll(".scene-button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.nodeIndex) === nodeResult.index);
  });

  document.querySelectorAll(".timeline-item").forEach((item) => {
    item.classList.toggle("selected", Number(item.dataset.nodeIndex) === nodeResult.index);
  });

  if (syncVideo || previousNodeIndex !== nodeResult.index) {
    renderDecisionSteps();
  }
}

function updateAdCard(node) {
  const category = node.adCategories[0] || "会员权益";
  const copy = adCopyByCategory[category] || adCopyByCategory["会员权益"];
  sceneMeta.textContent = `当前场景：${node.title} · 推荐广告：${category}`;
  couponBtn.textContent = copy.coupon;
  adStyles[0].title = copy.title;
  adStyles[0].copy = copy.copy;
  setAdStyle("gentle");
}

function resetPreprocess() {
  preprocessTimers.forEach((timer) => clearTimeout(timer));
  preprocessTimers = [];
  generateMap.textContent = "生成剧情广告机会地图";
  preprocessStatus.textContent = "视频上线前完成一次整集预分析，多用户复用结果。";
  inputList.querySelectorAll("span").forEach((item) => item.classList.remove("active"));
  outputList.querySelectorAll("span").forEach((item) => item.classList.remove("active"));
}

function runPreprocess() {
  preprocessTimers.forEach((timer) => clearTimeout(timer));
  preprocessTimers = [];
  generateMap.textContent = "分析中...";
  preprocessStatus.textContent = "正在读取字幕、关键帧、音频情绪和场景切分。";

  [...inputList.querySelectorAll("span")].forEach((item, index) => {
    preprocessTimers.push(setTimeout(() => item.classList.add("active"), index * 120));
  });

  [...outputList.querySelectorAll("span")].forEach((item, index) => {
    preprocessTimers.push(setTimeout(() => item.classList.add("active"), 620 + index * 140));
  });

  preprocessTimers.push(
    setTimeout(() => {
      generateMap.textContent = "已生成机会地图";
      preprocessStatus.textContent = "已标出广告禁入区、轻广告点和可匹配商品类型。";
    }, 1500),
  );
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showStage(button.dataset.stage));
});

stageTargets.forEach((button) => {
  button.addEventListener("click", () => showStage(button.dataset.stageTarget));
});

skipAd.addEventListener("click", () => {
  traditionalAd.style.display = "none";
  clearInterval(countdownTimer);
});

runAi.addEventListener("click", runAiDemo);
generateMap.addEventListener("click", runPreprocess);
shuffleStyle.addEventListener("click", cycleAdStyle);

document.querySelectorAll(".style-btn").forEach((button) => {
  button.addEventListener("click", () => {
    setAdStyle(button.dataset.style);
    couponResult.classList.add("hidden");
  });
});

couponBtn.addEventListener("click", () => {
  couponResult.textContent =
    "已领取优惠券。接下来 5 分钟减少广告打扰，并记录你更喜欢剧情彩蛋广告。";
  couponResult.classList.remove("hidden");
});

continueBtn.addEventListener("click", () => {
  couponResult.textContent = "已继续播放。本次彩蛋不阻塞观看，后续优先在自然间隙出现。";
  couponResult.classList.remove("hidden");
  eggCard.classList.add("hidden");
  eggCard.classList.remove("show");
  if (afterVideo) {
    userStartedPlayback = true;
    afterVideo.play().catch(() => {
      userStartedPlayback = false;
    });
    togglePlayback.textContent = "暂停片段";
  }
});

togglePlayback.addEventListener("click", () => {
  if (!afterVideo) return;

  if (afterVideo.paused) {
    userStartedPlayback = true;
    afterVideo.play().then(() => {
      togglePlayback.textContent = "暂停片段";
    }).catch(() => {
      userStartedPlayback = false;
    });
  } else {
    afterVideo.pause();
    togglePlayback.textContent = "播放片段";
  }
});

renderTimeline();
renderSceneButtons();
renderDecisionSteps();
updatePlayback(episodeAnalysis[selectedNodeIndex].second);
showStage("hero");

timelineScrubber.addEventListener("input", () => {
  const nearest = getNearestNode(Number(timelineScrubber.value));
  selectNode(nearest.index);
  resetAiDemo();
});

episodeVideos.forEach((video) => {
  video.addEventListener("play", () => {
    userStartedPlayback = true;
    pauseAllVideos(video);
  });

  video.addEventListener("pause", () => {
    if (video === afterVideo) {
      togglePlayback.textContent = "播放片段";
    }
  });
});

afterVideo?.addEventListener("timeupdate", () => {
  if (!userStartedPlayback) return;
});
