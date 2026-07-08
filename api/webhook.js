import { MercadoPagoConfig, Payment } from 'mercadopago';

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'quifabraloja';

// Atualiza o status do pedido no Firestore via REST API (sem precisar do firebase-admin)
async function updateOrderStatus(orderId, status) {
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders/${orderId}`;
  
  const body = {
    fields: {
      status: { stringValue: status }
    }
  };

  const response = await fetch(`${firestoreUrl}?updateMask.fieldPaths=status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Firestore update failed: ${err}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const mpStatus = paymentData.status;

    console.log(`Pagamento ${paymentId} para pedido ${externalReference} está ${mpStatus}`);

    // Mapeia o status do MP para o status do nosso sistema
    let novoStatus = null;
    if (mpStatus === 'approved') novoStatus = 'Pago';
    else if (mpStatus === 'rejected' || mpStatus === 'cancelled') novoStatus = 'Cancelado';
    else if (mpStatus === 'in_process' || mpStatus === 'pending') novoStatus = 'Pendente';

    if (novoStatus && externalReference) {
      await updateOrderStatus(externalReference, novoStatus);
      console.log(`Pedido ${externalReference} atualizado para: ${novoStatus}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Internal Server Error');
  }
}
