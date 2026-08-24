// Lógica da Calculadora de Andaimes

document.addEventListener('DOMContentLoaded', () => {
  const heightSlider = document.getElementById('calc-height');
  const heightDisplay = document.getElementById('calc-height-val');
  
  const widthSlider = document.getElementById('calc-width');
  const widthDisplay = document.getElementById('calc-width-val');

  const radioSapatas = document.getElementById('base-sapatas');
  const radioRodizios = document.getElementById('base-rodizios');
  const checkPisos = document.getElementById('opt-pisos');

  const resPaineis = document.getElementById('res-paineis');
  const resBases = document.getElementById('res-bases');
  const resBasesName = document.getElementById('res-bases-name');
  const resDiagonais = document.getElementById('res-diagonais');
  const resPisosRow = document.getElementById('res-pisos-row');
  const resPisos = document.getElementById('res-pisos');
  
  const btnZap = document.getElementById('btn-calc-zap');

  function calculate() {
    const H = parseInt(heightSlider.value, 10);
    const W = parseInt(widthSlider.value, 10); // Metragem linear
    
    // Atualiza displays
    heightDisplay.textContent = H + 'm';
    widthDisplay.textContent = W + 'm';

    // Regras Quifabra
    // Altura H = H níveis.
    // Largura W = W torres lada a lado. (Torres independentes ou acopladas? 
    // Para simplificar: W metros lineares = W torres. 
    // Cada torre precisa de H níveis. Total Níveis = H * W.
    // Painéis = (H * W) * 2. 
    const totalTorres = W;
    const totalPaineis = (H * totalTorres) * 2;
    
    // Bases = 4 por torre
    const totalBases = totalTorres * 4;
    
    // Diagonais = 1 a cada 3m de altura, por torre. Mínimo 1 se H>=2.
    // Se H=1, 0 diagonais. Se H=2..3, 1 diagonal. Se H=4..6, 2 diagonais.
    let diagonaisPorTorre = Math.floor(H / 3);
    if (H >= 2 && diagonaisPorTorre === 0) diagonaisPorTorre = 1; // Travamento minimo
    const totalDiagonais = diagonaisPorTorre * totalTorres;

    // Pisos: 1 piso completo = 1 ou 2 plataformas por torre dependendo do modelo.
    // Vamos recomendar 1 kit piso (ou 2 plataformas) por torre no ultimo nível.
    const usarPisos = checkPisos.checked;
    const totalPisos = usarPisos ? totalTorres * 2 : 0; 
    const tipoBase = radioSapatas.checked ? 'Sapatas Reguláveis' : 'Rodízios (Rodas)';

    // Update UI
    resPaineis.textContent = totalPaineis;
    resBases.textContent = totalBases;
    resBasesName.textContent = tipoBase;
    resDiagonais.textContent = totalDiagonais;

    if (usarPisos) {
      resPisosRow.style.display = 'flex';
      resPisos.textContent = totalPisos;
    } else {
      resPisosRow.style.display = 'none';
    }

    // Update WhatsApp link
    const QF_WHATSAPP = '553173335573';
    let msg = `Olá! Fiz o cálculo no site para um andaime de ${H}m de altura e ${W}m de largura.\n\n`;
    msg += `Preciso do seguinte material:\n`;
    msg += `- ${totalPaineis} Painéis\n`;
    msg += `- ${totalBases} ${tipoBase}\n`;
    msg += `- ${totalDiagonais} Diagonais\n`;
    if (usarPisos) msg += `- ${totalPisos} Plataformas de Piso\n`;
    msg += `\nPode me passar o orçamento do aluguel?`;
    
    btnZap.href = `https://wa.me/${QF_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }

  // Listeners
  heightSlider.addEventListener('input', calculate);
  widthSlider.addEventListener('input', calculate);
  checkPisos.addEventListener('change', () => {
    checkPisos.parentElement.classList.toggle('selected', checkPisos.checked);
    calculate();
  });

  document.querySelectorAll('.calc-radio-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      // Unselect all
      document.querySelectorAll('.calc-radio-option').forEach(o => o.classList.remove('selected'));
      // Select clicked
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
      calculate();
    });
  });

  // Init
  calculate();
});
