import "./Home.css";

import { useState } from "react";

export default function Home() {
  const [lastfmUsername, setLastfmUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: check if user data is already in storage
    // TODO: request data from last.fm API
  };

  return (
    <div>
      <h2>Data Viz</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Last.FM Username</span>
          <input
            type="text"
            onChange={(e) => setLastfmUsername(e.target.value)}
            value={lastfmUsername}
            required
          />
        </label>
        <button className="btn">Fetch Data</button>
      </form>
    </div>
  );
}
