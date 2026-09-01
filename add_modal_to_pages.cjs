const fs = require('fs');
const path = require('path');

const dir = 'c:/quifabra';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('contact-modal.js')) {
    content = content.replace(
      '</body>',
      '  <script type="module" src="js/contact-modal.js"></script>\n</body>'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modal script adicionado em:', file);
  }
});
