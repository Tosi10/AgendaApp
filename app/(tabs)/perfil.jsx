import { Ionicons } from '@expo/vector-icons';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import LoadingScreen from '../../components/LoadingScreen';
import { INFO_EMPRESA } from '../../constants/Empresa';
import { PLANOS_DISPONIVEIS, PLANO_PERSONAL_TRAINING } from '../../constants/Planos';
import { useGlobal } from '../../context/GlobalProvider';
import { db } from '../../lib/firebase';

export default function Perfil() {
  const { user, signOut, userProfile, updateApelido, updateUserM2Coins, approveUser, rejectUser, fetchAllUsers } = useGlobal();
  const [historicoAulas, setHistoricoAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditApelido, setShowEditApelido] = useState(false);
  const [novoApelido, setNovoApelido] = useState('');
  const [editandoApelido, setEditandoApelido] = useState(false);
  
  // Estados para edição de coins
  const [showEditCoins, setShowEditCoins] = useState(false);
  const [editandoCoins, setEditandoCoins] = useState(false);
  const [usuarioEditandoCoins, setUsuarioEditandoCoins] = useState(null);
  const [novosCoins, setNovosCoins] = useState('');
  
  // Estados para funcionalidades administrativas
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  
  // Estados para seleção de planos
  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [usuarioEditandoPlano, setUsuarioEditandoPlano] = useState(null);
  const [editandoPlano, setEditandoPlano] = useState(false);
  
  // Estados para edição de tipo de usuário
  const [showTipoUsuarioModal, setShowTipoUsuarioModal] = useState(false);
  const [usuarioEditandoTipo, setUsuarioEditandoTipo] = useState(null);
  const [editandoTipo, setEditandoTipo] = useState(false);
  
  // Estado para busca de usuários
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para paginação do histórico
  const [historicoLimitado, setHistoricoLimitado] = useState([]);
  const [historicoVisivel, setHistoricoVisivel] = useState(3);
  const [podeCarregarMais, setPodeCarregarMais] = useState(false);

  const isAdmin = userProfile?.tipoUsuario === 'admin';
  const m2Coins = userProfile?.m2Coins || 0;
  
  // Carregar histórico de aulas do Firestore (apenas para alunos)
  useEffect(() => {
    if (!user || isAdmin) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'agendamentos'),
      (snapshot) => {
        const aulasData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.key && data.alunos && data.alunos.includes(user.email)) {
            // Extrair data e horário da chave
            const [dataStr, horario] = data.key.split('_');
            const dataAula = new Date(dataStr);
            
            aulasData.push({
              id: doc.id,
              data: dataAula,
              horario: horario,
              status: dataAula < new Date() ? 'realizada' : 'agendada'
            });
          }
        });
        
        setHistoricoAulas(aulasData);
        
        // Processar histórico limitado
        const aulasRealizadas = aulasData
          .filter(aula => aula.status === 'realizada')
          .sort((a, b) => b.data - a.data);
        
        const limitado = aulasRealizadas.slice(0, historicoVisivel);
        setHistoricoLimitado(limitado);
        setPodeCarregarMais(aulasRealizadas.length > historicoVisivel);
        
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar histórico:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Função para carregar mais registros
  const carregarMaisHistorico = () => {
    const novoLimite = historicoVisivel + 3;
    const aulasRealizadas = historicoAulas.filter(aula => aula.status === 'realizada');
    const limitado = aulasRealizadas.slice(0, novoLimite);
    
    setHistoricoLimitado(limitado);
    setHistoricoVisivel(novoLimite);
    setPodeCarregarMais(aulasRealizadas.length > novoLimite);
  };

  // Função para resetar paginação
  const resetarPaginação = () => {
    setHistoricoVisivel(3);
    const aulasRealizadas = historicoAulas.filter(aula => aula.status === 'realizada');
    const limitado = aulasRealizadas.slice(0, 3);
    setHistoricoLimitado(limitado);
    setPodeCarregarMais(aulasRealizadas.length > 3);
  };

  // Carregar usuários para administradores
  useEffect(() => {
    if (!isAdmin) return;

    setLoadingUsuarios(true);
    
    const q = query(collection(db, 'usuarios'), orderBy('dataCriacao', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setTodosUsuarios(users);
      setLoadingUsuarios(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Simular loading inicial
  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);









  // Formatar data
  const formatarData = (data) => {
    if (!data) return 'Data não definida';
    try {
      return new Date(data).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Formatar dia da semana
  const formatarDiaSemana = (data) => {
    if (!data) return 'Dia não definido';
    try {
      return new Date(data).toLocaleDateString('pt-BR', { weekday: 'long' });
    } catch (error) {
      return 'Dia inválido';
    }
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    return status === 'realizada' ? '#10B981' : '#F59E0B';
  };

  // Obter ícone do status
  const getStatusIcon = (status) => {
    return status === 'realizada' ? 'checkmark-circle' : 'time';
  };


  // Atualizar apelido
  const atualizarApelido = async () => {
    if (!novoApelido.trim() || novoApelido.trim().length < 2) {
      Alert.alert('Erro', 'Apelido deve ter pelo menos 2 caracteres');
      return;
    }

    setEditandoApelido(true);
    try {
      await updateApelido(novoApelido.trim());
      
      setNovoApelido('');
      setShowEditApelido(false);
      Alert.alert('Sucesso', 'Apelido atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar apelido:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o apelido');
    } finally {
      setEditandoApelido(false);
    }
  };

  // Funções administrativas
  const handleApproveUser = async (userId) => {
    try {
      await approveUser(userId);
      Alert.alert('Sucesso', 'Usuário aprovado com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      Alert.alert('Erro', 'Não foi possível aprovar o usuário');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      // Atualizar status para rejeitado no Firestore
      const userRef = doc(db, 'usuarios', userId);
      await updateDoc(userRef, {
        aprovado: false,
        status: 'rejeitado',
        dataRejeicao: new Date()
      });
      
      Alert.alert('Sucesso', 'Usuário rejeitado. Ele não poderá fazer login.');
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      Alert.alert('Erro', 'Não foi possível rejeitar o usuário');
    }
  };

  const handleUpdateUserCoins = async (userId, currentCoins) => {
    setUsuarioEditandoCoins({ id: userId, currentCoins });
    setNovosCoins(currentCoins.toString());
    setShowEditCoins(true);
  };

  const handleSelectPlano = async (userId) => {
    setUsuarioEditandoPlano({ id: userId });
    setShowPlanoModal(true);
  };
  
  const handleEditTipoUsuario = async (userId) => {
    setUsuarioEditandoTipo({ id: userId });
    setShowTipoUsuarioModal(true);
  };

  const aplicarPlano = async (plano) => {
    if (!usuarioEditandoPlano) return;
    
    setEditandoPlano(true);
    try {
      const userRef = doc(db, 'usuarios', usuarioEditandoPlano.id);
      
      // Calcular M2 Coins baseado no plano (1 aula = 1 M2 Coin)
      const m2Coins = plano.aulasPorMes;
      
      await updateDoc(userRef, {
        plano: plano.id,
        planoNome: plano.nome,
        m2Coins: m2Coins,
        dataAtualizacaoPlano: new Date(),
        status: 'ativo'
      });
      
      setShowPlanoModal(false);
      setUsuarioEditandoPlano(null);
      Alert.alert('Sucesso', `Plano "${plano.nome}" aplicado! Usuário recebeu ${m2Coins} M2 Coins.`);
    } catch (error) {
      console.error('Erro ao aplicar plano:', error);
      Alert.alert('Erro', 'Não foi possível aplicar o plano');
    } finally {
      setEditandoPlano(false);
    }
  };
  
  const aplicarTipoUsuario = async (novoTipo) => {
    if (!usuarioEditandoTipo) return;
    
    setEditandoTipo(true);
    try {
      const userRef = doc(db, 'usuarios', usuarioEditandoTipo.id);
      
      // Configurações baseadas no novo tipo
      let configuracao = {
        tipoUsuario: novoTipo,
        ultimaAtualizacao: new Date()
      };
      
      if (novoTipo === 'admin') {
        configuracao = {
          ...configuracao,
          m2Coins: 999,
          plano: 'Admin Ilimitado',
          aprovado: true
        };
      } else if (novoTipo === 'personal') {
        configuracao = {
          ...configuracao,
          m2Coins: 8, // 8 aulas por mês
          plano: 'Personal Training',
          aprovado: true
        };
      } else if (novoTipo === 'aluno') {
        configuracao = {
          ...configuracao,
          m2Coins: 4, // 4 aulas por mês (plano básico)
          plano: 'Plano Básico',
          aprovado: false // Precisa de aprovação
        };
      }
      
      await updateDoc(userRef, configuracao);
      
      setShowTipoUsuarioModal(false);
      setUsuarioEditandoTipo(null);
      Alert.alert('Sucesso', `Usuário alterado para ${novoTipo === 'admin' ? 'ADMINISTRADOR' : novoTipo === 'personal' ? 'PERSONAL TRAINING' : 'ALUNO'}!`);
    } catch (error) {
      console.error('Erro ao alterar tipo de usuário:', error);
      Alert.alert('Erro', 'Não foi possível alterar o tipo de usuário');
    } finally {
      setEditandoTipo(false);
    }
  };

  const salvarNovosCoins = async () => {
    if (!usuarioEditandoCoins) return;
    
    const coins = parseInt(novosCoins);
    if (isNaN(coins) || coins < 0) {
      Alert.alert('Erro', 'Digite um valor válido para os M2 Coins');
      return;
    }

    setEditandoCoins(true);
    try {
      await updateUserM2Coins(usuarioEditandoCoins.id, coins);
      
      setShowEditCoins(false);
      setUsuarioEditandoCoins(null);
      setNovosCoins('');
      Alert.alert('Sucesso', 'M2 Coins atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar M2 Coins:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os M2 Coins');
    } finally {
      setEditandoCoins(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 font-pregular text-lg text-center">
            Usuário não autenticado
          </Text>
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

        <ScrollView style={styles.scrollView}>
          {/* Header com título */}
          <View style={styles.header}>
            <Text style={styles.titleText}>
              Meu Perfil
            </Text>
            <Text style={styles.subtitleText}>
              Gerencie sua conta e funcionalidades administrativas
            </Text>
          </View>

          {/* Header com M2 Coins */}
          <View style={styles.coinHeader}>
            <Image
              source={require('../../assets/images/m2coin.png')}
              style={styles.coinImage}
            />
            <Text style={styles.coinText}>
              {m2Coins}
            </Text>
          </View>

          {/* Estatísticas Rápidas */}
          {!isAdmin && (
            <View className="px-6 py-0 -mt-4 mb-4">
              <View className="flex-row space-x-3">
                <View className="flex-1 bg-white rounded-xl p-4 shadow-lg border-2 border-blue-600">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="calendar" size={20} color="#3B82F6" />
                    <Text className="text-gray-600 font-pregular text-sm ml-2">
                      Aulas Agendadas
                    </Text>
                  </View>
                  <Text className="text-blue-600 font-pextrabold text-2xl">
                    {historicoAulas.filter(aula => aula.status === 'agendada').length}
                  </Text>
                </View>
                
                <View className="flex-1 bg-white rounded-xl p-4 shadow-lg border-2 border-green-600">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="calendar" size={20} color="#10B981" />
                    <Text className="text-gray-600 font-pregular text-sm ml-2">
                      Aulas Realizadas
                    </Text>
                  </View>
                  <Text className="text-green-600 font-pextrabold text-2xl">
                    {historicoAulas.filter(aula => aula.status === 'realizada').length}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Histórico de Aulas */}
          {!isAdmin && (
            <View className="px-6 py-6 bg-white">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={24} color="#1E40AF" />
                  <Text className="text-gray-800 font-pextrabold text-2xl ml-2">
                    Histórico de Aulas
                  </Text>
                </View>
                <View className="bg-blue-100 rounded-full px-3 py-1">
                  <Text className="text-blue-800 font-pbold text-sm">
                    {historicoLimitado.length} de {historicoAulas.filter(aula => aula.status === 'realizada').length}
                  </Text>
                </View>
              </View>

              {historicoLimitado.length === 0 ? (
                <View className="bg-gray-50 rounded-xl p-8 items-center">
                  <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                  <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                    Nenhuma aula agendada ainda
                  </Text>
                  <Text className="text-gray-400 font-pregular text-sm text-center mt-2">
                    Agende sua primeira aula na aba "Agendar"
                  </Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {historicoLimitado.map((aula) => (
                    <View key={aula.id} className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-600">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <Ionicons 
                            name={getStatusIcon(aula.status)} 
                            size={20} 
                            color={getStatusColor(aula.status)} 
                          />
                          <Text className={`ml-2 font-pbold text-sm ${
                            aula.status === 'realizada' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {aula.status === 'realizada' ? 'Realizada' : 'Agendada'}
                          </Text>
                        </View>
                        <Text className="text-gray-500 font-pregular text-sm">
                          {aula.horario}
                        </Text>
                      </View>

                      <View className="space-y-2">
                        <Text className="text-gray-800 font-pbold text-lg">
                          {formatarDiaSemana(aula.data)}
                        </Text>
                        <Text className="text-gray-600 font-pregular text-sm">
                          {formatarData(aula.data)}
                        </Text>
                      </View>
                    </View>
                  ))}

                  
                  {/* Botão Carregar Mais - sempre mostrar se podeCarregarMais for true */}
                  {podeCarregarMais && (
                    <TouchableOpacity
                      onPress={carregarMaisHistorico}
                      style={{
                        backgroundColor: '#3B82F6',
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 2,
                        borderColor: '#60A5FA',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 8,
                        alignItems: 'center'
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="chevron-down" size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, marginLeft: 8 }}>
                          Carregar mais 3 aulas
                        </Text>
                      </View>
                      <Text style={{ color: '#DBEAFE', fontWeight: '400', fontSize: 14, marginTop: 4 }}>
                        Mostrando {historicoLimitado.length} de {historicoAulas.filter(aula => aula.status === 'realizada').length} aulas
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Mensagem de conclusão - mostrar se não pode carregar mais */}
                  {!podeCarregarMais && historicoAulas.filter(aula => aula.status === 'realizada').length > 3 && (
                    <View style={{
                      backgroundColor: '#F0FDF4',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: '#BBF7D0',
                      alignItems: 'center'
                    }}>
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                      <Text style={{ color: '#166534', fontWeight: '700', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                        Todas as {historicoAulas.filter(aula => aula.status === 'realizada').length} aulas foram carregadas
                      </Text>
                    </View>
                  )}

                  {/* Botão "Ver Menos" - sempre mostrar quando há mais de 3 aulas visíveis */}
                  {historicoVisivel > 3 && (
                    <TouchableOpacity
                      onPress={resetarPaginação}
                      style={{
                        backgroundColor: 'transparent',
                        borderRadius: 8,
                        padding: 8,
                        borderWidth: 1,
                        borderColor: '#9CA3AF',
                        alignItems: 'center',
                        marginTop: 8
                      }}
                    >
                      <Text style={{ color: '#6B7280', fontWeight: '500', fontSize: 12 }}>
                        Ver menos aulas
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Painel Administrativo */}
          {isAdmin && (
            <View className="px-6 py-6 bg-gray-50">
              <View className="bg-white rounded-2xl p-6 shadow-sm">
                <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
                  Painel Administrativo
                </Text>
                
                {/* Campo de Busca */}
                <View className="mb-4">
                  <View className="flex-row items-center bg-white border-2 border-blue-300 rounded-xl px-4 py-3 shadow-sm">
                    <Ionicons name="search" size={20} color="#2563eb" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-800 font-pregular text-base"
                      placeholder="Buscar usuários por nome ou email..."
                      placeholderTextColor="#9CA3AF"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        className="ml-2"
                      >
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Contador de resultados */}
                  {searchQuery.length > 0 && (
                    <View className="mt-2">
                      <Text className="text-gray-600 font-pregular text-sm">
                        {todosUsuarios.filter(usuario => {
                          const query = searchQuery.toLowerCase();
                          return (
                            (usuario.apelido && usuario.apelido.toLowerCase().includes(query)) ||
                            (usuario.email && usuario.email.toLowerCase().includes(query)) ||
                            (usuario.tipoUsuario && usuario.tipoUsuario.toLowerCase().includes(query))
                          );
                        }).length} usuário(s) encontrado(s)
                      </Text>
                    </View>
                  )}
                </View>
                
                {loadingUsuarios ? (
                  <Text className="text-gray-600 font-pregular text-center">
                    Carregando usuários...
                  </Text>
                ) : (
                  <View className="space-y-3">
                    {/* Usuários filtrados pela busca */}
                    {(() => {
                      const usuariosFiltrados = todosUsuarios.filter(usuario => {
                        if (!searchQuery.trim()) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                          (usuario.apelido && usuario.apelido.toLowerCase().includes(query)) ||
                          (usuario.email && usuario.email.toLowerCase().includes(query)) ||
                          (usuario.tipoUsuario && usuario.tipoUsuario.toLowerCase().includes(query))
                        );
                      });
                      
                      if (searchQuery.trim() && usuariosFiltrados.length === 0) {
                        return (
                          <View className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                            <Ionicons name="search-outline" size={48} color="#D97706" />
                            <Text className="text-yellow-800 font-pbold text-lg mt-3 mb-2">
                              Nenhum usuário encontrado
                            </Text>
                            <Text className="text-yellow-700 font-pregular text-base">
                              Tente buscar por outro termo ou verifique a ortografia.
                            </Text>
                          </View>
                        );
                      }
                      
                      return usuariosFiltrados.map((usuario) => (
                      <View key={usuario.id} className="bg-white rounded-xl p-4 border-2 border-blue-300 shadow-lg mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                          <Text className="text-gray-800 font-pextrabold text-xl">
                            {usuario.apelido || usuario.email}
                          </Text>
                          <View className={`px-3 py-1 rounded-full border ${
                            usuario.tipoUsuario === 'admin' 
                              ? 'bg-red-100 border-red-300' 
                              : usuario.tipoUsuario === 'personal'
                              ? 'bg-purple-100 border-purple-300'
                              : 'bg-blue-100 border-blue-300'
                          }`}>
                            <Text className={`text-xs font-pextrabold ${
                              usuario.tipoUsuario === 'admin' 
                                ? 'text-red-700' 
                                : usuario.tipoUsuario === 'personal'
                                ? 'text-purple-700'
                                : 'text-blue-700'
                            }`}>
                              {usuario.tipoUsuario}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="flex-row items-center justify-between mb-4">
                          {/* M2 Coins (apenas para alunos) */}
                          {usuario.tipoUsuario === 'aluno' && (
                            <View className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                              <Text className="text-gray-600 text-sm font-pbold">
                                M2 Coins: <Text className="text-blue-600 font-pextrabold">{usuario.m2Coins || 0}</Text>
                              </Text>
                            </View>
                          )}
                          <View className={`px-3 py-1 rounded-full border ${
                            usuario.aprovado ? 'bg-green-100 border-green-300' : 'bg-yellow-100 border-yellow-300'
                          }`}>
                            <Text className={`text-sm font-pextrabold ${
                              usuario.aprovado ? 'text-green-700' : 'text-yellow-700'
                            }`}>
                              {usuario.aprovado ? 'Aprovado' : 'Pendente'}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="space-y-2">
                          {usuario.tipoUsuario !== 'admin' && (
                            <>
                              {!usuario.aprovado ? (
                                <TouchableOpacity
                                  onPress={() => handleApproveUser(usuario.id)}
                                  className="bg-green-500 rounded-lg p-3 border border-green-400 shadow-sm"
                                >
                                  <Text className="text-white font-pextrabold text-sm text-center">
                                    ✅ Aprovar Usuário
                                  </Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => handleRejectUser(usuario.id)}
                                  className="bg-red-500 rounded-lg p-3 border border-red-400 shadow-sm"
                                >
                                  <Text className="text-white font-pextrabold text-sm text-center">
                                    ❌ Rejeitar Usuário
                                  </Text>
                                </TouchableOpacity>
                              )}
                              
                              <View className="h-3" />
                              
                              <TouchableOpacity
                                onPress={() => handleSelectPlano(usuario.id)}
                                className="bg-purple-500 rounded-lg p-3 border border-purple-400 shadow-sm"
                              >
                                <Text className="text-white font-pextrabold text-sm text-center">
                                  🎯 Escolher Plano
                                </Text>
                              </TouchableOpacity>
                            </>
                          )}
                          
                          <TouchableOpacity
                            onPress={() => handleEditTipoUsuario(usuario.id)}
                            className="bg-orange-500 rounded-lg p-3 border border-orange-400 shadow-sm"
                          >
                            <Text className="text-white font-pextrabold text-sm text-center">
                              🔄 Alterar Tipo
                            </Text>
                          </TouchableOpacity>
                          
                          {/* Botão Editar M2 Coins (apenas para alunos) */}
                          {usuario.tipoUsuario === 'aluno' && (
                            <TouchableOpacity
                              onPress={() => handleUpdateUserCoins(usuario.id, usuario.m2Coins || 0)}
                              className="bg-blue-500 rounded-lg p-3 border border-blue-400 shadow-sm"
                            >
                              <Text className="text-white font-pextrabold text-sm text-center">
                                💰 Editar M2 Coins
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ));
                  })()}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Informações do Usuário */}
          <View className="px-6 py-6 bg-blue-50">
            <View className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-600">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="person" size={24} color="#1E40AF" />
                  <Text className="text-gray-800 font-pextrabold text-2xl ml-2">
                    Meu Perfil
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowEditApelido(true)}
                  className="bg-blue-500 rounded-lg px-4 py-2"
                >
                  <Text className="text-white font-pbold text-sm">
                    Editar Apelido
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View className="space-y-3">
                {/* Apelido */}
                <View className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <Text className="text-blue-800 font-pbold text-lg text-center mb-2">
                    Apelido
                  </Text>
                  <Text className="text-blue-600 font-pregular text-base text-center">
                    {userProfile?.apelido || 'Não definido'}
                  </Text>
                </View>

                {/* Tipo de Usuário */}
                <View className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <Text className="text-purple-800 font-pbold text-lg text-center mb-2">
                    Tipo de Usuário
                  </Text>
                  <View className="flex-row justify-center items-center">
                    <View className={`px-3 py-1 rounded-full ${
                      userProfile?.tipoUsuario === 'admin' 
                        ? 'bg-red-100' 
                        : userProfile?.tipoUsuario === 'personal'
                        ? 'bg-purple-100'
                        : 'bg-blue-100'
                    }`}>
                      <Text className={`font-pbold ${
                        userProfile?.tipoUsuario === 'admin' 
                          ? 'text-red-700' 
                          : userProfile?.tipoUsuario === 'personal'
                          ? 'text-purple-700'
                          : 'text-blue-700'
                      }`}>
                        {userProfile?.tipoUsuario === 'admin' ? 'ADMINISTRADOR' :
                         userProfile?.tipoUsuario === 'personal' ? 'PERSONAL TRAINING' :
                         'ALUNO'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Status de Aprovação */}
                {userProfile?.tipoUsuario !== 'admin' && (
                  <View className={`rounded-xl p-4 border ${
                    userProfile?.aprovado 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <Text className={`font-pbold text-lg text-center mb-2 ${
                      userProfile?.aprovado 
                        ? 'text-green-800' 
                        : 'text-yellow-800'
                    }`}>
                      Status
                    </Text>
                    <View className="flex-row justify-center items-center">
                      <View className={`px-3 py-1 rounded-full ${
                        userProfile?.aprovado 
                          ? 'bg-green-100' 
                          : 'bg-yellow-100'
                      }`}>
                        <Text className={`font-pbold ${
                          userProfile?.aprovado 
                            ? 'text-green-700' 
                            : 'text-yellow-700'
                        }`}>
                          {userProfile?.aprovado ? 'APROVADO' : 'AGUARDANDO APROVAÇÃO'}
                        </Text>
                      </View>
                    </View>
                    {!userProfile?.aprovado && (
                      <Text className="text-yellow-600 font-pregular text-sm text-center mt-2">
                        Seu cadastro será analisado por um administrador
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Seção de Planos Disponíveis */}
          {!isAdmin && (
            <View className="px-6 py-6 bg-white">
              <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
                Planos Disponíveis
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row space-x-4">
                  {userProfile?.tipoUsuario === 'personal' ? (
                    <View className="bg-purple-50 rounded-xl p-4 border border-purple-200 min-w-[280]">
                      <Text className="text-purple-800 font-pbold text-lg mb-2">
                        {PLANO_PERSONAL_TRAINING.nome}
                      </Text>
                      <Text className="text-purple-700 font-pregular text-sm mb-3">
                        {PLANO_PERSONAL_TRAINING.descricao}
                      </Text>
                      <View className="space-y-1">
                        <Text className="text-purple-800 font-pbold text-lg">
                          R$ {PLANO_PERSONAL_TRAINING.valores.mensal.valor}
                        </Text>
                        <Text className="text-purple-600 font-pregular text-xs">
                          {PLANO_PERSONAL_TRAINING.valores.mensal.forma}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    PLANOS_DISPONIVEIS.map((plano, index) => (
                      <View key={plano.id} className="bg-blue-50 rounded-xl p-4 border border-blue-200 min-w-[280]">
                        <Text className="text-blue-800 font-pbold text-lg mb-2">
                          {plano.nome}
                        </Text>
                        <Text className="text-blue-700 font-pregular text-sm mb-3">
                          {plano.descricao}
                        </Text>
                        <View className="space-y-1">
                          <Text className="text-blue-800 font-pbold text-lg">
                            R$ {plano.valores.mensal.valor}
                          </Text>
                          <Text className="text-blue-600 font-pregular text-xs">
                            {plano.valores.mensal.forma}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
              
              <View className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <Text className="text-yellow-800 font-pregular text-sm text-center">
                  💡 Entre em contato para mais informações sobre os planos
                </Text>
              </View>
            </View>
          )}

          {/* Informações da Empresa */}
          <View className="px-6 py-6 bg-gray-50">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
                M2 Academia de Futebol
              </Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="business" size={20} color="#3B82F6" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    CNPJ: {INFO_EMPRESA.cnpj}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="call" size={20} color="#10B981" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.telefone}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.whatsapp}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={20} color="#EF4444" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.email}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="logo-instagram" size={20} color="#EC4899" />
                  <Text className="text-gray-700 font-pregular text-base ml-3">
                    {INFO_EMPRESA.instagram}
                  </Text>
                </View>
              </View>
              
              <View className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
                <Text className="text-blue-800 font-pregular text-sm text-center">
                  💳 PIX: {INFO_EMPRESA.pix}
                </Text>
              </View>
            </View>
          </View>

          {/* Botão de Logout */}
          <View className="px-6 py-6 bg-gray-50">
            <TouchableOpacity
              onPress={signOut}
              className="bg-red-500 rounded-xl p-4 items-center"
            >
              <Text className="text-white font-pbold text-lg">
                Sair da Conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal para Editar Apelido */}
          {showEditApelido && (
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="absolute inset-0 bg-black/50 justify-center items-center px-6"
            >
              <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <Text className="text-gray-800 font-pextrabold text-2xl text-center mb-4">
                  Editar Apelido
                </Text>
                
                <Text className="text-gray-600 font-pregular text-base text-center mb-4">
                  Escolha um apelido que será exibido em todo o app
                </Text>
                
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 mb-4 text-center text-lg font-pbold"
                  placeholder="Digite seu apelido"
                  value={novoApelido}
                  onChangeText={setNovoApelido}
                  autoCapitalize="words"
                  maxLength={20}
                  autoFocus
                />
                
                <View className="flex-row space-x-3">
                  <TouchableOpacity 
                    onPress={() => {
                      setShowEditApelido(false);
                      setNovoApelido('');
                    }}
                    className="flex-1 bg-gray-300 rounded-lg p-3 items-center"
                  >
                    <Text className="text-white font-pbold text-base">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={atualizarApelido}
                    disabled={editandoApelido}
                    className="flex-1 bg-blue-500 rounded-lg p-3 items-center"
                  >
                    <Text className="text-white font-pbold text-base">
                      {editandoApelido ? 'Salvando...' : 'Salvar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          )}

          {/* Modal para editar M2 Coins */}
          {showEditCoins && (
            <Modal
              visible={showEditCoins}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowEditCoins(false)}
            >
              <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-2xl p-6 w-full max-w-sm items-center">
                  <Text className="text-gray-800 font-pextrabold text-2xl text-center mb-4">
                    Editar M2 Coins
                  </Text>
                  
                  <Text className="text-gray-600 font-pregular text-base text-center mb-4">
                    Digite a nova quantidade de M2 Coins para o usuário
                  </Text>
                  
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3 mb-4 text-center text-lg font-pbold w-full"
                    placeholder="Quantidade de coins"
                    value={novosCoins}
                    onChangeText={setNovosCoins}
                    keyboardType="numeric"
                    maxLength={10}
                    autoFocus
                  />
                  
                  <View className="flex-row space-x-3 w-full">
                    <TouchableOpacity 
                      onPress={() => {
                        setShowEditCoins(false);
                        setUsuarioEditandoCoins(null);
                        setNovosCoins('');
                      }}
                      className="flex-1 bg-gray-500 rounded-lg p-3 items-center"
                    >
                      <Text className="text-white font-pbold text-base">
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={salvarNovosCoins}
                      disabled={editandoCoins}
                      className="flex-1 bg-blue-500 rounded-lg p-3 items-center"
                    >
                      <Text className="text-white font-pbold text-base">
                        {editandoCoins ? 'Salvando...' : 'Salvar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}

          {/* Modal para seleção de planos */}
          {showPlanoModal && (
            <Modal
              visible={showPlanoModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowPlanoModal(false)}
            >
              <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80%]">
                  <Text className="text-gray-800 font-pextrabold text-2xl text-center mb-4">
                    Escolher Plano
                  </Text>
                  
                  <Text className="text-gray-600 font-pregular text-base text-center mb-6">
                    Selecione um plano para o usuário. Os M2 Coins serão calculados automaticamente.
                  </Text>
                  
                  <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
                    <View className="space-y-3">
                      {/* Planos regulares */}
                      {PLANOS_DISPONIVEIS.map((plano) => (
                        <TouchableOpacity
                          key={plano.id}
                          onPress={() => aplicarPlano(plano)}
                          disabled={editandoPlano}
                          className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-blue-800 font-pbold text-lg">
                              {plano.nome}
                            </Text>
                            <View className="bg-blue-100 rounded-full px-3 py-1">
                              <Text className="text-blue-700 font-pbold text-sm">
                                {plano.aulasPorMes} aulas
                              </Text>
                            </View>
                          </View>
                          
                          <Text className="text-blue-700 font-pregular text-sm mb-2">
                            {plano.descricao}
                          </Text>
                          
                          <View className="flex-row items-center justify-between">
                            <Text className="text-blue-800 font-pbold text-lg">
                              R$ {plano.valores.mensal.valor}
                            </Text>
                            <Text className="text-blue-600 font-pbold text-sm">
                              {plano.aulasPorMes} M2 Coins
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                      
                      {/* Plano Personal Training */}
                      <TouchableOpacity
                        onPress={() => aplicarPlano(PLANO_PERSONAL_TRAINING)}
                        disabled={editandoPlano}
                        className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-purple-800 font-pbold text-lg">
                            {PLANO_PERSONAL_TRAINING.nome}
                          </Text>
                          <View className="bg-purple-100 rounded-full px-3 py-1">
                            <Text className="text-purple-700 font-pbold text-sm">
                              {PLANO_PERSONAL_TRAINING.aulasPorMes} aulas
                            </Text>
                          </View>
                        </View>
                        
                        <Text className="text-purple-700 font-pregular text-sm mb-2">
                          {PLANO_PERSONAL_TRAINING.descricao}
                        </Text>
                        
                        <View className="flex-row items-center justify-between">
                          <Text className="text-purple-800 font-pbold text-lg">
                            R$ {PLANO_PERSONAL_TRAINING.valores.mensal.valor}
                          </Text>
                          <Text className="text-purple-600 font-pbold text-sm">
                            {PLANO_PERSONAL_TRAINING.aulasPorMes} M2 Coins
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      setShowPlanoModal(false);
                      setUsuarioEditandoPlano(null);
                    }}
                    className="bg-gray-500 rounded-lg p-3 mt-4 items-center"
                  >
                    <Text className="text-white font-pbold text-base">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          {/* Modal para edição de tipo de usuário */}
          {showTipoUsuarioModal && (
            <Modal
              visible={showTipoUsuarioModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowTipoUsuarioModal(false)}
            >
              <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <Text className="text-gray-800 font-pextrabold text-2xl text-center mb-4">
                    Alterar Tipo de Usuário
                  </Text>
                  
                  <Text className="text-gray-600 font-pregular text-base text-center mb-6">
                    Selecione o novo tipo de usuário. As configurações serão ajustadas automaticamente.
                  </Text>
                  
                  <View className="space-y-3">
                    {/* Tipo Admin */}
                    <TouchableOpacity
                      onPress={() => aplicarTipoUsuario('admin')}
                      disabled={editandoTipo}
                      className="bg-red-50 rounded-xl p-4 border-2 border-red-200"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-red-800 font-pbold text-lg">
                          👑 ADMINISTRADOR
                        </Text>
                        <View className="bg-red-100 rounded-full px-3 py-1">
                          <Text className="text-red-700 font-pbold text-sm">
                            Sistema
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-red-700 font-pregular text-sm mb-2">
                        Controle completo do sistema, acesso total, aprovado automaticamente
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Tipo Personal Training */}
                    <TouchableOpacity
                      onPress={() => aplicarTipoUsuario('personal')}
                      disabled={editandoTipo}
                      className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-purple-800 font-pbold text-lg">
                          🏃‍♂️ PERSONAL TRAINING
                        </Text>
                        <View className="bg-purple-100 rounded-full px-3 py-1">
                          <Text className="text-purple-700 font-pbold text-sm">
                            8 Aulas
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-purple-700 font-pregular text-sm mb-2">
                        Horários flexíveis, 8 aulas por mês, ministra aulas, aprovado automaticamente
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Tipo Aluno */}
                    <TouchableOpacity
                      onPress={() => aplicarTipoUsuario('aluno')}
                      disabled={editandoTipo}
                      className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-blue-800 font-pbold text-lg">
                          👥 ALUNO
                        </Text>
                        <View className="bg-blue-100 rounded-full px-3 py-1">
                          <Text className="text-blue-700 font-pbold text-sm">
                            4 Aulas
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-blue-700 font-pregular text-sm mb-2">
                        Horários fixos, 4 aulas por mês, consome M2 Coins, precisa de aprovação
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      setShowTipoUsuarioModal(false);
                      setUsuarioEditandoTipo(null);
                    }}
                    className="bg-gray-500 rounded-lg p-3 mt-6 items-center"
                  >
                    <Text className="text-white font-pbold text-base">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  titleText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitleText: {
    color: '#dbeafe',
    fontWeight: '400',
    textAlign: 'center',
    fontSize: 16,
  },
  coinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    paddingVertical: 10,
    marginTop: -10,
    marginBottom: 10,
  },
  coinImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  coinText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
});
