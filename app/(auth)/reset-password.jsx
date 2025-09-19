import { router, useLocalSearchParams } from 'expo-router';
import { confirmPasswordReset } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { auth } from '../../lib/firebase';

export default function ResetPassword() {
  const { oobCode } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
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

  async function handleResetPassword() {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      Alert.alert(
        'Sucesso!', 
        'Sua senha foi alterada com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
      );
    } catch (error) {
      let msg = 'Erro ao alterar senha';
      if (error.code === 'auth/invalid-action-code') msg = 'Código inválido ou expirado';
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
      <View className="flex-1 bg-white/60">
        <ScrollView 
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo M2 Academia */}
          <View className="items-center mb-6">
            <Image
              source={require('../../assets/images/M2_1.png')}
              className="w-28 h-28"
              resizeMode="contain"
            />
            <Text className="text-xl font-bold text-gray-800 mt-2">
              M2 Academia
            </Text>
            <Text className="text-sm text-gray-600">
              Academia de Futebol
            </Text>
          </View>

          {/* Título de Nova Senha */}
          <View className="mb-4">
            <Text className="text-gray-800 font-bold text-2xl mb-2 text-center">
              Nova Senha
            </Text>
          </View>

          {/* Formulário */}
          <View className="items-center">
            <View className="space-y-2">
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
            </View>

            <View className="mt-8">
              <CustomButton
                title={loading ? 'Alterando...' : 'Alterar Senha'}
                onPress={handleResetPassword}
                loading={loading}
                className="w-full"
              />
            </View>
          </View>

          <View className="mt-6 flex-row justify-center">
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
              <Text className="text-blue-600 font-bold text-base underline">
                ← Voltar ao Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}