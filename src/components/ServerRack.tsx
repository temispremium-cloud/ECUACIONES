import { useMemo, useState, useEffect } from "react";
import { Disc, HelpCircle, Activity, Info, AlertTriangle } from "lucide-react";

interface ServerRackProps {
  temperature: number;
  traffic: number;
  limitTemp: number;
  simState: "idle" | "spiking" | "stabilizing" | "success" | "failed";
}

// -------------------------------------------------------------------------
// COMPONENT 1: The Computer Center Rack Monitor cabinet (Naturally Vertical)
// -------------------------------------------------------------------------
export default function ServerRack({
  temperature,
  traffic,
  limitTemp,
  simState,
}: ServerRackProps) {
  const isOverheated = temperature >= limitTemp;
  const isHighDanger = temperature >= 78;
  const isModerate = temperature >= 60;

  // Local static states for the other servers inside the rack
  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl w-full select-none" id="computer-center-rack">
      <style>{`
        .cc-rack {
          background-color: #0e1112;
          border: 2px solid #1e293b;
          border-radius: 12px;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.9);
          overflow: hidden;
        }

        .cc-header {
          background-color: #1e2527;
          border-bottom: 2px solid #1e293b;
          padding: 10px;
          font-family: monospace;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: #94a3b8;
          text-align: center;
          text-shadow: 0 1px 3px black;
        }

        .cc-server-unit {
          background-color: #181818;
          border: 1px solid #232323;
          border-radius: 6px;
          height: 38px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.25s ease;
        }

        .cc-server-unit:hover {
          transform: translateY(-1px);
          background-color: #212121;
          border-color: #475569;
        }

        .cc-led-stack {
          display: flex;
          gap: 4px;
        }

        .cc-led-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .cc-led-dot.green {
          background-color: #10B981;
          box-shadow: 0 0 4px #10B981;
        }

        .cc-led-dot.amber {
          background-color: #FBBF24;
          box-shadow: 0 0 4px #FBBF24;
          animation: status_led_blink 0.8s infinite;
        }

        .cc-led-dot.red {
          background-color: #EF4444;
          box-shadow: 0 0 6px #EF4444;
          animation: status_led_blink 0.4s infinite;
        }

        .cc-led-dot.off {
          background-color: #27272a;
        }

        @keyframes status_led_blink {
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* Rack Title */}
      <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">
            RACK DE MONITOREO TÉRMICO
          </h3>
        </div>
        <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono font-semibold">
          Vigas de Monitoreo General
        </span>
      </div>

      <div className="cc-rack flex flex-col space-y-2.5 p-3">
        <div className="cc-header flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>COMPUTER CENTER CABINET (CONTROL)</span>
        </div>

        {/* Server 1: Constant simulation passive test, in constant high temp alert state */}
        <div className="cc-server-unit" title="Servidor externo de control térmico auxiliar DL380_G6">
          <div className="flex items-center gap-2">
            <div className="cc-led-stack">
              <span className="cc-led-dot red"></span>
              <span className="cc-led-dot amber"></span>
              <span className="cc-led-dot off"></span>
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-semibold truncate w-32">
              SV-01 (Uncontrolled G6)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/30 font-bold">
              84.2°C WARNING
            </span>
          </div>
        </div>

        {/* Server 2: Active User Laplace server, perfectly synchronized with currently tracked temperature! */}
        <div className="cc-server-unit border-indigo-500/50 bg-indigo-950/20 shadow-lg shadow-indigo-950/40" title="Su sistema actual bajo simulación Laplace (SV-02 - DL380 G7)">
          <div className="flex items-center gap-3">
            <div className="cc-led-stack">
              <span className={`cc-led-dot ${simState === "failed" ? "red" : isHighDanger ? "amber" : "green"}`}></span>
              <span className={`cc-led-dot ${simState === "failed" ? "off" : isModerate ? "amber" : "green"}`}></span>
              <span className={`cc-led-dot ${simState === "stabilizing" ? "green animate-pulse" : "off"}`}></span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 font-bold tracking-wide truncate w-32">
              SV-02 (Su Servidor G7)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold animate-pulse ${
              simState === "failed" ? "text-red-400 bg-red-950/40 border-red-500/20" :
              simState === "success" ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/20" :
              isHighDanger ? "text-red-400 bg-red-950/20 border-red-500/10" :
              isModerate ? "text-amber-400 bg-amber-950/20 border-amber-500/10" :
              "text-emerald-400 bg-emerald-950/10 border-emerald-950"
            }`}>
              {temperature.toFixed(1)}°C {simState === "failed" ? "CRASH" : simState === "success" ? "SAFE" : "LIVE"}
            </span>
          </div>
        </div>

        {/* Server 3: Offline / Burned down simulated from previous system trial */}
        <div className="cc-server-unit opacity-30" title="Nodo fundido en simulaciones inestables anteriores">
          <div className="flex items-center gap-2">
            <div className="cc-led-stack">
              <span className="cc-led-dot off"></span>
              <span className="cc-led-dot off"></span>
              <span className="cc-led-dot off"></span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 truncate w-32">
              SV-03 (Offline / Melted)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              DEGRADED COLD
            </span>
          </div>
        </div>

        {/* Server 4: Neighbors server representing general stable cluster metrics */}
        <div className="cc-server-unit" title="Servidor vecino estable SV-04">
          <div className="flex items-center gap-2">
            <div className="cc-led-stack">
              <span className="cc-led-dot green"></span>
              <span className="cc-led-dot green"></span>
              <span className="cc-led-dot green"></span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 truncate w-32">
              SV-04 (Co-stabilized)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              38.5°C NOMINAL
            </span>
          </div>
        </div>

        {/* Cluster sub units */}
        <div className="border border-slate-900 bg-slate-950/40 rounded-lg p-3">
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mb-2 uppercase tracking-wider">
            <span>Alta Densidad (Fila 4-10)</span>
            <span className="text-zinc-500">16 Slots Activos</span>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 16 }).map((_, id) => {
              const nodeColor = simState === "failed" ? "bg-red-950 border-red-900/10" :
                                simState === "success" ? "bg-emerald-500/80 shadow-[0_0_2px_#10b981]" :
                                id % 5 === 0 ? "bg-yellow-500/80 animate-pulse" : "bg-emerald-500/60";
              return (
                <div
                  key={`node-${id}`}
                  className={`h-2.5 rounded-sm border border-slate-900 ${nodeColor} opacity-75`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// COMPONENT 2: HP ProLiant DL380 G7 Physical Console Component (Universal Responsive Blade)
// -------------------------------------------------------------------------
export function HPDL380G7Blade({
  temperature,
  traffic,
  limitTemp,
  simState,
}: ServerRackProps) {
  const isOverheated = temperature >= limitTemp;
  const isHighDanger = temperature >= 78;
  const isModerate = temperature >= 60;

  // Local physical device triggers
  const [uidOn, setUidOn] = useState(true);
  const [powerOff, setPowerOff] = useState(false);
  const [activeDrives, setActiveDrives] = useState<number[]>([1, 2, 5, 6, 7, 8]); // Inserted hard drives
  const [driveUids, setDriveUids] = useState<number[]>([1, 6]); // Toggled drive locator LEDs
  const [driveWarnings, setDriveWarnings] = useState<number[]>([3, 7]); // Custom drive warning triggers

  // Animated sliding tray simulation for the DVD unit
  const [dvdOpen, setDvdOpen] = useState(false);

  // Simulated live flickers on the interface
  const [networkFlickers, setNetworkFlickers] = useState<boolean[]>([true, false, true, true]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkFlickers([
        Math.random() > (traffic > 30000 ? 0.05 : 0.35),
        Math.random() > (traffic > 30000 ? 0.15 : 0.55),
        Math.random() > (traffic > 30000 ? 0.05 : 0.25),
        Math.random() > (traffic > 40000 ? 0.1 : 0.45),
      ]);
    }, 130);
    return () => clearInterval(interval);
  }, [traffic]);

  const toggleDrive = (id: number) => {
    if (activeDrives.includes(id)) {
      setActiveDrives(activeDrives.filter((d) => d !== id));
    } else {
      setActiveDrives([...activeDrives, id]);
    }
  };

  const toggleDriveUid = (id: number) => {
    if (driveUids.includes(id)) {
      setDriveUids(driveUids.filter((d) => d !== id));
    } else {
      setDriveUids([...driveUids, id]);
    }
  };

  const toggleDriveWarning = (id: number) => {
    if (driveWarnings.includes(id)) {
      setDriveWarnings(driveWarnings.filter((d) => d !== id));
    } else {
      setDriveWarnings([...driveWarnings, id]);
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-700/60 p-5 rounded-2xl shadow-xl w-full select-none" id="server-blade-panel">
      <style>{`
        .g7-server-container {
          background-color: #242426;
          border: 4px solid #454547;
          border-radius: 8px;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.6);
          position: relative;
        }

        .g7-col {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 144px;
          padding: 8px 4px;
          border-right: 1px solid #161617;
        }

        .g7-logo {
          position: relative;
          height: 32px;
          width: 32px;
          background-color: #121213;
          border-radius: 50%;
          border: 2px solid #5a5a5c;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.6);
        }

        .g7-logo:before {
          content: 'hp';
          font-family: Georgia, serif;
          font-style: italic;
          font-weight: bold;
          font-size: 15px;
          color: #d1d5db;
        }

        .g7-handle {
          background-color: #131314;
          height: 78px;
          width: 22px;
          border-radius: 4px;
          border: 1px solid #232325;
          box-shadow: inset 0px 8px 4px #060607, inset 0px -8px 4px #060607;
          position: relative;
        }

        .g7-handle:after {
          content: '||';
          position: absolute;
          top: 30px;
          left: 5px;
          font-size: 9px;
          color: #444;
          font-weight: bold;
        }

        .g7-network {
          display: flex;
          gap: 3px;
          padding: 2px;
          background: #09090a;
          border-radius: 2px;
        }

        .g7-network-led {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .g7-vga-port {
          background-color: #0b2240;
          border: 1px solid #2563eb;
          width: 28px;
          height: 16px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 3px #030712;
        }

        .g7-uid-led {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          box-shadow: 0 0 4px #0f172a, inset -1px -1px 3px rgba(0,0,0,0.6);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .g7-uid-led.on {
          background-color: #2563eb;
          box-shadow: 0 0 10px #3b82f6, inset -1px -1px 2px rgba(255,255,255,0.8);
        }

        .g7-uid-led.off {
          background-color: #334155;
        }

        .g7-status-led {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: inset -1px -1px 2px rgba(0,0,0,0.6);
        }

        .g7-status-led.success {
          background-color: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        .g7-status-led.warning {
          background-color: #F59E0B;
          box-shadow: 0 0 6px #F59E0B;
          animation: status_led_blink 1.2s infinite;
        }

        .g7-status-led.danger {
          background-color: #EF4444;
          box-shadow: 0 0 10px #EF4444;
          animation: status_led_blink 0.5s infinite;
        }

        .g7-power-button {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: #374151;
          border: 1.5px solid #1f2937;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: all 0.2s;
        }

        .g7-power-led {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .g7-power-led.on {
          background-color: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        .g7-power-led.failed {
          background-color: #EF4444;
          box-shadow: 0 0 8px #EF4444;
          animation: power_blink 0.8s infinite;
        }

        .g7-power-led.off {
          background-color: #111827;
        }

        /* SAS Drive Trays */
        .g7-drive-cage {
          background-color: #0f0f10;
          border: 2px solid #2b2b2d;
          border-radius: 4px;
          padding: 2px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: 136px;
          height: 126px;
          justify-content: space-between;
        }

        .g7-drive {
          height: 26px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5px;
          transition: all 0.15s;
          cursor: pointer;
          font-family: monospace;
          background: #1b1b1c;
          border: 1px solid #252526;
        }

        .g7-drive.filled {
          background: linear-gradient(90deg, #2b2b2c 0%, #1a1a1b 40%, #111112 100%);
          border-left: 3px solid #7d1513;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .g7-drive:hover {
          filter: brightness(1.2);
        }

        .g7-drive .hd-id {
          font-size: 9px;
          font-weight: bold;
          color: #64748b;
        }

        .g7-drive-status-led {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .g7-drive-status-led.ok {
          background-color: #10B981;
          box-shadow: 0 0 3px #10B981;
        }

        .g7-drive-status-led.activity {
          background-color: #10B981;
          animation: fast_flicker 0.1s infinite alternate;
        }

        .g7-drive-status-led.warning {
          background-color: #f59e0b;
          box-shadow: 0 0 4px #f59e0b;
          animation: status_led_blink 0.6s infinite alternate;
        }

        .g7-drive-status-led.failed {
          background-color: #ef4444;
          box-shadow: 0 0 4px #ef4444;
          animation: status_led_blink 0.3s infinite;
        }

        .g7-drive-uid-led {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #1e293b;
        }

        .g7-drive-uid-led.on {
          background-color: #3b82f6;
          box-shadow: 0 0 3px #3b82f6;
        }

        /* DVD-ROM sliding tray styles */
        .g7-dvd-drive {
          background-color: #171718;
          border: 1px solid #28282a;
          height: 22px;
          width: 145px;
          position: relative;
          border-radius: 2px;
          display: flex;
          align-items: center;
          padding-left: 6px;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.8);
          cursor: pointer;
          transition: all 0.2s;
        }

        .g7-dvd-drive:hover {
          border-color: #3b82f6;
          background-color: #1b1b1d;
        }

        .g7-dvd-label {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: 8px;
          color: #4b5563;
          letter-spacing: 0.5px;
        }

        .g7-dvd-tray {
          position: absolute;
          top: 100%;
          left: 5px;
          width: 135px;
          background-color: #111112;
          border: 2px solid #334155;
          border-top: none;
          border-radius: 0 0 8px 8px;
          z-index: 50;
          box-shadow: 0 10px 15px rgba(0,0,0,0.5);
          overflow: hidden;
          transition: all 0.3s ease-in-out;
        }

        .g7-vents-grid {
          background: linear-gradient(180deg, #121213 0%, #0e0e0f 100%);
          border: 1px solid #232324;
          border-radius: 3px;
          height: 74px;
          width: 145px;
          display: grid;
          grid-template-rows: repeat(12, 1fr);
          padding: 2px;
          gap: 2px;
          box-shadow: inset 0 0 6px rgba(0,0,0,0.9);
        }

        .g7-vent-line {
          background-color: #0c0cc0d;
          border-bottom: 1px solid #2e2e30;
          height: 3px;
        }
      `}</style>

      {/* Title block */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-mono font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          💻 CHASIS DEDICADO: HP PROLIANT DL380 G7 - SV-02 ACTIVE NODE
        </span>
        <span className="text-[10px] text-slate-500 font-mono tracking-wide">
          Modelo horizontal original de 2U de rack :: iLO 3 Conectado
        </span>
      </div>

      {/* G7 Warning details on danger */}
      {(isHighDanger || simState === "failed") && (
        <div className="mb-4 bg-red-950/20 border border-red-900/40 text-xs font-mono p-3 rounded-lg flex items-center gap-2.5 text-red-300 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>
            <strong>ALERTA HARDWARE G7:</strong> Temperatura del núcleo crítica en SV-02 ({temperature.toFixed(1)}°C). Los ventiladores del chasis DL380 están operando al 100% de PWM (máximo sonido de turbina).
          </span>
        </div>
      )}

      {/* Main horizontal server board container with simple responsive desktop helper */}
      <div className="w-full overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="g7-server-container w-[1104px] h-[180px] flex items-center px-4 py-2 gap-0" id="server">
          
          {/* COLUMN 1: LEFT HANDLE EAR & BADGE */}
          <div className="g7-col w-[60px] flex flex-col items-center justify-around border-r-2 border-zinc-950 bg-neutral-900">
            <div className="g7-logo shadow-md hover:scale-105 transition-all" id="logo" title="HP ProLiant Enterprise Server Badge"></div>
            <div className="g7-handle flex items-center justify-center" title="Pestillo izquierdo de sujeción al rack"></div>
          </div>

          {/* COLUMN 2: NETWORK LEEDS & VGA DISP */}
          <div className="g7-col w-[110px] flex flex-col justify-between bg-stone-900/90 py-4 px-3">
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[9px] font-mono text-zinc-500 font-bold mb-1">NIC STATUS</span>
              <div className="g7-network" id="network">
                {networkFlickers.map((act, idn) => (
                  <span
                    key={`netled-${idn}`}
                    className={`g7-network-led ${
                      simState === "failed" ? "bg-red-950" : act ? "bg-emerald-400 shadow-[0_0_3px_#10b981]" : "bg-neutral-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[8px] font-mono text-zinc-500 font-bold mb-1">VGA PORT</span>
              <div className="g7-vga-port" id="vga" title="Puerto VGA analógico integrado para monitor de consola local">
                <svg xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 0 300 134" className="opacity-80">
                  <path id="Selection" fill="#1d4ed8" stroke="black" strokeWidth="1" d="M 128.00,30.00 C 128.00,30.00 205.00,30.00 205.00,30.00 207.99,30.00 211.11,29.90 214.00,30.80 229.99,35.81 225.62,51.89 223.59,64.00 220.91,79.94 220.18,96.79 202.00,102.90 198.34,104.12 195.76,103.99 192.00,104.00 192.00,104.00 108.00,104.00 108.00,104.00 104.24,103.99 101.66,104.12 98.00,102.90 79.04,96.53 78.71,77.54 75.92,61.00 73.76,48.18 71.07,35.64 87.00,30.53 87.00,30.53 128.00,30.00 128.00,30.00 Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* COLUMN 3: SYSTEM Health buttons & status switches */}
          <div className="g7-col w-[110px] flex flex-col justify-around items-center bg-stone-900/95 py-3 p-1">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-mono text-zinc-500 font-bold mb-0.5" title="Boton de Localizador del servidor (Locator ID)">UID LOCATOR</span>
              <div
                className={`g7-uid-led ${uidOn ? "on" : "off"}`}
                onClick={() => setUidOn(!uidOn)}
                title="Pulsa para encender/apagar el LED indicador de localización azul en el rack"
              />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[8px] font-mono text-zinc-500 font-bold mb-0.5">HEALTH</span>
              <div
                className={`g7-status-led ${
                  simState === "failed" ? "danger animate-pulse" :
                  isHighDanger ? "danger" :
                  isModerate ? "warning" : "success"
                }`}
                title="Estado de salud según disipación de temperatura"
              />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">POWER SWITCH</span>
              <button
                className="g7-power-button outline-none"
                onClick={() => setPowerOff(!powerOff)}
                title="Simular apagado del nodo SV-02"
              >
                <span className={`g7-power-led ${
                  simState === "failed" ? "failed" : powerOff ? "off" : "on"
                }`} />
              </button>
            </div>
          </div>

          {/* STEEL SPLITTER/BARIER */}
          <div className="g7-col w-[12px] bg-neutral-850 border-none p-0 flex items-center justify-center">
            <div className="divider w-[1px] h-full bg-neutral-950 shadow-inner" />
          </div>

          {/* DRIVE CAGE LHP_01 (Drives 1-4) */}
          <div className="g7-col w-[170px] bg-stone-900/90 py-2.5 px-3">
            <span className="text-[8px] font-mono text-zinc-500 font-bold mb-1 text-center block">DRIVE CAGE 1 (BAY 1-4)</span>
            <div className="g7-drive-cage">
              {[1, 2, 3, 4].map((idVal) => {
                const isFilled = activeDrives.includes(idVal);
                const isUid = driveUids.includes(idVal);
                const isWarn = driveWarnings.includes(idVal);

                return (
                  <div
                    key={`drive-${idVal}`}
                    className={`g7-drive ${isFilled ? "filled" : ""}`}
                    onClick={() => toggleDrive(idVal)}
                    title={`Disco duro SAS ${idVal}. Haz clic para remover o re-insertar.`}
                  >
                    <span className="hd-id">{idVal}</span>
                    <div className="g7-drive-leds">
                      <span
                        className={`g7-drive-uid-led cursor-pointer ${isUid ? "on" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDriveUid(idVal);
                        }}
                        title="Indicador de localizador de disco (UID de bahía)"
                      />
                      <span
                        className={`g7-drive-status-led ${
                          simState === "failed" ? "failed" :
                          isHighDanger ? "failed animate-ping" :
                          isWarn ? "warning" :
                          isFilled ? "activity" : "ok"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDriveWarning(idVal);
                        }}
                        title="Estatus de lectura/escritura (flickers verdes indican actividad de carga)"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DRIVE CAGE LHP_02 (Drives 5-8) */}
          <div className="g7-col w-[170px] bg-stone-900/90 py-2.5 px-3">
            <span className="text-[8px] font-mono text-zinc-500 font-bold mb-1 text-center block">DRIVE CAGE 2 (BAY 5-8)</span>
            <div className="g7-drive-cage">
              {[5, 6, 7, 8].map((idVal) => {
                const isFilled = activeDrives.includes(idVal);
                const isUid = driveUids.includes(idVal);
                const isWarn = driveWarnings.includes(idVal);

                return (
                  <div
                    key={`drive-${idVal}`}
                    className={`g7-drive ${isFilled ? "filled" : ""}`}
                    onClick={() => toggleDrive(idVal)}
                    title={`Disco duro SAS ${idVal}. Haz clic para remover o re-insertar.`}
                  >
                    <span className="hd-id">{idVal}</span>
                    <div className="g7-drive-leds">
                      <span
                        className={`g7-drive-uid-led cursor-pointer ${isUid ? "on" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDriveUid(idVal);
                        }}
                      />
                      <span
                        className={`g7-drive-status-led ${
                          simState === "failed" ? "failed" :
                          isHighDanger ? "failed animate-ping" :
                          isWarn ? "warning" :
                          isFilled ? "activity" : "ok"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDriveWarning(idVal);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEEL SPLITTER/BARIER */}
          <div className="g7-col w-[12px] bg-neutral-850 border-none p-0 flex items-center justify-center">
            <div className="divider w-[1px] h-full bg-neutral-950 shadow-inner" />
          </div>

          {/* COLUMN 6: DVD DRIVE & VENTILATION INTAKES */}
          <div className="g7-col w-[170px] flex flex-col justify-between items-center bg-stone-900 px-2 py-3 relative">
            
            {/* Interactive DVD block mimicking vintage optical CD/DVD bays */}
            <div
              className={`g7-dvd-drive flex items-center justify-between px-2 ${dvdOpen ? "border-indigo-500 bg-indigo-950/20" : ""}`}
              onClick={() => setDvdOpen(!dvdOpen)}
              title="¡HAZ CLIC AQUÍ! Pulsa para abrir/cerrar la lectora DVD clásica de este chasis"
            >
              <span className="g7-dvd-label tracking-wider font-extrabold flex items-center gap-1 text-[8px]">
                <Disc className={`w-2.5 h-2.5 ${dvdOpen ? "animate-spin text-indigo-400" : "text-slate-500"}`} />
                DVD-ROM G7
              </span>
              <span className="g7-dvd-eject-btn hover:bg-slate-350 transition-colors" />
              <span className="g7-dvd-eject-led active animate-pulse" />
              
              {/* Ejection visual tray block - opens dynamically! */}
              <div
                className={`g7-dvd-tray absolute top-[23px] left-[5px] right-[5px] bg-[#111] border-2 border-indigo-500/80 rounded-b-lg p-2 flex flex-col items-center gap-1.5 transition-all duration-300 shadow-2xl ${
                  dvdOpen ? "opacity-100 scale-100 h-[85px] visible" : "opacity-0 scale-50 h-0 invisible pointer-events-none"
                }`}
                onClick={(e) => e.stopPropagation()} // Prevent closing immediately
              >
                <div className="relative w-10 h-10 border border-slate-700 rounded-full flex items-center justify-center bg-zinc-800 animate-spin-slow">
                  <span className="w-4 h-4 bg-zinc-950 rounded-full border border-slate-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[7.5px] font-mono font-extrabold text-indigo-300 block leading-tight">SYSTEMS_LAPLACE_STABILIZER</span>
                  <span className="text-[6.5px] font-mono text-emerald-400 block mt-0.5 leading-none">v1.2.0 • AUTORUN ON PLAY</span>
                </div>
              </div>
            </div>

            {/* High-density ventilation airflow grids */}
            <div className="g7-vents-grid w-full" id="vents">
              {Array.from({ length: 12 }).map((_, vi) => (
                <div key={`g7vent-${vi}`} className="g7-vent-line" />
              ))}
            </div>
          </div>

          {/* STEEL SPLITTER/BARIER */}
          <div className="g7-col w-[12px] bg-neutral-850 border-none p-0 flex items-center justify-center">
            <div className="divider w-[1px] h-full bg-neutral-950 shadow-inner" />
          </div>

          {/* COLUMN 7: SERVER NAMEPLATE & RIGHT BRACE EAR (HP ProLiant DL380 G7) */}
          <div className="g7-col w-[120px] flex flex-col items-center justify-between py-4 px-2 rounded-r-md bg-neutral-950">
            <div
              className="text-center font-bold font-mono py-1.5 px-1 bg-zinc-900 border border-zinc-800 text-zinc-300 w-full rounded select-none shadow-sm"
              style={{ fontSize: "8px", lineHeight: "1.3" }}
              id="name"
            >
              HP ProLiant
              <br />
              <span className="text-indigo-400 font-bold">DL380 G7</span>
              <br />
              <span className="text-[7.5px] text-slate-500 font-semibold block mt-1 tracking-wider uppercase bg-black px-1 py-0.5 rounded">
                XEON HARDWARE
              </span>
            </div>

            <div className="g7-handle flex items-center justify-center" id="right_handle" title="Pestillo derecho de sujeción al rack"></div>
          </div>

        </div>
      </div>

      {/* Guide/Mapping footer block inside the G7 blade component */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-[11px] leading-relaxed flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2.5 gap-2.5">
        <div className="flex gap-2 items-start font-mono text-slate-400">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span><strong>Interacción Directa:</strong> Retira unidades (1-8), cambia warnings, abre la lectora DVD haciendo clic en ella, o activa el conmutador azul de balizas UID Locator.</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded shrink-0 font-bold">
          SAS RAID CONTROLLER INT_0
        </span>
      </div>

    </div>
  );
}
