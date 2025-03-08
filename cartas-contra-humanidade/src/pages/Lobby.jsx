// src/pages/Lobby.jsx
import React from 'react';
import PlayerList from '../components/PlayerList';

const Lobby = ({ players, onStartGame }) => {
  return (
    <div>
      <h2>Lobby - Aguarde o início do jogo</h2>
      <PlayerList players={players} />
      <button onClick={onStartGame}>Iniciar Jogo</button>
    </div>
  );
};

export default Lobby;
