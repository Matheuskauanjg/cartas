import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Nome do jogador
  const navigate = useNavigate(); // Hook de navegação

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login bem-sucedido!");
      navigate("/home"); // Redireciona para a página principal após login
    } catch (error) {
      alert("Erro no login. Tente novamente.");
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Cadastro bem-sucedido!");
      navigate("/home"); // Redireciona após cadastro
    } catch (error) {
      alert("Erro ao criar a conta. Tente novamente.");
    }
  };

  return (
    <div>
      <h1>Login ou Cadastro</h1>
      <div>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleLogin}>Entrar</button>
      <button onClick={handleSignUp}>Cadastrar</button>
    </div>
  );
};

export default Login;
