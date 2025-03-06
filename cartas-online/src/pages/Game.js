import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import cardsData from "../data/cards.json";

function Game() {
  const [gameState, setGameState] = useState({
    blackCard: "",
    whiteCards: [],
    playedCards: [],
    scores: {},
    judge: "", // Jogador que é o juiz da rodada
    winner: null,
    players: [], // Lista de jogadores
    timer: 30, // Temporizador de 30 segundos
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

  // Função para iniciar o temporizador de 30 segundos
  useEffect(() => {
    if (gameState.timer === 0 || gameState.judge === user.displayName) return;

    const timerInterval = setInterval(() => {
      setGameState((prevState) => ({
        ...prevState,
        timer: prevState.timer - 1,
      }));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState.timer, gameState.judge, user]);

  // Função para jogar uma carta
  const playCard = async () => {
    if (!selectedCard || !gameState || gameState.judge === user.displayName) return;

    const gameRef = doc(db, "games", "game-room-1");

    await updateDoc(gameRef, {
      playedCards: [...(gameState.playedCards || []), { user: user.displayName, card: selectedCard }],
    });

    setSelectedCard(null);
  };

  // Função para escolher o vencedor da rodada
  const chooseWinner = async (winningCard) => {
    if (!gameState || gameState.judge !== user.displayName) return;
    const gameRef = doc(db, "games", "game-room-1");

    // Incrementa a pontuação do jogador vencedor
    const updatedScores = {
      ...gameState.scores,
      [winningCard.user]: (gameState.scores[winningCard.user] || 0) + 1,
    };

    // Verifica se algum jogador alcançou 8 pontos e encerra o jogo
    const winner = Object.keys(updatedScores).find(player => updatedScores[player] >= 8);

    if (winner) {
      await updateDoc(gameRef, {
        winner: winner,
        scores: updatedScores,
        playedCards: [],
      });
    } else {
      // Passa para o próximo juiz (jogador à esquerda)
      const currentJudgeIndex = gameState.players.findIndex(player => player.name === gameState.judge);
      const nextJudge = gameState.players[(currentJudgeIndex + 1) % gameState.players.length].name;

      await updateDoc(gameRef, {
        judge: nextJudge,
        scores: updatedScores,
        playedCards: [],
      });
    }
  };

  // Função para comprar cartas (máximo 5)
  const buyCards = async () => {
    const gameRef = doc(db, "games", "game-room-1");
    const randomWhiteCards = [...cardsData.whiteCards].sort(() => 0.5 - Math.random()).slice(0, 5 - gameState.whiteCards.length);

    await updateDoc(gameRef, {
      whiteCards: [...gameState.whiteCards, ...randomWhiteCards],
    });
  };

  // Função para iniciar a próxima rodada
  const nextRound = async () => {
    const gameRef = doc(db, "games", "game-room-1");

    // Reseta o temporizador e as cartas jogadas
    await updateDoc(gameRef, {
      playedCards: [],
      timer: 30,
    });
  };

  return (
    <div>
      <h1>Jogo - Cartas Contra a Humanidade</h1>
      {gameState && <h2>Pergunta: {gameState.blackCard}</h2>}
      <div>
        <h3>Suas cartas:</h3>
        {/* O jogador não pode jogar se for o juiz */}
        {gameState?.whiteCards?.map((card, index) => (
          gameState.judge !== user.displayName && (
            <button key={index} onClick={() => setSelectedCard(card)}>
              {card}
            </button>
          )
        ))}
      </div>

      {/* Temporizador */}
      {gameState.timer > 0 ? (
        <div>
          <p>Tempo restante: {gameState.timer}s</p>
        </div>
      ) : (
        <div>
          <p>Tempo esgotado!</p>
        </div>
      )}

      <button onClick={playCard} disabled={!selectedCard || gameState.judge === user.displayName}>
        Jogar Carta
      </button>

      {gameState?.judge === user.displayName && (
        <div>
          <h3>Escolha a melhor resposta:</h3>
          {gameState?.playedCards?.map((card, index) => (
            <button key={index} onClick={() => chooseWinner(card)}>
              {card.card} - {card.user}
            </button>
          ))}
        </div>
      )}

      {gameState?.winner && (
        <div>
          <h2>Parabéns, {gameState.winner} venceu!</h2>
        </div>
      )}

      <button onClick={nextRound}>Próxima Rodada</button>

      <button onClick={buyCards} disabled={gameState.whiteCards.length >= 5}>
        Comprar Cartas
      </button>
    </div>
  );
}

export default Game;
