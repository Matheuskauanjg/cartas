// src/components/PlayerList.jsx
import React from 'react';

const PlayerList = ({ players }) => {
  return (
    <div className="player-list">
      {players.map((player, index) => (
        <div key={index}>
          {player.name}: {player.points} pontos
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
