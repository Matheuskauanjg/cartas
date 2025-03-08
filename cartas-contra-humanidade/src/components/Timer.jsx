// src/components/Timer.jsx
import React, { useState, useEffect } from 'react';

const Timer = ({ timeLimit, onTimeUp }) => {
  const [time, setTime] = useState(timeLimit);

  useEffect(() => {
    const timer = time > 0 && setInterval(() => setTime(time - 1), 1000);
    if (time === 0) onTimeUp();
    return () => clearInterval(timer);
  }, [time]);

  return <div>{time} segundos restantes</div>;
};

export default Timer;
