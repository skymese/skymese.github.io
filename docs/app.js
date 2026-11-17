
const state = { tab:'tools', cat:'all', q:'' };
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderCats(){
  const g = state.tab==='tools' ? window.DATA_TOOLS : window.DATA_OSS;
  $('cats').innerHTML = Object.entries(g.cats).map(([k,v]) =>
    `<button class="chip ${k===state.cat?'active':''}" data-cat="${k}">${v}</button>`).join('');
  $('cats').querySelectorAll('.chip').forEach(btn => btn.onclick = () => { state.cat = btn.dataset.cat; renderCats(); renderGrid(); });
}

function renderGrid(){
  const g = state.tab==='tools' ? window.DATA_TOOLS : window.DATA_OSS;
  const q = state.q.trim().toLowerCase();
  const list = g.items.filter(it => (state.cat==='all' || it[4]===state.cat) &&
    (!q || (it[0]+it[2]+it[5]).toLowerCase().includes(q)));
  $('sectionTitle').textContent = state.cat==='all' ? (state.tab==='tools'?'全部 AI 工具':'全部开源项目') : g.cats[state.cat];
  $('resultHint').textContent = `显示 ${list.length} 项`;
  $('grid').innerHTML = list.length ? list.map(it => {
    const [name,icon,desc,url,cat,tags,hot] = it;
    const color = g.colors[cat] || 'var(--accent)';
    return `<a class="card" href="${esc(url)}" target="_blank" rel="noopener" style="--c:${color}">
      <div class="card-top">
        <div class="ico">${icon}</div>
        <div class="card-name">${esc(name)}${hot?'<span class="hot" title="热门">🔥</span>':''}</div>
        <span class="arrow">↗</span>
      </div>
      <p class="card-desc">${esc(desc)}</p>
      <div class="tags">${tags.split('|').filter(Boolean).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
    </a>`;
  }).join('') : `<div class="empty"><div class="big">🔍</div><div>没有找到匹配的项目，换个关键词试试</div></div>`;
}

function switchTab(tab){
  state.tab = tab; state.cat = 'all';
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab===tab));
  renderCats(); renderGrid();
}

$('tabs').querySelectorAll('.tab').forEach(t => t.onclick = () => switchTab(t.dataset.tab));
let timer;
$('search').addEventListener('input', e => { clearTimeout(timer); timer = setTimeout(()=>{ state.q = e.target.value; renderGrid(); }, 80); });
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT'){ e.preventDefault(); $('search').focus(); }
  if (e.key === 'Escape' && document.activeElement === $('search')){ $('search').value=''; state.q=''; renderGrid(); $('search').blur(); }
});
$('themeBtn').onclick = () => {
  const cur = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', cur==='dark'?'light':'dark');
};

$('statTools').textContent = window.DATA_TOOLS.items.length;
$('statOss').textContent = window.DATA_OSS.items.length;
$('statCats').textContent = Object.keys(window.DATA_TOOLS.cats).length - 1 + Object.keys(window.DATA_OSS.cats).length - 1;
$('tabCountTools').textContent = window.DATA_TOOLS.items.length;
$('tabCountOss').textContent = window.DATA_OSS.items.length;
$('year').textContent = new Date().getFullYear();
renderCats(); renderGrid();
