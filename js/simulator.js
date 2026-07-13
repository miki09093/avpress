// ============================================================
// 適正年収シミュレーター
// 参考データ: doda「平均年収ランキング2025」（20代平均365万円、
// 年齢別・職種別・業種別データ）をもとに補正係数を設計
// ============================================================

// 年齢別の基準年収（万円）
const AGE_BASE = {
  20: 275, 21: 283, 22: 291, 23: 302, 24: 316, 25: 330,
  26: 345, 27: 360, 28: 375, 29: 390, 30: 407, 31: 414,
  32: 422, 33: 430, 34: 438, 35: 445
};

// 職種係数（20代の職種別平均年収をもとに設計）
const JOB_COEF = {
  '営業':             1.05,
  '企画・管理':       1.07,
  '事務・アシスタント': 0.85,
  'ITエンジニア':     1.04,
  '機械・電気系技術職': 1.03,
  '金融系専門職':     1.12,
  '販売・サービス':   0.82,
  'クリエイティブ':   0.90,
  'その他':           0.95
};

// 業種係数（20代の業種別平均年収をもとに設計）
const IND_COEF = {
  'IT・通信':       1.04,
  'メーカー':       1.01,
  '商社':           1.04,
  '金融':           1.12,
  '建設・不動産':   1.01,
  'インフラ・エネルギー': 1.07,
  '小売・外食':     0.85,
  'サービス':       0.90,
  '医療・福祉':     0.88,
  'その他':         0.95
};

// 学歴補正
const EDU_COEF = {
  '大学院卒': 1.08,
  '大学卒':   1.00,
  '短大・専門卒': 0.94,
  '高校卒':   0.88
};

// 経験年数補正
const EXP_COEF = {
  '1年未満':  0.95,
  '1〜3年':   1.00,
  '3〜5年':   1.04,
  '5年以上':  1.08
};

// ============================================================
// 転職エージェントデータ
// TODO: A8.net等のASP承認後、url をアフィリエイトリンクに差し替える
// ============================================================
const AGENTS = {
  neo: {
    name: '第二新卒エージェントneo',
    tags: ['第二新卒・既卒特化', '未経験OK', 'フリーターも可'],
    desc: '既卒・フリーター・第二新卒の就職に特化。学歴や職歴に自信がなくても、専任アドバイザーが書類づくりから面接対策まで手厚くサポートしてくれます。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B7WD9+80RC9E+3Y6M+5YZ77',
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B7WD9+80RC9E+3Y6M+601S1',
      img: 'https://www25.a8.net/svt/bgt?aid=260709021485&wid=005&eno=01&mid=s00000018427001008000&mc=1',
      px: 'https://www12.a8.net/0.gif?a8mat=4B7WD9+80RC9E+3Y6M+601S1',
      w: 300, h: 250
    }
  },
  onecareer: {
    name: 'ワンキャリア転職',
    tags: ['社員の口コミが豊富', '企業研究に強い', '20代に人気'],
    desc: '実際に働く社員の口コミや選考体験談を見ながら応募できるサービス。入社後の「思っていたのと違う」を防ぎたい人に向いています。',
    catch: '“中の人”の声を聞いて、ミスマッチのない転職を',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B7WD9+ZQ45U+5O7E+BYT9F',
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B7WD9+ZQ45U+5O7E+BXIYP',
      img: 'https://www27.a8.net/svt/bgt?aid=260709021060&wid=005&eno=01&mid=s00000026465002004000&mc=1',
      px: 'https://www14.a8.net/0.gif?a8mat=4B7WD9+ZQ45U+5O7E+BXIYP',
      w: 100, h: 60
    }
  },
  yumecari: {
    name: 'ユメキャリAgent',
    tags: ['大手人事が運営', '面接対策に強い', '選考通過を後押し'],
    desc: '大手企業の現役面接官が運営する転職エージェント。採用側の視点で、面接で評価されるコツを直接アドバイスしてもらえます。',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B7WD9+2NUW9E+5PWS+BWVTE',
    banner: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B7WD9+2NUW9E+5PWS+BYLJL',
      img: 'https://www26.a8.net/svt/bgt?aid=260709021161&wid=005&eno=01&mid=s00000026686002009000&mc=1',
      px: 'https://www14.a8.net/0.gif?a8mat=4B7WD9+2NUW9E+5PWS+BYLJL',
      w: 336, h: 280
    }
  }
};

