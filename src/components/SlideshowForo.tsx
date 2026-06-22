import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle, 
  Monitor, 
  ShieldAlert,
  Sliders,
  Wind,
  Smile,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
  Image as ImageIcon,
  RotateCw,
  Plus,
  Trash2,
  Copy,
  MousePointerClick,
  Move,
  Grid
} from "lucide-react";
import { scriptParts, ScriptPart } from "./GuionForo";

interface SlideData {
  id: number;
  speaker: string;
  role: string;
  title: string;
  subtitle: string;
  badge: string;
  content: string;
  imageUrl: string;
  illustration: React.ReactNode;
}

export interface SlideCustomization {
  titleSize: number;
  subtitleSize: number;
  contentSize: number;
  textX: number;
  textY: number;
  illustrationX: number;
  illustrationY: number;
  illustrationScale: number;
  imageUrl: string;
  titleColor?: string;
  subtitleColor?: string;
  contentColor?: string;
  badgeBg?: string;
  badgeColor?: string;
  boxBg?: string;
  boxBorderColor?: string;
  boxOpacity?: number;
  fontFamily?: string;
  textAlignment?: "left" | "center" | "right";
  isDashedBorderVisible?: boolean;
  hideBackgroundWayuu?: boolean;
  hideLeftBadge?: boolean;
  hideIntegrantes?: boolean;
  hideLeftFooter?: boolean;
  hideUGuajiraCrest?: boolean;
  hideAccreditationSeal?: boolean;
  hideBuildingMockupBackground?: boolean;
  hideBottomQualitySeals?: boolean;
  hideSpeakerRole?: boolean;
  hideIllustrationBox?: boolean;
}

