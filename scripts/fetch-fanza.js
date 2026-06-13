const https = require('https');
const fs = require('fs');
const path = require('path');

const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;

if (!API_ID || !AFFILIATE_ID) {
  console.error('DMM_API_ID and DMM_AFFILIATE_ID environment variables are required');
  process.exit(1);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function buildUrl(offset) {
  const params = new URLSearchParams({
    api_id: API_ID,
    affiliate_id: AFFILIATE_ID,
    site: 'FANZA',
    service: 'digital',
    floor: 'videoa',
    hits: '100',
    offset: String(offset),
    sort: 'date',
    output: 'json'
  });
  return `https://api.dmm.com/affiliate/v3/ItemList?${params}`;
}

function mapItem(item) {
  const info = item.iteminfo || {};
  const actress = (info.actress || []).map(a => a.name).join('、') || '不明';
  const maker = (info.maker || []).map(m => m.name).join('') || '不明';
  const tags = [
    ...(info.genre || []).map(g => g.name),
    ...(info.type || []).map(t => t.name),
  ].slice(0, 6);

  const thumb = item.imageURL?.large || item.imageURL?.list || '';
  const date = (item.date || '').split(' ')[0];

  let badge = null;
  const titleLower = (item.title || '').toLowerCase();
  if (titleLower.includes('vr')) badge = 'VR';
  else if (titleLower.includes('4k') || titleLower.includes('4K')) badge = '4K';
  else {
    const today = new Date();
    const itemDate = new Date(date);
    const diffDays = (today - itemDate) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) badge = 'NEW';
  }

  const cid = item.content_id || '';
  const productUrl = `https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=${cid}/`;
  const affiliateUrl = `https://al.dmm.co.jp/?lurl=${encodeURIComponent(productUrl)}&af_id=${AFFILIATE_ID}&ch=api`;

  return {
    id: cid,
    title: item.title || '',
    actress,
    maker,
    code: cid.toUpperCase(),
    date,
    tags,
    badge,
    thumb,
    url: affiliateUrl
  };
}

async function main() {
  const allItems = [];
  try {
    const data = await fetchJson(buildUrl(1));
    const items = data?.result?.items || [];
    items.forEach(item => allItems.push(mapItem(item)));
    console.log(`取得件数: ${allItems.length}`);
  } catch (e) {
    console.error('API取得エラー:', e.message);
    process.exit(1);
  }

  const output = `const worksData = ${JSON.stringify(allItems, null, 2)};\n`;
  const outPath = path.join(__dirname, '..', 'js', 'data.js');
  fs.writeFileSync(outPath, output, 'utf8');
  console.log(`js/data.js を更新しました（${allItems.length}件）`);
}

main();
