const fs = require('fs');
const path = require('path');

const dir = 'c:/quifabra';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Substitui os chevrons e icones corrompidos no header/navbar por texto limpo
  content = content.replace(/<span class="chevron">\?<\/span>/g, '<span class="chevron">▾</span>');
  content = content.replace(/<span class="icon">\?+<\/span>/g, '');
  content = content.replace(/<span class="icon">.*?<\/span>/g, '');
  content = content.replace(/In\?cio|In\uFFFDcio/g, 'Início');
  content = content.replace(/Solicitar Or\?amento/g, 'Solicitar Orçamento');

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Navbars limpos com sucesso!');
