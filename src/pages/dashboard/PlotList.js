import "./PlotList.css";

import ArtistAlbumPie from "./plots/ArtistAlbumPie";

export default function PlotList({ data }) {
  const plots = [<ArtistAlbumPie data={data} />];

  return (
    <div className="plot-list">
      {plots.map((plot, i) => (
        <div key={i} className="plot">
          {plot}
        </div>
      ))}
    </div>
  );
}
