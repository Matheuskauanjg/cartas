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
      try {
        const docSnap = await getDoc(gameRef);

        if (!docSnap.exists()) {
          console.log("Jogo não encontrado, criando novo jogo...");

          const randomBlackCard = cardsData.blackCards[Math.floor(Math.random() * cardsData.blackCards.length)];

          // Inicializa os jogadores e distribui as cartas (8 cartas por jogador)
          const initialPlayers = [
            { 
              name: user.displayName, 
              score: 0, 
              whiteCards: shuffle(cardsData.whiteCards).slice(0, 8), // Agora são 8 cartas
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

          console.log("Jogo criado no Firebase:", initialPlayers);

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
          console.log("Jogo encontrado no Firebase", docSnap.data());
          const gameData = docSnap.data();
          setGameState({
            ...gameData,
            players: gameData.players || [],
          });

          // Adiciona o jogador atual ao jogo se ele ainda não estiver na lista
          if (!gameData.players.some(p => p.name === user.displayName)) {
            await addPlayerToGame();
          }
        }
      } catch (error) {
        console.error("Erro ao buscar o estado do jogo:", error);
      }
    };

    fetchGameState();

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data();
        console.log("Estado do jogo atualizado:", gameData);
        setGameState({
          ...gameData,
          players: gameData.players || [],
        });
      }
    });

    return () => unsubscribe();
  }, [navigate, user]);

  const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const addPlayerToGame = async () => {
    const gameRef = doc(db, "games", "game-room-1");

    const newPlayer = {
      name: user.displayName,
      score: 0,
      whiteCards: shuffle(cardsData.whiteCards).slice(0, 8), // Dá 8 cartas ao jogador novo
    };

    await updateDoc(gameRef, {
      players: [...gameState.players, newPlayer],
    });
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

    const updatedPlayers = gameState.players.map((p) => ({
      ...p,
      whiteCards: p.name === player ? p.whiteCards.filter((card) => card !== selectedCard) : p.whiteCards,
    }));

    await updateDoc(gameRef, {
      players: updatedPlayers,
    });
  };

  const buyCards = async () => {
    const gameRef = doc(db, "games", "game-room-1");

    const updatedPlayers = gameState.players.map((player) => {
      const missingCards = 8 - (player.whiteCards?.length || 0);
      const newCards = missingCards > 0 ? shuffle(cardsData.whiteCards).slice(0, missingCards) : [];
      return { ...player, whiteCards: [...(player.whiteCards || []), ...newCards] };
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

      <button onClick={playCard} disabled={!selectedCard || gameState.judge === user.displayName || gameState.roundOver}>
        Jogar Carta
      </button>

      <button onClick={buyCards} disabled={gameState.players.some(p => p.name === user.displayName && p.whiteCards.length >= 8)}>
        Comprar Cartas
      </button>
    </div>
  );
}

export default Game;
