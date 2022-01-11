import "./PlotList.css";

import Open from "../../assets/open_fullscreen.svg";
import { ParentSize } from "@visx/responsive";
import ScrobblePie from "./plots/ScrobblePie";
import { useState } from "react";

export default function PlotList({ data, handleFocus }) {
  const [showInfo, setShowInfo] = useState(false);

  const plots = [
    <ParentSize>
      {({ width, height }) => <ScrobblePie data={data} width={width} height={height} />}
    </ParentSize>,
  ];

  let timeout;
  const handleMove = () => {
    clearTimeout(timeout);
    if (!showInfo) {
      setShowInfo(true);
      timeout = setTimeout(() => setShowInfo(false), 3000);
    }
  };

  return (
    <div className="plot-list">
      {plots.map((plot, i) => (
        <>
          <div
            className="plot"
            key={i}
            onMouseMove={handleMove}
            onMouseLeave={() => setShowInfo(false)}
          >
            {plot}
            <img
              src={Open}
              onClick={() => handleFocus(plot)}
              className={"fullscreen-icon open" + (showInfo ? " visible" : " hidden")}
              alt="Open Fullscreen"
            />
          </div>
        </>
      ))}
    </div>
  );
}
