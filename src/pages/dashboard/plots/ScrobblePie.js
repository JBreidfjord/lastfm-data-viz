import { TooltipWithBounds, defaultStyles, useTooltip } from "@visx/tooltip";
import { animated, to, useTransition } from "react-spring";
import { useEffect, useState } from "react";

import { GradientSteelPurple } from "@visx/gradient";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import Spinner from "../../../components/Spinner";
import { localPoint } from "@visx/event";
import { scaleOrdinal } from "@visx/scale";

export default function ScrobblePie({ data, width, height, isPreview }) {
  const [artists, setArtists] = useState(null);
  const [albums, setAlbums] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [activeArtists, setActiveArtists] = useState(null);
  const [activeAlbums, setActiveAlbums] = useState(null);
  const [activeTracks, setActiveTracks] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
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

      if (albums[scrobble.album + scrobble.artist]) {
        albums[scrobble.album + scrobble.artist]["scrobbles"]++;
      } else {
        albums[scrobble.album + scrobble.artist] = {
          scrobbles: 1,
          artist: scrobble.artist,
          title: scrobble.album,
        };
      }

      if (tracks[scrobble.title + scrobble.artist]) {
        tracks[scrobble.title + scrobble.artist]["scrobbles"]++;
      } else {
        tracks[scrobble.title + scrobble.artist] = {
          scrobbles: 1,
          artist: scrobble.artist,
          album: scrobble.album,
          title: scrobble.title,
        };
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
      .reduce((acc, [_, { scrobbles, artist, title }]) => {
        acc.push({
          title,
          artist,
          scrobbles,
          percent: (scrobbles / data.scrobbles.length) * 100,
        });
        return acc;
      }, []);

    // Move tracks to sorted array
    tracks = Object.entries(tracks)
      .sort(sortKey)
      .reduce((acc, [_, { scrobbles, artist, album, title }]) => {
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

  const handleClick = (artist, album = null) => {
    if (animate) {
      // selectedAlbum will be set to null if album is null so no additional check is required here
      setSelectedAlbum(album === selectedAlbum ? null : album);
      setSelectedArtist(!album && artist === selectedArtist ? null : artist);
    }
  };

  useEffect(() => {
    if (artists && albums && tracks) {
      setActiveArtists(
        selectedArtist ? artists.filter(({ name }) => name === selectedArtist) : artists
      );
      setActiveAlbums(
        selectedAlbum
          ? albums.filter(
              ({ title, artist }) => title === selectedAlbum && artist === selectedArtist
            )
          : selectedArtist
          ? albums.filter(({ artist }) => artist === selectedArtist)
          : albums
      );
      setActiveTracks(
        selectedAlbum
          ? tracks.filter(
              ({ album, artist }) => album === selectedAlbum && artist === selectedArtist
            )
          : selectedArtist
          ? tracks.filter(({ artist }) => artist === selectedArtist)
          : tracks
      );
    }
  }, [selectedArtist, selectedAlbum, artists, albums, tracks]);

  useEffect(() => {
    if (activeArtists && activeAlbums && activeTracks) {
      setGetArtistColor(() =>
        scaleOrdinal({
          domain: activeArtists.slice(-n).map(({ name }) => name),
          range: [...Array(n).keys()].map((i) => `rgba(225, 225, 225, ${(i + 1) / n / 1.5})`),
        })
      );
      setGetAlbumColor(() =>
        scaleOrdinal({
          domain: activeAlbums.slice(-n).map(({ title }) => title),
          range: [...Array(n).keys()].map((i) => `rgba(50, 50, 50, ${(i + 1) / n / 1.5})`),
        })
      );
      setGetTrackColor(() =>
        scaleOrdinal({
          domain: activeTracks.slice(-n).map(({ title }) => title),
          range: [...Array(n).keys()].map((i) => `rgba(0, 0, 0, ${(i + 1) / n / 1.5})`),
        })
      );
    }
  }, [activeArtists, activeAlbums, activeTracks]);

  const handleMouseOver = (e, data, type) => {
    const coords = localPoint(e.target.ownerSVGElement, e);
    let tooltipData;
    switch (type) {
      case "artist":
        tooltipData = (
          <>
            {data.name}
            <br />
            {data.scrobbles} scrobbles
            <br />
            {data.percent.toPrecision(3)}% of all scrobbles
          </>
        );
        break;
      case "album":
        tooltipData = (
          <>
            {data.title}
            <br />
            {data.artist}
            <br />
            {data.scrobbles} scrobbles
            <br />
            {data.percent.toPrecision(3)}% of all scrobbles
            {selectedArtist && !selectedAlbum && (
              <>
                <br />
                {(
                  (data.scrobbles /
                    activeAlbums.reduce((acc, { scrobbles }) => (acc += scrobbles), 0)) *
                  100
                ).toPrecision(3)}
                % of {selectedArtist} scrobbles
              </>
            )}
          </>
        );
        break;
      case "track":
        tooltipData = (
          <>
            {data.title}
            <br />
            {data.album}
            <br />
            {data.artist}
            <br />
            {data.scrobbles} scrobbles
            <br />
            {data.percent.toPrecision(3)}% of all scrobbles
            {selectedAlbum ? (
              <>
                <br />
                {(
                  (data.scrobbles /
                    activeTracks.reduce((acc, { scrobbles }) => (acc += scrobbles), 0)) *
                  100
                ).toPrecision(3)}
                % of {selectedAlbum} scrobbles
              </>
            ) : (
              selectedArtist && (
                <>
                  <br />
                  {(
                    (data.scrobbles /
                      activeTracks.reduce((acc, { scrobbles }) => (acc += scrobbles), 0)) *
                    100
                  ).toPrecision(3)}
                  % of {selectedArtist} scrobbles
                </>
              )
            )}
          </>
        );
        break;
      default:
        tooltipData = <>Error</>;
    }
    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData,
    });
  };

  const tooltipStyles = {
    ...defaultStyles,
    opacity: 0.9,
    margin: "0 auto",
  };

  const animate = true;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const outerDonutThickness = innerHeight / 15;
  const innerDonutThickness = innerHeight / 15;
  const gapSize = innerHeight / 60;

  return activeArtists && activeAlbums && getArtistColor && getAlbumColor ? (
    <>
      <svg width={width} height={height}>
        <GradientSteelPurple id="album-artist-pie-gradient" />
        <rect rx={14} width={width} height={height} fill="url('#album-artist-pie-gradient')" />
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          {/* Artists - Outer Donut */}
          <Pie
            data={activeArtists.slice(-n)}
            pieValue={(artist) => artist.percent}
            outerRadius={radius}
            innerRadius={radius - outerDonutThickness}
            cornerRadius={3}
            padAngle={0.005}
          >
            {(pie) => (
              <AnimatedPie
                {...pie}
                type="artist"
                animate={animate}
                isPreview={isPreview}
                getKey={(arc) => arc.data.name}
                onClickDatum={({ data: { name } }) => handleClick(name)}
                getColor={(arc) => getArtistColor(arc.data.name)}
                onMouseOverDatum={(e, { data }) => {
                  handleMouseOver(e, data, "artist");
                }}
                onMouseLeave={hideTooltip}
              />
            )}
          </Pie>

          {/* Albums - Inner Donut */}
          <Pie
            data={activeAlbums.slice(-n)}
            pieValue={(album) => album.percent}
            outerRadius={radius - outerDonutThickness - gapSize}
            innerRadius={radius - outerDonutThickness - gapSize - innerDonutThickness}
            cornerRadius={3}
            padAngle={0.005}
          >
            {(pie) => (
              <AnimatedPie
                {...pie}
                type="album"
                animate={animate}
                isPreview={isPreview}
                getKey={(arc) => arc.data.title}
                getColor={(arc) => getAlbumColor(arc.data.title)}
                onClickDatum={({ data: { artist, title } }) => handleClick(artist, title)}
                onMouseOverDatum={(e, { data }) => {
                  handleMouseOver(e, data, "album");
                }}
                onMouseLeave={hideTooltip}
              />
            )}
          </Pie>

          {/* Tracks - Inner Circle */}
          <Pie
            data={activeTracks.slice(-n)}
            pieValue={(album) => album.percent}
            outerRadius={radius - outerDonutThickness - innerDonutThickness - gapSize * 2}
          >
            {(pie) => (
              <AnimatedPie
                {...pie}
                type="track"
                animate={animate}
                isPreview={isPreview}
                getKey={({ data: { title } }) => title}
                getColor={({ data: { title } }) => getTrackColor(title)}
                onClickDatum={({ data: { artist, album } }) => handleClick(artist, album)}
                onMouseOverDatum={(e, { data }) => {
                  handleMouseOver(e, data, "track");
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
    </>
  ) : (
    <Spinner />
  );
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
  isPreview,
  type,
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
    // const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForName = arc.endAngle - arc.startAngle >= key.length / (isPreview ? 15 : 100);

    const center = (arc.startAngle + arc.endAngle) / 2;
    // const rotationAngle =
    //   center * (180 / Math.PI) + (center > Math.PI / 2 && center < (3 * Math.PI) / 2 ? 180 : 0);
    // const flip = center > Math.PI / 2 && center < (3 * Math.PI) / 2;
    if (key === "Arcarsenal") {
      console.log(arc);
    }

    const offset =
      center < Math.PI / 2 || center > (3 * Math.PI) / 2
        ? ""
        : type === "track"
        ? center > Math.PI
          ? "23%"
          : "64%"
        : "53%";

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
            <path id={`${key}-curve`} d={path(arc)} fill="none" stroke="none" />
            <text
              fill="white"
              // x={centroidX}
              // y={centroidY}
              dy="1em"
              dx="0.5em"
              fontSize={9}
              // textAnchor="middle"
              // transform={`rotate(${rotationAngle}, ${centroidX}, ${centroidY})`}
              // transform={flip ? "scale(-1, -1)" : ""}
              pointerEvents="none"
            >
              <textPath xlinkHref={`#${key}-curve`} startOffset={offset}>
                {key}
              </textPath>
            </text>
          </animated.g>
        )}
      </g>
    );
  });
};
