import "./Navbar.css";

import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar">
      <ul>
        <li className="banner">
          <NavLink to="/">
            <span>Data Viz</span>
          </NavLink>
        </li>
        <li>
          <button className="btn">Logout</button>
        </li>
        <li>
          <NavLink to="/login">Login</NavLink>
        </li>
        <li>
          <NavLink to="/signup">Signup</NavLink>
        </li>
      </ul>
    </div>
  );
}
