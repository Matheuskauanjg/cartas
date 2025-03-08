// src/components/Scoreboard.jsx
import React from 'react';

const Scoreboard = ({ players }) => {
  return (
    <div className="scoreboard">
      {players.map((player, index) => (
        <div key={index}>
          {player.name}: {player.points} pontos
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;
