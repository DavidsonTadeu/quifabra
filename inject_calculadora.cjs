const fs = require('fs');

const calcContent = `
  <link rel="stylesheet" href="css/calculadora.css" />
<div class="page-hero">
  <div class="container page-hero__content">
    <div class="breadcrumb"><a href="index.html">Home</a> <span>/</span> Andaimes <span>/</span> Calculadora</div>
    <h1 class="page-hero__title">Calculadora de Andaimes</h1>
    <p class="page-hero__desc">Descubra exatamente a quantidade de painéis, sapatas e acessórios que você precisa para a sua obra.</p>
  </div>
</div>

<section class="calc-section">
  <div class="container">
    <div class="calc-container">
      <!-- Formulário -->
      <div class="calc-form">
        <div class="calc-header">
          <h2>Dimensões da Torre</h2>
          <p>Informe o tamanho desejado para calcular os materiais.</p>
        </div>

        <div class="calc-group">
          <label class="calc-label">Altura do Andaime (Metros)</label>
          <div class="calc-slider-wrap">
            <input type="range" class="calc-slider" id="calc-height" min="1" max="20" value="4">
            <div class="calc-value-display" id="calc-height-val">4m</div>
          </div>
        </div>

        <div class="calc-group">
          <label class="calc-label">Largura / Quantidade de Torres (Metros)</label>
          <div class="calc-slider-wrap">
            <input type="range" class="calc-slider" id="calc-width" min="1" max="10" value="1">
            <div class="calc-value-display" id="calc-width-val">1m</div>
          </div>
        </div>

        <div class="calc-group" style="margin-top: 32px;">
          <label class="calc-label">Tipo de Base</label>
          <div class="calc-radio-group">
            <label class="calc-radio-option selected">
              <input type="radio" name="base" id="base-sapatas" checked>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="20" width="20" height="2"/><path d="M12 20v-8"/><path d="M8 12h8"/><path d="M12 12V4"/></svg>
              <span class="calc-radio-title">Sapatas Fixas</span>
            </label>
            <label class="calc-radio-option">
              <input type="radio" name="base" id="base-rodizios">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              <span class="calc-radio-title">Rodízios (Rodas)</span>
            </label>
          </div>
        </div>

        <div class="calc-group">
          <label class="calc-checkbox-wrap">
            <input type="checkbox" id="opt-pisos">
            <span style="font-weight:700;">Incluir Plataformas de Piso no último nível</span>
          </label>
        </div>
      </div>

      <!-- Resultado -->
      <div class="calc-result">
        <h3>Materiais Necessários</h3>
        <ul class="result-list">
          <li class="result-item">
            <span class="result-qtd" id="res-paineis">8</span>
            <span class="result-name">Painéis (1x1m ou 1,5x1m)</span>
          </li>
          <li class="result-item">
            <span class="result-qtd" id="res-bases">4</span>
            <span class="result-name" id="res-bases-name">Sapatas Reguláveis</span>
          </li>
          <li class="result-item">
            <span class="result-qtd" id="res-diagonais">1</span>
            <span class="result-name">Diagonais (Travamento)</span>
          </li>
          <li class="result-item" id="res-pisos-row" style="display:none;">
            <span class="result-qtd" id="res-pisos">2</span>
            <span class="result-name">Plataformas de Piso</span>
          </li>
        </ul>

        <div class="result-actions">
          <a href="#" class="btn-calc-zap" id="btn-calc-zap">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Solicitar Orçamento
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
<script src="js/calculadora.js"></script>
`;

let html = fs.readFileSync('c:/Quifabra/calculadora.html', 'utf8');
html = html.replace('<!-- INSERIR AQUI -->', calcContent);
// Also update the document title
html = html.replace(/<title>.*?<\/title>/, '<title>Calculadora de Andaimes — Quifabra</title>');
fs.writeFileSync('c:/Quifabra/calculadora.html', html, 'utf8');
console.log('Done!');
