import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Timer, 
  Award, 
  Brain, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  ChevronRight, 
  Play, 
  Activity 
} from "lucide-react";

// Types for Laplace Trivia
interface LaplaceQuestion {
  id: number;
  formulaLabel: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  why: string;
}

// 8 High Quality, conceptually aligned questions about Laplace presentation metaphors
const LAPLACE_QUESTIONS: LaplaceQuestion[] = [
  {
    id: 1,
    formulaLabel: "La Fiebre de las Matrículas",
    questionText: "¿Por qué colapsa o se 'ralentiza' la plataforma de matrículas de la Universidad cuando miles de estudiantes intentan ingresar de golpe al mismo tiempo?",
    options: [
      "Porque la base de datos se borra automáticamente",
      "Por un comportamiento inestable de realimentación (polos en el lado derecho), donde la demanda supera con creces la velocidad de respuesta del servidor",
      "Porque el cable submarino de Internet se apaga para mantenimiento programado",
      "Porque las computadoras personales de los estudiantes tienen poca memoria RAM"
    ],
    correctAnswer: "Por un comportamiento inestable de realimentación (polos en el lado derecho), donde la demanda supera con creces la velocidad de respuesta del servidor",
    why: "¡Exacto! El exceso de intentos simultáneos genera un lazo de realimentación donde el tiempo de espera por petición crece exponencialmente. En la teoría de control, esto equivale a tener polos en el lado derecho (inestabilidad absoluta)."
  },
  {
    id: 2,
    formulaLabel: "El Traductor Inteligente",
    questionText: "En nuestra presentación, ¿cuál es la principal función de la Transformada de Laplace explicada con la analogía de un resumen o 'traductor'?",
    options: [
      "Traducir el código fuente del sistema de Python a JavaScript",
      "Convertir ecuaciones diferenciales dinámicas muy complejas en sumas y restas algebraicas simples",
      "Traducir artículos científicos de ingeniería del idioma inglés al español",
      "Lograr que los servidores funcionen de forma mágica sin consumir energía eléctrica"
    ],
    correctAnswer: "Convertir ecuaciones diferenciales dinámicas muy complejas en sumas y restas algebraicas simples",
    why: "¡Brillante! Laplace toma problemas dinámicos sumamente complejos en el dominio del tiempo (con molestas derivadas e integrales) y los transforma en operaciones algebraicas directas en el dominio complejo 's'."
  },
  {
    id: 3,
    formulaLabel: "Plano Complejo s (Estabilidad)",
    questionText: "Si los polos de un sistema dinámico (por ejemplo, el servidor de matrículas o un amortiguador) se ubican en el SEMIPLANO IZQUIERDO del plano complejo s, ¿qué significa?",
    options: [
      "Que el sistema colapsará de inmediato y crecerá infinitamente hasta colapsar",
      "Que el sistema es perfectamente estable, amortiguado y volverá de forma suave a su estado de equilibrio",
      "Que el sistema carece de suficiente energía física para encenderse",
      "Que la Universidad suspenderá el semestre por seguridad virtual"
    ],
    correctAnswer: "Que el sistema es perfectamente estable, amortiguado y volverá de forma suave a su estado de equilibrio",
    why: "¡Excelente! Los polos en el semiplano izquierdo representan exponentes negativos (un factor de decrecimiento e^{-\u03C3 t}), lo que significa que ante cualquier perturbación, el sistema se estabiliza con calma."
  },
  {
    id: 4,
    formulaLabel: "Plano Complejo s (Inestabilidad)",
    questionText: "Si un polo se desplaza hacia el SEMIPLANO DERECHO (valores reales positivos σ > 0), ¿cuál es la consecuencia física directa?",
    options: [
      "La gráfica se vuelve una línea perfectamente recta y horizontal",
      "El sistema entra en un estado de inestabilidad absoluta, provocando un crecimiento exponencial descontrolado",
      "Los estudiantes reciben un descuento en su matrícula de forma aleatoria",
      "El tiempo físico comienza a transcurrir en sentido inverso"
    ],
    correctAnswer: "El sistema entra en un estado de inestabilidad absoluta, provocando un crecimiento exponencial descontrolado",
    why: "¡Correcto! Un polo a la derecha de la frontera imaginaria (\u03C3 > 0) genera un factor de crecimiento e^{\u03C3 t}. En el mundo real, esto causa colapsos de servidores, rotura de piezas por vibraciones o desbordes catastróficos."
  },
  {
    id: 5,
    formulaLabel: "Coeficiente de Amortiguamiento (\u03B6 = 1.00)",
    questionText: "Deseas calibrar un sistema para que se estabilice en el menor tiempo posible pero sin oscilaciones (como los amortiguadores de una buseta en Riohacha). ¿Qué tipo de amortiguamiento debes buscar?",
    options: [
      "Subamortiguado (causa múltiples rebotes y mareos molestos)",
      "Sobreamortiguado (de respuesta sumamente lenta, perezosa y tardía)",
      "Críticamente Amortiguado (\u03B6 = 1, la estabilización de equilibrio más veloz y suave sin oscilar)",
      "Completamente inestable y caótico para mantener la emoción"
    ],
    correctAnswer: "Críticamente Amortiguado (\u03B6 = 1, la estabilización de equilibrio más veloz y suave sin oscilar)",
    why: "¡Así es! El amortiguamiento crítico (\u03B6 = 1) es el balance perfecto: devuelve el sistema al estado estacionario de equilibrio en el menor tiempo físico posible sin generar oscilaciones redundantes."
  },
  {
    id: 6,
    formulaLabel: "Demostración en el Simulador Live",
    questionText: "En el Simulador Interactivo experimental provisto en el foro, ¿qué ocurría visualmente en la Prueba 1 al modelar polos inestables a la derecha?",
    options: [
      "La gráfica de respuesta del sistema dinámico se disparaba hacia arriba exponencialmente sin límite",
      "La gráfica se congelaba en una línea perfectamente plana en cero",
      "La gráfica formaba la caricatura de un robot en pantalla",
      "Los colores del simulador se invertían de manera aleatoria"
    ],
    correctAnswer: "La gráfica de respuesta del sistema dinámico se disparaba hacia arriba exponencialmente sin límite",
    why: "¡Tal cual! Es la demostración gráfica perfecta de la inestabilidad matemática. Al desactivar la retroalimentación de control, los polos se van a la derecha y el valor medido crece de manera salvaje."
  },
  {
    id: 7,
    formulaLabel: "Aplicaciones del Control en Ingeniería",
    questionText: "Además de evitar la saturación de páginas web, ¿en qué otras áreas reales se aplican estos mismos principios de control dinámico y Laplace?",
    options: [
      "Únicamente en el cálculo de matrículas escolares y contabilidad básica",
      "Sistemas de telecomunicaciones, control de nivel de tanques de agua, climatización inteligente y amortiguadores automotrices",
      "En la cocina tradicional de pasteles a base de leña sin instrumentación",
      "En ningún lado práctico; es una teoría puramente abstracta para exámenes"
    ],
    correctAnswer: "Sistemas de telecomunicaciones, control de nivel de tanques de agua, climatización inteligente y amortiguadores automotrices",
    why: "¡Exactamente! Laplace es la clave oculta detrás de la automatización moderna: nos permite regular desde la altura del agua en un tanque industrial hasta la estabilidad en telecomunicaciones avanzadas."
  },
  {
    id: 8,
    formulaLabel: "El Superpoder de Laplace",
    questionText: "En conclusión, ¿cuál es el verdadero beneficio real definitivo que aporta la transformada de Laplace a la sociedad y a nosotros los ingenieros?",
    options: [
      "Permite memorizar fórmulas largas para presumir con otros estudiantes de matemáticas",
      "Permite organizar, modelar y simplificar problemas dinámicos complejos para predecir y forzar un comportamiento antes de que ocurra",
      "Permite apagar manualmente los servidores de la universidad con un solo comando",
      "Reemplazar por completo el uso de computadoras por lápiz y papel"
    ],
    correctAnswer: "Permite organizar, modelar y simplificar problemas dinámicos complejos para predecir y forzar un comportamiento antes de que ocurra",
    why: "¡Brillante conclusión! Ese es el mensaje de cierre de nuestro panel pedagógico: Laplace no es solo un montón de ecuaciones ásperas; es el superpoder de dominar el caos y guiar los sistemas dinámicos hacia la paz de la estabilidad."
  }
];

