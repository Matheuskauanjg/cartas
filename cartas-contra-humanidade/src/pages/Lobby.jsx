import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGameState, startGameIfReady } from '../firebase/gameService'; // Importando a função para iniciar o jogo

const Lobby = () => {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const fetchGameState = async () => {
      const state = await getGameState(gameId);
      setGameState(state);
    };

    fetchGameState();
  }, [gameId]);

  const handleStartGame = async () => {
    if (gameState.players.length >= 3) {
      // Chama a função que verifica se o jogo pode começar
      await startGameIfReady(gameId);
      // Atualiza o estado local, para que o botão desapareça depois de iniciar o jogo
      setGameState(prevState => ({ ...prevState, state: 'started' }));
    }
  };

  if (!gameState) {
    return <div>Carregando a sala...</div>;
  }

  return (
    <div>
      <h1>Bem-vindo à Sala de Jogo!</h1>
      <p>Nome da Sala: {gameState.name}</p>
      <p>Status da Sala: {gameState.state}</p>
      <h3>Jogadores na sala:</h3>
      <ul>
        {gameState.players.map((player, index) => (
          <li key={index}>{player.name}</li>
        ))}
      </ul>
      {gameState.state === "waiting" && gameState.players.length >= 3 && (
        <button onClick={handleStartGame}>Iniciar Jogo</button>
      )}
    </div>
  );
};

export default Lobby;
