import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const { loginUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Wprowadź nazwę użytkownika i hasło.");
      return;
    }
    const success = await loginUser(e); 

    if (success) {
      setError("");
      navigate("/dashboard");
    } else {
      setError("Błędny login lub hasło.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Logowanie</h2>
        <p className="login-subtitle">Dostęp tylko dla Administratora</p>

        <form onSubmit={handleSubmit}>
          <label>Nazwa użytkownika</label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Wpisz login"
            required
          />

          <label>Hasło</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wpisz hasło"
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit">Zaloguj</button>
        </form>
      </div>
    </div>
  );
}