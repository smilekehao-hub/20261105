// ==========================================
// 專案全域組態設定
// ==========================================
const CONFIG = {
  bgColor: '#f4f1de',
  primaryColor: '#04a777',
  dangerColor: '#f94144',
  textColor: '#2b2d42',
  cardBg: '#ffffff',
  // 您指定的 Google 試算表 CSV 題庫連結
  googleSheetCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-rK6gLJFQ_8BFC8eClxgbiQKgJ4nPVX7ogZe4s0oEjWgO0xuHEQ_OOrhDRIxJP1aL53LqGdrezVqA/pub?gid=1289024050&single=true&output=csv'
};

// 狀態變數
let gameState = 'LOADING'; // 'LOADING', 'COVER', 'QUIZ', 'FEEDBACK', 'RESULT'
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let loadedImages = {};
let feedbackStatus = { isCorrect: false, userChoice: -1 };
let confettiParticles = [];
let speechSynth = null;
let buttons = [];

// 預設 10 題行為主義備用題庫（網路離線或存取受阻時自動啟用）
const DEFAULT_QUESTIONS = [
  {
    question: "1. 提倡「古典制約 (Classical Conditioning)」理論，並以狗唾液實驗聞名的學者是誰？",
    options: ["A. 斯金納 (B.F. Skinner)", "B. 巴夫洛夫 (I. Pavlov)", "C. 班杜拉 (A. Bandura)", "D. 桑代克 (E. Thorndike)"],
    answer: 1,
    explanation: "巴夫洛夫透過響鈴與餵食的配對實驗，證實了刺激與反應間的古典制約學習。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Ivan_Pavlov_1913.jpg",
    imageSource: "來源：Wikimedia Commons (Public Domain)"
  },
  {
    question: "2. 在操作制約中，透過「移除不愉快的刺激」來增加某行為發生機率的做法稱為？",
    options: ["A. 正增強", "B. 負增強", "C. 正懲罰", "D. 負懲罰"],
    answer: 1,
    explanation: "負增強是指「移除厭惡刺激」（例如關掉刺耳的警報聲）以提升良好行為出現的機率。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/B.F._Skinner_at_Harvard_circa_1950.jpg",
    imageSource: "來源：Harvard University Archives (CC BY-SA 3.0)"
  },
  {
    question: "3. 提出「嘗試錯誤學習 (Trial and Error)」與「效果律 (Law of Effect)」的心理學家是？",
    options: ["A. 桑代克 (E. Thorndike)", "B. 華生 (J.B. Watson)", "C. 皮亞傑 (J. Piaget)", "D. 斯金納 (B.F. Skinner)"],
    answer: 0,
    explanation: "桑代克利用貓咪迷籠實驗，指出帶來滿意結果的反應更容易被保留（效果律）。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Edward_Thorndike.jpg",
    imageSource: "來源：Wikimedia Commons (Public Domain)"
  },
  {
    question: "4. 華生（J.B. Watson）進行著名的「小阿爾伯特實驗」，旨在證明何種心理現象？",
    options: ["A. 情緒可以透過古典制約被習得", "B. 觀察學習的作用", "C. 操作制約的代幣制效益", "D. 認知地圖的形成"],
    answer: 0,
    explanation: "華生成功透過巨大的金屬敲擊聲與白鼠配對，讓嬰兒對原本不害怕的白鼠產生制約恐懼。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/John_Broadus_Watson.jpg",
    imageSource: "來源：Wikimedia Commons (Public Domain)"
  },
  {
    question: "5. 關於行為主義的核心主張，下列何者「不正確」？",
    options: ["A. 強調可觀察的外顯行為", "B. 關注刺激與反應 (S-R) 的連結", "C. 重視內在潛意識與心智歷程分析", "D. 主張環境對行為塑造有極大影響"],
    answer: 2,
    explanation: "行為主義排除無法直接觀察的內在心智與潛意識分析（那是精神分析學派的範疇）。",
    imageUrl: "",
    imageSource: "來源：圖解心理學教材"
  },
  {
    question: "6. 斯金納（B.F. Skinner）提出的「斯金納箱 (Skinner Box)」主要用於研究何種現象？",
    options: ["A. 古典制約", "B. 操作制約", "C. 頓悟學習", "D. 印刻行為"],
    answer: 1,
    explanation: "斯金納箱透過小白鼠壓桿獲得食物獎勵，研究「強化」如何形塑行為反應。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/B.F._Skinner_at_Harvard_circa_1950.jpg",
    imageSource: "來源：Wikimedia Commons (CC BY-SA 3.0)"
  },
  {
    question: "7. 在學校中，老師宣布「只要全班認真上課，就取消這週末的額外作業」，這屬於哪一種強化策略？",
    options: ["A. 正增強", "B. 負增強", "C. 正懲罰", "D. 負懲罰"],
    answer: 1,
    explanation: "取消令人討厭的作業（移除厭惡刺激）以增加認真聽講行為，屬於負增強。",
    imageUrl: "",
    imageSource: "來源：課堂情境範例"
  },
  {
    question: "8. 若每次小孩發脾氣時父母就給予糖果，結果小孩發脾氣的頻率越來越高，糖果扮演何種角色？",
    options: ["A. 正增強物", "B. 負增強物", "C. 懲罰物", "D. 消弱刺激"],
    answer: 0,
    explanation: "糖果增加了發脾氣行為的出現頻率，因此扮演了「正增強物」的角色。",
    imageUrl: "",
    imageSource: "來源：生活情境範例"
  },
  {
    question: "9. 「代幣制度 (Token Economy)」是行為主義在臨床與教育上的成功應用，其理論基礎來自於？",
    options: ["A. 古典制約", "B. 操作制約", "C. 人本主義", "D. 格式塔心理學"],
    answer: 1,
    explanation: "代幣制度透過累積集點卡（次級增強物）換取獎賞，屬於操作制約的實踐。",
    imageUrl: "",
    imageSource: "來源：教育心理學範例"
  },
  {
    question: "10. 當一個已被制約的行為不再給予增強物時，該行為的發生頻率會漸漸降低至消失，這現象稱為？",
    options: ["A. 自發恢復", "B. 泛化", "C. 消弱 (Extinction)", "D. 分化"],
    answer: 2,
    explanation: "停止提供增強物導致反應逐漸減弱並消失的過程，稱為消弱現象。",
    imageUrl: "",
    imageSource: "來源：行為主義基本觀念"
  }
];

