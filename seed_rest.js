const project = 'quifabraloja';

const sapataFixa = {
  "fields": {
    "title": { "stringValue": "Sapata Fixa para Andaime Quifabra" },
    "price": { "doubleValue": 30.00 },
    "promo_price": { "doubleValue": 30.00 },
    "category": { "stringValue": "Acessórios" },
    "desc_short": { "stringValue": "Sapata simples fixa para andaime, provê suporte e estabilidade em estruturas temporárias. Aço resistente." },
    "desc_long": { "stringValue": "Sapata simples fixa para andaime, desenvolvida pela Quifabra, destinada a prover suporte e estabilidade em estruturas temporárias de acesso. O componente apresenta compatibilidade técnica com a linha de andaimes do padrão MECAN, garantindo o nivelamento adequado em superfícies de apoio.<br><br>Especificações técnicas:<br>- Tubo estrutural: 33,70 mm de diâmetro externo por 2,00 mm de espessura de parede.<br>- Altura do tubo: 9,5 cm.<br>- Base de apoio (chapa): 11 cm x 12 cm.<br>- Espessura da chapa: 3/16 polegadas.<br><br>Este dispositivo atua como o ponto de interface entre o elemento vertical do andaime e o piso, distribuindo a carga de forma equilibrada para assegurar a conservação da integridade estrutural do conjunto. A seleção dos materiais e as dimensões nominais conferem resistência mecânica adequada às solicitações de compressão características em sistemas de escoramento e fachadeiros metálicos, assegurando a compatibilidade necessária para montagens industriais e civis." },
    "image_url": { "stringValue": "assets/images/sapata-fixa.png" },
    "images": { "arrayValue": { "values": [{ "stringValue": "assets/images/sapata-fixa.png" }] } },
    "status": { "stringValue": "Ativo" },
    "stock": { "integerValue": 100 }
  }
};

const kitEscoras = {
  "fields": {
    "title": { "stringValue": "Kit 10 Escoras Metálicas Quifabra 2,00 a 3,10m" },
    "price": { "doubleValue": 1900.00 },
    "promo_price": { "doubleValue": 1900.00 },
    "category": { "stringValue": "Escoramento" },
    "desc_short": { "stringValue": "Kit com 10 escoras metálicas com regulagem de 2,00m a 3,10m. Alta resistência, pintura epóxi." },
    "desc_long": { "stringValue": "Kit 10 Escoras Metálicas Quifabra 2,00 a 3,10m. Ideal para obras de pequeno a grande porte. Fabricadas em aço carbono de alta resistência.<br><br>Características:<br>- Regulagem de altura: 2,00m até 3,10m<br>- Capacidade de carga: até 1.500 kg por escora<br>- Acabamento: Pintura epóxi anticorrosiva<br>- Sistema de rosca com ajuste fino rápido e seguro<br>- Base de apoio reforçada" },
    "image_url": { "stringValue": "assets/images/prod-escoras-kit.jpg" },
    "images": { "arrayValue": { "values": [{ "stringValue": "assets/images/prod-escoras-kit.jpg" }] } },
    "status": { "stringValue": "Ativo" },
    "stock": { "integerValue": 50 }
  }
};

async function seed() {
  const url1 = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/products/sapata-fixa`;
  const url2 = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/products/kit-10-escoras`;

  try {
    const r1 = await fetch(url1, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sapataFixa)
    });
    console.log('Sapata:', await r1.json());

    const r2 = await fetch(url2, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kitEscoras)
    });
    console.log('Kit:', await r2.json());
  } catch (e) {
    console.error(e);
  }
}

seed();
