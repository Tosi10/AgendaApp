import React from 'react';
import { Image, Text, View } from 'react-native';

export default function M2Coin({ size = 24, coins = 0, showCount = true, color = '#F59E0B' }) {
  return (
    <View className="flex-row items-center">
      <View 
        className="items-center justify-center"
        style={{
          width: size,
          height: size,
          shadowColor: color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Image 
          source={require('../assets/images/m2coin.png')}
          style={{
            width: size,
            height: size,
            resizeMode: 'contain'
          }}
        />
      </View>
      
      {showCount && (
        <View className="ml-2">
          <Text className="text-yellow-600 font-pextrabold text-xl">
            {coins}
          </Text>
          <Text className="text-yellow-500 font-pbold text-sm">
            M2 Coins
          </Text>
        </View>
      )}
    </View>
  );
}
