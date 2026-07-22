// ─────────────────────────────────────────────────────────────────
//  Quifabra Chatbot Widget
//  Fluxo: Saudação → Categoria → Nome → WhatsApp → Lead + WhatsApp
// ─────────────────────────────────────────────────────────────────
import { db, collection, addDoc } from './firebase-config.js';

// Número do WhatsApp da Quifabra (sem o +)
const QF_WHATSAPP = '5531991790838';

// ── Fluxo de conversa ──────────────────────────────────────────────
// Cada nó define o que o bot fala e o que fazer a seguir
const FLOW = {
  start: {
    msgs: ['Olá! Sou o assistente virtual da **Quifabra** 🏗️', 'Como posso te ajudar hoje?'],
    chips: ['🔩 Andaimes', '🏗️ Escoras', '📦 Acessórios', '💬 Falar com atendente'],
    next: (answer) => {
      if (answer === '💬 Falar com atendente') return 'ask_name';
      return 'category_selected';
    },
    saveAs: 'category'
  },
  category_selected: {
    msgs: ['Ótimo! Temos excelentes produtos nessa categoria.', 'Para te passar os melhores preços e detalhes, qual é o seu nome?'],
    input: true,
    next: () => 'ask_whatsapp',
    saveAs: 'nome'
  },
  ask_name: {
    msgs: ['Claro! Vou te conectar com nossa equipe 😊', 'Primeiro, qual é o seu nome?'],
    input: true,
    next: () => 'ask_whatsapp',
    saveAs: 'nome'
  },
  ask_whatsapp: {
    msgs: (state) => [`Prazer, **${state.nome}**! 👋`, 'Qual é o seu WhatsApp? (com DDD)'],
    input: true,
    next: () => 'finalize',
    saveAs: 'whatsapp'
  },
  finalize: {
    msgs: (state) => [
      `Perfeito! Em breve um especialista entrará em contato 🚀`,
      `Ou, se preferir, clique abaixo para falar agora pelo WhatsApp!`
    ],
    cta: true,
    next: null
  }
};

// ── Injeção do HTML do Widget ──────────────────────────────────────
function injectWidget() {
  const html = `
    <!-- Chatbot Widget -->
    <link rel="stylesheet" href="/css/chatbot.css" />

    <!-- WhatsApp Button (left side, separate) -->
    <div class="qf-phone-wrap">
      <a class="qf-phone-btn"
         href="https://wa.me/${QF_WHATSAPP}?text=Olá!%20Vim%20pelo%20site%20da%20Quifabra%20e%20gostaria%20de%20mais%20informações."
         target="_blank" rel="noopener"
         title="Falar no WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>

    <div class="qf-chat-launcher" id="qfLauncher">
      <!-- Chat Toggle Button -->
      <button class="qf-chat-btn" id="qfChatBtn" title="Chat com Quifabra">
        <span class="qf-badge" id="qfBadge">1</span>
        <span class="qf-open-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </span>
        <span class="qf-close-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </span>
      </button>
    </div>

    <!-- Chat Window -->
    <div class="qf-chat-window" id="qfChatWindow">
      <div class="qf-chat-header">
        <div class="qf-chat-header-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div class="qf-chat-header-info">
          <p class="qf-chat-header-name">Assistente Quifabra</p>
          <span class="qf-chat-header-status">
            <span class="qf-status-dot"></span>
            Online agora
          </span>
        </div>
      </div>
      <div class="qf-chat-messages" id="qfMessages"></div>
      <div class="qf-chips" id="qfChips" style="display:none;"></div>
      <div class="qf-chat-input-row" id="qfInputRow" style="display:none;">
        <input class="qf-chat-input" id="qfInput" placeholder="Digite sua resposta..." autocomplete="off" />
        <button class="qf-chat-send" id="qfSend">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
}

// ── Estado da conversa ─────────────────────────────────────────────
let chatState = {
  currentNode: 'start',
  nome: '',
  whatsapp: '',
  category: '',
  started: false
};

// ── Funções de renderização ────────────────────────────────────────
function scrollToBottom() {
  const msgs = document.getElementById('qfMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function addMessage(text, type = 'bot') {
  const msgs = document.getElementById('qfMessages');
  if (!msgs) return;

  // Suporte a **bold**
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const el = document.createElement('div');
  el.className = `qf-msg qf-msg--${type}`;
  el.innerHTML = formatted;
  msgs.appendChild(el);
  scrollToBottom();
}

function showTyping() {
  const msgs = document.getElementById('qfMessages');
  const typing = document.createElement('div');
  typing.className = 'qf-typing';
  typing.id = 'qfTyping';
  typing.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typing);
  scrollToBottom();
  return typing;
}

function removeTyping() {
  const t = document.getElementById('qfTyping');
  if (t) t.remove();
}

function showChips(chips) {
  const container = document.getElementById('qfChips');
  const inputRow = document.getElementById('qfInputRow');
  if (!container) return;

  container.innerHTML = '';
  container.style.display = 'flex';
  if (inputRow) inputRow.style.display = 'none';

  chips.forEach(chip => {
    const btn = document.createElement('button');
    btn.className = 'qf-chip';
    btn.textContent = chip;
    btn.onclick = () => handleChipClick(chip);
    container.appendChild(btn);
  });
}

function showInput() {
  const chips = document.getElementById('qfChips');
  const inputRow = document.getElementById('qfInputRow');
  if (chips) chips.style.display = 'none';
  if (inputRow) inputRow.style.display = 'flex';

  setTimeout(() => {
    const inp = document.getElementById('qfInput');
    if (inp) inp.focus();
  }, 300);
}

function showCta(state) {
  const chips = document.getElementById('qfChips');
  const inputRow = document.getElementById('qfInputRow');
  if (chips) chips.style.display = 'none';
  if (inputRow) inputRow.style.display = 'none';

  const msgs = document.getElementById('qfMessages');
  const categoryText = state.category ? ` sobre "${state.category.replace(/^[^\s]+\s/, '')}"` : '';
  const waText = `Olá! Meu nome é ${state.nome} (${state.whatsapp}). Vim pelo site e tenho interesse${categoryText}.`;

  const btn = document.createElement('a');
  btn.href = `https://wa.me/${QF_WHATSAPP}?text=${encodeURIComponent(waText)}`;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.style.cssText = `
    display: block;
    text-align: center;
    margin: 4px 0;
    padding: 12px;
    background: #25D366;
    color: white;
    font-weight: 700;
    border-radius: 12px;
    text-decoration: none;
    font-size: 0.9rem;
    transition: 0.2s;
    animation: qf-msg-in 0.2s ease;
  `;
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle; margin-right:6px;">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    Falar agora no WhatsApp
  `;
  msgs.appendChild(btn);
  scrollToBottom();
}

