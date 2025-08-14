import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Index() {
  return (
    <View className="flex-1 bg-blue-50 justify-center items-center px-6">
      <Text className="text-3xl font-bold text-blue-800 mb-8 text-center">
        AgendaApp
      </Text>
      
      <Text className="text-lg text-gray-600 mb-8 text-center">
        Sistema de Agendamento com Controle de Usuários
      </Text>
      
      <View className="space-y-4 w-full max-w-sm">
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          className="bg-blue-500 rounded-lg p-4 items-center"
        >
          <Text className="text-white font-bold text-lg">
            Fazer Login
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-up')}
          className="bg-green-500 rounded-lg p-4 items-center"
        >
          <Text className="text-white font-bold text-lg">
            Criar Conta
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text className="text-sm text-gray-500 mt-8 text-center">
        Sistema com dois tipos de usuários: Alunos e Administradores
      </Text>
    </View>
  );
} 