import "./Authenticate.css";

import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { useState } from "react";

export default function Authenticate() {
  const [tab, setTab] = useState("login");

  return (
    <div className="auth">
      <ul>
        <li className={`tab ${tab === "login" ? "active" : null}`} onClick={() => setTab("login")}>
          Log In
        </li>
        <li
          className={`tab ${tab === "signup" ? "active" : null}`}
          onClick={() => setTab("signup")}
        >
          Sign Up
        </li>
      </ul>
      {tab === "login" ? <LoginForm /> : <SignupForm />}
    </div>
  );
}
