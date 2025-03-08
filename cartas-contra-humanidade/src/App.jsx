// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';
import Lobby from './pages/Lobby';
import NotFound from './pages/NotFound';

const App = () => {
  const [players, setPlayers] = useState([]);

  const startGame = () => {
    console.log('Jogo Iniciado');
    // Lógica para iniciar o jogo
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game-room" element={<GameRoom />} />
        <Route path="/lobby" element={<Lobby players={players} onStartGame={startGame} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
