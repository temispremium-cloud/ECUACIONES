import React, { useState, useEffect, useRef } from "react";
import * as math from "mathjs";
import { Message, SimulationPoint, ProtocolOption } from "./types";
import ServerRack from "./components/ServerRack";
import TimeDomainGraph from "./components/TimeDomainGraph";
import SPlaneDiagram from "./components/SPlaneDiagram";
import PhysicalEmulationPanel from "./components/PhysicalEmulationPanel";
import GuionForo from "./components/GuionForo";
import SlideshowForo from "./components/SlideshowForo";
import TriviaLaplace from "./components/TriviaLaplace";
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Play, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Award, 
  Brain,
  HelpCircle,
  Lightbulb,
  ArrowLeft
} from "lucide-react";

// List of predefined Laplace stabilization filters / protocols
const INITIAL_PROTOCOLS: ProtocolOption[] = [
  {
    id: "underdamped_fast",
    name: "Protocolo Alfa G_c(s): Bucle Subamortiguado Rápido (ζ = 0.45)",
    formula: "G_c(s) = 2.5s / (s + 1.2)",
    sFormula: "T(s)/V(s) = 4.0 / (s^2 + 1.8s + 4.0)",
    dampingDesc: "Subamortiguado (ζ = 0.45)",
    poles: "s = -0.90 ± 1.78j",
    zeta: 0.45,
    omegaN: 2.0,
    description: "Controlador de respuesta rápida que estabiliza la oscilación de temperatura CPU de inmediato bajo cargas masivas. Genera transiciones en pico que se disipan rápidamente antes del límite térmico.",
    benefits: "Amortiguación inmediata, tiempo de asentamiento de solo ~4.3s."
  },
  {
    id: "critically_damped",
    name: "Protocolo Beta G_c(s): Alineación Crítica de Polos (ζ = 1.00)",
    formula: "G_c(s) = 1.6 / (s + 2.0)",
    sFormula: "T(s)/V(s) = 2.25 / (s^2 + 3.0s + 2.25)",
    dampingDesc: "Críticamente Amortiguado (ζ = 1.00)",
    poles: "s = -1.50 (Doble)",
    zeta: 1.00,
    omegaN: 1.5,
    description: "Configura polos dobles simétricos en el eje real negativo de Laplace local. Elimina por completo todas las sobre-oscilaciones térmicas dañinas para los procesadores Intel Xeon.",
    benefits: "Transiciones perfectamente suaves, cero oscilación de fatiga física."
  },
  {
    id: "overdamped_slow",
    name: "Protocolo Gamma G_c(s): Filtro Conservador Sobreamortiguado (ζ = 2.10)",
    formula: "G_c(s) = 0.8 / (s + 4.0)",
    sFormula: "T(s)/V(s) = 1.0 / (s^2 + 4.2s + 1.0)",
    dampingDesc: "Sobreamortiguado (ζ = 2.10)",
    poles: "s = -0.24, -3.96",
    zeta: 2.10,
    omegaN: 1.0,
    description: "Mitigación térmica sumamente conservadora de polos separados. Asegura una estabilidad térmica extrema, pero su reacción perezosa puede no contrarrestar a tiempo picos sumamente explosivos.",
    benefits: "Cero sobreimpulso, gran tolerancia ante ruidos de red y sensores."
  }
];

