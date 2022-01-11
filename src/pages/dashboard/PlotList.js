import "./PlotList.css";

import { ParentSize } from "@visx/responsive";
import ScrobblePie from "./plots/ScrobblePie";

export default function PlotList({ data }) {
  const plots = [
    <ParentSize>
      {({ width, height }) => <ScrobblePie data={data} width={width} height={height} />}
    </ParentSize>,
  ];
  return (
    <div className="plot-list">
      {plots.map((plot, i) => (
        <div key={i}>{plot}</div>
      ))}
    </div>
  );
}
