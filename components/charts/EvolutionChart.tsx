
import React, { useState, useMemo, useRef } from 'react';

interface SeriesData {
  name: string;
  data: number[];
}

interface EvolutionChartProps {
  series: SeriesData[];
}

// Function to create a smooth path (cubic bezier spline)
const createSplinePath = (points: [number, number][]): string => {
  if (points.length < 2) return '';
  
  let path = `M${points[0][0]},${points[0][1]}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[0];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;

    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }

  return path;
};


const EvolutionChart: React.FC<EvolutionChartProps> = ({ series }) => {
  const currentYear = new Date().getFullYear();
  const [visibleYears, setVisibleYears] = useState<string[]>([currentYear.toString(), (currentYear - 1).toString()]);
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: React.ReactNode; x: number; y: number } | null>(null);
  const [hoveredPoints, setHoveredPoints] = useState<{x: number, y: number, color: string}[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const toggleYearVisibility = (year: string) => {
    setVisibleYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };
  
  const colors = ['#0d6efd', '#80CAEE', '#10B981', '#FBBF24', '#F87171'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const chartData = useMemo(() => {
    if (!series || series.length === 0) return { lines: [], maxY: 100, yAxisLabels: [] };

    const visibleSeries = series.filter(s => visibleYears.includes(s.name));
    const allDataPoints = visibleSeries.flatMap(s => s.data);
    const maxYValue = allDataPoints.length > 0 ? Math.max(...allDataPoints) : 0;
    const maxY = maxYValue > 0 ? Math.ceil(maxYValue / 500) * 500 * 1.1 : 500;

    const lines = visibleSeries.map((s, seriesIndex) => {
      const originalSeriesIndex = series.findIndex(os => os.name === s.name);
      const points: [number, number][] = s.data.map((value, monthIndex) => {
          const x = (monthIndex / 11) * 500;
          const y = 200 - (value / maxY) * 200;
          return [x,y];
      });

      const path = createSplinePath(points);
      const areaPath = `M${points[0][0]},200 ${path.substring(1)} L${points[points.length - 1][0]},200 Z`;

      return { ...s, points, path, areaPath, color: colors[originalSeriesIndex % colors.length] };
    });
    
    const yAxisLabels = [];
    for (let i = 0; i <= 4; i++) {
        const value = (maxY / 4) * i;
        yAxisLabels.push({ value: value.toFixed(0), y: 200 - (i * 50) });
    }

    return { lines, maxY, yAxisLabels };
  }, [series, visibleYears]);

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredPoints([]);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
      if (!chartContainerRef.current || chartData.lines.length === 0) return;
      const svg = event.currentTarget.ownerSVGElement;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;

      const ctm = svg.getScreenCTM();
      if (!ctm) return;

      const svgPoint = pt.matrixTransform(ctm.inverse());
      const svgX = svgPoint.x;
      const svgY = svgPoint.y;

      const monthIndex = Math.round((svgX / 500) * 11);
      if (monthIndex < 0 || monthIndex > 11) {
        handleMouseLeave();
        return;
      }

      const currentHoveredPoints = chartData.lines.map(line => ({
          x: line.points[monthIndex][0],
          y: line.points[monthIndex][1],
          color: line.color,
      }));
      setHoveredPoints(currentHoveredPoints);

      const visibleSeries = series.filter(s => visibleYears.includes(s.name));
      
      const tooltipContent = (
          <div className="space-y-1">
              <p className="font-bold mb-1 text-sm">{months[monthIndex]}</p>
              {visibleSeries.map((s) => {
                  const originalSeriesIndex = series.findIndex(os => os.name === s.name);
                  return(
                      <div key={s.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[originalSeriesIndex % colors.length] }}></div>
                          <span>{s.name}: <strong>€{s.data[monthIndex].toFixed(2)}</strong></span>
                      </div>
                  );
              })}
          </div>
      );
      
      const clientWidth = chartContainerRef.current.clientWidth;
      const tooltipX = (monthIndex / 11) * clientWidth;
      
      setTooltip({ visible: true, content: tooltipContent, x: tooltipX, y: svgY - 10 });
  };

  return (
    <div className="w-full">
        <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 mb-4">
            {series.map((s, index) => (
              <div key={s.name} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleYearVisibility(s.name)}>
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[index % colors.length] }}></div>
                <span className={`text-sm font-medium ${visibleYears.includes(s.name) ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {s.name}
                </span>
              </div>
            ))}
        </div>
      <div className="mt-4 relative" ref={chartContainerRef}>
        {tooltip && tooltip.visible && (
            <div className="absolute p-2 text-white bg-text-primary rounded-md shadow-lg z-10" style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px`, pointerEvents: 'none', transform: 'translate(-50%, -100%)' }}>
                {tooltip.content}
            </div>
        )}
        <svg viewBox="0 0 500 220" className="w-full">
          <defs>
            {chartData.lines.map(line => (
              <linearGradient key={line.name} id={`gradient-${line.name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={line.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {/* Y Axis Grid Lines & Labels */}
          <g>
            {chartData.yAxisLabels.map((label, i) => (
                <g key={i}>
                   <line x1="0" y1={label.y} x2="500" y2={label.y} stroke="currentColor" className="text-border-color" />
                   <text x="-5" y={label.y + 4} textAnchor="end" fontSize="10" className="fill-current text-text-secondary">{label.value}€</text>
                </g>
            ))}
          </g>

          {/* X Axis Labels */}
          <g>
            {months.map((month, i) => (
                <text key={month} x={(i/11) * 500} y="215" textAnchor="middle" fontSize="10" className="fill-current text-text-secondary">{month}</text>
            ))}
          </g>
          
          {/* Data Lines and Area Fills */}
          {chartData.lines.map(line => (
            <g key={line.name}>
              <path d={line.areaPath} fill={`url(#gradient-${line.name})`} />
              <path d={line.path} fill="none" stroke={line.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
           {/* Hovered points */}
           {hoveredPoints.map((point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r="4" fill={point.color} stroke="white" strokeWidth="2" />
           ))}
          <rect x="0" y="0" width="500" height="200" fill="transparent" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
        </svg>
      </div>
    </div>
  );
};

export default EvolutionChart;
