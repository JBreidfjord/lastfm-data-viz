import { useLogin } from "../../hooks/useLogin";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isPending } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Log In</h2>
      <label>
        <span>Email:</span>
        <input type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
      </label>

      <label>
        <span>Password:</span>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />
      </label>

      {isPending ? (
        <button className="btn" disabled>
          Loading
        </button>
      ) : (
        <button className="btn">Submit</button>
      )}
      {error && <div className="error">{error}</div>}
    </form>
  );
}
