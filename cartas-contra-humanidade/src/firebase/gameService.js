// src/firebase/gameService.js
import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

const gameRef = doc(db, 'games', 'game-room-1'); // Documento específico da sala

// Salvar estado do jogo no Firestore
export const saveGameState = async (gameState) => {
  try {
    await setDoc(gameRef, gameState);
    console.log('Estado do jogo salvo');
  } catch (error) {
    console.error('Erro ao salvar o estado do jogo:', error);
  }
};

// Obter o estado do jogo
export const getGameState = async () => {
  try {
    const gameSnapshot = await getDoc(gameRef);
    if (gameSnapshot.exists()) {
      return gameSnapshot.data();
    } else {
      console.log('Jogo não encontrado');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter o estado do jogo:', error);
  }
};
