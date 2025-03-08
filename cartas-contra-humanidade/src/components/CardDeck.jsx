// src/components/CardDeck.jsx
import React from 'react';
import Card from './Card';

const CardDeck = ({ cards, onCardSelect }) => {
  return (
    <div className="card-deck">
      {cards.map((card, index) => (
        <Card key={index} text={card.text} onClick={() => onCardSelect(card)} />
      ))}
    </div>
  );
};

export default CardDeck;
