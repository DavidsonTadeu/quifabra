import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApEIAZnP0vY90FB6lgeqHfLK29xmbRbEI",
  authDomain: "quifabraloja.firebaseapp.com",
  projectId: "quifabraloja",
  storageBucket: "quifabraloja.firebasestorage.app",
  messagingSenderId: "1080972695767",
  appId: "1:1080972695767:web:66afdf99dbee15122ef892",
  measurementId: "G-1MDVV7PKDX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const sapataFixa = {
    title: "Sapata Fixa para Andaime Quifabra",
    price: 30.00,
    promo_price: 30.00,
    category: "Acessórios",
    desc_short: "Sapata simples fixa para andaime, provê suporte e estabilidade em estruturas temporárias. Aço resistente.",
    desc_long: "Sapata simples fixa para andaime, desenvolvida pela Quifabra, destinada a prover suporte e estabilidade em estruturas temporárias de acesso. O componente apresenta compatibilidade técnica com a linha de andaimes do padrão MECAN, garantindo o nivelamento adequado em superfícies de apoio.<br><br>Especificações técnicas:<br>- Tubo estrutural: 33,70 mm de diâmetro externo por 2,00 mm de espessura de parede.<br>- Altura do tubo: 9,5 cm.<br>- Base de apoio (chapa): 11 cm x 12 cm.<br>- Espessura da chapa: 3/16 polegadas.<br><br>Este dispositivo atua como o ponto de interface entre o elemento vertical do andaime e o piso, distribuindo a carga de forma equilibrada para assegurar a conservação da integridade estrutural do conjunto. A seleção dos materiais e as dimensões nominais conferem resistência mecânica adequada às solicitações de compressão características em sistemas de escoramento e fachadeiros metálicos, assegurando a compatibilidade necessária para montagens industriais e civis.",
    image_url: "assets/images/sapata-fixa.png",
    images: ["assets/images/sapata-fixa.png"],
    status: "Ativo",
    stock: 100
  };

  const kitEscoras = {
    title: "Kit 10 Escoras Metálicas Quifabra 2,00 a 3,10m",
    price: 1900.00,
    promo_price: 1900.00,
    category: "Escoramento",
    desc_short: "Kit com 10 escoras metálicas com regulagem de 2,00m a 3,10m. Alta resistência, pintura epóxi.",
    desc_long: "Kit 10 Escoras Metálicas Quifabra 2,00 a 3,10m. Ideal para obras de pequeno a grande porte. Fabricadas em aço carbono de alta resistência.<br><br>Características:<br>- Regulagem de altura: 2,00m até 3,10m<br>- Capacidade de carga: até 1.500 kg por escora<br>- Acabamento: Pintura epóxi anticorrosiva<br>- Sistema de rosca com ajuste fino rápido e seguro<br>- Base de apoio reforçada",
    image_url: "assets/images/prod-escoras-kit.jpg",
    images: ["assets/images/prod-escoras-kit.jpg"],
    status: "Ativo",
    stock: 50
  };

  try {
    await setDoc(doc(db, "products", "sapata-fixa"), sapataFixa);
    console.log("Sapata Fixa added!");
    await setDoc(doc(db, "products", "kit-10-escoras"), kitEscoras);
    console.log("Kit 10 Escoras added!");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}

run();
