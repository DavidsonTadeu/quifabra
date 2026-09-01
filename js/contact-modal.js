/**
 * Quifabra - Modal de Atendimento via WhatsApp
 */
import { db, collection, addDoc } from './firebase-config.js';
import { saveLeadCentralized } from './lead-service.js';

const QF_WHATSAPP = '553173335573';

function injectContactModal() {
  if (document.getElementById('qfContactModal')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/css/contact-modal.css';
  document.head.appendChild(link);

  const html = `
    <div class="qf-modal-overlay" id="qfContactModal">
      <div class="qf-modal-card">
        <button class="qf-modal-close" id="qfCloseModal" aria-label="Fechar">&times;</button>
        
        <div class="qf-modal-logo-badge">
          💬
        </div>

        <h3 class="qf-modal-title">Você será encaminhado para nosso WhatsApp</h3>
        <p class="qf-modal-subtitle">Precisamos dessas informações para continuar com seu atendimento</p>

        <form id="qfModalForm">
          <div class="qf-modal-field">
            <label for="qfModalNome">Nome</label>
            <input type="text" id="qfModalNome" placeholder="Digite seu nome" required />
          </div>

          <div class="qf-modal-field">
            <label for="qfModalWhatsapp">Whatsapp</label>
            <input type="tel" id="qfModalWhatsapp" placeholder="Digite seu número de telefone" required />
          </div>

          <div class="qf-modal-field">
            <label for="qfModalEmail">E-mail</label>
            <input type="email" id="qfModalEmail" placeholder="Digite seu E-mail" required />
          </div>

          <button type="submit" class="qf-modal-btn" id="qfModalSubmitBtn">
            ATENDIMENTO VIA WHATSAPP
          </button>
        </form>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);

  setupEvents();
}

function openModal() {
  const modal = document.getElementById('qfContactModal');
  if (modal) modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('qfContactModal');
  if (modal) modal.classList.remove('active');
}

function setupEvents() {
  const modal = document.getElementById('qfContactModal');
  const closeBtn = document.getElementById('qfCloseModal');
  const form = document.getElementById('qfModalForm');
  const phoneInput = document.getElementById('qfModalWhatsapp');

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Máscara de telefone
  phoneInput?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length <= 10) {
      v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    e.target.value = v.trim().replace(/-$/, '');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('qfModalNome')?.value.trim();
    const whatsapp = document.getElementById('qfModalWhatsapp')?.value.trim();
    const email = document.getElementById('qfModalEmail')?.value.trim();
    const submitBtn = document.getElementById('qfModalSubmitBtn');

    if (!nome || !whatsapp || !email) return;

    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    // Salva lead no Firestore (sem duplicar) e dispara notificação por e-mail
    await saveLeadCentralized({
      tipo: 'Popup de Contato / WhatsApp',
      origem: 'Popup Fale Conosco',
      nome,
      celular: whatsapp,
      email
    });

    // Abrir o WhatsApp
    const cleanPhone = whatsapp.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá! Meu nome é ${nome} (E-mail: ${email}). Gostaria de atendimento e orçamentos.`);
    const waUrl = `https://wa.me/${QF_WHATSAPP}?text=${msg}`;

    closeModal();
    form.reset();
    submitBtn.textContent = 'ATENDIMENTO VIA WHATSAPP';
    submitBtn.disabled = false;

    window.open(waUrl, '_blank');
  });
}

// Vincula o clique dos botões da página ao popup
export function bindContactButtons() {
  if (window.location.pathname.includes('admin')) return;

  injectContactModal();

  document.querySelectorAll('a[href="#contato"], .btn--primary:not([type="submit"])').forEach(btn => {
    // Evita alterar o botão de submit do form do rodapé ou links externos
    if (btn.id === 'form-submit' || btn.getAttribute('href')?.startsWith('http')) return;
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindContactButtons);
} else {
  bindContactButtons();
}
