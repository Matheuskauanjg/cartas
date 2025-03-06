import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, logout } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

function Lobby() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div>
      <h1>Lobby</h1>
      {user ? <p>Jogador: {user.displayName}</p> : <p>Carregando...</p>}
      <button onClick={() => navigate("/game")}>Entrar no Jogo</button>
      <button onClick={logout}>Sair</button>
    </div>
  );
}

export default Lobby;
