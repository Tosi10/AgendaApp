import React from 'react';
import { View, Image } from 'react-native';

export default function BackgroundLogo({ children }) {
  return (
    <View className="flex-1 bg-gray-50">
      {/* Logo de fundo sutil */}
      <View className="absolute top-10 right-4 opacity-10">
        <Image
          source={require('../assets/images/murilo.png')}
          className="w-32 h-32"
          resizeMode="contain"
        />
      </View>
      
      {children}
    </View>
  );
}
