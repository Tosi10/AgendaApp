import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { useGlobal } from '../../context/GlobalProvider';
import { auth, db } from '../../lib/firebase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [apelido, setApelido] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    if (!apelido) {
      newErrors.apelido = 'Apelido é obrigatório';
    } else if (apelido.length < 2) {
      newErrors.apelido = 'Apelido deve ter pelo menos 2 caracteres';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSignUp() {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Criar perfil do usuário no Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        email: email,
        apelido: apelido,
        tipoUsuario: 'aluno', // Tipo padrão
        aprovado: false, // Precisa ser aprovado pelo admin
        m2Coins: 0,
        createdAt: new Date(),
      });
      
      Alert.alert(
        'Sucesso!', 
        'Conta criada com sucesso! Aguarde a aprovação de um administrador.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/waiting-approval') }]
      );
    } catch (error) {
      let msg = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') msg = 'E-mail já está em uso';
      if (error.code === 'auth/invalid-email') msg = 'E-mail inválido';
      if (error.code === 'auth/weak-password') msg = 'Senha muito fraca';
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
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-1 bg-white/60">
          <ScrollView 
            className="flex-1 px-6"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Logo M2 Academia */}
          <View className="items-center mb-6">
            <Image
              source={require('../../assets/images/M2_1.png')}
              className="w-28 h-28"
              resizeMode="contain"
            />
          </View>

          {/* Título de Cadastro */}
          <View className="mb-4">
            <Text className="text-gray-800 font-bold text-2xl mb-2 text-center">
              Criar conta
            </Text>
          </View>

          {/* Formulário */}
          <View className="items-center">
            <View className="space-y-2 items-center">
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
                label="Apelido"
                placeholder="Digite seu apelido"
                value={apelido}
                onChangeText={setApelido}
                autoCapitalize="words"
                maxLength={20}
                error={errors.apelido}
              />

              <FormField
                label="Senha"
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
              />

              <FormField
                label="Confirmar Senha"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={errors.confirmPassword}
              />

              {/* Informação sobre aprovação */}
              <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <Text className="text-blue-800 text-sm text-center font-medium">
                  Sua conta será analisada por um administrador antes da aprovação
                </Text>
              </View>
            </View>

            <View className="mt-8">
              <CustomButton
                title={loading ? 'Cadastrando...' : 'Criar conta'}
                onPress={handleSignUp}
                loading={loading}
                className="w-full"
              />
            </View>
          </View>

          <View className="mt-6 flex-row justify-center items-center">
            <Text className="text-gray-700 font-medium text-base">
              Já tem uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text className="text-blue-600 font-bold text-base underline">
                Fazer login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}