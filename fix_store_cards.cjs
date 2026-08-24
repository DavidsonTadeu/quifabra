const fs = require('fs');
let content = fs.readFileSync('c:/quifabra/index.html', 'utf8');

// Corrige o bloco completo da "Destaques da Nossa Loja"
// Substitui o card da Sapata com estilos padronizados e texto limpo
content = content.replace(
  /<!-- Sapata Regul.*?<\/article>/s,
  `<!-- Sapata Regulavel (MLB4862033073) -->
      <article class="product-card reveal" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); display: flex; flex-direction: column; transition: transform .3s; position: relative;">
        <div style="position: absolute; top: 12px; left: 12px; z-index: 2; background: #00a650; color: white; padding: 4px 10px; border-radius: 8px; font-size: .7rem; font-weight: 800;">🚚 FRETE GRÁTIS</div>
        <div style="aspect-ratio: 4/3; background: #f8f9fa; padding: 20px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; max-height: 220px;">
          <img src="https://http2.mlstatic.com/D_NQ_NP_2X_960958-MLA99989999861_112025-F.webp" alt="Sapata Regulável Para Andaime 45cm" style="width: auto; height: 100%; max-height: 180px; object-fit: contain;" loading="lazy" />
        </div>
        <div style="padding: 24px; flex: 1; display: flex; flex-direction: column;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; color: var(--color-dark); margin-bottom: 8px;">Sapata Regulável Para Andaime 45 cm</h3>
          <p style="font-size: .85rem; color: var(--color-text-muted); margin-bottom: 16px;">Base 10x10cm, rosca ajustável, aço galvanizado. Suporta até 800 kg. Altura total 50cm.</p>
          <div style="margin-top: auto;">
            <div style="font-size: 1.4rem; font-weight: 900; color: var(--color-dark); margin-bottom: 4px; font-family: var(--font-heading);">R$ 65,00</div>
            <div style="font-size: .8rem; color: #00a650; font-weight: 700; margin-bottom: 16px;">12x de R$ 6,40 sem juros</div>
            <button class="btn btn--primary" style="width: 100%; justify-content: center; background: #00a650; border: none; cursor: pointer;" onclick="addToCart('prod-sapata', 'Sapata Regulável Para Andaime 45 cm', 65, 'https://http2.mlstatic.com/D_NQ_NP_2X_960958-MLA99989999861_112025-F.webp')">🛒 Adicionar ao Carrinho</button>
          </div>
        </div>
      </article>`
);

// Corrige Kit Escoras (textos corrompidos)
content = content.replace(
  /<!-- Kit 10 Escoras Met.*?<\/article>/s,
  `<!-- Kit 10 Escoras Metálicas (MLB4818980631) -->
      <article class="product-card reveal delay-1" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); display: flex; flex-direction: column; transition: transform .3s; position: relative;">
        <div style="position: absolute; top: 12px; left: 12px; z-index: 2; background: var(--color-accent); color: var(--color-dark); padding: 4px 10px; border-radius: 8px; font-size: .7rem; font-weight: 800;">⭐ MAIS VENDIDO</div>
        <div style="aspect-ratio: 4/3; background: #f8f9fa; padding: 20px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; max-height: 220px;">
          <img src="assets/images/prod-escoras-kit.jpg" alt="Kit 10 Escoras Metálicas Quifabra 2,00 a 3,10m" style="width: auto; height: 100%; max-height: 180px; object-fit: contain;" loading="lazy" />
        </div>
        <div style="padding: 24px; flex: 1; display: flex; flex-direction: column;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; color: var(--color-dark); margin-bottom: 8px;">Kit 10 Escoras Metálicas de Aço Quifabra (2,00 a 3,10m)</h3>
          <p style="font-size: .85rem; color: var(--color-text-muted); margin-bottom: 16px;">Escoras reguláveis de aço de alta resistência. Ideais para escoramento de lajes e vigas. Fabricação Quifabra.</p>
          <div style="margin-top: auto;">
            <div style="font-size: 1.4rem; font-weight: 900; color: var(--color-dark); margin-bottom: 4px; font-family: var(--font-heading);">R$ 1.900,00</div>
            <div style="font-size: .8rem; color: #00a650; font-weight: 700; margin-bottom: 16px;">10x de R$ 190,00 sem juros</div>
            <button class="btn btn--primary" style="width: 100%; justify-content: center; background: #00a650; border: none; cursor: pointer;" onclick="addToCart('prod-escoras-kit', 'Kit 10 Escoras Metálicas de Aço Quifabra (2,00 a 3,10m)', 1900, 'assets/images/prod-escoras-kit.jpg')">🛒 Adicionar ao Carrinho</button>
          </div>
        </div>
      </article>`
);

// Corrige Andaime Tubular (textos corrompidos)  
content = content.replace(
  /<!-- Andaime Tubular Kit.*?<\/article>/s,
  `<!-- Andaime Tubular Kit (MLB4862007997) -->
      <article class="product-card reveal delay-2" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); display: flex; flex-direction: column; transition: transform .3s; position: relative;">
        <div style="position: absolute; top: 12px; left: 12px; z-index: 2; background: #00a650; color: white; padding: 4px 10px; border-radius: 8px; font-size: .7rem; font-weight: 800;">🚚 FRETE GRÁTIS</div>
        <div style="aspect-ratio: 4/3; background: #f8f9fa; padding: 20px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; max-height: 220px;">
          <img src="https://http2.mlstatic.com/D_NQ_NP_2X_765998-MLB77577154882_072024-F.webp" alt="Andaime Tubular 1,00m Kit" style="width: auto; height: 100%; max-height: 180px; object-fit: contain;" loading="lazy" />
        </div>
        <div style="padding: 24px; flex: 1; display: flex; flex-direction: column;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; color: var(--color-dark); margin-bottom: 8px;">Andaime Tubular 1,00m - Kit para até 3,10m altura</h3>
          <p style="font-size: .85rem; color: var(--color-text-muted); margin-bottom: 16px;">Kit completo para montagem de andaime de até 3,10m. Aço galvanizado 42,40mm, resistente e seguro.</p>
          <div style="margin-top: auto;">
            <div style="font-size: 1.4rem; font-weight: 900; color: var(--color-dark); margin-bottom: 4px; font-family: var(--font-heading);">R$ 600,00</div>
            <div style="font-size: .8rem; color: #00a650; font-weight: 700; margin-bottom: 16px;">12x de R$ 58,02 sem juros</div>
            <button class="btn btn--primary" style="width: 100%; justify-content: center; background: #00a650; border: none; cursor: pointer;" onclick="addToCart('prod-andaime-kit', 'Andaime Tubular 1,00m - Kit para até 3,10m altura', 600, 'https://http2.mlstatic.com/D_NQ_NP_2X_765998-MLB77577154882_072024-F.webp')">🛒 Adicionar ao Carrinho</button>
          </div>
        </div>
      </article>`
);

fs.writeFileSync('c:/quifabra/index.html', content, 'utf8');
console.log('index.html corrigido!');
