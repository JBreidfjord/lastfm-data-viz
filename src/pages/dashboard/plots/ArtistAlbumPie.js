import { animated, to, useTransition } from "react-spring";
import { useEffect, useState } from "react";

import { GradientPinkBlue } from "@visx/gradient";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { scaleOrdinal } from "@visx/scale";

export default function ArtistAlbumPie({ data }) {
  const [artists, setArtists] = useState(null);
  const [albums, setAlbums] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [getArtistColor, setGetArtistColor] = useState(null);
  const [getAlbumColor, setGetAlbumColor] = useState(null);

  const n = 10;

  useEffect(() => {
    let artists = {};
    let albums = {};

    // Get total scrobbles for each artist and album
    data.scrobbles.forEach((scrobble) => {
      if (artists[scrobble.artist]) {
        artists[scrobble.artist]["scrobbles"]++;
      } else {
        artists[scrobble.artist] = { scrobbles: 1 };
      }

      if (albums[scrobble.album]) {
        albums[scrobble.album]["scrobbles"]++;
      } else {
        albums[scrobble.album] = { scrobbles: 1, artist: scrobble.artist };
      }
    });

    // Reduce to array of top n artists
    artists = Object.entries(artists)
      .sort((a, b) => {
        return a[1]["scrobbles"] - b[1]["scrobbles"];
      })
      .slice(-n)
      .reduce((acc, [artistName, { scrobbles }]) => {
        acc.push({
          name: artistName,
          scrobbles,
          percent: (scrobbles / data.scrobbles.length) * 100,
        });
        return acc;
      }, []);

    // Move albums to sorted array, all albums are kept to display for a selected artist
    albums = Object.entries(albums)
      .sort((a, b) => {
        return a[1]["scrobbles"] - b[1]["scrobbles"];
      })
      .reduce((acc, [albumName, { scrobbles, artist }]) => {
        acc.push({
          title: albumName,
          artist,
          scrobbles,
          percent: (scrobbles / data.scrobbles.length) * 100,
        });
        return acc;
      }, []);

    setGetArtistColor(() =>
      scaleOrdinal({
        domain: artists.map(({ name }) => name),
        range: [...Array(n).keys()].map((i) => `rgba(255, 255, 255, ${i / n})`),
      })
    );
    setGetAlbumColor(() =>
      scaleOrdinal({
        domain: albums.slice(-n).map(({ title }) => title),
        range: [...Array(n).keys()].map((i) => `rgba(255, 255, 255, ${i / n})`),
      })
    );

    setArtists(artists);
    setAlbums(albums);
  }, [data]);

  const animate = true;
  const width = 400;
  const height = 400;
  const margin = { left: 20, top: 20, right: 20, bottom: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const donutThickness = 20;

  return artists && albums ? (
    <svg width={width} height={height}>
      <GradientPinkBlue id="gradient" />
      <rect rx={14} width={width} height={height} fill="url('#gradient')" />
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={selectedArtist ? artists.filter(({ name }) => name === selectedArtist) : artists}
          pieValue={(artist) => artist.percent}
          outerRadius={radius}
          innerRadius={radius - donutThickness}
          cornerRadius={3}
          padAngle={0.005}
        >
          {(pie) => (
            <AnimatedPie
              {...pie}
              animate={animate}
              getKey={(arc) => arc.data.name}
              onClickDatum={({ data: { name } }) =>
                animate &&
                setSelectedArtist(selectedArtist && selectedArtist === name ? null : name)
              }
              getColor={(arc) => getArtistColor(arc.data.name)}
            />
          )}
        </Pie>
        <Pie
          data={
            selectedArtist
              ? albums.filter(({ artist }) => artist === selectedArtist).slice(-n)
              : albums.slice(-n)
          }
          pieValue={(album) => album.percent}
          pieSortValues={() => -1}
          outerRadius={radius - donutThickness * 1.3}
        >
          {(pie) => (
            <AnimatedPie
              {...pie}
              animate={animate}
              getKey={({ data: { title } }) => title}
              getColor={({ data: { title } }) => getAlbumColor(title)}
            />
          )}
        </Pie>
      </Group>
    </svg>
  ) : null;
}

// react-spring transition definitions
const fromLeaveTransition = ({ endAngle }) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});

const enterUpdateTransition = ({ startAngle, endAngle }) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

const AnimatedPie = ({ animate, arcs, path, getKey, getColor, onClickDatum }) => {
  const transitions = useTransition(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForName = arc.endAngle - arc.startAngle >= 0.1;

    return (
      <g key={key}>
        <animated.path
          // compute interpolated path d attribute from intermediate angle values
          d={to([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            })
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
        />
        {hasSpaceForName && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill="white"
              x={centroidX}
              y={centroidY}
              dy="0.33em"
              fontSize={9}
              textAnchor="middle"
              pointerEvents="none"
            >
              {getKey(arc)}
            </text>
          </animated.g>
        )}
      </g>
    );
  });
};
