const fs = require('fs');
const path = require('path');

const dir = 'c:/quifabra';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Converte sequencias especificas de caracteres corrompidos para os equivalentes limpos em UTF-8
  content = content
    .replace(/<a href="andaime-tubular\.html">[^<]*Andaime Tubular<\/a>/gi, '<a href="andaime-tubular.html">Andaime Tubular</a>')
    .replace(/<a href="andaime-fachadeiro\.html">[^<]*Andaime Fachadeiro<\/a>/gi, '<a href="andaime-fachadeiro.html">Andaime Fachadeiro</a>')
    .replace(/<a href="escoras-metalicas\.html">[^<]*Escoras[^<]*<\/a>/gi, '<a href="escoras-metalicas.html">Escoras Metálicas</a>')
    .replace(/<a href="acessorios-para-escoramento\.html">[^<]*Acess[^<]*<\/a>/gi, '<a href="acessorios-para-escoramento.html">Acessórios</a>')
    .replace(/<a href="torres-de-escoramento\.html">[^<]*Torres[^<]*<\/a>/gi, '<a href="torres-de-escoramento.html">Torres de Escoramento</a>')
    .replace(/<a href="travamento-de-pilares\.html">[^<]*Travamento[^<]*<\/a>/gi, '<a href="travamento-de-pilares.html">Travamento de Pilares</a>')
    .replace(/<a href="vigas\.html">[^<]*Vigas[^<]*<\/a>/gi, '<a href="vigas.html">Vigas</a>')
    .replace(/Met\uFFFDlicas|Met\?licas|Metǭlicas/g, 'Metálicas')
    .replace(/Acess\uFFFDrios|Acess\?rios|Acessrios/g, 'Acessórios')
    .replace(/In\uFFFDcio|In\?cio|Incio/g, 'Início')
    .replace(/Solu\uFFFD\uFFFDes|Solu\?es|Solues/g, 'Soluções')
    .replace(/Seguran\uFFFDa|Seguran\?a|Segurana/g, 'Segurança')
    .replace(/Constru\uFFFD\uFFFDo|Constru\?o|Construo/g, 'Construção')
    .replace(/Or\uFFFDamento|Or\?amento|Oramento/g, 'Orçamento')
    .replace(/\?\?\?/g, '')
    .replace(/\?\?/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Totalmente limpo:', file);
});
