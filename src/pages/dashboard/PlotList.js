import "./PlotList.css";

import Open from "../../assets/open_fullscreen.svg";
import { ParentSize } from "@visx/responsive";
import ScrobblePie from "./plots/ScrobblePie";
import { useState } from "react";

export default function PlotList({ data, handleFocus }) {
  const plots = [
    <ParentSize>
      {({ width, height }) => <ScrobblePie data={data} width={width} height={height} />}
    </ParentSize>,
    <ParentSize>
      {({ width, height }) => <ScrobblePie data={data} width={width} height={height} />}
    </ParentSize>,
  ];

  const [showInfo, setShowInfo] = useState(plots.map(() => false));

  let timeout;
  const handleMove = (i) => {
    clearTimeout(timeout);
    if (!showInfo[i]) {
      setShowInfo((prevShowInfo) => prevShowInfo.map((prev, j) => (j === i ? true : prev)));
      timeout = setTimeout(() => handleLeave(i), 3000);
    }
  };

  const handleLeave = (i) => {
    clearTimeout(timeout);
    setShowInfo((prevShowInfo) => prevShowInfo.map((prev, j) => (j === i ? false : prev)));
  };

  return (
    <div className="plot-list">
      {plots.map((plot, i) => (
        <>
          <div
            className="plot"
            key={i}
            onMouseMove={() => handleMove(i)}
            onMouseLeave={() => handleLeave(i)}
          >
            {plot}
            <img
              src={Open}
              onClick={() => handleFocus(plot)}
              className={"fullscreen-icon open" + (showInfo[i] ? " visible" : " hidden")}
              alt="Open Fullscreen"
            />
          </div>
        </>
      ))}
    </div>
  );
}