// ============================================================
// 質問定義
// ============================================================
const QUESTIONS = [
  {
    key: 'age',
    q: 'あなたの年齢は？',
    type: 'select-grid',
    options: ['20歳', '21歳', '22歳', '23歳', '24歳', '25歳', '26歳', '27歳', '28歳', '29歳', '30〜32歳', '33〜35歳']
  },
  {
    key: 'gender',
    q: '性別を教えてください',
    note: '統計データの補正に使用します',
    type: 'select',
    options: ['男性', '女性', '回答しない']
  },
  {
    key: 'edu',
    q: '最終学歴は？',
    type: 'select',
    options: ['大学院卒', '大学卒', '短大・専門卒', '高校卒']
  },
  {
    key: 'job',
    q: '現在（直近）の職種は？',
    type: 'select-grid',
    options: ['営業', '企画・管理', '事務・アシスタント', 'ITエンジニア', '機械・電気系技術職', '金融系専門職', '販売・サービス', 'クリエイティブ', 'その他']
  },
  {
    key: 'industry',
    q: '現在（直近）の業種は？',
    type: 'select-grid',
    options: ['IT・通信', 'メーカー', '商社', '金融', '建設・不動産', 'インフラ・エネルギー', '小売・外食', 'サービス', '医療・福祉', 'その他']
  },
  {
    key: 'exp',
    q: '社会人経験は何年目ですか？',
    type: 'select',
    options: ['1年未満', '1〜3年', '3〜5年', '5年以上']
  },
  {
    key: 'mgmt',
    q: 'マネジメント経験（後輩指導・リーダー含む）はありますか？',
    type: 'select',
    options: ['ある', 'ない']
  },
  {
    key: 'salary',
    q: '現在の年収を教えてください',
    note: 'おおよそでOKです（賞与込み・額面）',
    type: 'number',
    placeholder: '例：320',
    unit: '万円'
  },
  {
    key: 'goal',
    q: '転職で一番かなえたいことは？',
    type: 'select',
    options: ['年収を上げたい', '未経験の仕事に挑戦したい', 'ITエンジニアになりたい', 'ワークライフバランスを改善したい', 'まずはじっくり相談したい']
  }
];

// ============================================================
// ウィザードUI
// ============================================================
let step = 0;
const answers = {};

const simBody = document.getElementById('simBody');
const progressBar = document.getElementById('simProgressBar');
const progressLabel = document.getElementById('simProgressLabel');

function renderStep() {
  const total = QUESTIONS.length;

  if (step >= total) {
    renderAnalyzing();
    return;
  }

  const q = QUESTIONS[step];
  progressBar.style.width = `${(step / total) * 100}%`;
  progressLabel.textContent = `質問 ${step + 1} / ${total}`;

  let html = `<div class="sim-question">${q.q}${q.note ? `<small>${q.note}</small>` : ''}</div>`;

  if (q.type === 'select' || q.type === 'select-grid') {
    html += `<div class="sim-options ${q.type === 'select-grid' ? 'grid-2' : ''}">`;
    html += q.options.map(opt =>
      `<button class="sim-opt" onclick="selectAnswer('${q.key}', '${opt}')">${opt}</button>`
    ).join('');
    html += '</div>';
  } else if (q.type === 'number') {
    html += `
      <div class="sim-input-row">
        <input type="number" class="sim-input" id="simNumInput" placeholder="${q.placeholder}" min="100" max="2000" inputmode="numeric">
        <span class="sim-input-unit">${q.unit}</span>
      </div>
      <button class="sim-next-btn" onclick="submitNumber('${q.key}')">次へ</button>
    `;
  }

  if (step > 0) {
    html += `<button class="sim-back" onclick="goBack()">← 前の質問に戻る</button>`;
  }

  simBody.innerHTML = html;

  const numInput = document.getElementById('simNumInput');
  if (numInput) {
    numInput.focus();
    numInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitNumber(q.key);
    });
  }
}

