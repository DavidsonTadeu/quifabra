const fs = require('fs');

const adminHtmlPath = 'c:/Quifabra/admin.html';
const adminJsPath = 'c:/Quifabra/js/admin.js';

let html = fs.readFileSync(adminHtmlPath, 'utf8');
let js = fs.readFileSync(adminJsPath, 'utf8');

// 1. Update HTML
const headerRegex = /<div class="orders-panel__header">[\s\S]*?<div class="filter-bar">/;
const headerNew = `<div class="orders-panel__header" style="flex-wrap: wrap; gap: 16px;">
            <h2>Transações Recentes</h2>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; width: 100%; margin-top: 8px;">
              <select id="filter-year" onchange="window.applyAdvancedFilters()" style="padding:6px; font-size:0.85rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background: white;">
                <option value="">Ano (Todos)</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <select id="filter-month" onchange="window.applyAdvancedFilters()" style="padding:6px; font-size:0.85rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background: white;">
                <option value="">Mês (Todos)</option>
                <option value="01">Janeiro</option>
                <option value="02">Fevereiro</option>
                <option value="03">Março</option>
                <option value="04">Abril</option>
                <option value="05">Maio</option>
                <option value="06">Junho</option>
                <option value="07">Julho</option>
                <option value="08">Agosto</option>
                <option value="09">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
              <input type="number" id="filter-total" oninput="window.applyAdvancedFilters()" placeholder="Total (R$)" style="padding:6px; font-size:0.85rem; width:120px; border:1px solid var(--border-color); border-radius:var(--radius-md);" />
            </div>

            <div class="filter-bar" id="status-filter-bar">`;
html = html.replace(headerRegex, headerNew);

// Make sure the pills have data-status
html = html.replace(/<button class="filter-pill active" onclick="filterOrders\('all', this\)">Todos<\/button>/, `<button class="filter-pill active" data-status="all" onclick="filterOrders('all', this)">Todos</button>`);
html = html.replace(/<button class="filter-pill" onclick="filterOrders\('pendente', this\)">Pendente<\/button>/, `<button class="filter-pill" data-status="pendente" onclick="filterOrders('pendente', this)">Pendente</button>`);
html = html.replace(/<button class="filter-pill" onclick="filterOrders\('separacao', this\)">Separação<\/button>/, `<button class="filter-pill" data-status="separacao" onclick="filterOrders('separacao', this)">Separação</button>`);
html = html.replace(/<button class="filter-pill" onclick="filterOrders\('enviado', this\)">Enviado<\/button>/, `<button class="filter-pill" data-status="enviado" onclick="filterOrders('enviado', this)">Enviado</button>`);
html = html.replace(/<button class="filter-pill" onclick="filterOrders\('entregue', this\)">Entregue<\/button>/, `<button class="filter-pill" data-status="entregue" onclick="filterOrders('entregue', this)">Entregue</button>`);

// Fix duplicate Receita trend text in HTML
html = html.replace(/<div class="stat-trend"><span class="trend-up">↑ Receita processada<\/span><\/div>\s*<div class="stat-trend"><span class="trend-up">↑ Receita processada<\/span><\/div>/, '<div class="stat-trend"><span class="trend-up">↑ Receita processada</span></div>');


// 2. Update JS - Receita total
js = js.replace(
  /const totalGeral = allOrders\.reduce\(\(acc, o\) => acc \+ \(Number\(o\.total\) \|\| 0\), 0\);/,
  `const totalGeral = allOrders.filter(o => o.status !== 'Cancelado').reduce((acc, o) => acc + (Number(o.total) || 0), 0);`
);

// 3. Update JS - filter logic
const oldFilterCode = `window.filterOrders = function(status, btn) {
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrders(status);
};`;

const newFilterCode = `
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
`;

js = js.replace(oldFilterCode, newFilterCode);

// 4. Update JS - renderOrders signature and filtering
const oldRenderOrdersHeader = `function renderOrders(filterStatus = 'all') {
  const wrap = document.getElementById('orders-table-wrap');
  if (!wrap) return;

  const filtered = filterStatus === 'all' 
    ? allOrders 
    : allOrders.filter(o => o.status?.toLowerCase() === filterStatus.toLowerCase());`;

const newRenderOrdersHeader = `function renderOrders(filterStatus = 'all', filterYear = '', filterMonth = '', filterTotal = '') {
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
  }`;

js = js.replace(oldRenderOrdersHeader, newRenderOrdersHeader);

fs.writeFileSync(adminHtmlPath, html, 'utf8');
fs.writeFileSync(adminJsPath, js, 'utf8');
console.log('Filters updated in HTML and JS');
