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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('aluno');
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
      
      // Criar perfil do usuário no Firestore
      await createUserProfile({
        uid: newUser.uid,
        email: newUser.email,
        tipoUsuario: tipoUsuario
      });
      
      if (tipoUsuario === 'admin') {
        Alert.alert('Sucesso', 'Conta de administrador criada com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Conta criada com sucesso! Aguarde aprovação de um administrador.');
      }
      
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
      source={require('../../assets/images/murilo.png')} 
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
            <Text className="text-white font-pbold text-3xl mb-2">
              Criar conta
            </Text>
            <Text className="text-blue-50 font-pregular text-base">
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

            {/* Seleção de Tipo de Usuário */}
            <View className="space-y-2">
              <Text className="text-white font-pbold text-base">
                Tipo de Usuário
              </Text>
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={() => setTipoUsuario('aluno')}
                  className={`rounded-lg p-3 border-2 ${
                    tipoUsuario === 'aluno'
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-white/30 bg-white/10'
                  }`}
                >
                  <Text className={`text-center font-pbold ${
                    tipoUsuario === 'aluno' ? 'text-blue-200' : 'text-white/70'
                  }`}>
                    Aluno
                  </Text>
                  <Text className={`text-center text-xs mt-1 ${
                    tipoUsuario === 'aluno' ? 'text-blue-200' : 'text-white/50'
                  }`}>
                    Acesso às aulas em grupo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setTipoUsuario('personal')}
                  className={`rounded-lg p-3 border-2 ${
                    tipoUsuario === 'personal'
                      ? 'border-purple-400 bg-purple-500/20'
                      : 'border-white/30 bg-white/10'
                  }`}
                >
                  <Text className={`text-center font-pbold ${
                    tipoUsuario === 'personal' ? 'text-purple-200' : 'text-white/70'
                  }`}>
                    Personal Training
                  </Text>
                  <Text className={`text-center text-xs mt-1 ${
                    tipoUsuario === 'personal' ? 'text-purple-200' : 'text-white/50'
                  }`}>
                    Treinos individualizados
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setTipoUsuario('admin')}
                  className={`rounded-lg p-3 border-2 ${
                    tipoUsuario === 'admin'
                      ? 'border-red-400 bg-red-500/20'
                      : 'border-white/30 bg-white/10'
                  }`}
                >
                  <Text className={`text-center font-pbold ${
                    tipoUsuario === 'admin' ? 'text-red-200' : 'text-white/70'
                  }`}>
                    Professor
                  </Text>
                  <Text className={`text-center text-xs mt-1 ${
                    tipoUsuario === 'admin' ? 'text-red-200' : 'text-white/50'
                  }`}>
                    Controle total
                  </Text>
                </TouchableOpacity>
              </View>
              
              {tipoUsuario === 'aluno' && (
                <Text className="text-blue-200 text-xs text-center">
                  Sua conta será analisada por um administrador antes da aprovação
                </Text>
              )}
              
              {tipoUsuario === 'personal' && (
                <Text className="text-purple-200 text-xs text-center">
                  Conta de Personal Training com acesso imediato e horários flexíveis
                </Text>
              )}
              
              {tipoUsuario === 'admin' && (
                <Text className="text-red-200 text-xs text-center">
                  Conta de professor com acesso ilimitado e controle total
                </Text>
              )}
            </View>

            <CustomButton
              title={loading ? 'Cadastrando...' : 'Criar conta'}
              onPress={handleSignUp}
              loading={loading}
              className="mt-6"
            />

            <View className="mt-6 flex-row justify-center items-center">
              <Text className="text-blue-50 font-pregular text-base">
                Já tem uma conta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                <Text className="text-blue-200 font-pbold text-base">
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