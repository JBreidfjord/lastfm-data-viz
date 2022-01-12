import "./PlotList.css";

import HistoryGrid from "./plots/HistoryGrid";
import Open from "../../assets/open_fullscreen.svg";
import { ParentSize } from "@visx/responsive";
import ScrobblePie from "./plots/ScrobblePie";
import { useState } from "react";

export default function PlotList({ data, handleFocus }) {
  const Plots = [ScrobblePie, HistoryGrid];

  const [showInfo, setShowInfo] = useState(Plots.map(() => false));

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

  const getElem = (Elem) => {
    return (
      <ParentSize>
        {({ width, height }) => <Elem data={data} width={width} height={height} />}
      </ParentSize>
    );
  };

  return (
    <div className="plot-list">
      {Plots.map((Plot, i) => (
        <>
          <div
            className="plot"
            key={i}
            onMouseMove={() => handleMove(i)}
            onMouseLeave={() => handleLeave(i)}
          >
            {getElem(Plot)}
            <img
              src={Open}
              onClick={() => handleFocus(getElem(Plot))}
              className={"fullscreen-icon open" + (showInfo[i] ? " visible" : " hidden")}
              alt="Open Fullscreen"
            />
          </div>
        </>
      ))}
    </div>
  );
}