// ==========================================
// p5.js 初始化與生命週期
// ==========================================
function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  textFont('Noto Serif HK');

  // 初始化 Web Speech 語音引擎
  if ('speechSynthesis' in window) {
    speechSynth = window.speechSynthesis;
  }

  // 從 CSV 試算表異步讀取題目
  fetchSheetData();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ==========================================
// Fetch CSV 異步題庫連線
// ==========================================
async function fetchSheetData() {
  try {
    let response = await fetch(CONFIG.googleSheetCsvUrl);
    if (!response.ok) throw new Error("HTTP error " + response.status);
    let csvText = await response.text();
    
    parseCSV(csvText);
  } catch (err) {
    console.warn("無法即時連線至 Google 試算表，啟用備用題庫。", err);
    useFallbackQuestions();
  }
}

function parseCSV(text) {
  let lines = text.split(/\r\n|\n/);
  if (lines.length <= 1) {
    useFallbackQuestions();
    return;
  }

  let questions = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    let row = parseCSVLine(lines[i]);
    if (row.length < 3) continue;

    let qText = row[0] || `題目 ${i}`;
    let optA = row[1] || "";
    let optB = row[2] || "";
    let optC = row[3] || "";
    let optD = row[4] || "";
    let ansIdx = parseInt(row[5] || "0");
    let expl = row[6] || "尚無解說";
    let imgUrl = row[7] || "";
    let imgSrc = row[8] || "來源：網路素材";

    questions.push({
      question: qText,
      options: [optA, optB, optC, optD].filter(o => o.trim() !== ""),
      answer: isNaN(ansIdx) ? 0 : ansIdx,
      explanation: expl,
      imageUrl: imgUrl,
      imageSource: imgSrc
    });
  }

  if (questions.length > 0) {
    quizQuestions = questions;
    shuffleArray(quizQuestions);
    if (quizQuestions.length > 10) quizQuestions = quizQuestions.slice(0, 10);
    gameState = 'COVER';
  } else {
    useFallbackQuestions();
  }
}

function parseCSVLine(line) {
  let result = [];
  let insideQuote = false;
  let entry = '';
  for (let i = 0; i < line.length; i++) {
    let c = line[i];
    if (c === '"') {
      insideQuote = !insideQuote;
    } else if (c === ',' && !insideQuote) {
      result.push(entry.trim());
      entry = '';
    } else {
      entry += c;
    }
  }
  result.push(entry.trim());
  return result;
}

