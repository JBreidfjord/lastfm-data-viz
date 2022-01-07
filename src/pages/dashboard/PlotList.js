import "./PlotList.css";

import Mainstream from "./plots/Mainstream";

export default function PlotList({ data }) {
  const plots = [<Mainstream data={data} />];

  return (
    <div className="plot-list">
      {plots.map((plot, i) => (
        <div key={i} className="plot">
          {plot}
        </div>
      ))}
    </div>
  );
}
