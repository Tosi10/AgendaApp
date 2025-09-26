import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useGlobal } from '../../context/GlobalProvider';
import { db } from '../../lib/firebase';

export default function Chat() {
  const { user, userProfile, updateUnreadCount, clearUnreadCount } = useGlobal();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [resetChat, setResetChat] = useState(0);
  const scrollViewRef = useRef();

  // Verificar se o usuário pode usar o chat
  const canUseChat = userProfile && userProfile.aprovado;

  // Monitorar teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Função para obter o início do dia atual
  const getStartOfDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Carregar mensagens do dia atual
  const loadTodayMessages = () => {
    if (!user) return;

    const startOfDay = getStartOfDay();
    
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'chat'), 
        where('timestamp', '>=', startOfDay),
        orderBy('timestamp', 'asc')
      ),
      (snapshot) => {
        const messagesData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date()
          });
        });
        
        setMessages(messagesData);
        
        setLoading(false);
        
        // Scroll para o final para mostrar mensagens mais recentes
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.error('Erro ao carregar mensagens:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  // Carregar TODAS as mensagens para contagem de não lidas
  const loadAllMessagesForUnreadCount = () => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'chat'), 
        orderBy('timestamp', 'desc')
      ),
      (snapshot) => {
        const allMessages = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          allMessages.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date()
          });
        });
        
        // Atualizar contador de mensagens não lidas com TODAS as mensagens
        updateUnreadCount(allMessages);
      },
      (error) => {
        console.error('Erro ao carregar mensagens para contagem:', error);
      }
    );

    return unsubscribe;
  };

  // Carregar mensagens de dias anteriores
  const loadMoreMessages = async () => {
    if (!user || loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    
    try {
      const startOfDay = getStartOfDay();
      let queryRef = query(
        collection(db, 'chat'),
        where('timestamp', '<', startOfDay),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      if (lastMessageTimestamp) {
        queryRef = query(
          collection(db, 'chat'),
          where('timestamp', '<', lastMessageTimestamp),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
      }

      const snapshot = await getDocs(queryRef);
      const newMessages = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        newMessages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });

      if (newMessages.length > 0) {
        setLastMessageTimestamp(newMessages[newMessages.length - 1].timestamp);
        setMessages(prev => [...newMessages.reverse(), ...prev]);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Erro ao carregar mais mensagens:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Reset quando a aba ganhar foco (igual ao perfil)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Aba Chat ganhou foco - Resetando para mensagens do dia');
      setHasMoreMessages(true);
      setLastMessageTimestamp(null);
      // Limpar badge de mensagens não lidas
      clearUnreadCount();
    }, [])
  );

  // Carregar mensagens
  useEffect(() => {
    if (!user) return;
    
    // Carregar mensagens do dia atual para exibição
    const unsubscribeToday = loadTodayMessages();
    
    // Carregar todas as mensagens para contagem de não lidas
    const unsubscribeAll = loadAllMessagesForUnreadCount();
    
    return () => {
      unsubscribeToday();
      unsubscribeAll();
    };
  }, [user]);

  // Enviar mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'chat'), {
        text: newMessage.trim(),
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0] || 'Usuário',
        userType: userProfile?.tipoUsuario || 'aluno',
        timestamp: serverTimestamp()
      });

      setNewMessage('');
      
      // Scroll para o final (mensagens mais recentes estão embaixo agora)
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Não foi possível enviar a mensagem.');
    }
  };

  // Formatar hora
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Formatar data
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const today = new Date();
    const messageDate = timestamp;
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    
    return messageDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  if (!canUseChat) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundContainer}>
          <Image
            source={require('../../assets/images/murilo.png')}
            style={styles.backgroundImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.restrictedContainer}>
            <Ionicons name="lock-closed" size={64} color="#EF4444" />
            <Text style={styles.restrictedTitle}>
              Chat Restrito
            </Text>
            <Text style={styles.restrictedText}>
              Sua conta ainda não foi aprovada. Aguarde a aprovação de um administrador.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundContainer}>
          <Image
            source={require('../../assets/images/murilo.png')}
            style={styles.backgroundImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando chat...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../../assets/images/M2_9.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </View>

      {/* Conteúdo principal */}
      <View style={styles.contentContainer}>
        {/* Header - Só mostra quando teclado está fechado */}
        {!isKeyboardVisible && (
          <View style={styles.header}>
            <Text style={styles.titleText}>
              Chat M2
            </Text>
            <Text style={styles.subtitleText}>
              Conecte-se com outros alunos e professores
            </Text>
          </View>
        )}

        {/* Botão flutuante de voltar - só aparece quando teclado está aberto */}
        {isKeyboardVisible && (
          <TouchableOpacity 
            style={styles.floatingBackButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="home" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Barra degradê amarela para azul */}
        <LinearGradient
          colors={['#FCD34D', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />

        {/* Lista de mensagens */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                Nenhuma mensagem ainda
              </Text>
              <Text style={styles.emptyText}>
                Seja o primeiro a iniciar uma conversa!
              </Text>
            </View>
          ) : (
            <View>
              {/* Botão para carregar mensagens anteriores */}
              {hasMoreMessages && (
                <TouchableOpacity 
                  style={styles.loadMoreButton}
                  onPress={loadMoreMessages}
                  disabled={loadingMore}
                >
                  <Text style={styles.loadMoreText}>
                    {loadingMore ? 'Carregando...' : 'Carregar mensagens anteriores'}
                  </Text>
                </TouchableOpacity>
              )}
              
              
              {messages.map((message) => {
              const isOwnMessage = message.userId === user?.uid;
              const showDate = true; // Sempre mostrar data para simplicidade
              
              return (
                <View key={message.id} style={styles.messageWrapper}>
                  {showDate && (
                    <View style={styles.dateSeparator}>
                      <Text style={styles.dateText}>
                        {formatDate(message.timestamp)}
                      </Text>
                    </View>
                  )}
                  
                  <View style={[
                    styles.messageContainer,
                    isOwnMessage ? styles.ownMessage : styles.otherMessage
                  ]}>
                    <View style={styles.messageHeader}>
                      <Text style={[
                        styles.userName,
                        isOwnMessage ? styles.ownUserName : styles.otherUserName
                      ]}>
                        {message.userName}
                      </Text>
                    </View>
                    
                    <Text style={[
                      styles.messageText,
                      isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                    ]}>
                      {message.text}
                    </Text>
                    
                    <Text style={[
                      styles.timestamp,
                      isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
                    ]}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            })}
            </View>
          )}
        </ScrollView>

        {/* Input de mensagem */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          enabled={true}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#6B7280"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={newMessage.trim() ? "white" : "#9CA3AF"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    width: '140%',
    height: '140%',
    opacity: 0.35,
    left: '-15%',
    top: '-10%',
  },
  contentContainer: {
    flex: 1,
    zIndex: 10,
    position: 'relative',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#2563eb',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  titleText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 26,
    marginBottom: 6,
  },
  subtitleText: {
    color: '#dbeafe',
    fontWeight: '400',
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  messageWrapper: {
    marginBottom: 16,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
    borderWidth: 2,
    borderColor: '#1E40AF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  ownUserName: {
    color: '#DBEAFE',
  },
  otherUserName: {
    color: '#374151',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: '#DBEAFE',
  },
  otherTimestamp: {
    color: '#9CA3AF',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    // Melhor comportamento com teclado
    position: 'relative',
    zIndex: 1000,
    // Transição suave
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#2563EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  restrictedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  gradientBar: {
    height: 8,
    width: '100%',
  },
}); 