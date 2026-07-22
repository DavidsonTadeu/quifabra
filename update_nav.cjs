const fs = require('fs');

const files = [
  'c:/Quifabra/index.html',
  'c:/Quifabra/loja.html',
  'c:/Quifabra/produto.html',
  'c:/Quifabra/andaime-tubular.html',
  'c:/Quifabra/calculadora.html',
  'c:/Quifabra/minha-conta.html',
  'c:/Quifabra/blog.html'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8');

  // Update Desktop menu
  if (!html.includes('calculadora.html" class="dropdown__link"')) {
    html = html.replace(
      /<a href="andaime-fachadeiro\.html" class="dropdown__link" role="menuitem">([\s\S]*?)<\/a>/,
      `<a href="andaime-fachadeiro.html" class="dropdown__link" role="menuitem">$1</a>
            <a href="calculadora.html" class="dropdown__link" role="menuitem">
              <span class="icon" aria-hidden="true">🧮</span>
              Calculadora de Andaimes
            </a>`
    );
  }

  // Update Mobile menu
  if (!html.includes('<a href="calculadora.html">Calculadora de Andaimes</a>')) {
    html = html.replace(
      /<a href="andaime-fachadeiro\.html">Andaime Fachadeiro<\/a>/,
      `<a href="andaime-fachadeiro.html">Andaime Fachadeiro</a>
      <a href="calculadora.html">Calculadora de Andaimes</a>`
    );
  }

  fs.writeFileSync(f, html, 'utf8');
});
console.log('Nav updated');