function useFallbackQuestions() {
  quizQuestions = [...DEFAULT_QUESTIONS];
  shuffleArray(quizQuestions);
  gameState = 'COVER';
}

// ==========================================
// 主繪製迴圈
// ==========================================
function draw() {
  background(CONFIG.bgColor);

  switch (gameState) {
    case 'LOADING':
      drawLoadingScreen();
      break;
    case 'COVER':
      drawCoverScreen();
      break;
    case 'QUIZ':
      drawQuizScreen();
      break;
    case 'FEEDBACK':
      drawFeedbackScreen();
      break;
    case 'RESULT':
      drawResultScreen();
      break;
  }

  // 繪製與更新正向彩帶粒子
  if (confettiParticles.length > 0) {
    updateAndDrawConfetti();
  }
}

// ==========================================
// 各階段畫面 (全螢幕響應式排版)
// ==========================================
function drawLoadingScreen() {
  textAlign(CENTER, CENTER);
  fill(CONFIG.primaryColor);
  textSize(24);
  text("正載入 Google 試算表題庫中...", width / 2, height / 2);
}

// 封面畫面 (Cover Screen)
function drawCoverScreen() {
  buttons = [];
  let cardW = min(width * 0.88, 620);
  let cardH = min(height * 0.75, 480);
  let cardX = (width - cardW) / 2;
  let cardY = (height - cardH) / 2;

  // 封面中央卡片
  fill(CONFIG.cardBg);
  stroke(CONFIG.primaryColor);
  strokeWeight(3);
  rect(cardX, cardY, cardW, cardH, 24);

  // 主標題
  textAlign(CENTER, TOP);
  fill(CONFIG.primaryColor);
  noStroke();
  textSize(min(width * 0.06, 36));
  textStyle(BOLD);
  text("行為主義心理學大挑戰", width / 2, cardY + 40);

  // S-R 反應核心標籤裝飾
  fill(CONFIG.bgColor);
  rect(width / 2 - 110, cardY + 95, 220, 36, 18);
  fill(CONFIG.textColor);
  textSize(15);
  text("【 S - R 刺激與反應測驗 】", width / 2, cardY + 104);

  // 特色簡介清單
  textAlign(LEFT, TOP);
  textSize(min(width * 0.03, 15));
  fill(80);
  textStyle(NORMAL);
  let infoY = cardY + 155;
  text("✨ 題庫特色與說明：", cardX + 45, infoY);
  text("1. 全套 10 題連線隨機出題，極速 3 分鐘複習。", cardX + 45, infoY + 30);
  text("2. 支援 Web Speech 題目與選項語音朗讀。", cardX + 45, infoY + 58);
  text("3. 包含動態多媒體圖片與 CC 授權出處標註。", cardX + 45, infoY + 86);
  text("4. 答對爆發彩帶正反饋，答錯觸發震動搖晃負反饋。", cardX + 45, infoY + 114);

  // 「開始測驗」按鈕
  let btnW = min(cardW * 0.6, 240);
  let btnH = 52;
  let btnX = width / 2 - btnW / 2;
  let btnY = cardY + cardH - 85;

  drawCustomButton(btnX, btnY, btnW, btnH, "🚀 開始測驗", CONFIG.primaryColor, () => {
    score = 0;
    currentQuestionIndex = 0;
    gameState = 'QUIZ';
    preloadCurrentImage();
    speakText(quizQuestions[currentQuestionIndex].question);
  });
}

