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
  mynavi20s: {
    name: 'マイナビジョブ20\'s',
    tags: ['20代専門', '第二新卒に強い', '適性診断あり'],
    desc: '20代・第二新卒専門の転職エージェント。求人の約80%が未経験OKで、初めての転職でも安心。世界規模で使われる適性診断で自己分析からサポートしてくれます。',
    url: '#'
  },
  hataractive: {
    name: 'ハタラクティブ',
    tags: ['未経験OK', 'フリーター・既卒も可', '内定率80%超'],
    desc: '20代の未経験転職に特化。学歴・経歴に自信がなくても利用でき、書類通過率・内定率の高さに定評があります。最短2週間での内定実績も。',
    url: '#'
  },
  uzuz: {
    name: 'UZUZ（ウズキャリ）',
    tags: ['第二新卒・既卒特化', '手厚いサポート', 'IT系にも強い'],
    desc: '一人あたり平均12時間以上の丁寧なサポートが特徴。キャリアカウンセラー自身が元第二新卒なので、悩みに寄り添った提案をしてくれます。',
    url: '#'
  },
  recruit: {
    name: 'リクルートエージェント',
    tags: ['求人数No.1クラス', '全業界対応', '交渉力に定評'],
    desc: '業界最大級の求人数を誇る定番エージェント。非公開求人も多く、選択肢を最大限に広げたい人におすすめ。年収交渉の実績も豊富です。',
    url: '#'
  },
  doda: {
    name: 'doda',
    tags: ['求人数トップクラス', 'サイト＆エージェント一体型', '診断ツール充実'],
    desc: '自分で求人を探しながらエージェントのサポートも受けられる万能型。年収査定などの診断ツールも充実しており、情報収集段階から使えます。',
    url: '#'
  },
  bizreach: {
    name: 'ビズリーチ',
    tags: ['ハイクラス向け', 'スカウト型', '年収600万円以上多数'],
    desc: '職務経歴書を登録すると企業やヘッドハンターからスカウトが届く、ハイクラス向け転職サービス。いまの市場価値を確かめたい20代後半に。',
    url: '#'
  },
  levtech: {
    name: 'レバテックキャリア',
    tags: ['ITエンジニア特化', '年収アップ率高', '技術理解のある担当者'],
    desc: 'ITエンジニア専門の転職エージェント。技術に詳しいアドバイザーがスキルを正しく評価してくれるので、エンジニアの年収アップ転職に最適です。',
    url: '#'
  },
  workport: {
    name: 'ワークポート',
    tags: ['IT・Web業界に強い', '未経験からITも', '対応スピードが早い'],
    desc: 'IT・Web業界の求人が豊富な総合エージェント。未経験からITエンジニアを目指す人向けの無料エンジニアスクールも運営しています。',
    url: '#'
  },
  mynaviagent: {
    name: 'マイナビエージェント',
    tags: ['20〜30代に強い', '中小優良企業も豊富', 'サポート丁寧'],
    desc: '20〜30代の転職サポートに定評のある総合エージェント。大手だけでなく中小の優良企業の求人も多く、じっくり相談しながら進めたい人向き。',
    url: '#'
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

  const center = Math.round(base);
  return {
    center,
    low: Math.round(center * 0.92),
    high: Math.round(center * 1.08),
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
  const age = parseAge(answers.age);
  const goal = answers.goal;
  const isYoung = age <= 25;
  const isJunior = answers.exp === '1年未満' || answers.exp === '1〜3年';

  if (goal === 'ITエンジニアになりたい') {
    if (answers.job === 'ITエンジニア') return ['levtech', 'workport', 'doda'];
    return ['workport', 'uzuz', 'hataractive'];
  }
  if (goal === '未経験の仕事に挑戦したい') {
    return isYoung ? ['mynavi20s', 'hataractive', 'uzuz'] : ['doda', 'workport', 'mynaviagent'];
  }
  if (goal === '年収を上げたい') {
    if (answers.salary >= 450) return ['bizreach', 'recruit', 'doda'];
    if (answers.job === 'ITエンジニア') return ['levtech', 'recruit', 'doda'];
    return ['recruit', 'doda', 'mynaviagent'];
  }
  if (goal === 'ワークライフバランスを改善したい') {
    return isYoung ? ['mynavi20s', 'doda', 'recruit'] : ['doda', 'recruit', 'mynaviagent'];
  }
  // じっくり相談したい
  return isJunior ? ['uzuz', 'mynavi20s', 'mynaviagent'] : ['mynaviagent', 'doda', 'recruit'];
}

function pickReason(agentKey) {
  const goal = answers.goal;
  const reasons = {
    mynavi20s: '20代専門なので、あなたの年代の転職事情を熟知しています',
    hataractive: '経歴に関係なく未経験からの転職成功実績が豊富です',
    uzuz: '経験の浅い20代へのサポートが手厚く、初めての転職でも安心です',
    recruit: '求人数が多く、年収交渉にも強いため選択肢を広げられます',
    doda: '求人検索と診断ツールが充実し、情報収集から転職まで一気通貫で使えます',
    bizreach: 'あなたの年収帯ならスカウトで市場価値を確かめる価値があります',
    levtech: 'エンジニアのスキルを正当に評価してくれるので年収アップが狙えます',
    workport: '未経験からIT業界への転職支援に強みがあります',
    mynaviagent: '20〜30代の転職サポートが丁寧で、じっくり相談できます'
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
  const gap = r.center - current;
  const top = percentileTop(r.center);
  const rk = rankOf(top);

  let gapHtml;
  if (gap >= 30) {
    gapHtml = `<div class="result-gap negative">現在の年収より <strong>${gap}万円</strong> 高い可能性！<br>あなたの市場価値は現職で正しく評価されていないかもしれません。</div>`;
  } else if (gap <= -30) {
    gapHtml = `<div class="result-gap positive">現在の年収は適正レンジより <strong>${Math.abs(gap)}万円</strong> 高めです。<br>好条件の今こそ、キャリアの選択肢を把握しておきましょう。</div>`;
  } else {
    gapHtml = `<div class="result-gap positive">現在の年収はほぼ適正レンジ内です。<br>次のステージを目指すなら、キャリアアップ転職も視野に入ります。</div>`;
  }

  const agentKeys = pickAgents();
  const agentsHtml = agentKeys.map((key, i) => {
    const a = AGENTS[key];
    return `
      <div class="agent-card">
        <span class="agent-rank">おすすめ No.${i + 1}</span>
        <div class="agent-name">${a.name}</div>
        <div>${a.tags.map(t => `<span class="agent-tag">${t}</span>`).join('')}</div>
        <div class="agent-desc">${a.desc}</div>
        <div class="agent-reason"><strong>おすすめ理由：</strong>${pickReason(key)}</div>
        <a href="${a.url}" class="agent-btn" target="_blank" rel="noopener noreferrer nofollow">無料で登録する →</a>
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
      <div class="result-rank-text">市場価値ランク：<strong>${rk.label}</strong><br><small>同年代（20代）の上位 ${top}% に位置しています</small></div>
    </div>
    <div class="result-label">YOUR MARKET VALUE</div>
    <div class="result-salary">${r.center}<small>万円</small></div>
    <div class="result-range">適正年収レンジ：${r.low}万円 〜 ${r.high}万円</div>
    ${gapHtml}
    <div class="result-chart">
      ${bar('現在の年収', current, 'bar-current')}
      ${bar('適正年収', r.center, 'bar-fit')}
      ${bar('5年後の想定', r.future5, 'bar-future')}
      ${bar('10年後の想定', r.future10, 'bar-future')}
    </div>
    <div class="result-agents-title">あなたにおすすめの転職サービス</div>
    <div class="result-agents-sub">回答内容をもとに、相性のよい3社を選びました（すべて無料）</div>
    ${agentsHtml}
    <div class="result-share">
      <div class="share-label">結果をシェアする</div>
      <a class="share-x-btn" href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" rel="noopener noreferrer">𝕏 で結果をポストする</a>
    </div>
    <button class="sim-restart-btn" onclick="restart()">もう一度診断する</button>
  `;

  setTimeout(() => {
    document.querySelectorAll('.chart-bar').forEach(b => { b.style.width = b.dataset.width; });
  }, 100);

  document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' });
}

renderStep();
