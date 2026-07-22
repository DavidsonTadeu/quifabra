const fs = require('fs');

const lojaPath = 'c:/Quifabra/loja.html';
let html = fs.readFileSync(lojaPath, 'utf8');

// The user wants to replace Product 1 (Andaime Kit 8 peças) with "Kit 10 Escoras Metálicas"
const prod1Regex = /<!-- PRODUTO 1: Andaime Tubular Kit 8 Peças -->[\s\S]*?<\/article>/;
const prod1New = `<!-- PRODUTO 1: Kit 10 Escoras Metálicas -->
      <article class="product-card reveal" data-category="escoramento" data-product="1">
        <div class="product-card__badge">
          <span class="badge-tag badge-tag--frete">🚚 Frete Grátis</span>
          <span class="badge-tag badge-tag--destaque">⭐ Mais Vendido</span>
        </div>
        <div class="product-card__image">
          <a href="produto.html" style="display:block; width:100%; height:100%;">
            <img src="assets/images/prod-escoras-kit.jpg" alt="Kit 10 Escoras Metálicas Quifabra 2,00 a 3,10m" loading="lazy" />
          </a>
        </div>
        <div class="product-card__body">
          <div class="product-card__cat">Escoramento</div>
          <a href="produto.html" style="text-decoration:none;">
            <h2 class="product-card__title">Kit 10 Escoras Metálicas Quifabra 2,00 a 3,10m</h2>
          </a>
          <div class="product-card__rating">
            <div class="stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <span class="product-card__rating-count">5.0 · (12 avaliações)</span>
          </div>
          <div class="product-card__highlights">
            <div class="highlight-item">Aço carbono de alta resistência</div>
            <div class="highlight-item">Regulagem de 2,00m a 3,10m</div>
            <div class="highlight-item">Capacidade de até 1.500 kg por escora</div>
            <div class="highlight-item">Pintura epóxi anticorrosiva</div>
          </div>
          <div class="product-card__price-block">
            <div class="product-card__installments">Preço à vista</div>
            <div class="product-card__price"><span>R$</span> 1.900,00</div>
            <div class="product-card__parcelas">12x de R$ 184,21 no cartão</div>
          </div>
          <div class="product-card__actions">
            <a href="produto.html" class="btn-buy-local" style="background:#1E96C8;border:none;cursor:pointer;text-decoration:none;">
              Ver Detalhes
            </a>
            <a href="https://wa.me/5531991790838?text=Olá!%20Tenho%20interesse%20no%20Kit%2010%20Escoras%20Metálicas.%20Podem%20me%20passar%20mais%20detalhes?" target="_blank" rel="noopener" class="btn-whatsapp" aria-label="Perguntar no WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      </article>`;
html = html.replace(prod1Regex, prod1New);

// Product 2: Sapata Regulável -> dzDgL6PxbWswRna6OWLN
const prod2Regex = /<!-- PRODUTO 2: Sapata Regulável -->[\s\S]*?<\/article>/;
const prod2New = `<!-- PRODUTO 2: Sapata Regulável -->
      <article class="product-card reveal delay-1" data-category="acessorios" data-product="2">
        <div class="product-card__badge">
          <span class="badge-tag badge-tag--frete">🚚 Frete Grátis</span>
        </div>
        <div class="product-card__image">
          <a href="produto.html?id=dzDgL6PxbWswRna6OWLN" style="display:block; width:100%; height:100%;">
            <img src="https://http2.mlstatic.com/D_NQ_NP_2X_960958-MLA99989999861_112025-F.webp" alt="Sapata Regulável Para Andaime 45cm" loading="lazy" />
          </a>
        </div>
        <div class="product-card__body">
          <div class="product-card__cat">Acessórios</div>
          <a href="produto.html?id=dzDgL6PxbWswRna6OWLN" style="text-decoration:none;">
            <h2 class="product-card__title">Sapata Regulável Para Andaime Quifabra 45cm 1 Peça</h2>
          </a>
          <div class="product-card__rating">
            <div class="stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <span class="product-card__rating-count">4 vendidos</span>
          </div>
          <div class="product-card__highlights">
            <div class="highlight-item">Suporta até 1.000 kg de carga</div>
            <div class="highlight-item">Regulagem de até 30 cm de altura</div>
            <div class="highlight-item">Base quadrada 12×12 cm, chapa 5mm</div>
            <div class="highlight-item">Ferro preto, Tubo 31,5 mm (1 1/4")</div>
          </div>
          <div class="product-card__price-block">
            <div class="product-card__installments">Preço à vista</div>
            <div class="product-card__price"><span>R$</span> 61,75</div>
            <div class="product-card__parcelas">12x de R$ 5,99 no cartão</div>
          </div>
          <div class="product-card__actions">
            <a href="produto.html?id=dzDgL6PxbWswRna6OWLN" class="btn-buy-local" style="background:#1E96C8;border:none;cursor:pointer;text-decoration:none;">
              Ver Detalhes
            </a>
            <a href="https://wa.me/5531991790838?text=Olá!%20Tenho%20interesse%20na%20Sapata%20Regulável%20Para%20Andaime%2045cm.%20Podem%20me%20ajudar?" target="_blank" rel="noopener" class="btn-whatsapp" aria-label="Perguntar no WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      </article>`;
