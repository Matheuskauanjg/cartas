// src/pages/Lobby.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGameState } from '../firebase/gameService'; // Corrija a importação para getGameState

const Lobby = () => {
  const { gameId } = useParams(); // Pega o gameId da URL
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const fetchGameState = async () => {
      const state = await getGameState(gameId);
      setGameState(state);
    };

    fetchGameState();
  }, [gameId]);

  if (!gameState) {
    return <div>Carregando a sala...</div>;
  }

  return (
    <div>
      <h1>Bem-vindo à Sala de Jogo!</h1>
      <p>Nome da Sala: {gameState.name}</p>
      <p>Status da Sala: {gameState.state}</p>
      {/* Aqui você pode adicionar mais interações ou detalhes sobre o estado da sala */}
    </div>
  );
};

export default Lobby;
