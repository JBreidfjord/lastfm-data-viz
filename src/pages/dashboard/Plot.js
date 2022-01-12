import "./Plot.css";

import Close from "../../assets/close_fullscreen.svg";
import { useState } from "react";

export default function Plot({ children, handleFocus, user }) {
  const [showInfo, setShowInfo] = useState(false);

  let timeout;
  const handleMove = () => {
    clearTimeout(timeout);
    if (!showInfo) {
      setShowInfo(true);
      timeout = setTimeout(() => setShowInfo(false), 3000);
    }
  };

  return (
    <>
      <div className="fullscreen-title-bar">
        <div className="banner">
          <span>Data Viz</span>
        </div>
        <span>{user}</span>
      </div>
      <div
        className="plot fullscreen"
        onMouseMove={handleMove}
        onMouseLeave={() => setShowInfo(false)}
      >
        {children}
        <img
          src={Close}
          onClick={() => handleFocus()}
          className={"fullscreen-icon close" + (showInfo ? " visible" : " hidden")}
          alt="Close Fullscreen"
        />
      </div>
    </>
  );
}
