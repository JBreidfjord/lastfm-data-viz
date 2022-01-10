import { TooltipWithBounds, defaultStyles, useTooltip } from "@visx/tooltip";
import { animated, to, useTransition } from "react-spring";
import { useEffect, useState } from "react";

import { GradientSteelPurple } from "@visx/gradient";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { localPoint } from "@visx/event";
import { scaleOrdinal } from "@visx/scale";

export default function ScrobblePie({ data, width, height }) {
  const [artists, setArtists] = useState(null);
  const [albums, setAlbums] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [activeArtists, setActiveArtists] = useState(null);
  const [activeAlbums, setActiveAlbums] = useState(null);
  const [activeTracks, setActiveTracks] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [getArtistColor, setGetArtistColor] = useState(null);
  const [getAlbumColor, setGetAlbumColor] = useState(null);
  const [getTrackColor, setGetTrackColor] = useState(null);
  const { showTooltip, hideTooltip, tooltipLeft, tooltipTop, tooltipData, tooltipOpen } =
    useTooltip();

  const n = 10;

  useEffect(() => {
    let artists = {};
    let albums = {};
    let tracks = {};

    // Get total scrobbles for each artist, album, and track
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

      if (tracks[scrobble.title]) {
        tracks[scrobble.title]["scrobbles"]++;
      } else {
        tracks[scrobble.title] = { scrobbles: 1, artist: scrobble.artist, album: scrobble.album };
      }
    });

    const sortKey = (a, b) => a[1]["scrobbles"] - b[1]["scrobbles"];

    // Move artists to sorted array
    artists = Object.entries(artists)
      .sort(sortKey)
      .reduce((acc, [artistName, { scrobbles }]) => {
        acc.push({
          name: artistName,
          scrobbles,
          percent: (scrobbles / data.scrobbles.length) * 100,
        });
        return acc;
      }, []);

    // Move albums to sorted array
    albums = Object.entries(albums)
      .sort(sortKey)
      .reduce((acc, [albumName, { scrobbles, artist }]) => {
        acc.push({
          title: albumName,
          artist,
          scrobbles,
          percent: (scrobbles / data.scrobbles.length) * 100,
        });
        return acc;
      }, []);

    // Move tracks to sorted array
    tracks = Object.entries(tracks)
      .sort(sortKey)
      .reduce((acc, [title, { scrobbles, artist, album }]) => {
        acc.push({
          title,
          artist,
          album,
          scrobbles,
          percent: (scrobbles / data.scrobbles.length) * 100,
        });
        return acc;
      }, []);

    setArtists(artists);
    setAlbums(albums);
    setTracks(tracks);
  }, [data]);

  const handleClick = (artist) => {
    if (animate) {
      setSelectedArtist(selectedArtist && selectedArtist === artist ? null : artist);
    }
  };

  useEffect(() => {
    if (artists && albums && tracks) {
      setActiveArtists(
        selectedArtist ? artists.filter(({ name }) => name === selectedArtist) : artists.slice(-n)
      );
      setActiveAlbums(
        selectedArtist
          ? albums.filter(({ artist }) => artist === selectedArtist).slice(-n)
          : albums.slice(-n)
      );
      setActiveTracks(
        selectedArtist
          ? tracks.filter(({ artist }) => artist === selectedArtist).slice(-n)
          : tracks.slice(-n)
      );
    }
  }, [selectedArtist, artists, albums, tracks]);

  useEffect(() => {
    if (activeArtists && activeAlbums && activeTracks) {
      setGetArtistColor(() =>
        scaleOrdinal({
          domain: activeArtists.map(({ name }) => name),
          range: [...Array(activeArtists.length).keys()].map(
            (i) => `rgba(225, 225, 225, ${(i + 1) / activeArtists.length / 1.5})`
          ),
        })
      );
      setGetAlbumColor(() =>
        scaleOrdinal({
          domain: activeAlbums.map(({ title }) => title),
          range: [...Array(activeAlbums.length).keys()].map(
            (i) => `rgba(50, 50, 50, ${(i + 1) / activeAlbums.length / 1.5})`
          ),
        })
      );
      setGetTrackColor(() =>
        scaleOrdinal({
          domain: activeTracks.map(({ title }) => title),
          range: [...Array(activeTracks.length).keys()].map(
            (i) => `rgba(0, 0, 0, ${(i + 1) / activeTracks.length / 1.5})`
          ),
        })
      );
    }
  }, [activeArtists, activeAlbums, activeTracks]);

  const handleMouseOver = (e, key, percent) => {
    const coords = localPoint(e.target.ownerSVGElement, e);
    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: (
        <>
          {key}
          <br />
          {percent}%
        </>
      ),
    });
  };

  const tooltipStyles = {
    ...defaultStyles,
    opacity: 0.9,
    margin: "0 auto",
  };

  const animate = true;
  const margin = { left: 20, top: 20, right: 20, bottom: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const outerDonutThickness = 40;
  const innerDonutThickness = 40;
  const gapSize = 10;

  return activeArtists && activeAlbums && getArtistColor && getAlbumColor ? (
    <div className="plot">
      <svg width={width} height={height}>
        <GradientSteelPurple id="album-artist-pie-gradient" />
        <rect rx={14} width={width} height={height} fill="url('#album-artist-pie-gradient')" />
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          {/* Artists - Outer Donut */}
          <Pie
            data={
              selectedArtist
                ? artists.filter(({ name }) => name === selectedArtist).slice(-n)
                : artists.slice(-n)
            }
            pieValue={(artist) => artist.percent}
            outerRadius={radius}
            innerRadius={radius - outerDonutThickness}
            cornerRadius={3}
            padAngle={0.005}
          >
            {(pie) => (
              <AnimatedPie
                {...pie}
                animate={animate}
                getKey={(arc) => arc.data.name}
                onClickDatum={({ data: { name } }) => handleClick(name)}
                getColor={(arc) => getArtistColor(arc.data.name)}
                onMouseOverDatum={(e, { data: { name, percent } }) => {
                  handleMouseOver(e, name, percent.toPrecision(3));
                }}
                onMouseLeave={hideTooltip}
              />
            )}
          </Pie>

          {/* Albums - Inner Donut */}
          <Pie
            data={
              selectedArtist
                ? albums.filter(({ artist }) => artist === selectedArtist).slice(-n)
                : albums.slice(-n)
            }
            pieValue={(album) => album.percent}
            outerRadius={radius - outerDonutThickness - gapSize}
            innerRadius={radius - outerDonutThickness - gapSize - innerDonutThickness}
            cornerRadius={3}
            padAngle={0.005}
          >
            {(pie) => (
              <AnimatedPie
                {...pie}
                animate={animate}
                getKey={(arc) => arc.data.title}
                getColor={(arc) => getAlbumColor(arc.data.title)}
                onClickDatum={({ data: { artist } }) => handleClick(artist)}
                onMouseOverDatum={(e, { data: { title, artist, percent } }) => {
                  handleMouseOver(
                    e,
                    selectedArtist ? title : `${title} - ${artist}`,
                    percent.toPrecision(3)
                  );
                }}
                onMouseLeave={hideTooltip}
              />
            )}
          </Pie>

          {/* Tracks - Inner Circle */}
          <Pie
            data={
              selectedArtist
                ? tracks.filter(({ artist }) => artist === selectedArtist).slice(-n)
                : tracks.slice(-n)
            }
            pieValue={(album) => album.percent}
            outerRadius={radius - outerDonutThickness - innerDonutThickness - gapSize * 2}
          >
            {(pie) => (
              <AnimatedPie
                {...pie}
                animate={animate}
                getKey={({ data: { title } }) => title}
                getColor={({ data: { title } }) => getTrackColor(title)}
                onClickDatum={({ data: { artist } }) => handleClick(artist)}
                onMouseOverDatum={(e, { data: { title, artist, percent } }) => {
                  handleMouseOver(
                    e,
                    selectedArtist ? title : `${title} - ${artist}`,
                    percent.toPrecision(3)
                  );
                }}
                onMouseLeave={hideTooltip}
              />
            )}
          </Pie>
        </Group>
      </svg>
      {tooltipOpen && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          {tooltipData}
        </TooltipWithBounds>
      )}
    </div>
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

const AnimatedPie = ({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum = () => {},
  onMouseOverDatum = () => {},
  onMouseLeave = () => {},
}) => {
  const transitions = useTransition(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForName = arc.endAngle - arc.startAngle >= key.length / 25;

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
          onMouseEnter={(e) => onMouseOverDatum(e, arc)}
          onMouseLeave={onMouseLeave}
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
