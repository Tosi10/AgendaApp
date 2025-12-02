import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { INFO_EMPRESA } from '../../constants/Empresa';
import { useGlobal } from '../../context/GlobalProvider';
import { db } from '../../lib/firebase';
import LoadingScreen from '../../components/LoadingScreen';

export default function Home() {
  const { user, userProfile } = useGlobal();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = userProfile?.tipoUsuario === 'admin';

  // Função para abrir WhatsApp com mensagem personalizada
  const abrirWhatsApp = (plano) => {
    const numeroWhatsApp = INFO_EMPRESA.whatsapp.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    // Construir mensagem com detalhes do plano
    let mensagem = `Olá! 👋\n\nGostaria de saber mais sobre o plano *"${plano.nome}"* da M2 Academia de Futebol! ⚽️\n\n`;
    mensagem += `📋 *Detalhes do Plano:*\n`;
    mensagem += `• ${plano.frequencia}\n`;
    mensagem += `• ${plano.aulas}\n`;
    mensagem += `• ${plano.reposicao}\n\n`;
    
    // Adicionar valores disponíveis
    if (plano.valores && plano.valores.length > 0) {
      mensagem += `💰 *Valores:*\n`;
      plano.valores.forEach((valor) => {
        mensagem += `• ${valor.tipo}: R$ ${valor.valor} (${valor.forma})\n`;
      });
    }
    
    mensagem += `\nGostaria de mais informações! 😊`;
    
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    
    Linking.openURL(url).catch((err) => {
      console.error('Erro ao abrir WhatsApp:', err);
      // Fallback: tentar abrir WhatsApp de outra forma
      Linking.openURL(`whatsapp://send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`);
    });
  };

  // Carregar planos do Firebase
  useEffect(() => {
    const q = query(collection(db, 'planos'), orderBy('ordem', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const planosData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        planosData.push({
          id: doc.id,
          ...data,
          // Garantir que valores seja um array
          valores: data.valores || []
        });
      });
      setPlanos(planosData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar planos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderPlano = ({ item }) => (
    <TouchableOpacity 
      className={`rounded-2xl p-4 mx-2 min-w-[280] ${item.destaque ? 'border-4 border-yellow-400 shadow-2xl' : 'border-2 shadow-lg'}`} 
      style={{ backgroundColor: item.cor + '60', borderColor: item.cor }}
      onPress={() => !isAdmin && abrirWhatsApp(item)}
      activeOpacity={0.8}
    >
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
        {(item.valores || []).map((valor, index) => (
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
    </TouchableOpacity>
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

          {/* Barra degradê amarela para azul */}
          <LinearGradient
            colors={['#FCD34D', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />

          {/* Seção de Planos */}
           <View className="px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50">
             <View className="flex-row items-center justify-between mb-4">
               <Text className="text-2xl font-pextrabold text-center flex-1 text-gray-800">
                 📋 Nossos Planos
               </Text>
               {isAdmin && (
                 <TouchableOpacity
                   onPress={() => router.push('/gerenciar-planos')}
                   className="bg-blue-600 rounded-lg px-4 py-2 ml-2"
                 >
                   <Ionicons name="settings" size={20} color="white" />
                 </TouchableOpacity>
               )}
             </View>
             {!isAdmin && (
               <Text className="text-gray-600 font-pregular text-center mb-4">
                 👆 Toque em um plano para falar conosco no WhatsApp!
               </Text>
             )}
             {loading ? (
               <View className="py-8 items-center">
                 <Text className="text-gray-600 font-pregular">Carregando planos...</Text>
               </View>
             ) : planos.length === 0 ? (
               <View className="py-8 items-center">
                 <Ionicons name="document-outline" size={64} color="#9CA3AF" />
                 <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                   Nenhum plano cadastrado
                 </Text>
                 {isAdmin && (
                   <TouchableOpacity
                     onPress={() => router.push('/gerenciar-planos')}
                     className="bg-blue-600 rounded-lg px-6 py-3 mt-4"
                   >
                     <Text className="text-white font-pbold">
                       Criar Primeiro Plano
                     </Text>
                   </TouchableOpacity>
                 )}
               </View>
             ) : (
               <FlatList
                 data={planos}
                 renderItem={renderPlano}
                 keyExtractor={(item) => item.id}
                 horizontal
                 showsHorizontalScrollIndicator={false}
                 contentContainerStyle={{ paddingHorizontal: 6 }}
               />
             )}
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
                    📅
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
                  <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.whatsapp}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="logo-instagram" size={20} color="#EC4899" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.instagram}
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
  gradientBar: {
    height: 8,
    width: '100%',
  },
}); 