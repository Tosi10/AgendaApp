import { Ionicons } from '@expo/vector-icons';
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { INFO_EMPRESA } from '../../constants/Empresa';
import { useGlobal } from '../../context/GlobalProvider';

export default function Home() {
  const { user, userProfile } = useGlobal();

  // Dados dos planos
  const planos = [
    {
      id: '1',
      nome: 'Quem corre é a bola⚽️',
      frequencia: '1x na semana',
      aulas: '4 aulas no mês',
      reposicao: '❌ Sem direito a reposição',
      valores: [
        { tipo: 'Mensal', valor: '135,90', forma: 'Dinheiro ou PIX' }
      ],
      cor: '#3B82F6',
      corGradiente: 'from-blue-500 to-blue-600',
      destaque: false
    },
    {
      id: '2',
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
      destaque: false
    },
    {
      id: '3',
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
      destaque: false
    },
    {
      id: '4',
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
      destaque: true
    },
    {
      id: '5',
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
      destaque: false
    }
  ];

  // Horários da semana com cores diferentes
  const horarios = [
    { dia: 'Segunda', horarios: '6:30 / 17:30 / 18:30', cor: 'from-blue-500 to-cyan-500' },
    { dia: 'Terça', horarios: '17:00 / 18:00', cor: 'from-green-500 to-emerald-500' },
    { dia: 'Quarta', horarios: '6:30 / 10:00 / 17:30 / 18:30', cor: 'from-purple-500 to-pink-500' },
    { dia: 'Quinta', horarios: '17:00 / 18:00', cor: 'from-orange-500 to-red-500' },
    { dia: 'Sexta', horarios: '6:30 / 18:00', cor: 'from-indigo-500 to-blue-500' }
  ];

  const renderHorario = ({ item }) => (
    <View className={`bg-gradient-to-br ${item.cor} rounded-xl p-4 mx-2 min-w-[150] shadow-lg border-2 border-gray-800`}>
      <View className="bg-black/40 rounded-lg p-2 mb-2">
        <Text className="text-gray-900 font-pextrabold text-base text-center">
          {item.dia}
        </Text>
      </View>
      <Text className="text-gray-900 font-pextrabold text-sm text-center">
        {item.horarios}
      </Text>
    </View>
  );

  const renderPlano = ({ item }) => (
    <View className={`rounded-2xl p-4 mx-2 min-w-[280] ${item.destaque ? 'border-4 border-yellow-400 shadow-2xl' : 'border-2 shadow-lg'}`} style={{ backgroundColor: item.cor + '60', borderColor: item.cor }}>
      {item.destaque && (
        <View className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1 self-center mb-2">
          <Text className="text-white font-pextrabold text-xs text-center">
            ⭐ PLANO DESTAQUE
          </Text>
        </View>
      )}
      
      <View className={`bg-gradient-to-r ${item.corGradiente} rounded-t-xl -m-4 mb-4 p-4`}>
        <Text className="text-gray-900 font-pextrabold text-2xl text-center tracking-wider" style={{ textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
          {item.nome}
        </Text>
      </View>
      
      <View className="space-y-3 mb-4">
        <View className="flex-row items-center">
          <View className="bg-white rounded-full p-1 mr-2">
            <Ionicons name="calendar" size={16} color={item.cor} />
          </View>
          <Text className="text-gray-900 font-pextrabold text-base">
            {item.frequencia}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="bg-white rounded-full p-1 mr-2">
            <Ionicons name="football" size={16} color={item.cor} />
          </View>
          <Text className="text-gray-900 font-pextrabold text-base">
            {item.aulas}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="bg-white rounded-full p-1 mr-2">
            <Ionicons name="alert-circle" size={16} color={item.cor} />
          </View>
          <Text className="text-gray-900 font-pextrabold text-sm">
            {item.reposicao}
          </Text>
        </View>
      </View>
      
      <View className="space-y-2">
        {item.valores.map((valor, index) => (
          <View key={index} className="bg-white rounded-lg p-3 border-2 border-gray-300 shadow-sm">
            <Text className="text-gray-900 font-pextrabold text-xl text-center">
              R$ {valor.valor}
            </Text>
            <Text className="text-gray-800 font-pextrabold text-sm text-center">
              {valor.tipo} • {valor.forma}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../../assets/images/M2_9.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </View>

      {/* Conteúdo principal */}
      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header com boas-vindas */}
          <View style={styles.header}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text style={styles.welcomeText}>
                  Bem-vindo!
                </Text>
                <Text style={styles.userText}>
                  {userProfile?.apelido || user?.email?.split('@')[0] || 'Usuário'}
                </Text>
              </View>
              
              {/* M2 Coins */}
              <View className="bg-blue-500 rounded-full p-3">
                <View className="flex-row items-center">
                  <Image 
                    source={require('../../assets/images/m2coin.png')} 
                    className="w-8 h-8 mr-2"
                  />
                  <Text className="text-white font-pextrabold text-xl">
                    {userProfile?.m2Coins || 0}
                  </Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.titleText}>
              M2 Academia de Futebol
            </Text>
            <Text style={styles.subtitleText}>
              Transformando sonhos em realidade através do futebol
            </Text>
          </View>

          {/* Horários da Semana */}
          <View className="px-6 py-6 bg-gradient-to-r from-green-50 to-blue-50">
            <Text className="text-gray-800 font-pextrabold text-2xl mb-4 text-center">
              ⏰ Horários M2
            </Text>
            
            <FlatList
              data={horarios}
              renderItem={renderHorario}
              keyExtractor={(item) => item.dia}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 6 }}
            />
          </View>

          {/* Planos Disponíveis */}
          <View className="px-6 py-6 bg-gradient-to-r from-yellow-50 to-orange-50">
            <Text className="text-gray-800 font-pextrabold text-2xl mb-4 text-center">
              💰 Planos M2 Soccer Studio 2024
            </Text>
            
            <FlatList
              data={planos}
              renderItem={renderPlano}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 6 }}
            />
          </View>

          {/* Regras Importantes */}
          <View className="px-6 py-6 bg-yellow-50">
            <View className="bg-white rounded-2xl p-6 border border-yellow-200">
              <Text className="text-yellow-800 font-pextrabold text-xl mb-4 text-center">
                ⚠️ Regras Importantes
              </Text>
              
              <View className="space-y-3">
                <View className="flex-row items-start">
                  <Text className="text-yellow-600 font-pbold text-lg mr-2">
                    ❌
                  </Text>
                  <Text className="text-gray-700 font-pregular text-sm flex-1">
                    Reposição de aulas somente com atestado médico ou durante a vigência do plano
                  </Text>
                </View>
                
                <View className="flex-row items-start">
                  <Text className="text-yellow-600 font-pbold text-lg mr-2">
                    🎁
                  </Text>
                  <Text className="text-gray-700 font-pregular text-sm flex-1">
                    As aulas deverão ser pré-agendadas conforme disponibilidade
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Informações de Contato */}
          <View className="px-6 py-6 bg-gradient-to-r from-indigo-50 to-purple-50">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-gray-800 font-pextrabold text-2xl mb-4 text-center">
                📞 Contato
              </Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="call" size={20} color="#3B82F6" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.telefone}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.whatsapp}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={20} color="#EF4444" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.email}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="logo-instagram" size={20} color="#EC4899" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.instagram}
                  </Text>
                </View>
                
                {/* PIX corrigido */}
                <View className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 mt-4">
                  <Text className="text-white font-pextrabold text-center text-lg">
                    �� PIX: {INFO_EMPRESA?.pix || '10356007000102'}
                  </Text>
                  <Text className="text-white font-pregular text-sm text-center mt-1">
                    CNPJ da empresa
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    width: '140%',
    height: '140%',
    opacity: 0.15,
    left: '-15%',
    top: '-10%',
  },
  contentContainer: {
    flex: 1,
    zIndex: 10,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  welcomeText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 30,
    marginBottom: 8,
  },
  userText: {
    color: '#dbeafe',
    fontWeight: '400',
    fontSize: 18,
  },
  titleText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitleText: {
    color: '#dbeafe',
    fontWeight: '400',
    textAlign: 'center',
    fontSize: 16,
  },
}); 