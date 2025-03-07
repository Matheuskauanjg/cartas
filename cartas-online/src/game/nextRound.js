import { updateDoc, doc } from "firebase/firestore";

// Função para atualizar a rodada e o juiz
export const nextRound = async (gameRoom, gameState, db) => {
  const gameRef = doc(db, "games", gameRoom);

  // Encontra o índice do juiz atual e define o próximo juiz
  const currentJudgeIndex = gameState.players.findIndex(player => player.name === gameState.judge);
  const nextJudge = gameState.players[(currentJudgeIndex + 1) % gameState.players.length].name;

  // Remove as cartas jogadas do deck dos jogadores
  const updatedPlayers = gameState.players.map(player => {
    const filteredDeck = player.whiteCards.filter(card => 
      !gameState.playedCards.some(playedCard => playedCard.user === player.name && playedCard.card === card)
    );
    return { ...player, whiteCards: filteredDeck };
  });

  // Atualiza o Firestore com os novos dados da rodada
  await updateDoc(gameRef, {
    judge: nextJudge,          // Atualiza o juiz para o próximo jogador
    playedCards: [],           // Esvazia a mesa para a próxima rodada
    roundOver: false,          // Marca o início da nova rodada
    timer: 30,                 // Reseta o temporizador
    blackCard: gameState.blackCard,  // Mantém a mesma carta preta
    players: updatedPlayers    // Atualiza os jogadores com suas cartas restantes
  });
};
