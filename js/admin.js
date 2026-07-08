import { db, collection, getDocs, doc, updateDoc, onSnapshot } from './firebase-config.js';

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

window.adminLogin = async function() {
  const email = document.getElementById('admin-email').value;
  const pass  = document.getElementById('admin-pass').value;
  const err   = document.getElementById('admin-error');

  if (email === 'ecal7450@gmail.com' && pass.length >= 6) {
    sessionStorage.setItem('qf_admin_logged', 'true');
    window.location.reload();
  } else {
    err.style.display = 'block';
  }
};

window.adminLogout = function() {
  sessionStorage.removeItem('qf_admin_logged');
  window.location.reload();
};

function updateStats() {
  const totalGeral = allOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendentes  = allOrders.filter(o => o.status === 'Pendente').length;
  const enviados   = allOrders.filter(o => o.status === 'Enviado' || o.status === 'Entregue').length;

  const statTotal    = document.getElementById('stat-total');
  const statPendente = document.getElementById('stat-pendente');
  const statEnviado  = document.getElementById('stat-enviado');
  const statReceita  = document.getElementById('stat-receita');

  if (statTotal)    statTotal.textContent    = allOrders.length;
  if (statPendente) statPendente.textContent = pendentes;
  if (statEnviado)  statEnviado.textContent  = enviados;
  if (statReceita)  statReceita.textContent  = 'R$ ' + totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function renderOrders() {
  const wrap = document.getElementById('orders-table-wrap');
  if (!wrap) return;

  if (allOrders.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><h3>Nenhum pedido encontrado.</h3></div>`;
    return;
  }

  wrap.innerHTML = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Data</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${allOrders.map(o => `
          <tr>
            <td style="font-weight:800;font-family:monospace;color:#1E96C8;">${o.id}</td>
            <td style="font-size:.82rem;color:#6b7280;">${o.date}</td>
            <td>
              <div style="font-weight:700;">${o.customer?.nome || '—'}</div>
              <div style="font-size:.75rem;color:#9ca3af;">${o.customer?.email || ''}</div>
            </td>
            <td style="font-weight:800;">R$ ${(o.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>
              <select class="status-select" onchange="updateStatus('${o.id}', this.value)">
                <option value="Pendente" ${o.status === 'Pendente' ? 'selected' : ''}>⏳ Pendente</option>
                <option value="Pago" ${o.status === 'Pago' ? 'selected' : ''}>✅ Pago</option>
                <option value="Em Separação" ${o.status === 'Em Separação' ? 'selected' : ''}>📦 Em Separação</option>
                <option value="Enviado" ${o.status === 'Enviado' ? 'selected' : ''}>🚚 Enviado</option>
                <option value="Entregue" ${o.status === 'Entregue' ? 'selected' : ''}>🎉 Entregue</option>
                <option value="Cancelado" ${o.status === 'Cancelado' ? 'selected' : ''}>❌ Cancelado</option>
              </select>
            </td>
            <td>
              <button class="btn btn--secondary" style="padding:6px 12px;font-size:.75rem;" onclick="viewOrder('${o.id}')">Ver Detalhes</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
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

  document.getElementById('modal-order-id').textContent = 'Pedido ' + orderId;
  const addr = order.address || {};

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-section">
      <h4>Cliente</h4>
      <div class="modal-info-grid">
        <div class="info-row"><div class="key">Nome</div><div class="val">${order.customer?.nome || '—'}</div></div>
        <div class="info-row"><div class="key">CPF</div><div class="val">${order.customer?.cpf || '—'}</div></div>
        <div class="info-row"><div class="key">E-mail</div><div class="val">${order.customer?.email || '—'}</div></div>
        <div class="info-row"><div class="key">Celular</div><div class="val">${order.customer?.cel || '—'}</div></div>
      </div>
    </div>
    <div class="modal-section">
      <h4>Endereço de Entrega</h4>
      <div class="modal-info-grid">
        <div class="info-row full"><div class="key">Logradouro</div><div class="val">${addr.rua || '—'}, ${addr.numero || ''} ${addr.comp ? '(' + addr.comp + ')' : ''}</div></div>
        <div class="info-row"><div class="key">Bairro</div><div class="val">${addr.bairro || '—'}</div></div>
        <div class="info-row"><div class="key">Cidade/UF</div><div class="val">${addr.cidade || '—'}/${addr.estado || '—'}</div></div>
        <div class="info-row"><div class="key">CEP</div><div class="val">${addr.cep || '—'}</div></div>
        <div class="info-row"><div class="key">Frete</div><div class="val" style="color:#16a34a;font-weight:800;">GRÁTIS 🚚</div></div>
      </div>
    </div>
    <div class="modal-section">
      <h4>Itens do Pedido</h4>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${(order.items || []).map(i => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#fafafa;border-radius:8px;">
            <div>
              <div style="font-weight:700;font-size:.88rem;">${i.title}</div>
              <div style="font-size:.75rem;color:#9ca3af;">Qtd: ${i.qty} × R$ ${i.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div style="font-weight:800;font-family:'Montserrat',sans-serif;">R$ ${(i.price * i.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 10px;border-top:2px solid #1D2533;margin-top:4px;">
          <span style="font-weight:800;">TOTAL</span>
          <span style="font-family:'Montserrat',sans-serif;font-size:1.2rem;font-weight:900;">R$ ${(order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px;">
      <a href="https://wa.me/55${(order.customer?.cel || '').replace(/\D/g, '')}" target="_blank" rel="noopener"
         style="flex:1;padding:12px;background:#25D366;color:white;border:none;border-radius:10px;font-weight:700;font-size:.88rem;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;">
        💬 WhatsApp do Cliente
      </a>
      <a href="mailto:${order.customer?.email || ''}"
         style="padding:12px 16px;background:#f0f9ff;color:#1E96C8;border:none;border-radius:10px;font-weight:700;font-size:.88rem;text-decoration:none;display:flex;align-items:center;justify-content:center;">
        ✉️ E-mail
      </a>
    </div>
  `;
  document.getElementById('orderModal').classList.add('open');
};

window.closeOrderModal = function() {
  document.getElementById('orderModal').classList.remove('open');
};

window.closeModal = function(e) {
  if (e.target === document.getElementById('orderModal')) closeOrderModal();
};

// CORRIGIDO: evitar uso do evento global `event`
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
    wrap.innerHTML = `<div class="empty-state"><h3>Nenhum cliente com pedidos ainda.</h3></div>`;
    return;
  }

  wrap.innerHTML = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Celular</th>
          <th>CPF</th>
          <th>Pedidos</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => {
          const numPedidos = allOrders.filter(o => o.customer?.email === u.email).length;
          return `
            <tr>
              <td style="font-weight:700;">${u.nome}</td>
              <td>${u.email}</td>
              <td>${u.cel || '—'}</td>
              <td style="font-size:.82rem;color:#9ca3af;">${u.cpf || '—'}</td>
              <td><span style="background:#f0f9ff;color:#1E96C8;padding:3px 10px;border-radius:12px;font-weight:700;font-size:.78rem;">${numPedidos}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}
