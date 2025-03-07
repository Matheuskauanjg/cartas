import { updateDoc, doc } from "firebase/firestore";

// Atualiza a rodada e o juiz
export const nextRound = async (gameRoom, gameState) => {
  const gameRef = doc(gameState.db, "games", gameRoom);

  // Encontra o índice do juiz atual e define o próximo juiz
  const currentJudgeIndex = gameState.players.findIndex(player => player.name === gameState.judge);
  const nextJudge = gameState.players[(currentJudgeIndex + 1) % gameState.players.length].name;

  // Remove as cartas jogadas dos jogadores (já foram retiradas nos passos anteriores)
  const updatedPlayers = gameState.players.map(player => {
    const newWhiteCards = player.whiteCards.filter(card => 
      !gameState.playedCards.some(playedCard => playedCard.user === player.name && playedCard.card === card)
    );
    return { ...player, whiteCards: newWhiteCards };
  });

  // Atualiza o estado do jogo no Firestore
  await updateDoc(gameRef, {
    judge: nextJudge,          // Atualiza o juiz
    playedCards: [],           // Limpa as cartas jogadas
    roundOver: false,          // Indica que a rodada terminou
    timer: 30,                 // Reseta o timer para 30 segundos
    blackCard: gameState.blackCard,  // Retém a mesma carta preta para a próxima rodada
    players: updatedPlayers    // Atualiza os decks dos jogadores
  });
};
