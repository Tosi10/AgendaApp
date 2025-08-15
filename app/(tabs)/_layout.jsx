import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useGlobal } from '../../context/GlobalProvider';

export default function TabsLayout() {
  const { setCurrentTab, triggerResetHistorico } = useGlobal();

  const handleTabPress = (tabName) => {
    setCurrentTab(tabName);
    // Resetar histórico quando mudar para a aba Perfil
    if (tabName === 'perfil') {
      triggerResetHistorico();
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#93c5fd',
        tabBarStyle: {
          backgroundColor: '#1e40af',
          borderTopWidth: 1,
          borderTopColor: '#1e3a8a',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('home'),
        }}
      />
      <Tabs.Screen
        name="agendar"
        options={{
          title: 'Agendar',
          tabBarLabel: 'Agendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('agendar'),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('chat'),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('perfil'),
        }}
      />
    </Tabs>
  );
} 