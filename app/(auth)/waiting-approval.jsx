import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useGlobal } from '../../context/GlobalProvider';

export default function WaitingApproval() {
  const { user, userProfile } = useGlobal();
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/sign-in');
      return;
    }

    // Verificar se o usuário foi aprovado
    const checkApprovalStatus = () => {
      setCheckingStatus(true);
      const userRef = doc(db, 'usuarios', user.uid);
      
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          if (userData.aprovado) {
            // Usuário foi aprovado - redirecionar para tela principal
            router.replace('/(tabs)');
          }
        }
        setCheckingStatus(false);
      });

      return unsubscribe;
    };

    const unsubscribe = checkApprovalStatus();
    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível sair da conta');
    }
  };

  const handleContactAdmin = () => {
    Alert.alert(
      'Contatar Administrador',
      'Entre em contato com o professor responsável para solicitar aprovação da sua conta.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <ImageBackground 
      source={require('../../assets/images/murilo.png')} 
      className="flex-1"
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(70, 78, 78, 0.8)', 'rgba(5, 130, 246, 0.7)', 'rgba(50, 16, 100, 0.7)']}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-8 items-center">
            <View className="bg-yellow-500/20 rounded-full p-4 mb-4 border-2 border-yellow-400">
              <Ionicons name="time" size={48} color="#FCD34D" />
            </View>
            <Text className="text-white font-pextrabold text-3xl mb-2 text-center">
              Aguardando Aprovação
            </Text>
            <Text className="text-blue-100 font-pregular text-lg text-center">
              Sua conta está sendo analisada
            </Text>
          </View>

          {/* Status Card */}
          <View className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
            <View className="flex-row items-center mb-4">
              <View className="bg-yellow-500 rounded-full p-2 mr-3">
                <Ionicons name="person" size={24} color="white" />
              </View>
              <Text className="text-white font-pbold text-xl">
                Status da Conta
              </Text>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-blue-100 font-pregular">E-mail:</Text>
                <Text className="text-white font-pbold">{userProfile.email}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-blue-100 font-pregular">Apelido:</Text>
                <Text className="text-white font-pbold">{userProfile.apelido}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-blue-100 font-pregular">Tipo:</Text>
                <View className="bg-blue-500/20 rounded-full px-3 py-1 border border-blue-400">
                  <Text className="text-blue-200 font-pbold text-sm">
                    {userProfile.tipoUsuario === 'admin' ? 'PROFESSOR' : 'ALUNO'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-blue-100 font-pregular">Status:</Text>
                <View className="bg-yellow-500/20 rounded-full px-3 py-1 border border-yellow-400">
                  <Text className="text-yellow-200 font-pbold text-sm">
                    PENDENTE
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Informações */}
          <View className="bg-blue-500/20 rounded-2xl p-6 mb-6 border border-blue-400/30">
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={24} color="#93C5FD" />
              <Text className="text-blue-200 font-pbold text-lg ml-2">
                O que acontece agora?
              </Text>
            </View>
            
            <View className="space-y-2">
              <Text className="text-blue-100 font-pregular text-sm">
                • Sua conta foi criada com sucesso
              </Text>
              <Text className="text-blue-100 font-pregular text-sm">
                • Um administrador irá analisar seu cadastro
              </Text>
              <Text className="text-blue-100 font-pregular text-sm">
                • Você receberá acesso assim que for aprovado
              </Text>
              <Text className="text-blue-100 font-pregular text-sm">
                • Este processo geralmente leva algumas horas
              </Text>
            </View>
          </View>

          {/* Ações */}
          <View className="space-y-4 mb-6">
            <TouchableOpacity
              onPress={handleContactAdmin}
              className="bg-blue-500 rounded-lg p-4 items-center border border-blue-400"
            >
              <View className="flex-row items-center">
                <Ionicons name="chatbubble" size={20} color="white" />
                <Text className="text-white font-pbold text-lg ml-2">
                  Contatar Administrador
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-red-500/20 rounded-lg p-4 items-center border border-red-400/50"
            >
              <View className="flex-row items-center">
                <Ionicons name="log-out" size={20} color="#FCA5A5" />
                <Text className="text-red-200 font-pbold text-lg ml-2">
                  Sair da Conta
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {checkingStatus && (
            <View className="items-center py-4">
              <View className="bg-white/20 rounded-full p-3">
                <Ionicons name="refresh" size={24} color="white" />
              </View>
              <Text className="text-white/80 font-pregular text-sm mt-2">
                Verificando status...
              </Text>
            </View>
          )}

          {/* Footer */}
          <View className="items-center py-4">
            <Text className="text-blue-100 font-pregular text-xs text-center">
              Você será redirecionado automaticamente quando sua conta for aprovada
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}
