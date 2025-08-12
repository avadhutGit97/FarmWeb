// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Year in footer
document.getElementById('year').textContent = String(new Date().getFullYear());

// Data loading and shop rendering
const DATA_URL = '/workspace/data.json';
let catalog = null;
let activeCategoryId = 'vegetables';

const productsContainer = document.getElementById('products');
const tabs = document.querySelectorAll('.tab');

async function loadCatalog() {
  if (catalog) return catalog;
  const res = await fetch(DATA_URL);
  catalog = await res.json();
  return catalog;
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function renderProducts(categoryId) {
  activeCategoryId = categoryId;
  tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.category === categoryId));
  const category = catalog.categories.find(c => c.id === categoryId);
  if (!category) return;
  productsContainer.innerHTML = '';
  category.products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card shadow';

    const media = document.createElement('div');
    media.className = 'card-media';
    const CATEGORY_IMAGE = {
      vegetables: 'http://www.macklinsfarm.com/010308_0688_0613_lslp.jpg',
      fruits: 'http://www.macklinsfarm.com/010308_0688_0008_lslp.jpg',
      greenhouse: 'http://www.macklinsfarm.com/GREENHOUSE_003.jpg'
    };
    const bg = p.image || CATEGORY_IMAGE[categoryId];
    if (bg) media.style.backgroundImage = `url('${bg}')`;
    else media.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))';

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.textContent = p.name;

    const priceRow = document.createElement('div');
    priceRow.className = 'price-row';
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = formatPrice(p.price);
    const unit = document.createElement('div');
    unit.className = 'unit';
    unit.style.color = 'var(--muted)';
    unit.textContent = p.unit || '';
    priceRow.append(price, unit);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary add-btn';
    addBtn.textContent = 'Add to cart';
    addBtn.addEventListener('click', () => addToCart({ ...p, categoryId }));

    body.append(title, priceRow, addBtn);
    card.append(media, body);
    productsContainer.append(card);
  });
}

// Cart state
const CART_KEY = 'macklins.cart.v1';
let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) existing.qty += 1; else cart.push({ id: item.id, name: item.name, price: item.price, unit: item.unit, image: item.image, qty: 1 });
  saveCart();
  renderCart();
}

function updateQty(id, delta) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartClearEl = document.getElementById('cart-clear');
const checkoutEl = document.getElementById('checkout');

function renderCart() {
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'cart-item';

    const img = document.createElement('img');
    const CATEGORY_IMAGE = {
      vegetables: 'http://www.macklinsfarm.com/010308_0688_0613_lslp.jpg',
      fruits: 'http://www.macklinsfarm.com/010308_0688_0008_lslp.jpg',
      greenhouse: 'http://www.macklinsfarm.com/GREENHOUSE_003.jpg'
    };
    img.src = item.image || CATEGORY_IMAGE[item.categoryId || 'vegetables'];
    img.alt = item.name;

    const info = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'cart-item-title';
    title.textContent = item.name;
    const meta = document.createElement('div');
    meta.className = 'cart-item-meta';
    meta.textContent = `${formatPrice(item.price)}${item.unit ? ` / ${item.unit}` : ''}`;
    info.append(title, meta);

    const controls = document.createElement('div');
    const qty = document.createElement('div');
    qty.className = 'qty';
    const minus = document.createElement('button'); minus.textContent = '−'; minus.addEventListener('click', () => updateQty(item.id, -1));
    const count = document.createElement('span'); count.textContent = String(item.qty);
    const plus = document.createElement('button'); plus.textContent = '+'; plus.addEventListener('click', () => updateQty(item.id, +1));
    qty.append(minus, count, plus);
    controls.append(qty);

    row.append(img, info, controls);
    cartItemsEl.append(row);
  });
  cartTotalEl.textContent = formatPrice(total);
  checkoutEl.disabled = cart.length === 0;
}

cartClearEl?.addEventListener('click', clearCart);
checkoutEl?.addEventListener('click', () => alert('Thank you! This is a demo checkout.'));

// Wire up tabs and initial render
(async () => {
  await loadCatalog();
  renderProducts(activeCategoryId);
  renderCart();
})();

tabs.forEach(btn => btn.addEventListener('click', () => renderProducts(btn.dataset.category)));