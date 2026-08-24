const fs = require('fs');
const path = require('path');

const files = [
  'andaime-tubular.html',
  'andaime-fachadeiro.html',
  'escoras-metalicas.html',
  'acessorios-para-escoramento.html',
  'torres-de-escoramento.html',
  'travamento-de-pilares.html',
  'vigas.html',
  'blog.html',
  'index.html',
  'loja.html'
];

const replacements = [
  [/\?/g, (match, offset, string) => {
    // Preserva interrogacoes de URLs ou perguntas reais
    const prevChar = string[offset - 1] || '';
    const nextChar = string[offset + 1] || '';
    if (prevChar === '=' || prevChar === '&' || nextChar === '=' || nextChar === '&') return '?';
    if (string.substring(offset - 10, offset).includes('href') || string.substring(offset - 10, offset).includes('src')) return '?';
    return '';
  }],
  [/In\?cio/gi, 'Início'],
  [/Acess\?rios/gi, 'Acessórios'],
  [/Met\?licas/gi, 'Metálicas'],
  [/Constru\?o/gi, 'Construção'],
  [/Or\?amento/gi, 'Orçamento'],
  [/op\?es/gi, 'opções'],
  [/dimens\?es/gi, 'dimensões'],
  [/prote\?o/gi, 'proteção'],
  [/fixa\?o/gi, 'fixação'],
  [/especifica\?es/gi, 'especificações'],
  [/manuten\?o/gi, 'manutenção'],
  [/orienta\?o/gi, 'orientação'],
  [/instala\?o/gi, 'instalação'],
  [/edif\?cios/gi, 'edifícios'],
  [/R\?pida/gi, 'Rápida'],
  [/r\?pida/gi, 'rápida'],
  [/resist\?ncia/gi, 'resistência'],
  [/f\?rmas/gi, 'fôrmas'],
  [/a\?o/gi, 'aço'],
  [/d\?vidas/gi, 'dúvidas'],
  [/Informa\?es/gi, 'Informações'],
  [/obrigat\?rios/gi, 'obrigatórios'],
  [/v\?lido/gi, 'válido'],
  [/formul\?rio/gi, 'formulário'],
  [/p\?-\s*direito/gi, 'pé-direito'],
  [/pr\?pria/gi, 'própria'],
  [/serv\?os/gi, 'serviços'],
  [/Serv\?os/gi, 'Serviços'],
  [/solu\?es/gi, 'soluções'],
  [/Solu\?es/gi, 'Soluções'],
  [/seguran\?a/gi, 'segurança'],
  [/Seguran\?a/gi, 'Segurança']
];

files.forEach(file => {
  const filePath = path.join('c:', 'quifabra', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substituicoes especificas de palavras
    replacements.slice(1).forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });

    // Limpa icones corrompidos em spans ou emots
    content = content.replace(/<span class="icon">\?\?\?<\/span>/g, '<span class="icon">🏗️</span>');
    content = content.replace(/<span class="icon">\?\?<\/span>/g, '<span class="icon">🧱</span>');
    content = content.replace(/alt=".*?(\?).*?"/g, (match) => match.replace(/\?/g, ''));

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Limpo com sucesso:', file);
  }
});
