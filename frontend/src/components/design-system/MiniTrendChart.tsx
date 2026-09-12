import React from 'react';

interface MiniTrendChartProps {
  width?: number;
  height?: number;
  accuracyData?: number[];
  reactionTimeData?: number[];
  showLegend?: boolean;
}

export const MiniTrendChart: React.FC<MiniTrendChartProps> = ({
  width = 280,
  height = 90,
  accuracyData = [75, 78, 72, 70, 68, 64, 60, 58, 62, 55], // declining trend (teal)
  reactionTimeData = [40, 42, 48, 45, 58, 65, 62, 72, 78, 85], // increasing latency (coral/red)
  showLegend = true,
}) => {
  const padding = 12;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Convert array of 0-100 to SVG points
  const getPoints = (data: number[]) => {
    const step = chartWidth / (data.length - 1);
    return data
      .map((val, idx) => {
        const x = padding + idx * step;
        const y = height - padding - (val / 100) * chartHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const getCoordinates = (data: number[]) => {
    const step = chartWidth / (data.length - 1);
    return data.map((val, idx) => ({
      x: padding + idx * step,
      y: height - padding - (val / 100) * chartHeight,
      val,
    }));
  };

  const accuracyCoords = getCoordinates(accuracyData);
  const reactionCoords = getCoordinates(reactionTimeData);

  return (
    <div className="w-full flex flex-col space-y-2">
      <div className="w-full overflow-hidden rounded-xl bg-slate-50/80 p-2 border border-slate-100">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Subtle grid lines */}
          <line
            x1={padding}
            y1={padding + chartHeight * 0.25}
            x2={width - padding}
            y2={padding + chartHeight * 0.25}
            stroke="#E2E8F0"
            strokeDasharray="2,2"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={padding + chartHeight * 0.75}
            x2={width - padding}
            y2={padding + chartHeight * 0.75}
            stroke="#E2E8F0"
            strokeDasharray="2,2"
            strokeWidth="1"
          />

          {/* Reaction time curve (Coral / Red) */}
          <polyline
            fill="none"
            stroke="#EF4444"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={getPoints(reactionTimeData)}
          />
          {reactionCoords.map((pt, i) => (
            <circle
              key={`rt-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="2.5"
              fill="#FFFFFF"
              stroke="#EF4444"
              strokeWidth="1.8"
            />
          ))}

          {/* Accuracy curve (Teal / Brand) */}
          <polyline
            fill="none"
            stroke="#0D5C4D"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={getPoints(accuracyData)}
          />
          {accuracyCoords.map((pt, i) => (
            <circle
              key={`acc-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="2.5"
              fill="#FFFFFF"
              stroke="#0D5C4D"
              strokeWidth="1.8"
            />
          ))}
        </svg>
      </div>

      {showLegend && (
        <div className="flex items-center justify-center space-x-4 text-[10px] text-slate-500 font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1 bg-[#0D5C4D] rounded-full" />
            <span>Accuracy (%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1 bg-[#EF4444] rounded-full" />
            <span>Reaction Time (s)</span>
          </div>
        </div>
      )}
    </div>
  );
};
