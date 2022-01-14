import { Axis, Orientation } from "@visx/axis";
// import { Tooltip, withTooltip } from "@visx/tooltip";
// import { VoronoiPolygon, voronoi } from "@visx/voronoi";
import { coerceNumber, scaleLinear, scaleTime } from "@visx/scale";
import { useEffect, useMemo, useState } from "react";

import { Circle } from "@visx/shape";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";
import { timeFormat } from "d3-time-format";

// import { localPoint } from "@visx/event";

const formatDate = timeFormat("%b '%y");
const formatTime = (seconds) => {
  return seconds === 0 || seconds === 86400
    ? "12am"
    : seconds === 43200
    ? "12pm"
    : seconds < 43200
    ? seconds / 3600 + "am"
    : seconds / 3600 - 12 + "pm";
};

const cool1 = "#122549";
const cool2 = "#b4fbde";
const background = "#28272c";
const tickLabelProps = (horizontal = true) => ({
  fill: "white",
  fontSize: 12,
  textAnchor: horizontal ? "middle" : "left",
  verticalAnchor: "middle",
});

const getMinMax = (vals) => {
  const numericVals = vals.map(coerceNumber);
  return [Math.min(...numericVals), Math.max(...numericVals)];
};

const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const axisWidth = 50;
const axisHeight = 40;

export default function HistoryGrid({ data, width, height, isPreview }) {
  const [chartData, setChartData] = useState(null);
  const [xScale, setXScale] = useState(null);
  const [chartCircles, setChartCircles] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const targetLength = isPreview ? 3000 : 100000; // Limit to 100k for performance
    const filterProb = targetLength / data.scrobbles.length;
    const scrobbles =
      data.scrobbles.length > targetLength
        ? data.scrobbles.filter(() => Math.random() < filterProb)
        : data.scrobbles;

    setChartData(() =>
      scrobbles.map((scrobble) => {
        const date = new Date(parseInt(scrobble.date) * 1000);
        const time = date.getSeconds() + date.getMinutes() * 60 + date.getHours() * 3600;
        date.setHours(0, 0, 0, 0); // Set time to 00:00:00 so columns are aligned
        return {
          x: date,
          y: time,
          info: {
            ...scrobble,
          },
        };
      })
    );
  }, [data.scrobbles, isPreview]);

  // Scales
  useEffect(() => {
    if (chartData && width > 0) {
      const vals = chartData.map((d) => d.x);
      setXScale(() =>
        scaleTime({
          domain: getMinMax(vals),
          range: [margin.left, width - margin.right - axisWidth],
        })
      );
    }
  }, [chartData, width]);

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, 86400],
        range: [margin.top, height - margin.bottom - axisHeight],
      }),
    [height]
  );

  // Set circles for chart
  useEffect(() => {
    if (chartData && xScale) {
      setChartCircles(() =>
        chartData.map((point, i) => (
          <Circle
            key={`point-${point.x}-${i}`}
            className="dot"
            cx={xScale(point.x)}
            cy={yScale(point.y)}
            r={1.5}
            fill={background}
          />
        ))
      );
    }
  }, [chartData, xScale, yScale, ready]);

  useEffect(() => {
    setReady(chartCircles !== null);
  }, [chartCircles]);

  const timeValues = [...Array(25).keys()]
    .map((v) => v * 3600)
    .filter((_, i) => i % (height > 500 ? 2 : 4) === 0);

  return ready ? (
    <>
      <svg width={width} height={height}>
        <LinearGradient id="visx-axis-gradient" from={cool2} to={cool1} toOpacity={0.7} />
        <rect width={width} height={height} rx={14} fill={"url(#visx-axis-gradient)"} />
        <g>
          <Axis
            orientation={Orientation.bottom}
            top={height - axisHeight}
            scale={xScale}
            tickFormat={(d) => formatDate(d)}
            tickLabelProps={tickLabelProps}
            numTicks={width / 120}
            tickLength={4}
          />
          <Axis
            orientation={Orientation.right}
            left={width - axisWidth}
            scale={yScale}
            tickValues={timeValues}
            tickFormat={(s) => formatTime(s)}
            tickLabelProps={() => tickLabelProps(false)}
            numTicks={height > 500 ? 13 : 7}
            hideTicks={true}
            tickLength={4}
          />
        </g>
        <Group pointerEvents="none">{chartCircles.map((Circle) => Circle)}</Group>
      </svg>
    </>
  ) : (
    <>Loading...</>
    // <Spinner />
  );
}
