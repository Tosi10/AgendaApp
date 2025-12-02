/**
 * Script para migrar planos do arquivo constants/Planos.js para o Firebase
 * Execute este script uma vez para popular o Firebase com os planos iniciais
 * 
 * Como usar:
 * 1. Certifique-se de que o Firebase está configurado
 * 2. Execute: node scripts/migrar-planos-firebase.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, getDocs } = require('firebase/firestore');

// Configuração do Firebase (mesma do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyCxKeZRlYFNGNOrrZ517C1nslktJcJltWo",
  authDomain: "agendamento-e97f7.firebaseapp.com",
  projectId: "agendamento-e97f7",
  storageBucket: "agendamento-e97f7.appspot.com",
  messagingSenderId: "265177362996",
  appId: "1:265177362996:web:9bf74dff8d665f79fe5061"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Planos iniciais (baseados no index.jsx)
const planosIniciais = [
  {
    nome: 'Quem corre é a bola⚽️',
    frequencia: '1x na semana',
    aulas: '4 aulas no mês',
    reposicao: '❌ Sem direito a reposição',
    valores: [
      { tipo: 'Mensal', valor: '135,90', forma: 'Dinheiro ou PIX' }
    ],
    cor: '#3B82F6',
    corGradiente: 'from-blue-500 to-blue-600',
    destaque: false,
    ordem: 0
  },
  {
    nome: 'Toca e passa⚽️',
    frequencia: '2x na semana',
    aulas: '8 aulas no mês',
    reposicao: '❌ Sem direito a reposição',
    valores: [
      { tipo: 'Mensal', valor: '199,90', forma: 'Dinheiro ou PIX' },
      { tipo: 'Trimestral', valor: '179,90', forma: '3x no cartão' },
      { tipo: 'À vista', valor: '480,00', forma: 'À vista' }
    ],
    cor: '#10B981',
    corGradiente: 'from-green-500 to-emerald-600',
    destaque: false,
    ordem: 1
  },
  {
    nome: 'Jogou onde fera⚽️',
    frequencia: '3x na semana',
    aulas: '12 aulas no mês',
    reposicao: '❌ Sem direito a reposição',
    valores: [
      { tipo: 'Mensal', valor: '239,90', forma: 'Dinheiro ou PIX' },
      { tipo: 'Trimestral', valor: '219,90', forma: '3x no cartão' },
      { tipo: 'À vista', valor: '580,00', forma: 'Plano trimestral' }
    ],
    cor: '#F59E0B',
    corGradiente: 'from-yellow-500 to-orange-500',
    destaque: false,
    ordem: 2
  },
  {
    nome: 'Segura Juvenil⚽️',
    frequencia: '4x na semana',
    aulas: '16 aulas no mês',
    reposicao: '❌ Sem direito a reposição',
    valores: [
      { tipo: 'Mensal', valor: '259,90', forma: 'Dinheiro ou PIX' },
      { tipo: 'Trimestral', valor: '239,90', forma: '3x no cartão' },
      { tipo: 'À vista', valor: '640,00', forma: 'Trimestral à vista' }
    ],
    cor: '#EF4444',
    corGradiente: 'from-red-500 to-pink-500',
    destaque: true,
    ordem: 3
  },
  {
    nome: 'Respeita a minha História⚽️',
    frequencia: '5x na semana',
    aulas: '20 aulas no mês',
    reposicao: '❌ Sem direito a reposição',
    valores: [
      { tipo: 'Mensal', valor: '279,90', forma: 'Dinheiro ou PIX' },
      { tipo: 'Trimestral', valor: '259,90', forma: '3x no cartão' },
      { tipo: 'À vista', valor: '700,00', forma: 'À vista' }
    ],
    cor: '#8B5CF6',
    corGradiente: 'from-purple-500 to-violet-600',
    destaque: false,
    ordem: 4
  }
];

async function migrarPlanos() {
  try {
    console.log('🔄 Verificando se já existem planos no Firebase...');
    
    // Verificar se já existem planos
    const planosSnapshot = await getDocs(collection(db, 'planos'));
    
    if (!planosSnapshot.empty) {
      console.log('⚠️  Já existem planos no Firebase. Pule esta migração ou delete os existentes primeiro.');
      return;
    }

    console.log('📝 Migrando planos para o Firebase...');
    
    for (const plano of planosIniciais) {
      await addDoc(collection(db, 'planos'), {
        ...plano,
        dataCriacao: new Date(),
        ultimaAtualizacao: new Date()
      });
      console.log(`✅ Plano "${plano.nome}" adicionado`);
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log(`📊 Total de ${planosIniciais.length} planos migrados`);
  } catch (error) {
    console.error('❌ Erro ao migrar planos:', error);
  }
}

// Executar migração
migrarPlanos().then(() => {
  console.log('✅ Script finalizado');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