function selectAnswer(key, value) {
  answers[key] = value;
  step++;
  renderStep();
}

function submitNumber(key) {
  const input = document.getElementById('simNumInput');
  const val = parseInt(input.value, 10);
  if (!val || val < 100 || val > 2000) {
    input.style.borderColor = '#dc2626';
    input.placeholder = '100〜2000の数字を入力してください';
    input.value = '';
    return;
  }
  answers[key] = val;
  step++;
  renderStep();
}

function goBack() {
  step = Math.max(0, step - 1);
  renderStep();
}

function restart() {
  step = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  renderStep();
  document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
// 計算ロジック
// ============================================================
function parseAge(ageStr) {
  if (ageStr === '30〜32歳') return 31;
  if (ageStr === '33〜35歳') return 34;
  return parseInt(ageStr, 10);
}

function calcSalary() {
  const age = parseAge(answers.age);
  let base = AGE_BASE[Math.min(Math.max(age, 20), 35)];

  base *= JOB_COEF[answers.job] || 1;
  base *= IND_COEF[answers.industry] || 1;
  base *= EDU_COEF[answers.edu] || 1;
  base *= EXP_COEF[answers.exp] || 1;

  if (answers.mgmt === 'ある') base *= 1.08;
  if (answers.gender === '男性') base *= 1.03;
  if (answers.gender === '女性') base *= 0.97;

  // 統計ベースの推定値
  const stat = Math.round(base);

  // 「転職で狙える適正年収」は必ず現年収を上回るように設計。
  // 統計値と現年収の高いほうを基準に、転職で狙える上振れ分（+12%）を加える。
  const current = answers.salary || stat;
  const baseline = Math.max(stat, current);
  const center = Math.round(baseline * 1.12);

  return {
    stat,                                  // ランク判定用の実力値
    center,                                // 転職で狙える適正年収（常に現年収より上）
    low: Math.max(Math.round(baseline * 1.04), current + 5),
    high: Math.round(baseline * 1.20),
    future5: Math.round(center * futureRatio(age, 5)),
    future10: Math.round(center * futureRatio(age, 10))
  };
}

function futureRatio(age, years) {
  const now = AGE_BASE[Math.min(Math.max(age, 20), 35)];
  const to = age + years;
  // 35歳以降は緩やかに +1.2%/年 で伸びると仮定
  if (to <= 35) return AGE_BASE[to] / now;
  const at35 = AGE_BASE[35] / now;
  return at35 * Math.pow(1.012, to - 35);
}

// ============================================================
// エージェント出し分け
// ============================================================
function pickAgents() {
  const goal = answers.goal;
  const isJunior = answers.exp === '1年未満' || answers.exp === '1〜3年';

  // 未経験・キャリアに自信がない層 → 第二新卒neoを先頭に
  if (goal === '未経験の仕事に挑戦したい' || goal === 'ITエンジニアになりたい') {
    return ['neo', 'onecareer', 'yumecari'];
  }
  // 年収アップ志向 → 面接に強いユメキャリを先頭に
  if (goal === '年収を上げたい') {
    return ['yumecari', 'onecareer', 'neo'];
  }
  // 働き方改善・企業研究したい層 → 口コミのワンキャリアを先頭に
  if (goal === 'ワークライフバランスを改善したい') {
    return ['onecareer', 'yumecari', 'neo'];
  }
  // じっくり相談したい
  if (isJunior) return ['neo', 'onecareer', 'yumecari'];
  return ['onecareer', 'yumecari', 'neo'];
}

function pickReason(agentKey) {
  const reasons = {
    neo: '経歴や学歴に関係なく、20代の未経験就職を親身にサポートしてくれます',
    onecareer: '社員の口コミで企業のリアルを知れるので、入社後のミスマッチを防げます',
    yumecari: '大手の現役面接官が運営。選考通過のコツを直接教えてもらえます'
  };
  return reasons[agentKey] || '';
}

// ============================================================
// 同年代内での位置（20代の年収分布データをもとに算出）
// 分布: 300万未満25.2% / 300-400万38.6% / 400-500万22.0% / 500万以上14.2%
// ============================================================
function percentileTop(salary) {
  const points = [[150, 0], [300, 25.2], [400, 63.8], [500, 85.8], [700, 99]];
  let cum;
  if (salary <= points[0][0]) cum = 0;
  else if (salary >= points[points.length - 1][0]) cum = 99;
  else {
    for (let i = 1; i < points.length; i++) {
      if (salary <= points[i][0]) {
        const [x1, y1] = points[i - 1];
        const [x2, y2] = points[i];
        cum = y1 + (y2 - y1) * (salary - x1) / (x2 - x1);
        break;
      }
    }
  }
  return Math.max(1, Math.round(100 - cum));
}

function rankOf(top) {
  if (top <= 10) return { rank: 'S', label: 'トップクラス', cls: 'rank-s' };
  if (top <= 25) return { rank: 'A', label: '上位層', cls: 'rank-a' };
  if (top <= 50) return { rank: 'B', label: '平均以上', cls: 'rank-b' };
  return { rank: 'C', label: '伸びしろ大', cls: 'rank-c' };
}

// ============================================================
// 分析中アニメーション
// ============================================================
function renderAnalyzing() {
  progressBar.style.width = '100%';
  progressLabel.textContent = '分析中...';

  const messages = [
    '回答を集計しています...',
    '同年代の年収データと比較しています...',
    'あなたに合う転職サービスを選定しています...'
  ];

  simBody.innerHTML = `
    <div class="sim-analyzing">
      <div class="sim-spinner"></div>
      <div class="sim-analyzing-msg" id="analyzingMsg">${messages[0]}</div>
    </div>
  `;

  let i = 0;
  const timer = setInterval(() => {
    i++;
    if (i < messages.length) {
      const el = document.getElementById('analyzingMsg');
      if (el) el.textContent = messages[i];
    }
  }, 600);

  setTimeout(() => {
    clearInterval(timer);
    renderResult();
  }, 1900);
}

// ============================================================
// 結果表示
// ============================================================
function renderResult() {
  progressBar.style.width = '100%';
  progressLabel.textContent = '診断完了！';

  const r = calcSalary();
  const current = answers.salary;
  const gap = Math.max(r.center - current, 0);   // 常にプラス（＝上げられる余地）
  const loss5 = gap * 5;                          // 5年間の機会損失
  const top = percentileTop(r.stat);             // ランクは実力値ベース
  const rk = rankOf(top);

  const gapHtml = `
    <div class="result-gap upside">
      今の年収より <strong>あと約${gap}万円</strong> 上げられる可能性があります。
    </div>
    <div class="result-loss">
      <div class="result-loss-label">この差を <b>5年間</b> 放置すると…</div>
      <div class="result-loss-value">約${loss5}万円 の“もらい損ね”</div>
      <div class="result-loss-note">※ 同じ仕事内容でも、業界・企業を変えるだけで年収が上がるケースは珍しくありません。</div>
    </div>`;

  const whyHtml = `
    <div class="result-why">
      <div class="result-why-title">なぜ、20代のうちに動くべき？</div>
      <ul class="result-why-list">
        <li><b>20代は「ポテンシャル採用」が使える唯一の時期。</b>未経験の職種・業界にも挑戦しやすく、年収を大きく上げるチャンスがあります。</li>
        <li><b>年収は「頑張り」より「場所」で決まる。</b>同じスキルでも、評価してくれる会社に移るだけで年収が変わります。</li>
        <li><b>登録・相談はすべて無料。</b>今すぐ転職しなくてもOK。まずは「自分にどんな求人があるか」を知るだけでも一歩前進です。</li>
      </ul>
    </div>`;

  const agentKeys = pickAgents();
  const agentsHtml = agentKeys.map((key, i) => {
    const a = AGENTS[key];
    const b = a.banner;
    let bannerHtml = '';
    if (b && b.w >= 200) {
      // 大きめの画像バナーはそのまま表示
      bannerHtml = `
        <div class="agent-banner">
          <a href="${b.href}" target="_blank" rel="noopener noreferrer nofollow"><img src="${b.img}" width="${b.w}" height="${b.h}" alt="${a.name}" loading="lazy"></a>
          <img src="${b.px}" width="1" height="1" alt="" class="a8-px">
        </div>`;
    } else if (b) {
      // 小さい画像しかない場合は、サイズを揃えたテキストバナーに切り替え
      bannerHtml = `
        <a class="agent-textbanner" href="${b.href}" target="_blank" rel="noopener noreferrer nofollow">
          <span class="atb-name">${a.name}</span>
          <span class="atb-catch">${a.catch || ''}</span>
          <span class="atb-cta">公式サイトを見る →</span>
        </a>
        <img src="${b.px}" width="1" height="1" alt="" class="a8-px">`;
    }
    return `
      <div class="agent-card">
        <span class="agent-rank">おすすめ No.${i + 1}</span>
        <div class="agent-name">${a.name}</div>
        <div>${a.tags.map(t => `<span class="agent-tag">${t}</span>`).join('')}</div>
        <div class="agent-desc">${a.desc}</div>
        <div class="agent-reason"><strong>あなたに合う理由</strong>${pickReason(key)}</div>
        ${bannerHtml}
        <a href="${a.url}" class="agent-btn" target="_blank" rel="noopener noreferrer nofollow">公式サイトで無料登録 →</a>
      </div>
    `;
  }).join('');

  const shareText = encodeURIComponent(`私の市場価値診断の結果：ランク${rk.rank}（同年代の上位${top}%）💰\n適正年収は ${r.low}〜${r.high}万円 でした！\nあなたの市場価値も3分でチェック👇 #適正年収診断`);
  const shareUrl = encodeURIComponent('https://avpress.net/');

  const chartMax = Math.max(current, r.center, r.future5, r.future10) * 1.1;
  const bar = (label, value, cls) => `
    <div class="chart-row">
      <div class="chart-label">${label}</div>
      <div class="chart-track">
        <div class="chart-bar ${cls}" style="width:0%" data-width="${Math.round(value / chartMax * 100)}%">
          <span>${value}万円</span>
        </div>
      </div>
    </div>
  `;

  simBody.innerHTML = `
    <div class="result-rank-wrap">
      <div class="result-rank-badge ${rk.cls}">${rk.rank}</div>
      <div class="result-rank-text">あなたの市場価値ランクは <strong>${rk.rank}（${rk.label}）</strong><br><small>同世代の20代の中で、上位 ${top}% に位置しています。</small></div>
    </div>
    <div class="result-label">あなたが転職で狙える適正年収</div>
    <div class="result-salary">${r.center}<small>万円</small></div>
    <div class="result-range">狙える年収の範囲：${r.low}〜${r.high}万円</div>
    ${gapHtml}
    <div class="result-chart-title">転職で狙える年収の推移イメージ</div>
    <div class="result-chart">
      ${bar('今の年収', current, 'bar-current')}
      ${bar('狙える適正年収', r.center, 'bar-fit')}
      ${bar('5年後', r.future5, 'bar-future')}
      ${bar('10年後', r.future10, 'bar-future')}
    </div>
    ${whyHtml}
    <div class="result-agents-title">あなたにおすすめの転職サービス</div>
    <div class="result-agents-sub">下記はすべて無料で相談できます。まずは気になる1社に登録して、あなた向けの求人を見てみましょう。</div>
    ${agentsHtml}
    <div class="result-share">
      <div class="share-label">診断結果をシェアする</div>
      <a class="share-x-btn" href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" rel="noopener noreferrer">𝕏 で結果をポストする</a>
    </div>
    <button class="sim-restart-btn" onclick="restart()">最初から診断しなおす</button>
  `;

  setTimeout(() => {
    document.querySelectorAll('.chart-bar').forEach(b => { b.style.width = b.dataset.width; });
  }, 100);

  document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' });
}

renderStep();
