import { db, auth, googleProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, collection, query, where, getDocs, doc, getDoc, setDoc } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
  const loginBtns = document.querySelectorAll('.ml-google-btn, #google-login-btn');
  loginBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Erro no login:", error);
        alert("Erro ao fazer login com o Google. Certifique-se de que o provedor Google está ativado no Firebase Console.");
      }
    });
  });

  // Torna funções globais para o HTML acessá-las
  window.toggleAuthForm = function(formId) {
    document.getElementById('form-login').style.display = formId === 'login' ? 'block' : 'none';
    document.getElementById('form-register').style.display = formId === 'register' ? 'block' : 'none';
    const fg = document.getElementById('form-complete-google');
    if(fg) fg.style.display = 'none';
  };

  window.doLogin = async function() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-senha').value;
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'none';

    if (!email || !pass) {
      errEl.textContent = 'Preencha e-mail e senha.';
      errEl.style.display = 'block';
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error(error);
      errEl.textContent = 'E-mail ou senha incorretos.';
      errEl.style.display = 'block';
    }
  };

  window.doRegister = async function() {
    const email = document.getElementById('reg-email').value;
    const nome = document.getElementById('reg-nome').value;
    const pass = document.getElementById('reg-senha').value;
    const passConfirm = document.getElementById('reg-senha-confirm')?.value;
    const cpf = document.getElementById('reg-cpf')?.value || '';
    const cel = document.getElementById('reg-celular')?.value || '';
    const errEl = document.getElementById('reg-error');
    errEl.style.display = 'none';

    if (!email || !nome || !pass || !passConfirm || !cpf || !cel) {
      errEl.textContent = 'Preencha todos os campos.';
      errEl.style.display = 'block';
      return;
    }
    
    if (pass.length < 6) {
      errEl.textContent = 'A senha deve ter no mínimo 6 caracteres.';
      errEl.style.display = 'block';
      return;
    }
    
    if (pass !== passConfirm) {
      errEl.textContent = 'As senhas não coincidem.';
      errEl.style.display = 'block';
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCred.user, { displayName: nome });
      // Salva no Firestore - isso fará o cliente aparecer no painel Admin
      await setDoc(doc(db, 'users', userCred.user.uid), {
        nome: nome,
        email: email,
        cpf: cpf,
        celular: cel,
        hasAccount: true,
        createdAt: new Date().toISOString()
      });
      location.reload();
    } catch (error) {
      console.error('Erro ao criar conta:', error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        errEl.textContent = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        errEl.textContent = 'E-mail inválido.';
      } else if (error.code === 'auth/weak-password') {
        errEl.textContent = 'Senha muito fraca. Use pelo menos 6 caracteres.';
      } else if (error.code === 'permission-denied') {
        errEl.textContent = 'Erro de permissão. Contate o suporte.';
      } else {
        errEl.textContent = 'Erro ao criar conta: ' + (error.message || 'Tente novamente.');
      }
      errEl.style.display = 'block';
    }
  };

  window.saveGoogleProfile = async function() {
    const user = auth.currentUser;
    if(!user) return;
    const cpf = document.getElementById('google-cpf').value;
    const cel = document.getElementById('google-celular').value;
    const errEl = document.getElementById('google-error');
    errEl.style.display = 'none';

    if(!cpf || !cel) {
      errEl.textContent = 'Preencha CPF e Celular para concluir.';
      errEl.style.display = 'block';
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), {
        nome: user.displayName,
        email: user.email,
        cpf: cpf,
        celular: cel,
        hasAccount: true,
        createdAt: new Date().toISOString()
      });
      location.reload();
    } catch(err) {
      console.error('Erro ao salvar perfil Google:', err.code, err.message);
      errEl.textContent = 'Erro ao salvar dados. Tente novamente.';
      errEl.style.display = 'block';
    }
  };

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      document.getElementById('unauth-view').style.display = 'flex';
      document.getElementById('auth-view').style.display = 'none';
      return;
    }
    
    // Check if user has complete profile
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if(!userDoc.exists() || !userDoc.data().cpf) {
        // Needs completion
        document.getElementById('unauth-view').style.display = 'flex';
        document.getElementById('auth-view').style.display = 'none';
        
        document.getElementById('form-login').style.display = 'none';
        document.getElementById('form-register').style.display = 'none';
        const fg = document.getElementById('form-complete-google');
        if(fg) {
           fg.style.display = 'block';
           document.getElementById('google-email-display').value = user.email;
           document.getElementById('google-nome-display').value = user.displayName || '';
        }
        return; // Don't show auth view yet
      }
    } catch(e) {
      console.error(e);
    }

    document.getElementById('unauth-view').style.display = 'none';
    document.getElementById('auth-view').style.display = 'block';
    
    // Set User Info
    document.getElementById('user-name-display').textContent = user.displayName || 'Usuário';
    document.getElementById('user-email-display').textContent = user.email;
    
    if (user.photoURL) {
      document.getElementById('user-avatar').innerHTML = `<img src="${user.photoURL}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      document.getElementById('user-avatar').textContent = (user.displayName || 'U').charAt(0).toUpperCase();
    }
    
    // Sincroniza também no sessionStorage para compatibilidade se necessário
    sessionStorage.setItem('qf_user', JSON.stringify({ nome: user.displayName, email: user.email }));
    
    // Load Orders from Firestore
    const container = document.getElementById('orders-container');
    try {
      const q = query(
        collection(db, "orders"), 
        where("customer.email", "==", user.email)
      );
      
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort locally by date descending
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      if (orders.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <p style="font-weight:600; font-size:1.1rem; color:#1D2533; margin-bottom:8px;">Nenhum pedido encontrado</p>
            <p>Você ainda não fez nenhuma compra.</p>
            <a href="index.html#loja" class="btn btn--primary" style="margin-top:16px;">Ir para a Loja</a>
          </div>
        `;
        return;
      }
      
      container.innerHTML = orders.map(renderOrder).join('');
      
    } catch (error) {
      console.error("Error loading orders:", error);
      container.innerHTML = `<div class="empty-state" style="color:#ef4444;">Erro ao carregar pedidos. Verifique se o banco de dados está configurado.</div>`;
    }
  });
});

