// src/components/Judge.jsx
import React, { useState } from 'react';

const Judge = ({ cards, onChooseWinner }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  const handleSubmit = () => {
    onChooseWinner(selectedCard);
  };

  return (
    <div className="judge">
      <h2>Escolha a melhor carta!</h2>
      <div>
        {cards.map((card, index) => (
          <div key={index} onClick={() => handleCardSelect(card)}>
            {card.text}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>Escolher vencedora</button>
    </div>
  );
};

export default Judge;