export default function SlideshowForo({
  onGoToSimulator,
  current: propCurrent,
  onCurrentChange,
  isFullscreen: propIsFullscreen,
  onIsFullscreenChange
}: {
  onGoToSimulator?: () => void;
  current?: number;
  onCurrentChange?: (c: number) => void;
  isFullscreen?: boolean;
  onIsFullscreenChange?: (fs: boolean) => void;
} = {}) {
  const [localCurrent, setLocalCurrent] = useState(1);
  const current = propCurrent !== undefined ? propCurrent : localCurrent;
  const setCurrent = (val: number | ((prev: number) => number)) => {
    if (typeof val === "function") {
      const nextVal = val(current);
      if (onCurrentChange) onCurrentChange(nextVal);
      else setLocalCurrent(nextVal);
    } else {
      if (onCurrentChange) onCurrentChange(val);
      else setLocalCurrent(val);
    }
  };

  const [localIsFullscreen, setLocalIsFullscreen] = useState(() => !!document.fullscreenElement);
  const isFullscreen = propIsFullscreen !== undefined ? propIsFullscreen : localIsFullscreen;
  const setIsFullscreen = (val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === "function") {
      const nextVal = val(isFullscreen);
      if (onIsFullscreenChange) onIsFullscreenChange(nextVal);
      else setLocalIsFullscreen(nextVal);
    } else {
      if (onIsFullscreenChange) onIsFullscreenChange(val);
      else setLocalIsFullscreen(val);
    }
  };
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showSyncScript, setShowSyncScript] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // We keep the slide texts completely editable too!
  const [slidesTextData, setSlidesTextData] = useState<Record<number, {
    badge: string;
    speaker: string;
    role: string;
    title: string;
    subtitle: string;
    content: string;
  }>>(() => {
    const saved = localStorage.getItem("slideshow_canva_texts_v12");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Error parsing editable texts", e);
      }
    }
    return {
      1: {
        badge: "PRESENTACIÓN DE PORTADA",
        speaker: "DANILO, RODERICK, JOSHEP, TEMISTOCLE",
        role: "Foro Académico de Control Dinámico",
        title: "Transformada de Laplace en Ingeniería",
        subtitle: "Discusión Interactiva - UniGuajira",
        content: "Integrantes del Panel:\n• DANILO JOSÉ MIRANDA EPIAYU (Moderador - P1)\n• RODERICK GALLARDO GRATEROL (Indagador - P4)\n• JOSHEP DAVID ROMERO PEREZ (Explicador - P2)\n• TEMISTOCLE EISYANIOR ATENCIO IPUANA (Guía / Simulador - P3)"
      },
      2: {
        badge: "PASO 1: EL PROBLEMA REAL",
        speaker: "DANILO JOSÉ MIRANDA EPIAYU (P1)",
        role: "Moderador - Apertura y Contexto",
        title: "LA FIEBRE DE LAS MATRÍCULAS",
        subtitle: "¿Soportará la plataforma o se caerá?",
        content: "Durante el inicio de matrículas, miles de estudiantes entran en simultáneo. El sistema se ralentiza y corre el riesgo de colapsar. ¿Cómo prever y evitar este colapso antes de que ocurra?"
      },
      3: {
        badge: "PASO 2: EL TRADUCTOR",
        speaker: "JOSHEP DAVID ROMERO PEREZ (P2)",
        role: "Panelista Explicador Didáctico",
        title: "UN TRADUCTOR INTELIGENTE",
        subtitle: "Ver el problema desde otra perspectiva",
        content: "Laplace actúa como un resumen que extrae las ideas clave de un texto largo. Traduce complejas ecuaciones dinámicas en sumas, restas y operaciones sencillas de secundaria."
      },
      4: {
        badge: "PASO 3: ESTABILIDAD",
        speaker: "TEMISTOCLE / JOSHEP (P3 & P2)",
        role: "Enfoque Teórico y Práctico",
        title: "CONTROL PARA EL MUNDO REAL",
        subtitle: "Tomar mejores decisiones a tiempo",
        content: "Al organizar la información de forma más clara, los ingenieros pueden predecir si el sistema se estabilizará con calma (lado izquierdo) o si crecerá hacia la inestabilidad (lado derecho)."
      },
      5: {
        badge: "PASO 4: EL SIMULADOR",
        speaker: "TEMISTOCLE EISYANIOR ATENCIO IPUANA (P3)",
        role: "Panelista Guía Experimental",
        title: "SIMULATOR EN ACCIÓN",
        subtitle: "Demostración experimental interactiva",
        content: "Observaremos en vivo cómo responde la gráfica cuando modificamos ciertos valores:\n• Prueba 1: Crecimiento desmedido (Inestabilidad)\n• Prueba 2: Curva suavizada (Estabilización/Equilibrio)"
      },
      6: {
        badge: "PASO 5: APLICACIONES",
        speaker: "JOSHEP DAVID ROMERO PEREZ (P2) / RODERICK GALLARDO GRATEROL (P4)",
        role: "Análisis Mutidisciplinario",
        title: "MÁS ALLÁ DEL CÓDIGO",
        subtitle: "Laplace en nuestra vida cotidiana",
        content: "Esta herramienta se utiliza en telecomunicaciones, procesamiento de señales, climatización inteligente, amortiguadores de busetas en Riohacha y control de tanques de agua."
      },
      7: {
        badge: "CIERRE DEL PANEL",
        speaker: "TODOS LOS PONENTES",
        role: "Conclusión Colectiva",
        title: "PROTEGER EL MUNDO REAL",
        subtitle: "Asegurar que las cosas funcionen correctamente",
        content: "Laplace destaca por ayudarnos a organizar y simplificar problemas complejos para encontrar soluciones más efectivas. ¡Gracias por su atención!"
      },
      8: {
        badge: "AGRADECIMIENTOS",
        speaker: "TODOS LOS INTEGRANTES",
        role: "Cierre del Foro",
        title: "¡MUCHAS GRACIAS!",
        subtitle: "Foro Académico de Control Dinámico",
        content: "Queremos expresar nuestro más sincero agradecimiento a los jurados, profesores y compañeros por su atención, apoyo y valiosa retroalimentación durante este foro de investigación."
      }
    };
  });

  // Track dragging state
  const [dragTracker, setDragTracker] = useState<{
    target: "text" | "illustration" | null;
    slideId: number;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    target: null,
    slideId: 0,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  // Track resizing state
  const [resizeTracker, setResizeTracker] = useState<{
    slideId: number;
    startClientY: number;
    initialScale: number;
  } | null>(null);

  // We load / save customizations dynamically
  const [customizations, setCustomizations] = useState<Record<number, SlideCustomization>>(() => {
    const saved = localStorage.getItem("slideshow_canva_customizations_v12");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Error parsing customizations from localStorage", e);
      }
    }
    return {
      1: { 
        titleSize: 36, 
        subtitleSize: 13, 
        contentSize: 14, 
        textX: -13, 
        textY: 0, 
        illustrationX: 185, 
        illustrationY: -579, 
        illustrationScale: 0.84, 
        imageUrl: "blob:https://imgur.com/9504e535-09ac-47b4-96c4-bc1fd02e6552",
        titleColor: "#0f172a",
        subtitleColor: "#9a3412",
        contentColor: "#1e293b",
        badgeBg: "#e0e7ff",
        badgeColor: "#4338ca",
        boxBg: "rgba(255, 255, 255, 0.98)",
        boxBorderColor: "rgba(203, 213, 225, 0.6)",
        fontFamily: "Inter",
        textAlignment: "left" as const,
        hideUGuajiraCrest: true,
        hideAccreditationSeal: true,
        hideBuildingMockupBackground: true,
        hideLeftFooter: true,
        hideLeftBadge: true,
        hideBackgroundWayuu: true,
        hideBottomQualitySeals: true
      },
      2: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: -14, 
        textY: 73, 
        illustrationX: -92, 
        illustrationY: 62, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      3: { 
        titleSize: 53,
        subtitleSize: 22,
        contentSize: 30,
        textX: 26,
        textY: -30,
        illustrationX: -67,
        illustrationY: -22,
        illustrationScale: 1.4,
        imageUrl: "https://i.imgur.com/VXL439v.png",
        titleColor: "#0f172a",
        subtitleColor: "#9a3412",
        contentColor: "#1e293b",
        badgeBg: "#d1fae5",
        badgeColor: "#047857",
        boxBg: "rgba(255, 255, 255, 0.98)",
        boxBorderColor: "rgba(203, 213, 225, 0.6)",
        fontFamily: "Inter",
        textAlignment: "left" as const
      },
      4: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: 7, 
        textY: 24, 
        illustrationX: -100, 
        illustrationY: 35, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      5: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: -14, 
        textY: 58, 
        illustrationX: -104, 
        illustrationY: 54, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      6: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: -21, 
        textY: 72, 
        illustrationX: -104, 
        illustrationY: 50, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      7: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: 15, 
        textY: 10, 
        illustrationX: -93, 
        illustrationY: 54, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      8: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: 15, 
        textY: 10, 
        illustrationX: -93, 
        illustrationY: 54, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      }
    };
  });

  // Save changes automatically to local storage
  useEffect(() => {
    localStorage.setItem("slideshow_canva_customizations_v12", JSON.stringify(customizations));
  }, [customizations]);

  // Save text changes to local storage
  useEffect(() => {
    localStorage.setItem("slideshow_canva_texts_v12", JSON.stringify(slidesTextData));
  }, [slidesTextData]);

  const updateCurrentCustomization = <K extends keyof SlideCustomization>(
    key: K,
    value: SlideCustomization[K]
  ) => {
    setCustomizations((prev) => ({
      ...prev,
      [current]: {
        ...(prev[current] || {
          titleSize: current === 1 ? 36 : 53,
          subtitleSize: current === 1 ? 13 : 22,
          contentSize: current === 1 ? 14 : 30,
          textX: current === 1 ? -13 : 63,
          textY: current === 1 ? 0 : -80,
          illustrationX: current === 1 ? 17 : -79,
          illustrationY: 0,
          illustrationScale: current === 1 ? 0.84 : 1.4,
          imageUrl: current === 1 ? "https://i.imgur.com/CKnu0PY.png" : "https://i.imgur.com/VXL439v.png"
        }),
        [key]: value,
      },
    }));
  };

  const resetAllCustomizations = () => {
    const fresh = {
      1: { 
        titleSize: 36, 
        subtitleSize: 13, 
        contentSize: 14, 
        textX: -13, 
        textY: 0, 
        illustrationX: 185, 
        illustrationY: -579, 
        illustrationScale: 0.84, 
        imageUrl: "blob:https://imgur.com/9504e535-09ac-47b4-96c4-bc1fd02e6552",
        titleColor: "#0f172a",
        subtitleColor: "#9a3412",
        contentColor: "#1e293b",
        badgeBg: "#e0e7ff",
        badgeColor: "#4338ca",
        boxBg: "rgba(255, 255, 255, 0.98)",
        boxBorderColor: "rgba(203, 213, 225, 0.6)",
        fontFamily: "Inter",
        textAlignment: "left" as const,
        hideUGuajiraCrest: true,
        hideAccreditationSeal: true,
        hideBuildingMockupBackground: true,
        hideLeftFooter: true,
        hideLeftBadge: true,
        hideBackgroundWayuu: true,
        hideBottomQualitySeals: true
      },
      2: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: -14, 
        textY: 73, 
        illustrationX: -92, 
        illustrationY: 62, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      3: { 
        titleSize: 53,
        subtitleSize: 22,
        contentSize: 30,
        textX: 26,
        textY: -30,
        illustrationX: -67,
        illustrationY: -22,
        illustrationScale: 1.4,
        imageUrl: "https://i.imgur.com/VXL439v.png",
        titleColor: "#0f172a",
        subtitleColor: "#9a3412",
        contentColor: "#1e293b",
        badgeBg: "#d1fae5",
        badgeColor: "#047857",
        boxBg: "rgba(255, 255, 255, 0.98)",
        boxBorderColor: "rgba(203, 213, 225, 0.6)",
        fontFamily: "Inter",
        textAlignment: "left" as const
      },
      4: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: 7, 
        textY: 24, 
        illustrationX: -100, 
        illustrationY: 35, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      5: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: -14, 
        textY: 58, 
        illustrationX: -104, 
        illustrationY: 54, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      6: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: -21, 
        textY: 72, 
        illustrationX: -104, 
        illustrationY: 50, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      7: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: 15, 
        textY: 10, 
        illustrationX: -93, 
        illustrationY: 54, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      },
      8: { 
        titleSize: 53, 
        subtitleSize: 22, 
        contentSize: 30, 
        textX: 15, 
        textY: 10, 
        illustrationX: -93, 
        illustrationY: 54, 
        illustrationScale: 1.4, 
        imageUrl: "https://i.imgur.com/VXL439v.png", 
        titleColor: "#0f172a", 
        subtitleColor: "#9a3412", 
        contentColor: "#1e293b", 
        badgeBg: "#e0e7ff", 
        badgeColor: "#4338ca", 
        boxBg: "rgba(255, 255, 255, 0.98)", 
        boxBorderColor: "rgba(203, 213, 225, 0.6)", 
        fontFamily: "Inter", 
        textAlignment: "left" as const 
      }
    };
    setCustomizations(fresh);
    localStorage.setItem("slideshow_canva_customizations_v12", JSON.stringify(fresh));

    const defaultTexts = {
      1: {
        badge: "PRESENTACIÓN DE PORTADA",
        speaker: "DANILO, RODERICK, JOSHEP, TEMISTOCLE",
        role: "Foro Académico de Control Dinámico",
        title: "Transformada de Laplace en Ingeniería",
        subtitle: "Discusión Interactiva - UniGuajira",
        content: "Integrantes del Panel:\n• DANILO JOSÉ MIRANDA EPIAYU (Moderador - P1)\n• RODERICK GALLARDO GRATEROL (Indagador - P4)\n• JOSHEP DAVID ROMERO PEREZ (Explicador - P2)\n• TEMISTOCLE EISYANIOR ATENCIO IPUANA (Guía / Simulador - P3)"
      },
      2: {
        badge: "PASO 1: EL PROBLEMA REAL",
        speaker: "DANILO JOSÉ MIRANDA EPIAYU (P1)",
        role: "Moderador - Apertura y Contexto",
        title: "LA FIEBRE DE LAS MATRÍCULAS",
        subtitle: "¿Soportará la plataforma o se caerá?",
        content: "Durante el inicio de matrículas, miles de estudiantes entran en simultáneo. El sistema se ralentiza and corre el riesgo de colapsar. ¿Cómo prever y evitar este colapso antes de que ocurra?"
      },
      3: {
        badge: "PASO 2: EL TRADUCTOR",
        speaker: "JOSHEP DAVID ROMERO PEREZ (P2)",
        role: "Panelista Explicador Didáctico",
        title: "UN TRADUCTOR INTELIGENTE",
        subtitle: "Ver el problema desde otra perspectiva",
        content: "Laplace actúa como un resumen que extrae las ideas clave de un texto largo. Traduce complejas ecuaciones dinámicas en sumas, restas y operaciones sencillas de secundaria."
      },
      4: {
        badge: "PASO 3: ESTABILIDAD",
        speaker: "TEMISTOCLE / JOSHEP (P3 & P2)",
        role: "Enfoque Teórico y Práctico",
        title: "CONTROL PARA EL MUNDO REAL",
        subtitle: "Tomar mejores decisiones a tiempo",
        content: "Al organizar la información de forma más clara, los ingenieros pueden predecir si el sistema se estabilizará con calma (lado izquierdo) o si crecerá hacia la inestabilidad (lado derecho)."
      },
      5: {
        badge: "PASO 4: EL SIMULADOR",
        speaker: "TEMISTOCLE EISYANIOR ATENCIO IPUANA (P3)",
        role: "Panelista Guía Experimental",
        title: "SIMULATOR EN ACCIÓN",
        subtitle: "Demostración experimental interactiva",
        content: "Observaremos en vivo cómo responde la gráfica cuando modificamos ciertos valores:\n• Prueba 1: Crecimiento desmedido (Inestabilidad)\n• Prueba 2: Curva suavizada (Estabilización/Equilibrio)"
      },
      6: {
        badge: "PASO 5: APLICACIONES",
        speaker: "JOSHEP DAVID ROMERO PEREZ (P2) / RODERICK GALLARDO GRATEROL (P4)",
        role: "Análisis Mutidisciplinario",
        title: "MÁS ALLÁ DEL CÓDIGO",
        subtitle: "Laplace en nuestra vida cotidiana",
        content: "Esta herramienta se utiliza en telecomunicaciones, procesamiento de señales, climatización inteligente, amortiguadores de busetas en Riohacha y control de tanques de agua."
      },
      7: {
        badge: "CIERRE DEL PANEL",
        speaker: "TODOS LOS PONENTES",
        role: "Conclusión Colectiva",
        title: "PROTEGER EL MUNDO REAL",
        subtitle: "Asegurar que las cosas funcionen correctamente",
        content: "Laplace destaca por ayudarnos a organizar y simplificar problemas complejos para encontrar soluciones más efectivas. ¡Gracias por su atención!"
      },
      8: {
        badge: "AGRADECIMIENTOS",
        speaker: "TODOS LOS INTEGRANTES",
        role: "Cierre del Foro",
        title: "¡MUCHAS GRACIAS!",
        subtitle: "Foro Académico de Control Dinámico",
        content: "Queremos expresar nuestro más sincero agradecimiento a los jurados, profesores y compañeros por su atención, apoyo y valiosa retroalimentación durante este foro de investigación."
      }
    };
    setSlidesTextData(defaultTexts);
    localStorage.setItem("slideshow_canva_texts_v12", JSON.stringify(defaultTexts));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(customizations, null, 2));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handleImportJSON = () => {
    setPasteError("");
    setPasteSuccess(false);
    try {
      const parsed = JSON.parse(pasteValue);
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("El JSON debe ser un objeto");
      }
      const keys = Object.keys(parsed);
      if (keys.length === 0) {
        throw new Error("El objeto JSON no tiene propiedades");
      }
      
      const imported: Record<number, SlideCustomization> = { ...customizations };
      for (const k of keys) {
        const id = parseInt(k, 10);
        if (!isNaN(id)) {
          const item = parsed[k];
          imported[id] = {
            titleSize: typeof item.titleSize === "number" ? item.titleSize : 36,
            subtitleSize: typeof item.subtitleSize === "number" ? item.subtitleSize : 15,
            contentSize: typeof item.contentSize === "number" ? item.contentSize : 13,
            textX: typeof item.textX === "number" ? item.textX : 0,
            textY: typeof item.textY === "number" ? item.textY : 0,
            illustrationX: typeof item.illustrationX === "number" ? item.illustrationX : 0,
            illustrationY: typeof item.illustrationY === "number" ? item.illustrationY : 0,
            illustrationScale: typeof item.illustrationScale === "number" ? item.illustrationScale : 1.0,
            imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : "https://i.imgur.com/VXL439v.png",
            titleColor: typeof item.titleColor === "string" ? item.titleColor : "#0f172a",
            subtitleColor: typeof item.subtitleColor === "string" ? item.subtitleColor : "#9a3412",
            contentColor: typeof item.contentColor === "string" ? item.contentColor : "#1e293b",
            badgeBg: typeof item.badgeBg === "string" ? item.badgeBg : "#e0e7ff",
            badgeColor: typeof item.badgeColor === "string" ? item.badgeColor : "#4338ca",
            boxBg: typeof item.boxBg === "string" ? item.boxBg : "rgba(2,6,23,0.85)",
            boxBorderColor: typeof item.boxBorderColor === "string" ? item.boxBorderColor : "rgba(99,102,241,0.25)",
            fontFamily: typeof item.fontFamily === "string" ? item.fontFamily : "Inter",
            textAlignment: (item.textAlignment === "left" || item.textAlignment === "center" || item.textAlignment === "right") ? item.textAlignment : "left"
          };
        }
      }
      setCustomizations(imported);
      setPasteSuccess(true);
      setPasteValue("");
      setTimeout(() => setPasteSuccess(false), 3000);
    } catch (e: any) {
      setPasteError(e.message || "Error al decodificar el formato JSON. Asegúrate de copiarlo completo.");
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const slideshowRef = useRef<HTMLDivElement>(null);

  // Stateful embedded Mini-Lab simulation component for Slides 5 and 7
  const InteractiveMiniLab = () => {
    const [activeProto, setActiveProto] = useState<"alfa" | "beta" | "gamma" | "none">("beta");
    const [zeta, setZeta] = useState(1.0);
    const [isSimulating, setIsSimulating] = useState(false);
    const [progress, setProgress] = useState(0);

    // Auto-set Zeta based on selected protocol
    useEffect(() => {
      if (activeProto === "alfa") setZeta(0.45);
      else if (activeProto === "beta") setZeta(1.0);
      else if (activeProto === "gamma") setZeta(2.1);
    }, [activeProto]);

    // Handle zeta change (custom tuner)
    const handleZetaSlider = (val: number) => {
      setZeta(val);
      if (val < 0.8) setActiveProto("alfa");
      else if (Math.abs(val - 1.0) < 0.1) setActiveProto("beta");
      else setActiveProto("gamma");
    };

    // Run simulation frame ticks
    useEffect(() => {
      let interval: any;
      if (isSimulating) {
        interval = setInterval(() => {
          setProgress((p) => {
            if (p >= 100) {
              clearInterval(interval);
              setIsSimulating(false);
              return 100;
            }
            return p + 2.5;
          });
        }, 50);
      }
      return () => clearInterval(interval);
    }, [isSimulating]);

    const handleStart = () => {
      setProgress(0);
      setIsSimulating(true);
    };

    const handleResetSim = () => {
      setProgress(0);
      setIsSimulating(false);
    };

    // Generate path points for SVG preview graph of current zeta
    const generatePath = () => {
      const width = 160;
      const height = 55;
      const padding = 2;
      const wn = 1.8;
      const pts = [];
      const maxT = 10;
      const steps = 60;
      const endStep = isSimulating ? Math.floor((progress / 100) * steps) : steps;
      
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * maxT;
        let y = 0;
        
        if (activeProto === "none") {
          // Temperature rising meltdown curve
          y = 0.1 + (t / 10) * 0.9 + Math.sin(t * 1.5) * 0.05;
        } else {
          // Damped response
          const z = zeta;
          if (z < 1) {
            // Underdamped
            const wd = wn * Math.sqrt(1 - z * z);
            const phi = Math.acos(z);
            const env = Math.exp(-z * wn * t);
            y = 1 - (env * Math.sin(wd * t + phi)) / Math.sqrt(1 - z * z);
          } else if (Math.abs(z - 1.0) < 0.05) {
            // Critically damped
            y = 1 - Math.exp(-wn * t) * (1 + wn * t);
          } else {
            // Overdamped
            const s1 = -wn * (z - Math.sqrt(z * z - 1));
            const s2 = -wn * (z + Math.sqrt(z * z - 1));
            const c1 = s2 / (s2 - s1);
            const c2 = -s1 / (s2 - s1);
            y = 1 - (c1 * Math.exp(s1 * t) + c2 * Math.exp(s2 * t));
          }
        }

        const xCoord = (t / maxT) * (width - 2 * padding) + padding;
        const yCoord = height - (y / 1.5) * (height - 2 * padding) - padding;
        const cy = Math.max(0, Math.min(height, yCoord));
        
        if (i <= endStep || !isSimulating) {
          pts.push(`${xCoord.toFixed(1)},${cy.toFixed(1)}`);
        }
      }
      return pts.length > 0 ? "M " + pts.join(" L ") : "M 0,0";
    };

    let currentTemp = 38.0;
    let statusText = "Sistema en Reposo";
    let statusColor = "text-slate-400";
    let statusBg = "bg-slate-900 border-slate-800";
    
    if (isSimulating || progress > 0) {
      const fraction = progress / 100;
      if (activeProto === "none") {
        currentTemp = 38.0 + fraction * 54.4 + Math.sin(fraction * 15) * 1.5;
        statusText = "🔥 ¡ALERTA! SILICIO SOPORTANDO 92°C";
        statusColor = "text-red-400 font-bold animate-pulse";
        statusBg = "bg-red-950/40 border-red-500/30 animate-pulse";
      } else {
        const z = zeta;
        const peakVal = z < 1 ? (38.0 + 24.5 * (1 + Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)))) : 62.5;
        const endVal = 62.5;
        if (fraction < 0.5) {
          currentTemp = 38.0 + (fraction * 2) * (peakVal - 38.0);
        } else {
          const decayFrac = (fraction - 0.5) * 2;
          currentTemp = peakVal - decayFrac * (peakVal - endVal) + Math.sin(fraction * 35) * 0.15;
        }
        statusText = "✅ Laplace Estabilizado";
        statusColor = "text-emerald-400 font-bold";
        statusBg = "bg-emerald-950/20 border-emerald-500/20";
      }
    } else {
      if (activeProto === "none") {
        currentTemp = 38.0;
        statusText = "⚠️ Sin Filtro (Riesgo Crítico)";
        statusColor = "text-amber-400";
        statusBg = "bg-amber-950/20 border-amber-500/20";
      } else {
        currentTemp = 38.0;
        statusText = `Filtro Acoplado (ζ = ${zeta.toFixed(2)})`;
        statusColor = "text-sky-400";
        statusBg = "bg-sky-950/20 border-sky-500/20";
      }
    }

    return (
      <div className="flex flex-col w-full h-full p-2 space-y-2 select-none justify-between text-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-300 font-mono flex items-center gap-1">
            🔬 CONTROL LAPLACE EN VIVO
          </span>
          <div className={`px-2 py-0.5 rounded text-[8px] font-mono border uppercase tracking-wider ${statusBg} ${statusColor}`}>
            {activeProto === "none" ? "Inestable" : "Estable s-plane"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 flex-grow items-center">
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-1.5 h-20 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-1 right-1 text-[6.5px] font-mono text-zinc-650">
              {isSimulating ? "SIMULANDO CLS" : "VISTA PREVIA DE POLOS"}
            </div>
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 pointer-events-none opacity-[0.05]">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
            </div>
            <svg className="w-full h-14 mt-1 overflow-visible" viewBox="0 0 160 55" fill="none">
              {activeProto !== "none" && (
                <line x1="0" y1="21.6" x2="160" y2="21.6" stroke="#10b981" strokeWidth="0.75" strokeDasharray="3,3" strokeOpacity="0.4" />
              )}
              <line x1="0" y1="5" x2="160" y2="5" stroke="#ef4444" strokeWidth="0.75" strokeDasharray="2,2" strokeOpacity="0.3" />
              <path d={generatePath()} stroke={activeProto === "none" ? "#f43f5e" : "#38bdf8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2 h-20 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] text-zinc-500 font-mono uppercase font-bold tracking-wider">TEMP CPU SV-02</span>
              <span className="text-[7.5px] text-zinc-500 font-mono">LIM: 90°C</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-[20px] font-black font-mono leading-none tracking-tight ${
                currentTemp > 85 ? "text-rose-500 animate-pulse" : currentTemp > 65 ? "text-amber-400" : "text-sky-400"
              }`}>
                {currentTemp.toFixed(1)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">°C</span>
            </div>
            <p className="text-[8.5px] font-medium leading-tight truncate text-slate-400">
              {statusText}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 border-t border-slate-800/60 pt-1.5">
          <div className="flex justify-between gap-1">
            <button type="button" onClick={() => { setActiveProto("alfa"); handleZetaSlider(0.45); }} className={`flex-1 py-1 text-[8px] font-bold font-mono rounded cursor-pointer border transition-all text-center leading-none ${activeProto === "alfa" ? "bg-[#0d1c24] text-cyan-400 border-cyan-500/50" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"}`}>
              Alfa (Sub)
            </button>
            <button type="button" onClick={() => { setActiveProto("beta"); handleZetaSlider(1.0); }} className={`flex-1 py-1 text-[8px] font-bold font-mono rounded cursor-pointer border transition-all text-center leading-none ${activeProto === "beta" ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/50" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"}`}>
              Beta (Crít)
            </button>
            <button type="button" onClick={() => { setActiveProto("gamma"); handleZetaSlider(2.1); }} className={`flex-1 py-1 text-[8px] font-bold font-mono rounded cursor-pointer border transition-all text-center leading-none ${activeProto === "gamma" ? "bg-indigo-950/30 text-indigo-400 border-indigo-500/50" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"}`}>
              Gamma (Sob)
            </button>
            <button type="button" onClick={() => { setActiveProto("none"); }} className={`flex-1 py-1 text-[8px] font-bold font-mono rounded cursor-pointer border transition-all text-center leading-none ${activeProto === "none" ? "bg-rose-950/20 text-rose-400 border-rose-500/50" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"}`}>
              S/Filtro (🔥)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-1.5">
              <span className="text-[7.5px] text-zinc-550 font-mono uppercase">ζ:</span>
              <input type="range" min="0.1" max="2.5" step="0.05" disabled={activeProto === "none"} value={activeProto === "none" ? 0.0 : zeta} onChange={(e) => handleZetaSlider(parseFloat(e.target.value))} className="flex-1 h-1 bg-slate-805 rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-40" />
              <span className="text-[8.5px] font-mono text-sky-400 font-bold shrink-0 w-6">
                {activeProto === "none" ? "---" : zeta.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-1 shrink-0">
              {isSimulating ? (
                <button type="button" onClick={handleResetSim} className="bg-slate-800 text-indigo-400 border border-slate-700/80 px-2.5 py-1 rounded text-[8.5px] font-bold cursor-pointer hover:bg-slate-700 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                  Stop
                </button>
              ) : (
                <button type="button" onClick={handleStart} className="bg-indigo-650 text-white px-2.5 py-1 rounded text-[8.5px] font-bold cursor-pointer hover:bg-indigo-600 flex items-center gap-0.5">
                  <Play className="w-2.5 h-2.5" />
                  Estímulo L(t)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Default, base illustration structures for each slide ID
  const DEFAULT_SLIDES_CORES = {
    1: (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <div className="text-[38px] font-black font-sans tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-amber-300 to-indigo-400">
          G(s) = L {'{ g(t) }'}
        </div>
        <span className="text-[10px] text-zinc-400 font-mono mt-2 block select-none">
          "Compilador algebraico para el calor físico"
        </span>
        <div className="flex gap-4 mt-4 text-[9px] text-indigo-300 font-mono border-t border-slate-800/80 pt-3">
          <span>⏱ 10 Minutos</span>
          <span>📍 UniGuajira</span>
          <span>🎓 Multidisciplinario</span>
        </div>
      </div>
    ),
    2: (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="mb-2 bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 rounded-xl text-center relative overflow-hidden animate-bounce select-none">
          <span className="text-[9px] font-mono font-bold text-rose-400 block">TIEMPO REAL</span>
          <span className="text-2xl font-bold font-mono text-rose-500">92.4 °C</span>
        </div>
        <span className="text-[10px] text-rose-300 font-bold block text-center mt-2 font-mono select-none">
          ⚠️ ¡Peligro de apagón térmico!
        </span>
      </div>
    ),
    3: (
      <div className="flex flex-col items-center justify-center p-3 space-y-3 select-none w-full">
        <span className="text-[10px] font-extrabold text-[#064e3b] font-mono tracking-wider uppercase">
          La Gran Traducción de Laplace
        </span>
        
        {/* Comparison Layout */}
        <div className="grid grid-cols-7 items-center w-full gap-1.5 pt-1">
          {/* Difficult side */}
          <div className="col-span-3 bg-rose-50/90 border border-rose-200/50 rounded-xl p-2.5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-rose-100 text-rose-700 font-mono text-[7px] px-1.5 py-0.5 rounded-bl uppercase font-bold border-b border-l border-rose-200">
              Difícil
            </div>
            <span className="text-[8px] text-zinc-600 font-mono block mb-1.5">Tiempo f(t) (Derivadas)</span>
            <div className="text-[12px] font-black font-mono text-rose-950 select-none tracking-tight">
              y''(t) + 3y'(t) + 2y(t) = f(t)
            </div>
            <span className="text-[7.5px] text-rose-700 font-bold mt-1.5 block">Cálculo Diferencial</span>
          </div>

          {/* Golden Arrow */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <span className="text-indigo-700 text-[11px] animate-pulse font-black font-mono">L{"{·}"}</span>
            <span className="text-indigo-600 text-sm mt-0.5 animate-pulse">➡️</span>
          </div>

          {/* Simple side */}
          <div className="col-span-3 bg-emerald-50/90 border border-emerald-200/50 rounded-xl p-2.5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 font-mono text-[7px] px-1.5 py-0.5 rounded-bl uppercase font-bold border-b border-l border-emerald-200">
              Sencillo
            </div>
            <span className="text-[8px] text-zinc-600 font-mono block mb-1.5">Plano S (Álgebra)</span>
            <div className="text-[12px] font-black font-mono text-emerald-950 select-none tracking-tight">
              (s² + 3s + 2) Y(s) = F(s)
            </div>
            <span className="text-[7.5px] text-emerald-700 font-bold mt-1.5 block">Álgebra Escolar</span>
          </div>
        </div>

        <p className="text-[9px] text-zinc-600 italic text-center leading-normal pt-1 px-1 font-sans font-semibold">
          "Las derivadas complejas se convierten mágicamente en multiplicaciones y restas de bachillerato"
        </p>
      </div>
    ),
    4: (
      <div className="flex flex-col items-center justify-center p-4 text-center select-none">
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-slate-950/70 p-2 rounded border border-rose-500/20">
            <span className="text-[8.5px] text-rose-400 uppercase font-bold block mb-1">Mundo Temporal</span>
            <span className="text-xs font-mono font-bold text-slate-300">d/dt [Calor]</span>
          </div>
          <div className="bg-slate-950/70 p-2 rounded border border-emerald-500/20">
            <span className="text-[8.5px] text-emerald-400 uppercase font-bold block mb-1">Mundo Laplace S</span>
            <span className="text-xs font-mono font-bold text-slate-300">s · C(s)</span>
          </div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 mt-3 text-[9.5px] text-amber-300 font-sans italic">
          ¡Dejas atrás integrales infinitas y usas matemática tradicional de bachillerato!
        </div>
      </div>
    ),
    5: <InteractiveMiniLab />,
    6: (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 rounded-xl select-none">
        <div className="w-full bg-slate-950/70 py-2.5 px-3 rounded-lg border border-emerald-500/20 text-center">
          <span className="text-[8px] font-mono text-emerald-300 font-bold block mb-1">PROTOCOLO ALFA ACTIVADO</span>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden mb-1 border border-slate-900">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 w-[70%] animate-pulse" />
          </div>
          <span className="text-[9px] text-zinc-400 block font-mono">Ventilación mitigada aplanando calor</span>
        </div>
      </div>
    ),
    7: <InteractiveMiniLab />,
    8: (
      <div className="flex flex-col items-center justify-center p-6 bg-indigo-950/20 rounded-xl border border-indigo-500/10 text-center select-none">
        <span className="text-4xl filter drop-shadow animate-bounce">🎓✨</span>
        <h4 className="text-sm font-bold font-sans text-amber-400 mt-3 uppercase tracking-wider">
          Foro Académico de Control Dinámico
        </h4>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold font-mono block mt-1">
          UniGuajira - 2026
        </span>
        <div className="mt-4 text-[9px] text-zinc-400 leading-relaxed max-w-[200px]">
          ¡Felicidades al equipo de investigación por una grandiosa presentación y simulación en vivo!
        </div>
      </div>
    )
  };

  // Build current processed slides from editable state and customizations
  const slides = [1, 2, 3, 4, 5, 6, 7, 8].map((id) => {
    const editTexts = slidesTextData[id];
    return {
      id,
      badge: editTexts?.badge || "",
      speaker: editTexts?.speaker || "",
      role: editTexts?.role || "",
      title: editTexts?.title || "",
      subtitle: editTexts?.subtitle || "",
      content: editTexts?.content || "",
      imageUrl: customizations[id]?.imageUrl || "https://i.imgur.com/VXL439v.png",
      illustration: DEFAULT_SLIDES_CORES[id as keyof typeof DEFAULT_SLIDES_CORES]
    };
  });

  // Pointer down event to begin dragging element
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>, 
    target: "text" | "illustration", 
    slideId: number
  ) => {
    if (!isEditorOpen) return;
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || (e.target as HTMLElement).isContentEditable) {
      return; 
    }
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}

    const activeCustom = customizations[slideId] || {
      titleSize: slideId === 1 ? 36 : 53,
      subtitleSize: slideId === 1 ? 13 : 22,
      contentSize: slideId === 1 ? 14 : 30,
      textX: slideId === 1 ? -13 : 63,
      textY: slideId === 1 ? 0 : -80,
      illustrationX: slideId === 1 ? 17 : -79,
      illustrationY: 0,
      illustrationScale: slideId === 1 ? 0.84 : 1.4,
      imageUrl: ""
    };

    setDragTracker({
      target,
      slideId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: target === "text" ? (activeCustom.textX || 0) : (activeCustom.illustrationX || 0),
      initialY: target === "text" ? (activeCustom.textY || 0) : (activeCustom.illustrationY || 0)
    });
  };

  // Pointer move to update position translation offsets
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditorOpen || !dragTracker.target) return;
    const dx = e.clientX - dragTracker.startX;
    const dy = e.clientY - dragTracker.startY;
    const slideId = dragTracker.slideId;

    if (dragTracker.target === "text") {
      setCustomizations((prev) => {
        const item = prev[slideId] || {
          titleSize: slideId === 1 ? 36 : 53,
          subtitleSize: slideId === 1 ? 13 : 22,
          contentSize: slideId === 1 ? 14 : 30,
          textX: slideId === 1 ? -13 : 63,
          textY: slideId === 1 ? 0 : -80,
          illustrationX: slideId === 1 ? 17 : -79,
          illustrationY: 0,
          illustrationScale: slideId === 1 ? 0.84 : 1.4,
          imageUrl: ""
        };
        return {
          ...prev,
          [slideId]: {
            ...item,
            textX: Math.round(dragTracker.initialX + dx),
            textY: Math.round(dragTracker.initialY + dy)
          }
        };
      });
    } else {
      setCustomizations((prev) => {
        const item = prev[slideId] || {
          titleSize: slideId === 1 ? 36 : 53,
          subtitleSize: slideId === 1 ? 13 : 22,
          contentSize: slideId === 1 ? 14 : 30,
          textX: slideId === 1 ? -13 : 63,
          textY: slideId === 1 ? 0 : -80,
          illustrationX: slideId === 1 ? 17 : -79,
          illustrationY: 0,
          illustrationScale: slideId === 1 ? 0.84 : 1.4,
          imageUrl: ""
        };
        return {
          ...prev,
          [slideId]: {
            ...item,
            illustrationX: Math.round(dragTracker.initialX + dx),
            illustrationY: Math.round(dragTracker.initialY + dy)
          }
        };
      });
    }
  };

  // Pointer up to release drag lock
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragTracker.target) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
      setDragTracker({
        target: null,
        slideId: 0,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0
      });
    }
  };

  // Pinch/Resize handle calculations
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, slideId: number) => {
    if (!isEditorOpen) return;
    e.stopPropagation();
    e.preventDefault();
    const activeCustom = customizations[slideId] || {
      titleSize: slideId === 1 ? 36 : 53,
      subtitleSize: slideId === 1 ? 13 : 22,
      contentSize: slideId === 1 ? 14 : 30,
      textX: slideId === 1 ? -13 : 63,
      textY: slideId === 1 ? 0 : -80,
      illustrationX: slideId === 1 ? 17 : -79,
      illustrationY: 0,
      illustrationScale: slideId === 1 ? 0.84 : 1.4,
      imageUrl: ""
    };
    setResizeTracker({
      slideId,
      startClientY: e.clientY,
      initialScale: activeCustom.illustrationScale || 1.0
    });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!resizeTracker) return;
      const deltaY = resizeTracker.startClientY - e.clientY; 
      const scaleChange = deltaY / 150; 
      const newScale = Math.max(0.4, Math.min(2.5, resizeTracker.initialScale + scaleChange));
      
      setCustomizations((prev) => {
        const item = prev[resizeTracker.slideId] || {
          titleSize: resizeTracker.slideId === 1 ? 36 : 53,
          subtitleSize: resizeTracker.slideId === 1 ? 13 : 22,
          contentSize: resizeTracker.slideId === 1 ? 14 : 30,
          textX: resizeTracker.slideId === 1 ? -13 : 63,
          textY: resizeTracker.slideId === 1 ? 0 : -80,
          illustrationX: resizeTracker.slideId === 1 ? 17 : -79,
          illustrationY: 0,
          illustrationScale: resizeTracker.slideId === 1 ? 0.84 : 1.4,
          imageUrl: ""
        };
        return {
          ...prev,
          [resizeTracker.slideId]: {
            ...item,
            illustrationScale: parseFloat(newScale.toFixed(2))
          }
        };
      });
    };

    const handleGlobalMouseUp = () => {
      if (resizeTracker) {
        setResizeTracker(null);
      }
    };

    if (resizeTracker) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [resizeTracker]);

  const maxSlide = slides.length;

  // Autoplay intervals
  useEffect(() => {
    let interval: any;
    if (isPlaying && !isAnimating) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, current, isAnimating]);

  const preventClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 850); // Animation duration is 850ms
  };

  const goToSlide = (index: number) => {
    let target = index;
    if (target > maxSlide) target = 1;
    if (target < 1) target = maxSlide;
    setCurrent(target);
  };

  const nextSlide = () => {
    if (isAnimating) return;
    preventClick();
    goToSlide(current + 1);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    preventClick();
    goToSlide(current - 1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        if (isFullscreen) {
          exitFullWindow();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, current, isAnimating]);

  // Handle Fullscreen
  const requestFullWindow = async () => {
    const container = document.documentElement;
    if (container) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } catch (err) {
        console.warn("Fullscreen mode fallback:", err);
        setIsFullscreen(true);
      }
    }
  };

  const exitFullWindow = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {}
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      requestFullWindow();
    } else {
      exitFullWindow();
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-5xl mx-auto h-full text-slate-100 select-none">
      
      {/* PERFECT EMULATION OF THE CUSTOM CSS TEMPLATE PROVIDED */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* EXACT PARALLEX AND STATE TRANSITIONS STYLING */
        .wrapper-slideshow-container {
          position: relative;
          color: #ffffff;
          background-color: #1e1e22;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
        }

        .slideshow {
          position: relative;
          color: #ffffff;
          background-color: #1e1e22;
          overflow: hidden;
          height: 520px;
          width: 100%;
        }

        /* Fullscreen modifications for Canva canvas replication */
        .slideshow-wrapper-fs {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          border-radius: 0px !important;
          border: none !important;
          z-index: 99999 !important;
          background-color: #1a1a1d !important;
        }
        .slideshow-wrapper-fs .slideshow {
          height: 100vh !important;
        }

        .slideshow__slide {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          visibility: hidden;
          transition: visibility 0s 0.85s, opacity 0.85s cubic-bezier(0.25, 1, 0.5, 1), transform 0.85s cubic-bezier(0.25, 1, 0.5, 1), filter 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(1.02);
          filter: blur(4px);
        }
        
        .slideshow__slide.is-current {
          visibility: visible;
          opacity: 1;
          transform: scale(1);
          filter: blur(0px);
          transition-delay: 0s;
          z-index: 10;
        }

        .background-absolute {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background-position: center;
          background-size: cover;
        }

        .slideshow__slide-background-load-wrap {
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          transform: translate3d(0, 0, 0);
          overflow: hidden;
        }

        /* Body state is mimicked locally */
        .is-loaded-state .slideshow__slide-background-load-wrap {
          transform: translate3d(0, 0, 0);
          transition-delay: 0s;
        }

        .slideshow__slide-background-load {
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          transform: translate3d(0, 0, 0);
        }

        .is-loaded-state .slideshow__slide-background-load {
          transform: translate3d(0, 0, 0);
        }

        .slideshow__slide-background-wrap {
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          transform: translate3d(0, 0, 0);
        }

        /* Slide prev/next push translations */
        .slideshow__slide.is-prev .slideshow__slide-background-wrap {
          transform: translate3d(-100%, 0, 0);
        }

        .slideshow__slide.is-next .slideshow__slide-background-wrap {
          transform: translate3d(100%, 0, 0);
        }

        .slideshow__slide-background {
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          transform: scale(1);
          overflow: hidden;
        }

        .slideshow__slide.is-prev .slideshow__slide-background, 
        .slideshow__slide.is-next .slideshow__slide-background {
          transform: scale(1.15);
          transition-delay: 0s;
        }

        .slideshow__slide-image-wrap {
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          transform: translate3d(0, 0, 0);
        }

        .slideshow__slide.is-prev .slideshow__slide-image-wrap {
          transform: translate3d(30%, 0, 0);
        }

        .slideshow__slide.is-next .slideshow__slide-image-wrap {
          transform: translate3d(-30%, 0, 0);
        }

        .slideshow__slide-image {
          transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
          transform: scale(1);
        }

        .slideshow__slide.is-prev .slideshow__slide-image, 
        .slideshow__slide.is-next .slideshow__slide-image {
          transform: scale(1.12);
          transition-delay: 0s;
        }

        /* Vignette gradient overlay on top of slide */
        .slideshow__slide-image::before, 
        .slideshow__slide-image::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          opacity: 0 !important;
        }

        .slideshow__slide-caption-text {
          position: relative;
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          padding: 3rem;
          z-index: 15;
        }

        /* Elements staggering & high-end sliding active slide effects */
        .slideshow__slide-caption {
          width: 100%;
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s, filter 0.8s;
          transform: translate3d(0, 0, 0);
          opacity: 1;
          filter: blur(0px);
        }

        .slideshow__slide.is-prev .slideshow__slide-caption {
          transform: translate3d(-60px, 0, 0);
          opacity: 0;
          filter: blur(4px);
        }

        .slideshow__slide.is-next .slideshow__slide-caption {
          transform: translate3d(60px, 0, 0);
          opacity: 0;
          filter: blur(4px);
        }

        /* Stagger text columns and custom boxes when they enter */
        .slideshow__slide .slideshow__slide-caption-text > .container > div:first-child {
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1) 0.1s, opacity 0.8s ease 0.1s, filter 0.8s ease 0.1s;
        }
        .slideshow__slide.is-prev .slideshow__slide-caption-text > .container > div:first-child,
        .slideshow__slide.is-next .slideshow__slide-caption-text > .container > div:first-child {
          transform: translate3d(-30px, 0, 0) !important;
          opacity: 0 !important;
          filter: blur(3px) !important;
        }

        .slideshow__slide .slideshow__slide-caption-text > .container > div:last-child {
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1) 0.25s, opacity 0.8s ease 0.25s, filter 0.8s ease 0.25s;
        }
        .slideshow__slide.is-prev .slideshow__slide-caption-text > .container > div:last-child,
        .slideshow__slide.is-next .slideshow__slide-caption-text > .container > div:last-child {
          transform: translate3d(30px, 0, 0) !important;
          opacity: 0 !important;
          filter: blur(3px) !important;
        }

        /* Custom slide 1 side sections slide-in entrance */
        .slideshow__slide > div:first-child {
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1) 0.05s, opacity 0.8s ease 0.05s;
        }
        .slideshow__slide.is-prev > div:first-child,
        .slideshow__slide.is-next > div:first-child {
          transform: translate3d(-80px, 0, 0) !important;
          opacity: 0 !important;
        }

        .slideshow__slide > div:last-child {
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1) 0.22s, opacity 0.8s ease 0.22s;
        }
        .slideshow__slide.is-prev > div:last-child,
        .slideshow__slide.is-next > div:last-child {
          transform: translate3d(80px, 0, 0) !important;
          opacity: 0 !important;
        }

        /* PAGINATION STYLES MATCHING THE WRITTEN TEMPLATE */
        .pagination {
          position: absolute !important;
          width: 100%;
          text-align: center;
          right: 0;
          padding: 0 !important;
          bottom: 30px;
          z-index: 999;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .pagination__item {
          cursor: pointer;
          display: inline-block;
          white-space: nowrap;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
          width: 20px;
          height: 20px;
          line-height: 20px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin: 0 6px;
          transition: all 0.2s ease-in-out;
          background-color: rgba(15, 23, 42, 0.4);
          text-align: center;
        }
        
        .pagination__item.is-current, 
        .pagination__item:hover {
          background-color: #6366f1 !important;
          color: #ffffff !important;
          border-color: #6366f1 !important;
          transform: scale(1.15);
        }

        /* STEREOSCOPIC CONTROL FOOTER BOX */
        .c-header-home_footer {
          z-index: 30;
          position: absolute;
          right: 30px;
          bottom: 18px;
        }

        .o-button {
          display: inline-block;
          overflow: visible;
          outline: 0;
          border: 0;
          background: none;
          color: inherit;
          vertical-align: middle;
          text-align: center;
          text-decoration: none;
          text-transform: none;
          font: inherit;
          line-height: normal;
          cursor: pointer;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        .o-button.-white.-square {
          border: 1px solid rgba(255, 255, 255, 0.25);
          background-color: rgba(15, 23, 42, 0.55);
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0 4px;
          transition: all 0.25s ease-in-out;
        }

        .o-button.-white.-square:hover {
          background-color: #6366f1;
          border-color: #6366f1;
          color: white;
          transform: translateY(-2px);
        }
        
        .o-button_icon {
          width: 18px;
          height: 18px;
          stroke: currentColor;
        }
      `}} />

      {/* Presentation Header Controls Card */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400 shrink-0">
            <Monitor className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide leading-none">
              Defensa del Foro Académico en Altas Prestaciones
            </h4>
            <p className="text-[10px] text-zinc-400">
              Imitando exactamente el diseño original con transiciones de escala de imagen de fondo y parallax.
            </p>
          </div>
        </div>

        {/* Media controls and canvas full screen toggle */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => {
              preventClick();
              goToSlide(1);
            }}
            className="p-2 cursor-pointer rounded-lg hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all text-xs"
            title="Reiniciar Diapositiva"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* PLAY/PAUSE */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 cursor-pointer rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 active:scale-95 ${
              isPlaying 
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" 
                : "bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 shrink-0" />
                <span>Pulsando Auto-Play...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 shrink-0 animate-pulse text-indigo-400" />
                <span>Auto-Lectura (5s)</span>
              </>
            )}
          </button>

          {/* CANVA EDITOR TOGGLE */}
          <button
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className={`px-4 py-2 cursor-pointer border text-xs font-bold rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-md ${
              isEditorOpen
                ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-950/20 animate-pulse"
                : "bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-indigo-400"
            }`}
            id="btn-canva-editor-toggle"
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>{isEditorOpen ? "Cerrar Editor" : "Editor Canva (Ajustar)"}</span>
          </button>

          {/* CANVA FULLSCREEN TRIGGER */}
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-650 border border-emerald-500/20 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-950/20"
            id="btn-canva-presentation-mode"
          >
            <Maximize2 className="w-4 h-4 shrink-0" />
            <span>Presentar (Pantalla Completa)</span>
          </button>

          {/* SIMULADOR DIRECT LINK BUTTON */}
          <button
            onClick={() => onGoToSimulator && onGoToSimulator()}
            className="px-4 py-2 cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 border border-indigo-500/20 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-indigo-950/20"
            id="btn-go-to-simulator-direct"
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>Ir al Simulador 🚀</span>
          </button>
        </div>
      </div>

      {/* Main layout container with conditional grid for the editor side panel */}
      <div className={`grid grid-cols-1 ${isEditorOpen ? "lg:grid-cols-12" : ""} gap-6 items-start w-full`}>
        
        {/* Main Slideshow Frame */}
        <div className={isEditorOpen ? "lg:col-span-8 w-full" : "w-full"}>
          {/* Main Slideshow Frame (handles local fullscreen wrapper & is-loaded-state) */}
          <div 
            ref={slideshowRef} 
            id="slideshow-full-wrapper"
            className={`is-loaded-state wrapper-slideshow-container ${isFullscreen ? "slideshow-wrapper-fs" : ""}`}
          >
            <section className="slideshow border-0" id="js-header">
              {slides.map((slide) => {
                const isCurrent = slide.id === current;
                const isPrev = slide.id === (current === 1 ? maxSlide : current - 1);
                const isNext = slide.id === (current === maxSlide ? 1 : current + 1);

                let slideStatusClass = "";
                if (isCurrent) slideStatusClass = "is-current";
                else if (isPrev) slideStatusClass = "is-prev";
                else if (isNext) slideStatusClass = "is-next";

                const customs = customizations[slide.id] || {
                  titleSize: slide.id === 1 ? 36 : 53,
                  subtitleSize: slide.id === 1 ? 13 : 22,
                  contentSize: slide.id === 1 ? 14 : 30,
                  textX: slide.id === 1 ? -13 : 63,
                  textY: slide.id === 1 ? 0 : -80,
                  illustrationX: slide.id === 1 ? 17 : -79,
                  illustrationY: 0,
                  illustrationScale: slide.id === 1 ? 0.84 : 1.4,
                  imageUrl: slide.imageUrl
                };

                const isSlide1 = slide.id === 1;

                return (
                  <div 
                    key={slide.id} 
                    className={`slideshow__slide ${slideStatusClass}`}
                    data-slide={slide.id}
                  >
                    {isSlide1 ? (
                      /* CUSTOM COOPERATIVE HIGH FIDELITY LAYOUT FOR PORTADA (SLIDE 1) */
                      <div 
                        className="absolute inset-0 flex flex-col md:flex-row w-full h-full overflow-hidden bg-[#c23f27] text-slate-800 select-all font-sans"
                        style={{
                          backgroundImage: "linear-gradient(rgba(30, 30, 35, 0.25), rgba(30, 30, 35, 0.25)), url('https://i.imgur.com/JcqhtSi.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat"
                        }}
                      >
                        
                        {/* Wayuu Herringbone chevron decorative lines */}
                        {!customs.hideBackgroundWayuu && (
                          <div className="absolute inset-0 pointer-events-none opacity-[0.08] z-0">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <pattern id="wayuu-chevrons-cover" width="80" height="50" patternUnits="userSpaceOnUse">
                                  <path d="M 0 0 L 40 25 L 80 0 M 0 25 L 40 50 L 80 25" fill="none" stroke="#ffffff" strokeWidth="3" />
                                  <path d="M 0 10 L 40 35 L 80 10 M 0 35 L 40 60 L 80 35" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" />
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#wayuu-chevrons-cover)" />
                            </svg>
                          </div>
                        )}

                        {/* LEFT SECTION: White Inset Card Holding Cover Data */}
                        <div className="relative w-full md:w-[48%] h-full bg-white md:rounded-r-[3rem] p-6 md:p-10 flex flex-col justify-between shadow-2xl z-20 text-slate-900 border-r border-slate-100/10">
                          
                          {/* Top Heading */}
                          <div className="space-y-4 my-auto text-left">
                            <div className="space-y-1.5">
                              {!customs.hideLeftBadge && (
                                <span className="text-[10px] tracking-wider uppercase font-extrabold text-[#c23f27] bg-[#c23f27]/10 px-3 py-1 rounded-full inline-block font-mono">
                                  Sistema de Control
                                </span>
                              )}
                              <h1 
                                contentEditable={isEditorOpen}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                  const text = e.currentTarget.textContent || "";
                                  setSlidesTextData(prev => ({
                                    ...prev,
                                    1: { ...(prev[1] || {}), title: text }
                                  }));
                                }}
                                className="font-serif text-[22px] md:text-[28px] lg:text-[32px] font-extrabold tracking-tight text-[#1e224e] leading-snug focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-1"
                              >
                                {slide.title || "Sistema de Control de Acceso Biométrico y Multiprotocolo"}
                              </h1>
                            </div>

                            <p 
                              contentEditable={isEditorOpen}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => {
                                  const text = e.currentTarget.textContent || "";
                                  setSlidesTextData(prev => ({
                                    ...prev,
                                    1: { ...(prev[1] || {}), subtitle: text }
                                  }));
                                }}
                              className="text-[12px] md:text-[14px] lg:text-[15px] font-semibold text-slate-500 tracking-wide focus:outline-none focus:ring-1 focus:ring-orange-500 px-1"
                            >
                              {slide.subtitle || "Proyecto Aplicado - Laboratorio de Física Eléctrica"}
                            </p>

                            {/* Authors detail layout */}
                            {!customs.hideIntegrantes && (
                              <div className="pt-4 pb-4">
                                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold font-mono block mb-2">INTEGRANTES DEL EQUIPO</span>
                                <div className="space-y-1.5 md:space-y-2">
                                  {[
                                    "JOSHEP DAVID ROMERO PEREZ",
                                    "TEMISTOCLE EISYANIOR ATENCIO IPUANA",
                                    "RODERICK GALLARDO GRATEROL",
                                    "DANILO JOSÉ MIRANDA EPIAYU"
                                  ].map((author, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-[#c23f27]" />
                                      <span className="text-[11.5px] md:text-[13px] font-bold text-slate-800 tracking-tight font-sans">
                                        {author}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Cover page Footer inside Card */}
                          {!customs.hideLeftFooter && (
                            <div className="border-t border-slate-100 pt-4 flex flex-col gap-1 mt-auto text-left">
                              <span 
                                contentEditable={isEditorOpen}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                  if (!isEditorOpen) return;
                                  const text = e.currentTarget.textContent || "";
                                  setSlidesTextData(prev => ({
                                    ...prev,
                                    1: { ...(prev[1] || {}), role: text }
                                  }));
                                }}
                                className="font-serif font-bold text-[#1e224e] text-[13px] md:text-[14px] tracking-wide focus:outline-none focus:ring-1 focus:ring-orange-500"
                              >
                                {slide.role || "Laboratorio de Física Eléctrica"}
                              </span>
                              <span 
                                contentEditable={isEditorOpen}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                  if (!isEditorOpen) return;
                                  const text = e.currentTarget.textContent || "";
                                  setSlidesTextData(prev => ({
                                    ...prev,
                                    1: { ...(prev[1] || {}), badge: text }
                                  }));
                                }}
                                className="text-[11px] md:text-[12px] text-slate-500 font-medium font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
                              >
                                {slide.badge || "17 de junio de 2026"}
                              </span>
                            </div>
                          )}

                        </div>

                        {/* RIGHT SECTION: Deep Terracotta Orange Area with Campus Mockup & Seals */}
                        <div className="relative flex-1 h-full flex flex-col justify-between p-6 md:p-8 z-10 overflow-hidden">
                          
                          {/* Top Row: Crest & Accreditation badge */}
                          <div className="flex justify-between items-start gap-4">
                            
                            {/* Universidad de La Guajira Crest line art drawing */}
                            {!customs.hideUGuajiraCrest ? (
                              <div className="flex items-center gap-3">
                                <svg className="w-12 h-12 text-white fill-none" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="2.5">
                                  {/* Interlocking indigenous loops logo of UniGuajira */}
                                  <path d="M20 20 L40 50 L20 80 M80 20 L60 50 L80 80 M30 35 L50 65 L70 35 M30 65 L50 35 L70 65" />
                                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
                                </svg>
                                <div className="text-white text-left">
                                  <span className="font-serif font-extrabold text-[13px] tracking-wider block">UNIVERSIDAD</span>
                                  <span className="font-serif font-extrabold text-[12px] tracking-widest block text-amber-300">DE LA GUAJIRA</span>
                                  <span className="text-[7.5px] font-mono tracking-wider block text-white/70 uppercase">Shikii Ekirajia Pülee Wajiira</span>
                                </div>
                              </div>
                            ) : <div className="w-12 h-1" />}

                            {/* Center Circular Accreditation Seal */}
                            {!customs.hideAccreditationSeal && (
                              <div className="relative shrink-0 flex items-center justify-center p-1 bg-white/10 rounded-full border border-white/20 hover:scale-105 transition-transform duration-300">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#bf360c] flex flex-col items-center justify-center border-2 border-white text-white p-1 text-center relative">
                                  <svg className="w-5 h-5 text-white stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-[6.5px] md:text-[7.5px] font-extrabold uppercase leading-tight block tracking-tight">Uniguajira</span>
                                  <span className="text-[5.5px] md:text-[6.5px] font-bold block leading-none font-sans text-amber-300">ACREDITADA</span>
                                  <span className="text-[4.5px] md:text-[5px] block font-mono text-zinc-100 leading-none">Alta Calidad</span>
                                </div>
                              </div>
                            )}

                          </div>

                          {/* Center: Beautiful interactive responsive vector building mockup */}
                          <div 
                            className={`relative flex-1 w-full max-h-[220px] md:max-h-[260px] my-4 rounded-2xl bg-[#1e1e22]/40 dynamic-vector-container flex items-end justify-center overflow-hidden border border-white/15 shadow-2xl ${
                              isEditorOpen 
                                ? "border-2 border-dashed border-indigo-400 bg-indigo-950/20 cursor-move hover:border-indigo-300" 
                                : ""
                            }`}
                            style={{
                              transform: `translate(${customs.illustrationX || 0}px, ${customs.illustrationY || 0}px) scale(${customs.illustrationScale || 1.0})`,
                              transition: isAnimating ? "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)" : "transform 0.1s ease-out"
                            }}
                            onPointerDown={(e) => handlePointerDown(e, 'illustration', slide.id)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                          >
                            {/* The user's custom presentation image with fallback */}
                            <img 
                              src={customs.imageUrl || "blob:https://imgur.com/9504e535-09ac-47b4-96c4-bc1fd02e6552"} 
                              alt="UniGuajira Portada"
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover z-20 transition-opacity duration-300 pointer-events-none"
                              onError={(e) => {
                                // Fallback gracefully by hiding the image if it fails to resolve
                                e.currentTarget.style.display = 'none';
                              }}
                            />

                            {/* CANVA resize handle overlay */}
                            {isEditorOpen && (
                              <div 
                                onMouseDown={(e) => handleResizeStart(e, slide.id)}
                                className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white cursor-ns-resize shadow-md hover:scale-110 active:scale-95 transition-all z-35"
                                title="Arrastrar verticalmente para Cambiar Tamaño"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                </svg>
                              </div>
                            )}

                            {/* Building Yellow facade with window panes */}
                            {!customs.hideBuildingMockupBackground && (
                              <>
                                <div className="absolute inset-0 bg-[#E0B22F] flex flex-col justify-between p-4 z-0">
                                  {/* 3 floors with grid rows of windows */}
                                  {[1, 2, 3].map((floor) => (
                                    <div key={floor} className="flex justify-around items-center w-full py-1.5 border-b border-black/10">
                                      {[1, 2, 3, 4, 5, 6].map((window) => (
                                        <div key={window} className="bg-slate-900 w-5 h-7 rounded border border-slate-700/80 hover:bg-[#F2C037]/20 transition-all flex flex-col justify-between p-0.5">
                                          <div className="bg-sky-400/40 w-full h-[40%]" />
                                          <div className="bg-sky-400/40 w-full h-[40%]" />
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>

                                {/* Accent Vertical bright red/pink Columns across building */}
                                <div className="absolute inset-0 flex justify-around items-start pointer-events-none z-10 px-4">
                                  {[1, 2, 3, 4, 5].map((col) => (
                                    <div key={col} className="w-4 h-[115%] bg-[#C23F27] border-x border-[#A32B1E] flex flex-col justify-end items-center relative shadow-stone-900/45 shadow-lg">
                                      {/* Column caps */}
                                      <div className="absolute top-0 w-6 h-2 bg-slate-200 border border-slate-300 rounded" />
                                    </div>
                                  ))}
                                </div>

                                {/* White safety glass handrails and balconies platforms */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-12 py-3">
                                  {[1, 2, 3].map((balcony) => (
                                    <div key={balcony} className="w-full h-2 bg-white/90 border-y border-slate-300/80 shadow" />
                                  ))}
                                </div>

                                {/* Foreground green foliage leafy shapes at the bottom corners */}
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#2e7d32] to-[#4caf50]/80 z-15 flex items-end justify-between px-2 pointer-events-none">
                                  <div className="w-16 h-12 bg-[#2e7d32] rounded-full filter blur-sm -mb-3" />
                                  <div className="w-24 h-14 bg-[#1b5e20] rounded-full filter blur-sm -mb-4 mr-10" />
                                  <div className="w-20 h-12 bg-[#2e7d32] rounded-full filter blur-sm -mb-3" />
                                </div>
                              </>
                            )}
                          </div>

                          {/* Bottom Row: Accreditation quality badges */}
                          {!customs.hideBottomQualitySeals && (
                            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-2 md:p-3 rounded-xl backdrop-blur-sm z-20">
                              
                              {/* nidos por una uniguajira stamp */}
                              <div className="flex items-center gap-1.5 text-[8.5px] font-sans font-black text-white text-left">
                                <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 font-bold font-mono">U</div>
                                <div>
                                  <span className="block leading-none tracking-tight font-extrabold text-amber-300">Uniguajira</span>
                                  <span className="block leading-none text-[6.5px] text-zinc-100 font-medium">Acreditada, Inclusiva e Innovadora</span>
                                </div>
                              </div>

                              {/* Icontec seal replica */}
                              <div className="flex items-center gap-1 text-[8px] border-l border-white/20 pl-3">
                                <div className="h-5 w-5 bg-sky-600 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold border border-white shrink-0">@</div>
                                <span className="text-zinc-200 block text-left font-sans font-bold leading-none select-none">
                                  ICONTEC<br/><span className="text-[6.5px] text-zinc-400 font-normal">ISO 9001</span>
                                </span>
                              </div>

                              {/* IQNet certified badge */}
                              <div className="flex items-center gap-1 border-l border-white/20 pl-3">
                                <div className="bg-slate-900 border border-zinc-500 rounded px-1.5 py-0.5 text-[7px] text-white font-black font-mono shadow">
                                  IQNET
                                </div>
                                <span className="text-[6px] text-zinc-300 block text-left uppercase tracking-tight leading-none font-bold">Certified<br/>System</span>
                              </div>

                            </div>
                          )}

                        </div>

                      </div>
                    ) : (
                      <>
                        {/* PARALLAX & LOAD STRUCTURAL COMPLIANCE */}
                        <div className="slideshow__slide-background-parallax background-absolute">
                          <div className="slideshow__slide-background-load-wrap background-absolute">
                            <div className="slideshow__slide-background-load background-absolute">
                              <div className="slideshow__slide-background-wrap background-absolute">
                                <div className="slideshow__slide-background background-absolute">
                                  <div className="slideshow__slide-image-wrap background-absolute">
                                    <div 
                                      className="slideshow__slide-image background-absolute" 
                                      style={{ 
                                        backgroundImage: `url('${customs.imageUrl || slide.imageUrl}')`,
                                        transform: isCurrent ? 'scale(1)' : 'scale(1.25)'
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SLIDE CAPTION - WITH GLASSMORPHISM AND DUAL COLUMN FOR PRESENTATION QUALITY */}
                        <div className="slideshow__slide-caption">
                          <div className="slideshow__slide-caption-text">
                            <div className="container flex flex-col md:flex-row items-center gap-8 justify-between w-full h-full relative z-25">
                              
                              {/* Left Column Text details */}
                              <div 
                                className={`${customs.hideIllustrationBox ? 'w-full max-w-4xl mx-auto' : 'flex-1'} p-5 rounded-2xl transition-all relative ${
                                  isEditorOpen 
                                    ? "border-2 border-dashed border-indigo-400 bg-indigo-950/20 cursor-move hover:border-indigo-300" 
                                    : ""
                                }`}
                                style={{
                                  transform: `translate(${customs.textX}px, ${customs.textY}px)`,
                                  transition: isAnimating ? "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)" : "transform 0.1s ease-out",
                                  fontFamily: customs.fontFamily === "Space Grotesk" ? "Space Grotesk, sans-serif" : customs.fontFamily === "Playfair Display" ? "Playfair Display, serif" : customs.fontFamily === "JetBrains Mono" ? "JetBrains Mono, monospace" : customs.fontFamily === "Outfit" ? "Outfit, sans-serif" : "Inter, sans-serif",
                                  textAlign: customs.textAlignment || "left"
                                }}
                                onPointerDown={(e) => handlePointerDown(e, 'text', slide.id)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                              >
                                {/* Canva drag label */}
                                {isEditorOpen && (
                                  <div className="absolute -top-3.5 left-2 bg-indigo-600 text-white text-[9px] font-mono leading-none font-bold px-2 py-1 rounded uppercase flex items-center gap-1 select-none pointer-events-none z-30 shadow-md">
                                    <Move className="w-2.5 h-2.5 shrink-0" />
                                    <span>Texto (Mover / Haz Click para Editar Texto)</span>
                                  </div>
                                )}

                                {/* Upper meta information */}
                                <div className={`flex items-center gap-3 flex-wrap ${customs.textAlignment === 'center' ? 'justify-center' : customs.textAlignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                                  {!customs.hideLeftBadge && (
                                    <span 
                                      contentEditable={isEditorOpen}
                                      suppressContentEditableWarning={true}
                                      onBlur={(e) => {
                                        const text = e.currentTarget.textContent || "";
                                        setSlidesTextData(prev => ({
                                          ...prev,
                                          [slide.id]: { ...(prev[slide.id] || {}), badge: text }
                                        }));
                                      }}
                                      className="text-[9.5px] font-mono leading-none px-3 py-1 rounded-full uppercase tracking-wider font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      style={{
                                        backgroundColor: customs.badgeBg || "#e0e7ff",
                                        color: customs.badgeColor || "#4338ca"
                                      }}
                                    >
                                      {slide.badge}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-zinc-400 font-mono select-none">
                                    🎚 Diapositiva {slide.id} de {maxSlide}
                                  </span>
                                </div>

                                {/* Speaker details */}
                                {!customs.hideSpeakerRole && false && (
                                  <div 
                                    className={`border-l-2 pl-3.5 py-1 rounded-r-lg max-w-sm bg-indigo-50/10 ${
                                      customs.textAlignment === 'center' ? 'mx-auto border-x-2 px-3.5' : customs.textAlignment === 'right' ? 'ml-auto border-l-0 border-r-2 pr-3.5 pl-0' : 'border-indigo-600'
                                    }`}
                                  >
                                    <h5 
                                      contentEditable={isEditorOpen}
                                      suppressContentEditableWarning={true}
                                      onBlur={(e) => {
                                        const text = e.currentTarget.textContent || "";
                                        setSlidesTextData(prev => ({
                                          ...prev,
                                          [slide.id]: { ...(prev[slide.id] || {}), speaker: text }
                                        }));
                                      }}
                                      className="text-[11px] font-mono uppercase tracking-wide font-bold m-0 leading-tight text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      Ponente: {slide.speaker}
                                    </h5>
                                    <span 
                                      contentEditable={isEditorOpen}
                                      suppressContentEditableWarning={true}
                                      onBlur={(e) => {
                                        const text = e.currentTarget.textContent || "";
                                        setSlidesTextData(prev => ({
                                          ...prev,
                                          [slide.id]: { ...(prev[slide.id] || {}), role: text }
                                        }));
                                      }}
                                      className="text-[9.5px] text-zinc-300 block focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      Rol: {slide.role}
                                    </span>
                                  </div>
                                )}

                                {/* Slide Title */}
                                <div className="space-y-1">
                                  <h1 
                                    contentEditable={isEditorOpen}
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => {
                                      const text = e.currentTarget.textContent || "";
                                      setSlidesTextData(prev => ({
                                        ...prev,
                                        [slide.id]: { ...(prev[slide.id] || {}), title: text }
                                      }));
                                    }}
                                    className="font-black font-sans tracking-tight m-0 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
                                    style={{ 
                                      fontSize: `${customs.titleSize}px`, 
                                      lineHeight: "1.1",
                                      color: customs.titleColor || "#ffffff"
                                    }}
                                  >
                                    {slide.title}
                                  </h1>
                                  <p 
                                    contentEditable={isEditorOpen}
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => {
                                      const text = e.currentTarget.textContent || "";
                                      setSlidesTextData(prev => ({
                                        ...prev,
                                        [slide.id]: { ...(prev[slide.id] || {}), subtitle: text }
                                      }));
                                    }}
                                    className="font-sans font-semibold italic mt-1 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 px-1"
                                    style={{ 
                                      fontSize: `${customs.subtitleSize}px`,
                                      color: customs.subtitleColor || "#fbbf24"
                                    }}
                                  >
                                    {slide.subtitle}
                                  </p>
                                </div>

                                {/* Slide narrative script */}
                                <p 
                                  contentEditable={isEditorOpen}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => {
                                    const text = e.currentTarget.textContent || "";
                                    setSlidesTextData(prev => ({
                                      ...prev,
                                      [slide.id]: { ...(prev[slide.id] || {}), content: text }
                                    }));
                                  }}
                                  className="text-justify font-sans leading-relaxed font-medium max-w-xl md:max-w-3xl focus:outline-none focus:ring-1 focus:ring-indigo-500 px-1"
                                  style={{ 
                                    fontSize: `${customs.contentSize}px`,
                                    color: customs.contentColor || "#e4e4e7"
                                  }}
                                >
                                  {slide.content}
                                </p>

                                {slide.id === 5 && (
                                  <div className="mt-5 flex">
                                    <button
                                      onClick={() => onGoToSimulator && onGoToSimulator()}
                                      className="px-5 py-3 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-550 border border-amber-400/20 text-xs font-bold text-slate-950 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-lg animate-pulse"
                                      id="btn-slide-go-to-simulator"
                                    >
                                      <Play className="w-4 h-4 fill-slate-950 shrink-0" />
                                      <span>Abrir Simulador del Laboratorio 🔬</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Right Column Custom Aesthetic Illustration Box */}
                              {!customs.hideIllustrationBox && (
                                <div 
                                  className={`rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-2xl relative p-4 transition-all ${
                                    isFullscreen ? "w-full md:w-110 h-80" : "w-full md:w-85 h-60"
                                  } ${
                                    isEditorOpen 
                                      ? "border-2 border-dashed border-amber-400 select-none cursor-move hover:bg-slate-900/40" 
                                      : "border border-slate-800/80"
                                  }`}
                                  style={{
                                    transform: `translate(${customs.illustrationX}px, ${customs.illustrationY}px) scale(${customs.illustrationScale})`,
                                    transition: isAnimating ? "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)" : (resizeTracker ? "none" : "transform 0.15s ease-out"),
                                    backgroundColor: customs.boxBg || "rgba(2, 6, 23, 0.85)",
                                    borderColor: customs.boxBorderColor || "rgba(99,102,241,0.25)"
                                  }}
                                  onPointerDown={(e) => handlePointerDown(e, 'illustration', slide.id)}
                                  onPointerMove={handlePointerMove}
                                  onPointerUp={handlePointerUp}
                                >
                                  {/* Canva drag label */}
                                  {isEditorOpen && (
                                    <div className="absolute -top-3.5 left-2 bg-amber-500 text-slate-950 text-[9px] font-mono font-bold px-2 py-1 rounded uppercase flex items-center gap-1 select-none pointer-events-none z-35 shadow-md">
                                      <Move className="w-2.5 h-2.5" />
                                      <span>Ilustración (Mover / Arrastrar handle abajo)</span>
                                    </div>
                                  )}

                                  {/* Resizer control handle like in Canva */}
                                  {isEditorOpen && (
                                    <div 
                                      onMouseDown={(e) => handleResizeStart(e, slide.id)}
                                      className="absolute bottom-1 right-1 w-6 h-6 bg-amber-500 rounded-tl-lg rounded-br-2xl flex items-center justify-center cursor-se-resize hover:scale-110 active:scale-95 transition-all z-35 text-slate-950 shadow-md border-l border-t border-amber-400"
                                      title="Estirar / Escalar Ilustración (Canva style)"
                                    >
                                      <RotateCw className="w-3.5 h-3.5 font-bold animate-pulse" />
                                    </div>
                                  )}

                                  {/* Corner signature mark */}
                                  <span className="absolute top-2.5 right-3 text-[7.5px] text-zinc-500 font-mono uppercase font-bold tracking-wider select-none">
                                    UniGuajira • Simulador G7
                                  </span>
                                  {slide.illustration}
                                </div>
                              )}

                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* stereoscopic footer buttons */}
              <div className="c-header-home_footer">
                <div className="o-container">
                  <div className="c-header-home_controls o-button-group">
                    <button 
                      onClick={prevSlide}
                      className="o-button -white -square -left"
                      type="button"
                      title="Anterior (Flecha Izquierda)"
                    >
                      <span className="o-button_label">
                        <ChevronLeft className="o-button_icon" />
                      </span>
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="o-button -white -square"
                      type="button"
                      title="Siguiente (Flecha Derecha / Espacio)"
                    >
                      <span className="o-button_label">
                        <ChevronRight className="o-button_icon" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CANVAS PAGINATION DOTS CONTAINER */}
              <div className="pagination">
                <div className="container justify-center flex">
                  {slides.map((slide) => (
                    <span
                      key={slide.id}
                      onClick={() => {
                        preventClick();
                        goToSlide(slide.id);
                      }}
                      className={`pagination__item ${slide.id === current ? "is-current" : ""}`}
                      data-slide={slide.id}
                     >
                      {slide.id}
                    </span>
                  ))}
                </div>
              </div>

              {/* Canva presentation overlay controls when active */}
              {isFullscreen && (
                <div className="absolute top-6 left-6 z-55 flex items-center gap-2 pointer-events-none bg-indigo-950/90 border border-indigo-400/20 px-3 py-1.5 rounded-xl text-[10px] text-zinc-300 font-mono animate-pulse shadow-xl">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span>Modo Canva Activo. Pulsa <strong>← Izquierda  /  Espacio  /  Derecha →</strong> para navegar.</span>
                </div>
              )}

              {/* Canvas exit button directly on presentation screen */}
              {isFullscreen && (
                <button
                  onClick={exitFullWindow}
                  className="absolute top-6 right-6 z-55 cursor-pointer bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-600 hover:text-white p-2 text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xl transition-all"
                  id="btn-close-fs-presentation"
                >
                  <X className="w-4 h-4 shrink-0" />
                  <span>Salir (Esc)</span>
                </button>
              )}

            </section>
          </div>

          {/* Synchronized Script Toggle Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowSyncScript(!showSyncScript)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-2 shadow-lg active:scale-95 border hover:scale-[1.01] ${
                showSyncScript
                  ? "bg-gradient-to-r from-rose-600/20 to-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:border-indigo-400/40"
                  : "bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700"
              }`}
            >
              <span className="text-sm">{showSyncScript ? "👁️" : "🗣️"}</span>
              <span>{showSyncScript ? "Ocultar Guión de Apoyo" : "Mostrar Guión de Apoyo Sincronizado"}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 border border-white/5 text-zinc-400">
                {showSyncScript ? "ACTIVO" : "OCULTO"}
              </span>
            </button>
          </div>

          {/* Synchronized Script Parts Panel */}
          {showSyncScript && (
            <div className="mt-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4 text-left backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">🗣️</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide font-mono">
                    Guión de Apoyo Sincronizado
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Diálogos correspondientes a la <strong>Diapositiva {current}</strong>
                  </p>
                </div>
              </div>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                Sincronización en vivo 🟢
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {scriptParts.filter(part => part.slideNumber === current).length > 0 ? (
                scriptParts
                  .filter(part => part.slideNumber === current)
                  .map((part) => (
                    <div 
                      key={part.id} 
                      className={`p-4 rounded-xl border ${part.borderCol} ${part.bgCol} space-y-2.5 transition-all hover:bg-opacity-40`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[10px] ${part.color}`}>
                            {part.avatar}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-100 block">
                              {part.speaker}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {part.role}
                            </span>
                          </div>
                        </div>
                        <span className="bg-slate-900/60 text-slate-400 border border-slate-800 font-mono text-[9px] px-2 py-0.5 rounded">
                          ⏱ {part.time}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed font-sans text-justify">
                        {part.dialogue}
                      </p>

                      {part.analogyDesc && (
                        <div className="bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg text-[10px] space-y-0.5 leading-relaxed">
                          <span className="text-amber-400 font-bold font-mono tracking-tight flex items-center gap-1">
                            💡 {part.analogyTitle}
                          </span>
                          <p className="text-zinc-400 font-sans">
                            {part.analogyDesc}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 text-center text-xs text-zinc-400 leading-relaxed font-sans">
                  {current === 1 ? (
                    <div>
                      <p className="font-bold text-indigo-300 mb-1">🎭 Diapositiva 1 - Apertura de Portada</p>
                      <p className="text-zinc-500 leading-relaxed">
                        Danilo Miranda (P1) da la bienvenida a profesores, jurados y compañeros. Introduce la problemática inicial del foro utilizando la analogía del colapso del servidor de matrículas de la universidad.
                      </p>
                    </div>
                  ) : (
                    "No hay diálogos explícitos asignados a esta diapositiva en el guión principal. Se utiliza como recurso visual de apoyo."
                  )}
                </div>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Canva Editor panel (Visible when open) */}
        {isEditorOpen && (
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-6 shadow-xl text-left">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Editor Canva 🛠️</span>
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Ajusta posiciones, tamaños y fondos en vivo</p>
              </div>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="p-1 cursor-pointer hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-zinc-400 hover:text-white rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide active indicator */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-wider">Diapositiva Activa</span>
              <div className="flex gap-1.5 flex-wrap">
                {slides.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => goToSlide(s.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      s.id === current 
                        ? "bg-indigo-600 text-white border border-indigo-400/40"
                        : "bg-slate-900 text-zinc-400 border border-slate-850 hover:bg-slate-850"
                    }`}
                  >
                    D{s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls parameters */}
            {(() => {
              const activeCustom = customizations[current] || {
                titleSize: current === 1 ? 36 : 53,
                subtitleSize: current === 1 ? 13 : 22,
                contentSize: current === 1 ? 14 : 30,
                textX: current === 1 ? -13 : 63,
                textY: current === 1 ? 0 : -80,
                illustrationX: current === 1 ? 17 : -79,
                illustrationY: 0,
                illustrationScale: current === 1 ? 0.84 : 1.4,
                imageUrl: current === 1 ? "https://i.imgur.com/CKnu0PY.png" : "https://i.imgur.com/VXL439v.png",
                titleColor: "#ffffff",
                subtitleColor: "#fbbf24",
                contentColor: "#e4e4e7",
                badgeBg: "#e0e7ff",
                badgeColor: "#4338ca",
                boxBg: "rgba(2, 6, 23, 0.85)",
                boxBorderColor: "rgba(99,102,241,0.25)",
                fontFamily: "Inter",
                textAlignment: "left"
              };

              // Quick Apply Theme presets
              const applyColorPreset = (preset: {
                title: string;
                sub: string;
                content: string;
                badgeBg: string;
                badgeTxt: string;
                cardBg: string;
                cardBorder: string;
              }) => {
                updateCurrentCustomization("titleColor", preset.title);
                updateCurrentCustomization("subtitleColor", preset.sub);
                updateCurrentCustomization("contentColor", preset.content);
                updateCurrentCustomization("badgeBg", preset.badgeBg);
                updateCurrentCustomization("badgeColor", preset.badgeTxt);
                updateCurrentCustomization("boxBg", preset.cardBg);
                updateCurrentCustomization("boxBorderColor", preset.cardBorder);
              };

              return (
                <div className="space-y-5">
                  {/* Image Background */}
                  <div className="space-y-1.5 border-t border-slate-900 pt-3">
                    <label className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider block flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Fondo de Diapositiva</span>
                    </label>
                    <input
                      type="text"
                      value={activeCustom.imageUrl || ""}
                      onChange={(e) => updateCurrentCustomization("imageUrl", e.target.value)}
                      className="w-full bg-slate-900 text-xs text-zinc-200 border border-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="URL de imagen..."
                    />
                    <div className="flex gap-1 flex-wrap pt-0.5">
                      <button
                        onClick={() => updateCurrentCustomization("imageUrl", "https://i.imgur.com/CKnu0PY.png")}
                        className="text-[9px] cursor-pointer bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-300"
                      >
                        Fondo de Portada (Edificio)
                      </button>
                      <button
                        onClick={() => updateCurrentCustomization("imageUrl", "https://i.imgur.com/VXL439v.png")}
                        className="text-[9px] cursor-pointer bg-slate-900 border border-slate-800 hover:bg-slate-850 px-2 py-0.5 rounded text-zinc-300"
                      >
                        Fondo Diapositivas (Original)
                      </button>
                    </div>
                  </div>

                  {/* Typography Selector & Alignment */}
                  <div className="space-y-3.5 border-t border-slate-900 pt-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider block flex items-center gap-1">
                        <Type className="w-3.5 h-3.5" />
                        <span>Tipografía y Ajuste</span>
                      </label>
                    </div>

                    {/* Font Dropdown */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400">Familia de fuentes (Canva):</span>
                      <select
                        value={activeCustom.fontFamily || "Inter"}
                        onChange={(e) => updateCurrentCustomization("fontFamily", e.target.value)}
                        className="w-full bg-slate-900 text-xs text-zinc-200 border border-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Inter">Inter (Swiss Sans Sencillo)</option>
                        <option value="Space Grotesk">Space Grotesk (Brutalista Moderno)</option>
                        <option value="Outfit">Outfit (Geométrico Elegante)</option>
                        <option value="Playfair Display">Playfair Display (Serif Académico)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Consola Programador)</option>
                      </select>
                    </div>

                    {/* Alignment Row */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400 block">Alineación del bloque:</span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => updateCurrentCustomization("textAlignment", "left")}
                          className={`py-1.5 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            (activeCustom.textAlignment || "left") === "left"
                              ? "bg-indigo-600 border-indigo-400 text-white"
                              : "bg-slate-900 border-slate-850 text-zinc-400 hover:bg-slate-850"
                          }`}
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                          <span>Izquierda</span>
                        </button>
                        <button
                          onClick={() => updateCurrentCustomization("textAlignment", "center")}
                          className={`py-1.5 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            activeCustom.textAlignment === "center"
                              ? "bg-indigo-600 border-indigo-400 text-white"
                              : "bg-slate-900 border-slate-850 text-zinc-400 hover:bg-slate-850"
                          }`}
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                          <span>Centrado</span>
                        </button>
                        <button
                          onClick={() => updateCurrentCustomization("textAlignment", "right")}
                          className={`py-1.5 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            activeCustom.textAlignment === "right"
                              ? "bg-indigo-600 border-indigo-400 text-white"
                              : "bg-slate-900 border-slate-850 text-zinc-400 hover:bg-slate-850"
                          }`}
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                          <span>Derecha</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Letter sizes */}
                  <div className="space-y-3.5 border-t border-slate-900 pt-3">
                    <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider block">Tamaño del Texto</span>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-300">
                        <span>Título principal:</span>
                        <span className="font-mono text-indigo-400 font-bold">{activeCustom.titleSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="80"
                        value={activeCustom.titleSize}
                        onChange={(e) => updateCurrentCustomization("titleSize", parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-300">
                        <span>Subtítulo:</span>
                        <span className="font-mono text-indigo-400 font-bold">{activeCustom.subtitleSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        value={activeCustom.subtitleSize}
                        onChange={(e) => updateCurrentCustomization("subtitleSize", parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-300">
                        <span>Texto descriptivo:</span>
                        <span className="font-mono text-indigo-400 font-bold">{activeCustom.contentSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="35"
                        value={activeCustom.contentSize}
                        onChange={(e) => updateCurrentCustomization("contentSize", parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Drag notice & Manual Inputs */}
                  <div className="space-y-3.5 border-t border-slate-900 pt-3">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block tracking-wider flex items-center gap-1">
                      <Grid className="w-3.5 h-3.5" />
                      <span>Coordenadas exactas (Mover / Arrastrar)</span>
                    </span>
                    <p className="text-[9px] text-zinc-400 mt-0.5 leading-relaxed">
                      💡 <strong>¡Súper interactivo!</strong> Puedes arrastrar el texto o la ilustración directamente sobre la diapositiva en vivo con la mano, o afinar sus coordenadas aquí:
                    </p>

                    <div className="grid grid-cols-2 gap-3 pb-1">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block font-mono">X del Texto (px)</span>
                        <input
                          type="number"
                          value={activeCustom.textX}
                          onChange={(e) => updateCurrentCustomization("textX", parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-slate-900 border border-slate-850 text-xs text-zinc-200 rounded p-1.5 font-mono text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block font-mono">Y del Texto (px)</span>
                        <input
                          type="number"
                          value={activeCustom.textY}
                          onChange={(e) => updateCurrentCustomization("textY", parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-slate-900 border border-slate-850 text-xs text-zinc-200 rounded p-1.5 font-mono text-center"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block font-mono">X Tarjeta</span>
                        <input
                          type="number"
                          value={activeCustom.illustrationX}
                          onChange={(e) => updateCurrentCustomization("illustrationX", parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-slate-900 border border-slate-850 text-xs text-zinc-200 rounded p-1.5 font-mono text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block font-mono">Y Tarjeta</span>
                        <input
                          type="number"
                          value={activeCustom.illustrationY}
                          onChange={(e) => updateCurrentCustomization("illustrationY", parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-slate-900 border border-slate-850 text-xs text-zinc-200 rounded p-1.5 font-mono text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block font-mono">Tamaño Tarjeta</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0.2"
                          max="3"
                          value={activeCustom.illustrationScale}
                          onChange={(e) => updateCurrentCustomization("illustrationScale", parseFloat(e.target.value) || 1.0)}
                          className="w-full bg-slate-900 border border-slate-850 text-xs text-zinc-200 rounded p-1.5 font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Colors Inspector */}
                  <div className="space-y-3.5 border-t border-slate-900 pt-3">
                    <label className="text-[10px] uppercase font-mono font-bold text-amber-400 block tracking-wider flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Paleta y Colores (Canva)</span>
                    </label>

                    {/* Predefined design presets */}
                    <div className="space-y-1.5">
                      <span className="text-[9.5px] text-zinc-400 block font-mono uppercase">Temas Rápidos Académicos:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => applyColorPreset({
                            title: "#ffffff",
                            sub: "#fbbf24",
                            content: "#e4e4e7",
                            badgeBg: "#fef3c7",
                            badgeTxt: "#d97706",
                            cardBg: "rgba(2, 6, 23, 0.85)",
                            cardBorder: "rgba(99,102,241,0.25)"
                          })}
                          className="bg-slate-900 border border-slate-850 hover:bg-slate-850 text-[10px] text-left p-1.5 rounded text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block shrink-0" />
                          <span>Dorado Ámbar (Por defecto)</span>
                        </button>
                        <button
                          onClick={() => applyColorPreset({
                            title: "#38bdf8",
                            sub: "#e0f2fe",
                            content: "#f0f9ff",
                            badgeBg: "#e0f2fe",
                            badgeTxt: "#0369a1",
                            cardBg: "rgba(8, 47, 73, 0.9)",
                            cardBorder: "rgba(56,189,248,0.4)"
                          })}
                          className="bg-slate-900 border border-slate-850 hover:bg-slate-850 text-[10px] text-left p-1.5 rounded text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 block shrink-0" />
                          <span>Zafiro Tecnológico</span>
                        </button>
                        <button
                          onClick={() => applyColorPreset({
                            title: "#34d399",
                            sub: "#fbbf24",
                            content: "#f3f4f6",
                            badgeBg: "#d1fae5",
                            badgeTxt: "#047857",
                            cardBg: "rgba(6, 78, 59, 0.85)",
                            cardBorder: "rgba(52,211,153,0.3)"
                          })}
                          className="bg-slate-900 border border-slate-850 hover:bg-slate-850 text-[10px] text-left p-1.5 rounded text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block shrink-0" />
                          <span>Esmeralda UniGuajira</span>
                        </button>
                        <button
                          onClick={() => applyColorPreset({
                            title: "#f43f5e",
                            sub: "#fda4af",
                            content: "#fff1f2",
                            badgeBg: "#ffe4e6",
                            badgeTxt: "#be123c",
                            cardBg: "rgba(9, 9, 11, 0.95)",
                            cardBorder: "rgba(244,63,94,0.3)"
                          })}
                          className="bg-slate-900 border border-slate-850 hover:bg-slate-850 text-[10px] text-left p-1.5 rounded text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block shrink-0" />
                          <span>Cyber Minimal</span>
                        </button>
                      </div>
                    </div>

                    {/* Fine grained custom pickers */}
                    <div className="space-y-2 pt-1 border-t border-slate-900 mt-2">
                      <span className="text-[10px] text-zinc-400 block">Personalización de elementos:</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-zinc-500 block">Título h1:</label>
                          <input
                            type="color"
                            value={activeCustom.titleColor || "#ffffff"}
                            onChange={(e) => updateCurrentCustomization("titleColor", e.target.value)}
                            className="bg-transparent h-7 w-full cursor-pointer p-0 block"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 block">Subtítulo p:</label>
                          <input
                            type="color"
                            value={activeCustom.subtitleColor || "#fbbf24"}
                            onChange={(e) => updateCurrentCustomization("subtitleColor", e.target.value)}
                            className="bg-transparent h-7 w-full cursor-pointer p-0 block"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-zinc-500 block">Fondo Tarjeta:</label>
                          <input
                            type="text"
                            value={activeCustom.boxBg || "rgba(2, 6, 23, 0.85)"}
                            onChange={(e) => updateCurrentCustomization("boxBg", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 text-xs text-zinc-200 rounded p-1.5 font-mono text-center"
                            placeholder="rgba o hex"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 block">Borde Tarjeta:</label>
                          <input
                            type="text"
                            value={activeCustom.boxBorderColor || "rgba(99,102,241,0.25)"}
                            onChange={(e) => updateCurrentCustomization("boxBorderColor", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 text-xs text-zinc-200 rounded p-1.5 font-mono text-center"
                            placeholder="rgba o hex"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-zinc-500 block">Fondo Etiqueta:</label>
                          <input
                            type="text"
                            value={activeCustom.badgeBg || "#e0e7ff"}
                            onChange={(e) => updateCurrentCustomization("badgeBg", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 text-xs text-zinc-200 rounded p-1.5 font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 block">Texto Etiqueta:</label>
                          <input
                            type="text"
                            value={activeCustom.badgeColor || "#4338ca"}
                            onChange={(e) => updateCurrentCustomization("badgeColor", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 text-xs text-zinc-200 rounded p-1.5 font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visibility Toggles / Remove elements */}
                  <div className="space-y-3.5 border-t border-slate-900 pt-3">
                    <label className="text-[10px] uppercase font-mono font-bold text-red-400 block tracking-wider flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Opciones de Visibilidad / Eliminar Elementos</span>
                    </label>
                    <p className="text-[9.5px] text-zinc-400 leading-normal">
                      Oculta o elimina elementos visuales para personalizar al máximo el diseño de esta diapositiva:
                    </p>

                    <div className="space-y-2 pt-1">
                      {current === 1 ? (
                        <>
                          {/* Slide 1 Toggles */}
                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-350">Patrón Wayúu Lateral</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideBackgroundWayuu", !activeCustom.hideBackgroundWayuu)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideBackgroundWayuu ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideBackgroundWayuu ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-350">Etiqueta Superior Izquierda</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideLeftBadge", !activeCustom.hideLeftBadge)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideLeftBadge ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideLeftBadge ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-350">Integrantes G7</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideIntegrantes", !activeCustom.hideIntegrantes)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideIntegrantes ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideIntegrantes ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-350">Pie de Página / Logos UniGuajira</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideLeftFooter", !activeCustom.hideLeftFooter)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideLeftFooter ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideLeftFooter ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-350">Escudo UniGuajira Circular</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideUGuajiraCrest", !activeCustom.hideUGuajiraCrest)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideUGuajiraCrest ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideUGuajiraCrest ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-350">Sello Acreditación Institucional</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideAccreditationSeal", !activeCustom.hideAccreditationSeal)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideAccreditationSeal ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideAccreditationSeal ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-350">Fachada del Edificio</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideBuildingMockupBackground", !activeCustom.hideBuildingMockupBackground)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideBuildingMockupBackground ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideBuildingMockupBackground ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-350">Sellos de Calidad (ICONTEC/IQNet)</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideBottomQualitySeals", !activeCustom.hideBottomQualitySeals)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideBottomQualitySeals ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideBottomQualitySeals ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Standard Slide Toggles */}
                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-350">Etiqueta Superior Izquierda</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideLeftBadge", !activeCustom.hideLeftBadge)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideLeftBadge ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideLeftBadge ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-355">Detalle de Ponente y Rol</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideSpeakerRole", !activeCustom.hideSpeakerRole)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideSpeakerRole ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideSpeakerRole ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded border border-slate-850">
                            <span className="text-[11px] text-zinc-355">Bloque de Ilustración Derecho</span>
                            <button
                              onClick={() => updateCurrentCustomization("hideIllustrationBox", !activeCustom.hideIllustrationBox)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono font-bold cursor-pointer ${
                                activeCustom.hideIllustrationBox ? "bg-rose-900/50 text-rose-400 border border-rose-500/30 font-extrabold" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-extrabold"
                              }`}
                            >
                              {activeCustom.hideIllustrationBox ? "Oculto 🚫" : "Visible  ✅"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Import / Export JSON */}
                  <div className="space-y-3.5 border-t border-slate-900 pt-3">
                    <span className="text-[10px] uppercase font-mono font-bold text-purple-400 tracking-wider block">Exportar Coordenadas (Código)</span>
                    <p className="text-[9.5px] text-zinc-400 leading-normal">
                      Ajusta todo a tu medida. Al terminar las siete diapositivas presiona abajo, copia el texto resultante de las coordenadas y <strong>pásamelo en el chat</strong> para guardarlo en el código definitivamente.
                    </p>

                    <button
                      onClick={copyToClipboard}
                      className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        copiedNotification 
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                          : "bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/20 text-indigo-300"
                      }`}
                    >
                      {copiedNotification ? (
                        <span>¡Configuración Copiada! 📋</span>
                      ) : (
                        <span>Copiar Coordenadas JSON 📝</span>
                      )}
                    </button>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] font-mono text-zinc-500 block font-bold">Cargar ajustes desde afuera (Importar):</span>
                      <textarea
                        value={pasteValue}
                        onChange={(e) => setPasteValue(e.target.value)}
                        placeholder="Pega el JSON aquí..."
                        className="w-full h-12 bg-slate-900 text-[10px] text-zinc-400 border border-slate-850 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                      {pasteError && (
                        <p className="text-[8.5px] text-rose-400 leading-tight">{pasteError}</p>
                      )}
                      {pasteSuccess && (
                        <p className="text-[8.5px] text-emerald-400 leading-tight font-bold">¡Cargado con éxito! 🎉</p>
                      )}
                      <button
                        onClick={handleImportJSON}
                        disabled={!pasteValue.trim()}
                        className="w-full py-1 bg-slate-900 hover:bg-slate-850 text-[10px] text-zinc-300 border border-slate-800 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                      >
                        Aplicar Cambios Pegados
                      </button>
                    </div>

                    <button
                      onClick={resetAllCustomizations}
                      className="w-full py-1 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/15 text-rose-300 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer"
                    >
                      Restablecer Fábrica 🔄
                    </button>
                  </div>

                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* Helpful group notice below slider */}
      <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex items-start gap-3.5 mb-2 text-justify">
        <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500 shrink-0">
          <HelpCircle className="w-4 h-4 animate-bounce" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-100 uppercase font-mono tracking-wider block">
            💡 Consejo del Expositor:
          </span>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Presiona el botón de <strong>Presentar en Pantalla Completa</strong> para simular el modo Canva exacto. Verás cómo las imágenes escalan, los textos se desplazan, y podrás controlar tu ponencia con gestos interactivos frente a todo el auditorio.
          </p>
        </div>
      </div>
    </div>
  );
}
