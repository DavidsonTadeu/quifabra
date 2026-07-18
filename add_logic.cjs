const fs = require('fs');

const adminHtmlPath = 'c:/Quifabra/admin.html';
let html = fs.readFileSync(adminHtmlPath, 'utf8');

const navItems = `
        <button class="nav-item" onclick="showSection('products', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          Produtos
        </button>
        <button class="nav-item" onclick="showSection('reports', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          Relatórios
        </button>
        <button class="nav-item" onclick="showSection('messages', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Mensagens
        </button>
        <button class="nav-item" onclick="showSection('settings', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Configurações
        </button>`;

const newSections = `
      </div>

      <!-- SECTION: REPORTS -->
      <div id="section-reports" style="display:none;">
        <div class="admin-header">
          <h1 class="admin-title">Relatórios</h1>
          <p class="admin-subtitle">Resumo de desempenho e vendas da loja.</p>
        </div>
        <!-- KPI Cards -->
        <div class="stats-grid" style="margin-bottom:32px;" id="reports-kpis">
          <div class="stat-card">
            <div class="stat-header"><span class="stat-title">Receita Total</span><div class="stat-icon icon-green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div></div>
            <div class="stat-value" id="rep-receita">—</div><div class="stat-trend">Pedidos pagos e entregues</div>
          </div>
          <div class="stat-card">
            <div class="stat-header"><span class="stat-title">Ticket Médio</span><div class="stat-icon icon-blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div></div>
            <div class="stat-value" id="rep-ticket">—</div><div class="stat-trend">Por pedido</div>
          </div>
          <div class="stat-card">
            <div class="stat-header"><span class="stat-title">Pedidos Pagos</span><div class="stat-icon icon-purple"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div></div>
            <div class="stat-value" id="rep-pagos">—</div><div class="stat-trend">Status: Pago / Entregue</div>
          </div>
          <div class="stat-card">
            <div class="stat-header"><span class="stat-title">Taxa de Cancelamento</span><div class="stat-icon icon-amber"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg></div></div>
            <div class="stat-value" id="rep-cancel">—</div><div class="stat-trend">Em relação ao total</div>
          </div>
        </div>
        <div class="orders-panel">
          <div class="orders-panel__header"><h2>Pedidos por Status</h2></div>
          <div id="reports-status-table" style="padding:24px;"><!-- via JS --></div>
        </div>
      </div>

      <!-- SECTION: MESSAGES -->
      <div id="section-messages" style="display:none;">
        <div class="admin-header">
          <h1 class="admin-title">Mensagens</h1>
          <p class="admin-subtitle">Mensagens recebidas pelo formulário de contato do site.</p>
        </div>
        <div class="orders-panel">
          <div class="orders-panel__header"><h2>Caixa de Entrada</h2></div>
          <div id="messages-wrap"><!-- via JS --></div>
        </div>
      </div>

      <!-- SECTION: SETTINGS -->
      <div id="section-settings" style="display:none;">
        <div class="admin-header">
          <h1 class="admin-title">Configurações</h1>
          <p class="admin-subtitle">Dados e informações da loja.</p>
        </div>
        <div class="orders-panel">
          <div class="orders-panel__header"><h2>Informações da Loja</h2></div>
          <div style="padding:32px; max-width:600px;">
            <div class="login-field" style="margin-bottom:16px;">
              <label>Nome da Loja</label>
              <input type="text" id="cfg-nome" value="Quifabra" />
            </div>
            <div class="login-field" style="margin-bottom:16px;">
              <label>WhatsApp (com DDD)</label>
              <input type="text" id="cfg-whatsapp" placeholder="31999999999" />
            </div>
            <div class="login-field" style="margin-bottom:16px;">
              <label>E-mail de Contato</label>
              <input type="email" id="cfg-email" placeholder="contato@quifabra.com.br" />
            </div>
            <div class="login-field" style="margin-bottom:16px;">
              <label>Endereço</label>
              <input type="text" id="cfg-endereco" placeholder="Rua Exemplo, 123 - BH/MG" />
            </div>
            <div class="login-field" style="margin-bottom:24px;">
              <label>Aviso na Loja (opcional)</label>
              <textarea id="cfg-aviso" rows="3" style="width:100%;padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-md);font-family:inherit;" placeholder="Ex: Frete grátis acima de R$ 500!"></textarea>
            </div>
            <button class="btn-login" style="max-width:200px;margin:0;" onclick="saveSettings()">Salvar Configurações</button>
            <div id="settings-status" style="margin-top:12px;font-size:.85rem;font-weight:600;color:var(--color-primary);display:none;">Salvo com sucesso!</div>
          </div>
        </div>
      </div>`;

html = html.replace(/<button class="nav-item" onclick="showSection\('products', this\)">[\s\S]*?<\/button>/, navItems);
html = html.replace('</div>\r\n\r\n    </main>', newSections + '\r\n\r\n    </main>');
html = html.replace('</div>\n\n    </main>', newSections + '\n\n    </main>');

fs.writeFileSync(adminHtmlPath, html, 'utf8');
console.log('admin.html updated');

const adminJsPath = 'c:/Quifabra/js/admin.js';
let js = fs.readFileSync(adminJsPath, 'utf8');

const jsAppend = `
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
  wrap.innerHTML = Object.entries(statusCounts).map(([s, c]) => \`
    <div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid #F3F4F6;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:\${colors[s] || '#9CA3AF'};flex-shrink:0;"></span>
      <span style="flex:1;font-weight:500;">\${s}</span>
      <span style="font-weight:700;color:var(--color-brand);">\${c} pedido\${c !== 1 ? 's' : ''}</span>
      <span style="font-size:.8rem;color:var(--color-text-muted);">\${(c / allOrders.length * 100).toFixed(0)}%</span>
    </div>
  \`).join('');
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
    wrap.innerHTML = \`<div class="empty-state" style="padding:60px 24px;">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <h3>Nenhuma mensagem</h3><p>As mensagens do formulário de contato aparecerão aqui.</p>
    </div>\`;
    return;
  }
  wrap.innerHTML = \`<div style="overflow-x:auto;">
    <table class="orders-table">
      <thead><tr><th>Nome</th><th>E-mail</th><th>Mensagem</th><th>Data</th></tr></thead>
      <tbody>
        \${allMessages.map(m => \`
          <tr>
            <td style="font-weight:600;">\${escapeHtml(m.nome || '—')}</td>
            <td style="color:var(--color-text-muted);">\${escapeHtml(m.email || '—')}</td>
            <td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(m.mensagem || '—')}</td>
            <td style="font-size:.8rem;color:var(--color-text-faint);">\${m.createdAt ? new Date(m.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
          </tr>
        \`).join('')}
      </tbody>
    </table></div>\`;
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
`;

if (!js.includes('function loadReports()')) {
  fs.writeFileSync(adminJsPath, js + '\n' + jsAppend, 'utf8');
  console.log('js/admin.js updated');
}

