import { updateDoc, doc } from "firebase/firestore";

/// Função para garantir que a carta escolhida pelo juiz seja removida do deck
export const removeJudgeChosenCard = async (gameRoom, gameState, judgeChosenCard, db) => {
  const gameRef = doc(db, "games", gameRoom);

  // Encontra o jogador que jogou a carta escolhida pelo juiz
  const playerIndex = gameState.players.findIndex(player => 
    player.name === judgeChosenCard.user
  );

  if (playerIndex === -1) return; // Se o jogador não for encontrado, não faz nada

  // Remove a carta do deck do jogador
  const player = gameState.players[playerIndex];
  const newWhiteCards = player.whiteCards.filter(card => card !== judgeChosenCard.card);

  // Atualiza a lista de jogadores com o novo deck do jogador escolhido
  const updatedPlayers = [...gameState.players];
  updatedPlayers[playerIndex] = { ...player, whiteCards: newWhiteCards };

  // Atualiza o Firestore
  await updateDoc(gameRef, {
    players: updatedPlayers
  });
};
