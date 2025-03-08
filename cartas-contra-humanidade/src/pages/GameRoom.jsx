// src/pages/GameRoom.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGameState } from '../firebase/gameService';

const GameRoom = () => {
  const { gameId } = useParams(); // Pega o ID da sala da URL
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
      <h1>Sala de Jogo: {gameState.name}</h1>
      <p>Estado da sala: {gameState.state}</p>
      {/* Adicione mais lógica aqui para a interação do jogo */}
    </div>
  );
};

export default GameRoom;