function drawQuizScreen() {
  buttons = [];
  let q = quizQuestions[currentQuestionIndex];

  // 頂部進度條
  drawHeaderProgress();

  // 主卡片
  let cardW = min(width * 0.9, 820);
  let cardX = (width - cardW) / 2;
  let cardY = height * 0.12;

  fill(CONFIG.cardBg);
  stroke(CONFIG.primaryColor);
  strokeWeight(2);
  rect(cardX, cardY, cardW, height * 0.42, 16);

  // 題目內文
  fill(CONFIG.textColor);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(min(width * 0.032, 18));
  textStyle(BOLD);
  let textWidthLimit = (q.imageUrl && q.imageUrl.trim() !== "") ? cardW - 230 : cardW - 140;
  text(q.question, cardX + 25, cardY + 25, textWidthLimit, height * 0.22);
  textStyle(NORMAL);

  // 語音朗讀按鈕
  drawCustomButton(cardX + cardW - 110, cardY + 20, 90, 36, "🔊 朗讀", CONFIG.primaryColor, () => {
    let readText = q.question + "。選項一：" + (q.options[0]||"") + "。選項二：" + (q.options[1]||"");
    speakText(readText);
  });

  // 圖片與出處標註
  if (q.imageUrl && q.imageUrl.trim() !== "") {
    let imgW = 160;
    let imgH = 110;
    let imgX = cardX + cardW - imgW - 25;
    let imgY = cardY + 70;

    if (loadedImages[q.imageUrl]) {
      image(loadedImages[q.imageUrl], imgX, imgY, imgW, imgH);
    } else {
      fill(235);
      rect(imgX, imgY, imgW, imgH, 8);
      fill(120);
      textAlign(CENTER, CENTER);
      textSize(12);
      text("圖片載入中...", imgX + imgW / 2, imgY + imgH / 2);
    }

    fill(100);
    textAlign(RIGHT, TOP);
    textSize(min(width * 0.02, 11));
    text(q.imageSource || "來源：題庫資料", cardX + cardW - 25, imgY + imgH + 8);
  }

  // 下方四選一選項按鈕
  let startY = cardY + height * 0.45;
  let optionW = width < 650 ? cardW : (cardW - 20) / 2;
  let optionH = min(height * 0.08, 52);

  for (let i = 0; i < q.options.length; i++) {
    let x = width < 650 ? cardX : cardX + (i % 2) * (optionW + 20);
    let y = width < 650 ? startY + i * (optionH + 10) : startY + Math.floor(i / 2) * (optionH + 12);

    drawCustomButton(x, y, optionW, optionH, q.options[i], '#ffffff', () => {
      handleAnswer(i);
    }, CONFIG.textColor, CONFIG.primaryColor);
  }
}

function drawFeedbackScreen() {
  drawQuizScreen(); // 底層保持繪製

  fill(0, 140);
  rect(0, 0, width, height);

  let q = quizQuestions[currentQuestionIndex];
  let boxW = min(width * 0.88, 560);
  let boxH = 320;
  let boxX = (width - boxW) / 2;
  let boxY = (height - boxH) / 2;

  // 負反饋效果：震動動畫 (Shake Effect)
  if (!feedbackStatus.isCorrect) {
    boxX += sin(frameCount * 0.6) * 7;
  }

  fill(CONFIG.cardBg);
  stroke(feedbackStatus.isCorrect ? CONFIG.primaryColor : CONFIG.dangerColor);
  strokeWeight(4);
  rect(boxX, boxY, boxW, boxH, 20);

  // 反饋標題
  textAlign(CENTER, TOP);
  textSize(28);
  fill(feedbackStatus.isCorrect ? CONFIG.primaryColor : CONFIG.dangerColor);
  noStroke();
  textStyle(BOLD);
  text(feedbackStatus.isCorrect ? "🎉 答對了！(正反饋)" : "❌ 答錯了！(負反饋)", width / 2, boxY + 25);
  textStyle(NORMAL);

  // 解析說明
  fill(CONFIG.textColor);
  textAlign(LEFT, TOP);
  textSize(15);
  text(`正確答案：${q.options[q.answer] || ""}`, boxX + 30, boxY + 75, boxW - 60);

  textSize(14);
  fill(80);
  text(`解析：${q.explanation}`, boxX + 30, boxY + 115, boxW - 60, 110);

  // 下一題按鈕
  let btnW = 160;
  drawCustomButton(width / 2 - btnW / 2, boxY + boxH - 65, btnW, 45, "下一題 ➔", CONFIG.primaryColor, () => {
    stopSpeech();
    confettiParticles = [];
    currentQuestionIndex++;

    if (currentQuestionIndex < quizQuestions.length) {
      gameState = 'QUIZ';
      preloadCurrentImage();
      speakText(quizQuestions[currentQuestionIndex].question);
    } else {
      gameState = 'RESULT';
      speakText(`測驗完成！您在 10 題中答對了 ${score} 題。`);
    }
  });
}

