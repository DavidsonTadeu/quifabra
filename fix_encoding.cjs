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
  'blog.html'
];

const map = [
  [/Solu[\?\uFFFD]es/g, 'Soluções'],
  [/solu[\?\uFFFD]es/g, 'soluções'],
  [/Seguran[\?\uFFFD]a/g, 'Segurança'],
  [/seguran[\?\uFFFD]a/g, 'segurança'],
  [/In[\?\uFFFD]cio/g, 'Início'],
  [/Acess[\?\uFFFD]rios/g, 'Acessórios'],
  [/acess[\?\uFFFD]rios/g, 'acessórios'],
  [/Met[\?\uFFFD]licas/g, 'Metálicas'],
  [/met[\?\uFFFD]licas/g, 'metálicas'],
  [/Constru[\?\uFFFD][\?\uFFFD]o/g, 'Construção'],
  [/constru[\?\uFFFD][\?\uFFFD]o/g, 'construção'],
  [/Or[\?\uFFFD]amento/g, 'Orçamento'],
  [/or[\?\uFFFD]amento/g, 'orçamento'],
  [/op[\?\uFFFD][\?\uFFFD]es/g, 'opções'],
  [/Op[\?\uFFFD][\?\uFFFD]es/g, 'Opções'],
  [/dimens[\?\uFFFD][\?\uFFFD]es/g, 'dimensões'],
  [/Dimens[\?\uFFFD][\?\uFFFD]es/g, 'Dimensões'],
  [/prote[\?\uFFFD][\?\uFFFD]o/g, 'proteção'],
  [/Prote[\?\uFFFD][\?\uFFFD]o/g, 'Proteção'],
  [/fixa[\?\uFFFD][\?\uFFFD]o/g, 'fixação'],
  [/Fixa[\?\uFFFD][\?\uFFFD]o/g, 'Fixação'],
  [/especifica[\?\uFFFD][\?\uFFFD]es/g, 'especificações'],
  [/Especifica[\?\uFFFD][\?\uFFFD]es/g, 'Especificações'],
  [/manuten[\?\uFFFD][\?\uFFFD]o/g, 'manutenção'],
  [/Manuten[\?\uFFFD][\?\uFFFD]o/g, 'Manutenção'],
  [/orienta[\?\uFFFD][\?\uFFFD]o/g, 'orientação'],
  [/instala[\?\uFFFD][\?\uFFFD]o/g, 'instalação'],
  [/Instala[\?\uFFFD][\?\uFFFD]o/g, 'Instalação'],
  [/edif[\?\uFFFD]cios/g, 'edifícios'],
  [/Edif[\?\uFFFD]cios/g, 'Edifícios'],
  [/R[\?\uFFFD]pida/g, 'Rápida'],
  [/r[\?\uFFFD]pida/g, 'rápida'],
  [/resist[\?\uFFFD]ncia/g, 'resistência'],
  [/Resist[\?\uFFFD]ncia/g, 'Resistência'],
  [/f[\?\uFFFD]rmas/g, 'fôrmas'],
  [/F[\?\uFFFD]rmas/g, 'Fôrmas'],
  [/a[\?\uFFFD]o/g, 'aço'],
  [/A[\?\uFFFD]o/g, 'Aço'],
  [/d[\?\uFFFD]vidas/g, 'dúvidas'],
  [/D[\?\uFFFD]vidas/g, 'Dúvidas'],
  [/Informa[\?\uFFFD][\?\uFFFD]es/g, 'Informações'],
  [/informa[\?\uFFFD][\?\uFFFD]es/g, 'informações'],
  [/obrigat[\?\uFFFD]rios/g, 'obrigatórios'],
  [/v[\?\uFFFD]lido/g, 'válido'],
  [/formul[\?\uFFFD]rio/g, 'formulário'],
  [/p[\?\uFFFD]-direito/g, 'pé-direito'],
  [/P[\?\uFFFD]-direito/g, 'Pé-direito']
];

files.forEach(file => {
  const filePath = path.join('c:', 'quifabra', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    map.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Corrigido:', file);
  }
});
