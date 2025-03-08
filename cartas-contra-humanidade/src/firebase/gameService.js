// src/firebase/gameService.js
import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDoc, addDoc } from 'firebase/firestore';

const gamesRef = collection(db, 'games'); // Referência para a coleção de jogos

// Função para criar uma nova sala de jogo
export const createGameRoom = async (roomName) => {
  try {
    const newGameRef = await addDoc(gamesRef, {
      name: roomName,
      players: [],
      state: 'waiting', // O estado inicial da sala
    });
    console.log('Sala de jogo criada:', newGameRef.id);
    return newGameRef.id; // Retorna o ID da sala criada
  } catch (error) {
    console.error('Erro ao criar a sala de jogo:', error);
  }
};

// Obter o estado de uma sala de jogo existente
export const getGameState = async (gameId) => {  // Garanta que seja getGameState
  try {
    const gameSnapshot = await getDoc(doc(gamesRef, gameId));
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
