// src/components/Hand.jsx
import React from 'react';
import Card from './Card';

const Hand = ({ hand, onCardSelect }) => {
  return (
    <div className="hand">
      {hand.map((card, index) => (
        <Card key={index} text={card.text} onClick={() => onCardSelect(card)} />
      ))}
    </div>
  );
};

export default Hand;
