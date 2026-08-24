const fs = require('fs');

const chatbotScript = `\n<!-- Chatbot Widget -->\n<link rel="stylesheet" href="css/chatbot.css" />\n<script type="module" src="js/chatbot.js"></script>\n`;

// Pages to inject chatbot into
const pages = [
  'c:/Quifabra/index.html',
  'c:/Quifabra/loja.html',
  'c:/Quifabra/produto.html',
  'c:/Quifabra/andaime-tubular.html',
];

pages.forEach(p => {
  if (!fs.existsSync(p)) {
    console.log(`SKIP (not found): ${p}`);
    return;
  }

  let html = fs.readFileSync(p, 'utf8');

  // Skip if already injected
  if (html.includes('chatbot.js')) {
    console.log(`SKIP (already injected): ${p}`);
    return;
  }

  html = html.replace('</body>', chatbotScript + '</body>');
  fs.writeFileSync(p, html, 'utf8');
  console.log(`INJECTED: ${p}`);
});
