// Substitua pelo SDK do Firebase Admin se precisar atualizar o Firestore diretamente do Node.js
// Mas como o webhook recebe o status, podemos fazer isso com Admin SDK
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Esta API precisa se conectar ao Firestore para atualizar o status do pedido para "Pago".
// Configurar o Firebase Admin SDK requer variáveis de ambiente com a Service Account.
// Por simplificação inicial, este webhook apenas valida o pagamento. O update no Firestore
// requer o firebase-admin.

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // O Mercado Pago envia um parâmetro data.id com o ID do pagamento
  const paymentId = req.query['data.id'] || req.body?.data?.id;
  const type = req.query.type || req.body?.type;

  if (type !== 'payment' || !paymentId) {
    return res.status(200).send('Ignorado');
  }

  if (!ACCESS_TOKEN) {
    console.error('Webhook: Mercado Pago Access Token não configurado');
    return res.status(500).json({ error: 'Internal config error' });
  }

  const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN, options: { timeout: 5000 } });
  const payment = new Payment(client);

  try {
    const paymentData = await payment.get({ id: paymentId });
    
    const externalReference = paymentData.external_reference; // É o nosso orderId
    const status = paymentData.status;

    console.log(`Pagamento ${paymentId} para pedido ${externalReference} está ${status}`);

    if (status === 'approved') {
      // TODO: Conectar ao Firebase Admin SDK e atualizar o doc do Firestore
      // Exemplo (requer import do firebase-admin):
      // await admin.firestore().collection('orders').doc(externalReference).update({ status: 'Pago' });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Internal Server Error');
  }
}
