import React from "react";
import { Pole } from "../types";

interface SPlaneDiagramProps {
  zeta: number;
  omegaN: number;
  isStabilized: boolean;
  uncontrolledPole: number; // e.g. -0.1 or +0.05 for unstable
  manualSigma: number;
  activeProtocolId: string | null;
}

export default function SPlaneDiagram({
  zeta,
  omegaN,
  isStabilized,
  uncontrolledPole,
  manualSigma,
  activeProtocolId,
}: SPlaneDiagramProps) {
  // SVG size is 220x220
  const width = 220;
  const height = 220;
  const padding = 20;

  // Origin is centered vertically, offset horizontally to give more space on Left-Half Plane
  // Since stable poles are strictly negative, let's place the imaginary axis closer to the right edge (e.g. 170)
  const originX = 160;
  const originY = 110;
  const scale = 35; // px per unit

  // Sub-calculations for poles
  const getPoles = (): Pole[] => {
    if (activeProtocolId === "manual") {
      return [{ real: manualSigma, imag: 0, type: manualSigma >= 0 ? "unstable" : "real" }];
    }
    
    if (!isStabilized) {
      if (uncontrolledPole >= 0) {
        return [{ real: uncontrolledPole, imag: 0, type: "unstable" }];
      } else {
        return [{ real: uncontrolledPole, imag: 0, type: "unstable" }];
      }
    }

    if (zeta >= 1) {
      // Real poles
      const p1 = -omegaN * (zeta - Math.sqrt(zeta * zeta - 1));
      const p2 = -omegaN * (zeta + Math.sqrt(zeta * zeta - 1));
      return [
        { real: p1, imag: 0, type: "real" },
        { real: p2, imag: 0, type: "real" },
      ];
    } else {
      // Complex conjugate poles
      const real = -zeta * omegaN;
      const imag = omegaN * Math.sqrt(1 - zeta * zeta);
      return [
        { real, imag, type: "conjugate" },
        { real, imag: -imag, type: "conjugate" },
      ];
    }
  };

  const poles = getPoles();

  // Convert math coords to SVG pixel coords
  const toSvgX = (real: number) => originX + real * scale;
  const toSvgY = (imag: number) => originY - imag * scale;

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-700/60 p-4 rounded-xl shadow-inner select-none">
      <div className="flex justify-between items-center w-full mb-2">
        <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
          💡 Plano Complejo S (s-plane)
        </span>
        <span className="text-[10px] font-mono bg-slate-800 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">
          s = σ + jω
        </span>
      </div>

      <div className="relative border border-slate-800 bg-slate-950/80 rounded-lg overflow-hidden p-1">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          <line
            x1={0}
            y1={originY}
            x2={width}
            y2={originY}
            stroke="#334155"
            strokeWidth={1.5}
          />
          <line
            x1={originX}
            y1={0}
            x2={originX}
            y2={height}
            stroke="#334155"
            strokeWidth={1.5}
          />

          {/* Dotted helper lines for tick marks */}
          {[-4, -3, -2, -1, 1].map((tick) => (
            <React.Fragment key={`tick-${tick}`}>
              <line
                x1={originX + tick * scale}
                y1={originY - 3}
                x2={originX + tick * scale}
                y2={originY + 3}
                stroke="#475569"
                strokeWidth={1.5}
              />
              <text
                x={originX + tick * scale}
                y={originY + 14}
                fill="#64748b"
                fontSize={8}
                textAnchor="middle"
                fontFamily="monospace"
              >
                {tick}
              </text>
            </React.Fragment>
          ))}

          {[-2, -1, 1, 2].map((tick) => (
            <React.Fragment key={`ytick-${tick}`}>
              <line
                x1={originX - 3}
                y1={originY - tick * scale}
                x2={originX + 3}
                y2={originY - tick * scale}
                stroke="#475569"
                strokeWidth={1.5}
              />
              <text
                x={originX + 8}
                y={originY - tick * scale + 3}
                fill="#64748b"
                fontSize={8}
                textAnchor="start"
                fontFamily="monospace"
              >
                {tick > 0 ? `+${tick}j` : `${tick}j`}
              </text>
            </React.Fragment>
          ))}

          {/* Axis Labels */}
          <text
            x={width - 15}
            y={originY - 8}
            fill="#94a3b8"
            fontSize={10}
            fontWeight="bold"
            fontFamily="monospace"
          >
            σ (re)
          </text>
          <text
            x={originX - 18}
            y={12}
            fill="#94a3b8"
            fontSize={10}
            fontWeight="bold"
            fontFamily="monospace"
          >
            jω (im)
          </text>

          {/* Stable region shading (LHP gets a subtle green glow, RHP is red) */}
          <rect
            x={0}
            y={0}
            width={originX}
            height={height}
            fill="url(#green-glow)"
            opacity={0.3}
          />
          <rect
            x={originX}
            y={0}
            width={width - originX}
            height={height}
            fill="url(#red-glow)"
            opacity={0.35}
          />

          {/* Damping constant lines (zeta angle) showing stable trajectory if zeta < 1 and active */}
          {isStabilized && zeta < 1 && (
            <>
              {/* Radial line from origin to Complex Pole */}
              <line
                x1={originX}
                y1={originY}
                x2={toSvgX(-zeta * omegaN)}
                y2={toSvgY(omegaN * Math.sqrt(1 - zeta * zeta))}
                stroke="#6366f1"
                strokeDasharray="2,2"
                strokeWidth={1}
              />
              <line
                x1={originX}
                y1={originY}
                x2={toSvgX(-zeta * omegaN)}
                y2={toSvgY(-omegaN * Math.sqrt(1 - zeta * zeta))}
                stroke="#6366f1"
                strokeDasharray="2,2"
                strokeWidth={1}
              />
            </>
          )}

          {/* Render Poles */}
          {poles.map((pole, idx) => {
            const px = toSvgX(pole.real);
            const py = toSvgY(pole.imag);
            const isUnstable = pole.type === "unstable" || pole.real > 0;

            return (
              <g key={`pole-${idx}`} className="animate-pulse">
                {/* Outer halo */}
                <circle
                  cx={px}
                  cy={py}
                  r={isUnstable ? 12 : 10}
                  fill={isUnstable ? "#ef4444" : "#10b981"}
                  fillOpacity={0.25}
                  className="animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <circle
                  cx={px}
                  cy={py}
                  r={6}
                  fill={isUnstable ? "#ef4444" : "#10b981"}
                  stroke="#ffffff"
                  strokeWidth={1}
                />
                {/* The "X" representing the pole */}
                <path
                  d={`M ${px - 4} ${py - 4} L ${px + 4} ${py + 4} M ${px + 4} ${py - 4} L ${px - 4} ${py + 4}`}
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {/* Pole coordinates text */}
                <text
                  x={px}
                  y={py - 12}
                  fill={isUnstable ? "#f87171" : "#34d399"}
                  fontSize={8}
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                  className="bg-slate-950 px-1 py-0.5 rounded"
                >
                  {pole.real.toFixed(2)} {pole.imag !== 0 ? `± ${Math.abs(pole.imag).toFixed(2)}j` : ""}
                </text>
              </g>
            );
          })}

          {/* Definitions for gradients */}
          <defs>
            <linearGradient id="green-glow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="red-glow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.12" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex gap-4 mt-3 text-[10px] font-mono text-slate-400 w-full justify-center">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Región Estable (LHP)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Peligro (RHP)</span>
        </div>
      </div>
    </div>
  );
}
