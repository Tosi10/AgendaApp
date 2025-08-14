import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para criar perfil de usuário
  const createUserProfile = async (userData) => {
    try {
      const userRef = doc(db, 'usuarios', userData.uid);
      await setDoc(userRef, {
        uid: userData.uid,
        email: userData.email,
        apelido: userData.email.split('@')[0], // Apelido padrão baseado no email
        tipoUsuario: userData.tipoUsuario || 'aluno',
        m2Coins: userData.tipoUsuario === 'admin' ? 999 : 0,
        plano: userData.tipoUsuario === 'admin' ? 'Admin Ilimitado' : 
               userData.tipoUsuario === 'personal' ? 'Personal Training' : 'Plano Básico',
        aprovado: userData.tipoUsuario === 'admin' || userData.tipoUsuario === 'personal' ? true : false,
        dataCriacao: new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString()
      });
      
      // Buscar o perfil criado
      const profileDoc = await getDoc(userRef);
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data());
      }
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      throw error;
    }
  };

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'usuarios', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
        return userDoc.data();
      } else {
        // Se não existir perfil, criar um padrão
        // Precisamos buscar o email do usuário autenticado
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error('Usuário não autenticado');
          return null;
        }
        
        const defaultProfile = {
          uid,
          email: currentUser.email,
          apelido: currentUser.email.split('@')[0],
          tipoUsuario: 'aluno',
          m2Coins: 0,
          plano: 'Plano Básico',
          aprovado: false,
          dataCriacao: new Date().toISOString(),
          ultimaAtualizacao: new Date().toISOString()
        };
        
        await createUserProfile(defaultProfile);
        setUserProfile(defaultProfile);
        return defaultProfile;
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  // Função para atualizar apelido
  const updateApelido = async (novoApelido) => {
    try {
      const userRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userRef, {
        apelido: novoApelido,
        ultimaAtualizacao: new Date().toISOString()
      });
      
      setUserProfile(prev => ({
        ...prev,
        apelido: novoApelido,
        ultimaAtualizacao: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao atualizar apelido:', error);
      throw error;
    }
  };

  // Função para atualizar M2 Coins (apenas para admins)
  const updateUserM2Coins = async (userId, novosCoins) => {
    try {
      const userRef = doc(db, 'usuarios', userId);
      await updateDoc(userRef, {
        m2Coins: novosCoins,
        ultimaAtualizacao: new Date().toISOString()
      });
      
      // Se for o usuário atual, atualizar o estado local
      if (userId === user.uid) {
        setUserProfile(prev => ({
          ...prev,
          m2Coins: novosCoins,
          ultimaAtualizacao: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar M2 Coins:', error);
      throw error;
    }
  };

  // Função para atualizar M2 Coins do usuário atual (para agendamentos)
  const updateCurrentUserM2Coins = async (novosCoins) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      const userRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userRef, {
        m2Coins: novosCoins,
        ultimaAtualizacao: new Date().toISOString()
      });
      
      // Atualizar o estado local
      setUserProfile(prev => ({
        ...prev,
        m2Coins: novosCoins,
        ultimaAtualizacao: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao atualizar M2 Coins do usuário atual:', error);
      throw error;
    }
  };

  // Função para aprovar usuário (apenas para admins)
  const approveUser = async (userId) => {
    try {
      const userRef = doc(db, 'usuarios', userId);
      await updateDoc(userRef, {
        aprovado: true,
        ultimaAtualizacao: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      throw error;
    }
  };

  // Função para rejeitar usuário (apenas para admins)
  const rejectUser = async (userId) => {
    try {
      const userRef = doc(db, 'usuarios', userId);
      await updateDoc(userRef, {
        aprovado: false,
        ultimaAtualizacao: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      throw error;
    }
  };

  // Função para buscar todos os usuários (apenas para admins)
  const fetchAllUsers = (callback) => {
    if (!userProfile || userProfile.tipoUsuario !== 'admin') return null;
    
    const q = query(collection(db, 'usuarios'), orderBy('dataCriacao', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      callback(users);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        
        if (user) {
          // Buscar perfil do usuário
          const profile = await fetchUserProfile(user.uid);
          
          if (profile) {
            // Verificar se o usuário está aprovado (exceto admins)
            if (profile.tipoUsuario !== 'admin' && !profile.aprovado) {
              // Usuário não aprovado - redirecionar para tela de aguardo
              router.replace('/(auth)/waiting-approval');
            } else {
              // Usuário aprovado ou admin - redirecionar para tela principal
              router.replace('/(tabs)');
            }
          } else {
            // Erro ao buscar perfil - redirecionar para login
            console.error('Erro ao buscar perfil do usuário');
            router.replace('/(auth)/sign-in');
          }
        } else {
          // Usuário não está logado - redirecionar para login
          setUserProfile(null);
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('Erro no GlobalProvider:', error);
        // Em caso de erro, redirecionar para login
        setUserProfile(null);
        router.replace('/(auth)/sign-in');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
      setUserProfile(null);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAdmin: userProfile?.tipoUsuario === 'admin',
    createUserProfile,
    updateApelido,
    updateUserM2Coins,
    updateCurrentUserM2Coins,
    approveUser,
    rejectUser,
    fetchAllUsers
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal deve ser usado dentro de um GlobalProvider');
  }
  return context;
} 