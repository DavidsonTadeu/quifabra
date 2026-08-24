const fs = require('fs');
const path = require('path');

const dir = 'c:/quifabra';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// Regex que encontra o caractere U+FFFD e caracteres ao redor para contexto
const FFFD = '\uFFFD';

// Mapa de substituicao: padrao de texto corrompido -> texto correto
const fixes = [
  // Palavras com U+FFFD no meio
  [/Andaime Fachadeiro/g, 'Andaime Fachadeiro'],
  [/Escoras Met[^\w]licas/g, 'Escoras Metálicas'],
  [/Escoras Met\uFFFDlicas/g, 'Escoras Metálicas'],
  [/Escoras Metǭlicas/g, 'Escoras Metálicas'],
  [/Acess\uFFFDrios/g, 'Acessórios'],
  [/In\uFFFDcio/g, 'Início'],
  [/Solu\uFFFD\uFFFDes/g, 'Soluções'],
  [/solu\uFFFD\uFFFDes/g, 'soluções'],
  [/Seguran\uFFFDa/g, 'Segurança'],
  [/seguran\uFFFDa/g, 'segurança'],
  [/Constru\uFFFD\uFFFDo/g, 'Construção'],
  [/constru\uFFFD\uFFFDo/g, 'construção'],
  [/Or\uFFFDamento/g, 'Orçamento'],
  [/op\uFFFD\uFFFDes/g, 'opções'],
  [/Op\uFFFD\uFFFDes/g, 'Opções'],
  [/dimens\uFFFD\uFFFDes/g, 'dimensões'],
  [/Dimens\uFFFD\uFFFDes/g, 'Dimensões'],
  [/prote\uFFFD\uFFFDo/g, 'proteção'],
  [/Prote\uFFFD\uFFFDo/g, 'Proteção'],
  [/fixa\uFFFD\uFFFDo/g, 'fixação'],
  [/Fixa\uFFFD\uFFFDo/g, 'Fixação'],
  [/instala\uFFFD\uFFFDo/g, 'instalação'],
  [/Instala\uFFFD\uFFFDo/g, 'Instalação'],
  [/manuten\uFFFD\uFFFDo/g, 'manutenção'],
  [/Manuten\uFFFD\uFFFDo/g, 'Manutenção'],
  [/situa\uFFFD\uFFFDo/g, 'situação'],
  [/Situa\uFFFD\uFFFDo/g, 'Situação'],
  [/orienta\uFFFD\uFFFDo/g, 'orientação'],
  [/especifica\uFFFD\uFFFDes/g, 'especificações'],
  [/Especifica\uFFFD\uFFFDes/g, 'Especificações'],
  [/informa\uFFFD\uFFFDes/g, 'informações'],
  [/Informa\uFFFD\uFFFDes/g, 'Informações'],
  [/aplica\uFFFD\uFFFDo/g, 'aplicação'],
  [/Aplica\uFFFD\uFFFDo/g, 'Aplicação'],
  [/execu\uFFFD\uFFFDo/g, 'execução'],
  [/Execu\uFFFD\uFFFDo/g, 'Execução'],
  [/locomo\uFFFD\uFFFDo/g, 'locomoção'],
  [/conex\uFFFD\uFFFDo/g, 'conexão'],
  [/condi\uFFFD\uFFFDes/g, 'condições'],
  [/Condi\uFFFD\uFFFDes/g, 'Condições'],
  [/fun\uFFFD\uFFFDes/g, 'funções'],
  [/Fun\uFFFD\uFFFDes/g, 'Funções'],
  [/regi\uFFFD\uFFFDes/g, 'regiões'],
  [/edif\uFFFDcios/g, 'edifícios'],
  [/Edif\uFFFDcios/g, 'Edifícios'],
  [/R\uFFFDpida/g, 'Rápida'],
  [/r\uFFFDpida/g, 'rápida'],
  [/resist\uFFFDncia/g, 'resistência'],
  [/Resist\uFFFDncia/g, 'Resistência'],
  [/compet\uFFFDncia/g, 'competência'],
  [/excel\uFFFDncia/g, 'excelência'],
  [/Excel\uFFFDncia/g, 'Excelência'],
  [/efici\uFFFDncia/g, 'eficiência'],
  [/Efici\uFFFDncia/g, 'Eficiência'],
  [/emerg\uFFFDncia/g, 'emergência'],
  [/f\uFFFDrmas/g, 'fôrmas'],
  [/F\uFFFDrmas/g, 'Fôrmas'],
  [/pr\uFFFDpria/g, 'própria'],
  [/pr\uFFFDprio/g, 'próprio'],
  [/pr\uFFFDprias/g, 'próprias'],
  [/pr\uFFFDprios/g, 'próprios'],
  [/Pr\uFFFDprio/g, 'Próprio'],
  [/Pr\uFFFDpria/g, 'Própria'],
  [/n\uFFFDvel/g, 'nível'],
  [/N\uFFFDvel/g, 'Nível'],
  [/v\uFFFDlido/g, 'válido'],
  [/v\uFFFDlida/g, 'válida'],
  [/f\uFFFDcil/g, 'fácil'],
  [/F\uFFFDcil/g, 'Fácil'],
  [/r\uFFFDpido/g, 'rápido'],
  [/R\uFFFDpido/g, 'Rápido'],
  [/s\uFFFDlida/g, 'sólida'],
  [/s\uFFFDlido/g, 'sólido'],
  [/t\uFFFDcnica/g, 'técnica'],
  [/T\uFFFDcnica/g, 'Técnica'],
  [/t\uFFFDcnico/g, 'técnico'],
  [/T\uFFFDcnico/g, 'Técnico'],
  [/p\uFFFD-direito/g, 'pé-direito'],
  [/P\uFFFD-direito/g, 'Pé-direito'],
  [/d\uFFFDvidas/g, 'dúvidas'],
  [/D\uFFFDvidas/g, 'Dúvidas'],
  [/servi\uFFFDos/g, 'serviços'],
  [/Servi\uFFFDos/g, 'Serviços'],
  [/a\uFFFDo/g, 'aço'],
  [/A\uFFFDo/g, 'Aço'],
  [/obrigat\uFFFDrios/g, 'obrigatórios'],
  [/formul\uFFFDrio/g, 'formulário'],
  [/Formul\uFFFDrio/g, 'Formulário'],
  [/calend\uFFFDrio/g, 'calendário'],
  [/ordin\uFFFDrio/g, 'ordinário'],
  [/tempor\uFFFDrio/g, 'temporário'],
  [/loja\uFFFD??\s*Loja/g, '🛒 Loja'],
  // Chevrons corrompidos em spans
  [/<span class="chevron">\uFFFD<\/span>/g, '<span class="chevron">▾</span>'],
  [/<span class="chevron">[^\w<]*<\/span>/g, '<span class="chevron">▾</span>'],
  // Remove qualquer U+FFFD restante que nao foi substituido
  [/\uFFFD+/g, '']
];

let totalFixed = 0;
files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let before = content;
  
  fixes.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    console.log('Corrigido:', file);
  }
});

console.log(`\nTotal de arquivos corrigidos: ${totalFixed}`);
