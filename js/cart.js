/**
 * QUIFABRA — cart.js
 * Funções do carrinho usadas no index.html, loja.html e páginas de produto.
 * Não usa Firebase — apenas localStorage.
 */
'use strict';

// ══════════════════════════════════════════════════════════════
// CARRINHO
// ══════════════════════════════════════════════════════════════
function getCart() {
  return JSON.parse(localStorage.getItem('quifabra_cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('quifabra_cart', JSON.stringify(cart));
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatBRL(val) {
  return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function updateCartBadges() {
  const cart  = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge-count').forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ══════════════════════════════════════════════════════════════
// ABRIR CHECKOUT
// ══════════════════════════════════════════════════════════════
window.openCheckout = function () {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Seu carrinho está vazio. Adicione produtos antes de finalizar.');
    return;
  }
  // Fechar sidebar se estiver aberto
  const sidebar = document.getElementById('cartSidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.location.href = 'checkout.html';
};

// ══════════════════════════════════════════════════════════════
// ADICIONAR AO CARRINHO
// ══════════════════════════════════════════════════════════════
window.addToCart = function (product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += product.qty || 1;
  } else {
    cart.push({ ...product, qty: product.qty || 1 });
  }

  saveCart(cart);
  updateCartBadges();
  renderCartSidebar();

  // Abrir sidebar
  const sidebar = document.getElementById('cartSidebar');
  if (sidebar) {
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.removeFromCart = function (id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  updateCartBadges();
  renderCartSidebar();
};

window.changeQty = function (id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      const idx = cart.indexOf(item);
      cart.splice(idx, 1);
    }
  }
  saveCart(cart);
  updateCartBadges();
  renderCartSidebar();
};

// ══════════════════════════════════════════════════════════════
// RENDERIZAR SIDEBAR DO CARRINHO
// ══════════════════════════════════════════════════════════════
function renderCartSidebar() {
  const cart      = getCart();
  const itemsEl   = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total');
  const emptyEl   = document.getElementById('cart-empty');
  const contentEl = document.getElementById('cart-content');

  if (!itemsEl) return;

  if (cart.length === 0) {
    if (emptyEl)   emptyEl.style.display   = 'flex';
    if (contentEl) contentEl.style.display = 'none';
    return;
  }

  if (emptyEl)   emptyEl.style.display   = 'none';
  if (contentEl) contentEl.style.display = 'flex';

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <img class="cart-item__img" src="${item.img}" alt="${item.title}" />
      <div class="cart-item__info">
        <div class="cart-item__name">${item.title}</div>
        <div class="cart-item__price">${formatBRL(item.price)}</div>
        <div class="cart-item__qty">
          <button onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart('${item.id}')" aria-label="Remover">✕</button>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = formatBRL(cartTotal(cart));
}

// ══════════════════════════════════════════════════════════════
// TOGGLE SIDEBAR
// ══════════════════════════════════════════════════════════════
window.toggleCart = function () {
  const sidebar = document.getElementById('cartSidebar');
  if (!sidebar) return;
  const isOpen = sidebar.classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
};

// ══════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadges();
  renderCartSidebar();
});
