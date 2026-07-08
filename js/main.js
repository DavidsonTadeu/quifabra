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

// ─── Carrossel Infinito de Produtos ─────────────────────────
(function initProductCarousel() {
  const track = document.getElementById('carouselTrack');
  const wrap  = document.getElementById('carouselWrap');
  if (!track || !wrap) return;

  // 1. Duplicar todos os cards para o loop seamless
  const origCards = Array.from(track.children);
  origCards.forEach(card => {
    const clone = card.cloneNode(true);
    // Remove ids para evitar duplicatas (acessibilidade)
    clone.removeAttribute('id');
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  // 2. Drag / Swipe com mouse e touch
  let isDragging  = false;
  let startX      = 0;
  let scrollLeft  = 0;
  let dragStarted = false;

  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  wrap.addEventListener('mousedown', (e) => {
    isDragging  = true;
    dragStarted = false;
    startX      = getClientX(e) - wrap.getBoundingClientRect().left;
    scrollLeft  = wrap.scrollLeft;
    track.style.animationPlayState = 'paused';
  });

  wrap.addEventListener('touchstart', (e) => {
    isDragging  = true;
    dragStarted = false;
    startX      = getClientX(e) - wrap.getBoundingClientRect().left;
    scrollLeft  = wrap.scrollLeft;
    track.style.animationPlayState = 'paused';
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x    = getClientX(e) - wrap.getBoundingClientRect().left;
    const walk = (x - startX) * 1.4;
    if (Math.abs(walk) > 4) dragStarted = true;
    wrap.scrollLeft = scrollLeft - walk;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const x    = getClientX(e) - wrap.getBoundingClientRect().left;
    const walk = (x - startX) * 1.4;
    if (Math.abs(walk) > 4) dragStarted = true;
    wrap.scrollLeft = scrollLeft - walk;
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.animationPlayState = '';
  });

  window.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.animationPlayState = '';
  });

  // Impede navegação ao soltar depois de drag
  wrap.addEventListener('click', (e) => {
    if (dragStarted) {
      e.preventDefault();
      dragStarted = false;
    }
  });

  // 3. Pausa ao focar elemento via teclado (acessibilidade)
  wrap.addEventListener('focusin', () => {
    track.style.animationPlayState = 'paused';
  });
  wrap.addEventListener('focusout', () => {
    track.style.animationPlayState = '';
  });

  // 4. Respeita preferência de redução de movimento
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    track.style.animation = 'none';
    wrap.style.overflowX  = 'auto';
  }
})();// =========================================================
// BANNER DE COOKIES E POPUP PROMOCIONAL (5s)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  
  // ── 1. Cookie Banner ──
  const cookieConsent = localStorage.getItem('qf_cookie_consent');
  if (!cookieConsent) {
    const bannerHTML = `
      <div id="cookie-banner" style="position:fixed; bottom:0; left:0; right:0; background:#1D2533; color:white; padding:16px 24px; z-index:9999; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; transform:translateY(100%); transition:transform 0.4s ease; box-shadow:0 -4px 20px rgba(0,0,0,0.15);">
        <div style="font-size:0.85rem; flex:1; min-width:280px; line-height:1.4;">
          Utilizamos cookies para melhorar a sua experiência. Ao continuar navegando, você concorda com nossa política de privacidade.
        </div>
        <button id="cookie-accept" style="background:#00a650; color:white; border:none; padding:10px 24px; border-radius:8px; font-weight:700; cursor:pointer; transition:background 0.2s;">Aceitar e Fechar</button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', bannerHTML);
    const banner = document.getElementById('cookie-banner');
    
    // Animação de entrada
    setTimeout(() => { banner.style.transform = 'translateY(0)'; }, 500);
    
    document.getElementById('cookie-accept').addEventListener('click', () => {
      localStorage.setItem('qf_cookie_consent', 'true');
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => banner.remove(), 400);
    });
  }

  // ── 2. Popup Promocional (Aparece após 5s) ──
  // Não mostra se o usuário já viu e fechou, OU se já está na página de checkout/admin
  const popupShown = localStorage.getItem('qf_promo_popup_shown');
  const path = window.location.pathname;
  const isExcludedPage = path.includes('checkout') || path.includes('admin') || path.includes('minha-conta');
  
  if (!popupShown && !isExcludedPage) {
    const popupHTML = `
      <div id="promo-popup-overlay" style="position:fixed; inset:0; background:rgba(10,15,30,0.7); backdrop-filter:blur(4px); z-index:10000; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.4s ease;">
        <div id="promo-popup-modal" style="background:white; border-radius:16px; padding:32px 24px; max-width:90%; width:400px; text-align:center; position:relative; transform:scale(0.9); transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow:0 10px 40px rgba(0,0,0,0.2);">
          <button id="promo-popup-close" style="position:absolute; top:12px; right:16px; background:none; border:none; font-size:1.8rem; color:#9ca3af; cursor:pointer; line-height:1; transition:color 0.2s;">&times;</button>
          <div style="font-size:3.5rem; margin-bottom:8px;">🛒</div>
          <h3 style="font-family:var(--font-heading); font-size:1.5rem; font-weight:900; color:var(--color-dark); margin-bottom:12px; line-height:1.2;">Compre direto<br>pelo nosso site!</h3>
          <p style="color:#6b7280; font-size:0.95rem; margin-bottom:24px; line-height:1.5;">Sabia que nossa loja virtual já está no ar? Garanta equipamentos originais Quifabra de forma rápida e segura.</p>
          <a href="index.html#loja" id="promo-popup-btn" style="display:block; background:var(--color-primary); color:white; padding:14px; border-radius:10px; font-weight:800; text-decoration:none; transition:transform 0.2s, background 0.2s;">Ver Produtos Agora</a>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    const overlay = document.getElementById('promo-popup-overlay');
    const modal = document.getElementById('promo-popup-modal');
    const closeBtn = document.getElementById('promo-popup-close');
    const actionBtn = document.getElementById('promo-popup-btn');
    
    const fecharPopup = () => {
      localStorage.setItem('qf_promo_popup_shown', 'true');
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.9)';
      setTimeout(() => overlay.remove(), 400);
    };

    closeBtn.addEventListener('click', fecharPopup);
    actionBtn.addEventListener('click', fecharPopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fecharPopup();
    });

    // Dispara após 5 segundos
    setTimeout(() => {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
      modal.style.transform = 'scale(1)';
    }, 5000);
  }
});
