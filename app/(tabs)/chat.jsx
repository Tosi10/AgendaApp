import { Ionicons } from '@expo/vector-icons';
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useGlobal } from '../../context/GlobalProvider';
import { db } from '../../lib/firebase';

export default function Chat() {
  const { user } = useGlobal();
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef();

  // Carregar mensagens do Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chat'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensagensData = [];
      snapshot.forEach((doc) => {
        mensagensData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setMensagens(mensagensData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar mensagens:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Enviar mensagem
  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return;

    try {
      await addDoc(collection(db, 'chat'), {
        texto: novaMensagem.trim(),
        usuario: user?.email,
        nomeUsuario: user?.displayName || user?.email?.split('@')[0] || 'Usuário',
        timestamp: serverTimestamp(),
        dataEnvio: new Date().toLocaleString('pt-BR')
      });

      setNovaMensagem('');
      
      // Scroll para a última mensagem
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Não foi possível enviar a mensagem.');
    }
  };

  // Verificar se a mensagem é do usuário atual
  const isMinhaMensagem = (mensagem) => {
    return mensagem.usuario === user?.email;
  };

  // Formatar timestamp
  const formatarHora = (timestamp) => {
    if (!timestamp) return '';
    
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return data.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600 font-pregular">Carregando chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="bg-blue-600 px-6 py-16">
        <Text className="text-white font-pbold text-xl text-center">
          Chat do Grupo
        </Text>
        <Text className="text-blue-100 font-pregular text-sm text-center">
          Conecte-se com outros alunos
        </Text>
      </View>

      {/* Lista de mensagens */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {mensagens.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
              Nenhuma mensagem ainda
            </Text>
            <Text className="text-gray-400 font-pregular text-sm text-center mt-2">
              Seja o primeiro a enviar uma mensagem!
            </Text>
          </View>
        ) : (
          mensagens.map((mensagem) => (
            <View 
              key={mensagem.id} 
              className={`mb-3 ${isMinhaMensagem(mensagem) ? 'items-end' : 'items-start'}`}
            >
              {/* Nome do usuário */}
              {!isMinhaMensagem(mensagem) && (
                <Text className="text-gray-600 font-pregular text-xs mb-1 ml-2">
                  {mensagem.nomeUsuario}
                </Text>
              )}

              {/* Bolha da mensagem */}
              <View className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isMinhaMensagem(mensagem)
                  ? 'bg-blue-600 rounded-br-md'
                  : 'bg-white rounded-bl-md shadow-sm'
              }`}>
                <Text className={`font-pregular text-base ${
                  isMinhaMensagem(mensagem) ? 'text-white' : 'text-gray-800'
                }`}>
                  {mensagem.texto}
                </Text>
              </View>

              {/* Timestamp */}
              <Text className={`text-gray-400 font-pregular text-xs mt-1 ${
                isMinhaMensagem(mensagem) ? 'mr-2' : 'ml-2'
              }`}>
                {formatarHora(mensagem.timestamp)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Input para nova mensagem */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center space-x-3">
          <TextInput
            placeholder="Digite sua mensagem..."
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 font-pregular"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={enviarMensagem}
            disabled={!novaMensagem.trim()}
            className={`p-3 rounded-full ${
              novaMensagem.trim() ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={novaMensagem.trim() ? 'white' : '#9ca3af'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
} 