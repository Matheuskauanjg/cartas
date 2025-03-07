import { updateDoc, doc } from "firebase/firestore";

// Atualiza a rodada, o juiz e remove as cartas jogadas dos decks
export const nextRound = async (gameRoom, gameState, db) => {
  const gameRef = doc(db, "games", gameRoom);

  // Encontra o próximo juiz da rodada
  const currentJudgeIndex = gameState.players.findIndex(player => player.name === gameState.judge);
  const nextJudge = gameState.players[(currentJudgeIndex + 1) % gameState.players.length].name;

  // Remove as cartas jogadas dos decks dos jogadores
  const updatedPlayers = gameState.players.map(player => {
    const newWhiteCards = player.whiteCards.filter(card => 
      !gameState.playedCards.some(playedCard => playedCard.user === player.name && playedCard.card === card)
    );
    return { ...player, whiteCards: newWhiteCards };
  });

  // Atualiza o Firestore com o novo estado da rodada
  await updateDoc(gameRef, {
    judge: nextJudge, // Atualiza o juiz
    playedCards: [], // Limpa as cartas jogadas
    roundOver: false, // Inicia uma nova rodada
    timer: 30, // Reseta o timer
    blackCard: gameState.blackCard, // Retém a mesma carta preta
    players: updatedPlayers // Atualiza os decks dos jogadores
  });
};
