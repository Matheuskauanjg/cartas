import { updateDoc, doc } from "firebase/firestore";

// Atualiza a rodada e o juiz
export const nextRound = async (gameRoom, gameState) => {
  const gameRef = doc(gameState.db, "games", gameRoom);

  const currentJudgeIndex = gameState.players.findIndex(player => player.name === gameState.judge);
  const nextJudge = gameState.players[(currentJudgeIndex + 1) % gameState.players.length].name;

  await updateDoc(gameRef, {
    judge: nextJudge,
    playedCards: [],
    roundOver: false,
    timer: 30, // Reseta o timer para 30 segundos
    blackCard: gameState.blackCard, // Retém a mesma carta preta até a próxima escolha
  });
};
