// src/services/cardService.js

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Função para remover a carta jogada da mão do jogador, se for escolhida pelo juiz
export const removePlayedCard = async (gameId, user, selectedCard, gameState) => {
  const gameRef = doc(db, "games", gameId);

  // Se a carta foi escolhida pelo juiz, removê-la da mão do jogador
  if (gameState.winner && gameState.winner.user === user.displayName) {
    const newWhiteCards = gameState.whiteCards.filter(card => card !== selectedCard);

    // Atualiza a mão do jogador e as cartas jogadas no banco de dados
    await updateDoc(gameRef, {
      whiteCards: newWhiteCards,
      playedCards: [...gameState.playedCards, { user: user.displayName, card: selectedCard }]
    });
  }
};
