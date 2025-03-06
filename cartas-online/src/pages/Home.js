import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Cartas Contra a Humanidade Online</h1>
      <button onClick={() => navigate("/login")}>Entrar</button>
      <button onClick={() => navigate("/register")}>Cadastrar</button>
    </div>
  );
}

export default Home;
