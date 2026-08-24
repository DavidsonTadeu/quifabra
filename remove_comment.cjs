const fs = require('fs');
const path = require('path');

const dir = 'c:/quifabra';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove o comentario WHATSAPP FAB mas mantem o botao
  const before = content;
  content = content.replace(/<!--\s*={3,}[\s\S]*?WHATSAPP FAB[\s\S]*?={3,}\s*-->/gi, '');

  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Comentario removido em:', file);
  }
});
