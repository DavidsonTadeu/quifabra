/**
 * Quifabra - Serviço Único de Captura e Gestão de Leads
 * Garante que todos os canais de captura (Formulário Rodapé, Popup Fale Conosco, Chatbot)
 * salvem no Firestore e evitem cadastros duplicados no Admin.
 */
import { db, collection, getDocs, query, where, addDoc, doc, updateDoc } from './firebase-config.js';

export async function saveLeadCentralized(data) {
  const { nome, celular, email, origem, empresa, cep, estado, atuacao, mensagem, interesse } = data;

  if (!nome || (!email && !celular)) {
    return { success: false, reason: 'Nome e (E-mail ou Celular) são obrigatórios.' };
  }

  const cleanPhone = (celular || '').replace(/\D/g, '');
  const cleanEmail = (email || '').trim().toLowerCase();

  try {
    const usersRef = collection(db, 'users');
    let existingDocId = null;
    let existingData = null;

    // 1. Busca se já existe usuário com este e-mail
    if (cleanEmail) {
      const qEmail = query(usersRef, where('email', '==', cleanEmail));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        existingDocId = snapEmail.docs[0].id;
        existingData = snapEmail.docs[0].data();
      }
    }

    // 2. Se não achou por e-mail, busca por celular
    if (!existingDocId && cleanPhone) {
      const qPhone = query(usersRef, where('celular', '==', celular));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        existingDocId = snapPhone.docs[0].id;
        existingData = snapPhone.docs[0].data();
      }
    }

    // 3. Se já existe, apenas atualiza informações sem duplicar no Admin
    if (existingDocId) {
      const updatedFields = {
        updatedAt: new Date().toISOString()
      };
      if (nome && !existingData.nome) updatedFields.nome = nome;
      if (celular && !existingData.celular) updatedFields.celular = celular;
      if (cleanEmail && !existingData.email) updatedFields.email = cleanEmail;
      if (empresa) updatedFields.empresa = empresa;
      if (origem) updatedFields.origem = `${existingData.origem || ''} | ${origem}`;
      if (interesse) updatedFields.interesse = interesse;

      await updateDoc(doc(db, 'users', existingDocId), updatedFields);
      console.log('Lead atualizado com sucesso no Admin (sem duplicar):', existingDocId);
    } else {
      // 4. Se não existe, cria novo registro no Firestore na coleção users
      const newDoc = await addDoc(usersRef, {
        nome,
        celular: celular || '',
        email: cleanEmail || '',
        empresa: empresa || '',
        cep: cep || '',
        estado: estado || '',
        atuacao: atuacao || '',
        origem: origem || 'Site Quifabra',
        interesse: interesse || '',
        hasAccount: false,
        createdAt: new Date().toISOString()
      });
      console.log('Novo lead criado no Admin:', newDoc.id);
    }

    // 5. Salva na coleção "messages" para alimentar a aba Mensagens do Admin
    try {
      await addDoc(collection(db, 'messages'), {
        nome,
        email: cleanEmail || celular || 'Sem e-mail',
        celular: celular || '',
        mensagem: mensagem || (interesse ? `Interesse: ${interesse}` : `Origem: ${origem}`),
        origem: origem || 'Site Quifabra',
        createdAt: new Date().toISOString()
      });
    } catch (msgErr) {
      console.warn('Erro ao salvar na coleção messages:', msgErr);
    }

    // 5. Envia notificação por e-mail para a equipe Quifabra
    fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.warn('Erro ao disparar e-mail de notificação:', err));

    return { success: true };
  } catch (err) {
    console.error('Erro ao salvar lead centralizado:', err);
    return { success: false, error: err };
  }
}

// Expõe globalmente
if (typeof window !== 'undefined') {
  window.saveLeadCentralized = saveLeadCentralized;
}