function generateSimulationData(selectedProtocol: ProtocolOption | null): SimulationPoint[] {
  const points: SimulationPoint[] = [];
  
  // Use selected protocol or default to Beta critically damped (INITIAL_PROTOCOLS[1])
  const activeProto = selectedProtocol || INITIAL_PROTOCOLS[1];
  
  for (let idx = 0; idx <= 150; idx++) {
    const t = idx * 0.1;
    
    // Server Traffic in users (step-injection after 3.3s)
    let traffic = 2000;
    if (t >= 3.3) {
      traffic = 45000 + (math.sin(t * 3.5) as number) * 2800 + (math.cos(t * 6) as number) * 900;
    } else {
      traffic = 2000 + (math.sin(t * 4) as number) * 350;
    }
    
    // Direct Uncontrolled thermal curve (Passive cooling is overloaded, CPU melt down!)
    let tempUncontrolled = 38.0;
    if (t >= 3.3) {
      const td = t - 3.3;
      tempUncontrolled = 38.0 + 64 * (1 - (math.exp(-td / 2.5) as number)) + (math.sin(td * 1.8) as number) * 0.4;
    } else {
      tempUncontrolled = 38.0 + (math.sin(t * 3) as number) * 0.15;
    }
    
    // Controlled feedback temperature using S-domain translation formulas
    let tempControlled = 38.0;
    if (t >= 3.3) {
      const td = t - 3.3;
      const stepGain = 24.5; // Final stabilized ambient temperature addition is ~62.5C
      
      const { zeta, omegaN } = activeProto;
      if (zeta < 1) {
        // Underdamped second-order step response
        const wd = math.evaluate(`${omegaN} * sqrt(1 - ${zeta}^2)`) as number;
        const phi = math.evaluate(`acos(${zeta})`) as number;
        const env = math.evaluate(`exp(-${zeta} * ${omegaN} * ${td})`) as number;
        const responseFraction = math.evaluate(`(${env} * sin(${wd} * ${td} + ${phi})) / sqrt(1 - ${zeta}^2)`) as number;
        tempControlled = math.evaluate(`38.0 + ${stepGain} * (1 - ${responseFraction}) + sin(${td} * 3.5) * 0.15`) as number;
      } else if (math.abs(zeta - 1) < 0.02) {
        // Critically damped second-order step response
        const responseFraction = math.evaluate(`exp(-${omegaN} * ${td}) * (1 + ${omegaN} * ${td})`) as number;
        tempControlled = math.evaluate(`38.0 + ${stepGain} * (1 - ${responseFraction}) + sin(${td} * 3.0) * 0.1`) as number;
      } else {
        // Overdamped response
        const r1 = math.evaluate(`-${omegaN} * (${zeta} - sqrt(${zeta}^2 - 1))`) as number;
        const r2 = math.evaluate(`-${omegaN} * (${zeta} + sqrt(${zeta}^2 - 1))`) as number;
        const c1 = math.evaluate(`${r2} / (${r2} - ${r1})`) as number;
        const c2 = math.evaluate(`-${r1} / (${r2} - ${r1})`) as number;
        const responseFraction = math.evaluate(`${c1} * exp(${r1} * ${td}) + ${c2} * exp(${r2} * ${td})`) as number;
        tempControlled = math.evaluate(`38.0 + ${stepGain} * (1 - ${responseFraction}) + sin(${td} * 2.0) * 0.1`) as number;
      }
    } else {
      tempControlled = 38.0 + (math.sin(t * 3) as number) * 0.15;
    }
    
    points.push({
      t: parseFloat(t.toFixed(1)),
      traffic: Math.round(traffic),
      tempUncontrolled,
      tempControlled
    });
  }
  
  return points;
}

