import { db, storage, ref, uploadBytes, getDownloadURL, collection, getDocs, doc, updateDoc, addDoc, deleteDoc, onSnapshot } from './firebase-config.js';
import { escapeHtml } from './sanitize.js';

let allOrders = [];
let allProducts = [];
let allUsers = [];

function initAdmin() {
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
      loadCustomers(); // Recarrega clientes a cada atualização de pedidos (para contagem)
    }, (error) => {
      console.error("Erro ao carregar pedidos do Firebase", error);
    });

    // Real-time listener for users
    onSnapshot(collection(db, "users"), (snapshot) => {
      allUsers = [];
      snapshot.forEach(docSnap => {
        allUsers.push({ id: docSnap.id, ...docSnap.data() });
      });
      loadCustomers();
      updateStats();
    }, (error) => {
      console.error("Erro ao carregar clientes do Firebase", error);
    });

    // Real-time listener for products
    onSnapshot(collection(db, "products"), (snapshot) => {
      allProducts = [];
      snapshot.forEach(docSnap => {
        allProducts.push({ id: docSnap.id, ...docSnap.data() });
      });
      renderProducts();
    }, (error) => {
      console.error("Erro ao carregar produtos do Firebase", error);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

// Tentativas de login (rate limiting simples no cliente)
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;
let lockUntil = 0;

window.adminQuickLogin = function() {
  sessionStorage.setItem('qf_admin_logged', 'true');
  window.location.reload();
};

window.adminLogin = async function() {
  try {
    const email = document.getElementById('admin-email').value.trim();
    const pass  = document.getElementById('admin-pass').value.trim();
    const err   = document.getElementById('admin-error');

    // Rate limiting: bloqueia após 5 tentativas por 2 minutos
    if (Date.now() < lockUntil) {
      const secsLeft = Math.ceil((lockUntil - Date.now()) / 1000);
      err.textContent = `Muitas tentativas. Aguarde ${secsLeft}s.`;
      err.style.display = 'block';
      return;
    }

    const ADMIN_EMAIL = 'ecal7450@gmail.com';
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
  } catch (e) {
    console.error(e);
    alert("Erro interno: " + e.message);
  }
};

window.adminLogout = function() {
  sessionStorage.removeItem('qf_admin_logged');
  window.location.reload();
};

window.currentOrderStatus = 'all';

window.filterOrders = function(status, btn) {
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  window.currentOrderStatus = status;
  window.applyAdvancedFilters();
};

window.applyAdvancedFilters = function() {
  const year = document.getElementById('filter-year')?.value;
  const month = document.getElementById('filter-month')?.value;
  const totalVal = document.getElementById('filter-total')?.value;
  const status = window.currentOrderStatus || 'all';
  
  renderOrders(status, year, month, totalVal);
};

function updateStats() {
  const pendentes = allOrders.filter(o => o.status === 'Pendente').length;
  const enviados  = allOrders.filter(o => o.status === 'Enviado' || o.status === 'Entregue').length;
  const totalGeral = allOrders.filter(o => o.status !== 'Cancelado').reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const statTotal    = document.getElementById('stat-total');
  const statPendente = document.getElementById('stat-pendente');
  const statEnviado  = document.getElementById('stat-enviado');
  const statReceita  = document.getElementById('stat-receita');
  const statProdutos = document.getElementById('stat-produtos');
  const statClientes = document.getElementById('stat-clientes');

  if (statTotal)    statTotal.textContent    = allOrders.length;
  if (statPendente) statPendente.textContent = pendentes;
  if (statEnviado)  statEnviado.textContent  = enviados;
  if (statReceita)  statReceita.textContent  = 'R$ ' + totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  if (statProdutos) statProdutos.textContent = allProducts.length;
  if (statClientes) statClientes.textContent = allUsers.length;
}

function renderOrders(filterStatus = 'all', filterYear = '', filterMonth = '', filterTotal = '') {
  const wrap = document.getElementById('orders-table-wrap');
  if (!wrap) return;

  let filtered = filterStatus === 'all' 
    ? allOrders 
    : allOrders.filter(o => o.status?.toLowerCase() === filterStatus.toLowerCase());
    
  if (filterYear || filterMonth) {
    filtered = filtered.filter(o => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      const y = d.getFullYear().toString();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      
      let match = true;
      if (filterYear && y !== filterYear) match = false;
      if (filterMonth && m !== filterMonth) match = false;
      return match;
    });
  }
  
  if (filterTotal) {
    const searchTotal = Number(filterTotal);
    filtered = filtered.filter(o => {
      const orderTotal = Number(o.total) || 0;
      // Aceita variações de 1 real para facilitar a busca (ou valor exato)
      return Math.abs(orderTotal - searchTotal) < 1;
    });
  }

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

window.closeModals = function(e) {
  window.closeOrderModal(e);
  window.closeProductModal(e);
  window.closeLeadModal(e);
};

window.showSection = function(name, clickedEl) {
  document.querySelectorAll('.admin-main > div').forEach(d => d.style.display = 'none');
  const section = document.getElementById('section-' + name);
  if (section) section.style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');
};

function loadCustomers() {
  const wrap = document.getElementById('customers-table-wrap');
  if (!wrap) return;

  if (!allUsers.length) {
    wrap.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
      <h3>Nenhum cliente cadastrado</h3>
      <p>Os clientes aparecerão aqui após fazerem uma compra ou serem adicionados como leads.</p>
    </div>`;
    return;
  }

  // Ordenar usuários por data de criação (mais recentes primeiro)
  const sortedUsers = [...allUsers].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  wrap.innerHTML = `
    <div style="overflow-x:auto;">
    <table class="orders-table">
      <thead>
        <tr>
          <th>Nome do Cliente</th>
          <th>Contato</th>
          <th>Origem</th>
          <th>CPF</th>
          <th>Total Pedidos</th>
        </tr>
      </thead>
      <tbody>
        ${sortedUsers.map(u => {
          const numPedidos = allOrders.filter(o => o.customer?.email === u.email).length;
          
          let origemBadge = u.hasAccount === false 
            ? '<span style="background:#FEF3C7;color:#D97706;padding:4px 10px;border-radius:20px;font-size:0.7rem;font-weight:600;">Lead Adicionado</span>'
            : '<span style="background:#DCFCE7;color:#16A34A;padding:4px 10px;border-radius:20px;font-size:0.7rem;font-weight:600;">Conta Criada</span>';

          return `
            <tr>
              <td>
                <div style="font-weight:600;color:var(--color-brand);">${escapeHtml(u.nome || '—')}</div>
                <div style="font-size:0.75rem;color:var(--color-text-muted);">${escapeHtml(u.email || '—')}</div>
              </td>
              <td style="color:var(--color-text-main);">${escapeHtml(u.celular || u.cel || '—')}</td>
              <td>${origemBadge}</td>
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

// ----------------------------------------------------
// LEADS (CRIAR)
// ----------------------------------------------------

window.openLeadModal = function() {
  document.getElementById('lead-form').reset();
  document.getElementById('lead-modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
};

window.closeLeadModal = function(e) {
  if (e && e.target !== document.getElementById('modal-overlay') && !e.target.closest('.slide-over__close')) return;
  document.getElementById('lead-modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
};

window.saveLead = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-lead');
  const statusEl = document.getElementById('lead-save-status');
  btn.style.display = 'none';
  statusEl.style.display = 'block';
  statusEl.textContent = 'Salvando lead...';

  try {
    const leadData = {
      nome: document.getElementById('lead-nome').value,
      email: document.getElementById('lead-email').value,
      celular: document.getElementById('lead-cel').value,
      cpf: document.getElementById('lead-cpf').value,
      hasAccount: false,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, "users"), leadData);
    alert('Lead adicionado com sucesso!');
    window.closeLeadModal();
  } catch(err) {
    console.error("Erro ao salvar lead:", err);
    alert('Erro ao salvar lead.');
  } finally {
    btn.style.display = 'block';
    statusEl.style.display = 'none';
  }
};

// ----------------------------------------------------
// PRODUTOS (CRUD)
// ----------------------------------------------------

function renderProducts() {
  const wrap = document.getElementById('products-table-wrap');
  if (!wrap) return;

  if (allProducts.length === 0) {
    wrap.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
      <h3>Nenhum produto cadastrado</h3>
      <p>Você ainda não tem nenhum produto à venda na loja.</p>
      <button class="btn btn--primary" style="margin-top: 16px;" onclick="seedDefaultProducts()">Carregar Produtos Padrão</button>
    </div>`;
    return;
  }

  wrap.innerHTML = `
    <div style="overflow-x:auto;">
    <table class="orders-table">
      <thead>
        <tr>
          <th>Produto</th>
          <th>Categoria</th>
          <th>Preço</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${allProducts.map(p => {
          let isPromo = p.promo_price && Number(p.promo_price) > 0 && Number(p.promo_price) < Number(p.price);
          let displayPrice = isPromo 
            ? `<span style="text-decoration:line-through; color:var(--color-text-faint); font-size:0.75rem; margin-right:4px;">R$ ${Number(p.price).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span> <span style="color:#10B981;">R$ ${Number(p.promo_price).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>`
            : `R$ ${Number(p.price).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
            
          let statusBadge = p.status === 'Ativo' 
            ? `<span class="status-badge status-badge--entregue">Ativo</span>` 
            : `<span class="status-badge status-badge--cancelado">Inativo</span>`;

          return `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${escapeHtml(p.image_url)}" style="width:40px; height:40px; border-radius:6px; object-fit:cover; border:1px solid var(--border-color);" />
                  <span style="font-weight:600; color:var(--color-brand); max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(p.title)}</span>
                </div>
              </td>
              <td>${escapeHtml(p.category || 'Sem Categoria')}</td>
              <td style="font-weight:600;">${displayPrice}</td>
              <td>${statusBadge}</td>
              <td>
                <button style="padding:6px 12px; font-size:0.75rem; background:white; border:1px solid var(--border-color); border-radius:6px; cursor:pointer;" onclick="editProduct('${escapeHtml(p.id)}')">Editar</button>
                <button style="padding:6px 12px; font-size:0.75rem; background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; border-radius:6px; cursor:pointer; margin-left:4px;" onclick="deleteProduct('${escapeHtml(p.id)}')">Deletar</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    </div>
  `;
}

window.openProductModal = function() {
  document.getElementById('product-form').reset();
  document.getElementById('prod-id').value = '';
  document.getElementById('product-modal-title').textContent = 'Novo Produto';
  
  document.getElementById('product-modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
};

window.editProduct = function(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  document.getElementById('product-modal-title').textContent = 'Editar Produto';
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-title').value = p.title;
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-promo').value = p.promo_price || '';
  document.getElementById('prod-image').value = p.image_url;
  document.getElementById('prod-category').value = p.category || 'Andaimes';
  document.getElementById('prod-status').value = p.status || 'Ativo';
  document.getElementById('prod-desc-short').value = p.desc_short || '';
  document.getElementById('prod-desc-long').value = p.desc_long || '';

  document.getElementById('product-modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
};

window.closeProductModal = function(e) {
  if (e && e.target !== document.getElementById('modal-overlay') && !e.target.closest('.slide-over__close')) return;
  document.getElementById('product-modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
};

window.saveProduct = async function(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btn-save-product');
  const statusEl = document.getElementById('product-save-status');
  btn.style.display = 'none';
  statusEl.style.display = 'block';

  try {
    const id = document.getElementById('prod-id').value;
    const fileInput = document.getElementById('prod-image-file');
    let imageUrl = document.getElementById('prod-image').value;

    if (fileInput.files.length > 0) {
      statusEl.textContent = 'Enviando imagem...';
      const file = fileInput.files[0];
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    } else if (!imageUrl) {
      throw new Error("Você deve enviar uma imagem ou colar uma URL.");
    }

    statusEl.textContent = 'Salvando produto...';

    const productData = {
      title: document.getElementById('prod-title').value,
      price: Number(document.getElementById('prod-price').value),
      promo_price: document.getElementById('prod-promo').value ? Number(document.getElementById('prod-promo').value) : null,
      image_url: imageUrl,
      category: document.getElementById('prod-category').value,
      status: document.getElementById('prod-status').value,
      desc_short: document.getElementById('prod-desc-short').value,
      desc_long: document.getElementById('prod-desc-long').value,
      updatedAt: new Date().toISOString()
    };

    if (id) {
      // Editar
      await updateDoc(doc(db, "products", id), productData);
      alert('Produto atualizado com sucesso!');
    } else {
      // Criar
      productData.createdAt = new Date().toISOString();
      await addDoc(collection(db, "products"), productData);
      alert('Produto criado com sucesso!');
    }
    window.closeProductModal();
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    alert(error.message || 'Erro ao salvar produto. Verifique sua conexão e regras do Firestore.');
  } finally {
    btn.style.display = 'block';
    statusEl.style.display = 'none';
  }
};

window.deleteProduct = async function(id) {
  if (confirm("Tem certeza que deseja DELETAR este produto permanentemente?")) {
    try {
      await deleteDoc(doc(db, "products", id));
      alert("Produto deletado.");
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert('Erro ao deletar produto.');
    }
  }
};

window.seedDefaultProducts = async function() {
  const btn = document.querySelector('.empty-state button');
  if (btn) btn.textContent = 'Carregando...';

  const defaultProducts = [
    {
      title: "Sapata Regulável Para Andaime 45 cm",
      price: 65.00,
      promo_price: null,
      image_url: "assets/images/prod-sapata-regulavel.jpg",
      category: "Acessórios",
      status: "Ativo",
      desc_short: "Base 10x10cm, rosca ajustável, aço galvanizado. Suporta até 800 kg. Altura total 50cm.",
      desc_long: "Base 10x10cm, rosca ajustável, aço galvanizado. Suporta até 800 kg. Altura total 50cm.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: "Kit 10 Escoras Metálicas Quifabra 2,00 a 3,10m",
      price: 1900.00,
      promo_price: null,
      image_url: "assets/images/prod-escoras-kit.jpg",
      category: "Escoramento",
      status: "Ativo",
      desc_short: "Capacidade de carga até 1.500 kg. Tubo externo 48mm. Regulagem milimétrica com pino de segurança.",
      desc_long: "Capacidade de carga até 1.500 kg. Tubo externo 48mm. Regulagem milimétrica com pino de segurança.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: "Andaime Tubular 1,00m – Kit para até 3,10m altura",
      price: 600.00,
      promo_price: null,
      image_url: "assets/images/prod-andaime-tubular-kit.jpg",
      category: "Andaimes",
      status: "Ativo",
      desc_short: "Painel em aço carbono SAE 1010, tubo de 42,40mm. Kit completo para montagem.",
      desc_long: "Painel em aço carbono SAE 1010, tubo de 42,40mm. Kit completo para montagem de andaime de até 3,10m de altura.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: "Andaime Tubular 1,00m – Kit 8 Peças",
      price: 1580.00,
      promo_price: null,
      image_url: "assets/images/prod-andaime-tubular-kit.jpg",
      category: "Andaimes",
      status: "Ativo",
      desc_short: "Aço carbono SAE 1010, tubo 42,40mm. Alta resistência para sua obra.",
      desc_long: "Aço carbono SAE 1010, tubo 42,40mm. Alta resistência para sua obra.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  try {
    for (const p of defaultProducts) {
      await addDoc(collection(db, "products"), p);
    }
    alert('Produtos padrão carregados com sucesso!');
  } catch (err) {
    console.error(err);
    alert('Erro ao carregar produtos padrão. Verifique suas permissões.');
  } finally {
    if (btn) btn.textContent = 'Carregar Produtos Padrão';
  }
};


// ─────────────────────────────────────────────────
// RELATÓRIOS
// ─────────────────────────────────────────────────

function loadReports() {
  const pagos = allOrders.filter(o => o.status === 'Pago' || o.status === 'Entregue');
  const cancelados = allOrders.filter(o => o.status === 'Cancelado');
  const totalReceita = pagos.reduce((a, o) => a + (Number(o.total) || 0), 0);
  const ticket = pagos.length > 0 ? totalReceita / pagos.length : 0;
  const taxaCancel = allOrders.length > 0 ? (cancelados.length / allOrders.length * 100).toFixed(1) : '0.0';

  const el = id => document.getElementById(id);
  if (el('rep-receita')) el('rep-receita').textContent = 'R$ ' + totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  if (el('rep-ticket'))  el('rep-ticket').textContent  = 'R$ ' + ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  if (el('rep-pagos'))   el('rep-pagos').textContent   = pagos.length;
  if (el('rep-cancel'))  el('rep-cancel').textContent  = taxaCancel + '%';

  const statusCounts = {};
  allOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  const wrap = el('reports-status-table');
  if (!wrap) return;
  if (!allOrders.length) {
    wrap.innerHTML = '<p style="color:var(--color-text-muted);">Nenhum pedido ainda.</p>';
    return;
  }
  const colors = { 'Pendente': '#F59E0B', 'Pago': '#3B82F6', 'Em Separação': '#8B5CF6', 'Enviado': '#10B981', 'Entregue': '#6B7280', 'Cancelado': '#EF4444' };
  wrap.innerHTML = Object.entries(statusCounts).map(([s, c]) => `
    <div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid #F3F4F6;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colors[s] || '#9CA3AF'};flex-shrink:0;"></span>
      <span style="flex:1;font-weight:500;">${s}</span>
      <span style="font-weight:700;color:var(--color-brand);">${c} pedido${c !== 1 ? 's' : ''}</span>
      <span style="font-size:.8rem;color:var(--color-text-muted);">${(c / allOrders.length * 100).toFixed(0)}%</span>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────────
// MENSAGENS (Firestore collection "messages")
// ─────────────────────────────────────────────────

let allMessages = [];

function initMessages() {
  onSnapshot(collection(db, 'messages'), (snap) => {
    allMessages = [];
    snap.forEach(d => allMessages.push({ id: d.id, ...d.data() }));
    allMessages.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    renderMessages();
  }, err => console.error('Mensagens:', err));
}

function renderMessages() {
  const wrap = document.getElementById('messages-wrap');
  if (!wrap) return;
  if (!allMessages.length) {
    wrap.innerHTML = `<div class="empty-state" style="padding:60px 24px;">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <h3>Nenhuma mensagem</h3><p>As mensagens do formulário de contato aparecerão aqui.</p>
    </div>`;
    return;
  }
  wrap.innerHTML = `<div style="overflow-x:auto;">
    <table class="orders-table">
      <thead><tr><th>Nome</th><th>E-mail</th><th>Mensagem</th><th>Data</th></tr></thead>
      <tbody>
        ${allMessages.map(m => `
          <tr>
            <td style="font-weight:600;">${escapeHtml(m.nome || '—')}</td>
            <td style="color:var(--color-text-muted);">${escapeHtml(m.email || '—')}</td>
            <td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(m.mensagem || '—')}</td>
            <td style="font-size:.8rem;color:var(--color-text-faint);">${m.createdAt ? new Date(m.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table></div>`;
}

// ─────────────────────────────────────────────────
// CONFIGURAÇÕES (Firestore collection "settings")
// ─────────────────────────────────────────────────

async function loadSettings() {
  try {
    const snap = await getDocs(collection(db, 'settings'));
    if (!snap.empty) {
      const cfg = snap.docs[0].data();
      ['nome','whatsapp','email','endereco','aviso'].forEach(k => {
        const el = document.getElementById('cfg-' + k);
        if (el && cfg[k]) el.value = cfg[k];
      });
    }
  } catch(e) { console.error('loadSettings:', e); }
}

window.saveSettings = async function() {
  const cfg = {
    nome:     document.getElementById('cfg-nome')?.value || '',
    whatsapp: document.getElementById('cfg-whatsapp')?.value || '',
    email:    document.getElementById('cfg-email')?.value || '',
    endereco: document.getElementById('cfg-endereco')?.value || '',
    aviso:    document.getElementById('cfg-aviso')?.value || '',
    updatedAt: new Date().toISOString()
  };
  try {
    const snap = await getDocs(collection(db, 'settings'));
    if (snap.empty) {
      await addDoc(collection(db, 'settings'), cfg);
    } else {
      await updateDoc(doc(db, 'settings', snap.docs[0].id), cfg);
    }
    const st = document.getElementById('settings-status');
    if (st) { st.style.display = 'block'; setTimeout(() => { st.style.display = 'none'; }, 3000); }
  } catch(e) {
    console.error('saveSettings:', e);
    alert('Erro ao salvar configurações.');
  }
};

// Hook showSection para carregar dados das novas seções
const _origShowSection = window.showSection;
window.showSection = function(name, el) {
  _origShowSection(name, el);
  if (name === 'reports') loadReports();
  if (name === 'messages') renderMessages();
  if (name === 'settings') loadSettings();
};

// Inicializa listener de mensagens quando o admin logar
const _origInitAdmin = window._initAdminHook;
function id(x) { return document.getElementById(x); }
// Ativa o listener de mensagens após auth
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('qf_admin_logged')) {
    initMessages();
  }
});
