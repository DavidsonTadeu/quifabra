/**
 * QUIFABRA — main.js
 * Interatividade: navbar, scroll reveal, counters, accordion, menu mobile, formulário
 */

'use strict';

// ─── Navbar: scroll effect ───────────────────────────────────
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

// ─── Menu Mobile ─────────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('active', isOpen);
  menuToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Submenus mobile
function setupMobileSubmenu(toggleId, menuId) {
  const toggle = document.getElementById(toggleId);
  const menu = document.getElementById(menuId);
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
}
setupMobileSubmenu('mob-andaimes-toggle', 'mob-andaimes');
setupMobileSubmenu('mob-esco-toggle', 'mob-esco');

// Fechar menu ao clicar num link
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle?.classList.remove('active');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ─── Scroll Reveal ───────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// ─── Counters animados ───────────────────────────────────────
function animateCounter(el, target, duration = 2000, prefix = '', suffix = '') {
  const start = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Easing easeOutExpo
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(startVal + (target - startVal) * ease);
    el.textContent = prefix + current.toLocaleString('pt-BR') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const isYears = el.id === 'stat-anos';
      const isPercent = el.id === 'stat-clientes';
      const isProjects = el.id === 'stat-projetos';

      if (isYears) animateCounter(el, target, 1600);
      else if (isProjects) animateCounter(el, target, 2200, '+');
      else if (isPercent) animateCounter(el, target, 1800, '', '%');
      else animateCounter(el, target, 2000);

      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => {
  counterObserver.observe(el);
});

// ─── Accordion FAQ ───────────────────────────────────────────
const accordionItems = document.querySelectorAll('.accordion-item');

function openAccordion(item) {
  const body = item.querySelector('.accordion-body');
  const trigger = item.querySelector('.accordion-trigger');
  item.classList.add('open');
  trigger.setAttribute('aria-expanded', 'true');
  body.style.maxHeight = body.scrollHeight + 'px';
}

function closeAccordion(item) {
  const body = item.querySelector('.accordion-body');
  const trigger = item.querySelector('.accordion-trigger');
  item.classList.remove('open');
  trigger.setAttribute('aria-expanded', 'false');
  body.style.maxHeight = '0';
}

// Inicializa o primeiro item aberto
accordionItems.forEach(item => {
  const body = item.querySelector('.accordion-body');
  if (item.classList.contains('open')) {
    body.style.maxHeight = body.scrollHeight + 'px';
  } else {
    body.style.maxHeight = '0';
  }
});

accordionItems.forEach(item => {
  const trigger = item.querySelector('.accordion-trigger');
  trigger?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Fecha todos
    accordionItems.forEach(i => closeAccordion(i));
    // Abre o clicado (se estava fechado)
    if (!isOpen) openAccordion(item);
  });
});

// ─── Hero Image Ken Burns ────────────────────────────────────
const heroImg = document.getElementById('heroImg');
if (heroImg) {
  heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
  if (heroImg.complete) heroImg.classList.add('loaded');
}

// ─── Smooth scroll para âncoras ──────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── CEP Mask ────────────────────────────────────────────────
const cepField = document.getElementById('field-cep');
cepField?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
  e.target.value = v;
});

// Phone mask
const phoneField = document.getElementById('field-celular');
phoneField?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length <= 10) {
    v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
  e.target.value = v.trim().replace(/-$/, '');
});

// ─── Formulário de contato ───────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('form-feedback');
const formSubmit = document.getElementById('form-submit');

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('field-nome')?.value.trim();
  const email = document.getElementById('field-email')?.value.trim();
  const celular = document.getElementById('field-celular')?.value.trim();

  if (!nome || !email || !celular) {
    showFeedback('❌ Por favor, preencha os campos obrigatórios: Nome, E-mail e Celular.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showFeedback('❌ Por favor, insira um e-mail válido.', 'error');
    return;
  }

  // Simular envio
  formSubmit.textContent = 'Enviando...';
  formSubmit.disabled = true;

  setTimeout(() => {
    showFeedback('✅ Mensagem enviada! Entraremos em contato em breve pelo WhatsApp ou e-mail.', 'success');
    contactForm.reset();
    formSubmit.textContent = 'Converse com um consultor';
    formSubmit.disabled = false;
  }, 1500);
});

