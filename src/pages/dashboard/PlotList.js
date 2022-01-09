import "./PlotList.css";

import ArtistAlbumPie from "./plots/ArtistAlbumPie";
import { ParentSize } from "@visx/responsive";

export default function PlotList({ data }) {
  const plots = [
    <ParentSize>
      {({ width, height }) => <ArtistAlbumPie data={data} width={width} height={height} />}
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
