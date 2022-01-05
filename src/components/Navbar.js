import "./Navbar.css";

import { NavLink } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

export default function Navbar() {
  const { user } = useAuthContext();

  return (
    <div className="navbar">
      <ul>
        <li className="banner">
          <NavLink to="/">
            <span>Data Viz</span>
          </NavLink>
        </li>
        {user ? (
          <li>
            <button className="btn">Logout</button>
          </li>
        ) : (
          <>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
            <li>
              <NavLink to="/signup">Signup</NavLink>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