// ── Processamento do nó ────────────────────────────────────────────
async function processNode(nodeKey) {
  const node = FLOW[nodeKey];
  if (!node) return;

  // Oculta chips/input durante resposta
  const chips = document.getElementById('qfChips');
  const inputRow = document.getElementById('qfInputRow');
  if (chips) chips.style.display = 'none';
  if (inputRow) inputRow.style.display = 'none';

  // Obtém mensagens (pode ser array ou função)
  const messages = typeof node.msgs === 'function' ? node.msgs(chatState) : node.msgs;

  // Exibe cada mensagem com delay e efeito de digitação
  for (let i = 0; i < messages.length; i++) {
    const typing = showTyping();
    await delay(800 + Math.random() * 400);
    removeTyping();
    addMessage(messages[i], 'bot');
    if (i < messages.length - 1) await delay(300);
  }

  // CTA (botão WhatsApp final)
  if (node.cta) {
    showCta(chatState);
    return;
  }

  // Chips de opções rápidas
  if (node.chips) {
    showChips(node.chips);
  }

  // Campo de texto
  if (node.input) {
    showInput();
  }
}

// ── Handlers ──────────────────────────────────────────────────────
async function handleChipClick(answer) {
  const node = FLOW[chatState.currentNode];
  if (!node) return;

  // Mostra resposta do usuário
  addMessage(answer, 'user');

  // Salva no estado
  if (node.saveAs) chatState[node.saveAs] = answer;

  // Avança para próximo nó
  const nextKey = typeof node.next === 'function' ? node.next(answer) : node.next;
  chatState.currentNode = nextKey;

  await delay(400);
  await processNode(nextKey);
}

async function handleUserInput() {
  const inp = document.getElementById('qfInput');
  if (!inp) return;
  const value = inp.value.trim();
  if (!value) return;

  const node = FLOW[chatState.currentNode];
  if (!node) return;

  inp.value = '';
  addMessage(value, 'user');

  // Salva no estado
  if (node.saveAs) chatState[node.saveAs] = value;

  // Se chegou no WhatsApp, salva o lead no Firestore
  if (node.saveAs === 'whatsapp') {
    await saveLead();
  }

  // Avança para próximo nó
  const nextKey = typeof node.next === 'function' ? node.next(value) : node.next;
  chatState.currentNode = nextKey;

  await delay(400);
  await processNode(nextKey);
}

// ── Salvar Lead no Firestore ───────────────────────────────────────
async function saveLead() {
  try {
    const categoryClean = chatState.category
      ? chatState.category.replace(/^[^\s]+\s/, '')
      : 'Chat';

    await addDoc(collection(db, 'users'), {
      nome: chatState.nome,
      celular: chatState.whatsapp,
      email: '',
      hasAccount: false,
      origem: 'Chatbot do Site',
      interesse: categoryClean,
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    // Silencioso — não interrompe a conversa se falhar
    console.warn('Chatbot: erro ao salvar lead', e);
  }
}

// ── Utilitário ────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Init ──────────────────────────────────────────────────────────
function initChatbot() {
  injectWidget();

  const btn = document.getElementById('qfChatBtn');
  const win = document.getElementById('qfChatWindow');
  const badge = document.getElementById('qfBadge');
  const sendBtn = document.getElementById('qfSend');
  const inputEl = document.getElementById('qfInput');

  if (!btn || !win) return;

  btn.addEventListener('click', async () => {
    const isOpen = win.classList.contains('open');

    if (isOpen) {
      win.classList.remove('open');
      btn.classList.remove('open');
    } else {
      win.classList.add('open');
      btn.classList.add('open');
      if (badge) badge.style.display = 'none';

      // Inicia o fluxo apenas na primeira abertura
      if (!chatState.started) {
        chatState.started = true;
        await delay(350);
        await processNode('start');
      }
    }
  });

  sendBtn?.addEventListener('click', handleUserInput);
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });

  // Auto-abre após 8s no primeiro acesso
  const hasOpened = sessionStorage.getItem('qf_chat_opened');
  if (!hasOpened) {
    setTimeout(async () => {
      const w = document.getElementById('qfChatWindow');
      const b = document.getElementById('qfChatBtn');
      const bg = document.getElementById('qfBadge');
      if (w && !w.classList.contains('open')) {
        sessionStorage.setItem('qf_chat_opened', '1');
        w.classList.add('open');
        if (b) b.classList.add('open');
        if (bg) bg.style.display = 'none';
        if (!chatState.started) {
          chatState.started = true;
          await delay(350);
          await processNode('start');
        }
      }
    }, 8000);
  }
}

// ── Aguarda o DOM e inicializa ─────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}
