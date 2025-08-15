import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { auth } from '../../lib/firebase';

export default function ResetPassword() {
  const { oobCode } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validCode, setValidCode] = useState(false);
  const [errors, setErrors] = useState({});

  // Verificar se o código de reset é válido
  useEffect(() => {
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => {
          setValidCode(true);
          setVerifying(false);
        })
        .catch((error) => {
          console.error('Erro ao verificar código:', error);
          setValidCode(false);
          setVerifying(false);
        });
    } else {
      setVerifying(false);
      setValidCode(false);
    }
  }, [oobCode]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Nova senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleResetPassword() {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      Alert.alert(
        'Senha Alterada!', 
        'Sua senha foi alterada com sucesso. Você pode fazer login com a nova senha.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/sign-in')
          }
        ]
      );
    } catch (error) {
      let msg = 'Erro ao alterar senha';
      if (error.code === 'auth/expired-action-code') msg = 'Link expirado. Solicite um novo link de recuperação.';
      if (error.code === 'auth/invalid-action-code') msg = 'Link inválido. Solicite um novo link de recuperação.';
      if (error.code === 'auth/weak-password') msg = 'Senha muito fraca. Use uma senha mais forte.';
      Alert.alert('Erro', msg);
    }
    setLoading(false);
  }

  if (verifying) {
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
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-white/90 rounded-2xl p-8 items-center">
              <View className="bg-blue-100 rounded-full p-4 mb-6">
                <Text className="text-6xl">⏳</Text>
              </View>
              <Text className="text-black font-pextrabold text-2xl text-center">
                Verificando...
              </Text>
              <Text className="text-black font-pregular text-lg text-center mt-2">
                Validando seu link de recuperação
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  if (!validCode) {
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
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-white/90 rounded-2xl p-8 items-center">
              <View className="bg-red-100 rounded-full p-4 mb-6">
                <Text className="text-6xl">❌</Text>
              </View>
              
              <Text className="text-black font-pextrabold text-2xl text-center mb-4">
                Link Inválido
              </Text>
              
              <Text className="text-black font-pregular text-lg text-center mb-6 leading-6">
                Este link de recuperação é inválido ou expirou.
              </Text>
              
              <TouchableOpacity 
                onPress={() => router.replace('/(auth)/forgot-password')}
                className="bg-blue-500 border-4 border-blue-700 rounded-lg px-6 py-3 items-center"
              >
                <Text className="text-white font-pextrabold text-lg">
                  Solicitar Novo Link
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
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
            <Text className="text-black font-pextrabold text-4xl mb-2 text-center">
              Nova Senha
            </Text>
            <Text className="text-black font-pbold text-lg text-center">
              Digite sua nova senha
            </Text>
          </View>

          <View className="space-y-6">
            <FormField
              label="Nova Senha"
              placeholder="Digite sua nova senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <FormField
              label="Confirmar Nova Senha"
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <CustomButton
              title={loading ? 'Alterando...' : 'Alterar Senha'}
              onPress={handleResetPassword}
              loading={loading}
              className="mt-6"
            />

            <View className="mt-6 flex-row justify-center">
              <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
                <Text className="text-black font-pbold text-base underline">
                  ← Voltar ao Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}
