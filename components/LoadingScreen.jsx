import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function LoadingScreen({ message = 'Carregando...' }) {
  return (
    <View className="flex-1 bg-gray-50 justify-center items-center">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-600 text-base mt-4 text-center">
        {message}
      </Text>
    </View>
  );
}
