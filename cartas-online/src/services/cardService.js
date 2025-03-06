import { updateDoc, doc } from "firebase/firestore";

// Corrige a função removePlayedCard para funcionar corretamente
export const removePlayedCard = async (gameRoom, user, selectedCard, gameState) => {
  const gameRef = doc(gameState.db, "games", gameRoom); // Corrigido o acesso ao banco de dados

  // Remove a carta jogada do deck do jogador
  const newWhiteCards = gameState.whiteCards.filter(card => card !== selectedCard);

  // Atualiza o deck de cartas brancas e adiciona a carta jogada no banco de dados
  await updateDoc(gameRef, {
    whiteCards: newWhiteCards,
    playedCards: [...gameState.playedCards, { card: selectedCard, user: user.displayName }],
  });
};
