// src/pages/GameRoom.jsx
import React, { useState } from 'react';
import PlayerList from '../components/PlayerList';
import CardDeck from '../components/CardDeck';

const GameRoom = () => {
  const [players, setPlayers] = useState([]);
  const [cards, setCards] = useState([]);

  const handleCardSelect = (card) => {
    console.log('Carta escolhida:', card);
  };

  return (
    <div>
      <h2>Sala de Jogo</h2>
      <PlayerList players={players} />
      <CardDeck cards={cards} onCardSelect={handleCardSelect} />
    </div>
  );
};

export default GameRoom;
