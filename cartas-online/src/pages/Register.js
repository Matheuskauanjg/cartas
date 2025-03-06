import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail } from "../firebase";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await signUpWithEmail(email, password, username);
      navigate("/lobby");
    } catch (error) {
      alert("Erro no cadastro: " + error.message);
    }
  };

  return (
    <div>
      <h1>Cadastrar</h1>
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          placeholder="Nome de usuário" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default Register;
