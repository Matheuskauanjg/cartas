import { updateDoc, doc } from "firebase/firestore";

/**
 * Remove a carta escolhida pelo juiz do deck do jogador.
 * 
 * @param {Array} playedCards - Cartas jogadas na rodada.
 * @param {string} player - Nome do jogador que jogou a carta.
 * @param {string} selectedCard - Carta escolhida pelo juiz.
 * @param {object} gameState - Estado atual do jogo.
 */
export const removeCardFromPlayerDeck = async (playedCards, player, selectedCard, gameState) => {
  const gameRef = doc(gameState.db, "games", "game-room-1");

  // Encontra a carta jogada que corresponde à carta escolhida pelo juiz
  const cardToRemove = playedCards.find(card => card.card === selectedCard && card.user === player);

  if (cardToRemove) {
    // Atualiza o deck do jogador, removendo a carta escolhida
    const updatedWhiteCards = gameState.whiteCards.filter(card => card !== selectedCard);

    await updateDoc(gameRef, {
      whiteCards: updatedWhiteCards,  // Remove a carta do deck do jogador
      playedCards: gameState.playedCards.filter(card => card !== cardToRemove),  // Remove a carta jogada do histórico de cartas jogadas
    });
  }
};
