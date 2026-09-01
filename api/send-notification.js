import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tipo, nome, email, celular, empresa, cep, estado, atuacao, mensagem, interesse } = req.body;

  if (!nome || (!email && !celular)) {
    return res.status(400).json({ error: 'Dados insuficientes' });
  }

  const gmailUser = process.env.GMAIL_USER || 'ecal7450@gmail.com';
  const gmailPass = process.env.GMAIL_PASS || 'dlql revq nfip bvhi';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const cleanPhone = (celular || '').replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const whatsappUrl = cleanPhone ? `https://wa.me/${formattedPhone}` : null;

  const isChat = tipo === 'Chatbot do Site';
  const assunto = isChat 
    ? `💬 Novo Lead pelo Chatbot: ${nome}` 
    : `📩 Novo Contato pelo Form: ${nome}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E96C8; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">Quifabra - ${isChat ? 'Novo Lead (Chatbot)' : 'Solicitação de Orçamento'}</h2>
      </div>
      <div style="padding: 24px; color: #333333;">
        <p style="font-size: 16px;"><strong>Um novo contato foi registrado no site da Quifabra!</strong></p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Origem:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${tipo || 'Formulário do Site'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Nome:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${nome}</td>
          </tr>
          ${email ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>E-mail:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${email}">${email}</a></td>
          </tr>` : ''}
          ${celular ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Celular/WhatsApp:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${celular}</td>
          </tr>` : ''}
          ${interesse ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Interesse:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${interesse}</td>
          </tr>` : ''}
          ${empresa ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Empresa:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${empresa}</td>
          </tr>` : ''}
          ${cep ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>CEP / Estado:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${cep} ${estado ? `/ ${estado}` : ''}</td>
          </tr>` : ''}
          ${atuacao ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Atuação:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${atuacao}</td>
          </tr>` : ''}
        </table>

        ${mensagem ? `
        <div style="margin-top: 20px; padding: 16px; background-color: #f9f9f9; border-left: 4px solid #1E96C8; border-radius: 4px;">
          <strong>Mensagem / Detalhes:</strong><br/>
          <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${mensagem}</p>
        </div>` : ''}

        ${whatsappUrl ? `
        <div style="margin-top: 24px; text-align: center;">
          <a href="${whatsappUrl}" target="_blank" style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            💬 Abrir Conversa no WhatsApp
          </a>
        </div>` : ''}
      </div>
      <div style="background-color: #f4f4f4; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        Quifabra - Soluções em Andaimes e Escoramento
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Quifabra Site" <${gmailUser}>`,
      to: 'ecal7450@gmail.com, quifabra@gmail.com',
      subject: assunto,
      html: htmlContent,
    });

    return res.status(200).json({ success: true, message: 'Notificação enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail de notificação:', error);
    return res.status(500).json({ error: 'Erro ao enviar notificação por e-mail' });
  }
}
