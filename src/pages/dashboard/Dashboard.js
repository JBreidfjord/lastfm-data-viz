import "./Dashboard.css";

import PlotList from "./PlotList";

export default function Dashboard({ scrobbleData }) {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <PlotList data={scrobbleData} />
    </div>
  );
}
