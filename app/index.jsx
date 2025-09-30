import { Image, View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 bg-blue-900">
      <Image
        source={require('../assets/images/M2_9.png')}
        resizeMode="contain"
        className="w-full h-full"
      />
    </View>
  );
} 