import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Alert, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { auth } from '../../lib/firebase';
import { getPasswordResetErrorMessage, getPasswordResetSuccessMessage } from '../../lib/firebase-auth-config';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
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
      setEmailSent(true);
      const successMessage = getPasswordResetSuccessMessage(email);
      Alert.alert(successMessage.title, successMessage.message);
    } catch (error) {
      const errorMessage = getPasswordResetErrorMessage(error.code);
      Alert.alert('Erro', errorMessage);
    }
    setLoading(false);
  }

  if (emailSent) {
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
            <View className="bg-white/90 rounded-2xl p-8 items-center">
              <View className="bg-green-100 rounded-full p-4 mb-6">
                <Text className="text-6xl">✅</Text>
              </View>
              
              <Text className="text-black font-pextrabold text-3xl text-center mb-4">
                Email Enviado!
              </Text>
              
              <Text className="text-black font-pregular text-lg text-center mb-6 leading-6">
                Enviamos um link de recuperação para:
                <Text className="font-pbold"> {email}</Text>
              </Text>
              
              <Text className="text-gray-600 font-pregular text-base text-center mb-8 leading-6">
                • Verifique sua caixa de entrada{'\n'}
                • O link expira em 1 hora{'\n'}
                • Verifique também a pasta de spam
              </Text>
              
              <View className="space-y-4 w-full">
                <CustomButton
                  title="Reenviar Email"
                  onPress={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  variant="secondary"
                  className="w-full"
                />
                
                <TouchableOpacity 
                  onPress={() => router.back()}
                  className="bg-blue-500 border-4 border-blue-700 rounded-lg px-4 py-3 items-center"
                >
                  <Text className="text-white font-pextrabold text-lg">
                    Voltar ao Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
              Recuperar Senha
            </Text>
            <Text className="text-black font-pbold text-lg text-center">
              Digite seu e-mail para receber o link de recuperação
            </Text>
          </View>

          <View className="space-y-6">
            <FormField
              label="E-mail"
              placeholder="Digite seu e-mail cadastrado"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <CustomButton
              title={loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
              onPress={handleResetPassword}
              loading={loading}
              className="mt-6"
            />

            <View className="mt-6 flex-row justify-center">
              <TouchableOpacity onPress={() => router.back()}>
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