html = html.replace(prod2Regex, prod2New);

// Product 3: Andaime Kit 4 Peças -> FNG66Afzbzs49nht1g9K
// Currently it is labeled "PRODUTO 3: Kit 10 Escoras Metálicas" in the HTML comment, but the content is Andaime Tubular Quifabra 1,00m Kit 4 Peças Até 4m
const prod3Regex = /<!-- PRODUTO 3: Kit 10 Escoras Metálicas -->[\s\S]*?<\/article>/;
const prod3New = `<!-- PRODUTO 3: Andaime Tubular Kit 4 Peças -->
      <article class="product-card reveal delay-2" data-category="andaimes" data-product="3">
        <div class="product-card__badge">
          <span class="badge-tag badge-tag--destaque">🏭 Marca Quifabra</span>
        </div>
        <div class="product-card__image">
          <a href="produto.html?id=FNG66Afzbzs49nht1g9K" style="display:block; width:100%; height:100%;">
            <img src="https://http2.mlstatic.com/D_NQ_NP_2X_765998-MLB77577154882_072024-F.webp" alt="Andaime Tubular Quifabra 1,00m Kit 4 Peças Até 4m" loading="lazy" />
          </a>
        </div>
        <div class="product-card__body">
          <div class="product-card__cat">Andaimes</div>
          <a href="produto.html?id=FNG66Afzbzs49nht1g9K" style="text-decoration:none;">
            <h2 class="product-card__title">Andaime Tubular Quifabra 1,00m Kit 4 Peças Até 4m</h2>
          </a>
          <div class="product-card__rating">
            <div class="stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <span class="product-card__rating-count">Marca Quifabra · +50 disponíveis</span>
          </div>
          <div class="product-card__highlights">
            <div class="highlight-item">Kit com 4 peças de andaime tubular</div>
            <div class="highlight-item">Tubo galvanizado de alta durabilidade</div>
            <div class="highlight-item">Montagem rápida até 4m de altura</div>
            <div class="highlight-item">10x R$ 210 sem juros — Entrega combinada</div>
          </div>
          <div class="product-card__price-block">
            <div class="product-card__installments">Preço à vista</div>
            <div class="product-card__price"><span>R$</span> 600,00</div>
            <div class="product-card__parcelas">12x de R$ 58,16 no cartão</div>
          </div>
          <div class="product-card__actions">
            <a href="produto.html?id=FNG66Afzbzs49nht1g9K" class="btn-buy-local" style="background:#1E96C8;border:none;cursor:pointer;text-decoration:none;">
              Ver Detalhes
            </a>
            <a href="https://wa.me/5531991790838?text=Olá!%20Tenho%20interesse%20no%20Andaime%20Tubular%20Kit%204%20Peças.%20Gostaria%20de%20informações%20sobre%20entrega." target="_blank" rel="noopener" class="btn-whatsapp" aria-label="Perguntar no WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      </article>`;
html = html.replace(prod3Regex, prod3New);

fs.writeFileSync(lojaPath, html, 'utf8');
console.log('loja.html updated with static products correctly linked.');
