import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
    <View className="flex-1 bg-blue-900">
      <ImageBackground 
        source={require('../../assets/images/M2_3.png')} 
        className="flex-1"
        resizeMode="contain"
      >
        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View className="flex-1 bg-white/40">
          <ScrollView 
            className="flex-1 px-6"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Título de Boas-vindas */}
            <View className="mb-6">
              <Text className="text-gray-800 font-bold text-4xl mb-2 text-center">
                Bem-vindo!
              </Text>
              <Text className="text-blue-600 text-base text-center">
                Faça login para continuar
              </Text>
            </View>

            {/* Formulário */}
            <View className="items-center space-y-4">
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
            </View>

            <View className="mt-8 items-center">
              <CustomButton
                title={loading ? 'Entrando...' : 'Entrar'}
                onPress={handleSignIn}
                loading={loading}
                className="w-full"
                style={{ width: 285 }}
              />
            </View>

            <View className="flex-row justify-center mt-6">
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text className="text-blue-600 font-bold text-base underline">
                  Esqueci minha senha
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-6 flex-row justify-center items-center">
              <Text className="text-gray-700 font-medium text-base">
                Não tem uma conta?{' '}
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/sign-up')}
                className="bg-yellow-500 border-2 border-yellow-600 rounded-lg px-3 py-2"
              >
                <Text className="text-black font-bold text-sm">
                  Criar conta
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
    </View>
  );
}