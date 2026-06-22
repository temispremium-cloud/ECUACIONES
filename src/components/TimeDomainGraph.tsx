import React, { useMemo, useState, useRef, useEffect } from "react";
import { SimulationPoint } from "../types";

interface TimeDomainGraphProps {
  currentTime: number;
  isStabilized: boolean;
  zeta: number;
  omegaN: number;
  simPoints: SimulationPoint[];
  limitTemp: number;
  simState?: string;
}

export default function TimeDomainGraph({
  currentTime,
  isStabilized,
  zeta,
  omegaN,
  simPoints,
  limitTemp,
  simState = "idle",
}: TimeDomainGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<SimulationPoint | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Time-decaying/propagating phase variable to drive dynamic real-time ambient sensor noise
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // High update rate (~16 FPS) timer loop to achieve continuous organic crawling waveform wiggles
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 0.12) % (Math.PI * 20));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Default fallback dimensions
  const viewWidth = 500;
  const plotW = 435;
  const offsetX = 50;

  // Panel 1 dimensions
  const viewHeight1 = 135;
  const plotH1 = 105;
  const offsetY1 = 10;
  const maxTraffic = 55000;

  // Panel 2 dimensions
  const viewHeight2 = 185;
  const plotH2 = 130;
  const offsetY2 = 20;
  const minTemp = 30;
  const maxTemp = 105;

  // Dynamic points list injecting realistic micro-sensor fluctuations
  const processedPoints = useMemo(() => {
    if (simState === "idle") {
      // In idle, render a waving continuous background baseline over 15s to represent a living running server rack in repose
      const reposPoints = [];
      for (let i = 0; i <= 150; i++) {
        const t = i * 0.1;
        // Nominal idle server load (2000 users) plus rhythmic live organic waving noise ±75usr
        const noiseTraffic = 2000 + Math.sin(t * 2.8 - phase * 2.5) * 110 + Math.cos(t * 5.5 + phase * 1.1) * 45;
        // Nominal idle CPU temp (38.0°C) with tiny realistic thermal sensor jitters ±0.2C
        const noiseTemp = 38.0 + Math.sin(t * 2.2 - phase * 1.8) * 0.18 + Math.cos(t * 4.8 + phase * 1.0) * 0.06;
        reposPoints.push({
          t,
          traffic: Math.max(0, noiseTraffic),
          tempUncontrolled: noiseTemp,
          tempControlled: noiseTemp,
        });
      }
      return reposPoints;
    }

    // During active simulations, add a subtle realistic micro-vibration so curves don't look completely static
    return simPoints.map((pt) => {
      const noiseT = pt.t;
      const trafficNoise = Math.sin(noiseT * 4.0 - phase * 2.8) * 220 + Math.cos(noiseT * 8.0 + phase * 1.3) * 75;
      const tempNoise = Math.sin(noiseT * 3.4 - phase * 2.0) * 0.12 + Math.cos(noiseT * 7.0 + phase * 1.1) * 0.04;

      return {
        t: pt.t,
        traffic: Math.max(0, pt.traffic + trafficNoise),
        tempUncontrolled: pt.tempUncontrolled + tempNoise,
        tempControlled: pt.tempControlled + tempNoise,
      };
    });
  }, [simPoints, simState, phase]);

  // Find currently active values based on currentTime
  const currentStatus = useMemo(() => {
    if (processedPoints.length === 0) {
      return { t: 0, traffic: 2000, tempUncontrolled: 38, tempControlled: 38 };
    }
    const idx = Math.min(
      processedPoints.length - 1,
      Math.max(0, Math.floor((currentTime / 15) * (processedPoints.length - 1)))
    );
    return processedPoints[idx] || { t: 0, traffic: 2000, tempUncontrolled: 38, tempControlled: 38 };
  }, [currentTime, processedPoints]);

  const activeTemp = isStabilized ? currentStatus.tempControlled : currentStatus.tempUncontrolled;

  // Panel 1 Math Helpers
  const getX = (t: number) => offsetX + (t / 15) * plotW;
  const getY1 = (val: number) => offsetY1 + plotH1 - (val / maxTraffic) * plotH1;

  // Panel 2 Math Helpers
  const getY2 = (val: number) => offsetY2 + plotH2 - ((val - minTemp) / (maxTemp - minTemp)) * plotH2;

  // Filter points dynamically so that the curves render in real-time as the simulation clocks forward
  const visiblePoints = useMemo(() => {
    if (simState === "idle") {
      // Return the entire continuous resting baseline so grid background is live on initial load
      return processedPoints;
    }
    return processedPoints.filter((p) => p.t <= currentTime);
  }, [processedPoints, currentTime, simState]);

  // Safe path creators
  const trafficPath = useMemo(() => {
    if (visiblePoints.length === 0) return "";
    if (visiblePoints.length === 1) {
      const p = visiblePoints[0];
      return `M ${getX(p.t).toFixed(1)},${getY1(p.traffic).toFixed(1)} h 1.5`;
    }
    return "M " + visiblePoints.map((p) => `${getX(p.t).toFixed(1)},${getY1(p.traffic).toFixed(1)}`).join(" L ");
  }, [visiblePoints]);

  const tempUncontrolledPath = useMemo(() => {
    if (visiblePoints.length === 0) return "";
    if (visiblePoints.length === 1) {
      const p = visiblePoints[0];
      return `M ${getX(p.t).toFixed(1)},${getY2(p.tempUncontrolled).toFixed(1)} h 1.5`;
    }
    return "M " + visiblePoints.map((p) => `${getX(p.t).toFixed(1)},${getY2(p.tempUncontrolled).toFixed(1)}`).join(" L ");
  }, [visiblePoints]);

  const tempControlledPath = useMemo(() => {
    if (visiblePoints.length === 0) return "";
    if (visiblePoints.length === 1) {
      const p = visiblePoints[0];
      return `M ${getX(p.t).toFixed(1)},${getY2(p.tempControlled).toFixed(1)} h 1.5`;
    }
    return "M " + visiblePoints.map((p) => `${getX(p.t).toFixed(1)},${getY2(p.tempControlled).toFixed(1)}`).join(" L ");
  }, [visiblePoints]);

  // Handle local hovering
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (visiblePoints.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xInSvg = ((e.clientX - rect.left) / rect.width) * viewWidth;
    
    // Find closest point by x coordinate
    let closestPt = visiblePoints[0];
    let minD = Infinity;
    for (const pt of visiblePoints) {
      const d = Math.abs(getX(pt.t) - xInSvg);
      if (d < minD) {
        minD = d;
        closestPt = pt;
      }
    }
    
    if (closestPt) {
      setHoveredPoint(closestPt);
      setHoverCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverCoords(null);
  };

  // Pre-calculated ticks
  const tTicks = [0, 3, 6, 9, 12, 15];
  const trafficTicks = [10000, 20000, 30000, 40000, 50000];
  const tempTicks = [40, 50, 60, 70, 80, 90, 100];

  return (
    <div
      ref={containerRef}
      className="flex flex-col p-5 rounded-xl w-full select-none"
      style={{
        background: "linear-gradient(180deg, rgba(224,233,253,1) 0%, rgba(233,236,241,1) 100%)",
        boxShadow: "0 2px 6px rgba(136,148,171,.2), 0 24px 20px -24px rgba(71,82,107,.1)",
        fontFamily: "'DM Sans', sans-serif",
      }}
      id="time-domain-card"
    >
      {/* Title Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-[#22244a] flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
          </span>
          Dominio del Tiempo f(t) vs t
        </h3>

        {/* Custom Legend */}
        <div className="flex gap-3 text-[10px] md:text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
            <span className="text-slate-700 font-semibold">Tráfico v(t)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"></span>
            <span className="text-slate-700 font-semibold">Sin Control s(T)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#10b981] inline-block"></span>
            <span className="text-slate-700 font-semibold">Con Laplace s(T)</span>
          </div>
        </div>
      </div>

      {/* Plot Panels container card */}
      <div className="flex flex-col gap-1.5 bg-white/70 p-3 rounded-lg border border-slate-200/50 relative">
        
        {/* Panel 1: traffic load description */}
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Panel 1: Carga / Tráfico v(t)
          </span>
          <span className="text-[10px] md:text-[11px] font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded shadow-sm border border-blue-100/50">
            {currentStatus.traffic.toLocaleString()} usr (req/s)
          </span>
        </div>

        {/* Panel 1 SVG Chart */}
        <div className="w-full relative h-[135px]">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${viewWidth} ${viewHeight1}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            id="traffic-svg-chart"
          >
            {/* Grid Lines */}
            {tTicks.map((t) => (
              <line
                key={`grid-x-${t}`}
                x1={getX(t)}
                y1={offsetY1}
                x2={getX(t)}
                y2={offsetY1 + plotH1}
                stroke="rgba(148, 163, 184, 0.12)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            ))}
            {trafficTicks.map((val) => (
              <g key={`grid-y-${val}`}>
                <line
                  x1={offsetX}
                  y1={getY1(val)}
                  x2={offsetX + plotW}
                  y2={getY1(val)}
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Tick Label */}
                <text
                  x={offsetX - 8}
                  y={getY1(val) + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="8.5"
                  className="font-mono font-medium"
                >
                  {(val / 1000).toFixed(0)}k
                </text>
              </g>
            ))}

            {/* Zero/Baseline axes */}
            <line
              x1={offsetX}
              y1={offsetY1 + plotH1}
              x2={offsetX + plotW}
              y2={offsetY1 + plotH1}
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
            <line
              x1={offsetX}
              y1={offsetY1}
              x2={offsetX}
              y2={offsetY1 + plotH1}
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />

            {/* Main Path: Traffic */}
            <path
              d={trafficPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_1.5px_2px_rgba(59,130,246,0.25)]"
            />

            {/* Active Cursor vertical indicator line */}
            <line
              x1={getX(currentTime)}
              y1={offsetY1}
              x2={getX(currentTime)}
              y2={offsetY1 + plotH1}
              stroke="#8b5cf6"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Tracking dot on path */}
            <circle
              cx={getX(currentTime)}
              cy={getY1(currentStatus.traffic)}
              r="4.5"
              fill="#1d4ed8"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="shadow-sm"
            />

            {/* Legend title descriptor along the Y axis */}
            <text
              transform={`rotate(-90 ${offsetX - 32} ${offsetY1 + plotH1 / 2})`}
              x={offsetX - 32}
              y={offsetY1 + plotH1 / 2}
              textAnchor="middle"
              fill="#475569"
              fontSize="8"
              className="font-bold tracking-wider uppercase text-slate-500"
            >
              usr (req/s)
            </text>

            {/* Hover Guidance Line */}
            {hoveredPoint && (
              <line
                x1={getX(hoveredPoint.t)}
                y1={offsetY1}
                x2={getX(hoveredPoint.t)}
                y2={offsetY1 + plotH1}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}
          </svg>
        </div>

        <div className="h-[1px] bg-slate-200/50 my-1" />

        {/* Panel 2: temperature response description */}
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Panel 2: Respuesta del sistema s(T)
          </span>
          <span
            className={`text-[10px] md:text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm border ${
              activeTemp >= limitTemp
                ? "bg-red-50 text-red-600 border-red-100 animate-pulse"
                : activeTemp > 75
                ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}
          >
            {activeTemp.toFixed(1)}°C
          </span>
        </div>

        {/* Panel 2 SVG Chart */}
        <div className="w-full relative h-[185px]">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${viewWidth} ${viewHeight2}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            id="temperature-svg-chart"
          >
            {/* Pink Shaded Warning Zone above Safety Limit 90C */}
            <rect
              x={offsetX}
              y={offsetY2}
              width={plotW}
              height={getY2(90) - offsetY2}
              fill="rgba(239, 68, 68, 0.05)"
            />

            {/* Grid Lines */}
            {tTicks.map((t) => (
              <g key={`grid2-x-${t}`}>
                <line
                  x1={getX(t)}
                  y1={offsetY2}
                  x2={getX(t)}
                  y2={offsetY2 + plotH2}
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* T-Axis Label */}
                <text
                  x={getX(t)}
                  y={offsetY2 + plotH2 + 15}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="9"
                  className="font-medium"
                >
                  {t}s
                </text>
              </g>
            ))}
            {tempTicks.map((val) => (
              <g key={`grid2-y-${val}`}>
                <line
                  x1={offsetX}
                  y1={getY2(val)}
                  x2={offsetX + plotW}
                  y2={getY2(val)}
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Temp Value label */}
                <text
                  x={offsetX - 8}
                  y={getY2(val) + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="8.5"
                  className="font-mono font-medium"
                >
                  {val}°
                </text>
              </g>
            ))}

            {/* Safety Limit Red-dotted line at 90C */}
            <line
              x1={offsetX}
              y1={getY2(limitTemp)}
              x2={offsetX + plotW}
              y2={getY2(limitTemp)}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Horizontal axes lines */}
            <line
              x1={offsetX}
              y1={offsetY2 + plotH2}
              x2={offsetX + plotW}
              y2={offsetY2 + plotH2}
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
            <line
              x1={offsetX}
              y1={offsetY2}
              x2={offsetX}
              y2={offsetY2 + plotH2}
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />

            {/* Path: Uncontrolled Curve (Red, semi-transparent & dotted if stabilized) */}
            <path
              d={tempUncontrolledPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.2"
              strokeDasharray={isStabilized ? "2 2" : "none"}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isStabilized ? 0.35 : 0.9}
            />

            {/* Path: Controlled Curve (Green, bold, solid) */}
            <path
              d={tempControlledPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_1.5px_2px_rgba(16,185,129,0.25)]"
            />

            {/* Safety Limit threshold warning annotation */}
            <text
              x={offsetX + plotW / 2}
              y={getY2(limitTemp) - 5}
              textAnchor="middle"
              fill="#ef4444"
              fontSize="8"
              fontWeight="bold"
              opacity="0.85"
            >
              ⚠️ LÍMITE DE SEGURIDAD (90°C)
            </text>

            {/* Live Cursor vertical indicator line */}
            <line
              x1={getX(currentTime)}
              y1={offsetY2}
              x2={getX(currentTime)}
              y2={offsetY2 + plotH2}
              stroke="#8b5cf6"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Active Dot Tracking */}
            <circle
              cx={getX(currentTime)}
              cy={getY2(isStabilized ? currentStatus.tempControlled : currentStatus.tempUncontrolled)}
              r="5"
              fill={activeTemp >= limitTemp ? "#ef4444" : activeTemp > 75 ? "#f59e0b" : "#10b981"}
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* Time label under axis */}
            <text
              x={offsetX + plotW / 2}
              y={offsetY2 + plotH2 + 28}
              textAnchor="middle"
              fill="#475569"
              fontSize="8"
              className="font-bold tracking-wider uppercase text-slate-500"
            >
              Tiempo de simulación (s)
            </text>

            <text
              transform={`rotate(-90 ${offsetX - 32} ${offsetY2 + plotH2 / 2})`}
              x={offsetX - 32}
              y={offsetY2 + plotH2 / 2}
              textAnchor="middle"
              fill="#475569"
              fontSize="8"
              className="font-bold tracking-wider uppercase text-slate-500"
            >
              Temp (°C)
            </text>

            {/* Hover Guidance Line */}
            {hoveredPoint && (
              <line
                x1={getX(hoveredPoint.t)}
                y1={offsetY2}
                x2={getX(hoveredPoint.t)}
                y2={offsetY2 + plotH2}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}
          </svg>
        </div>

        {/* Dynamic absolute custom Tooltip overlay following cursor coordinates */}
        {hoveredPoint && hoverCoords && (
          <div
            className="absolute z-30 bg-slate-900/95 text-slate-100 text-[10px] p-2.5 rounded-lg border border-slate-700 shadow-xl pointer-events-none font-mono flex flex-col gap-1 backdrop-blur-sm"
            style={{
              left: `${hoverCoords.x + 15}px`,
              top: `${hoverCoords.y - 20}px`,
            }}
          >
            <div className="font-sans font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1 flex justify-between gap-4">
              <span>Tiempo de Sim.</span>
              <span className="text-violet-400">{hoveredPoint.t.toFixed(1)}s</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Tráfico:</span>
              <span className="text-blue-400 font-bold">{hoveredPoint.traffic.toLocaleString()} req/s</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Sin Control:</span>
              <span className="text-red-400 font-bold">{hoveredPoint.tempUncontrolled.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Con Laplace:</span>
              <span className="text-emerald-400 font-bold">{hoveredPoint.tempControlled.toFixed(1)}°C</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status overview container */}
      <div className="flex justify-between items-center mt-3 px-3 py-2.5 bg-white/75 rounded-lg border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
          <span>Tiempo:</span>
          <span className="font-mono text-slate-900 border bg-white px-2 py-0.5 rounded shadow-xs">
            {currentTime.toFixed(1)}s / 15.0s
          </span>
        </div>

        {/* Operating Warning Badge */}
        {simState === "idle" ? (
          <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 font-bold text-[10.5px] border border-slate-200 px-2.5 py-1 rounded-full shadow-xs">
            <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full" />
            <span>⏸ En espera / Sistema Estable</span>
          </div>
        ) : simState === "failed" ? (
          <div className="flex items-center gap-1 bg-red-100 text-red-850 font-bold text-[10.5px] border border-red-300 px-2.5 py-1 rounded-full shadow-xs">
            <span className="inline-block w-1.5 h-1.5 bg-red-700 rounded-full" />
            <span>⛔ Simulación detenida: colapso térmico</span>
          </div>
        ) : simState === "success" ? (
          <div className="flex items-center gap-1 bg-emerald-100 text-emerald-850 font-bold text-[10.5px] border border-emerald-300 px-2.5 py-1 rounded-full shadow-xs">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            <span>✔️ Simulación exitosa (Canal Estable)</span>
          </div>
        ) : !isStabilized ? (
          <div className="flex items-center gap-1 bg-red-50 text-red-700 font-bold text-[10.5px] border border-red-100 px-2.5 py-1 rounded-full animate-pulse shadow-xs">
            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
            <span>⚠️ Operación Sin Control</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-750 font-bold text-[10.5px] border border-emerald-100 px-2.5 py-1 rounded-full shadow-xs">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>✔️ Canal Controlado (Laplace OK)</span>
          </div>
        )}
      </div>
    </div>
  );
}
