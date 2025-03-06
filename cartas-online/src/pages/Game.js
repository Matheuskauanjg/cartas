import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { removePlayedCard } from "../services/cardService"; // Importa o serviço para remover a carta
import cardsData from "../data/cards.json";

function Game() {
  const [gameState, setGameState] = useState({
    blackCard: "",
    whiteCards: [],
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
        const randomWhiteCards = [...cardsData.whiteCards]
          .sort(() => 0.5 - Math.random())
          .slice(0, 10); // Distribuindo 10 cartas brancas para cada jogador

        const initialPlayers = [{ name: user.displayName, score: 0 }];
        await setDoc(gameRef, {
          blackCard: randomBlackCard,
          whiteCards: randomWhiteCards,
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
          whiteCards: randomWhiteCards,
          playedCards: [],
          scores: {},
          judge: user.displayName,
          winner: null,
          players: initialPlayers,
          timer: 30,
          roundOver: false,
        });
      } else {
        setGameState(docSnap.data());
      }
    };

    fetchGameState();

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        setGameState((prevState) => ({
          ...prevState,
          ...doc.data(),
          playedCards: doc.data()?.playedCards || [],
        }));
      }
    });

    return () => unsubscribe();
  }, [navigate, user]);

  useEffect(() => {
    if (gameState.timer === 0 || gameState.judge === user.displayName || gameState.roundOver) return;

    const timerInterval = setInterval(() => {
      setGameState((prevState) => ({
        ...prevState,
        timer: prevState.timer - 1,
      }));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState.timer, gameState.judge, user, gameState.roundOver]);

  const playCard = async () => {
    if (!selectedCard || !gameState || gameState.judge === user.displayName || gameState.roundOver) return;

    // Chama a função do cardService para remover a carta e atualizar o banco de dados
    await removePlayedCard("game-room-1", user, selectedCard, gameState);

    setSelectedCard(null); // Limpa a carta selecionada após jogar
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
  };

  const nextRound = async () => {
    const gameRef = doc(db, "games", "game-room-1");

    await updateDoc(gameRef, {
      playedCards: [],
      timer: 30,
      roundOver: false,
    });
  };

  const buyCards = async () => {
    const gameRef = doc(db, "games", "game-room-1");
    const randomWhiteCards = [...cardsData.whiteCards].sort(() => 0.5 - Math.random()).slice(0, 5 - gameState.whiteCards.length);

    await updateDoc(gameRef, {
      whiteCards: [...gameState.whiteCards, ...randomWhiteCards],
    });
  };

  return (
    <div>
      <h1>Jogo - Cartas Contra a Humanidade</h1>
      {gameState && <h2>Pergunta: {gameState.blackCard}</h2>}
      <div>
        <h3>Suas cartas:</h3>
        {gameState?.whiteCards?.map((card, index) => (
          gameState.judge !== user.displayName && !gameState.roundOver && (
            <button key={index} onClick={() => setSelectedCard(card)}>
              {card}
            </button>
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

      <button onClick={nextRound} disabled={!gameState.roundOver}>
        Próxima Rodada
      </button>

      <button onClick={buyCards} disabled={gameState.whiteCards.length >= 5 || gameState.roundOver}>
        Comprar Cartas
      </button>

      {gameState.winner && <h2>{gameState.winner} venceu a partida!</h2>}
    </div>
  );
}

export default Game;