window.logout = function() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('qf_user');
    window.location.reload();
  });
};

function renderOrder(order) {
  const steps = ['Pendente', 'Pago', 'Em Separação', 'Enviado', 'Entregue'];
  let currentStepIndex = steps.indexOf(order.status);
  if (currentStepIndex === -1) currentStepIndex = 0; // Default if Cancelado or unknown
  
  const progressPercent = (currentStepIndex / (steps.length - 1)) * 100;
  
  const itemsHtml = order.items.map(item => `
    <div class="order-item">
      <span>${item.qty}x ${item.title}</span>
      <span style="font-weight:600;">R$ ${(item.price * item.qty).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
    </div>
  `).join('');

  return `
    <div class="order-card">
      <div class="order-header">
        <div class="order-meta">
          <div>Pedido</div>
          <span style="font-family:monospace; color:#1E96C8;">${order.id}</span>
        </div>
        <div class="order-meta">
          <div>Data</div>
          <span>${order.date}</span>
        </div>
        <div class="order-meta">
          <div>Total</div>
          <span class="order-total">R$ ${order.total.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
        </div>
      </div>
      
      <div class="order-body">
        <div style="margin-bottom:16px;">
          <strong style="font-size:.85rem; text-transform:uppercase; color:#9ca3af; letter-spacing:.05em;">Itens</strong>
          <div style="margin-top:8px;">${itemsHtml}</div>
        </div>
        
        <div class="order-tracker">
          <strong style="font-size:.85rem; text-transform:uppercase; color:#9ca3af; letter-spacing:.05em;">Status: <span style="color:#1D2533;">${order.status}</span></strong>
          
          <div class="tracker-steps" style="margin-top:20px;">
            <div class="tracker-line">
              <div class="tracker-line-fill" style="width: ${progressPercent}%;"></div>
            </div>
            
            ${steps.map((step, i) => `
              <div class="tracker-step ${i <= currentStepIndex ? 'active' : ''}">
                <div class="tracker-dot">${i <= currentStepIndex ? '✓' : ''}</div>
                <div class="tracker-label">${step}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

window.logout = function() {
  sessionStorage.removeItem('qf_user');
  window.location.href = 'index.html';
};
