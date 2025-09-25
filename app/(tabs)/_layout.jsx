import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useGlobal } from '../../context/GlobalProvider';

export default function TabsLayout() {
  const { setCurrentTab, triggerResetHistorico, unreadMessagesCount, clearUnreadCount } = useGlobal();

  const handleTabPress = (tabName) => {
    setCurrentTab(tabName);
    // Resetar histórico quando mudar para a aba Perfil
    if (tabName === 'perfil') {
      triggerResetHistorico();
    }
    // Limpar notificações quando entrar no chat
    if (tabName === 'chat') {
      clearUnreadCount();
    }
  };

  // Componente para ícone do chat com badge
  const ChatIconWithBadge = ({ color, size }) => {
    console.log('🔍 DEBUG: ChatIconWithBadge renderizado - unreadMessagesCount:', unreadMessagesCount);
    return (
      <View style={{ position: 'relative' }}>
        <Ionicons name="chatbubbles" size={size} color={color} />
        {unreadMessagesCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -2,
            right: -6,
            backgroundColor: '#EF4444',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#1e40af'
          }}>
            <Text style={{
              color: 'white',
              fontSize: 12,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
            </Text>
          </View>
        )}
      </View>
    );
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
            <ChatIconWithBadge color={color} size={size} />
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