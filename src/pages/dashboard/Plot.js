import Close from "../../assets/close_fullscreen.svg";

export default function Plot({ children, setFocus }) {
  return (
    <div className="plot fullscreen">
      {children}
      <img
        src={Close}
        onClick={() => setFocus(null)}
        className="fullscreen-icon close"
        alt="Close Fullscreen"
      />
    </div>
  );
}
