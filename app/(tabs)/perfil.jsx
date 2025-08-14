import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BackgroundLogo from '../../components/BackgroundLogo';
import LoadingScreen from '../../components/LoadingScreen';
import M2Coin from '../../components/M2Coin';
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

  // Usar M2 Coins do perfil do usuário
  const m2Coins = userProfile?.m2Coins || 0;
  const planoAtivo = userProfile?.plano || 'Plano não definido';
  const isAdmin = userProfile?.tipoUsuario === 'admin';
  
  // Carregar histórico de aulas do Firestore
  useEffect(() => {
    if (!user) {
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
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar histórico:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

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
      await rejectUser(userId);
      Alert.alert('Sucesso', 'Usuário rejeitado com sucesso!');
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
      <BackgroundLogo>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 font-pregular text-lg text-center">
            Usuário não autenticado
          </Text>
        </View>
      </BackgroundLogo>
    );
  }

  return (
    <BackgroundLogo>
      <ScrollView className="flex-1">
        {/* Header do perfil */}
        <View className="bg-blue-600 px-6 py-16">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-white font-pextrabold text-3xl mb-2">
                Meu Perfil
              </Text>
              <Text className="text-blue-100 font-pregular text-lg">
                {userProfile?.apelido || user?.email}
              </Text>
            </View>
            <View className="bg-white/20 rounded-full p-3">
              <Ionicons name="person" size={32} color="white" />
            </View>
          </View>

          {/* M2 Coins Card */}
          <View className="bg-transparent rounded-2xl p-6">
            <View className="flex-row items-center justify-center">
              <View className="-ml-10">
                <M2Coin size={80} coins={m2Coins} showCount={true} />
              </View>
            </View>
          </View>
        </View>

        {/* Estatísticas Rápidas */}
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

        {/* Histórico de Aulas */}
        <View className="px-6 py-6 bg-white">
          <View className="flex-row items-center mb-6">
            <Ionicons name="time" size={24} color="#1E40AF" />
            <Text className="text-gray-800 font-pextrabold text-2xl ml-2">
              Histórico de Aulas
            </Text>
          </View>

          {historicoAulas.length === 0 ? (
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
              {historicoAulas.map((aula) => (
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
            </View>
          )}
        </View>

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

        {/* Painel Administrativo */}
        {isAdmin && (
          <View className="px-6 py-6 bg-gray-50">
            <View className="bg-white rounded-2xl p-6 shadow-sm">
              <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
                Painel Administrativo
              </Text>
              
              {loadingUsuarios ? (
                <Text className="text-gray-600 font-pregular text-center">
                  Carregando usuários...
                </Text>
              ) : (
                <View className="space-y-3">
                  {todosUsuarios.map((usuario) => (
                    <View key={usuario.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-800 font-pbold">
                          {usuario.apelido || usuario.email}
                        </Text>
                        <View className={`px-2 py-1 rounded-full ${
                          usuario.tipoUsuario === 'admin' 
                            ? 'bg-red-100' 
                            : usuario.tipoUsuario === 'personal'
                            ? 'bg-purple-100'
                            : 'bg-blue-100'
                        }`}>
                          <Text className={`text-xs font-pbold ${
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
                      
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-600 text-sm">
                          M2 Coins: {usuario.m2Coins || 0}
                        </Text>
                        <Text className={`text-sm font-pbold ${
                          usuario.aprovado ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {usuario.aprovado ? 'Aprovado' : 'Pendente'}
                        </Text>
                      </View>
                      
                      <View className="flex-row space-x-2">
                        {usuario.tipoUsuario !== 'admin' && !usuario.aprovado && (
                          <TouchableOpacity
                            onPress={() => handleApproveUser(usuario.id)}
                            className="flex-1 bg-green-500 rounded-lg p-2"
                          >
                            <Text className="text-white font-pbold text-center text-sm">
                              Aprovar
                            </Text>
                          </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity
                          onPress={() => handleUpdateUserCoins(usuario.id, usuario.m2Coins || 0)}
                          className="flex-1 bg-blue-500 rounded-lg p-2"
                        >
                          <Text className="text-white font-pbold text-center text-sm">
                            Editar Coins
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

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
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="absolute inset-0 bg-black/50 justify-center items-center px-6"
          >
            <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <Text className="text-gray-800 font-pextrabold text-2xl text-center mb-4">
                Editar M2 Coins
              </Text>
              
              <Text className="text-gray-600 font-pregular text-base text-center mb-4">
                Digite a nova quantidade de M2 Coins para o usuário
              </Text>
              
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-4 text-center text-lg font-pbold"
                placeholder="Quantidade de coins"
                value={novosCoins}
                onChangeText={setNovosCoins}
                keyboardType="numeric"
                maxLength={10}
                autoFocus
              />
              
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  onPress={() => {
                    setShowEditCoins(false);
                    setUsuarioEditandoCoins(null);
                    setNovosCoins('');
                  }}
                  className="flex-1 bg-gray-300 rounded-lg p-3 items-center"
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
          </KeyboardAvoidingView>
        )}
      </ScrollView>
    </BackgroundLogo>
  );
}