function showFeedback(msg, type) {
  if (!formFeedback) return;
  formFeedback.textContent = msg;
  formFeedback.style.display = 'block';
  formFeedback.style.color = type === 'error' ? '#FFD580' : 'rgba(255,255,255,.95)';
  setTimeout(() => { formFeedback.style.display = 'none'; }, 6000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Active nav link por scroll ──────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navbar__link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.closest('.navbar__item')?.classList.remove('active');
      });
      const id = entry.target.getAttribute('id');
      const activeLink = document.querySelector(`.navbar__link[href="#${id}"]`);
      activeLink?.closest('.navbar__item')?.classList.add('active');
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));

// ─── Imagens: fallback placeholder ───────────────────────────
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', function () {
    // Gera um placeholder SVG colorido com o nome do alt
    const alt = this.alt || 'Imagem';
    const colors = ['1E96C8', 'F0A500', '1D2533', '1677A0'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const w = this.width || 400;
    const h = this.height || 300;

    this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E%3Crect width='${w}' height='${h}' fill='%23${color}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='rgba(255,255,255,0.7)'%3E${encodeURIComponent(alt)}%3C/text%3E%3C/svg%3E`;
    this.style.objectFit = 'cover';
  });
});

console.log('%c🏗️ Quifabra — Site carregado com sucesso!', 'color:#1E96C8;font-weight:bold;font-size:14px;');

// ─── CARRINHO DE COMPRAS ───
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebar = document.getElementById('cartSidebar');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartBadges = document.querySelectorAll('.cart-badge-count');

let cart = JSON.parse(localStorage.getItem('quifabra_cart')) || [];

window.toggleCart = function() {
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');
  if (!overlay || !sidebar) return;
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCart();
  }
}

window.addToCart = function(id, title, price, img) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, title, price, img, qty: 1 });
  }
  saveCart();
  toggleCart();
}

window.updateQty = function(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart();
    renderCart();
  }
}

window.removeItem = function(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('quifabra_cart', JSON.stringify(cart));
  updateBadges();
}

function updateBadges() {
  const badges = document.querySelectorAll('.cart-badge-count');
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  badges.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

window.renderCart = function() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty-msg">Seu carrinho está vazio.</div>';
    if(totalEl) totalEl.textContent = 'R$ 0,00';
    return;
  }

  let html = '';
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    
    html += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.title}" class="cart-item__img">
        <div class="cart-item__info">
          <div class="cart-item__title">${item.title}</div>
          <div class="cart-item__price">R$ ${item.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
          <div class="cart-item__actions">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
              <input type="text" class="qty-input" value="${item.qty}" readonly>
              <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeItem('${item.id}')">Remover</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if(totalEl) totalEl.textContent = 'R$ ' + total.toLocaleString('pt-BR', {minimumFractionDigits: 2});
}

window.checkoutWhatsApp = function() {
  if (cart.length === 0) return;

  let total = 0;
  let msg = '📦 *NOVO PEDIDO PELO SITE* 📦\n--------------------------------\n';
  
  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    msg += `${item.qty}x ${item.title} (R$ ${item.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})})\n`;
  });

  msg += '--------------------------------\n';
  msg += `*Subtotal:* R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n\n`;
  msg += 'Gostaria de finalizar esta compra e consultar o valor do frete para o meu CEP.';

  const encodedMsg = encodeURIComponent(msg);
  const phone = '5531991790838';
  window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
}

// Event Listeners for Cart
document.addEventListener('DOMContentLoaded', () => {
  updateBadges();
  
  const closeBtn = document.getElementById('closeCart');
  const overlay = document.getElementById('cartOverlay');
  
  if (closeBtn) closeBtn.addEventListener('click', toggleCart);
  if (overlay) overlay.addEventListener('click', toggleCart);
});
