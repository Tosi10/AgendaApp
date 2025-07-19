import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyCxKeZRlYFNGNOrrZ517C1nslktJcJltWo",
  authDomain: "agendamento-e97f7.firebaseapp.com",
  projectId: "agendamento-e97f7",
  storageBucket: "agendamento-e97f7.appspot.com",
  messagingSenderId: "265177362996",
  appId: "1:265177362996:web:9bf74dff8d665f79fe5061"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { app, auth };
export const db = getFirestore(app);
export const storage = getStorage(app); 