import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { useGlobal } from '../../context/GlobalProvider';
import { auth, db } from '../../lib/firebase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
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
    
    if (!nome) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (nome.length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
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
        apelido: nome,
        tipoUsuario: 'aluno', // Tipo padrão
        aprovado: false, // Precisa ser aprovado pelo admin
        m2Coins: 0,
        dataCriacao: new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString()
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
    <View className="flex-1 bg-blue-900">
      <ImageBackground 
        source={require('../../assets/images/M2_3.png')} 
        className="flex-1"
        resizeMode="contain"
        style={{ transform: [{ scale: 1.05 }, { translateX: -13 }, { translateY: -5 }] }}
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
              {/* Título de Cadastro */}
              <View className="mb-6" style={{ transform: [{ translateX: -8 }, { translateY: -5 }] }}>
                <Text className="text-gray-800 font-bold text-4xl mb-2 text-center">
                  Criar conta
                </Text>
                <Text className="text-blue-600 text-base text-center">
                  Preencha os dados para se cadastrar
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
                  label="Nome"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  maxLength={20}
                  error={errors.nome}
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

              <View className="mt-8 items-center">
                <CustomButton
                  title={loading ? 'Cadastrando...' : 'Criar conta'}
                  onPress={handleSignUp}
                  loading={loading}
                  className="w-full"
                  style={{ width: 285 }}
                />
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
    </View>
  );
}