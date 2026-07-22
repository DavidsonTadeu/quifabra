const fs = require('fs');

const lojaPath = 'c:/Quifabra/loja.html';
let html = fs.readFileSync(lojaPath, 'utf8');

// Replace the hardcoded products grid with an empty grid + loading state
const gridRegex = /<div class="store-grid" id="storeGrid">[\s\S]*?<\/section>/;

const newGridHTML = `<div class="store-grid" id="storeGrid">
      <div id="dynamic-products-loading" style="padding: 40px; color: #6b7280; text-align: center; font-size: 1.1rem; grid-column: 1 / -1;">
        Carregando catálogo de produtos...
      </div>
    </div>
  </div>
</section>`;

html = html.replace(gridRegex, newGridHTML);

// Insert the dynamic loading script before </body>
const scriptRegex = /<script>\s*\/\/\s*Filtro da loja[\s\S]*?<\/script>/;

const newScript = `<script type="module">
  import { db, collection, getDocs, query, where } from './js/firebase-config.js';

  async function loadStoreProducts() {
    const productsGrid = document.getElementById('storeGrid');
    if(!productsGrid) return;
    
    try {
      const q = query(collection(db, "products"), where("status", "==", "Ativo"));
      const querySnapshot = await getDocs(q);
      
      const loadingEl = document.getElementById('dynamic-products-loading');
      if (loadingEl) loadingEl.remove();

      if (querySnapshot.empty) {
        productsGrid.innerHTML = '<div style="padding:40px;width:100%;text-align:center;grid-column:1/-1;">Nenhum produto cadastrado no momento.</div>';
        return;
      }

      let html = '';
      querySnapshot.forEach((docSnap) => {
        const p = docSnap.data();
        let priceHtml = '';
        const id = docSnap.id;
        
        const currentPrice = (p.promo_price && Number(p.promo_price) > 0 && Number(p.promo_price) < Number(p.price)) 
          ? Number(p.promo_price) : Number(p.price);
          
        const priceStr = currentPrice.toLocaleString('pt-BR',{minimumFractionDigits:2});
        const parcelas = (currentPrice / 12).toLocaleString('pt-BR',{minimumFractionDigits:2});

        const categorySafe = (p.category || 'outros').toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");

        html += \`
          <article class="product-card reveal" data-category="\${categorySafe}">
            <div class="product-card__badge">
              <span class="badge-tag badge-tag--frete">🚚 Frete Grátis</span>
            </div>
            
            <div class="product-card__image">
              <a href="produto.html?id=\${id}" style="display:block; width:100%; height:100%;">
                <img src="\${p.image_url}" alt="\${p.title}" loading="lazy" />
              </a>
            </div>
            
            <div class="product-card__body">
              <div class="product-card__cat">\${p.category || 'Categoria'}</div>
              <a href="produto.html?id=\${id}" style="text-decoration:none;">
                <h2 class="product-card__title">\${p.title}</h2>
              </a>
              
              <div class="product-card__rating">
                <div class="stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
              </div>
              
              <div class="product-card__highlights">
                <div class="highlight-item">\${p.desc_short || 'Produto original Quifabra'}</div>
              </div>
              
              <div class="product-card__price-block">
                <div class="product-card__installments">Preço à vista</div>
                <div class="product-card__price"><span>R$</span> \${priceStr}</div>
                <div class="product-card__parcelas">12x de R$ \${parcelas} no cartão</div>
              </div>
              
              <div class="product-card__actions">
                <a href="produto.html?id=\${id}" class="btn-buy-local" style="background:#1E96C8;border:none;cursor:pointer;text-decoration:none;">
                  Ver Detalhes
                </a>
                <a href="https://wa.me/5531991790838?text=Olá!%20Tenho%20interesse%20no%20produto%20\${encodeURIComponent(p.title)}.%20Podem%20me%20passar%20mais%20detalhes?" target="_blank" rel="noopener" class="btn-whatsapp" aria-label="Perguntar no WhatsApp">
                  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>
          </article>
        \`;
      });
      
      productsGrid.innerHTML = html;
      initStoreFilters();
      
    } catch(e) {
      console.error("Erro ao carregar produtos:", e);
      productsGrid.innerHTML = '<div style="padding:40px;width:100%;text-align:center;grid-column:1/-1;">Erro ao carregar produtos.</div>';
    }
  }

  function initStoreFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    const productCards = document.querySelectorAll('.product-card');
    
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.dataset.filter;
        productCards.forEach(card => {
          if (f === 'all' || card.dataset.category === f) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', loadStoreProducts);
</script>`;

html = html.replace(scriptRegex, newScript);

fs.writeFileSync(lojaPath, html, 'utf8');
console.log('loja.html updated with dynamic products from Firestore.');
