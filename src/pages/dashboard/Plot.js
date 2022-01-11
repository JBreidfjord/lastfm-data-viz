import Close from "../../assets/close_fullscreen.svg";

export default function Plot({ children, handleFocus }) {
  return (
    <div className="plot fullscreen">
      {children}
      <img
        src={Close}
        onClick={() => handleFocus()}
        className="fullscreen-icon close"
        alt="Close Fullscreen"
      />
    </div>
  );
}
