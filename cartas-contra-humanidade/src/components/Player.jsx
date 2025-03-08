// src/components/Player.jsx
import React from 'react';

const Player = ({ name, points }) => {
  return (
    <div className="player">
      <h3>{name}</h3>
      <p>Pontos: {points}</p>
    </div>
  );
};

export default Player;
