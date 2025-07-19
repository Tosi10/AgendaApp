import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useGlobal } from '../../context/GlobalProvider';

export default function Home() {
  const { user, signOut } = useGlobal();

  const avisos = [
    {
      id: 1,
      titulo: 'Aulas Suspensas',
      mensagem: 'As aulas estarão suspensas no próximo feriado (15/11)',
      tipo: 'warning',
      data: '10/11/2024'
    },
    {
      id: 2,
      titulo: 'Novo Horário',
      mensagem: 'Aulas de sábado agora começam às 8:00 da manhã',
      tipo: 'info',
      data: '08/11/2024'
    },
    {
      id: 3,
      titulo: 'Campeonato',
      mensagem: 'Inscrições abertas para o campeonato de fim de ano',
      tipo: 'success',
      data: '05/11/2024'
    }
  ];

  const noticias = [
    {
      id: 1,
      titulo: 'Equipe Vence Torneio Regional',
      resumo: 'Nossa equipe conquistou o primeiro lugar no torneio regional de futebol',
      data: '12/11/2024'
    },
    {
      id: 2,
      titulo: 'Novos Uniformes',
      resumo: 'Novos uniformes chegaram e serão distribuídos na próxima semana',
      data: '10/11/2024'
    }
  ];

  const getIconColor = (tipo) => {
    switch (tipo) {
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'success': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getIconName = (tipo) => {
    switch (tipo) {
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      case 'success': return 'checkmark-circle';
      default: return 'ellipse';
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 py-4">
        <Text className="text-white font-pbold text-xl">
          Bem-vindo, {user?.email?.split('@')[0]}!
        </Text>
        <Text className="text-blue-100 font-pregular text-sm">
          Acompanhe as novidades e agende suas aulas
        </Text>
      </View>

      {/* Avisos */}
      <View className="px-6 py-4">
        <Text className="text-gray-800 font-pbold text-lg mb-4">
          📢 Avisos Importantes
        </Text>
        
        {avisos.map((aviso) => (
          <View key={aviso.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons 
                name={getIconName(aviso.tipo)} 
                size={20} 
                color={getIconColor(aviso.tipo)} 
              />
              <Text className="text-gray-800 font-pbold text-base ml-2">
                {aviso.titulo}
              </Text>
            </View>
            <Text className="text-gray-600 font-pregular text-sm mb-2">
              {aviso.mensagem}
            </Text>
            <Text className="text-gray-400 font-pregular text-xs">
              {aviso.data}
            </Text>
          </View>
        ))}
      </View>

      {/* Notícias */}
      <View className="px-6 py-4">
        <Text className="text-gray-800 font-pbold text-lg mb-4">
          📰 Últimas Notícias
        </Text>
        
        {noticias.map((noticia) => (
          <View key={noticia.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-gray-800 font-pbold text-base mb-2">
              {noticia.titulo}
            </Text>
            <Text className="text-gray-600 font-pregular text-sm mb-2">
              {noticia.resumo}
            </Text>
            <Text className="text-gray-400 font-pregular text-xs">
              {noticia.data}
            </Text>
          </View>
        ))}
      </View>

      {/* Estatísticas Rápidas */}
      <View className="px-6 py-4">
        <Text className="text-gray-800 font-pbold text-lg mb-4">
          📊 Resumo da Semana
        </Text>
        
        <View className="flex-row space-x-3">
          <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-blue-600 font-pbold text-2xl">12</Text>
            <Text className="text-gray-600 font-pregular text-sm">Aulas Realizadas</Text>
          </View>
          <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-green-600 font-pbold text-2xl">45</Text>
            <Text className="text-gray-600 font-pregular text-sm">Alunos Ativos</Text>
          </View>
        </View>
      </View>

      {/* Botão de Logout */}
      <View className="px-6 py-4">
        <TouchableOpacity 
          onPress={signOut}
          className="bg-red-500 rounded-lg p-4 items-center"
        >
          <Text className="text-white font-pbold text-base">
            Sair da Conta
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 