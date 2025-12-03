import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../lib/firebase';
import LoadingScreen from '../components/LoadingScreen';
import { useGlobal } from '../context/GlobalProvider';

export default function GerenciarPlanos() {
  const { userProfile } = useGlobal();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlano, setEditingPlano] = useState(null);
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [frequencia, setFrequencia] = useState('');
  const [aulas, setAulas] = useState('');
  const [reposicao, setReposicao] = useState('❌ Sem direito a reposição');
  const [cor, setCor] = useState('#3B82F6');
  const [corGradiente, setCorGradiente] = useState('from-blue-500 to-blue-600');
  const [destaque, setDestaque] = useState(false);
  const [ordem, setOrdem] = useState(0);
  
  // Valores do plano
  const [valorMensal, setValorMensal] = useState('');
  const [formaMensal, setFormaMensal] = useState('Dinheiro ou PIX');
  const [valorTrimestral, setValorTrimestral] = useState('');
  const [formaTrimestral, setFormaTrimestral] = useState('3x no cartão');
  const [valorAvista, setValorAvista] = useState('');
  const [formaAvista, setFormaAvista] = useState('À vista');
  const [temMensal, setTemMensal] = useState(true);
  const [temTrimestral, setTemTrimestral] = useState(false);
  const [temAvista, setTemAvista] = useState(false);

  const isAdmin = userProfile?.tipoUsuario === 'admin';

  // Cores predefinidas
  const coresDisponiveis = [
    { cor: '#3B82F6', gradiente: 'from-blue-500 to-blue-600', nome: 'Azul' },
    { cor: '#10B981', gradiente: 'from-green-500 to-emerald-600', nome: 'Verde' },
    { cor: '#F59E0B', gradiente: 'from-yellow-500 to-orange-500', nome: 'Amarelo/Laranja' },
    { cor: '#EF4444', gradiente: 'from-red-500 to-pink-500', nome: 'Vermelho/Rosa' },
    { cor: '#8B5CF6', gradiente: 'from-purple-500 to-violet-600', nome: 'Roxo' },
    { cor: '#EC4899', gradiente: 'from-pink-500 to-rose-600', nome: 'Rosa' },
  ];

  // Carregar planos
  useEffect(() => {
    if (!isAdmin) {
      router.back();
      return;
    }

    const q = query(collection(db, 'planos'), orderBy('ordem', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const planosData = [];
      snapshot.forEach((doc) => {
        planosData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setPlanos(planosData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar planos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Abrir modal para criar/editar
  const abrirModal = (plano = null) => {
    if (plano) {
      // Editar
      setEditingPlano(plano);
      setNome(plano.nome || '');
      setFrequencia(plano.frequencia || '');
      setAulas(plano.aulas || '');
      setReposicao(plano.reposicao || '❌ Sem direito a reposição');
      setCor(plano.cor || '#3B82F6');
      setCorGradiente(plano.corGradiente || 'from-blue-500 to-blue-600');
      setDestaque(plano.destaque || false);
      setOrdem(plano.ordem || 0);
      
      // Processar valores
      const valores = plano.valores || [];
      setTemMensal(valores.some(v => v.tipo === 'Mensal'));
      setTemTrimestral(valores.some(v => v.tipo === 'Trimestral'));
      setTemAvista(valores.some(v => v.tipo === 'À vista'));
      
      const mensal = valores.find(v => v.tipo === 'Mensal');
      if (mensal) {
        setValorMensal(mensal.valor || '');
        setFormaMensal(mensal.forma || 'Dinheiro ou PIX');
      }
      
      const trimestral = valores.find(v => v.tipo === 'Trimestral');
      if (trimestral) {
        setValorTrimestral(trimestral.valor || '');
        setFormaTrimestral(trimestral.forma || '3x no cartão');
      }
      
      const avista = valores.find(v => v.tipo === 'À vista');
      if (avista) {
        setValorAvista(avista.valor || '');
        setFormaAvista(avista.forma || 'À vista');
      }
    } else {
      // Criar novo
      setEditingPlano(null);
      setNome('');
      setFrequencia('');
      setAulas('');
      setReposicao('❌ Sem direito a reposição');
      setCor('#3B82F6');
      setCorGradiente('from-blue-500 to-blue-600');
      setDestaque(false);
      setOrdem(planos.length);
      setValorMensal('');
      setFormaMensal('Dinheiro ou PIX');
      setValorTrimestral('');
      setFormaTrimestral('3x no cartão');
      setValorAvista('');
      setFormaAvista('À vista');
      setTemMensal(true);
      setTemTrimestral(false);
      setTemAvista(false);
    }
    setShowModal(true);
  };

  // Salvar plano
  const salvarPlano = async () => {
    if (!nome.trim() || !frequencia.trim() || !aulas.trim()) {
      Alert.alert('Erro', 'Preencha nome, frequência e aulas');
      return;
    }

    if (!temMensal && !temTrimestral && !temAvista) {
      Alert.alert('Erro', 'Adicione pelo menos um valor');
      return;
    }

    const valores = [];
    if (temMensal && valorMensal.trim()) {
      valores.push({ tipo: 'Mensal', valor: valorMensal.trim(), forma: formaMensal });
    }
    if (temTrimestral && valorTrimestral.trim()) {
      valores.push({ tipo: 'Trimestral', valor: valorTrimestral.trim(), forma: formaTrimestral });
    }
    if (temAvista && valorAvista.trim()) {
      valores.push({ tipo: 'À vista', valor: valorAvista.trim(), forma: formaAvista });
    }

    try {
      const planoData = {
        nome: nome.trim(),
        frequencia: frequencia.trim(),
        aulas: aulas.trim(),
        reposicao: reposicao.trim(),
        cor,
        corGradiente,
        destaque,
        ordem: ordem || planos.length,
        valores,
        ultimaAtualizacao: new Date()
      };

      if (editingPlano) {
        // Atualizar - manter dataCriacao original se existir
        if (editingPlano.dataCriacao) {
          planoData.dataCriacao = editingPlano.dataCriacao;
        }
        await updateDoc(doc(db, 'planos', editingPlano.id), planoData);
        Alert.alert('Sucesso', 'Plano atualizado com sucesso!');
      } else {
        // Criar - adicionar dataCriacao apenas na criação
        planoData.dataCriacao = new Date();
        await addDoc(collection(db, 'planos'), planoData);
        Alert.alert('Sucesso', 'Plano criado com sucesso!');
      }

      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      Alert.alert('Erro', 'Não foi possível salvar o plano');
    }
  };

  // Deletar plano
  const deletarPlano = async (planoId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar este plano?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'planos', planoId));
              Alert.alert('Sucesso', 'Plano deletado com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar plano:', error);
              Alert.alert('Erro', 'Não foi possível deletar o plano');
            }
          }
        }
      ]
    );
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 font-pregular text-lg text-center">
            Acesso restrito a administradores
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return <LoadingScreen />;
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
          {/* Header */}
          <View className="bg-blue-600 px-6 pt-16 pb-12 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-pextrabold text-xl flex-1">
              Gerenciar Planos
            </Text>
          </View>

          {/* Barra degradê */}
          <LinearGradient
            colors={['#FCD34D', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />

          {/* Botão Criar Novo Plano */}
          <View className="px-6 py-6">
            <TouchableOpacity
              onPress={() => abrirModal()}
              className="bg-green-500 rounded-lg p-4 items-center border-2 border-green-600"
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={24} color="white" />
                <Text className="text-white font-pextrabold text-lg ml-2">
                  Criar Novo Plano
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Lista de Planos */}
          <View className="px-6 py-6">
            <Text className="text-gray-800 font-pextrabold text-2xl mb-4">
              Planos Cadastrados ({planos.length})
            </Text>
            
            {planos.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-8 items-center">
                <Ionicons name="document-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 font-pregular text-lg text-center mt-4">
                  Nenhum plano cadastrado
                </Text>
                <Text className="text-gray-400 font-pregular text-sm text-center mt-2">
                  Clique em "Criar Novo Plano" para começar
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {planos.map((plano) => (
                  <View key={plano.id} className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-lg">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-gray-800 font-pextrabold text-lg">
                          {plano.nome}
                        </Text>
                        <Text className="text-gray-600 font-pregular text-sm mt-1">
                          {plano.frequencia} • {plano.aulas}
                        </Text>
                      </View>
                      {plano.destaque && (
                        <View className="bg-yellow-400 rounded-full px-3 py-1 ml-2">
                          <Text className="text-gray-800 font-pbold text-xs">
                            ⭐ DESTAQUE
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View className="flex-row items-center space-x-2 mb-3">
                      <View 
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: plano.cor }}
                      />
                      <Text className="text-gray-600 font-pregular text-sm">
                        Ordem: {plano.ordem || 0}
                      </Text>
                    </View>

                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() => abrirModal(plano)}
                        className="flex-1 bg-blue-500 rounded-lg p-3 items-center"
                      >
                        <Text className="text-white font-pbold">
                          ✏️ Editar
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deletarPlano(plano.id)}
                        className="flex-1 bg-red-500 rounded-lg p-3 items-center"
                      >
                        <Text className="text-white font-pbold">
                          🗑️ Deletar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Modal de Criar/Editar Plano */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Header do Modal - Fixo */}
              <View className="flex-row items-center justify-between p-6 pb-4 border-b border-gray-200">
                <Text className="text-gray-800 font-pextrabold text-2xl">
                  {editingPlano ? 'Editar Plano' : 'Criar Novo Plano'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="bg-gray-200 rounded-full p-2"
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Container com flex para ScrollView e Botões */}
              <View style={{ flex: 1 }}>
                {/* Formulário - Scrollável */}
                <ScrollView 
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                <View className="space-y-4 pt-4">
                  {/* Nome */}
                  <View>
                    <Text className="text-gray-700 font-pbold text-sm mb-2">
                      Nome do Plano *
                    </Text>
                    <TextInput
                      className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                      placeholder="Ex: Quem corre é a bola⚽️"
                      value={nome}
                      onChangeText={setNome}
                      maxLength={50}
                    />
                  </View>

                  {/* Frequência */}
                  <View>
                    <Text className="text-gray-700 font-pbold text-sm mb-2">
                      Frequência *
                    </Text>
                    <TextInput
                      className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                      placeholder="Ex: 1x na semana"
                      value={frequencia}
                      onChangeText={setFrequencia}
                    />
                  </View>

                  {/* Aulas */}
                  <View>
                    <Text className="text-gray-700 font-pbold text-sm mb-2">
                      Aulas no Mês *
                    </Text>
                    <TextInput
                      className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                      placeholder="Ex: 4 aulas no mês"
                      value={aulas}
                      onChangeText={setAulas}
                    />
                  </View>

                  {/* Reposição */}
                  <View>
                    <Text className="text-gray-700 font-pbold text-sm mb-2">
                      Regra de Reposição
                    </Text>
                    <TextInput
                      className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                      placeholder="Ex: ❌ Sem direito a reposição"
                      value={reposicao}
                      onChangeText={setReposicao}
                    />
                  </View>

                  {/* Cor */}
                  <View>
                    <Text className="text-gray-700 font-pbold text-sm mb-2">
                      Cor do Plano
                    </Text>
                    <View className="flex-row flex-wrap">
                      {coresDisponiveis.map((item) => (
                        <TouchableOpacity
                          key={item.cor}
                          onPress={() => {
                            setCor(item.cor);
                            setCorGradiente(item.gradiente);
                          }}
                          className={`m-2 p-3 rounded-lg border-2 ${
                            cor === item.cor ? 'border-blue-600' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: item.cor + '40' }}
                        >
                          <View 
                            className="w-12 h-12 rounded-full mb-2"
                            style={{ backgroundColor: item.cor }}
                          />
                          <Text className="text-gray-700 font-pregular text-xs text-center">
                            {item.nome}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Ordem */}
                  <View>
                    <Text className="text-gray-700 font-pbold text-sm mb-2">
                      Ordem de Exibição
                    </Text>
                    <TextInput
                      className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                      placeholder="0"
                      value={ordem.toString()}
                      onChangeText={(text) => setOrdem(parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Destaque */}
                  <TouchableOpacity
                    onPress={() => setDestaque(!destaque)}
                    className="flex-row items-center p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300"
                  >
                    <Ionicons 
                      name={destaque ? "star" : "star-outline"} 
                      size={24} 
                      color="#F59E0B" 
                    />
                    <Text className="text-gray-800 font-pbold ml-3">
                      Marcar como Plano Destaque
                    </Text>
                  </TouchableOpacity>

                  {/* Valores */}
                  <View className="border-t-2 border-gray-200 pt-4">
                    <Text className="text-gray-700 font-pextrabold text-lg mb-4">
                      Valores do Plano
                    </Text>

                    {/* Mensal */}
                    <View className="mb-4">
                      <TouchableOpacity
                        onPress={() => setTemMensal(!temMensal)}
                        className="flex-row items-center mb-2"
                      >
                        <Ionicons 
                          name={temMensal ? "checkbox" : "checkbox-outline"} 
                          size={24} 
                          color="#3B82F6" 
                        />
                        <Text className="text-gray-800 font-pbold ml-2">
                          Valor Mensal
                        </Text>
                      </TouchableOpacity>
                      {temMensal && (
                        <View className="ml-8 space-y-2">
                          <TextInput
                            className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                            placeholder="Ex: 135,90"
                            value={valorMensal}
                            onChangeText={setValorMensal}
                            keyboardType="decimal-pad"
                          />
                          <TextInput
                            className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                            placeholder="Forma de pagamento"
                            value={formaMensal}
                            onChangeText={setFormaMensal}
                          />
                        </View>
                      )}
                    </View>

                    {/* Trimestral */}
                    <View className="mb-4">
                      <TouchableOpacity
                        onPress={() => setTemTrimestral(!temTrimestral)}
                        className="flex-row items-center mb-2"
                      >
                        <Ionicons 
                          name={temTrimestral ? "checkbox" : "checkbox-outline"} 
                          size={24} 
                          color="#3B82F6" 
                        />
                        <Text className="text-gray-800 font-pbold ml-2">
                          Valor Trimestral
                        </Text>
                      </TouchableOpacity>
                      {temTrimestral && (
                        <View className="ml-8 space-y-2">
                          <TextInput
                            className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                            placeholder="Ex: 179,90"
                            value={valorTrimestral}
                            onChangeText={setValorTrimestral}
                            keyboardType="decimal-pad"
                          />
                          <TextInput
                            className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                            placeholder="Forma de pagamento"
                            value={formaTrimestral}
                            onChangeText={setFormaTrimestral}
                          />
                        </View>
                      )}
                    </View>

                    {/* À Vista */}
                    <View className="mb-4">
                      <TouchableOpacity
                        onPress={() => setTemAvista(!temAvista)}
                        className="flex-row items-center mb-2"
                      >
                        <Ionicons 
                          name={temAvista ? "checkbox" : "checkbox-outline"} 
                          size={24} 
                          color="#3B82F6" 
                        />
                        <Text className="text-gray-800 font-pbold ml-2">
                          Valor À Vista
                        </Text>
                      </TouchableOpacity>
                      {temAvista && (
                        <View className="ml-8 space-y-2">
                          <TextInput
                            className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                            placeholder="Ex: 480,00"
                            value={valorAvista}
                            onChangeText={setValorAvista}
                            keyboardType="decimal-pad"
                          />
                          <TextInput
                            className="border-2 border-gray-300 rounded-lg p-3 text-gray-800 font-pregular"
                            placeholder="Forma de pagamento"
                            value={formaAvista}
                            onChangeText={setFormaAvista}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Botões - Fixos na parte inferior */}
              <View className="px-6 pt-4 pb-6 bg-white border-t border-gray-200">
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={() => setShowModal(false)}
                    className="flex-1 bg-gray-500 rounded-lg p-4 items-center"
                  >
                    <Text className="text-white font-pbold text-base">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={salvarPlano}
                    className="flex-1 bg-blue-600 rounded-lg p-4 items-center"
                  >
                    <Text className="text-white font-pextrabold text-base">
                      {editingPlano ? 'Salvar Alterações' : 'Criar Plano'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
    minHeight: '80%',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
});

