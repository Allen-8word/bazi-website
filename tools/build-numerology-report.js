// N3 生成器：解析 生命靈數報告_審核版v1.md → data/numerology-report.js
// 單一事實來源：內容修改請改 MD 後重新執行本腳本，勿手動編輯輸出檔。
const fs = require('fs');
const md = fs.readFileSync('/home/claude/site/生命靈數報告_審核版v1.md', 'utf8');

const chunks = md.split(/\n## /).slice(1); // 去掉檔頭說明
const entries = {};
let footnote = [];

function parseBullets(block) {
  return [...block.matchAll(/^- (.+)$/gm)].map(m => m[1].trim());
}
function parseParagraph(block) {
  return block.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).join('');
}
function section(body, title) {
  const re = new RegExp('### ' + title + '\\n([\\s\\S]*?)(?=\\n### |\\n---|$)');
  const m = body.match(re);
  return m ? m[1].trim() : null;
}

for (const chunk of chunks) {
  const nl = chunk.indexOf('\n');
  const heading = chunk.slice(0, nl).trim();
  const body = chunk.slice(nl);

  if (heading.startsWith('章節註腳')) {
    footnote = [...body.matchAll(/^> (.+)$/gm)]
      .map(m => m[1].trim())
      .filter(l => l !== '');
    continue;
  }

  // 「1｜生命之卵 · 開創者」或「11／2｜星光螢火蟲 · 星光信使」
  const hm = heading.match(/^(\d+)(?:／(\d+))?｜(.+?) · (.+)$/);
  if (!hm) { console.error('❌ 無法解析標題：' + heading); process.exit(1); }
  const num = parseInt(hm[1], 10);
  const isMaster = !!hm[2];

  const entry = {
    number: num,
    isMaster: isMaster,
    displayLabel: isMaster ? hm[1] + '／' + hm[2] : hm[1],
    name: hm[3].trim(),
    role: hm[4].trim(),
    strengths: parseBullets(section(body, '你的天賦') || ''),
    blindspots: parseBullets(section(body, '容易卡住的地方') || ''),
    lessons: parseBullets(section(body, '給你的課題') || ''),
    slogan: (section(body, '核心標語') || '').replace(/^> \*\*|\*\*$/g, '').trim(),
    fields: parseBullets(section(body, '適合發展的領域') || ''),
    growthQuote: (section(body, '成長語句') || '').replace(/^> /, '').trim()
  };

  // 幸運象徵：三條「類別｜名稱 — 象徵句」
  entry.symbols = {};
  const symMap = { '核心色彩': 'color', '象徵植物': 'plant', '象徵礦石': 'stone' };
  for (const line of parseBullets(section(body, '你的幸運象徵') || '')) {
    const sm = line.match(/^(核心色彩|象徵植物|象徵礦石)｜(.+?) — (.+)$/);
    if (sm) entry.symbols[symMap[sm[1]]] = { name: sm[2].trim(), meaning: sm[3].trim() };
  }

  if (isMaster) {
    entry.baseNumber = parseInt(hm[2], 10);
    entry.baseIntro = parseParagraph((section(body, '先從 \\d 的功課說起') || '').replace(/^> /gm, ''));
    entry.innerConflict = parseParagraph(section(body, '你的內在拉扯') || '');
    entry.mission = parseParagraph(section(body, '高階使命') || '');
  } else {
    entry.positioning = parseParagraph(section(body, '原型定位') || '');
  }

  // 完整性檢查
  const need = isMaster
    ? ['baseIntro', 'innerConflict', 'mission']
    : ['positioning'];
  for (const k of need.concat(['slogan'])) {
    if (!entry[k]) { console.error(`❌ ${num} 缺 ${k}`); process.exit(1); }
  }
  for (const k of ['strengths', 'blindspots', 'lessons']) {
    if (entry[k].length < 3) { console.error(`❌ ${num} 的 ${k} 少於 3 條`); process.exit(1); }
  }
  if (entry.fields.length < 6) { console.error(`❌ ${num} 的發展領域少於 6 條`); process.exit(1); }
  if (!entry.growthQuote) { console.error(`❌ ${num} 缺成長語句`); process.exit(1); }
  for (const k of ['color', 'plant', 'stone']) {
    if (!entry.symbols[k] || !entry.symbols[k].name || !entry.symbols[k].meaning) {
      console.error(`❌ ${num} 幸運象徵缺 ${k}`); process.exit(1);
    }
  }

  entries[num] = entry;
}

const expected = [1,2,3,4,5,6,7,8,9,11,22,33,44];
const got = Object.keys(entries).map(Number).sort((a,b)=>a-b);
if (JSON.stringify(got) !== JSON.stringify(expected)) {
  console.error('❌ 條目不齊：' + got.join(',')); process.exit(1);
}
if (footnote.length < 2) { console.error('❌ 章節註腳解析失敗'); process.exit(1); }

// 禁用語掃描（鐵則 2）
const banned = ['一定', '絕對', '精準', '必須', '極強', '絕佳'];
const flat = JSON.stringify(entries) + JSON.stringify(footnote);
for (const w of banned) {
  if (flat.includes(w)) { console.error('❌ 內容含禁用語：' + w); process.exit(1); }
}

const out = `/**
 * 生命靈數報告章節資料庫 (Numerology Report Entries)
 *
 * 資料來源：「生命靈數報告_審核版v1.md」v1.1（Allen 審核定稿；v1.1 增補發展領域/幸運象徵/成長語句），由 tools/build-numerology-report.js 自動轉出。
 * 勿手動編輯本檔；內容修改請改 MD 後重新生成，確保單一事實來源。
 * 遵守鐵則 1（零幻覺原則）：全部為預先撰寫之查表資料。
 * 遵守鐵則 2：全文不使用「一定、絕對、精準、必須」等絕對化用語（生成時已自動掃描）。
 *
 * 對外介面 window.NUMEROLOGY_REPORT：
 * - ENTRIES[n] → { number, isMaster, displayLabel, name, role, positioning|baseIntro/innerConflict/mission,
 *                  strengths[], blindspots[], lessons[], slogan, fields[], symbols{color/plant/stone:{name,meaning}}, growthQuote }
 * - FOOTNOTE → string[]（章節註腳，依序渲染）
 * - SOURCE_LABEL → 來源標示字串
 */
(function () {
  'use strict';
  window.NUMEROLOGY_REPORT = {
    ENTRIES: ${JSON.stringify(entries, null, 2)},
    FOOTNOTE: ${JSON.stringify(footnote, null, 2)},
    SOURCE_LABEL: '— 依站內生命靈數知識庫 v1.0'
  };
})();
`;

fs.writeFileSync('/home/claude/site/data/numerology-report.js', out);
console.log('✅ 生成完成：13 條目 + ' + footnote.length + ' 段註腳');
