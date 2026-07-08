/**
 * QUIFABRA — checkout.js
 * E-commerce: autenticação local, CEP (ViaCEP), pedidos e email (EmailJS)
 */
'use strict';

import { db, doc, setDoc, getDocs, collection } from './firebase-config.js';

// ══════════════════════════════════════════════════════════════
// CONFIGURAÇÕES
// ══════════════════════════════════════════════════════════════
// Substitua pela sua Public Key do Mercado Pago
const MP_PUBLIC_KEY = 'YOUR_MP_PUBLIC_KEY';
const mp = typeof MercadoPago !== 'undefined' ? new MercadoPago(MP_PUBLIC_KEY) : null;

// Para ativar os emails:
// 1. Acesse emailjs.com e crie conta grátis com ecal7450@gmail.com
// 2. Crie um Email Service (Gmail) e um Template
// 3. Substitua os valores abaixo pelos seus reais
// ══════════════════════════════════════════════════════════════
const EMAILJS_CONFIG = {
  publicKey:  'YOUR_EMAILJS_PUBLIC_KEY',   // Settings > API Keys
  serviceId:  'YOUR_EMAILJS_SERVICE_ID',   // Email Services > Service ID
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID',  // Email Templates > Template ID
};

// Email do admin que recebe os pedidos
const ADMIN_EMAIL = 'ecal7450@gmail.com';

// ── Estado da sessão ──────────────────────────────────────────
let currentUser  = JSON.parse(sessionStorage.getItem('qf_user'))  || null;
let currentStep  = 1;
let orderAddress = {};

// ── Inicialização EmailJS ────────────────────────────────────
if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

// ══════════════════════════════════════════════════════════════
// CARRINHO (também usado no index.html via localStorage)
// ══════════════════════════════════════════════════════════════
function getCart() {
  return JSON.parse(localStorage.getItem('quifabra_cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('quifabra_cart', JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem('quifabra_cart');
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatBRL(val) {
  return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

// ══════════════════════════════════════════════════════════════
// ABRIR CHECKOUT (chamado pelo botão no index.html / loja.html)
// ══════════════════════════════════════════════════════════════
window.openCheckout = function () {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Seu carrinho está vazio. Adicione produtos antes de finalizar.');
    return;
  }
  // Fechar sidebar se estiver aberto
  if (typeof toggleCart === 'function') {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar && sidebar.classList.contains('open')) toggleCart();
  }
  window.location.href = 'checkout.html';
};

// ══════════════════════════════════════════════════════════════
// CHECKOUT PAGE — INICIALIZAÇÃO
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.checkout-page')) return;

  populateSummary();

  // Se já está logado, pula para step 2
  if (currentUser) {
    document.getElementById('panel-step1').innerHTML = `
      <div class="checkout-panel__header">
        <div class="panel-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style="color:#16a34a;">Bem-vindo, ${currentUser.nome.split(' ')[0]}!</h2>
      </div>
      <div class="checkout-panel__body">
        <p style="color:#6b7280;font-size:.9rem;margin-bottom:12px;">Você está logado como <strong>${currentUser.email}</strong>.</p>
        <button class="btn-proceed" onclick="goToStep(2)">Continuar para Endereço →</button>
        <button onclick="logout()" style="width:100%;margin-top:8px;padding:10px;background:none;border:none;color:#9ca3af;font-size:.82rem;cursor:pointer;font-family:inherit;">Sair da conta</button>
      </div>
    `;
    setStep(1);
  }
});

