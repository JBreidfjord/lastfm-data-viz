import { useEffect, useState } from "react";

import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { Text } from "@visx/text";

export default function ArtistAlbumPie({ data }) {
  const [artists, setArtists] = useState(null);
  const [albums, setAlbums] = useState(null);
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
    setArtists(artists);
    setAlbums(albums);
  }, [data]);

  const width = 400;
  const half = width / 2;

  return (
    <>
      {artists && totalPercent && (
        <>
          <h4>Artist Pie</h4>
          <svg width={width} height={width}>
            <Group top={half} left={half}>
              <Pie
                data={artists}
                pieValue={(artist) => artist.percent}
                outerRadius={half}
                innerRadius={({ data }) => {
                  const size = active && active.name === data.name ? half * 0.06 : half * 0.04;
                  return half - size;
                }}
                padAngle={0.01}
              >
                {(pie) => {
                  return pie.arcs.map((arc) => {
                    return (
                      <g
                        key={arc.data.name}
                        onMouseEnter={() => setActive(arc.data)}
                        onMouseLeave={() => setActive(null)}
                      >
                        <path
                          d={pie.path(arc)}
                          fill={`hsl(${240 - (arc.data.percent / totalPercent) * 360}, 100%, 50%)`}
                        />
                      </g>
                    );
                  });
                }}
              </Pie>

              {active ? (
                <>
                  <Text
                    textAnchor="middle"
                    verticalAnchor="middle"
                    width={width / 2}
                    dy={-width / 10}
                    scaleToFit="shrink-only"
                  >
                    {active.name}
                  </Text>
                  <Text textAnchor="middle" verticalAnchor="middle" width={width / 2}>
                    {active.percent.toPrecision(3) + "%"}
                  </Text>
                </>
              ) : (
                <Text
                  textAnchor="middle"
                  verticalAnchor="middle"
                  width={width / 2}
                  scaleToFit="shrink-only"
                >
                  Artists
                </Text>
              )}
            </Group>
          </svg>
        </>
      )}
    </>
  );
}
