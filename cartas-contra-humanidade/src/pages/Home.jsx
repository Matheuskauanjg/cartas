// src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGameRoom } from '../firebase/gameService';  // Verifique se a função está correta

const Home = () => {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (roomName) {
      const gameId = await createGameRoom(roomName); // Cria a sala
      navigate(`/lobby/${gameId}`); // Redireciona para o lobby da sala de jogo
    } else {
      alert('Por favor, insira um nome para a sala');
    }
  };

  return (
    <div>
      <h1>Bem-vindo ao jogo "Cartas Contra a Humanidade"</h1>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Digite o nome da sala"
      />
      <button onClick={handleCreateRoom}>Entrar na Sala de Jogo</button>
    </div>
  );
};

export default Home;
