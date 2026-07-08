import { db, collection, getDocs, doc, updateDoc, onSnapshot } from './firebase-config.js';
import { escapeHtml } from './sanitize.js';

let allOrders = [];

document.addEventListener('DOMContentLoaded', () => {
  const isAdmin = sessionStorage.getItem('qf_admin_logged');
  if (isAdmin) {
    document.getElementById('admin-login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';

    // Real-time listener for orders
    onSnapshot(collection(db, "orders"), (snapshot) => {
      allOrders = [];
      snapshot.forEach(docSnap => {
        allOrders.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort descending by date
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      renderOrders();
      updateStats();
      loadCustomers(); // Recarrega clientes a cada atualização de pedidos
    }, (error) => {
      console.error("Erro ao carregar pedidos do Firebase", error);
    });
  }
});

// Tentativas de login (rate limiting simples no cliente)
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;
let lockUntil = 0;

window.adminLogin = async function() {
  const email = document.getElementById('admin-email').value.trim();
  const pass  = document.getElementById('admin-pass').value;
  const err   = document.getElementById('admin-error');

  // Rate limiting: bloqueia após 5 tentativas por 2 minutos
  if (Date.now() < lockUntil) {
    const secsLeft = Math.ceil((lockUntil - Date.now()) / 1000);
    err.textContent = `Muitas tentativas. Aguarde ${secsLeft}s.`;
    err.style.display = 'block';
    return;
  }

  const ADMIN_EMAIL = 'ecal7450@gmail.com';
  // Senha configurada — altere para uma senha forte de sua escolha
  const ADMIN_PASS  = 'Quifabra@2024!';

  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    sessionStorage.setItem('qf_admin_logged', 'true');
    window.location.reload();
  } else {
    loginAttempts++;
    if (loginAttempts >= MAX_ATTEMPTS) {
      lockUntil = Date.now() + 120000; // Bloqueia por 2 min
      err.textContent = 'Muitas tentativas. Bloqueado por 2 minutos.';
    } else {
      err.textContent = `E-mail ou senha incorretos. Tentativas restantes: ${MAX_ATTEMPTS - loginAttempts}`;
    }
    err.style.display = 'block';
  }
};

window.adminLogout = function() {
  sessionStorage.removeItem('qf_admin_logged');
  window.location.reload();
};

window.filterOrders = function(status, btn) {
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrders(status);
};

function updateStats() {
  const pendentes = allOrders.filter(o => o.status === 'Pendente').length;
  const enviados  = allOrders.filter(o => o.status === 'Enviado' || o.status === 'Entregue').length;
  const totalGeral = allOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const statTotal    = document.getElementById('stat-total');
  const statPendente = document.getElementById('stat-pendente');
  const statEnviado  = document.getElementById('stat-enviado');
  const statReceita  = document.getElementById('stat-receita');

  if (statTotal)    statTotal.textContent    = allOrders.length;
  if (statPendente) statPendente.textContent = pendentes;
  if (statEnviado)  statEnviado.textContent  = enviados;
  if (statReceita)  statReceita.textContent  = 'R$ ' + totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function renderOrders(filterStatus = 'all') {
  const wrap = document.getElementById('orders-table-wrap');
  if (!wrap) return;

  const filtered = filterStatus === 'all' 
    ? allOrders 
    : allOrders.filter(o => o.status?.toLowerCase() === filterStatus.toLowerCase());

  if (filtered.length === 0) {
    wrap.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
      <h3>Nenhum pedido encontrado</h3>
      <p>Não há transações que correspondam a esse filtro.</p>
    </div>`;
    return;
  }

  wrap.innerHTML = `
    <div style="overflow-x:auto;">
    <table class="orders-table">
      <thead>
        <tr>
          <th>ID Transação</th>
          <th>Data</th>
          <th>Cliente</th>
          <th>Valor</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(o => {
          let badgeClass = 'status-badge--pendente';
          if(o.status === 'Em Separação') badgeClass = 'status-badge--separacao';
          if(o.status === 'Enviado') badgeClass = 'status-badge--enviado';
          if(o.status === 'Entregue') badgeClass = 'status-badge--entregue';
          if(o.status === 'Cancelado') badgeClass = 'status-badge--cancelado';
          
          return `
          <tr onclick="viewOrder('${escapeHtml(o.id)}')" style="cursor:pointer;">
            <td style="font-weight:600;font-family:monospace;color:var(--color-primary);">${escapeHtml(o.id.substring(0,8))}...</td>
            <td style="font-size:0.8rem;color:var(--color-text-muted);">${escapeHtml(o.date)}</td>
            <td>
              <div class="customer-info">
                <span class="customer-name">${escapeHtml(o.customer?.nome || '—')}</span>
                <span class="customer-email">${escapeHtml(o.customer?.email || '')}</span>
              </div>
            </td>
            <td style="font-weight:600;">R$ ${(o.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td onclick="event.stopPropagation()">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="status-badge ${badgeClass}" style="margin-right:4px;">${escapeHtml(o.status)}</span>
                <select class="status-select" style="padding:4px; font-size:0.75rem;" onchange="updateStatus('${escapeHtml(o.id)}', this.value)">
                  <option value="Pendente" ${o.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                  <option value="Pago" ${o.status === 'Pago' ? 'selected' : ''}>Pago</option>
                  <option value="Em Separação" ${o.status === 'Em Separação' ? 'selected' : ''}>Separação</option>
                  <option value="Enviado" ${o.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                  <option value="Entregue" ${o.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
                  <option value="Cancelado" ${o.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
              </div>
            </td>
            <td>
              <button style="padding:6px 12px; font-size:0.75rem; background:white; border:1px solid var(--border-color); border-radius:6px; cursor:pointer;" onclick="event.stopPropagation(); viewOrder('${escapeHtml(o.id)}')">
                Detalhes
              </button>
            </td>
          </tr>
        `}).join('')}
      </tbody>
    </table>
    </div>
  `;
}

window.updateStatus = async function(orderId, newStatus) {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: newStatus });
    // onSnapshot vai atualizar a UI automaticamente
  } catch(e) {
    console.error("Erro ao atualizar status", e);
    alert("Erro ao atualizar status. Verifique sua conexão e as permissões do Firestore.");
  }
};

window.viewOrder = function(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById('modal-title').textContent = 'Pedido #' + orderId.substring(0,8);
  const addr = order.address || {};

  document.getElementById('modal-body').innerHTML = `
    <div class="slide-section">
      <h4>Detalhes do Cliente</h4>
      <div class="info-grid">
        <div class="info-item"><span class="key">Nome</span><span class="val">${escapeHtml(order.customer?.nome || '—')}</span></div>
        <div class="info-item"><span class="key">CPF</span><span class="val">${escapeHtml(order.customer?.cpf || '—')}</span></div>
        <div class="info-item"><span class="key">E-mail</span><span class="val">${escapeHtml(order.customer?.email || '—')}</span></div>
        <div class="info-item"><span class="key">Celular</span><span class="val">${escapeHtml(order.customer?.cel || '—')}</span></div>
      </div>
    </div>
    
    <div class="slide-section">
      <h4>Endereço de Entrega</h4>
      <div class="info-grid">
        <div class="info-item full"><span class="key">Logradouro</span><span class="val">${escapeHtml(addr.rua || '—')}, ${escapeHtml(addr.numero || '')} ${addr.comp ? '(' + escapeHtml(addr.comp) + ')' : ''}</span></div>
        <div class="info-item"><span class="key">Bairro</span><span class="val">${escapeHtml(addr.bairro || '—')}</span></div>
        <div class="info-item"><span class="key">Cidade/UF</span><span class="val">${escapeHtml(addr.cidade || '—')} / ${escapeHtml(addr.estado || '—')}</span></div>
        <div class="info-item"><span class="key">CEP</span><span class="val">${escapeHtml(addr.cep || '—')}</span></div>
        <div class="info-item"><span class="key">Custo de Frete</span><span class="val" style="color:#10B981;">Gratuito</span></div>
      </div>
    </div>
    
    <div class="slide-section">
      <h4>Itens Comprados</h4>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${(order.items || []).map(i => `
          <div class="item-row">
            <div class="item-img"></div>
            <div class="item-details">
              <div class="item-name">${escapeHtml(i.title)}</div>
              <div class="item-qtd">Qtd: ${Number(i.qty)} × R$ ${Number(i.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="item-price">
              R$ ${(Number(i.price) * Number(i.qty)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px dashed var(--border-color);margin-top:8px;">
          <span style="font-weight:600;color:var(--color-text-muted);">Total do Pedido</span>
          <span style="font-size:1.25rem;font-weight:700;color:var(--color-brand);">R$ ${(order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
    
    <div style="display:flex;gap:12px;margin-top:16px;">
      <a href="https://wa.me/55${escapeHtml((order.customer?.cel || '').replace(/\D/g, ''))}" target="_blank" rel="noopener noreferrer"
         style="flex:1;padding:12px;background:#10B981;color:white;border-radius:8px;font-weight:600;font-size:0.875rem;text-align:center;text-decoration:none;">
        Falar no WhatsApp
      </a>
      <a href="mailto:${escapeHtml(order.customer?.email || '')}"
         style="padding:12px 20px;background:#F3F4F6;color:var(--color-brand);border-radius:8px;font-weight:600;font-size:0.875rem;text-decoration:none;">
        E-mail
      </a>
    </div>
  `;
  document.getElementById('order-modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
};

window.closeOrderModal = function(e) {
  if (e && e.target !== document.getElementById('modal-overlay') && !e.target.closest('.slide-over__close')) return;
  document.getElementById('order-modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
};

window.showSection = function(name, clickedEl) {
  document.querySelectorAll('.admin-main > div').forEach(d => d.style.display = 'none');
  const section = document.getElementById('section-' + name);
  if (section) section.style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');
};

function loadCustomers() {
  const usersMap = new Map();
  allOrders.forEach(o => {
    if (o.customer && !usersMap.has(o.customer.email)) {
      usersMap.set(o.customer.email, o.customer);
    }
  });

  const users = Array.from(usersMap.values());
  const wrap = document.getElementById('customers-table-wrap');
  if (!wrap) return;

  if (!users.length) {
    wrap.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
      <h3>Nenhum cliente cadastrado</h3>
      <p>Os clientes aparecerão aqui após fazerem uma compra.</p>
    </div>`;
    return;
  }

  wrap.innerHTML = `
    <div style="overflow-x:auto;">
    <table class="orders-table">
      <thead>
        <tr>
          <th>Nome do Cliente</th>
          <th>E-mail de Contato</th>
          <th>Celular</th>
          <th>CPF</th>
          <th>Total Pedidos</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => {
          const numPedidos = allOrders.filter(o => o.customer?.email === u.email).length;
          return `
            <tr>
              <td style="font-weight:600;color:var(--color-brand);">${escapeHtml(u.nome)}</td>
              <td style="color:var(--color-text-muted);">${escapeHtml(u.email)}</td>
              <td>${escapeHtml(u.cel || '—')}</td>
              <td style="font-size:0.85rem;color:var(--color-text-faint);">${escapeHtml(u.cpf || '—')}</td>
              <td><span style="background:#E0F2FE;color:#0369A1;padding:4px 12px;border-radius:20px;font-weight:600;font-size:0.75rem;">${numPedidos}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    </div>
  `;
}
