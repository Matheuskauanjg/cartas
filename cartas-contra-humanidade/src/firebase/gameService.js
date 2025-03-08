// src/firebase/gameService.js
import { db } from './firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; // Usando updateDoc para atualizar o estado da sala

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

// Função para obter o estado de uma sala de jogo existente
export const getGameState = async (gameId) => {
  try {
    const gameRef = doc(db, 'games', gameId); // Acessa a coleção "games" no Firestore
    const gameDoc = await getDoc(gameRef); // Pega o documento da sala

    if (gameDoc.exists()) {
      return gameDoc.data(); // Retorna os dados da sala
    } else {
      console.error('Sala não encontrada');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter o estado da sala:', error);
    return null;
  }
};

// Função para iniciar o jogo quando o número de jogadores for suficiente
export const startGameIfReady = async (gameId) => {
  try {
    const gameRef = doc(db, 'games', gameId); // Referência para a sala de jogo no Firestore
    const gameDoc = await getDoc(gameRef); // Pega o documento da sala

    if (gameDoc.exists()) {
      const gameData = gameDoc.data();

      // Verifica se o número de jogadores é suficiente
      if (gameData.players.length >= 3) {
        // Atualiza o estado da sala para "started" sem sobrescrever outros dados
        await updateDoc(gameRef, {
          state: 'started',
        });
        console.log('Jogo iniciado');
      } else {
        console.log('Número insuficiente de jogadores para iniciar o jogo');
      }
    } else {
      console.error('Sala não encontrada');
    }
  } catch (error) {
    console.error('Erro ao iniciar o jogo:', error);
  }
};
