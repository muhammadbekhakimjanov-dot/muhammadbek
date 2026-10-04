/* ===== Atyr Market — бардык логика (Vanilla JS + localStorage) ===== */
const $ = s => document.querySelector(s);
const KEY = { p: 'atyr_products', f: 'atyr_favorites' };
const CATS = ['Эркектер үчүн', 'Аялдар үчүн', 'Унисекс', 'Араб атырлары', 'Нишалык атырлар', 'Оригинал', 'Тестер'];
const CHIPS = [...CATS, 'Жаңы', 'Колдонулган'];

/* --- Сактагыч --- */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { toast('Сактоо мүмкүн болгон жок. Сүрөттү кичирээк тандаңыз.'); return false; } };

/* --- Жардамчылар --- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => Number(n).toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' сом'; // 2 500 сом
const digits = s => String(s || '').replace(/\D/g, '');
const intl = s => { let d = digits(s); if (d.startsWith('0')) d = '996' + d.slice(1); return d; };
let tt; function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); }

/* Demo сүрөт: SVG бөтөлкө (интернет талап кылынбайт) */
const bottle = (a, b) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="#f6f0e4"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="115" y="40" width="70" height="30" rx="4" fill="#161412"/><rect x="95" y="75" width="110" height="180" rx="14" fill="url(#g)"/><rect x="95" y="75" width="30" height="180" rx="14" fill="#fff" opacity=".18"/></svg>`);

/* --- Demo товарлар --- */
const demo = (id, name, brand, cat, price, size, city, seller, c1, c2) => ({
  id, name, brand, cat, price, size, cond: 'Жаңы', city, seller, phone: '0555123456', wa: '0555123456',
  img: bottle(c1, c2), desc: `${name} — ${brand} брендинин белгилүү жыты. Оригинал, баштапкы таңгакта.`, ts: Date.now() - id * 1e6, pop: 10 - id, own: false
});
const DEMO = [
  demo(1, 'Dior Sauvage', 'Dior', 'Эркектер үчүн', 6800, 100, 'Бишкек', 'Айбек', '#3b6ea5', '#16283f'),
  demo(2, 'Bleu de Chanel', 'Chanel', 'Эркектер үчүн', 8200, 100, 'Ош', 'Нурлан', '#1f4e8c', '#0a1a33'),
  demo(3, 'YSL Y', 'Yves Saint Laurent', 'Эркектер үчүн', 7000, 100, 'Бишкек', 'Эрлан', '#5aa9c9', '#1b3d52'),
  demo(4, 'Creed Aventus', 'Creed', 'Нишалык атырлар', 18500, 100, 'Бишкек', 'Тимур', '#c9a24a', '#5c4310'),
  demo(5, 'Lattafa Khamrah', 'Lattafa', 'Араб атырлары', 2500, 100, 'Каракол', 'Айгерим', '#a8632a', '#3d1f0a'),
  demo(6, 'Baccarat Rouge 540', 'Maison Francis Kurkdjian', 'Унисекс', 21000, 70, 'Бишкек', 'Салтанат', '#e3b7a0', '#8a4b3a')
];

/* --- Абал --- */
let products = load(KEY.p, null);
if (!products) { products = DEMO; save(KEY.p, products); } // биринчи ачылганда demo
let favs = load(KEY.f, []);
let imgData = '';  // жүктөлгөн сүрөт

/* ===== Рендер ===== */
function card(p, opts = {}) {
  const fav = favs.includes(p.id);
  return `<article class="card" data-id="${p.id}">
    <div class="pic"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy">
      <button class="heart ${fav ? 'on' : ''}" data-act="fav" aria-label="Сүйүктүүгө кошуу">${fav ? '♥' : '♡'}</button></div>
    <div class="body">
      <h3>${esc(p.name)}</h3><span class="brand">${esc(p.brand)}</span>
      <span class="price">${money(p.price)}</span>
      <span class="meta">${p.size} ml · ${esc(p.city)}</span>
      <span><span class="tag">${esc(p.cat)}</span><span class="tag">${esc(p.cond)}</span></span>
      <span class="meta">Сатуучу: ${esc(p.seller)}</span>
      <div class="row">
        <button class="btn sm" data-act="more">Кененирээк</button>
        <a class="btn sm gold" href="https://wa.me/${intl(p.wa || p.phone)}" target="_blank" rel="noopener">Байланышуу</a>
        ${p.own ? `<button class="btn sm" data-act="edit">Edit</button><button class="btn sm danger" data-act="del">Delete</button>` : ''}
      </div></div></article>`;
}
const empty = t => `<div class="empty">${t}</div>`;

function getFiltered() {
  const q = $('#q').value.trim().toLowerCase(), br = $('#fBrand').value, ct = $('#fCat').value, cd = $('#fCond').value;
  const min = parseFloat($('#fMin').value), max = parseFloat($('#fMax').value), city = $('#fCity').value.trim().toLowerCase();
  let list = products.filter(p =>
    (!q || (p.name + ' ' + p.brand).toLowerCase().includes(q)) &&
    (!br || p.brand === br) &&
    (!ct || p.cat === ct || p.cond === ct) &&   // "Жаңы"/"Колдонулган" абалга да тиешелүү
    (!cd || p.cond === cd) &&
    (isNaN(min) || p.price >= min) && (isNaN(max) || p.price <= max) &&
    (!city || p.city.toLowerCase().includes(city)));
  const s = $('#sort').value;
  list.sort((a, b) => s === 'asc' ? a.price - b.price : s === 'desc' ? b.price - a.price : s === 'pop' ? b.pop - a.pop : b.ts - a.ts);
  return list;
}

function render() {
  const list = getFiltered();
  $('#count').textContent = `Табылды: ${list.length}`;
  $('#grid').innerHTML = list.length ? list.map(card).join('') : empty('Эч нерсе табылган жок. Фильтрди өзгөртүп көрүңүз.');
  const f = products.filter(p => favs.includes(p.id));
  $('#favGrid').innerHTML = f.length ? f.map(card).join('') : empty('Сүйүктүү атырлар жок. Карточкадагы ♡ басыңыз.');
  const m = products.filter(p => p.own);
  $('#mineGrid').innerHTML = m.length ? m.map(card).join('') : empty('Сиз азырынча атыр жарыялаган жоксуз. «Атыр сатуу» бөлүмүнөн кошуңуз.');
  $('#favCount').textContent = favs.length;
}

function fillSelects() {
  const cur = $('#fBrand').value;
  const brands = [...new Set(products.map(p => p.brand))].sort();
  $('#fBrand').innerHTML = '<option value="">Бардык бренддер</option>' + brands.map(b => `<option>${esc(b)}</option>`).join('');
  $('#fBrand').value = brands.includes(cur) ? cur : '';
}
$('#fCat').innerHTML = '<option value="">Бардык категориялар</option>' + CHIPS.map(c => `<option>${c}</option>`).join('');
$('#cat').innerHTML = CATS.map(c => `<option>${c}</option>`).join('');
$('#chips').innerHTML = CHIPS.map(c => `<button class="chip" data-cat="${c}">${c}</button>`).join('');

/* ===== Фильтр / издөө / сорт ===== */
['#q', '#fBrand', '#fCat', '#fCond', '#fMin', '#fMax', '#fCity', '#sort'].forEach(s => $(s).addEventListener('input', () => { syncChips(); render(); }));
$('#reset').onclick = () => { ['#q', '#fBrand', '#fCat', '#fCond', '#fMin', '#fMax', '#fCity'].forEach(s => $(s).value = ''); $('#sort').value = 'new'; syncChips(); render(); };
function syncChips() { document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.cat === $('#fCat').value)); }
$('#chips').onclick = e => {
  const c = e.target.closest('.chip'); if (!c) return;
  $('#fCat').value = $('#fCat').value === c.dataset.cat ? '' : c.dataset.cat;
  syncChips(); render(); $('#catalog').scrollIntoView();
};
$('#searchBtn').onclick = () => { $('#catalog').scrollIntoView(); setTimeout(() => $('#q').focus(), 400); };

/* ===== Карточка аракеттери (event delegation) ===== */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const el = b.closest('[data-id]'); const id = +el.dataset.id;
  const act = b.dataset.act;
  if (act === 'fav') toggleFav(id);
  if (act === 'more') openDetail(id);
  if (act === 'edit') { closeModal(); startEdit(id); }
  if (act === 'del') confirmDelete(id);
});

function toggleFav(id) {
  const p = products.find(x => x.id === id);
  if (favs.includes(id)) { favs = favs.filter(x => x !== id); toast('Сүйүктүүлөрдөн өчүрүлдү'); }
  else { favs.push(id); p.pop++; save(KEY.p, products); toast('Сүйүктүүлөргө кошулду ♥'); }
  save(KEY.f, favs); render();
  if (!$('#modal').hidden && $('#modalBody').dataset.id == id) openDetail(id, true);
}

/* ===== Modal ===== */
function openModal(html, id) { $('#modalBody').innerHTML = html; $('#modalBody').dataset.id = id || ''; $('#modal').hidden = false; document.body.style.overflow = 'hidden'; }
function closeModal() { $('#modal').hidden = true; document.body.style.overflow = ''; }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.dataset.close !== undefined) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function openDetail(id, silent) {
  const p = products.find(x => x.id === id); if (!p) return;
  if (!silent) { p.pop++; save(KEY.p, products); }
  const fav = favs.includes(id);
  openModal(`<div class="detail"><img src="${p.img}" alt="${esc(p.name)}">
    <div class="info" data-id="${p.id}">
      <h2>${esc(p.name)}</h2><span class="brand">${esc(p.brand)}</span>
      <span class="price">${money(p.price)}</span>
      <span class="meta">Көлөмү: ${p.size} ml</span>
      <span class="meta">Категория: ${esc(p.cat)} · Абалы: ${esc(p.cond)}</span>
      <span class="meta">Шаар: ${esc(p.city)}</span>
      <p>${esc(p.desc) || 'Сүрөттөмө жок.'}</p>
      <span class="meta">Сатуучу: ${esc(p.seller)}</span>
      <a href="tel:+${intl(p.phone)}">📞 ${esc(p.phone)}</a>
      <div class="row">
        <a class="btn gold" target="_blank" rel="noopener" href="https://wa.me/${intl(p.wa || p.phone)}?text=${encodeURIComponent('Саламатсызбы! Atyr Market: «' + p.name + '» атыры дагы сатылабы?')}">WhatsApp</a>
        <button class="btn" data-act="fav">${fav ? '♥ Сүйүктүүдөн алуу' : '♡ Сүйүктүүгө кошуу'}</button>
      </div></div></div>`, p.id);
}

function confirmDelete(id) {
  const p = products.find(x => x.id === id);
  openModal(`<div class="confirm"><h2>Өчүрөбүзбү?</h2><p>«${esc(p.name)}» жарыясы биротоло өчөт.</p>
    <div class="row"><button class="btn" data-close>Жок</button><button class="btn danger" id="yesDel">Ооба, өчүрүү</button></div></div>`);
  $('#yesDel').onclick = () => {
    products = products.filter(x => x.id !== id); favs = favs.filter(x => x !== id);
    save(KEY.p, products); save(KEY.f, favs); closeModal(); fillSelects(); render(); toast('Жарыя өчүрүлдү');
  };
}

/* ===== Форма: кошуу / өзгөртүү ===== */
const F = ['name', 'brand', 'cat', 'price', 'size', 'cond', 'city', 'seller', 'phone', 'wa', 'desc'];
$('#img').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  if (!file.type.startsWith('image/')) return toast('Сүрөт файлын тандаңыз');
  const r = new FileReader();
  r.onload = () => { // localStorage толуп калбашы үчүн сүрөттү кичирейтебиз
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 600 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      imgData = c.toDataURL('image/jpeg', .8); $('#preview').src = imgData; $('#preview').hidden = false;
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
});

function validate() {
  let ok = true;
  const need = { name: v => v, brand: v => v, price: v => +v > 0, size: v => +v > 0, city: v => v, seller: v => v, phone: v => digits(v).length >= 9 };
  Object.entries(need).forEach(([k, fn]) => { const bad = !fn($('#' + k).value.trim()); $('#' + k).classList.toggle('bad', bad); if (bad) ok = false; });
  return ok;
}

$('#form').addEventListener('submit', e => {
  e.preventDefault();
  if (!validate()) return toast('Кызыл талааларды туура толтуруңуз');
  const id = +$('#pid').value;
  const data = {}; F.forEach(k => data[k] = $('#' + k).value.trim());
  data.price = +data.price; data.size = +data.size;
  if (id) { // өзгөртүү
    const p = products.find(x => x.id === id);
    Object.assign(p, data); if (imgData) p.img = imgData;
    toast('Жарыя жаңыртылды');
  } else {  // жаңы товар
    products.unshift({ ...data, id: Date.now(), img: imgData || bottle('#d8b45f', '#6b531c'), ts: Date.now(), pop: 0, own: true });
    toast('Жарыяланды! Атыр тизмеге кошулду');
  }
  if (!save(KEY.p, products)) return;
  resetForm(); fillSelects(); render();
  $('#catalog').scrollIntoView();
});

function startEdit(id) {
  const p = products.find(x => x.id === id);
  F.forEach(k => $('#' + k).value = p[k] ?? '');
  $('#pid').value = id; imgData = ''; $('#preview').src = p.img; $('#preview').hidden = false;
  $('#formTitle').textContent = 'Жарыяны өзгөртүү'; $('#submitBtn').textContent = 'Сактоо';
  $('#sell').scrollIntoView();
}
function resetForm() {
  $('#form').reset(); $('#pid').value = ''; imgData = ''; $('#preview').hidden = true;
  $('#formTitle').textContent = 'Атыр сатуу'; $('#submitBtn').textContent = 'Жарыялоо';
  document.querySelectorAll('.bad').forEach(x => x.classList.remove('bad'));
}

/* ===== Мобилдик меню ===== */
$('#burger').onclick = () => $('#menu').classList.toggle('open');
$('#menu').onclick = e => { if (e.target.tagName === 'A') $('#menu').classList.remove('open'); };

/* ===== Старт ===== */
fillSelects(); render();
