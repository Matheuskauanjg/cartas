import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";  // Importando o componente de Login
import Home from "./pages/Home";    // Importando a página inicial do jogo
import Lobby from "./pages/Lobby";  // Importando a página da sala do jogo
import NotFound from "./pages/NotFound";  // Página 404

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  {/* Página de Login */}
        <Route path="/home" element={<Home />} /> {/* Página principal */}
        <Route path="/lobby/:gameId" element={<Lobby />} /> {/* Sala do jogo */}
        <Route path="*" element={<NotFound />} />  {/* Página 404 */}
      </Routes>
    </Router>
  );
};

export default App;
