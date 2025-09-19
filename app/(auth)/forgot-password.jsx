import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { auth } from '../../lib/firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleResetPassword() {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Email Enviado!', 
        'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      let msg = 'Erro ao enviar email';
      if (error.code === 'auth/user-not-found') msg = 'Usuário não encontrado';
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

          {/* Título de Recuperação */}
          <View className="mb-4">
            <Text className="text-gray-800 font-bold text-2xl mb-2 text-center">
              Recuperar Senha
            </Text>
          </View>

          {/* Formulário */}
          <View className="items-center">
            <View className="space-y-2">
              <FormField
                label="E-mail"
                placeholder="Digite seu e-mail cadastrado"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
            </View>

            <View className="mt-8">
              <CustomButton
                title={loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
                onPress={handleResetPassword}
                loading={loading}
                className="w-full"
              />
            </View>
          </View>

          <View className="mt-6 flex-row justify-center">
            <TouchableOpacity onPress={() => router.back()}>
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