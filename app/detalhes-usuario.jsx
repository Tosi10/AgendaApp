import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LoadingScreen from '../components/LoadingScreen';
import { PLANOS_DISPONIVEIS, PLANO_PERSONAL_TRAINING } from '../constants/Planos';
import { useGlobal } from '../context/GlobalProvider';
import { db } from '../lib/firebase';

export default function DetalhesUsuario() {
  const { userId } = useLocalSearchParams();
  const { userProfile, updateUserM2Coins, approveUser, rejectUser, deleteUser } = useGlobal();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historicoAulas, setHistoricoAulas] = useState([]);
  const [historicoPlanos, setHistoricoPlanos] = useState([]);
  const [aulasLimit, setAulasLimit] = useState(3); // Limite inicial de aulas visíveis
  
  // Estados para modais
  const [showEditCoins, setShowEditCoins] = useState(false);
  const [editandoCoins, setEditandoCoins] = useState(false);
  const [novosCoins, setNovosCoins] = useState('');
  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [editandoPlano, setEditandoPlano] = useState(false);
  const [showTipoUsuarioModal, setShowTipoUsuarioModal] = useState(false);
  const [editandoTipo, setEditandoTipo] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'usuarios', userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUsuario({ id: doc.id, ...doc.data() });
        setLoading(false);
      } else {
        Alert.alert('Erro', 'Usuário não encontrado');
        router.back();
      }
    }, (error) => {
      console.error('Erro ao carregar usuário:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Carregar histórico de aulas
  useEffect(() => {
    if (!usuario?.email) return;

    const unsubscribe = onSnapshot(
      collection(db, 'agendamentos'),
      (snapshot) => {
        const aulas = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.key && data.alunos && data.alunos.includes(usuario.email)) {
            const [dataStr, horario] = data.key.split('_');
            try {
              const dataAula = new Date(dataStr);
              const [hora, minuto] = horario.split(':');
              dataAula.setHours(parseInt(hora), parseInt(minuto), 0, 0);
              
              const agora = new Date();
              const status = dataAula > agora ? 'agendada' : 'realizada';
              
              aulas.push({
                id: doc.id,
                data: dataAula,
                horario: horario,
                status: status,
                key: data.key
              });
            } catch (error) {
              console.error('Erro ao processar aula:', error);
            }
          }
        });
        
        setHistoricoAulas(aulas.sort((a, b) => b.data - a.data));
      },
      (error) => {
        console.error('Erro ao carregar histórico de aulas:', error);
      }
    );

    return () => unsubscribe();
  }, [usuario?.email]);

  // Carregar histórico de planos (do próprio documento do usuário)
  useEffect(() => {
    if (!usuario) return;
    
    // Histórico de planos pode vir de um subcollection ou do próprio documento
    // Por enquanto, vamos usar os dados do documento
    const historico = [];
    if (usuario.plano) {
      historico.push({
        plano: usuario.planoNome || usuario.plano,
        dataAtualizacao: usuario.dataAtualizacaoPlano || usuario.ultimaAtualizacao || usuario.dataCriacao,
        m2Coins: usuario.m2Coins || 0
      });
    }
    setHistoricoPlanos(historico);
  }, [usuario]);

  // Funções administrativas
  const handleApproveUser = async () => {
    try {
      await approveUser(userId);
      Alert.alert('Sucesso', 'Usuário aprovado com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      Alert.alert('Erro', 'Não foi possível aprovar o usuário');
    }
  };

  const handleRejectUser = async () => {
    try {
      const userRef = doc(db, 'usuarios', userId);
      await updateDoc(userRef, {
        aprovado: false,
        status: 'bloqueado',
        dataBloqueio: new Date()
      });
      Alert.alert('Sucesso', 'Usuário bloqueado. Ele não poderá fazer login.');
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      Alert.alert('Erro', 'Não foi possível bloquear o usuário');
    }
  };

  const handleUpdateUserCoins = () => {
    setNovosCoins((usuario?.m2Coins || 0).toString());
    setShowEditCoins(true);
  };

  const salvarNovosCoins = async () => {
    const coins = parseInt(novosCoins);
    if (isNaN(coins) || coins < 0) {
      Alert.alert('Erro', 'Digite um valor válido para os M2 Coins');
      return;
    }

    setEditandoCoins(true);
    try {
      await updateUserM2Coins(userId, coins);
      setShowEditCoins(false);
      setNovosCoins('');
      Alert.alert('Sucesso', 'M2 Coins atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar M2 Coins:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os M2 Coins');
    } finally {
      setEditandoCoins(false);
    }
  };

  const handleSelectPlano = () => {
    setShowPlanoModal(true);
  };

  const aplicarPlano = async (plano) => {
    if (!userId) return;
    
    setEditandoPlano(true);
    try {
      const userRef = doc(db, 'usuarios', userId);
      const m2Coins = plano.aulasPorMes;
      const tipoUsuario = plano.id === 'personal-training' ? 'personal' : 'aluno';
      
      await updateDoc(userRef, {
        plano: plano.id,
        planoNome: plano.nome,
        m2Coins: m2Coins,
        tipoUsuario: tipoUsuario,
        dataAtualizacaoPlano: new Date(),
        status: 'ativo'
      });
      
      setShowPlanoModal(false);
      Alert.alert('Sucesso', `Plano "${plano.nome}" aplicado! Usuário recebeu ${m2Coins} M2 Coins.`);
    } catch (error) {
      console.error('Erro ao aplicar plano:', error);
      Alert.alert('Erro', 'Não foi possível aplicar o plano');
    } finally {
      setEditandoPlano(false);
    }
  };

  const handleEditTipoUsuario = () => {
    setShowTipoUsuarioModal(true);
  };

  const aplicarTipoUsuario = async (novoTipo) => {
    if (!userId) return;
    
    setEditandoTipo(true);
    try {
      const userRef = doc(db, 'usuarios', userId);
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
          m2Coins: 8,
          plano: 'Personal Training',
          aprovado: true
        };
      } else if (novoTipo === 'aluno') {
        configuracao = {
          ...configuracao,
          m2Coins: 4,
          plano: 'Plano Básico',
          aprovado: false
        };
      }
      
      await updateDoc(userRef, configuracao);
      setShowTipoUsuarioModal(false);
      Alert.alert('Sucesso', `Usuário alterado para ${novoTipo === 'admin' ? 'ADMINISTRADOR' : novoTipo === 'personal' ? 'PERSONAL TRAINING' : 'ALUNO'}!`);
    } catch (error) {
      console.error('Erro ao alterar tipo de usuário:', error);
      Alert.alert('Erro', 'Não foi possível alterar o tipo de usuário');
    } finally {
      setEditandoTipo(false);
    }
  };

  const handleDeleteUser = async () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar este usuário permanentemente? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              Alert.alert('Sucesso', 'Usuário deletado permanentemente.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Erro ao deletar usuário:', error);
              Alert.alert('Erro', 'Não foi possível deletar o usuário');
            }
          }
        }
      ]
    );
  };

  const formatarData = (data) => {
    if (!data) return 'Data não definida';
    try {
      const date = data.toDate ? data.toDate() : new Date(data);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Funções para paginação
  const carregarMaisAulas = () => {
    setAulasLimit(prev => prev + 3);
  };

  const fecharAulas = () => {
    setAulasLimit(3);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!usuario) {
    return (
      <View style={styles.container}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 font-pregular text-lg text-center">
            Usuário não encontrado
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
          source={require('../assets/images/M2_9.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </View>

      {/* Conteúdo principal */}
      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView}>
          {/* Header com botão voltar */}
          <View className="bg-blue-600 px-6 pt-16 pb-12 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-pextrabold text-xl flex-1">
              Detalhes do Usuário
            </Text>
          </View>

          {/* Barra degradê */}
          <LinearGradient
            colors={['#FCD34D', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />

          {/* Informações do Usuário */}
          <View className="px-6 py-6 bg-white">
            <View className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-300">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-800 font-pextrabold text-2xl">
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

              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 font-pregular text-sm">
                    Email:
                  </Text>
                  <Text className="text-gray-800 font-pbold text-sm">
                    {usuario.email}
                  </Text>
                </View>

                {(usuario.tipoUsuario === 'aluno' || usuario.tipoUsuario === 'personal') && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 font-pregular text-sm">
                      M2 Coins:
                    </Text>
                    <Text className="text-blue-600 font-pextrabold text-lg">
                      {usuario.m2Coins || 0}
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 font-pregular text-sm">
                    Status:
                  </Text>
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

                {usuario.plano && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 font-pregular text-sm">
                      Plano:
                    </Text>
                    <Text className="text-gray-800 font-pbold text-sm">
                      {usuario.planoNome || usuario.plano}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Ações Administrativas */}
          <View className="px-6 py-6 bg-gray-50">
            <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
              Ações Administrativas
            </Text>
            
            <View>
              {usuario.tipoUsuario !== 'admin' && (
                <>
                  {!usuario.aprovado ? (
                    <TouchableOpacity
                      onPress={handleApproveUser}
                      className="bg-green-500 rounded-lg p-4 border border-green-400 shadow-sm mb-3"
                    >
                      <Text className="text-white font-pextrabold text-base text-center">
                        ✅ Aprovar Usuário
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleRejectUser}
                      className="bg-red-500 rounded-lg p-4 border border-red-400 shadow-sm mb-3"
                    >
                      <Text className="text-white font-pextrabold text-base text-center">
                        🚫 Bloquear Usuário
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    onPress={handleSelectPlano}
                    className="bg-purple-500 rounded-lg p-4 border border-purple-400 shadow-sm mb-3"
                  >
                    <Text className="text-white font-pextrabold text-base text-center">
                      🎯 Escolher Plano
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleEditTipoUsuario}
                    className="bg-orange-500 rounded-lg p-4 border border-orange-400 shadow-sm mb-3"
                  >
                    <Text className="text-white font-pextrabold text-base text-center">
                      🔄 Alterar Tipo
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              
              {(usuario.tipoUsuario === 'aluno' || usuario.tipoUsuario === 'personal') && (
                <TouchableOpacity
                  onPress={handleUpdateUserCoins}
                  className="bg-blue-500 rounded-lg p-4 border border-blue-400 shadow-sm mb-3"
                >
                  <Text className="text-white font-pextrabold text-base text-center">
                    💰 Editar M2 Coins
                  </Text>
                </TouchableOpacity>
              )}
              
              {usuario.tipoUsuario !== 'admin' && (
                <TouchableOpacity
                  onPress={handleDeleteUser}
                  className="bg-red-600 rounded-lg p-4 border border-red-500 shadow-sm"
                >
                  <Text className="text-white font-pextrabold text-base text-center">
                    🗑️ Deletar Usuário
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Histórico de Planos */}
          <View className="px-6 py-6 bg-white">
            <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
              Histórico de Planos
            </Text>
            
            {historicoPlanos.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-8 items-center">
                <Ionicons name="document-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                  Nenhum plano registrado
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {historicoPlanos.map((item, index) => (
                  <View key={index} className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-blue-800 font-pbold text-lg">
                        {item.plano}
                      </Text>
                      <Text className="text-blue-600 font-pregular text-sm">
                        {formatarData(item.dataAtualizacao)}
                      </Text>
                    </View>
                    <Text className="text-blue-700 font-pregular text-sm">
                      M2 Coins: {item.m2Coins}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Histórico de Aulas */}
          <View className="px-6 py-6 bg-gray-50">
            <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
              Histórico de Aulas
            </Text>
            
            {historicoAulas.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-8 items-center">
                <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                  Nenhuma aula registrada
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {historicoAulas.slice(0, aulasLimit).map((aula) => (
                  <View key={aula.id} className={`rounded-xl p-4 border-2 ${
                    aula.status === 'realizada' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={aula.status === 'realizada' ? 'checkmark-circle' : 'time'} 
                          size={20} 
                          color={aula.status === 'realizada' ? '#10B981' : '#3B82F6'} 
                        />
                        <Text className={`font-pbold text-base ml-2 ${
                          aula.status === 'realizada' ? 'text-green-800' : 'text-blue-800'
                        }`}>
                          {aula.status === 'realizada' ? 'Realizada' : 'Agendada'}
                        </Text>
                      </View>
                      <Text className="text-gray-600 font-pregular text-sm">
                        {aula.horario}
                      </Text>
                    </View>
                    <Text className="text-gray-800 font-pbold text-sm">
                      {formatarData(aula.data)}
                    </Text>
                  </View>
                ))}

                {/* Controles de paginação */}
                {historicoAulas.length > 3 && (
                  <View className="flex-row space-x-3 mt-4">
                    {aulasLimit < historicoAulas.length && (
                      <TouchableOpacity
                        onPress={carregarMaisAulas}
                        className="flex-1 bg-green-500 rounded-lg py-3 px-4"
                        activeOpacity={0.8}
                      >
                        <Text className="text-white font-pbold text-center">
                          Carregar Mais ({historicoAulas.length - aulasLimit} restantes)
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {aulasLimit > 3 && (
                      <TouchableOpacity
                        onPress={fecharAulas}
                        className="bg-gray-500 rounded-lg py-3 px-4"
                        activeOpacity={0.8}
                      >
                        <Text className="text-white font-pbold text-center">
                          Fechar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

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
                  onPress={() => setShowEditCoins(false)}
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
              
              <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
                <View className="space-y-3">
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
                      <Text className="text-blue-800 font-pbold text-lg">
                        R$ {plano.valores.mensal.valor}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
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
                    <Text className="text-purple-800 font-pbold text-lg">
                      R$ {PLANO_PERSONAL_TRAINING.valores.mensal.valor}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              <TouchableOpacity 
                onPress={() => setShowPlanoModal(false)}
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
              
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={() => aplicarTipoUsuario('admin')}
                  disabled={editandoTipo}
                  className="bg-red-50 rounded-xl p-4 border-2 border-red-200"
                >
                  <Text className="text-red-800 font-pbold text-lg">
                    👑 ADMINISTRADOR
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => aplicarTipoUsuario('personal')}
                  disabled={editandoTipo}
                  className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200"
                >
                  <Text className="text-purple-800 font-pbold text-lg">
                    🏃‍♂️ PERSONAL TRAINING
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => aplicarTipoUsuario('aluno')}
                  disabled={editandoTipo}
                  className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
                >
                  <Text className="text-blue-800 font-pbold text-lg">
                    👥 ALUNO
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                onPress={() => setShowTipoUsuarioModal(false)}
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
  gradientBar: {
    height: 8,
    width: '100%',
  },
});

