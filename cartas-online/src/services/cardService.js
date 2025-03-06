import { updateDoc, doc } from "firebase/firestore";

// Função para remover uma carta do jogador e atualizar o estado no Firestore
export const removePlayedCard = async (gameRoom, user, selectedCard, gameState) => {
  const gameRef = doc(gameState.db, "games", gameRoom);

  // Remove a carta jogada do deck do jogador
  const newWhiteCards = gameState.whiteCards.filter(card => card !== selectedCard);

  // Atualiza o deck e adiciona a carta jogada no banco de dados
  await updateDoc(gameRef, {
    whiteCards: newWhiteCards,
    playedCards: [...gameState.playedCards, { card: selectedCard, user: user.displayName }],
  });
};

// Função para garantir que as cartas escolhidas pelo juiz não voltem ao deck
export const removeJudgeChosenCard = async (gameRoom, gameState, judgeChosenCard) => {
  const gameRef = doc(gameState.db, "games", gameRoom);

  // Remove a carta escolhida pelo juiz do deck do jogador
  const newWhiteCards = gameState.whiteCards.filter(card => card !== judgeChosenCard);

  await updateDoc(gameRef, {
    whiteCards: newWhiteCards,
  });
};
