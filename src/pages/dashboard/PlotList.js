import "./PlotList.css";

import Open from "../../assets/open_fullscreen.svg";
import { ParentSize } from "@visx/responsive";
import ScrobblePie from "./plots/ScrobblePie";

export default function PlotList({ data, setFocus }) {
  const plots = [
    <ParentSize>
      {({ width, height }) => <ScrobblePie data={data} width={width} height={height} />}
    </ParentSize>,
  ];

  return (
    <div className="plot-list">
      {plots.map((plot, i) => (
        <>
          <div className="plot" key={i}>
            {plot}
            <img
              src={Open}
              onClick={() => setFocus(plot)}
              className="fullscreen-icon open"
              alt="Open Fullscreen"
            />
          </div>
        </>
      ))}
    </div>
  );
}
