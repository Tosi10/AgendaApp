import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { useGlobal } from '../../context/GlobalProvider';
import { auth } from '../../lib/firebase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useGlobal();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSignIn() {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O GlobalProvider vai redirecionar automaticamente
    } catch (error) {
      let msg = 'Erro ao entrar';
      if (error.code === 'auth/user-not-found') msg = 'Usuário não encontrado';
      if (error.code === 'auth/wrong-password') msg = 'Senha incorreta';
      if (error.code === 'auth/invalid-email') msg = 'E-mail inválido';
      Alert.alert('Erro', msg);
    }
    setLoading(false);
  }

  return (
    <ImageBackground 
      source={require('../../assets/images/M2_9.png')} 
      className="flex-1"
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(70, 78, 78, 0.7)', 'rgba(5, 130, 246, 0.5)', 'rgba(50, 16, 100, 0.5)']}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8">
            <Text className="text-black font-pextrabold text-4xl mb-2">
              Bem-vindo!
            </Text>
            <Text className="text-black font-pbold text-lg">
              Faça login para continuar
            </Text>
          </View>

          <View className="space-y-4">
            <FormField
              label="E-mail"
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <FormField
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <CustomButton
              title={loading ? 'Entrando...' : 'Entrar'}
              onPress={handleSignIn}
              loading={loading}
              className="mt-6"
            />

            <View className="mt-6 flex-row justify-center items-center">
              <Text className="text-black font-pregular text-base">
                Não tem uma conta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                <Text className="text-yellow-500 font-pextrabold text-xl" style={{ fontWeight: '900' }}>
                  Criar conta
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
} 