export default function App() {
  const [simState, setSimState] = useState<"idle" | "spiking" | "stabilizing" | "success" | "failed">("idle");
  const [activeLayoutTab, setActiveLayoutTab] = useState<"lab" | "guion" | "diapositivas" | "trivia">("diapositivas");
  const [currentTime, setCurrentTime] = useState(0);
  const [activeProtocol, setActiveProtocol] = useState<ProtocolOption | null>(null);

  // Persistent presentation states
  const [slideshowCurrent, setSlideshowCurrent] = useState(1);
  const [slideshowFullscreen, setSlideshowFullscreen] = useState(() => !!document.fullscreenElement);
  const [showAdminHeader, setShowAdminHeader] = useState(false);

  // Global HTML5 fullscreen listener to avoid pseudo-fullscreen desynchronizations
  useEffect(() => {
    const handleFsChange = () => {
      setSlideshowFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);
  
  const [temperature, setTemperature] = useState(38.0);
  const [traffic, setTraffic] = useState(2000);
  const limitTemp = 90;
  
  // Real-time calculated simulation data set
  const [simPoints, setSimPoints] = useState<SimulationPoint[]>(() => generateSimulationData(null));
  
  // Chatbot states
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial_welcome",
      sender: "assistant",
      text: "¡Hola! Soy **Laplace Assistant**. Bienvenido al Centro de Datos uniguajira.edu.co. Actualmente el sistema de servidores iLO 3 HP ProLiant DL380 G7 se encuentra en reposo.\n\nHemos detectado que los estudiantes pronto enviarán un **pulso escalón de tráfico masivo** para la matrícula virtual. Si no aplicamos el acoplamiento Laplace a tiempo, la temperatura de la CPU del chasis SV-02 superará el límite de **90°C** y se fundirá el silicio del rack.\n\nHaga clic en **Lanzar Matrícula Viral** para iniciar, y elija uno de mis **Protocolos de Estabilidad de Laplace** para amortiguar el calor en tiempo real, o pregúnteme cualquier inquietud matemática aquí.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat strictly within its container to avoid window body jump
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
    }
  }, [messages, isTyping]);

  // Recalculate full simulation curve whenever active controller protocol is updated
  useEffect(() => {
    setSimPoints(generateSimulationData(activeProtocol));
  }, [activeProtocol]);

  // Handle active simulation ticking loop (100ms ticks representing 0.1s in Laplace timeDomain)
  useEffect(() => {
    if (simState !== "spiking" && simState !== "stabilizing") return;

    const interval = setInterval(() => {
      try {
        setCurrentTime((prev) => {
          const nextTime = Math.round((prev + 0.1) * 10) / 10;
          
          if (nextTime >= 15.0) {
            clearInterval(interval);
            setSimState("success");
            triggerGeminiExplanation("success");
            return 15.0;
          }

          // Pull active parameters from precomputed data array matching current time
          const ptIndex = Math.min(simPoints.length - 1, Math.floor((nextTime / 15) * (simPoints.length - 1)));
          const point = simPoints[ptIndex];
          
          if (point) {
            setTraffic(point.traffic);
            const activeTemp = simState === "stabilizing" ? point.tempControlled : point.tempUncontrolled;
            setTemperature(activeTemp);

            // Real-time safety validation
            if (activeTemp >= limitTemp) {
              clearInterval(interval);
              setSimState("failed");
              triggerGeminiExplanation("failed");
            }
          }

          return nextTime;
        });
      } catch (err) {
        console.error("Critical error in simulation ticking interval:", err);
        clearInterval(interval);
        setSimState("failed");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [simState, simPoints, limitTemp]);

  // Interactive control action triggers
  const startSimulation = () => {
    // Reset initial metrics
    setCurrentTime(0);
    setTemperature(38.0);
    setTraffic(2000);
    
    // If user pre-connected a Laplace system
    if (activeProtocol) {
      setSimState("stabilizing");
    } else {
      setSimState("spiking");
    }
  };

  const handleReset = () => {
    setSimState("idle");
    setCurrentTime(0);
    setTemperature(38.0);
    setTraffic(2000);
    setActiveProtocol(null);
  };

  const applyProtocolOnTheFly = (protocol: ProtocolOption) => {
    setActiveProtocol(protocol);
    if (simState === "spiking") {
      setSimState("stabilizing");
    }
  };

  // Helper to trigger automated Gemini review explanations on states change
  const triggerGeminiExplanation = async (nextState: "success" | "failed") => {
    setIsTyping(true);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: nextState,
          event: nextState === "success" 
            ? `Se evitó el colapso estabilizando el servidor chasis G7 a tiempo con amortiguamiento del polo ${activeProtocol?.poles || "Laplace"}.` 
            : "Colapso térmico destructivo. La CPU Intel alcanzó 90°C por la acumulación exponencial de calor."
        })
      });
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "assistant",
          text: data.text || "La conexión iLO detectó inestabilidad en el bus de Laplace.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Gemini reporting error", err);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle direct user chat prompt submission to conversational Gemini agent
  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput("");
    
    // Append to live history
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: simState,
          query: userText,
          event: activeProtocol ? `Filtro activo: ${activeProtocol.name}` : "Sin filtro estabilizador"
        })
      });
      
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "assistant",
          text: data.text || "Hubo un retraso o error en la respuesta del asistente. Intente de nuevo.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "assistant",
          text: `⚠️ **Error de conexión con IA**: No se pudo comunicar con el Laplace Assistant. Mensaje: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      
      {/* GLOBAL HUD / HEADER (Conditionally rendered) */}
      {showAdminHeader && (
        <>
          <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-40 relative">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold font-sans tracking-tight text-white uppercase">
                    Simulador del Control de Estabilidad de Laplace
                  </h1>
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded leading-none shrink-0">
                    v1.2.0 • iLO 3
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-none mt-1">
                  Universidad de La Guajira • Laboratorio de Sistemas de Control Dinámico en s-t
                </p>
              </div>
            </div>

            {/* Global HUD readout metrics */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] shrink-0">
              <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="text-slate-500">Estado iLO:</span>
                {simState === "idle" && <span className="text-slate-400 font-extrabold uppercase">Listo</span>}
                {simState === "spiking" && <span className="text-red-400 font-extrabold uppercase animate-pulse">Saturación Térmica</span>}
                {simState === "stabilizing" && <span className="text-indigo-400 font-extrabold uppercase animate-pulse">Retroalimentación Activa</span>}
                {simState === "success" && <span className="text-emerald-400 font-extrabold uppercase">Estabilizado ✓</span>}
                {simState === "failed" && <span className="text-red-500 font-extrabold uppercase animate-bounce">Colapso Térmico</span>}
              </div>

              <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <span className="text-slate-500">Reloj s-Domain:</span>
                <span className="text-cyan-400 font-extrabold">{currentTime.toFixed(1)}s / 15s</span>
              </div>

              {simState === "idle" ? (
                <button
                  onClick={startSimulation}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 font-sans cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white shrink-0" />
                  Lanzar Matrícula Viral
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all font-sans cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  Reiniciar Lab
                </button>
              )}
            </div>
          </header>

          {/* NAVIGATION TABS FOR EXPERIMENT vs WRITTEN DIALOGUE SCRIPT */}
          <div className="bg-slate-950 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between gap-4 z-30 relative flex-wrap">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveLayoutTab("lab")}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLayoutTab === "lab"
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                🔬 Laboratorio & Simulador s-t
              </button>
              <button
                onClick={() => setActiveLayoutTab("guion")}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLayoutTab === "guion"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
                id="tab-guion-academico"
              >
                📋 Guión de Exposición (Fácil)
              </button>
              <button
                onClick={() => {
                  setActiveLayoutTab("diapositivas");
                  setSlideshowFullscreen(true);
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLayoutTab === "diapositivas"
                    ? "bg-indigo-650/15 text-indigo-500 border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
                id="tab-slideshow-academica"
              >
                📊 Diapositivas G7
              </button>
              <button
                onClick={() => setActiveLayoutTab("trivia")}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 hover:bg-purple-900/10 ${
                  activeLayoutTab === "trivia"
                    ? "bg-purple-600/15 text-purple-400 border border-purple-500/25"
                    : "text-slate-400 hover:text-purple-300 border border-transparent"
                }`}
                id="tab-trivia-academica"
              >
                🎮 Desafío Trivia (Contra el Reloj)
              </button>
            </div>
            <div className="text-[10px] bg-slate-900/60 border border-slate-800/60 px-3 py-1.5 rounded-lg font-mono text-zinc-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Formación Continuada • UniGuajira</span>
            </div>
          </div>
        </>
      )}
      {activeLayoutTab === "lab" ? (
        <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMN A (XL: 8): PHYSICAL EMULATION & MATH INTEGRATION */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {/* VOLVER A DIAPOSITIVA HEADER BAR */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-[#bf360c]/10 p-2 rounded-lg text-amber-500 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide leading-none">
                  Modo Simulador Práctico Activo
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1 mb-0 leading-normal">
                  Configure los polos en frecuencia en el diagrama S para amortiguar la temperatura CPU.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveLayoutTab("diapositivas");
                setSlideshowFullscreen(true);
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="px-4 py-2 cursor-pointer bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-650 border border-amber-500/20 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-md shrink-0"
              id="btn-return-to-diapositivas"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>Volver a Diapositivas</span>
            </button>
          </div>
          
          {/* Main EMULATOR Component wrapper */}
          <section className="bg-slate-950/40 rounded-2xl border border-slate-800/80 p-0 relative" id="emulator-panel-container">
            <PhysicalEmulationPanel
              temperature={temperature}
              traffic={traffic}
              limitTemp={limitTemp}
              simState={simState}
              currentTime={currentTime}
              activeProtocol={activeProtocol}
              startSimulation={startSimulation}
              handleReset={handleReset}
              applyProtocolOnTheFly={applyProtocolOnTheFly}
              protocols={INITIAL_PROTOCOLS}
            />
          </section>

          {/* SECOND ROW BENTO BLOCK: CONTROL PROTOCOLS LIST SELECTOR */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  ⚙️ ACCIONES DISPONIBLES DE CONTROL
                </span>
                <h2 className="text-sm font-bold text-slate-200 font-sans tracking-tight">
                  Seleccione un Filtro de Frecuencia Laplace G_c(s)
                </h2>
              </div>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800/60 p-1.5 rounded-lg text-[10px] font-mono text-slate-400">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Puede acoplarlos antes o durante la simulación activa</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {INITIAL_PROTOCOLS.map((proto) => {
                const isActive = activeProtocol?.id === proto.id;
                return (
                  <button
                    key={proto.id}
                    onClick={() => applyProtocolOnTheFly(proto)}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between transition-all outline-none cursor-pointer relative overflow-hidden group ${
                      isActive 
                        ? "bg-[#0d1c24] border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30" 
                        : "bg-slate-900/65 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="space-y-1.5 w-full">
                      <div className="flex justify-between items-start gap-1 w-full">
                        <span className={`text-[10.5px] font-mono font-bold tracking-tight uppercase leading-snug ${
                          isActive ? "text-cyan-400" : "text-slate-300"
                        }`}>
                          {proto.name.split(":")[0]}
                        </span>
                        {isActive && (
                          <span className="bg-cyan-500/20 text-cyan-400 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase leading-none shrink-0 animate-pulse">
                            Acoplado
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-slate-950/85 border border-slate-800 p-1.5 rounded-md font-mono text-[10px] text-center text-teal-400 font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                        {proto.formula}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-3 pt-0.5 group-hover:text-slate-300 transition-colors">
                        {proto.description}
                      </p>
                    </div>

                    <div className="border-t border-slate-800/60 mt-3 pt-2.5 w-full space-y-1.5">
                      <div className="flex justify-between text-[9.5px] font-mono text-slate-500">
                        <span>Polos S:</span>
                        <span className={`font-semibold ${isActive ? "text-amber-400" : "text-slate-400"}`}>{proto.poles}</span>
                      </div>
                      <div className="flex justify-between text-[9.5px] font-mono text-slate-500">
                        <span>Constante amortiguado:</span>
                        <span className={`font-semibold ${isActive ? "text-cyan-400" : "text-slate-400"}`}>{proto.dampingDesc}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* COLUMN B (XL: 4): TIME-DOMAIN GRAPH & CHATBOT PANEL */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* S-PLANE POLES CONJUGATE REAL-TIME PLOTTER */}
          <section className="bg-slate-950 p-0 rounded-2xl relative" id="s-plane-panel">
            <SPlaneDiagram
              zeta={activeProtocol ? activeProtocol.zeta : 0}
              omegaN={activeProtocol ? activeProtocol.omegaN : 0}
              isStabilized={simState === "stabilizing" || simState === "success"}
              uncontrolledPole={0.12} // positive unstable pole representing passive thermal expansion
              manualSigma={0}
              activeProtocolId={activeProtocol?.id || null}
            />
          </section>

          {/* TIME DOMAIN GRAPHS - EXTREMELY DETAILED */}
          <section className="bg-slate-950 p-0 rounded-2xl relative" id="time-domain-panel">
            <TimeDomainGraph
              currentTime={currentTime}
              isStabilized={simState === "stabilizing" || simState === "success"}
              zeta={activeProtocol ? activeProtocol.zeta : 0}
              omegaN={activeProtocol ? activeProtocol.omegaN : 0}
              simPoints={simPoints}
              limitTemp={limitTemp}
              simState={simState}
            />
          </section>

          {/* CONVERSATIONAL GEMINI AI CHATBOT ASSISTANT */}
          <section className="bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[350px] relative overflow-hidden" id="chatbot-panel">
            
            {/* Chatbot Header */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500/15 p-1.5 rounded-lg text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    Asistente de Laplace AI
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  </h3>
                  <span className="text-[9.5px] text-slate-500 leading-none">Consultor didáctico de ecuaciones</span>
                </div>
              </div>
              <span className="text-[8.5px] font-mono text-purple-400 bg-purple-950/20 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                Gemini Multi-Frecuencia
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[220px]"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div className={`text-[11.5px] p-2.5 rounded-xl leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none whitespace-pre-wrap"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 mt-1 px-1">
                    {msg.sender === "user" ? "Tú" : "Asistente Laplace"} • {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-indigo-400 bg-slate-900/60 p-2 border border-slate-850 rounded-lg max-w-[150px] animate-pulse">
                  <Brain className="w-3.5 h-3.5 animate-spin" />
                  <span>Sintonizando s-domain...</span>
                </div>
              )}
            </div>

            {/* Chat Input Field footer */}
            <form onSubmit={sendChatMessage} className="p-3 bg-slate-900/60 border-t border-slate-850 flex gap-2">
              <input
                type="text"
                placeholder="Pregunte sobre atenuación, polos en s..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg text-xs font-sans text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 ring-0"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors cursor-pointer active:scale-95 shrink-0"
                title="Submit Question"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </section>

          {/* SEEDED EXTERNAL RACK DISPLAY VIEW */}
          <section className="bg-slate-950 p-0 rounded-2xl relative" id="server-rack-component">
            <ServerRack
              temperature={temperature}
              traffic={traffic}
              limitTemp={limitTemp}
              simState={simState}
            />
          </section>

        </div>

      </main>
      ) : activeLayoutTab === "guion" ? (
        <main className="flex-1 p-6 overflow-y-auto font-sans">
          <GuionForo />
        </main>
      ) : activeLayoutTab === "trivia" ? (
        <main className="flex-1 p-0 overflow-hidden font-sans">
          <TriviaLaplace 
            onBackToPresentation={() => {
              setActiveLayoutTab("diapositivas");
              setSlideshowCurrent(8);
            }} 
          />
        </main>
      ) : (
        <main className="flex-1 p-6 overflow-y-auto font-sans">
          <SlideshowForo 
            onGoToSimulator={() => setActiveLayoutTab("lab")} 
            onGoToTrivia={() => setActiveLayoutTab("trivia")}
            current={slideshowCurrent}
            onCurrentChange={setSlideshowCurrent}
            isFullscreen={slideshowFullscreen}
            onIsFullscreenChange={setSlideshowFullscreen}
          />
        </main>
      )}

      {/* Subtle Developer/Admin Toggle */}
      <div className="fixed bottom-2 right-2 z-50 opacity-40 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setShowAdminHeader(!showAdminHeader)}
          className="bg-slate-950/80 border border-slate-800 text-[9px] text-slate-400 font-mono px-2 py-1 rounded hover:bg-slate-900 transition-colors"
        >
          {showAdminHeader ? "Ocultar Menú Superior" : "Mostrar Menú Superior"}
        </button>
      </div>

    </div>
  );
}
