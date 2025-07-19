import { Button, Text, View } from 'react-native';
import { useGlobal } from '../../context/GlobalProvider';

export default function HomeTab() {
  const { user, signOut } = useGlobal();

  return (
    <View className="flex-1 justify-center items-center bg-primary">
      <Text className="text-secondary font-pbold text-2xl mb-5">
        Bem-vindo, {user?.email}!
      </Text>
      <Button title="Sair" onPress={signOut} />
    </View>
  );
} 