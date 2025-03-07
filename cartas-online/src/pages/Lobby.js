import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore"; // Importando o onSnapshot

function Lobby() {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPlayerInGame, setIsPlayerInGame] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser; // Obtém o usuário autenticado
  const gameRef = doc(db, "games", "game-room-1");

  // Função para adicionar o jogador ao jogo
  const addPlayerToLobby = async () => {
    if (!user) {
      navigate("/login"); // Redireciona para login se o usuário não estiver autenticado
      return;
    }

    try {
      const docSnap = await getDoc(gameRef);
      if (!docSnap.exists()) {
        console.log("Jogo não encontrado!");
        return;
      }

      const gameData = docSnap.data();
      const currentPlayers = gameData.players || [];
      const existingPlayer = currentPlayers.find(p => p.name === user.displayName);

      if (!existingPlayer) {
        const newPlayer = {
          name: user.displayName,
          score: 0,
        };
        await updateDoc(gameRef, { players: [...currentPlayers, newPlayer] });
      }
      setIsPlayerInGame(true); // Marca que o jogador entrou no lobby
    } catch (error) {
      console.error("Erro ao adicionar jogador ao lobby:", error);
    }
  };

  // Função para iniciar o jogo
  const startGame = async () => {
    try {
      await updateDoc(gameRef, { gameStarted: true });
      setGameStarted(true);
      navigate("/game"); // Redireciona para a página do jogo
    } catch (error) {
      console.error("Erro ao iniciar o jogo:", error);
    }
  };

  // Efeito para escutar atualizações no estado do jogo
  useEffect(() => {
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data();
        setPlayers(gameData.players || []);
        setGameStarted(gameData.gameStarted);
        setIsPlayerInGame(gameData.players.some(player => player.name === user.displayName));
      }
    });

    return () => unsubscribe();
  }, [gameRef, user]);

  return (
    <div>
      <h1>Lobby do Jogo - Cartas Contra a Humanidade</h1>
      <h2>Jogadores:</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player.name}</li>
        ))}
      </ul>

      {gameStarted ? (
        <p>O jogo já começou! Redirecionando para a sala de jogo...</p>
      ) : (
        <div>
          {!isPlayerInGame ? (
            <button onClick={addPlayerToLobby}>Entrar no jogo</button>
          ) : (
            <p>Você já entrou no jogo!</p>
          )}

          {players.length >= 2 && !isPlayerInGame && (
            <button onClick={startGame} disabled={players.length < 2}>
              Iniciar o Jogo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Lobby;
