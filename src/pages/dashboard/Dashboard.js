import "./Dashboard.css";

import Plot from "./Plot";
import PlotList from "./PlotList";
import { useState } from "react";

export default function Dashboard({ scrobbleData }) {
  const [focus, setFocus] = useState(null);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      {focus ? (
        <Plot setFocus={setFocus}>{focus}</Plot>
      ) : (
        <PlotList data={scrobbleData} setFocus={setFocus} />
      )}
    </div>
  );
}
