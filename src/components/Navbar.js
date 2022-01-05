import "./Navbar.css";

import { NavLink } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";

export default function Navbar() {
  const { user } = useAuthContext();
  const { logout } = useLogout();

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
            <button className="btn" onClick={logout}>
              Logout
            </button>
          </li>
        ) : (
          <li>
            <NavLink to="/authenticate">Log In | Sign Up</NavLink>
          </li>
        )}
      </ul>
    </div>
  );
}
