import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { useGlobal } from '../../context/GlobalProvider';
import { auth } from '../../lib/firebase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [apelido, setApelido] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, createUserProfile } = useGlobal();

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
    
    if (!apelido.trim()) {
      newErrors.apelido = 'Apelido é obrigatório';
    } else if (apelido.trim().length < 2) {
      newErrors.apelido = 'Apelido deve ter pelo menos 2 caracteres';
    } else if (apelido.trim().length > 20) {
      newErrors.apelido = 'Apelido deve ter no máximo 20 caracteres';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSignUp() {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Criar perfil do usuário no Firestore (sempre como aluno)
      await createUserProfile({
        uid: newUser.uid,
        email: newUser.email,
        apelido: apelido.trim(),
        tipoUsuario: 'aluno' // Sempre aluno por padrão
      });
      
      Alert.alert('Sucesso', 'Conta criada com sucesso! Aguarde aprovação de um administrador.');
      
      // O GlobalProvider vai redirecionar automaticamente
    } catch (error) {
      let msg = 'Erro ao cadastrar';
      if (error.code === 'auth/email-already-in-use') msg = 'E-mail já cadastrado';
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
            <Text className="text-black font-pextrabold text-4xl mb-2 tracking-wide">
              Criar conta
            </Text>
            <Text className="text-black font-pbold text-lg">
              Preencha os dados para se cadastrar
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
            <View className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
              <Text className="text-black text-xs text-center">
                Sua conta será analisada por um administrador antes da aprovação
              </Text>
            </View>

            <CustomButton
              title={loading ? 'Cadastrando...' : 'Criar conta'}
              onPress={handleSignUp}
              loading={loading}
              className="mt-6"
            />

            <View className="mt-6 flex-row justify-center items-center">
              <Text className="text-black font-pregular text-base">
                Já tem uma conta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                <Text className="text-blue-600 font-pbold text-base">
                  Fazer login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}
