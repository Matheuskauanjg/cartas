import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import cardsData from "../data/cards.json";

function Game() {
  const [gameState, setGameState] = useState({
    blackCard: "",
    playedCards: [],
    scores: {},
    judge: "",
    winner: null,
    players: [],
    timer: 30,
    roundOver: false,
  });
  const [selectedCard, setSelectedCard] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const gameRef = doc(db, "games", "game-room-1");

    const fetchGameState = async () => {
      const docSnap = await getDoc(gameRef);

      if (!docSnap.exists()) {
        const randomBlackCard = cardsData.blackCards[Math.floor(Math.random() * cardsData.blackCards.length)];

        // Inicializa os jogadores e distribui as cartas
        const initialPlayers = [
          { 
            name: user.displayName, 
            score: 0, 
            whiteCards: shuffle(cardsData.whiteCards.slice(0, 10)) // 10 cartas brancas para o jogador
          },
        ];

        // Cria o estado inicial do jogo no Firebase
        await setDoc(gameRef, {
          blackCard: randomBlackCard,
          playedCards: [],
          scores: {},
          judge: user.displayName,
          winner: null,
          players: initialPlayers,
          timer: 30,
          roundOver: false,
        });

        setGameState({
          blackCard: randomBlackCard,
          playedCards: [],
          scores: {},
          judge: user.displayName,
          winner: null,
          players: initialPlayers,
          timer: 30,
          roundOver: false,
        });
      } else {
        const gameData = docSnap.data();
        setGameState({
          ...gameData,
          players: gameData.players || [], // Garante que 'players' existe
        });
      }
    };

    fetchGameState();

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data();
        setGameState({
          ...gameData,
          players: gameData.players || [], // Garante que 'players' existe
        });
      }
    });

    return () => unsubscribe();
  }, [navigate, user]);

  const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const playCard = async () => {
    if (!selectedCard || !gameState || gameState.judge === user.displayName || gameState.roundOver) return;

    await updateDoc(doc(db, "games", "game-room-1"), {
      playedCards: [
        ...gameState.playedCards,
        { card: selectedCard, user: user.displayName },
      ],
    });

    setSelectedCard(null);
  };

  const chooseWinner = async (winningCard) => {
    if (!gameState || gameState.judge !== user.displayName) return;

    const gameRef = doc(db, "games", "game-room-1");

    const updatedScores = {
      ...gameState.scores,
      [winningCard.user]: (gameState.scores[winningCard.user] || 0) + 1,
    };

    const winner = Object.keys(updatedScores).find(player => updatedScores[player] >= 8);

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
  };

  const removeCardFromPlayerDeck = async (player, selectedCard) => {
    const gameRef = doc(db, "games", "game-room-1");

    const updatedPlayers = gameState.players.map((p) => {
      if (p.name === player) {
        p.whiteCards = p.whiteCards?.filter((card) => card !== selectedCard) || [];
      }
      return p;
    });

    await updateDoc(gameRef, {
      players: updatedPlayers,
    });
  };

  const nextRound = async () => {
    const gameRef = doc(db, "games", "game-room-1");

    const randomBlackCard = cardsData.blackCards[Math.floor(Math.random() * cardsData.blackCards.length)];

    const updatedPlayers = gameState.players.map((player) => {
      player.whiteCards = shuffle(cardsData.whiteCards.slice(0, 10)); // Distribui novas cartas
      return player;
    });

    await updateDoc(gameRef, {
      playedCards: [],
      blackCard: randomBlackCard,
      timer: 30,
      roundOver: false,
      players: updatedPlayers,
    });
  };

  const buyCards = async () => {
    const gameRef = doc(db, "games", "game-room-1");

    const updatedPlayers = gameState.players.map((player) => {
      const newCards = shuffle(cardsData.whiteCards.slice(0, 5 - (player.whiteCards?.length || 0)));
      player.whiteCards = [...(player.whiteCards || []), ...newCards];
      return player;
    });

    await updateDoc(gameRef, {
      players: updatedPlayers,
    });
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
          <p>Tempo restante: {gameState.timer}s</p>
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
