import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { Text } from "@visx/text";
import { letterFrequency } from "@visx/mock-data";
import { useState } from "react";

const data = letterFrequency;

export default function Mainstream() {
  const [active, setActive] = useState(null);

  const width = 400;
  const half = width / 2;

  return (
    <>
      <h4>Mainstream</h4>
      <svg width={width} height={width}>
        <Group top={half} left={half}>
          <Pie
            data={data}
            pieValue={(letter) => letter.frequency}
            outerRadius={half}
            innerRadius={({ data }) => {
              const size = active && active.letter === data.letter ? 12 : 8;
              return half - size;
            }}
            padAngle={0.01}
          >
            {(pie) => {
              return pie.arcs.map((arc) => {
                return (
                  <g
                    key={arc.data.letter}
                    onMouseEnter={() => setActive(arc.data)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <path
                      d={pie.path(arc)}
                      fill={`hsl(${Math.min(arc.data.frequency * 10, 1) * 360}, 100%, 50%)`}
                    />
                  </g>
                );
              });
            }}
          </Pie>

          {active ? (
            <>
              <Text textAnchor="middle" fontSize="40" dy={-40}>
                {active.letter}
              </Text>
              <Text textAnchor="middle" fontSize="40">
                {`${(active.frequency * 100).toPrecision(3)}%`}
              </Text>
            </>
          ) : (
            <Text textAnchor="middle" fontSize="40">
              {`${(data.reduce((acc, letter) => letter.frequency + acc, 0) * 100).toPrecision(3)}%`}
            </Text>
          )}
        </Group>
      </svg>
    </>
  );
}
