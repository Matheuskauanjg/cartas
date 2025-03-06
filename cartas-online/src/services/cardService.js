// src/services/cardService.js

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Função para remover a carta jogada da mão do jogador
export const removePlayedCard = async (gameId, user, selectedCard, gameState) => {
  const gameRef = doc(db, "games", gameId);
  
  // Remover a carta jogada da mão do jogador
  const newWhiteCards = gameState.whiteCards.filter(card => card !== selectedCard);
  
  // Atualizar a mão do jogador e as cartas jogadas no banco de dados
  await updateDoc(gameRef, {
    whiteCards: newWhiteCards,
    playedCards: [...gameState.playedCards, { user: user.displayName, card: selectedCard }]
  });
};