// ── Preenche o resumo lateral ────────────────────────────────
function populateSummary() {
  const cart = getCart();
  const container = document.getElementById('summary-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p style="color:#9ca3af;font-size:.85rem;">Carrinho vazio.</p>';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="summary-item">
      <img class="summary-item__img" src="${item.img}" alt="${item.title}" />
      <div class="summary-item__info">
        <div class="summary-item__name">${item.title}</div>
        <div class="summary-item__qty">Qtd: ${item.qty}</div>
      </div>
      <div class="summary-item__price">${formatBRL(item.price * item.qty)}</div>
    </div>
  `).join('');

  const total = cartTotal(cart);
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl    = document.getElementById('summary-total');
  if (subtotalEl) subtotalEl.textContent = formatBRL(total);
  if (totalEl)    totalEl.textContent    = formatBRL(total);
}

// ══════════════════════════════════════════════════════════════
// AUTH — AUTH TABS
// ══════════════════════════════════════════════════════════════
window.switchAuthTab = function(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
};

// ── Usuarios salvos em localStorage ─────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem('qf_users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('qf_users', JSON.stringify(users));
}

function setSession(user) {
  currentUser = user;
  sessionStorage.setItem('qf_user', JSON.stringify(user));
}

window.logout = function () {
  currentUser = null;
  sessionStorage.removeItem('qf_user');
  location.reload();
};

// ══════════════════════════════════════════════════════════════
// STEP 1 — Cadastro / Login
// ══════════════════════════════════════════════════════════════
window.proceedStep1 = function () {
  const activeTab = document.querySelector('.auth-tab.active')?.id;

  if (activeTab === 'tab-register') {
    handleRegister();
  } else {
    handleLogin();
  }
};

function handleRegister() {
  const nome   = val('reg-nome');
  const cpf    = val('reg-cpf').replace(/\D/g, '');
  const email  = val('reg-email');
  const cel    = val('reg-celular');
  const senha  = val('reg-senha');

  let valid = true;

  if (!nome) { showErr('err-reg-nome', true); valid = false; } else { showErr('err-reg-nome', false); }
  if (cpf.length < 11) { showErr('err-reg-cpf', true); valid = false; } else { showErr('err-reg-cpf', false); }
  if (!validateEmail(email)) { showErr('err-reg-email', true); valid = false; } else { showErr('err-reg-email', false); }
  if (cel.replace(/\D/g, '').length < 10) { showErr('err-reg-cel', true); valid = false; } else { showErr('err-reg-cel', false); }
  if (senha.length < 6) { showErr('err-reg-senha', true); valid = false; } else { showErr('err-reg-senha', false); }
  if (!valid) return;

  const users = getUsers();
  const exists = users.find(u => u.email === email);
  if (exists) {
    showErr('err-reg-email', true, 'E-mail já cadastrado. Use "Já tenho conta".');
    return;
  }

  const user = { nome, cpf, email, cel, senha, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  setSession(user);
  goToStep(2);
}

function handleLogin() {
  const email = val('login-email');
  const senha = val('login-senha');
  const errEl = document.getElementById('login-error');

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.senha === senha);

  if (!user) {
    errEl.textContent = '❌ E-mail ou senha incorretos.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  setSession(user);
  goToStep(2);
}

// ══════════════════════════════════════════════════════════════
// STEP 2 — Endereço + CEP
// ══════════════════════════════════════════════════════════════
window.onCepInput = function (input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
  input.value = v;

  const digits = v.replace(/\D/g, '');
  if (digits.length === 8) fetchCep(digits);
};

async function fetchCep(cep) {
  const infoEl = document.getElementById('cep-info');
  infoEl.textContent = '🔍 Buscando CEP...';
  infoEl.classList.add('show');

  try {
    const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();

    if (data.erro) {
      infoEl.textContent = '❌ CEP não encontrado. Preencha o endereço manualmente.';
      return;
    }

    // Preenche campos automaticamente
    setField('addr-rua',    data.logradouro || '');
    setField('addr-bairro', data.bairro     || '');
    setField('addr-cidade', data.localidade || '');
    setField('addr-estado', data.uf         || '');
    infoEl.textContent = `✅ ${data.logradouro}, ${data.bairro} — ${data.localidade}/${data.uf}`;

    // Foca no número após preencher
    document.getElementById('addr-numero')?.focus();

  } catch {
    infoEl.textContent = '⚠️ Erro ao buscar CEP. Preencha manualmente.';
  }
}

window.proceedStep2 = function () {
  const cep    = val('addr-cep').replace(/\D/g, '');
  const rua    = val('addr-rua');
  const numero = val('addr-numero');
  const bairro = val('addr-bairro');
  const cidade = val('addr-cidade');

  if (cep.length < 8 || !rua || !numero || !bairro || !cidade) {
    showErr('err-cep', cep.length < 8);
    alert('Por favor, preencha todos os campos obrigatórios do endereço.');
    return;
  }

  showErr('err-cep', false);
  orderAddress = {
    cep:    val('addr-cep'),
    rua, numero,
    comp:   val('addr-comp'),
    bairro, cidade,
    estado: val('addr-estado'),
  };

  buildReview();
  goToStep(3);
};

// ══════════════════════════════════════════════════════════════
// STEP 3 — Revisão e Confirmação
// ══════════════════════════════════════════════════════════════
function buildReview() {
  const cart = getCart();
  const total = cartTotal(cart);
  const reviewEl = document.getElementById('order-review');
  if (!reviewEl) return;

  const addr = orderAddress;
  reviewEl.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="background:#f4f5f7;border-radius:10px;padding:16px;">
        <p style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:8px;">Cliente</p>
        <p style="font-weight:700;color:#1d2533;">${currentUser?.nome}</p>
        <p style="font-size:.85rem;color:#6b7280;">${currentUser?.email} · ${currentUser?.cel || ''}</p>
      </div>
      <div style="background:#f4f5f7;border-radius:10px;padding:16px;">
        <p style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:8px;">Entrega</p>
        <p style="font-weight:700;color:#1d2533;">${addr.rua}, ${addr.numero}${addr.comp ? ', '+addr.comp : ''}</p>
        <p style="font-size:.85rem;color:#6b7280;">${addr.bairro} · ${addr.cidade}/${addr.estado} · CEP ${addr.cep}</p>
        <p style="font-size:.82rem;color:#16a34a;font-weight:700;margin-top:6px;">🚚 Frete Grátis</p>
      </div>
      <div style="background:#f4f5f7;border-radius:10px;padding:16px;">
        <p style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:8px;">Produtos</p>
        ${cart.map(item => `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:.88rem;color:#1d2533;">${item.qty}× ${item.title}</span>
            <span style="font-weight:700;font-size:.88rem;">${formatBRL(item.price * item.qty)}</span>
          </div>
        `).join('')}
        <hr style="border:none;border-top:1px solid #e8eaed;margin:10px 0;" />
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:800;color:#1d2533;">Total</span>
          <span style="font-family:'Montserrat',sans-serif;font-size:1.3rem;font-weight:900;color:#1d2533;">${formatBRL(total)}</span>
        </div>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════
// CONFIRMAR PEDIDO E INICIAR MERCADO PAGO
// ══════════════════════════════════════════════════════════════
window.confirmOrder = async function () {
  const btn  = document.getElementById('btn-confirm');
  const cart = getCart();
  if (cart.length === 0) return;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Processando...';

  const orderNum = 'QF-' + Date.now().toString(36).toUpperCase();
  const orderDate = new Date().toLocaleString('pt-BR');
  const total     = cartTotal(cart);

  const order = {
    id:        orderNum,
    date:      orderDate,
    customer:  currentUser,
    address:   orderAddress,
    items:     cart,
    total,
    status:    'Pendente',
    createdAt: new Date().toISOString()
  };

  try {
    // 1. Salvar pedido no Firebase Firestore
    await setDoc(doc(db, "orders", orderNum), order);

    // 2. Chamar a API da Vercel para gerar o pagamento no Mercado Pago
    const response = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, customer: currentUser, orderId: orderNum })
    });

    const preference = await response.json();

    if (preference.id && mp) {
      // 3. Ocultar o botão e carregar o Brick do Mercado Pago
      btn.style.display = 'none';
      const bricksBuilder = mp.bricks();
      
      await bricksBuilder.create("wallet", "wallet_container", {
        initialization: {
          preferenceId: preference.id,
          redirectMode: "self"
        }
      });
      
      // Salva info local só para referência rápida (opcional, já que está no Firebase)
      const orders = JSON.parse(localStorage.getItem('qf_orders')) || [];
      orders.push(order);
      localStorage.setItem('qf_orders', JSON.stringify(orders));
      
      clearCart();
      updateCartBadges();

      // Email pode ser enviado depois via webhook, ou aqui se desejar (simplificado)
      sendEmailConfirm(orderNum, orderDate, cart, total);
      
    } else {
      alert("Erro ao conectar com o Mercado Pago. Verifique a configuração.");
      btn.disabled = false;
      btn.innerHTML = '✅ Gerar Pagamento';
    }

  } catch (error) {
    console.error("Erro no checkout:", error);
    alert("Falha ao processar pedido. Tente novamente.");
    btn.disabled = false;
    btn.innerHTML = '✅ Gerar Pagamento';
  }
};

function sendEmailConfirm(orderNum, orderDate, cart, total) {
  const itemsText = cart.map(i => `• ${i.qty}× ${i.title} — ${formatBRL(i.price * i.qty)}`).join('\n');
  const addrText  = `${orderAddress.rua}, ${orderAddress.numero}${orderAddress.comp ? ', '+orderAddress.comp : ''}, ${orderAddress.bairro} — ${orderAddress.cidade}/${orderAddress.estado} — CEP ${orderAddress.cep}`;

  if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
      to_email:     ADMIN_EMAIL,
      client_email: currentUser.email,
      order_id:     orderNum,
      order_date:   orderDate,
      client_name:  currentUser.nome,
      client_phone: currentUser.cel || 'Não informado',
      client_cpf:   currentUser.cpf || 'Não informado',
      address:      addrText,
      items:        itemsText,
      total:        formatBRL(total),
      shipping:     'GRÁTIS',
    }).catch(console.warn);
  }
}

// ══════════════════════════════════════════════════════════════
// ADMIN — verificação (usada no admin.html)
// ══════════════════════════════════════════════════════════════
window.isAdmin = function () {
  return currentUser && currentUser.email === ADMIN_EMAIL;
};

window.getAllOrders = function () {
  return JSON.parse(localStorage.getItem('qf_orders')) || [];
};

// ══════════════════════════════════════════════════════════════
// NAVEGAÇÃO ENTRE STEPS
// ══════════════════════════════════════════════════════════════
window.goToStep = function (step) {
  // Esconde todos os painéis
  ['panel-step1', 'panel-step2', 'panel-step3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.style.display = (i + 1 === step) ? 'block' : 'none';
  });
  currentStep = step;
  setStep(step);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function setStep(active, done = false) {
  [1, 2, 3].forEach(n => {
    const stepEl = document.getElementById('step-' + n);
    if (!stepEl) return;
    stepEl.classList.remove('active', 'done');
    if (n < active) stepEl.classList.add('done');
    else if (n === active) stepEl.classList.add(done ? 'done' : 'active');

    const numEl = stepEl.querySelector('.step__num');
    if (numEl && n < active) numEl.textContent = '✓';

    if (n < 3) {
      const div = document.getElementById('divider-' + n);
      if (div) div.classList.toggle('done', n < active);
    }
  });
}

// ══════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ══════════════════════════════════════════════════════════════
function val(id)  { return document.getElementById(id)?.value.trim() || ''; }
function setField(id, v) {
  const el = document.getElementById(id);
  if (el) el.value = v;
}
function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function showErr(id, show, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('show', show);
  if (msg) el.textContent = msg;
}

// Atualiza badges do carrinho em qualquer página
function updateCartBadges() {
  const cart   = getCart();
  const total  = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge-count').forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ── Máscaras ──────────────────────────────────────────────────
const cpfField = document.getElementById('reg-cpf');
cpfField?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  e.target.value = v.slice(0, 14);
});

const celField = document.getElementById('reg-celular');
celField?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length <= 10) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  else                v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  e.target.value = v.trim().replace(/-$/, '');
});
