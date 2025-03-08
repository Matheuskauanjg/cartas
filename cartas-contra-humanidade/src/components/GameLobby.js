// src/pages/GameLobby.js (ou qualquer nome que preferir)

import React, { useEffect, useState } from 'react';
import { createGameRoom, getGameState } from '../firebase/gameService'; // Funções que criam e pegam salas
import { useHistory } from 'react-router-dom'; // Para redirecionar após a criação/entrada na sala

const GameLobby = () => {
  const [rooms, setRooms] = useState([]); // Armazena as salas existentes
  const [roomName, setRoomName] = useState(''); // Nome da nova sala
  const history = useHistory(); // Hook para navegação

  // Função para carregar todas as salas existentes
  const fetchRooms = async () => {
    // Aqui, você pode buscar as salas diretamente da coleção 'games' no Firestore
    const querySnapshot = await getDocs(gamesRef);
    const roomsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setRooms(roomsData);
  };

  // Criar uma nova sala
  const handleCreateRoom = async () => {
    if (roomName.trim() !== '') {
      const gameId = await createGameRoom(roomName); // Cria a sala
      if (gameId) {
        history.push(`/lobby/${gameId}`); // Redireciona para o lobby da nova sala
      }
    } else {
      alert('Por favor, insira um nome para a sala!');
    }
  };

  // Entrar em uma sala existente
  const handleJoinRoom = (gameId) => {
    history.push(`/lobby/${gameId}`); // Redireciona para o lobby da sala existente
  };

  useEffect(() => {
    fetchRooms(); // Carrega as salas disponíveis ao carregar o componente
  }, []);

  return (
    <div>
      <h1>Salas de Jogo</h1>
      <div>
        <h3>Criar uma Nova Sala</h3>
        <input
          type="text"
          placeholder="Nome da Sala"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button onClick={handleCreateRoom}>Criar Sala</button>
      </div>

      <h3>Salas Disponíveis</h3>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <span>{room.name}</span>
            <button onClick={() => handleJoinRoom(room.id)}>Entrar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameLobby;
