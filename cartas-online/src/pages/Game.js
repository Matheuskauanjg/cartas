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

  // Adicionar jogador ao jogo e garantir que o deck inicial seja fixo
  const addPlayerToGame = useCallback(async () => {
    if (!user) return;

    try {
      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) return console.log("Jogo não encontrado");

      const gameData = gameSnap.data();
      const currentPlayers = gameData.players || [];
      const existingPlayer = currentPlayers.find(p => p.name === user.displayName);

      if (!existingPlayer) {
        const newPlayer = {
          name: user.displayName,
          score: 0,
          whiteCards: shuffle(cardsData.whiteCards).slice(0, 10), // Deck fixo inicial
        };

        await updateDoc(gameRef, { players: [...currentPlayers, newPlayer] });
      }
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error);
    }
  }, [gameRef, user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const initializeGame = async () => {
      try {
        const docSnap = await getDoc(gameRef);
        if (!docSnap.exists()) {
          const randomBlackCard = shuffle(cardsData.blackCards)[0];
          const initialPlayer = {
            name: user.displayName,
            score: 0,
            whiteCards: shuffle(cardsData.whiteCards).slice(0, 10),
          };

          await setDoc(gameRef, {
            blackCard: randomBlackCard,
            playedCards: [],
            judge: user.displayName,
            winner: null,
            players: [initialPlayer],
            timer: 30,
            roundOver: false,
          });

          setGameState({
            blackCard: randomBlackCard,
            playedCards: [],
            judge: user.displayName,
            winner: null,
            players: [initialPlayer],
            timer: 30,
            roundOver: false,
          });
        } else {
          setGameState(docSnap.data());
          await addPlayerToGame();
        }
      } catch (error) {
        console.error("Erro ao buscar o estado do jogo:", error);
      }
    };

    initializeGame();

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) setGameState(doc.data());
    });

    return () => unsubscribe();
  }, [navigate, user, addPlayerToGame, gameRef]);

  // Temporizador atualizado corretamente
  useEffect(() => {
    let interval;
    if (gameState?.timer > 0 && !gameState.roundOver) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [gameState]);

  // Jogar carta e remover do deck do jogador
  const playCard = async () => {
    if (!selectedCard || gameState.judge === user.displayName || gameState.roundOver) return;

    try {
      const updatedPlayers = gameState.players.map((p) =>
        p.name === user.displayName
          ? { ...p, whiteCards: p.whiteCards.filter((card) => card !== selectedCard) }
          : p
      );

      await updateDoc(gameRef, {
        playedCards: [...gameState.playedCards, { card: selectedCard, user: user.displayName }],
        players: updatedPlayers,
      });

      setSelectedCard(null);
    } catch (error) {
      console.error("Erro ao jogar carta:", error);
    }
  };

  // Escolher vencedor e remover carta do deck do jogador vencedor
  const chooseWinner = async (winningCard) => {
    if (gameState.judge !== user.displayName) return;

    const updatedScores = {
      ...gameState.scores,
      [winningCard.user]: (gameState.scores[winningCard.user] || 0) + 1,
    };

    const winner = Object.keys(updatedScores).find(player => updatedScores[player] >= 8);

    try {
      const updatedPlayers = gameState.players.map((p) =>
        p.name === winningCard.user
          ? { ...p, whiteCards: p.whiteCards.filter((card) => card !== winningCard.card) }
          : p
      );

      await updateDoc(gameRef, {
        winner: winner || null,
        scores: updatedScores,
        playedCards: [],
        roundOver: true,
        players: updatedPlayers,
      });
    } catch (error) {
      console.error("Erro ao escolher vencedor:", error);
    }
  };

  // Próxima rodada mantendo o deck dos jogadores fixo
  const nextRound = async () => {
    try {
      const nextJudgeIndex =
        (gameState.players.findIndex((p) => p.name === gameState.judge) + 1) %
        gameState.players.length;

      await updateDoc(gameRef, {
        judge: gameState.players[nextJudgeIndex].name,
        playedCards: [],
        timer: 30,
        roundOver: false,
      });
    } catch (error) {
      console.error("Erro ao iniciar próxima rodada:", error);
    }
  };

  return (
    <div>
      <h1>Cartas Contra a Humanidade</h1>
      <h2>Pergunta: {gameState.blackCard}</h2>

      <div>
        <h3>Suas cartas:</h3>
        {gameState.players
          .find((player) => player.name === user.displayName)
          ?.whiteCards.map((card, idx) => (
            <button key={idx} onClick={() => setSelectedCard(card)}>
              {card}
            </button>
          ))}
      </div>

      <p>Tempo restante: {timer}s</p>

      <button onClick={playCard} disabled={!selectedCard || gameState.judge === user.displayName || gameState.roundOver}>
        Jogar Carta
      </button>

      {gameState.judge === user.displayName && !gameState.roundOver && (
        <div>
          <h3>Escolha a melhor resposta:</h3>
          {gameState.playedCards.map((card, index) => (
            <button key={index} onClick={() => chooseWinner(card)}>
              {card.card} - {card.user}
            </button>
          ))}
        </div>
      )}

      <button onClick={nextRound} disabled={!gameState.roundOver || gameState.judge !== user.displayName}>
        Próxima Rodada
      </button>

      {gameState.winner && <h2>{gameState.winner} venceu a partida!</h2>}
    </div>
  );
}

export default Game;
