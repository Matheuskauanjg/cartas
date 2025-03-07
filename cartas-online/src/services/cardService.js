// Função para garantir que as cartas escolhidas pelo juiz não voltem ao deck
export const removeJudgeChosenCard = async (gameRoom, gameState, judgeChosenCard) => {
  const gameRef = doc(gameState.db, "games", gameRoom);

  // Encontra o jogador que jogou a carta escolhida pelo juiz
  const playerIndex = gameState.players.findIndex((player) => player.name === judgeChosenCard.user);
  if (playerIndex === -1) return;

  // Remove a carta escolhida do deck do jogador
  const player = gameState.players[playerIndex];
  const newWhiteCards = player.whiteCards.filter((card) => card !== judgeChosenCard.card);

  // Atualiza o deck do jogador no banco de dados
  const updatedPlayers = [...gameState.players];
  updatedPlayers[playerIndex] = { ...player, whiteCards: newWhiteCards };

  await updateDoc(gameRef, {
    players: updatedPlayers,
  });
};
