const fs = require('fs');
const path = require('path');

const logoNew = '<img src="assets/images/quifabra-logo.png" alt="Quifabra - Escoramento Andaimes e Acessórios" class="navbar__logo-img" />';
const pattern = /<svg[^>]*viewBox="0 0 140 50"[^>]*>.*?<\/svg>/gs;

const files = [
  'index.html', 'loja.html', 'checkout.html', 'andaime-tubular.html',
  'andaime-fachadeiro.html', 'escoras-metalicas.html', 'acessorios-para-escoramento.html',
  'vigas.html', 'travamento-de-pilares.html', 'torres-de-escoramento.html',
  'politica-de-privacidade.html', 'blog.html', 'produto.html', 'minha-conta.html', 'admin.html'
];

for (const f of files) {
  const p = path.join('c:/Quifabra', f);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');

  // Replace logo
  content = content.replace(pattern, logoNew);

  // Add favicon if missing
  if (!content.includes('favicon.png')) {
    content = content.replace('</head>', '  <link rel="icon" type="image/png" href="assets/images/favicon.png">\n</head>');
  }

  // Text replacements
  if (f === 'index.html' || f === 'loja.html' || f === 'admin.html') {
    content = content.replace(/Kit para até 4m altura/g, 'Kit para até 3,10m altura');
    content = content.replace(/até 4 metros/g, 'até 3,10m');
    content = content.replace(/Aço Ø42,40mm galvanizado/g, 'Aço galvanizado 42,40mm');
    content = content.replace(/Tubo Ø 42,40mm/g, 'Tubo 42,40mm');
    content = content.replace(/Ø tubo 31,5 mm/g, 'Tubo 31,5 mm');
    content = content.replace(/tubo Ø 42,40mm/g, 'tubo 42,40mm');
    content = content.replace(/tubo Ø/g, 'tubo');
    content = content.replace(/Ø/g, ''); // catch all remaining
  }

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated: ' + f);
}

// Update admin.js text replacements
const adminJsPath = 'c:/Quifabra/js/admin.js';
if (fs.existsSync(adminJsPath)) {
  let adminContent = fs.readFileSync(adminJsPath, 'utf8');
  adminContent = adminContent.replace(/Kit para até 4m altura/g, 'Kit para até 3,10m altura');
  adminContent = adminContent.replace(/até 4 metros/g, 'até 3,10m');
  adminContent = adminContent.replace(/Aço Ø42,40mm galvanizado/g, 'Aço galvanizado 42,40mm');
  adminContent = adminContent.replace(/Tubo Ø 42,40mm/g, 'Tubo 42,40mm');
  adminContent = adminContent.replace(/Ø tubo 31,5 mm/g, 'Tubo 31,5 mm');
  adminContent = adminContent.replace(/tubo Ø 42,40mm/g, 'tubo 42,40mm');
  adminContent = adminContent.replace(/tubo Ø/g, 'tubo');
  adminContent = adminContent.replace(/Ø/g, '');
  fs.writeFileSync(adminJsPath, adminContent, 'utf8');
  console.log('Updated: js/admin.js');
}
