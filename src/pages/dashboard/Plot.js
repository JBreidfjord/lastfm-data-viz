import "./Plot.css";

import Close from "../../assets/close_fullscreen.svg";

export default function Plot({ children, handleFocus, user }) {
  return (
    <>
      <div className="fullscreen-title-bar">
        <div className="banner">
          <span>Data Viz</span>
        </div>
        <span>{user}</span>
      </div>
      <div className="plot fullscreen">
        {children}
        <img
          src={Close}
          onClick={() => handleFocus()}
          className="fullscreen-icon close"
          alt="Close Fullscreen"
        />
      </div>
    </>
  );
}
