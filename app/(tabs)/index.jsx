import { Button, StyleSheet, Text, View } from 'react-native';
import { useGlobal } from '../../context/GlobalProvider';

export default function HomeTab() {
  const { user, signOut } = useGlobal();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, {user?.email}!</Text>
      <Button title="Sair" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
}); 