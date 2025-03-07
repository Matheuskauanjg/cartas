import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import cardsData from "../data/cards.json";

function Game() {
  const [gameState, setGameState] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [timer, setTimer] = useState(30);
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
          whiteCards: shuffle(cardsData.whiteCards).slice(0, 10), // Cartas iniciais do jogador
        };

        await updateDoc(gameRef, { players: [...currentPlayers, newPlayer] });
        console.log("Jogador adicionado:", newPlayer);
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
            timer: 30,
            roundOver: false,
          });

          setGameState({
            blackCard: randomBlackCard,
            playedCards: [],
            scores: {},
            judge: user.displayName,
            winner: null,
            players: [initialPlayer],
            timer: 30,
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
    let interval;
    if (gameState && gameState.timer > 0 && !gameState.roundOver) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (timer === 0 && !gameState.roundOver) {
      console.log("Tempo esgotado!");
      // Lógica para finalizar rodada ou algo que você queira fazer
    }
  }, [timer, gameState]);

  if (!gameState) {
    return <div>Carregando...</div>;
  }

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

      // Remover a carta jogada do deck do jogador
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
      return { ...player }; // Não alterar o deck do jogador
    });

    try {
      await updateDoc(gameRef, {
        playedCards: [],
        blackCard: randomBlackCard,
        timer: 30,
        roundOver: false,
        players: updatedPlayers,
      });
    } catch (error)      {
      console.error("Erro ao iniciar próxima rodada:", error);
    }
  };

  const buyCards = async () => {
    const updatedPlayers = gameState.players.map((player) => {
      if (player.whiteCards.length < 10) {
        const newCards = shuffle(cardsData.whiteCards.slice(0, 5 - (player.whiteCards.length || 0)));
        player.whiteCards = [...(player.whiteCards || []), ...newCards];
      }
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

      {timer > 0 && !gameState.roundOver ? (
        <div>
          <p>Tempo restante: {timer}s</p>
        </div>
      ) : gameState.roundOver ? (
        <div>
          <p>Rodada terminada!</p>
          {gameState.winner && <h3>Vencedor da rodada: {gameState.winner}</h3>}
        </div>
      ) : (
        <div>
          <p>Tempo esgotado!</p>
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
