import { useSignup } from "../../hooks/useSignup";
import { useState } from "react";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { signup, error, isPending } = useSignup();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(displayName, email, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <label>
        <span>Username:</span>
        <input
          type="text"
          onChange={(e) => setDisplayName(e.target.value)}
          value={displayName}
          required
        />
      </label>

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
