import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import cardsData from "../data/cards.json";
import { TIMER_CONFIG } from "../config/timerConfig";  // Importa a configuração

function Game() {
  const [gameState, setGameState] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [timer, setTimer] = useState(TIMER_CONFIG.cardTime);
  const [judgeTimer, setJudgeTimer] = useState(TIMER_CONFIG.judgeTime);
  const navigate = useNavigate();
  const user = auth.currentUser;
  const gameRef = doc(db, "games", "game-room-1");

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  const addPlayerToGame = useCallback(async () => {
    if (!user) return;

    try {
      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) {
        console.log("Jogo não encontrado");
        return;
      }

      const gameData = gameSnap.data();
      const currentPlayers = gameData.players || [];
      const existingPlayer = currentPlayers.find(p => p.name === user.displayName);

      if (!existingPlayer) {
        const newPlayer = {
          name: user.displayName,
          score: 0,
          whiteCards: shuffle(cardsData.whiteCards).slice(0, 10),
        };

        await updateDoc(gameRef, { players: [...currentPlayers, newPlayer] });
        console.log("Jogador adicionado:", newPlayer);
      } else if (!existingPlayer.whiteCards || existingPlayer.whiteCards.length === 0) {
        existingPlayer.whiteCards = shuffle(cardsData.whiteCards).slice(0, 10);
        await updateDoc(gameRef, { players: currentPlayers });
        console.log("Cartas do jogador atualizadas:", existingPlayer);
      }
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error);
    }
  }, [gameRef, user]);

  useEffect(() => {
    if (!user) {
      console.log("Usuário não autenticado, redirecionando para login");
      navigate("/login");
      return;
    }

    const initializeGame = async () => {
      try {
        const docSnap = await getDoc(gameRef);
        if (!docSnap.exists()) {
          console.log("Criando um novo jogo...");
          const randomBlackCard = shuffle(cardsData.blackCards)[0];
          const initialPlayer = {
            name: user.displayName,
            score: 0,
            whiteCards: shuffle(cardsData.whiteCards).slice(0, 10),
          };

          await setDoc(gameRef, {
            blackCard: randomBlackCard,
            playedCards: [],
            scores: {},
            judge: user.displayName,
            winner: null,
            players: [initialPlayer],
            timer: TIMER_CONFIG.cardTime,
            roundOver: false,
          });

          setGameState({
            blackCard: randomBlackCard,
            playedCards: [],
            scores: {},
            judge: user.displayName,
            winner: null,
            players: [initialPlayer],
            timer: TIMER_CONFIG.cardTime,
            roundOver: false,
          });
        } else {
          console.log("Jogo encontrado, carregando estado...");
          setGameState(docSnap.data());
          await addPlayerToGame();
        }
      } catch (error) {
        console.error("Erro ao buscar o estado do jogo:", error);
      }
    };

    initializeGame();

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        console.log("Estado do jogo atualizado:", doc.data());
        setGameState(doc.data());
      }
    });

    return () => unsubscribe();
  }, [navigate, user, addPlayerToGame, gameRef]);

  useEffect(() => {
    if (gameState && !gameState.roundOver) {
      const countdownTimer = setInterval(() => {
        if (gameState.timer > 0) {
          setGameState((prev) => ({
            ...prev,
            timer: prev.timer - 1,
          }));
        } else if (gameState.timer === 0 && gameState.judge === user.displayName) {
          setJudgeTimer(TIMER_CONFIG.judgeTime); // Reinicia o tempo do juiz
        } else if (gameState.timer === 0 && gameState.judge !== user.displayName) {
          clearInterval(countdownTimer);
        }
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [gameState, user]);

  useEffect(() => {
    if (gameState && gameState.judge === user.displayName && judgeTimer > 0) {
      const judgeCountdown = setInterval(() => {
        if (judgeTimer > 0) {
          setJudgeTimer((prev) => prev - 1);
        } else {
          console.log("Tempo de escolha do juiz acabou! Empate.");
          // Lógica para lidar com empate, se necessário
          setJudgeTimer(0); // Para o temporizador do juiz
        }
      }, 1000);

      return () => clearInterval(judgeCountdown);
    }
  }, [gameState, judgeTimer, user]);

  const playCard = async () => {
    if (!selectedCard || gameState.judge === user.displayName || gameState.roundOver) return;

    try {
      await updateDoc(gameRef, {
        playedCards: [...gameState.playedCards, { card: selectedCard, user: user.displayName }],
      });
      setSelectedCard(null);
    } catch (error) {
      console.error("Erro ao jogar carta:", error);
    }
  };

  const chooseWinner = async (winningCard) => {
    if (!gameState || gameState.judge !== user.displayName) return;

    const updatedScores = {
      ...gameState.scores,
      [winningCard.user]: (gameState.scores[winningCard.user] || 0) + 1,
    };

    const winner = Object.keys(updatedScores).find(player => updatedScores[player] >= 8);

    try {
      if (winner) {
        await updateDoc(gameRef, {
          winner: winner,
          scores: updatedScores,
          playedCards: [],
          roundOver: true,
        });
      } else {
        const currentJudgeIndex = gameState.players.findIndex(player => player.name === gameState.judge);
        const nextJudge = gameState.players[(currentJudgeIndex + 1) % gameState.players.length].name;

        await updateDoc(gameRef, {
          judge: nextJudge,
          scores: updatedScores,
          playedCards: [],
          roundOver: true,
        });
      }

      await removeCardFromPlayerDeck(winningCard.user, winningCard.card);
    } catch (error) {
      console.error("Erro ao escolher vencedor:", error);
    }
  };

  const removeCardFromPlayerDeck = async (player, selectedCard) => {
    const updatedPlayers = gameState.players.map((p) => {
      if (p.name === player) {
        p.whiteCards = p.whiteCards?.filter((card) => card !== selectedCard) || [];
      }
      return p;
    });

    try {
      await updateDoc(gameRef, {
        players: updatedPlayers,
      });
    } catch (error) {
      console.error("Erro ao remover carta do deck:", error);
    }
  };

  const nextRound = async () => {
    const randomBlackCard = shuffle(cardsData.blackCards)[0];
    const updatedPlayers = gameState.players.map((player) => {
      player.whiteCards = shuffle(cardsData.whiteCards).slice(0, 10); // Distribui novas cartas
      return player;
    });

    try {
      await updateDoc(gameRef, {
        playedCards: [],
        blackCard: randomBlackCard,
        timer: TIMER_CONFIG.cardTime,
        roundOver: false,
        players: updatedPlayers,
      });
    } catch (error) {
      console.error("Erro ao iniciar próxima rodada:", error);
    }
  };

  const buyCards = async () => {
    const updatedPlayers = gameState.players.map((player) => {
      const newCards = shuffle(cardsData.whiteCards.slice(0, 5 - (player.whiteCards?.length || 0)));
      player.whiteCards = [...(player.whiteCards || []), ...newCards];
      return player;
    });

    try {
      await updateDoc(gameRef, {
        players: updatedPlayers,
      });
    } catch (error) {
      console.error("Erro ao comprar cartas:", error);
    }
  };

  return (
    <div>
      <h1>Jogo - Cartas Contra a Humanidade</h1>
      {gameState && <h2>Pergunta: {gameState.blackCard}</h2>}
      <div>
        <h3>Suas cartas:</h3>
        {gameState?.players?.map((player, index) => (
          player.name === user.displayName && gameState.judge !== user.displayName && !gameState.roundOver && (
            <div key={index}>
              {player.whiteCards?.map((card, idx) => (
                <button key={idx} onClick={() => setSelectedCard(card)}>
                  {card}
                </button>
              ))}
            </div>
          )
        ))}
      </div>

      {gameState.timer > 0 && !gameState.roundOver ? (
        <div>
          <p>Tempo restante para enviar a carta: {gameState.timer}s</p>
        </div>
      ) : gameState.roundOver ? (
        <div>
          <p>Rodada terminada!</p>
          {gameState.winner && <h3>Vencedor da rodada: {gameState.winner}</h3>}
        </div>
      ) : (
        <div>
          <p>Tempo esgotado para enviar a carta!</p>
        </div>
      )}

      {gameState.judge === user.displayName && judgeTimer > 0 && !gameState.roundOver && (
        <div>
          <p>Tempo restante para escolher o vencedor: {judgeTimer}s</p>
        </div>
      )}

      <button onClick={playCard} disabled={!selectedCard || gameState.judge === user.displayName || gameState.roundOver}>
        Jogar Carta
      </button>

      {gameState?.judge === user.displayName && !gameState.roundOver && (
        <div>
          <h3>Escolha a melhor resposta:</h3>
          {gameState?.playedCards?.map((card, index) => (
            <button key={index} onClick={() => chooseWinner(card)}>
              {card.card} - {card.user}
            </button>
          ))}
        </div>
      )}

      <button onClick={nextRound} disabled={!gameState.roundOver || gameState.judge !== user.displayName}>
        Próxima Rodada
      </button>

      <button onClick={buyCards} disabled={gameState.whiteCards?.length >= 5 || gameState.roundOver}>
        Comprar Cartas
      </button>

      {gameState.winner && <h2>{gameState.winner} venceu a partida!</h2>}
    </div>
  );
}

export default Game;