const ACTIVE_QUESTIONS = LAPLACE_QUESTIONS.slice(0, 5);

export default function TriviaLaplace({ 
  onBackToPresentation 
}: { 
  onBackToPresentation: () => void 
}) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "results">("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState(0);
  
  // Time-Attack clock state
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = ACTIVE_QUESTIONS[currentIndex];

  const handleTimeout = () => {
    setTimerActive(false);
    setIsAnswered(true);
    setSelectedOption(""); // Timed out (counts as incorrect)
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(10);
    setTimerActive(true);
  };

  const resetQuestionState = (index: number) => {
    setIsAnswered(false);
    setIsAnalyzing(false);
    setSelectedOption(null);
    setSecondsLeft(120);
    setTimerActive(true);
  };

  const nextQuestion = () => {
    if (currentIndex < ACTIVE_QUESTIONS.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      resetQuestionState(nextIdx);
    } else {
      setGameState("results");
    }
  };

  const startQuiz = () => {
    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setIsAnalyzing(false);
    resetQuestionState(0);
  };

  const submitAnswer = (option: string) => {
    if (isAnswered || isAnalyzing) return;
    setSelectedOption(option);
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsAnswered(true);
      if (option === currentQuestion.correctAnswer) {
        setScore((prev) => prev + 1);
      }
      setSecondsLeft(10);
      setTimerActive(true);
    }, 1800);
  };

  // Timer loop for time attack or post-answer auto-advance
  useEffect(() => {
    if (gameState === "playing" && timerActive && !isAnalyzing) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (isAnswered) {
              // Time of 10 seconds is up, go to next question!
              nextQuestion();
            } else {
              // Time of 120 seconds is up, mark as incorrect / timeout!
              handleTimeout();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timerActive, isAnswered, isAnalyzing, currentIndex]);

  const playAgain = () => {
    startQuiz();
  };

  const finalPercentage = Math.round((score / ACTIVE_QUESTIONS.length) * 100);

  return (
    <div 
      id="trivia-container-with-bg"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center relative overflow-hidden px-4 py-8 font-sans"
    >
      <style>{`
        #trivia-container-with-bg {
          background: linear-gradient(rgba(230, 238, 254, 0.75), rgba(230, 238, 254, 0.75)), url('https://okdiario.com/img/2017/07/02/ecuaciones-de-segundo-grado-como-se-hacen-formula-y-ejemplos.jpg') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }

        .ANALIZANDO {
          width: 324px;
          height: 69px;
          line-height: 69px;
          text-align: center;
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%);
          -o-transform: translate(-50%, -50%);
          -ms-transform: translate(-50%, -50%);
          -webkit-transform: translate(-50%, -50%);
          -moz-transform: translate(-50%, -50%);
          font-family: helvetica, Arial, sans-serif;
          text-transform: uppercase;
          font-weight: 900;
          font-size: 22px;
          color: #3C6872;
          z-index: 50;
        }

        .paciencia::before, .paciencia::after {
            content: "";
            display: block;
            width: 21px;
            height: 21px;
            background: #1CBADD;
            position: absolute;
            animation: cargando 1s infinite alternate ease-in-out;
            -o-animation: cargando 1s infinite alternate ease-in-out;
            -ms-animation: cargando 1s infinite alternate ease-in-out;
            -webkit-animation: cargando 1s infinite alternate ease-in-out;
            -moz-animation: cargando 1s infinite alternate ease-in-out;
        }
        .paciencia::before { top: 0; }
        .paciencia::after { bottom: 0; }
        
        @keyframes cargando {
            0% { left: 0; height: 41px; width: 21px; }
            25% { left: 0; height: 41px; width: 21px; }
            50% { height: 11px; width: 55px; }
            100% { left: 303px; height: 41px; width: 21px; }
        }
        @-o-keyframes cargando {
            0% { left: 0; height: 41px; width: 21px; }
            25% { left: 0; height: 41px; width: 21px; }
            50% { height: 11px; width: 55px; }
            100% { left: 303px; height: 41px; width: 21px; }
        }
        @-ms-keyframes cargando {
            0% { left: 0; height: 41px; width: 21px; }
            25% { left: 0; height: 41px; width: 21px; }
            50% { height: 11px; width: 55px; }
            100% { left: 303px; height: 41px; width: 21px; }
        }
        @-webkit-keyframes cargando {
            0% { left: 0; height: 41px; width: 21px; }
            25% { left: 0; height: 41px; width: 21px; }
            50% { height: 11px; width: 55px; }
            100% { left: 303px; height: 41px; width: 21px; }
        }
        @-moz-keyframes cargando {
            0% { left: 0; height: 41px; width: 21px; }
            25% { left: 0; height: 41px; width: 21px; }
            50% { height: 11px; width: 55px; }
            100% { left: 303px; height: 41px; width: 21px; }
        }
      `}</style>
      
      {/* Header Bar */}
      <header className="w-full max-w-4xl flex justify-between items-center bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-xl text-white shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs font-black font-sans tracking-wide uppercase text-indigo-400">
              Desafío de Control Dinámico
            </h1>
            <p className="text-[10px] text-zinc-400">
              Evaluación Interactiva Contra el Reloj
            </p>
          </div>
        </div>

        {/* Back button to slides */}
        <button
          onClick={onBackToPresentation}
          className="px-3 py-1.5 cursor-pointer bg-slate-800 hover:bg-slate-755 border border-slate-700/60 transition-all font-sans text-[10.5px] font-bold rounded-lg flex items-center gap-1.5 text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Diapositivas</span>
        </button>
      </header>

      {/* Main Game Segment */}
      <main className="w-full max-w-3xl flex-1 flex flex-col justify-center items-center py-8 relative z-10">
        {gameState === "idle" && (
          <div className="bg-slate-900/65 border border-slate-800 p-8 rounded-3xl text-center backdrop-blur-lg max-w-xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
            
            <div className="mx-auto w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner">
              <Award className="w-9 h-9 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
                Trivia Contra el Reloj
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                Pon a prueba tus conocimientos sobre la <strong>Transformada de Laplace</strong> en este juego interactivo. Tendrás un límite de <strong>2 minutos (120 segundos)</strong> por cada pregunta para seleccionar la respuesta correcta.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl text-left space-y-2.5">
              <div className="flex gap-2 items-start text-xs text-zinc-300">
                <span className="text-indigo-400 font-bold shrink-0">⏱ 2 min</span>
                <span>Reloj dinámico por pregunta. Tras contestar, dispondrás de 10 segundos para leer la explicación antes de avanzar automáticamente.</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-zinc-300">
                <span className="text-amber-400 font-bold shrink-0">🎓 5</span>
                <span>Preguntas técnicas diseñadas para evaluar conceptos de ingeniería.</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-zinc-300">
                <span className="text-purple-400 font-bold shrink-0">📊 s-domain</span>
                <span>Explicación didáctica sintonizada paso a paso tras responder.</span>
              </div>
            </div>

            <button
               onClick={startQuiz}
              className="w-full py-4 bg-gradient-to-r from-indigo-650 to-purple-650 hover:from-indigo-500 hover:to-purple-550 border border-indigo-500/20 text-xs font-black tracking-wider uppercase text-white rounded-xl shadow-xl hover:shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>¡Comenzar Desafío!</span>
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="w-full space-y-6">
            
            {/* Top Indicator & Countdown */}
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/20 px-3 py-1 border border-indigo-500/20 rounded-full">
                Pregunta {currentIndex + 1} de {ACTIVE_QUESTIONS.length}
              </span>
              
              {/* Animated Timer */}
              <div className={`flex items-center gap-1.5 px-4.5 py-1.5 rounded-full border text-xs font-extrabold font-mono transition-all ${
                secondsLeft <= 15 
                  ? "bg-rose-500/25 border-rose-500 text-rose-400 animate-pulse scale-105" 
                  : "bg-slate-900 border-slate-800 text-teal-400"
              }`}>
                <Timer className={`w-4 h-4 ${secondsLeft <= 15 ? "animate-spin" : ""}`} />
                <span>{secondsLeft}s Restantes</span>
              </div>
            </div>

            {/* Question Card Box */}
            <div className="bg-slate-900/75 border border-slate-800 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-xl flex flex-col gap-6 relative overflow-hidden min-h-[440px]">
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/95 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300">
                  <div className="ANALIZANDO paciencia">Analizando...</div>
                </div>
              )}

              {/* Mathematical Formula Preview Accent */}
              <div className="self-center bg-slate-950/90 border border-indigo-500/20 px-6 py-4 rounded-2xl block w-full text-center max-w-sm relative shadow-inner">
                <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-indigo-650 px-2 py-0.5 rounded text-[8px] font-mono leading-none tracking-widest uppercase font-black text-white">
                  Dominio s-domain
                </span>
                <code className="text-lg md:text-xl font-bold font-mono text-cyan-300 tracking-wide select-none">
                  {currentQuestion.formulaLabel}
                </code>
              </div>

              {/* Question Text */}
              <h3 className="text-base md:text-lg font-bold text-left text-white leading-relaxed font-sans">
                {currentQuestion.questionText}
              </h3>

              {/* Answer options list */}
              <div className="grid grid-cols-1 gap-3.5 mt-2">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQuestion.correctAnswer;
                  const hasAnswered = isAnswered;

                  let optStyle = "bg-slate-950/40 border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/60 text-zinc-300";
                  if (isAnalyzing) {
                    if (isSelected) {
                      optStyle = "bg-indigo-500/25 border-indigo-500 text-indigo-300 pointer-events-none";
                    } else {
                      optStyle = "bg-slate-950/20 border-slate-900 text-zinc-650 opacity-40 pointer-events-none";
                    }
                  } else if (hasAnswered) {
                    if (isCorrect) {
                      optStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-300";
                    } else if (isSelected) {
                      optStyle = "bg-rose-500/15 border-rose-500 text-rose-300";
                    } else {
                      optStyle = "bg-slate-950/20 border-slate-900 text-zinc-650 opacity-45 pointer-events-none";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={hasAnswered || isAnalyzing}
                      onClick={() => submitAnswer(opt)}
                      className={`text-left p-4.5 rounded-xl border flex items-center justify-between text-xs md:text-[13px] font-medium transition-all group ${
                        !hasAnswered && !isAnalyzing ? "cursor-pointer hover:scale-[1.005]" : ""
                      } ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border uppercase ${
                          isSelected 
                            ? "bg-indigo-600 border-indigo-500 text-white" 
                            : "bg-slate-900 border-slate-800 text-zinc-500 group-hover:border-indigo-500/35"
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-mono text-left tracking-wide">{opt}</span>
                      </div>

                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Timeout feedback if they didn't answer in time */}
              {isAnswered && selectedOption === "" && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3.5 text-rose-400 text-xs">
                  <Timer className="w-5 h-5 animate-bounce" />
                  <span><strong>¡Se agotó el tiempo!</strong> No seleccionaste ninguna opción a tiempo para esta pregunta.</span>
                </div>
              )}

              {/* Explanation section appears dynamically */}
              {isAnswered && (
                <div className="mt-4 border-t border-slate-800 pt-5 space-y-3.5 text-left">
                  <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 px-3 py-1 border border-indigo-500/20 rounded-lg w-max text-[9.5px] font-mono leading-none tracking-widest uppercase font-black">
                    🎓 Retroalimentación Laplace
                  </div>
                  <p 
                    className="text-xs text-zinc-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentQuestion.why }}
                  />

                  {/* Next Question Trigger Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={nextQuestion}
                      className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                    >
                      <span>{currentIndex === ACTIVE_QUESTIONS.length - 1 ? "Ver Resultados" : "Siguiente Pregunta"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {gameState === "results" && (
          <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl text-center backdrop-blur-lg max-w-md w-full shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500"></div>

            <div className="mx-auto w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg relative">
              <Award className="w-9 h-9" />
              <Activity className="absolute -bottom-1 -right-1 w-5 h-5 text-indigo-400 bg-slate-900 rounded-full p-0.5 border border-indigo-500/35" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                ¡Prueba Finalizada!
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono">
                Modelado y Control de Sistemas Dinámicos
              </p>
            </div>

            {/* Score Ring / Box */}
            <div className="bg-slate-950/80 border border-slate-850 p-6 rounded-2xl space-y-3 shadow-inner">
              <div className="text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
                {finalPercentage}%
              </div>
              <p className="text-xs text-zinc-300">
                Respondiste correctamente <strong>{score}</strong> de las <strong>{ACTIVE_QUESTIONS.length}</strong> preguntas de la trivia.
              </p>
              
              <div className="h-2 w-full bg-slate-850 rounded-full mt-4 overflow-hidden relative border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${finalPercentage}%` }}
                />
              </div>
            </div>

            {/* Performance Level */}
            <div className="text-[11.5px] text-zinc-400 leading-normal font-sans">
              {finalPercentage >= 80 ? (
                <span className="text-emerald-400 font-bold block">✨ ¡Excelente! Demuestras un nivel excepcional de análisis en el s-domain.</span>
              ) : finalPercentage >= 50 ? (
                <span className="text-indigo-300 font-bold block">👍 ¡Buen trabajo! Posees un entendimiento claro de los principios de Laplace.</span>
              ) : (
                <span className="text-rose-400 font-bold block">📚 ¡Se recomienda repasar! Revisa las ecuaciones y polos de Laplace.</span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={playAgain}
                className="py-3.5 cursor-pointer bg-slate-800 hover:bg-slate-755 border border-slate-700/80 text-xs font-bold text-white rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-4 h-4 shrink-0" />
                <span>Jugar de Nuevo</span>
              </button>
              
              <button
                onClick={onBackToPresentation}
                className="py-3.5 cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 text-xs font-black text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-all active:scale-95"
              >
                <span>Finalizar</span>
              </button>
            </div>

          </div>
        )}
      </main>

      {/* Footer decoration */}
      <footer className="relative z-10 w-full max-w-4xl text-center text-[10px] text-zinc-600 font-mono flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-slate-900/60 pt-4 mt-6">
        <span>Licencia Académica • uniguajira.edu.co</span>
        <span>Evaluador S-Domain v1.3 • Laplace Controls</span>
      </footer>

    </div>
  );
}
