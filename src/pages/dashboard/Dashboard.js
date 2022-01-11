import "./Dashboard.css";

import Plot from "./Plot";
import PlotList from "./PlotList";
import { useState } from "react";

export default function Dashboard({ scrobbleData }) {
  const [focus, setFocus] = useState(null);

  return (
    <div className="dashboard">
      {focus ? (
        <Plot setFocus={setFocus}>{focus}</Plot>
      ) : (
        <>
          <h2>Dashboard</h2>
          <PlotList data={scrobbleData} setFocus={setFocus} />
        </>
      )}
    </div>
  );
}
