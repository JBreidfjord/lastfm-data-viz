import "./Dashboard.css";

import Plot from "./Plot";
import PlotList from "./PlotList";
import { useState } from "react";

export default function Dashboard({ scrobbleData, setShowNav }) {
  const [focus, setFocus] = useState(null);

  const handleFocus = (focus = null) => {
    setFocus(focus);
    setShowNav(focus === null);
  };

  return (
    <div className="dashboard">
      {focus ? (
        <Plot handleFocus={handleFocus}>{focus}</Plot>
      ) : (
        <>
          <h2>Dashboard</h2>
          <PlotList data={scrobbleData} handleFocus={handleFocus} />
        </>
      )}
    </div>
  );
}
