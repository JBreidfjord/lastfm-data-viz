import "./Spinner.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

import { Bars } from "react-loader-spinner";

export default function Spinner({ height = 60, width = 60 }) {
  return (
    <div className="loading-spinner">
      <Bars width={width} height={height} color="black" />
    </div>
  );
}
