import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, Cpu, Disc, ShieldCheck, Play, RotateCcw, 
  Terminal, Sparkles, AlertOctagon, HelpCircle, Flame, 
  Activity, ArrowRight, ShieldAlert, Wifi, Battery, Volume2,
  ArrowLeft, Lock, Globe, GraduationCap
} from "lucide-react";
import { SimState, ProtocolOption } from "../types";

// Types of packets flying
interface DataPacket {
  id: string;
  type: "isc" | "notif";
  startX: number;
  startY: number;
}

interface PhysicalEmulationPanelProps {
  temperature: number;
  traffic: number;
  limitTemp: number;
  simState: SimState;
  currentTime: number;
  activeProtocol: ProtocolOption | null;
  startSimulation: () => void;
  handleReset: () => void;
  applyProtocolOnTheFly: (protocol: ProtocolOption) => void;
  protocols: ProtocolOption[];
}

export default function PhysicalEmulationPanel({
  temperature,
  traffic,
  limitTemp,
  simState,
  currentTime,
  activeProtocol,
  startSimulation,
  handleReset,
  applyProtocolOnTheFly,
  protocols,
}: PhysicalEmulationPanelProps) {
  // Local active tabs in the smartphone
  const [phoneTab, setPhoneTab] = useState<"inscripcion" | "notificacion">("inscripcion");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [notificationActive, setNotificationActive] = useState(false);
  const [phoneTime, setPhoneTime] = useState("12:45");

  // Multi-purpose 3D Phone controls matching user design
  const [isChromeOpen, setChromeOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false); // Default to false (Flat 2D Mode) for perfect cursor clicks
  const [privacyMode, setPrivacyMode] = useState<"full" | "notif">("full");

  // Refs for smooth 3D tilt tracking at 60fps
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const angleValRef = useRef<HTMLSpanElement>(null);
  const snooperRef = useRef<HTMLDivElement>(null);

  // Motion physics and interaction trackers
  const motionStateRef = useRef({
    rx: 0, ry: 0, priv: 0,
    targetRx: 0, targetRy: 0, targetPriv: 0,
    hasInteracted: false,
    time: 0,
  });
  
  // Hard Drive Bay states matching user requirements
  const [activeDrives, setActiveDrives] = useState<number[]>([1, 2, 5, 6, 7, 8]); // inserted slots
  const [driveUids, setDriveUids] = useState<number[]>([1, 6]);
  const [driveWarnings, setDriveWarnings] = useState<number[]>([3, 7]);
  const [uidGlobalOn, setUidGlobalOn] = useState(true);
  const [dvdOpen, setDvdOpen] = useState(false);

  // Floating packets
  const [packets, setPackets] = useState<DataPacket[]>([]);

  // Telemetry Console logs
  const [logs, setLogs] = useState<string[]>([]);
  const consoleContainerRef = useRef<HTMLDivElement>(null);
  const [loginTime] = useState(() => new Date().toString().replace(/GMT.*/, '').trim());

  // Refs for tracking telemetry log timing to prevent duplicate prints
  const lastLoggedTimeRef = useRef<number>(-1);
  const lastLoggedStateRef = useRef<string>("");
  const lastWarningSimTimeRef = useRef<number>(-1);
  const hasLoggedCollapseRef = useRef<boolean>(false);

  // Smooth rotation tick loop at 60+ FPS
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Move custom eye spy pointer
      if (snooperRef.current) {
        snooperRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }

      if (!is3DMode) return; // Skip 3D tilt tracking if not in 3D Mode
      motionStateRef.current.hasInteracted = true;

      if (phoneRef.current) {
        const rect = phoneRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.45;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normDist = Math.min(dist / maxDist, 1);

        const maxTilt = 40;
        let targetRy = (dx / maxDist) * maxTilt;
        let targetRx = -(dy / maxDist) * maxTilt;

        motionStateRef.current.targetRy = Math.max(-maxTilt, Math.min(maxTilt, targetRy));
        motionStateRef.current.targetRx = Math.max(-maxTilt, Math.min(maxTilt, targetRx));

        const angle = Math.round(normDist * 85);
        motionStateRef.current.targetPriv = Math.pow(normDist, 1.3) * 0.95;

        if (angleValRef.current) {
          angleValRef.current.textContent = `${angle}°`;
        }
      }
    };

    const handleMouseLeave = () => {
      if (!is3DMode) return;
      motionStateRef.current.targetRx = 0;
      motionStateRef.current.targetRy = 0;
      motionStateRef.current.targetPriv = 0;
      if (angleValRef.current) {
        angleValRef.current.textContent = `0°`;
      }
    };

    const handleTouchStart = () => {
      if (is3DMode) {
        motionStateRef.current.hasInteracted = true;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("touchstart", handleTouchStart, { passive: true });

    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const state = motionStateRef.current;
      if (!is3DMode) {
        state.rx = 0;
        state.ry = 0;
        state.priv = 0;
        state.targetRx = 0;
        state.targetRy = 0;
        state.targetPriv = 0;
        if (angleValRef.current) {
          angleValRef.current.textContent = `0°`;
        }
      } else {
        if (!state.hasInteracted) {
          state.time += 0.015;
          state.targetRy = Math.sin(state.time) * 25;
          state.targetRx = Math.cos(state.time * 0.8) * 15;

          const dist = Math.sqrt(state.targetRx * state.targetRx + state.targetRy * state.targetRy);
          const maxTilt = 40;
          const normDist = Math.min(dist / maxTilt, 1);

          state.targetPriv = Math.pow(normDist, 1.3) * 0.95;
          const angle = Math.round(normDist * 85);
          if (angleValRef.current) {
            angleValRef.current.textContent = `${angle}°`;
          }
        }

        state.rx = lerp(state.rx, state.targetRx, 0.08);
        state.ry = lerp(state.ry, state.targetRy, 0.08);
        state.priv = lerp(state.priv, state.targetPriv, 0.1);
      }

      if (phoneRef.current) {
        phoneRef.current.style.transform = `rotateX(${state.rx}deg) rotateY(${state.ry}deg)`;
      }

      if (screenRef.current) {
        screenRef.current.style.setProperty("--priv-opacity", String(privacyMode === "full" ? state.priv : 0));
      }

      if (notifRef.current) {
        notifRef.current.style.setProperty("--notif-priv", String(privacyMode === "notif" ? state.priv : 0));
      }

      rafId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("touchstart", handleTouchStart);
      cancelAnimationFrame(rafId);
    };
  }, [privacyMode, is3DMode]);

  // Simple clock effect for the phone
  useEffect(() => {
    const d = new Date();
    setPhoneTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // Sync logs when the simulation variables update
  useEffect(() => {
    if (simState === "idle") {
      lastLoggedTimeRef.current = -1;
      lastLoggedStateRef.current = "idle";
      lastWarningSimTimeRef.current = -1;
      hasLoggedCollapseRef.current = false;

      setLogs([
        `[${new Date().toLocaleTimeString()}] iLO 3 Core: DL380 G7 initialized in idle state.`,
        `[${new Date().toLocaleTimeString()}] SYS_MONITOR: All 8 SAS bays scanned. RAID 5 stable.`,
        `[${new Date().toLocaleTimeString()}] LAPLACE_AGENT: Waiting for step impulse (Escalón Unitario) from student portal...`,
      ]);
      return;
    }

    // Completely avoid duplicate updates if the simulation time hasn't progressed, except when state changes
    const stateActive = simState === "spiking" || simState === "stabilizing";
    if (
      stateActive &&
      currentTime === lastLoggedTimeRef.current &&
      simState === lastLoggedStateRef.current
    ) {
      return;
    }

    if (simState === "failed") {
      if (hasLoggedCollapseRef.current) return;
      hasLoggedCollapseRef.current = true;
    }

    const stamp = new Date().toLocaleTimeString();
    const fanSpeed = Math.round(1500 + Math.pow((temperature - 38) / (90 - 38), 2) * 11500);
    
    let newLog = `[${stamp}] INFO: Traffic rate = ${traffic} req/s | CPU Temp = ${temperature.toFixed(1)}°C | Fan Speed = ${fanSpeed} RPM`;
    
    if (temperature >= limitTemp || simState === "failed") {
      newLog = `[${stamp}] CRITICAL THERMAL EVENT: Silicon temperature reaches ${temperature.toFixed(1)}°C limit! Silicon collapse imminent!`;
    } else if (temperature > 78) {
      // Debounce: only log warning once per 1.0 seconds of simulation time
      if (lastWarningSimTimeRef.current !== -1 && (currentTime - lastWarningSimTimeRef.current < 1.0)) {
        // Skip adding duplicate warning line to keep terminal quiet
        return;
      }
      lastWarningSimTimeRef.current = currentTime;
      newLog = `[${stamp}] WARNING: Overheat condition detected. Fan Speed maximized at ${fanSpeed} RPM. Dispersing heat in S-plane...`;
    } else if (activeProtocol) {
      newLog = `[${stamp}] LAPLACE_ACCOUPLEMENT: Active model ${activeProtocol.name} is damping pole oscillations (ζ = ${activeProtocol.zeta.toFixed(2)}).`;
    }

    setLogs((prev) => {
      const next = [...prev, newLog];
      if (next.length > 30) next.shift(); // Keep logs memory clean
      return next;
    });

    lastLoggedTimeRef.current = currentTime;
    lastLoggedStateRef.current = simState;
  }, [currentTime, simState, activeProtocol, temperature, traffic, limitTemp]);

  // Autoscroll the console logs inside its own container without scrolling the whole page/window
  useEffect(() => {
    if (consoleContainerRef.current) {
      const container = consoleContainerRef.current;
      container.scrollTop = container.scrollHeight;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [logs]);

  // Handle phone step pulse click (triggers data packet + increments enrolled stats)
  const triggerStepPacket = () => {
    setEnrolledCount(prev => prev + 1);
    
    // Auto-trigger simulation if it hasn't started yet so the system is connected!
    if (simState === "idle") {
      startSimulation();
    }

    // Launch flying data packet
    const id = Math.random().toString();
    const newPacket: DataPacket = {
      id,
      type: "isc",
      startX: 40,
      startY: 180,
    };
    setPackets(prev => [...prev, newPacket]);

    // Keep packet list clean after travel completes
    setTimeout(() => {
      setPackets(prev => prev.filter(p => p.id !== id));
    }, 1800);

    // Append beautiful console log directly
    setLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] PORTAL_UNI_GUAJIRA: Click 'Inscribir Asignatura' - Spawning step function impulse u(t).`
    ]);
  };

  // Notification continuously emitting packets if enabled
  useEffect(() => {
    if (!notificationActive) return;

    const interval = setInterval(() => {
      const id = Math.random().toString();
      const newPacket: DataPacket = {
        id,
        type: "notif",
        startX: 40,
        startY: 280,
      };
      setPackets(prev => [...prev, newPacket]);

      setTimeout(() => {
        setPackets(prev => prev.filter(p => p.id !== id));
      }, 1800);

      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] PORTAL_UNI_GUAJIRA: Continuous Sinusoidal alert sent to CPU filter.`
      ]);
    }, 700);

    return () => clearInterval(interval);
  }, [notificationActive]);

  // Calculations for physical speed fan based on current temperature
  const fanRpm = Math.round(1500 + Math.pow(Math.max(0, temperature - 38) / (limitTemp - 38), 2) * 11500);
  const fanDuty = Math.min(100, Math.round(((fanRpm - 1500) / 11500) * 100));

  const toggleDrive = (id: number) => {
    if (activeDrives.includes(id)) {
      setActiveDrives(activeDrives.filter((d) => d !== id));
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] G7_RAID_CONTROLLER: Drive in bay ${id} was HOT-REMOVED.`]);
    } else {
      setActiveDrives([...activeDrives, id]);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] G7_RAID_CONTROLLER: Drive in bay ${id} was HOT-INSERTED. Re-establishing RAID parity.`]);
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
    <div className="bg-slate-900 border border-slate-700/60 p-6 rounded-2xl shadow-xl w-full flex flex-col gap-6" id="physical-emulation-main">
      <style>{`
        /* Scoped 3D Phone and Scene styling from User Design */
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');

        .custom-scene-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(15, 23, 42, 0.4);
          padding: 1.5rem;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(51, 65, 85, 0.4);
          color: #d1d5db;
          font-family: 'DM Sans', sans-serif;
          user-select: none;
          min-height: 460px;
        }

        .custom-scene-container .scene {
          perspective: 800px;
          display: flex;
          align-items: center;
          gap: 2rem;
          transform-style: preserve-3d;
        }

        /* Support for perfect clicks inside nested iframes by disabling 3D transforms in Flat mode */
        .custom-scene-container.flat-mode {
          min-height: auto;
          perspective: none !important;
        }
        @keyframes network_pulse_anim {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .glowing-bus-cable {
          stroke-dasharray: 6 12;
          animation: network_pulse_anim 1.5s linear infinite;
        }
        .glowing-bus-cable-fast {
          stroke-dasharray: 4 8;
          animation: network_pulse_anim 0.5s linear infinite;
        }
        .custom-scene-container.flat-mode .scene {
          perspective: none !important;
          transform-style: flat !important;
        }
        .custom-scene-container.flat-mode .phone {
          transform-style: flat !important;
          transform: none !important;
          box-shadow: 0 15px 40px rgba(0,0,0,0.3) !important;
        }
        .custom-scene-container.flat-mode .bezel {
          transform: none !important;
        }
        .custom-scene-container.flat-mode .edge {
          display: none !important;
        }
        .custom-scene-container.flat-mode .corner {
          display: none !important;
        }

        .custom-scene-container .phone {
          width: 200px;
          height: 420px;
          position: relative;
          transform-style: preserve-3d;
          border-radius: 30px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.12);
        }

        .custom-scene-container .back {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, #c0d0de, #a8bcd0, #b4c4d4);
          border-radius: 30px;
          transform: translateZ(-16px);
        }

        .custom-scene-container .edge {
          position: absolute;
          background: linear-gradient(180deg, #c8d8e5, #a8b8ca, #b8c8d6);
        }

        .custom-scene-container .edge-r {
          top: 30px;
          bottom: 30px;
          right: 0;
          width: 16px;
          transform-origin: right center;
          transform: rotateY(-90deg);
        }

        .custom-scene-container .edge-l {
          top: 30px;
          bottom: 30px;
          left: 0;
          width: 16px;
          transform-origin: left center;
          transform: rotateY(90deg);
        }

        .custom-scene-container .edge-t {
          left: 30px;
          right: 30px;
          top: 0;
          height: 16px;
          transform-origin: center top;
          transform: rotateX(-90deg);
          background: linear-gradient(90deg, #c0d0de, #b0c2d2, #c4d4e2);
        }

        .custom-scene-container .edge-b {
          left: 30px;
          right: 30px;
          bottom: 0;
          height: 16px;
          transform-origin: center bottom;
          transform: rotateX(90deg);
          background: linear-gradient(90deg, #b0c0d0, #a0b0c2, #b8c8d6);
        }

        .custom-scene-container .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          transform-style: preserve-3d;
        }

        .custom-scene-container .corner-tl { top: 0; left: 0; }
        .custom-scene-container .corner-tr { top: 0; right: 0; }
        .custom-scene-container .corner-bl { bottom: 0; left: 0; }
        .custom-scene-container .corner-br { bottom: 0; right: 0; }

        .custom-scene-container .c-layer {
          position: absolute;
          inset: 0;
        }

        .custom-scene-container .corner-tl .c-layer { border-top: 2px solid #b3c3d3; border-left: 2px solid #b3c3d3; border-radius: 30px 0 0 0; }
        .custom-scene-container .corner-tr .c-layer { border-top: 2px solid #b3c3d3; border-right: 2px solid #b3c3d3; border-radius: 0 30px 0 0; }
        .custom-scene-container .corner-bl .c-layer { border-bottom: 2px solid #b3c3d3; border-left: 2px solid #b3c3d3; border-radius: 0 0 0 30px; }
        .custom-scene-container .corner-br .c-layer { border-bottom: 2px solid #b3c3d3; border-right: 2px solid #b3c3d3; border-radius: 0 0 30px 0; }

        .custom-scene-container .edge-r::before {
          content: '';
          position: absolute;
          top: 110px;
          left: 2px;
          right: 2px;
          height: 36px;
          background: #cdd8e4;
          border-radius: 2px;
          transform: translateZ(1px);
          box-shadow: 0 0 0 1px #90a1b3;
        }

        .custom-scene-container .edge-l::before {
          content: '';
          position: absolute;
          top: 90px;
          left: 2px;
          right: 2px;
          height: 26px;
          background: #cdd8e4;
          border-radius: 2px;
          transform: translateZ(1px);
          box-shadow: 0 0 0 1px #90a1b3;
        }

        .custom-scene-container .edge-l::after {
          content: '';
          position: absolute;
          top: 126px;
          left: 2px;
          right: 2px;
          height: 26px;
          background: #cdd8e4;
          border-radius: 2px;
          transform: translateZ(1px);
          box-shadow: 0 0 0 1px #90a1b3;
        }

        .custom-scene-container .edge-b::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) translateZ(-1px);
          width: 20px;
          height: 7px;
          background: #3a4650;
          border-radius: 3.5px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.5), inset 0 -0.5px 1px rgba(0,0,0,0.2);
        }

        .custom-scene-container .edge-b::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(calc(-50% + 22px), -50%);
          width: 2px;
          height: 2px;
          background: #4a5a68;
          border-radius: 50%;
          box-shadow: 4px 0 0 #4a5a68, 8px 0 0 #4a5a68, -44px 0 0 #4a5a68, -48px 0 0 #4a5a68, -52px 0 0 #4a5a68;
        }

        .custom-scene-container .bezel {
          width: 100%;
          height: 100%;
          background: linear-gradient(160deg, #d0dde8, #b8cad8, #c4d4e2);
          border-radius: 30px;
          padding: 3px;
          position: relative;
          transform: translateZ(1px);
        }

        .custom-scene-container .inner {
          width: 100%;
          height: 100%;
          background: #080808;
          border-radius: 27px;
          padding: 3px;
        }

        .custom-scene-container .screen {
          width: 100%;
          height: 100%;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          background: #080808;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
        }

        .custom-scene-container .screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #000;
          opacity: var(--priv-opacity, 0);
          z-index: 20;
          pointer-events: none;
          border-radius: inherit;
        }

        .custom-scene-container .screen::after {
          content: '';
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #060606;
          z-index: 30;
          box-shadow: inset 0 0 2px rgba(30,30,60,0.6), 0 0 0 0.5px rgba(255,255,255,0.04);
        }

        .custom-scene-container .wallpaper {
          position: absolute;
          inset: 0;
          z-index: 1;
          border-radius: inherit;
          background: radial-gradient(ellipse 55% 45% at 60% 35%, rgba(100,210,200,0.9), transparent 70%), radial-gradient(ellipse 50% 55% at 35% 60%, rgba(80,190,180,0.7), transparent 65%), radial-gradient(ellipse 40% 30% at 50% 50%, rgba(140,220,210,0.5), transparent), linear-gradient(155deg, #1a6b6a 0%, #2a9a98 25%, #48c4b8 45%, #3aada5 55%, #1a7a78 75%, #155858 100%);
        }

        .custom-scene-container .wallpaper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('https://wallpapercg.com/media/ts_orig/33793.webp') center/cover no-repeat;
          z-index: 1;
          border-radius: inherit;
        }

        .custom-scene-container .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 16px 0;
          position: relative;
          z-index: 10;
          height: 28px;
        }

        .custom-scene-container .status-bar svg { display: block; }

        .custom-scene-container .time {
          font-size: 0.62rem;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
        }

        .custom-scene-container .status-icons {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .custom-scene-container .notification {
          margin: 38px 9px 0;
          background: rgba(18,16,26,0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 18px;
          padding: 12px 14px;
          position: relative;
          z-index: 10;
        }

        .custom-scene-container .notification::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #000;
          opacity: var(--notif-priv, 0);
          z-index: 15;
          border-radius: 18px;
          pointer-events: none;
        }

        .custom-scene-container .notif-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 5px;
        }

        .custom-scene-container .notif-icon {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          background: #3b82f6;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .custom-scene-container .notif-icon svg { display: block; }

        .custom-scene-container .notif-app { font-size: 0.5rem; color: rgba(255,255,255,0.4); }
        .custom-scene-container .notif-when { font-size: 0.46rem; color: rgba(255,255,255,0.25); margin-left: auto; }

        .custom-scene-container .notif-title {
          display: block;
          font-size: 0.6rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin-bottom: 2px;
          text-decoration: none;
        }

        .custom-scene-container .notif-body {
          font-size: 0.52rem;
          color: rgba(255,255,255,0.48);
          line-height: 1.45;
        }

        .custom-scene-container .dock {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 25;
          background: rgba(0,0,0,0.22);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 8px 14px;
        }

        .custom-scene-container .dock-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .custom-scene-container .dock-icon:hover {
          transform: scale(1.1);
        }

        .custom-scene-container .dock-icon svg { display: block; }

        .custom-scene-container .di-phone { background: linear-gradient(145deg, #34d058, #22a847); }
        .custom-scene-container .di-msg { background: linear-gradient(145deg, #5b7cf7, #3b5ce4); }
        .custom-scene-container .di-chrome { background: linear-gradient(145deg, #ea4335, #dd3327); }
        .custom-scene-container .di-cam { background: linear-gradient(145deg, #f5a623, #e8931a); }

        .custom-scene-container .home-bar {
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 88px;
          height: 3.5px;
          background: rgba(255,255,255,0.35);
          border-radius: 2px;
          z-index: 25;
          cursor: pointer;
        }

        .custom-scene-container .panel {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          max-width: 200px;
        }

        .custom-scene-container .panel-title {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #1a1816;
        }

        .custom-scene-container .panel-sub {
          font-size: 0.62rem;
          color: #8a8880;
          font-family: 'JetBrains Mono', monospace;
          margin-top: 0.2rem;
        }

        .custom-scene-container .mode-toggle {
          display: flex;
          background: #e4e1dc;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #d8d5d0;
        }

        .custom-scene-container .mode-btn {
          flex: 1;
          padding: 0.5rem 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.54rem;
          background: transparent;
          color: #8a8880;
          border: none;
          cursor: pointer;
          transition: background 0.25s, color 0.25s;
          text-align: center;
          white-space: nowrap;
        }

        .custom-scene-container .mode-btn.active {
          background: #fff;
          color: #1a1816;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .custom-scene-container .angle-readout {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: #a8a49c;
        }

        .custom-scene-container .angle-val { color: #1a1816; font-weight: 500; }

        .custom-scene-container .hint {
          font-size: 0.55rem;
          color: #b0aca4;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.6;
        }

        @media (max-width: 640px) {
          .custom-scene-container .scene { flex-direction: column; gap: 1.5rem; }
          .custom-scene-container .phone { width: 170px; height: 357px; }
        }

        #snooper {
          position: fixed;
          top: 0;
          left: 0;
          font-size: 2.2rem;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
          opacity: 0;
          transition: opacity 0.3s;
        }

        .custom-scene-container:hover #snooper {
          opacity: 1;
        }

        /* Server & Rack Styles preserved from original code */
        .g7-server-container {
          background-color: #242426;
          border: 4px solid #454547;
          border-radius: 8px;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.9);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .g7-col {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          min-height: 44px;
          padding: 6px 14px;
          border-bottom: 1.5px solid #161617;
        }

        .g7-handle-horiz {
          background-color: #131314;
          width: 50px;
          height: 12px;
          border-radius: 3px;
          border: 1px solid #232325;
          box-shadow: inset 8px 0px 4px #060607, inset -8px 0px 4px #060607;
        }

        .g7-logo {
          position: relative;
          height: 28px;
          width: 28px;
          background-color: #121213;
          border-radius: 50%;
          border: 1.5px solid #5a5a5c;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .g7-logo:before {
          content: 'hp';
          font-family: Georgia, serif;
          font-style: italic;
          font-weight: bold;
          font-size: 13px;
          color: #d1d5db;
        }

        .g7-handle {
          background-color: #131314;
          height: 72px;
          width: 18px;
          border-radius: 3px;
          border: 1px solid #232325;
          box-shadow: inset 0px 8px 4px #060607, inset 0px -8px 4px #060607;
        }

        .g7-network {
          display: flex;
          gap: 2.5px;
          padding: 1.5px;
          background: #09090a;
          border-radius: 2px;
        }

        .g7-network-led {
          width: 4.5px;
          height: 4.5px;
          border-radius: 50%;
        }

        .g7-vga-port {
          background-color: #0b2240;
          border: 1px solid #2563eb;
          width: 24px;
          height: 13px;
          border-radius: 1px;
        }

        .g7-uid-led {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .g7-uid-led.on {
          background-color: #2563eb;
          box-shadow: 0 0 10px #3b82f6;
        }

        .g7-uid-led.off {
          background-color: #334155;
        }

        .g7-status-led {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .g7-status-led.success {
          background-color: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        .g7-status-led.warning {
          background-color: #F59E0B;
          box-shadow: 0 0 6px #F59E0B;
          animation: g7_blink 1.2s infinite;
        }

        .g7-status-led.danger {
          background-color: #EF4444;
          box-shadow: 0 0 10px #EF4444;
          animation: g7_blink 0.5s infinite;
        }

        .g7-power-button {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: #374151;
          border: 1px solid #1f2937;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .g7-power-led {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .g7-power-led.on {
          background-color: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        .g7-power-led.failed {
          background-color: #EF4444;
          box-shadow: 0 0 8px #EF4444;
          animation: power_blink_anim 0.8s infinite;
        }

        .g7-power-led.off {
          background-color: #111827;
        }

        /* SAS Drive Trays */
        .g7-drive-cage {
          background-color: #0f0f10;
          border: 1.5px solid #2b2b2d;
          border-radius: 3px;
          padding: 1.5px;
          display: flex;
          flex-direction: column;
          gap: 2.5px;
          height: 110px;
          justify-content: space-between;
        }

        .g7-drive {
          height: 24px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
          cursor: pointer;
          font-family: monospace;
          background: #1b1b1c;
          border: 1.5px solid #252526;
        }

        .g7-drive.filled {
          background: linear-gradient(90deg, #2b2b2c 0%, #1a1a1b 40%, #111112 100%);
          border-left: 2.5px solid #7d1513;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .g7-drive .hd-id {
          font-size: 8px;
          font-weight: bold;
          color: #64748b;
        }

        .g7-drive-leds {
          display: flex;
          gap: 2px;
          align-items: center;
        }

        .g7-drive-status-led {
          width: 4px;
          height: 4px;
          border-radius: 50%;
        }

        .g7-drive-status-led.ok {
          background-color: #10B981;
          box-shadow: 0 0 3px #10B981;
        }

        .g7-drive-status-led.activity {
          background-color: #10B981;
          animation: g7_fast_flicker 0.1s infinite alternate;
        }

        .g7-drive-status-led.warning {
          background-color: #f59e0b;
          box-shadow: 0 0 4px #f59e0b;
          animation: g7_blink 0.6s infinite alternate;
        }

        .g7-drive-status-led.failed {
          background-color: #ef4444;
          box-shadow: 0 0 4px #ef4444;
          animation: g7_blink 0.3s infinite;
        }

        .g7-drive-uid-led {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #1e293b;
        }

        .g7-drive-uid-led.on {
          background-color: #3b82f6;
          box-shadow: 0 0 3px #3b82f6;
        }

        .g7-dvd-drive {
          background-color: #171718;
          border: 1px solid #28282a;
          height: 18px;
          width: 105px;
          position: relative;
          border-radius: 2px;
          display: flex;
          align-items: center;
          padding-left: 4px;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.8);
          cursor: pointer;
        }

        .g7-dvd-label {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: 7px;
          color: #4b5563;
        }

        .g7-dvd-tray {
          position: absolute;
          top: 100%;
          left: 4px;
          width: 97px;
          background-color: #111112;
          border: 1.5px solid #4f46e5;
          border-top: none;
          border-radius: 0 0 6px 6px;
          z-index: 50;
          box-shadow: 0 10px 15px rgba(0,0,0,0.5);
          overflow: hidden;
          transition: all 0.25s ease-in-out;
        }

        .g7-vents-grid {
          background: linear-gradient(180deg, #121213 0%, #0e0e0f 100%);
          border: 1px solid #232324;
          border-radius: 2px;
          height: 64px;
          width: 105px;
          display: grid;
          grid-template-rows: repeat(12, 1fr);
          padding: 1px;
          gap: 1.5px;
        }

        .g7-vent-line {
          background-color: #0c0cc0d;
          border-bottom: 1.5px solid #2e2e30;
          height: 2px;
        }

        @keyframes g7_fast_flicker {
          0% { opacity: 0.1; }
          100% { opacity: 1; }
        }

        @keyframes g7_blink {
          50% { opacity: 0.3; }
        }

        @keyframes power_blink_anim {
          50% { background-color: #3f0712; }
        }

        /* Scroller styling for simple, clear, tech appearance */
        .console-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .console-scrollbar::-webkit-scrollbar-track {
          background: #020617;
        }
        .console-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 3px;
        }
      `}</style>

      {/* Header of physical emulation board */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Emulación Física de Infraestructura
          </span>
          <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
            Interacción Multipropósito en Tiempo Real
          </h2>
        </div>
        <div className="flex gap-2">
          {simState !== "idle" && (
            <button
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Resetear Simulación
            </button>
          )}
          <span className="text-[10px] uppercase font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg">
            Plano s-t Integrado
          </span>
        </div>
      </div>

      {/* THREE-COLUMN LAYOUT WITH ANIMATED BRIDGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">
        
        {/* =========================================================================
            COLUMN 1 (LG: 4): THE CLIENT MOBILE (iPhone Mockup / 3D Galaxy S26 Ultra)
            ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">
              📱 Vista de Emisor - 3D Privacy Screen Emulation (Client Input)
            </span>
            <p className="text-[10px] text-zinc-400 font-sans leading-normal mb-1">
              Prueba el ángulo de privacidad moviendo el cursor, o navega libremente por las aplicaciones del teléfono interactivo.
            </p>
            
            {/* Custom Laboratory staging card for 3D simulation */}
            <div className={`custom-scene-container border border-slate-700/40 relative shadow-inner overflow-visible ${!is3DMode ? "flat-mode" : ""}`}>
              
              {/* Snooper Follower Element */}
              <div id="snooper" ref={snooperRef}>👀</div>

              <div className="scene">
                {/* 3D Phone body mapping cursor tilt */}
                <div className="phone" ref={phoneRef} style={{ transformStyle: "preserve-3d" }}>
                  <div className="back"></div>
                  
                  {/* Real 3D physical edges and buttons */}
                  <div className="edge edge-r"></div>
                  <div className="edge edge-l"></div>
                  <div className="edge edge-t"></div>
                  <div className="edge edge-b"></div>

                  <div className="corner corner-tl"><div className="c-layer"></div></div>
                  <div className="corner corner-tr"><div className="c-layer"></div></div>
                  <div className="corner corner-bl"><div className="c-layer"></div></div>
                  <div className="corner corner-br"><div className="c-layer"></div></div>

                  {/* Bezels and screen display */}
                  <div className="bezel">
                    <div className="inner">
                      <div className="screen" ref={screenRef}>
                        
                        {/* -------------------------------------------------------------
                            MOCK WEB BROWSER VIEW (chrome opened)
                            ------------------------------------------------------------- */}
                        {isChromeOpen ? (
                          <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col justify-between text-slate-100 select-none">
                            {/* Browser Address Bar Header */}
                            <div className="bg-slate-900 border-b border-slate-800 p-2 pt-8 flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 justify-between">
                                <button 
                                  onClick={() => setChromeOpen(false)}
                                  className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-md py-1 px-2 flex items-center gap-1.5 justify-center">
                                  <Lock className="w-2.5 h-2.5 text-emerald-500" />
                                  <span className="text-[8.5px] font-mono text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap">uniguajira.edu.co/matricula</span>
                                </div>
                                <div className="w-4"></div>
                              </div>
                            </div>

                            {/* UniGuajira Brand Header */}
                            <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-3 py-1.5 text-white flex items-center justify-between border-b border-emerald-950 shadow-sm">
                              <div className="flex items-center gap-1">
                                <span className="bg-amber-400 w-3 h-3 rounded-full flex items-center justify-center font-bold text-emerald-950 text-[7px]">
                                  U
                                </span>
                                <span className="font-extrabold text-[8px] tracking-tight">UniGuajira</span>
                              </div>
                              <span className="text-[6.5px] text-amber-300 font-mono">Portal Estudiantes</span>
                            </div>

                            {/* Tab Toggles for Enroll / Stress */}
                            <div className="bg-slate-900 grid grid-cols-2 p-0.5 gap-0.5 border-b border-slate-950">
                              <button
                                onClick={() => setPhoneTab("inscripcion")}
                                className={`text-[8px] font-mono font-bold py-1 rounded transition-all ${
                                  phoneTab === "inscripcion"
                                    ? "bg-slate-800 text-amber-400"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                📥 Matrícula u(t)
                              </button>
                              <button
                                onClick={() => setPhoneTab("notificacion")}
                                className={`text-[8px] font-mono font-bold py-1 rounded transition-all ${
                                  phoneTab === "notificacion"
                                    ? "bg-slate-800 text-amber-400"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                🔔 Alertas sin(wt)
                              </button>
                            </div>

                            {/* Browser Contents view */}
                            <div className="flex-grow p-2.5 flex flex-col justify-between overflow-y-auto">
                              {phoneTab === "inscripcion" ? (
                                <div className="flex-grow flex flex-col justify-between gap-1">
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center bg-slate-900 p-1.5 rounded border border-slate-800">
                                      <span className="text-[7.5px] text-slate-400 font-mono">Estudiante ID:</span>
                                      <span className="text-[8px] font-mono font-bold text-emerald-400">1003456 • ACTIVO</span>
                                    </div>
                                    <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60 text-[8px] space-y-1 text-slate-300">
                                      <span className="font-bold text-white block">Asignaturas Registradas:</span>
                                      <div className="flex justify-between text-[7px] text-slate-400">
                                        <span>Control de Sistemas I</span>
                                        <span className="text-emerald-500">Inscrito ✓</span>
                                      </div>
                                      <div className="flex justify-between text-[7px] text-slate-400">
                                        <span>Álgebra Vectorial</span>
                                        <span className="text-emerald-500">Inscrito ✓</span>
                                      </div>
                                      <div className="flex justify-between text-[7px] text-slate-300">
                                        <span>Matemática Aplicada s-t</span>
                                        <span className="text-amber-500 font-bold animate-pulse">Procesando...</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <button
                                      onClick={triggerStepPacket}
                                      className="w-full bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-bold py-1.5 px-2 rounded text-[8.5px] uppercase tracking-wide flex items-center justify-center gap-1 shadow active:scale-95 transition-all outline-none"
                                    >
                                      <Flame className="w-3 h-3 text-amber-300" />
                                      Inscribir Asignatura
                                    </button>
                                    <div className="flex justify-between text-[7.5px] font-mono text-slate-400 bg-slate-900/80 p-1 rounded">
                                      <span>Tráfico:</span>
                                      <span className="text-amber-400 font-extrabold">{enrolledCount} u(t)</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-grow flex flex-col justify-between gap-1 text-slate-100">
                                  <div className="space-y-1">
                                    <span className="text-[8px] font-bold text-slate-400 block uppercase">Canal de Alertas Continuas</span>
                                    <p className="text-[7.5px] text-slate-400 leading-normal">
                                      Emite descargas sinusoidales continuas que calientan los hilos de engrane del CPU en el servidor G7.
                                    </p>
                                    <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800 flex items-center justify-between mt-2">
                                      <span className="text-[7px] text-slate-400 font-mono">Bucle sin(wt):</span>
                                      <span className={`text-[7px] font-mono px-1 rounded font-bold ${
                                        notificationActive ? "text-red-400 bg-red-950/40" : "text-slate-500 bg-slate-900"
                                      }`}>
                                        {notificationActive ? "ESTRESANDO" : "OK"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <button
                                      onClick={() => {
                                        setNotificationActive(!notificationActive);
                                        if (!notificationActive && simState === "idle") startSimulation();
                                      }}
                                      className={`w-full font-bold py-1.5 px-2 rounded text-[8.5px] uppercase tracking-wide flex items-center justify-center gap-1 transition-all outline-none ${
                                        notificationActive 
                                          ? "bg-rose-600 hover:bg-rose-500 text-white" 
                                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                      }`}
                                    >
                                      <Activity className="w-3 h-3" />
                                      {notificationActive ? "Detener Estrés" : "Estresar sin(wt)"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* -------------------------------------------------------------
                              CLASSIC WALPAPER HOME VIEW WITH ALERTS DEMO
                              ------------------------------------------------------------- */
                          <>
                            <div className="wallpaper"></div>
                            
                            {/* Standard Phone Status Bar */}
                            <div className="status-bar">
                              <span className="time">{phoneTime}</span>
                              <div className="status-icons">
                                {/* Wifi bar SVG */}
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M12 20h.01M7 15a10 10 0 0 1 10 0M2 10a15 15 0 0 1 20 0"/></svg>
                                {/* Signal bar SVG */}
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M22 20V10M17 20V14M12 20v-3M7 20v-1"/></svg>
                                {/* Battery bar SVG */}
                                <svg width="12" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><rect width="16" height="10" x="2" y="7" rx="2"/><path d="M22 11v2"/></svg>
                              </div>
                            </div>

                            {/* Mom's Notification card (affected by privacy angles!) */}
                            <div className="notification" ref={notifRef}>
                              <div className="notif-header">
                                <div className="notif-icon">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                </div>
                                <span className="notif-app font-mono uppercase tracking-wider">Messages</span>
                                <span className="notif-when font-mono">now</span>
                              </div>
                              <span className="notif-title">Mom ❤️</span>
                              <p className="notif-body font-sans">
                                Did you remember to change your underwear today?!?!
                              </p>
                            </div>

                            {/* interactive SMA & Browser Shortcut Grid */}
                            <div className="grid grid-cols-3 gap-y-3 gap-x-2 px-3 mt-4 z-20 relative">
                              {/* SMA UniGuajira ICON */}
                              <div 
                                className="flex flex-col items-center gap-1 cursor-pointer group pb-1"
                                onClick={() => setChromeOpen(true)}
                                title="Abrir Sistema SMA (Matrícula) UniGuajira"
                              >
                                <div className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 shadow-md flex items-center justify-center border border-amber-300 relative transition-transform active:scale-95">
                                  <GraduationCap className="w-5.5 h-5.5 text-slate-900" />
                                  <span className="absolute -top-1 -right-1.5 bg-red-650 text-white text-[7px] font-mono font-bold px-1 py-0.2 rounded-full border border-slate-950 animate-pulse">
                                    SMA
                                  </span>
                                </div>
                                <span className="text-[7.5px] font-sans font-bold text-white text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight leading-tight">
                                  SMA Portal
                                </span>
                              </div>

                              {/* Chrome Browser shortcut */}
                              <div 
                                className="flex flex-col items-center gap-1 cursor-pointer group pb-1"
                                onClick={() => setChromeOpen(true)}
                                title="Navegador Internet"
                              >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-650 hover:brightness-110 shadow-md flex items-center justify-center border border-rose-400/50 transition-transform active:scale-95">
                                  <Globe className="w-5.5 h-5.5 text-white" />
                                </div>
                                <span className="text-[7.5px] font-sans font-semibold text-white/90 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight leading-tight">
                                  Navegador
                                </span>
                              </div>

                              {/* 3D vs 2D Toggle Icon */}
                              <div 
                                className="flex flex-col items-center gap-1 cursor-pointer group pb-1"
                                onClick={() => setIs3DMode(prev => !prev)}
                                title="Alternar Inclinación 3D del Teléfono"
                              >
                                <div className={`w-10 h-10 rounded-xl shadow-md flex items-center justify-center border transition-all active:scale-95 ${
                                  is3DMode 
                                    ? "bg-purple-600 hover:bg-purple-500 border-purple-400 text-white" 
                                    : "bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300"
                                }`}>
                                  <Smartphone className="w-5 h-5" />
                                </div>
                                <span className="text-[7.5px] font-sans font-semibold text-white/90 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight leading-tight">
                                  {is3DMode ? "Modo 3D" : "Modo 2D"}
                                </span>
                              </div>
                            </div>

                            {/* App Dock with Chrome Launcher */}
                            <div className="dock">
                              <div className="dock-icon di-phone" title="Phone (Disconnected)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                              </div>
                              <div className="dock-icon di-msg" title="Messages">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              </div>
                              {/* Chrome icon launches UniGuajira portal browser */}
                              <div 
                                className="dock-icon di-chrome animate-bounce" 
                                title="Abrir Navegador Chrome - Portal UniGuajira"
                                onClick={() => setChromeOpen(true)}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                              </div>
                              <div className="dock-icon di-cam" title="Camera">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Interactive Home indicator bar */}
                        <div className="home-bar" onClick={() => setChromeOpen(false)} title="Go Home"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================================
            COLUMN 2 (LG: 4): THE LAPLACE FILTER & ACOUPLEMENT FLOW (Centro)
            ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/70 border border-slate-800 rounded-xl p-4 gap-4 overflow-hidden relative">
          
          {/* Physical SVG Bus Network Cable representing live connection between columns */}
          <div className="absolute inset-x-0 top-[148px] h-10 pointer-events-none z-0">
            <svg className="w-full h-full opacity-40" preserveAspectRatio="none" viewBox="0 0 310 40">
              {/* Thick dark copper braid sheath */}
              <path 
                d="M 0 25 Q 110 5, 220 12 T 310 20" 
                fill="none" 
                stroke="#1e293b" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
              {/* Inner conduits */}
              <path 
                d="M 0 25 Q 110 5, 220 12 T 310 20" 
                fill="none" 
                stroke="#334155" 
                strokeWidth="2" 
                strokeLinecap="round" 
              />
              {/* Glowing signal flow wave */}
              <path 
                d="M 0 25 Q 110 5, 220 12 T 310 20" 
                fill="none" 
                stroke={simState !== "idle" ? "#10b981" : "#475569"} 
                strokeWidth="2" 
                strokeLinecap="round"
                className={simState !== "idle" ? (notificationActive ? "glowing-bus-cable-fast" : "glowing-bus-cable") : ""}
                style={{
                  filter: simState !== "idle" ? "drop-shadow(0px 0px 4px #10b981)" : "none",
                  transition: "stroke 0.3s, filter 0.3s"
                }}
              />
            </svg>
            {/* Blinking physical RJ45/Fiber ports on either end of the line */}
            <div className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Puerto de Transmisión Activo"></div>
            <div className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 shadow" title="Puerto de Transmisión (Emisor)"></div>
            
            <div className="absolute right-1.5 top-4 w-2 h-2 rounded-full bg-blue-500 animate-ping" title="Puerto de Entrada Receptor"></div>
            <div className="absolute right-1.5 top-4 w-2 h-2 rounded-full bg-blue-400 border border-slate-900 shadow" title="Puerto de Entrada (HPE DL380 G7)"></div>
          </div>
          
          {/* Wave data particles floating through space */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <AnimatePresence>
              {packets.map((packet) => (
                <motion.div
                  key={packet.id}
                  initial={{ x: 0, y: Math.random() * 40 + 130, scale: 0.8, opacity: 1 }}
                  animate={{ 
                    x: [0, 110, 220, 310], 
                    y: [150, 120, 130, 140],
                    opacity: [1, 1, 0.8, 1],
                    scale: [0.8, 1.2, 1, 0.9]
                  }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className={`absolute w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[8px] z-30 shadow-lg ${
                    packet.type === "isc" 
                      ? "bg-amber-400 text-slate-950 shadow-amber-500/50" 
                      : "bg-indigo-400 text-slate-950 shadow-indigo-500/50"
                  }`}
                >
                  {packet.type === "isc" ? "u" : "s"}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">
              🌀 Acoplador & Filtro de Frecuencia Laplace V(s)
            </span>

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-slate-300 font-mono">Integral de Traducción s:</span>
                <span className="text-[10px] text-teal-400 font-mono font-bold animate-pulse">CONTINUA v(t) &rarr; V(s)</span>
              </div>

              {/* Continuous Laplace mathematical formula visualizer */}
              <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg text-center font-mono text-xs text-indigo-300 shadow-inner">
                {"V(s) = \\int_{0}^{\\infty} v(t) e^{-st} dt"}
              </div>

              <p className="text-[10.5px] text-slate-400 leading-normal">
                Suaviza los impulsos dinámicos del Portal de Alumnos. El acoplador Laplace transforma las peticiones repentinas en ecuaciones de amortiguamiento mitigado.
              </p>
            </div>

            {/* Visualizer flow showing feedback state */}
            <div className="space-y-2 mt-2">
              <span className="text-[9.5px] font-mono text-slate-500 block uppercase">Estado de Retroalimentación Activa:</span>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Modulador G(s):</span>
                  <span className={`font-bold ${activeProtocol ? "text-emerald-400" : "text-amber-500"}`}>
                    {activeProtocol ? "Amortiguador Dinámico Activo" : "Control Pasivo Ineficiente"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 mt-1">
                  <span className="text-slate-500">Polo Estilo:</span>
                  <span className={`text-[10px] px-1.5 rounded font-bold ${
                    activeProtocol 
                      ? activeProtocol.zeta >= 1 ? "text-emerald-400 bg-emerald-950/20" : "text-yellow-400 bg-yellow-950/20"
                      : "text-red-400 bg-red-950/20 animate-pulse"
                  }`}>
                    {activeProtocol ? activeProtocol.dampingDesc : "INCONEXO / INESTABLE +0.12 J"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/15 border border-indigo-900/30 rounded-lg p-2.5">
            <span className="text-[8.5px] font-mono text-slate-400 block mb-1">PROTOCOLO INTEGRADO:</span>
            {activeProtocol ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0"></span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">{activeProtocol.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shrink-0"></span>
                <span className="text-[10px] text-amber-500 font-mono">Sin Estabilizador. El calor escalará sin límites.</span>
              </div>
            )}
          </div>

        </div>

        {/* =========================================================================
            COLUMN 3 (LG: 4): THE PHYSICAL HP PROLIANT DL380 G7 CHASSIS (Derecha)
            ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">
              💻 Servidor Destino (DL380 G7 Chassis SV-02)
            </span>

            <div id="chassis-sv02-container" className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              
              {/* LCD Display: CPU Temp & Dynamic Fan RPM */}
              <div className="grid grid-cols-2 gap-3 bg-[#0d151c] border border-cyan-900/40 px-3.5 py-3 rounded-lg font-mono text-center shadow-inner relative">
                <div className="absolute top-1 right-2 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-[6.5px] text-cyan-600 font-bold uppercase">SECURE_HW</span>
                </div>

                <div className="border-r border-cyan-900/30">
                  <span className="text-[8.5px] text-cyan-500/80 block uppercase tracking-wider">CPU TEMPERATURE</span>
                  <span className={`text-base font-black tracking-tight ${
                    temperature >= limitTemp ? "text-red-500 animate-pulse" : temperature > 75 ? "text-amber-550" : "text-cyan-400"
                  }`}>
                    {temperature.toFixed(1)}°C
                  </span>
                </div>

                <div>
                  <span className="text-[8.5px] text-cyan-500/80 block uppercase tracking-wider">DYNAMIC FAN SPEED</span>
                  <span className="text-base font-black text-cyan-400 tracking-tight block">
                    {fanRpm.toLocaleString()} RPM
                  </span>
                  <span className="text-[7.5px] text-cyan-600 block mt-0.5 leading-none font-bold">
                    Duty Cycle: {fanDuty}%
                  </span>
                </div>
              </div>

              {/* Physical G7 Blade Server frame (Oriented Vertically) */}
              <div className="w-full max-w-[280px] mx-auto overflow-hidden">
                <div className="g7-server-container w-full bg-[#2b2b2d] rounded-lg overflow-hidden border border-zinc-700 shadow-xl" id="server">
                  
                  {/* Top Cap Handle & Badge */}
                  <div className="g7-col h-[42px] flex flex-row items-center justify-between border-b border-[#1a1a1a] bg-[#1a1a1c] px-3">
                    <div className="g7-logo shadow-sm" id="logo" title="HP ProLiant Server Badge"></div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] font-mono text-zinc-500 font-bold">PULL</span>
                      <div className="g7-handle-horiz" title="Pestillo superior" />
                    </div>
                  </div>

                  {/* Network statuses & VGA */}
                  <div className="g7-col h-[46px] flex flex-row items-center justify-between bg-zinc-900/80 px-3 border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-2">
                      <span className="text-[7.5px] text-zinc-500 font-bold leading-none select-none uppercase">NICs</span>
                      <div className="g7-network">
                        <span className={`g7-network-led ${simState === "failed" ? "bg-red-500" : "bg-emerald-400 animate-pulse"}`} />
                        <span className={`g7-network-led ${simState === "failed" ? "bg-red-500" : "bg-emerald-400 animate-pulse"}`} />
                        <span className="g7-network-led bg-zinc-800" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[7.5px] text-zinc-500 font-bold leading-none select-none uppercase">VGA</span>
                      <div className="g7-vga-port bg-blue-900/30 flex items-center justify-center p-0.5">
                        <div className="w-1.5 h-1 bg-blue-600 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Operational indicators, Power Switch & Locator UID */}
                  <div className="g7-col h-[46px] flex flex-row items-center justify-between bg-[#18181a] px-3 border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] text-zinc-500 leading-none font-bold">UID</span>
                      <div
                        onClick={() => setUidGlobalOn(!uidGlobalOn)}
                        className={`g7-uid-led ${uidGlobalOn ? "on animate-pulse" : "off"}`}
                        title="Indicador de localización azul (UID led del rack completo)"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] text-zinc-500 leading-none font-bold">HEALTH</span>
                      <div className={`g7-status-led ${
                        simState === "failed" ? "danger animate-ping" : 
                        temperature >= 78 ? "danger" : 
                        temperature >= 60 ? "warning" : "success"
                      }`} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[6.5px] text-zinc-500 leading-none font-bold">PWR</span>
                      <button
                        onClick={handleReset}
                        className="g7-power-button focus:outline-none"
                        title="Pulse para resetear"
                      >
                        <span className={`g7-power-led ${simState === "failed" ? "failed" : "on"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Splitting metal bar */}
                  <div className="h-[4px] bg-neutral-800 border-b border-zinc-950 flex items-center justify-center w-full">
                    <div className="h-[1px] w-full bg-zinc-950" />
                  </div>

                  {/* Drive Bays 1-8 */}
                  <div className="g7-col h-[150px] flex flex-row justify-between bg-[#111112] px-3 py-2 gap-3 border-b border-[#1a1a1a]">
                    
                    {/* Drive Cage 1 (Drives 1-4) */}
                    <div className="flex-1 flex flex-col">
                      <span className="text-[7px] font-mono text-zinc-500 font-bold block text-center uppercase mb-1">BAY 1-4</span>
                      <div className="g7-drive-cage flex-1">
                        {[1, 2, 3, 4].map((idVal) => {
                          const isFilled = activeDrives.includes(idVal);
                          const isUid = driveUids.includes(idVal);
                          const isWarn = driveWarnings.includes(idVal);

                          return (
                            <div
                              key={`dry-${idVal}`}
                              className={`g7-drive ${isFilled ? "filled" : ""}`}
                              onClick={() => toggleDrive(idVal)}
                              title={`SAS Unit ${idVal} - Haz clic para remover o re-insertar`}
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
                                    temperature >= 78 ? "failed animate-ping" :
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

                    {/* Drive Cage 2 (Drives 5-8) */}
                    <div className="flex-1 flex flex-col">
                      <span className="text-[7px] font-mono text-zinc-500 font-bold block text-center uppercase mb-1">BAY 5-8</span>
                      <div className="g7-drive-cage flex-1">
                        {[5, 6, 7, 8].map((idVal) => {
                          const isFilled = activeDrives.includes(idVal);
                          const isUid = driveUids.includes(idVal);
                          const isWarn = driveWarnings.includes(idVal);

                          return (
                            <div
                              key={`dry-${idVal}`}
                              className={`g7-drive ${isFilled ? "filled" : ""}`}
                              onClick={() => toggleDrive(idVal)}
                              title={`SAS Unit ${idVal} - Haz clic para remover o re-insertar`}
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
                                    temperature >= 78 ? "failed animate-ping" :
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
                  </div>

                  {/* Splitting metal bar */}
                  <div className="h-[4px] bg-neutral-800 border-b border-zinc-950 flex items-center justify-center w-full">
                    <div className="h-[1px] w-full bg-zinc-950" />
                  </div>

                  {/* DVD Unit & Vent filters */}
                  <div className="g7-col h-[115px] flex flex-row justify-between items-stretch bg-[#18181a] px-3 py-2 relative gap-3 border-b border-[#1a1a1a]">
                    
                    {/* Interactive optical DVD reader */}
                    <div className="flex-1 flex flex-col justify-between relative">
                      <span className="text-[7px] font-mono text-zinc-500 font-bold block text-center uppercase mb-1">OPTICAL</span>
                      <div
                        onClick={() => setDvdOpen(!dvdOpen)}
                        className={`g7-dvd-drive flex items-center justify-between px-1 border ${
                          dvdOpen ? "border-indigo-500 animate-pulse bg-indigo-950/20" : "border-zinc-800"
                        } w-full mt-1`}
                        title="Bandeja DVD-ROM - Haz clic para expulsar"
                      >
                        <span className="g7-dvd-label tracking-wide flex items-center gap-0.5">
                          <Disc className="w-2 h-2 text-zinc-500 shrink-0" />
                          DVD-ROM
                        </span>
                        <span className="w-1.5 h-1 bg-zinc-650 rounded-sm" />
                      </div>

                      {/* Expelled eject status */}
                      <AnimatePresence>
                        {dvdOpen && (
                          <motion.div
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            className="g7-dvd-tray py-1 px-1.5 flex flex-col items-center justify-center gap-0.5 bg-slate-900 border border-indigo-500 rounded shadow-2xl"
                          >
                            <span className="text-[6.5px] text-indigo-300 font-mono font-bold leading-none">CD_LAPLACE</span>
                            <span className="text-[5.5px] text-emerald-400 font-mono font-extrabold block">v1.2 AUTORUN</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ventilation filter */}
                    <div className="flex-1 flex flex-col justify-between">
                      <span className="text-[7px] font-mono text-zinc-500 font-bold block text-center uppercase mb-1">VENTILATION</span>
                      {/* HP vintage high-density air grilles */}
                      <div className="g7-vents-grid w-full h-[62px]">
                        {Array.from({ length: 12 }).map((_, vi) => (
                          <div key={`gril-${vi}`} className="g7-vent-line animate-pulse" style={{ animationDelay: `${vi * 60}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Nameplate tag ear right side */}
                  <div className="g7-col h-[42px] flex flex-row items-center justify-between bg-[#09090b] px-3 rounded-b">
                    <div className="text-center font-bold font-mono text-[7.5px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded select-none">
                      DL380 <span className="text-indigo-400 font-bold ml-0.5">G7_SVS</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] font-mono text-zinc-500 font-bold">PUSH</span>
                      <div className="g7-handle-horiz" title="Pestillo inferior" />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          BOTTOM ROW: REAL-TIME TELEMETRY MONITOR (CONSOLE) - REAL TERMINAL STYLE
          ========================================================================= */}
      <div className="real-terminal-container mt-2">
        <div className="real-top-bar select-none">
          <div className="real-window-buttons">
            <ul>
              <li className="real-btn-close"></li>
              <li className="real-btn-minimize"></li>
              <li className="real-btn-zoom"></li>
            </ul>
          </div>
          <div className="real-window-title">usuario@dl380g7: ~</div>
        </div>

        <div className="real-terminal-body flex flex-col justify-between">
          <div>
            <p className="real-line">Last login: <span>{loginTime}</span> on ttys001</p>
            <p className="real-line">
              <span className="real-prompt">usuario@dl380g7</span>:
              <span className="real-path">~</span>$ 
              <span className="real-cmd ml-1.5">monitor --watch telemetry</span>
            </p>
          </div>

          {/* Scrollable logs container with realistic style */}
          <div 
            ref={consoleContainerRef}
            className="overflow-y-auto max-h-[160px] pr-2 my-2 select-text console-scrollbar"
          >
            {logs.map((log, index) => {
              const parseLog = (logStr: string) => {
                const bracketIndex = logStr.indexOf(']');
                if (bracketIndex === -1) return { timestamp: "", label: "", msg: logStr, type: "info" };
                
                const timestamp = logStr.substring(0, bracketIndex + 1);
                const remaining = logStr.substring(bracketIndex + 1).trim();
                
                const colonIndex = remaining.indexOf(':');
                if (colonIndex === -1) {
                  return { timestamp, label: "", msg: remaining, type: "info" };
                }
                
                const label = remaining.substring(0, colonIndex + 1);
                const msg = remaining.substring(colonIndex + 1);
                
                let type: "ok" | "warn" | "err" | "info" = "info";
                const upperRemaining = remaining.toUpperCase();
                if (upperRemaining.includes("CRITICAL") || upperRemaining.includes("COLLAPSE") || upperRemaining.includes("LIMIT!")) {
                  type = "err";
                } else if (upperRemaining.includes("WARNING") || upperRemaining.includes("OVERHEAT")) {
                  type = "warn";
                } else if (upperRemaining.includes("ILO 3") || upperRemaining.includes("STABLE") || upperRemaining.includes("SCANNED") || upperRemaining.includes("OK")) {
                  type = "ok";
                }
                
                return { timestamp, label, msg, type };
              };

              const parsed = parseLog(log);
              return (
                <p key={`log-${index}`} className="real-line font-mono text-xs">
                  <span className="real-ts mr-2 select-none">{parsed.timestamp}</span>
                  {parsed.label && (
                    <span className={`real-log-${parsed.type} font-semibold mr-1.5 select-none`}>
                      {parsed.label}
                    </span>
                  )}
                  <span className="text-[#d4d4d4] selection:bg-zinc-800">{parsed.msg}</span>
                </p>
              );
            })}
            {/* Empty space */}
          </div>

          <p className="real-line">
            <span className="real-prompt">usuario@dl380g7</span>:
            <span className="real-path">~</span>$ 
            <span className="real-cursor-block ml-1.5"></span>
          </p>
        </div>
      </div>

    </div>
  );
}
