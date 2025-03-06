import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import cardsData from "../data/cards.json";

function Game() {
  const [gameState, setGameState] = useState({
    blackCard: "",
    whiteCards: [],
    playedCards: [] // Inicializa playedCards como array vazio
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

    // Verificar se o documento já existe
    const fetchGameState = async () => {
      const docSnap = await getDoc(gameRef);

      if (!docSnap.exists()) {
        // Se o documento não existe, cria um novo documento com as cartas iniciais
        const randomBlackCard = cardsData.blackCards[Math.floor(Math.random() * cardsData.blackCards.length)];
        const randomWhiteCards = [...cardsData.whiteCards]
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

        await setDoc(gameRef, {
          blackCard: randomBlackCard,
          whiteCards: randomWhiteCards,
          playedCards: [],
          scores: {},
          judge: user.displayName,
          winner: null,
        });

        setGameState({
          blackCard: randomBlackCard,
          whiteCards: randomWhiteCards,
          playedCards: [],
        });
      } else {
        // Se o documento já existe, atualiza o estado com os dados do Firestore
        setGameState(docSnap.data());
      }
    };

    fetchGameState();

    // Inscrição para ouvir mudanças no documento
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        setGameState((prevState) => ({
          ...prevState,
          ...doc.data(),
          playedCards: doc.data()?.playedCards || []
        }));
      }
    });

    return () => unsubscribe();
  }, [navigate, user]);

  const playCard = async () => {
    if (!selectedCard || !gameState) return;
    const gameRef = doc(db, "games", "game-room-1");

    // Garantir que playedCards seja um array antes de adicionar
    await updateDoc(gameRef, {
      playedCards: [...(gameState.playedCards || []), { user: user.displayName, card: selectedCard }]
    });

    setSelectedCard(null);
  };

  const chooseWinner = async (winningCard) => {
    if (!gameState || gameState.judge !== user.displayName) return;
    const gameRef = doc(db, "games", "game-room-1");
    await updateDoc(gameRef, {
      winner: winningCard.user,
      scores: {
        ...gameState.scores,
        [winningCard.user]: (gameState.scores[winningCard.user] || 0) + 1,
      },
      playedCards: [], // Limpar as cartas jogadas após escolher o vencedor
    });
  };

  return (
    <div>
      <h1>Jogo</h1>
      {gameState && <h2>Pergunta: {gameState.blackCard}</h2>}
      <div>
        <h3>Suas cartas:</h3>
        {gameState?.whiteCards?.map((card, index) => (
          <button key={index} onClick={() => setSelectedCard(card)}>
            {card}
          </button>
        ))}
      </div>
      <button onClick={playCard} disabled={!selectedCard}>Jogar Carta</button>

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
    </div>
  );
}

export default Game;
