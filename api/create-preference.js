import { MercadoPagoConfig, Preference } from 'mercadopago';

// Esta chave deve ser configurada nas Variáveis de Ambiente (Environment Variables) da Vercel
// Nunca exponha o Access Token publicamente no frontend.
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN; 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Mercado Pago Access Token não configurado no servidor' });
  }

  const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN, options: { timeout: 5000 } });
  const preference = new Preference(client);

  try {
    const { items, customer, orderId } = req.body;

    const mpItems = items.map(item => ({
      id: item.id || 'N/A',
      title: item.title,
      quantity: item.qty,
      unit_price: Number(item.price),
      currency_id: 'BRL',
    }));

    const response = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: customer.nome.split(' ')[0],
          surname: customer.nome.split(' ').slice(1).join(' '),
          email: customer.email,
        },
        external_reference: orderId, // Nosso ID interno do pedido
        back_urls: {
          success: `https://${req.headers.host}/minha-conta.html`,
          failure: `https://${req.headers.host}/checkout.html`,
          pending: `https://${req.headers.host}/minha-conta.html`,
        },
        auto_return: 'approved',
        // O webhook URL será configurado no painel do Mercado Pago apontando para /api/webhook
      }
    });

    res.status(200).json({ id: response.id });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: 'Falha ao criar preferência no Mercado Pago' });
  }
}
