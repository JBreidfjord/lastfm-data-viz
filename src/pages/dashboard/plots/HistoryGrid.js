// import { Tooltip, withTooltip } from "@visx/tooltip";
// import { VoronoiPolygon, voronoi } from "@visx/voronoi";
import { coerceNumber, scaleLinear, scaleTime } from "@visx/scale";
import { useEffect, useState } from "react";

import { Circle } from "@visx/shape";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";

// import { localPoint } from "@visx/event";

const cool1 = "#122549";
const cool2 = "#b4fbde";
const background = "#28272c";

const getMinMax = (vals) => {
  const numericVals = vals.map(coerceNumber);
  return [Math.min(...numericVals), Math.max(...numericVals)];
};

export default function HistoryGrid({ data, width, height }) {
  const [chartData, setChartData] = useState(null);
  const [xScale, setXScale] = useState(null);

  useEffect(() => {
    setChartData(
      data.scrobbles.map((scrobble) => {
        const date = new Date(parseInt(scrobble.date) * 1000);
        const time = date.getSeconds() + date.getMinutes() * 60 + date.getHours() * 3600;
        return {
          x: date,
          y: time,
          info: {
            ...scrobble,
          },
        };
      })
    );
  }, [data.scrobbles]);

  useEffect(() => {
    if (chartData) {
      const vals = chartData.map((d) => d.x);
      setXScale(() =>
        scaleTime({
          domain: getMinMax(vals),
          range: [0, width],
        })
      );
    }
  }, [chartData, width]);

  const yScale = scaleLinear({
    domain: [86400, 0],
    range: [height, 0],
  });

  return chartData && xScale ? (
    <>
      <svg width={width} height={height}>
        <LinearGradient id="visx-axis-gradient" from={cool1} to={cool2} toOpacity={0.7} />
        <rect width={width} height={height} rx={14} fill={"url(#visx-axis-gradient)"} />
        <Group pointerEvents="none">
          {chartData.map((point, i) => (
            <Circle
              key={`point-${point.x}-${i}`}
              className="dot"
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={2}
              fill={background}
            />
          ))}
        </Group>
      </svg>
    </>
  ) : null;
}