function drawResultScreen() {
  buttons = [];
  textAlign(CENTER, CENTER);

  let finalScore = Math.round((score / quizQuestions.length) * 100);

  fill(CONFIG.primaryColor);
  textSize(min(width * 0.08, 46));
  textStyle(BOLD);
  text("測驗完成！", width / 2, height * 0.3);

  fill(CONFIG.textColor);
  textSize(min(width * 0.05, 30));
  text(`總對題數：${score} / ${quizQuestions.length} 題 (${finalScore}分)`, width / 2, height * 0.42);

  textSize(18);
  fill(100);
  textStyle(NORMAL);
  let comment = finalScore >= 80 ? "太棒了！你完美掌握了行為主義心理學！" : "再接再厲，多挑戰幾次會更熟練喔！";
  text(comment, width / 2, height * 0.52);

  // 再玩一次按鈕
  let btnW = 200;
  drawCustomButton(width / 2 - btnW / 2, height * 0.62, btnW, 50, "🔄 再玩一次", CONFIG.primaryColor, () => {
    shuffleArray(quizQuestions);
    score = 0;
    currentQuestionIndex = 0;
    gameState = 'QUIZ';
    preloadCurrentImage();
    speakText(quizQuestions[currentQuestionIndex].question);
  });
}

// ==========================================
// 輔助視覺與動畫元件
// ==========================================
function drawHeaderProgress() {
  fill(CONFIG.textColor);
  textAlign(LEFT, CENTER);
  textSize(16);
  text(`第 ${currentQuestionIndex + 1} / ${quizQuestions.length} 題`, width * 0.05, 30);

  let barX = width * 0.28;
  let barW = width * 0.62;
  fill(220);
  rect(barX, 22, barW, 14, 7);

  fill(CONFIG.primaryColor);
  let progress = ((currentQuestionIndex + 1) / quizQuestions.length) * barW;
  rect(barX, 22, progress, 14, 7);
}

function createConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 80; i++) {
    confettiParticles.push({
      x: random(width),
      y: random(-height, 0),
      size: random(6, 12),
      color: [random(100, 255), random(100, 255), random(100, 255)],
      speedY: random(2, 5),
      angle: random(TWO_PI),
      alpha: 255
    });
  }
}

function updateAndDrawConfetti() {
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    let p = confettiParticles[i];
    p.y += p.speedY;
    p.x += sin(p.angle);
    p.angle += 0.05;
    p.alpha -= 1.5;

    fill(p.color[0], p.color[1], p.color[2], p.alpha);
    noStroke();
    ellipse(p.x, p.y, p.size);

    if (p.alpha <= 0 || p.y > height) {
      confettiParticles.splice(i, 1);
    }
  }
}

function drawCustomButton(x, y, w, h, label, bgHex, onClick, textHex = '#ffffff', strokeHex = null) {
  let isHover = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;

  buttons.push({ x, y, w, h, onClick });

  fill(isHover ? lerpColor(color(bgHex), color('#000000'), 0.1) : color(bgHex));
  if (strokeHex) {
    stroke(strokeHex);
    strokeWeight(1.5);
  } else {
    noStroke();
  }
  rect(x, y, w, h, 10);

  fill(textHex);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(min(w * 0.14, 16));
  textStyle(BOLD);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

// ==========================================
// 事件處理與 TTS 語音
// ==========================================
function mousePressed() {
  for (let btn of buttons) {
    if (mouseX >= btn.x && mouseX <= btn.x + btn.w && mouseY >= btn.y && mouseY <= btn.y + btn.h) {
      btn.onClick();
      break;
    }
  }
}

function handleAnswer(selectedIndex) {
  stopSpeech();
  let q = quizQuestions[currentQuestionIndex];
  let isCorrect = (selectedIndex === q.answer);

  if (isCorrect) {
    score++;
    createConfetti(); // 正反饋彩帶爆發
  }

  feedbackStatus = { isCorrect, userChoice: selectedIndex };
  gameState = 'FEEDBACK';

  let voiceText = isCorrect ? "回答正確！" : `回答錯誤！正確答案是：${q.options[q.answer]}`;
  speakText(voiceText + "。" + q.explanation);
}

function speakText(txt) {
  if (!speechSynth) return;
  stopSpeech();

  let utterance = new SpeechSynthesisUtterance(txt);
  utterance.lang = 'zh-TW';
  utterance.rate = 1.0;
  speechSynth.speak(utterance);
}

function stopSpeech() {
  if (speechSynth && speechSynth.speaking) {
    speechSynth.cancel();
  }
}

function preloadCurrentImage() {
  let url = quizQuestions[currentQuestionIndex].imageUrl;
  if (url && url.trim() !== "" && !loadedImages[url]) {
    loadImage(url, img => {
      loadedImages[url] = img;
    }, () => {
      console.warn("無法讀取圖片：", url);
    });
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}