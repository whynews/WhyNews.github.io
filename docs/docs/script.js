// CONFIG
const PAGE_SIZE = 9;     // cards per page
const FEED_URL  = 'news.json';

let all = [];
let filtered = [];
let currentPage = 1;
let currentCat = 'All';

const el = (q) => document.querySelector(q);
const feed = el('#feed');
const cats = el('#cats');
const pager = el('#pager');

async function load() {
  try {
    const res = await fetch(FEED_URL, {cache: "no-store"});
    const data = await res.json();
    all = (data.items || []).sort((a,b)=> new Date(b.date) - new Date(a.date));
    buildCategories();
    setCategory('All');
  } catch (e) {
    feed.innerHTML = `<div class="pad">Failed to load news.json. Make sure it exists next to index.html (or in docs/).</div>`;
  }
}

function buildCategories() {
  const set = new Set(['All']);
  all.forEach(i => set.add(i.category || 'Other'));
  cats.innerHTML = '';
  [...set].forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (name===currentCat?' active':'');
    btn.textContent = name;
    btn.onclick = () => setCategory(name);
    cats.appendChild(btn);
  });
}

function setCategory(cat) {
  currentCat = cat;
  filtered = (cat==='All') ? all : all.filter(i => (i.category||'Other')===cat);
  currentPage = 1;
  render();
  buildCategories(); // refresh active state
}

function render() {
  const start = (currentPage-1)*PAGE_SIZE;
  const page = filtered.slice(start, start+PAGE_SIZE);

  feed.innerHTML = page.map(card).join('');
  buildPager();
}

function card(item){
  const img = item.image ? `<img src="${item.image}" alt="">` : '';
  const date = item.date ? new Date(item.date).toLocaleDateString() : '';
  return `
  <article class="card">
    ${img}
    <div class="pad">
      <div class="meta">${item.category || 'News'} · ${date}</div>
      <div class="title">${escapeHtml(item.title)}</div>
      <p class="excerpt">${escapeHtml(item.summary || '')}</p>
      <p style="margin-top:10px"><a href="${item.url}" target="_blank" rel="noopener">Read more »</a></p>
    </div>
  </article>`;
}

function buildPager(){
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  pager.innerHTML = '';
  for (let i=1;i<=pages;i++){
    const b = document.createElement('button');
    b.className = 'chip' + (i===currentPage?' active':'');
    b.textContent = i;
    b.onclick = () => { currentPage = i; render(); };
    pager.appendChild(b);
  }
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[m])); }

// Nav buttons (Home/Trending)
document.querySelectorAll('[data-nav]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const where = a.getAttribute('data-nav');
    if(where==='home'){ setCategory('All'); window.scrollTo({top:0,behavior:'smooth'}); }
    if(where==='trending'){ setCategory('Tech'); window.scrollTo({top:0,behavior:'smooth'}); } // change default trending cat if you like
    if(where==='categories'){ document.getElementById('cats').scrollIntoView({behavior:'smooth'}); }
  });
});

load();
