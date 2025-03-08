// src/components/Chat.jsx
import React, { useState } from 'react';

const Chat = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    onSendMessage(message);
    setMessage('');
  };

  return (
    <div className="chat">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite uma mensagem"
      />
      <button onClick={handleSend}>Enviar</button>
    </div>
  );
};

export default Chat;
