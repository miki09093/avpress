let currentTag = 'all';
let currentMaker = 'all';
let currentSort = 'date';
let currentPage = 1;
const PER_PAGE = 24;
let filteredWorks = [...worksData];

function init() {
  buildSidebarGenres();
  buildSidebarMakers();
  applyFiltersAndSort();
}

function buildSidebarGenres() {
  const tagMap = {};
  worksData.forEach(w => w.tags.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const sorted = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 12);
  document.getElementById('sidebarGenres').innerHTML = sorted.map(([tag]) =>
    `<a href="#" class="genre-tag" onclick="sidebarFilterTag('${tag}', event)">${tag}</a>`
  ).join('');
}

function buildSidebarMakers() {
  const makerMap = {};
  worksData.forEach(w => { makerMap[w.maker] = (makerMap[w.maker] || 0) + 1; });
  const sorted = Object.entries(makerMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  document.getElementById('sidebarMakers').innerHTML = sorted.map(([maker]) =>
    `<li><a href="#" onclick="sidebarFilterMaker('${maker.replace(/'/g, "\\'")}', event)">${maker}</a></li>`
  ).join('');
}

function sidebarFilterTag(tag, e) {
  e.preventDefault();
  currentTag = tag;
  currentMaker = 'all';
  currentPage = 1;
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#sidebarGenres .genre-tag').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  applyFiltersAndSort();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sidebarFilterMaker(maker, e) {
  e.preventDefault();
  currentMaker = maker;
  currentTag = 'all';
  currentPage = 1;
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#sidebarGenres .genre-tag').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#sidebarMakers a').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  applyFiltersAndSort();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sortWorks(key, e) {
  currentSort = key;
  currentPage = 1;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  applyFiltersAndSort();
}

function filterByTag(tag, e) {
  currentTag = tag;
  currentMaker = 'all';
  currentPage = 1;
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#sidebarGenres .genre-tag').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#sidebarMakers a').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  applyFiltersAndSort();
}

function filterWorks() {
  currentPage = 1;
  applyFiltersAndSort();
}

function applyFiltersAndSort() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();

  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setDate(limit.getDate() + 3);

  filteredWorks = worksData.filter(w => {
    const workDate = new Date(w.date);
    workDate.setHours(0, 0, 0, 0);
    const dateMatch = workDate <= limit;
    const tagMatch = currentTag === 'all' || w.tags.includes(currentTag);
    const makerMatch = currentMaker === 'all' || w.maker === currentMaker;
    const queryMatch = !query ||
      w.title.toLowerCase().includes(query) ||
      w.actress.toLowerCase().includes(query) ||
      w.maker.toLowerCase().includes(query) ||
      w.code.toLowerCase().includes(query);
    return dateMatch && tagMatch && makerMatch && queryMatch;
  });

  if (currentSort === 'date') {
    filteredWorks.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (currentSort === 'title') {
    filteredWorks.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
  }

  renderWorks();
  renderPagination();
}

function renderWorks() {
  const grid = document.getElementById('worksGrid');
  const start = (currentPage - 1) * PER_PAGE;
  const page = filteredWorks.slice(start, start + PER_PAGE);

  if (page.length === 0) {
    grid.innerHTML = '<div class="no-results">該当する作品が見つかりませんでした。</div>';
    return;
  }

  // 日付でグループ化（日付順ソート時のみ）
  if (currentSort === 'date') {
    const groups = {};
    page.forEach(w => {
      if (!groups[w.date]) groups[w.date] = [];
      groups[w.date].push(w);
    });

    grid.innerHTML = Object.entries(groups)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([date, works]) => `
        <div class="date-group">
          <div class="date-label">
            <span class="date-label-text">${formatDateJa(date)}</span>
            <span class="date-count">${works.length}作品</span>
          </div>
          <div class="date-grid">
            ${works.map(w => cardHtml(w)).join('')}
          </div>
        </div>
      `).join('');
  } else {
    grid.innerHTML = `<div class="date-grid">${page.map(w => cardHtml(w)).join('')}</div>`;
  }
}

function cardHtml(w) {
  const badgeClass = w.badge === 'NEW' ? 'new' : w.badge === 'VR' ? 'vr' : 'hd';
  return `
    <a class="work-card" href="${w.url}" target="_blank" rel="noopener noreferrer">
      <div class="work-thumb">
        <img src="${w.thumb}" alt="${w.title}" loading="lazy">
        ${w.badge ? `<span class="work-badge ${badgeClass}">${w.badge}</span>` : ''}
        <div class="work-overlay"><span>詳細を見る →</span></div>
      </div>
      <div class="work-info">
        <div class="work-title">${w.title}</div>
        <div class="work-actress">${w.actress}</div>
        <div class="work-meta">
          <span class="work-maker">${w.maker}</span>
          <span class="work-code">${w.code}</span>
        </div>
        <div class="work-tags">
          ${w.tags.slice(0, 3).map(t => `<span class="work-tag">${t}</span>`).join('')}
        </div>
      </div>
    </a>
  `;
}

function renderPagination() {
  const total = Math.ceil(filteredWorks.length / PER_PAGE);
  const pag = document.getElementById('pagination');

  if (total <= 1) { pag.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&#8249;</button>`;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - currentPage) <= 2) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 3) {
      html += `<span style="padding:0 4px;color:#999">…</span>`;
    }
  }

  html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === total ? 'disabled' : ''}>&#8250;</button>`;
  pag.innerHTML = html;
}

function goPage(n) {
  const total = Math.ceil(filteredWorks.length / PER_PAGE);
  if (n < 1 || n > total) return;
  currentPage = n;
  renderWorks();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatDateJa(dateStr) {
  const d = new Date(dateStr);
  const week = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${week[d.getDay()]}）`;
}

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') filterWorks();
});

init();
