// src/components/Card.jsx
import React from 'react';
import './Card.css';

const Card = ({ text, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      {text}
    </div>
  );
};

export default Card;
