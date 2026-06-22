import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Download, 
  BookOpen, 
  Users, 
  Sparkles, 
  CheckCircle, 
  HelpCircle, 
  FileText,
  MessageSquare,
  Volume2,
  Minimize2,
  Info
} from "lucide-react";
import { jsPDF } from "jspdf";

export interface ScriptPart {
  id: string;
  speaker: string;
  role: string;
  title: string;
  time: string;
  avatar: string;
  color: string;
  borderCol: string;
  bgCol: string;
  dialogue: string;
  analogyTitle?: string;
  analogyDesc?: string;
  emulatorLink?: string;
  slideNumber?: number;
  slideTitle?: string;
}

// Simplified and natural content guidelines:
// "palabras más suaves, más masticadas para estudiantes que no son de ingeniería y que no saben ecuaciones diferenciales"
export const scriptParts: ScriptPart[] = [
  {
    id: "danilo_1",
    speaker: "Danilo Miranda (P1)",
    role: "Moderador - Apertura y Contexto",
    title: "Apertura: La tormenta en el servidor",
    time: "0:00 - 1:15 (75s)",
    avatar: "DM",
    color: "text-emerald-400 bg-emerald-500/10",
    borderCol: "border-emerald-500/30",
    bgCol: "bg-emerald-950/20",
    dialogue: "Muy buenos días a todos los presentes, profesores, compañeros y jurados. Quiero que por un momento imaginen la siguiente situación: son las primeras horas del proceso de matrículas de la universidad y miles de estudiantes intentan ingresar al sistema al mismo tiempo. Algunos logran entrar, otros reciben errores y poco a poco la plataforma empieza a ponerse lenta. Ante una situación como esta surge una pregunta interesante: ¿cómo podemos saber con anticipación si un sistema será capaz de soportar esa carga o si terminará presentando fallas? Precisamente alrededor de preguntas como esta gira nuestro foro académico de hoy. Más que hablar de fórmulas difíciles, queremos conversar sobre una herramienta que permite analizar comportamientos complejos y entenderlos de una manera mucho más sencilla.",
    analogyTitle: "💡 Reto inicial:",
    analogyDesc: "¿Cómo predecir si un sistema saturado aguantará o se caerá antes de ponerlo a prueba en el mundo real?",
    slideNumber: 2,
    slideTitle: "Diapositiva 2 - Paso 1: El Problema Real"
  },
  {
    id: "gallardo_1",
      speaker: "Gallardo (P4)",
      role: "Panelista Cuestionador Técnico",
      title: "El desafío dinámico",
      time: "1:15 - 1:45 (30s)",
      avatar: "G",
      color: "text-blue-400 bg-blue-500/10",
      borderCol: "border-blue-500/30",
      bgCol: "bg-blue-950/20",
      dialogue: "Esa situación no solo ocurre en las matrículas. También pasa en redes sociales, plataformas de streaming, videojuegos en línea y muchos otros servicios que utilizan miles de personas al mismo tiempo. Lo que me genera curiosidad es que estos sistemas están cambiando constantemente. Entonces, ¿cómo hacen los ingenieros para analizar algo tan complejo sin tener que revisar cada detalle por separado?",
      analogyTitle: "⚡ Sistemas cambiantes:",
      analogyDesc: "Analizar millones de clics individuales en movimiento sin simplificar es humanamente imposible.",
      slideNumber: 2,
      slideTitle: "Diapositiva 2 - Paso 1: El Problema Real"
    },
    {
      id: "joshep_1",
      speaker: "Joshep Romero (P2)",
      role: "Panelista Explicador Didáctico",
      title: "Laplace como simplificador",
      time: "1:45 - 2:15 (30s)",
      avatar: "JR",
      color: "text-amber-400 bg-amber-500/10",
      borderCol: "border-amber-500/30",
      bgCol: "bg-amber-950/20",
      dialogue: "Esa es una excelente pregunta. Precisamente ahí aparece la Transformada de Laplace. Aunque su nombre pueda sonar complicado, la idea principal es bastante sencilla. Esta herramienta nos ayuda a observar un problema desde una perspectiva más fácil de analizar. Es como cuando tenemos un texto muy largo y hacemos un resumen para entender las ideas más importantes. La información sigue siendo la misma, pero ahora resulta más fácil comprenderla.",
      analogyTitle: "📖 El poder del resumen:",
      analogyDesc: "Como resumir un libro entero destacando solo las ideas más importantes para entender la historia.",
      slideNumber: 3,
      slideTitle: "Diapositiva 3 - Paso 2: El Traductor de Energía"
    },
    {
      id: "temistocles_1",
      speaker: "Temístocles Atencio (P3)",
      role: "Panelista Guía Experimental",
      title: "Estabilidad y organización de datos",
      time: "2:15 - 2:45 (30s)",
      avatar: "TA",
      color: "text-indigo-400 bg-indigo-500/10",
      borderCol: "border-indigo-500/30",
      bgCol: "bg-indigo-950/20",
      dialogue: "Entonces podríamos decir que la Transformada de Laplace no elimina el problema ni cambia lo que está ocurriendo. Lo que hace es ayudarnos a organizar la información para entender mejor el comportamiento de un sistema. De esa manera podemos identificar más fácilmente qué está pasando y tomar mejores decisiones.",
      analogyTitle: "📊 Visión organizadora:",
      analogyDesc: "Laplace no cambia la física, pero agrupa los datos revueltos y los alinea de forma amigable.",
      slideNumber: 4,
      slideTitle: "Diapositiva 4 - Paso 3: Estabilidad y Organización"
    },
    {
      id: "danilo_2",
      speaker: "Danilo Miranda (P1)",
      role: "Moderador",
      title: "La perspectiva general",
      time: "2:45 - 3:00 (15s)",
      avatar: "DM",
      color: "text-emerald-400 bg-emerald-500/10",
      borderCol: "border-emerald-500/30",
      bgCol: "bg-emerald-950/20",
      dialogue: "O sea que, en lugar de concentrarnos en todos los cambios que ocurren segundo a segundo, podemos obtener una visión más clara de lo que está sucediendo en general.",
      analogyTitle: "🎯 El bosque sobre los árboles:",
      analogyDesc: "Ver el bosque general en vez de intentar contar cada hoja o rama individual que se mece con el viento.",
      slideNumber: 4,
      slideTitle: "Diapositiva 4 - Paso 3: Estabilidad y Organización"
    },
    {
      id: "joshep_2",
      speaker: "Joshep Romero (P2)",
      role: "Panelista Explicador Didáctico",
      title: "Aplicabilidad práctica",
      time: "3:00 - 3:20 (20s)",
      avatar: "JR",
      color: "text-amber-400 bg-amber-500/10",
      borderCol: "border-amber-500/35",
      bgCol: "bg-amber-950/25",
      dialogue: "Exactamente. Y gracias a eso podemos analizar sistemas complejos de una forma mucho más práctica. Por ejemplo, podemos estudiar cómo responde una red, un servidor o una plataforma digital cuando recibe una gran cantidad de usuarios al mismo tiempo.",
      analogyTitle: "💻 Respuesta ante clics:",
      analogyDesc: "Medir si la plataforma guajira resistirá a los estudiantes en momentos de alta demanda.",
      slideNumber: 4,
      slideTitle: "Diapositiva 4 - Paso 3: Estabilidad y Organización"
    },
    {
      id: "gallardo_2",
      speaker: "Gallardo (P4)",
      role: "Panelista Cuestionador Técnico",
      title: "Puente a la demostración",
      time: "3:20 - 3:40 (20s)",
      avatar: "G",
      color: "text-blue-400 bg-blue-500/10",
      borderCol: "border-blue-500/30",
      bgCol: "bg-blue-950/20",
      dialogue: "Ahora entiendo mejor la idea. Pero me surge otra pregunta. Si la Transformada de Laplace nos ayuda a analizar el comportamiento de un sistema, ¿cómo podemos observar eso de manera práctica?",
      analogyTitle: "🛠️ De la teoría a los ojos:",
      analogyDesc: "Queremos ver en una pantalla real cómo se comporta un sistema físico ante nuestro análisis.",
      slideNumber: 5,
      slideTitle: "Diapositiva 5 - Paso 4: Simulador en Acción"
    },
    {
      id: "temistocles_2",
      speaker: "Temístocles Atencio (P3)",
      role: "Panelista Guía Experimental",
      title: "Invitación al Simulador Interactivo",
      time: "3:40 - 4:20 (40s)",
      avatar: "TA",
      color: "text-indigo-400 bg-indigo-500/10",
      borderCol: "border-indigo-500/30",
      bgCol: "bg-indigo-950/20",
      dialogue: "Muy buena pregunta. Para responderla vamos a utilizar el simulador que tenemos en pantalla. La idea no es enfocarnos en las fórmulas, sino observar cómo cambia el comportamiento del sistema cuando modificamos ciertos valores. A medida que hagamos algunos cambios, veremos cómo responde la gráfica y qué nos indica sobre el funcionamiento del sistema.",
      analogyTitle: "🎮 Aprender jugando:",
      analogyDesc: "El simulador táctil nos muestra al instante cómo reacciona el sistema ante las decisiones de control.",
      slideNumber: 5,
      slideTitle: "Diapositiva 5 - Paso 4: Simulador en Acción"
    },
    {
      id: "danilo_4",
      speaker: "Danilo Miranda (P1)",
      role: "Moderador / Simulador",
      title: "Prueba 1: Inestabilidad (Crecimiento Salvaje)",
      time: "4:20 - 4:40 (20s)",
      avatar: "DM",
      color: "text-emerald-400 bg-emerald-500/10",
      borderCol: "border-emerald-500/30",
      bgCol: "bg-emerald-950/20",
      dialogue: "Perfecto. Entonces vamos a realizar una primera prueba para observar qué sucede. (Realiza el cambio en el simulador.) Miren la gráfica. Podemos notar que empieza a crecer cada vez más.",
      analogyTitle: "🚨 Señal de alarma:",
      analogyDesc: "La línea se dispara hacia arriba sin control. Esto representa el colapso del sistema.",
      slideNumber: 5,
      slideTitle: "Diapositiva 5 - Paso 4: Simulador en Acción"
    },
    {
      id: "gallardo_3",
      speaker: "Gallardo (P4)",
      role: "Panelista Cuestionador Técnico",
      title: "Observación de la fiebre",
      time: "4:40 - 5:00 (20s)",
      avatar: "G",
      color: "text-blue-400 bg-blue-500/10",
      borderCol: "border-blue-500/30",
      bgCol: "bg-blue-950/20",
      dialogue: "Sí, se puede observar claramente. Mientras más avanza el tiempo, más aumenta la gráfica. Eso parece indicar que algo no está funcionando de la mejor manera.",
      analogyTitle: "📈 Crecimiento sin fin:",
      analogyDesc: "Un aumento desmedido que en el servidor real representaría calor destructor o sobrecarga inmediata.",
      slideNumber: 5,
      slideTitle: "Diapositiva 5 - Paso 4: Simulador en Acción"
    },
    {
      id: "temistocles_3",
      speaker: "Temístocles Atencio (P3)",
      role: "Panelista Guía Experimental",
      title: "La inestabilidad interpretada",
      time: "5:00 - 5:30 (30s)",
      avatar: "TA",
      color: "text-indigo-400 bg-indigo-500/10",
      borderCol: "border-indigo-500/30",
      bgCol: "bg-indigo-950/20",
      dialogue: "Correcto. Cuando observamos un comportamiento como este, podemos interpretar que el sistema está reaccionando de forma poco estable. En una situación real esto podría traducirse en errores, lentitud o dificultades para responder adecuadamente a los usuarios.",
      analogyTitle: "⚠️ Colapso inestable:",
      analogyDesc: "Sin control, la máquina se satura, se reinicia y deja a los usuarios incomunicados.",
      slideNumber: 5,
      slideTitle: "Diapositiva 5 - Paso 4: Simulador en Acción"
    },
    {
      id: "danilo_5",
      speaker: "Danilo Miranda (P1)",
      role: "Moderador / Simulador",
      title: "Prueba 2: El Equilibrio (Estabilización)",
      time: "5:30 - 5:50 (20s)",
      avatar: "DM",
      color: "text-emerald-400 bg-emerald-500/10",
      borderCol: "border-emerald-500/30",
      bgCol: "bg-emerald-950/20",
      dialogue: "Ahora hagamos el proceso contrario para comparar los resultados. (Modifica nuevamente el simulador.)",
      analogyTitle: "🌿 Aplicando el filtro:",
      analogyDesc: "Activamos el amortiguador o filtro de Laplace para jalar las fuerzas del sistema hacia el reposo seguro.",
      slideNumber: 5,
      slideTitle: "Diapositiva 5 - Paso 4: Simulador en Acción"
    },
    {
      id: "gallardo_4",
      speaker: "Gallardo (P4)",
      role: "Panelista Cuestionador Técnico",
      title: "Observación del equilibrio",
      time: "5:50 - 6:10 (20s)",
      avatar: "G",
      color: "text-blue-400 bg-blue-500/10",
      borderCol: "border-blue-500/30",
      bgCol: "bg-blue-950/20",
      dialogue: "Interesante. Now la gráfica ya no sigue creciendo. Poco a poco comienza a estabilizarse. La diferencia es bastante evidente.",
      analogyTitle: "📉 Curva suavizada:",
      analogyDesc: "La línea deja de subir y se dibuja plana, lo que confirma que el calor o la carga está bajo control.",
      slideNumber: 5,
      slideTitle: "Diapositiva 5 - Paso 4: Simulador en Acción"
    },
    {
      id: "temistocles_4",
      speaker: "Temístocles Atencio (P3)",
      role: "Panelista Guía Experimental",
      title: "La utilidad de la sintonización",
      time: "6:10 - 6:50 (40s)",
      avatar: "TA",
      color: "text-indigo-400 bg-indigo-500/10",
      borderCol: "border-indigo-500/30",
      bgCol: "bg-indigo-950/20",
      dialogue: "Exactamente. Y ahí es donde podemos apreciar la utilidad de esta herramienta. Gracias a este análisis podemos identificar cuándo un sistema tiene un comportamiento adecuado y cuándo podría presentar dificultades. Esto permite que los ingenieros tomen decisiones antes de que aparezcan problemas reales.",
      analogyTitle: "🛡️ Ingeniería previsiva:",
      analogyDesc: "Prevenir una colisión o falla de sistema antes de que los usuarios sufran el impacto.",
      slideNumber: 5,
      slideTitle: "Diapositiva 5 - Paso 4: Simulador en Acción"
    },
    {
      id: "joshep_3",
      speaker: "Joshep Romero (P2)",
      role: "Panelista Explicador Didáctico",
      title: "Aplicaciones multidisciplinarias",
      time: "6:50 - 7:35 (45s)",
      avatar: "JR",
      color: "text-amber-400 bg-amber-500/10",
      borderCol: "border-amber-500/30",
      bgCol: "bg-amber-950/20",
      dialogue: "Y es importante aclarar que la Transformada de Laplace no se utiliza únicamente en matemáticas. También tiene aplicaciones en telecomunicaciones, electrónica, automatización, procesamiento de señales e incluso en muchos campos relacionados con la informática y la tecnología.",
      analogyTitle: "🔋 Campos diversos:",
      analogyDesc: "Utilizado para regular sensores de aire acondicionado, pilotos automáticos de líneas aéreas y estabilizadores mecánicos.",
      slideNumber: 6,
      slideTitle: "Diapositiva 6 - Paso 5: Aplicaciones Prácticas"
    },
    {
      id: "gallardo_5",
      speaker: "Gallardo (P4)",
      role: "Panelista Cuestionador Técnico",
      title: "Comprensión unificada",
      time: "7:35 - 7:55 (20s)",
      avatar: "G",
      color: "text-blue-400 bg-blue-500/10",
      borderCol: "border-blue-500/30",
      bgCol: "bg-blue-950/20",
      dialogue: "Entonces podríamos decir que su importancia está en ayudarnos a comprender mejor cómo se comportan distintos sistemas.",
      analogyTitle: "📍 Síntesis del panel:",
      analogyDesc: "Un lenguaje común para saber si cualquier máquina (térmica o mecánica) se mantendrá estable.",
      slideNumber: 6,
      slideTitle: "Diapositiva 6 - Paso 5: Aplicaciones Prácticas"
    },
    {
      id: "joshep_4",
      speaker: "Joshep Romero (P2)",
      role: "Panelista Explicador Didáctico",
      title: "El diseño de mejores soluciones",
      time: "7:55 - 8:20 (25s)",
      avatar: "JR",
      color: "text-amber-400 bg-amber-500/10",
      borderCol: "border-amber-500/30",
      bgCol: "bg-amber-950/20",
      dialogue: "Exactamente. Y mientras mejor entendamos el comportamiento de un sistema, mejores soluciones podremos diseñar para hacerlo funcionar correctamente.",
      analogyTitle: "🚀 Soluciones de calidad:",
      analogyDesc: "Software e implementaciones de alto nivel para diseñar un mundo real más seguro.",
      slideNumber: 6,
      slideTitle: "Diapositiva 6 - Paso 5: Aplicaciones Prácticas"
    },
    {
      id: "temistocles_5",
      speaker: "Temístocles Atencio (P3)",
      role: "Panelista Guía Experimental",
      title: "Por qué sigue vigente Laplace",
      time: "8:20 - 8:50 (30s)",
      avatar: "TA",
      color: "text-indigo-400 bg-indigo-500/10",
      borderCol: "border-indigo-500/30",
      bgCol: "bg-indigo-950/20",
      dialogue: "Por eso esta herramienta sigue siendo tan utilizada actualmente. No porque haga desaparecer los problemas, sino porque nos ayuda a analizarlos de una manera más clara y organizada. Y cuando entendemos mejor un problema, también encontramos soluciones más efectivas.",
      analogyTitle: "⏳ Vigente en la historia:",
      analogyDesc: "Un recurso matemático legendario que hoy regula desde cargadores de baterías hasta cohetes.",
      slideNumber: 6,
      slideTitle: "Diapositiva 6 - Paso 5: Aplicaciones Prácticas"
    },
    {
      id: "danilo_5_public",
      speaker: "Danilo Miranda (P1)",
      role: "Moderador - Participación",
      title: "Participación del público",
      time: "8:50 - 9:20 (30s)",
      avatar: "DM",
      color: "text-emerald-400 bg-emerald-500/10",
      borderCol: "border-emerald-500/30",
      bgCol: "bg-emerald-950/20",
      dialogue: "Antes de finalizar, nos gustaría escuchar a los presentes. ¿Alguno de ustedes quisiera que probáramos otra configuración en el simulador o tiene alguna pregunta relacionada con lo que acabamos de observar?",
      analogyTitle: "🤝 Foro participativo:",
      analogyDesc: "Invitamos públicamente a que los estudiantes que asisten opinen o sigan jugando con el simulador.",
      slideNumber: 7,
      slideTitle: "Diapositiva 7 - Cierre del Panel"
    },
    {
      id: "temistocles_final",
      speaker: "Temístocles Atencio (P3)",
      role: "Panelista Guía - Conclusión",
      title: "Conclusión del Foro",
      time: "9:20 - 9:45 (25s)",
      avatar: "TA",
      color: "text-indigo-400 bg-indigo-500/10",
      borderCol: "border-indigo-500/30",
      bgCol: "bg-indigo-950/20",
      dialogue: "Como conclusión, podemos decir que la Transformada de Laplace es una herramienta que ayuda a simplificar el análisis de situaciones complejas. Gracias a ella podemos estudiar el comportamiento de diferentes sistemas, comprender mejor su funcionamiento y anticiparnos a posibles problemas. Más allá de las fórmulas, su verdadero valor está en ayudarnos a entender mejor cómo funcionan las cosas.",
      analogyTitle: "🎓 El gran aprendizaje:",
      analogyDesc: "Simplificar lo complejo para entender la física práctica de nuestra realidad.",
      slideNumber: 7,
      slideTitle: "Diapositiva 7 - Cierre del Panel"
    },
    {
      id: "danilo_final",
      speaker: "Danilo Miranda (P1)",
      role: "Moderador - Cierre",
      title: "Cierre de Actividad",
      time: "9:45 - 10:00 (15s)",
      avatar: "DM",
      color: "text-emerald-400 bg-emerald-500/10",
      borderCol: "border-emerald-500/30",
      bgCol: "bg-emerald-950/20",
      dialogue: "De esta manera damos por finalizado nuestro foro académico. Agradecemos a los profesores, jurados, compañeros y asistentes por acompañarnos durante esta actividad. Muchas gracias por su atención.",
      analogyTitle: "👏 ¡Muchas Gracias!:",
      analogyDesc: "Conclusión formal del foro interactivo de ingeniería de sistemas de UniGuajira.",
      slideNumber: 7,
      slideTitle: "Diapositiva 7 - Cierre del Panel"
    }
  ];

export default function GuionForo() {
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Colors
      const primaryColor = [15, 23, 42]; // Slate 900
      const accentColor = [79, 70, 229]; // Indigo 600
      const textColor = [51, 65, 85]; // Slate 700
      const lightGray = [248, 250, 252]; // Slate 50

      // Margins
      const marginX = 18;
      const marginY = 16;
      let cursorY = marginY;

      // Helper function to print headers
      const printHeaderFooter = (pageNumber: number) => {
        // Document Top Header bar
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 18, "F");
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.text("FORO ACADÉMICO: TRANSFORMADA DE LAPLACE SIMPLIFICADA", marginX, 8);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text("UNIVERSIDAD DE LA GUAJIRA - RIOHACHA | DISCUSIÓN MULTIDISCIPLINARIA", marginX, 13);
        
        // Brand tag
        doc.setFillColor(31, 41, 55); // Emerald-ish / slate
        doc.rect(162, 5, 30, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text("UNIGUAJIRA", 168, 10.5);

        // Footer
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.line(marginX, 282, 192, 282);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7);
        doc.text("Guión de Foro Académico Participativo de 10 minutos - Sistemas de Control", marginX, 287);
        doc.text(`Página ${pageNumber}`, 185, 287);
      };

      // Draw Cover details and title on Page 1
      printHeaderFooter(1);
      cursorY = 28;

      // Title Section
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(15);
      doc.text("GUIÓN DE FORO ACADÉMICO PARTICIPATIVO", marginX, cursorY);
      cursorY += 6;

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      
      const introText = "El siguiente guión estructurado detalla la discusión interactiva para el Foro Académico sobre la Transformada de Laplace, diseñado para audiencias multidisciplinarias. Se evitan formulaciones matemáticas intimidantes, explicando a Laplace como un resumen amigable que ayuda a analizar comportamientos complejos y entenderlos de una manera práctica y visual, complementado con simulaciones interactivas en vivo.";
      const introLines = doc.splitTextToSize(introText, 210 - marginX * 2);
      doc.text(introLines, marginX, cursorY);
      cursorY += (introLines.length * 4.5) + 4;

      // Roles Section
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setDrawColor(226, 232, 240);
      doc.rect(marginX, cursorY, 210 - marginX * 2, 28, "FD");
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text("INTEGRANTES DEL PANEL Y ROLES EN EL FORO:", marginX + 4, cursorY + 6);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text("• DANILO JOSÉ MIRANDA EPIAYU (P1): Moderador, realiza la apertura del evento y coordina la participación.", marginX + 6, cursorY + 11);
      doc.text("• RODERICK GALLARDO GRATEROL (P4): Indagador, plantea preguntas clave sobre el comportamiento de sistemas cambiantes.", marginX + 6, cursorY + 15);
      doc.text("• JOSHEP DAVID ROMERO PEREZ (P2): Explicador teórico, expone la analogía del resumen para entender Laplace.", marginX + 6, cursorY + 19);
      doc.text("• TEMISTOCLE EISYANIOR ATENCIO IPUANA (P3): Explicador dinámico y guía, demuestra el funcionamiento en el simulador.", marginX + 6, cursorY + 23);
      cursorY += 34;

      // Dialogues Header
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("DESARROLLO DE LA SECUENCIA DE DIÁLOGOS (10 MINUTOS):", marginX, cursorY);
      cursorY += 6;

      // Helper function to clean text for safe PDF generation (removing emojis & surrogates)
      const cleanTextForPDF = (text: string): string => {
        if (!text) return "";
        return text
          .replace(/💡/g, "")
          .replace(/🔬/g, "")
          .replace(/🍎/g, "")
          .replace(/🤝/g, "")
          .replace(/⏱/g, "")
          .replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/g, "")
          .replace(/[\u2600-\u27BF]/g, "")
          .replace(/[\uD800-\uDBFF]/g, "")
          .replace(/[\uDC00-\uDFFF]/g, "")
          .trim();
      };

      let pageNum = 1;

      scriptParts.forEach((part) => {
        // Clean texts for PDF rendering to strip emojis & unsupported unicode chars
        const cleanedSpeaker = cleanTextForPDF(part.speaker);
        const cleanedRole = cleanTextForPDF(part.role);
        const cleanedDialogue = cleanTextForPDF(part.dialogue);
        const cleanedAnalogyTitle = cleanTextForPDF(part.analogyTitle || "");
        const cleanedAnalogyDesc = cleanTextForPDF(part.analogyDesc || "");

        const slideInfoSuffix = part.slideNumber ? ` [Diapositiva ${part.slideNumber}]` : "";
        const nameHeader = `${cleanedSpeaker} - ${cleanedRole} [Tiempo: ${part.time}]${slideInfoSuffix}`;
        
        // Explicitly set the font family and size before calculating dialogue wrapping to ensure precise split boundaries
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        const dialogueLines = doc.splitTextToSize(cleanedDialogue, 210 - marginX * 2 - 8);
        
        // Similarly, set the font family and size before calculating analogy wrap limits
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        const explanationLines = cleanedAnalogyDesc ? doc.splitTextToSize(cleanedAnalogyDesc, 210 - marginX * 2 - 12) : [];
        
        // Let's compute box height for the analogy box (8mm base + 3.5mm per line of description text)
        const analogyBoxHeight = cleanedAnalogyDesc ? 8 + (explanationLines.length * 3.5) : 0;
        
        // Recalculate blockHeight precisely to avoid any overflow gaps:
        // top-padding (6) + header text (9) + dialogue block + analogy block spacing + card end cushioning
        const blockHeight = 6 + (dialogueLines.length * 4) + (cleanedAnalogyDesc ? analogyBoxHeight + 14 : 12) + 6;

        if (cursorY + blockHeight > 255) {
          doc.addPage();
          pageNum++;
          printHeaderFooter(pageNum);
          cursorY = 28;
        }

        // Draw speaker tag
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setDrawColor(226, 232, 240);
        doc.rect(marginX, cursorY, 210 - marginX * 2, blockHeight - 6, "FD");

        // Small indicator pill
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(marginX, cursorY, 2, blockHeight - 6, "F");

        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(nameHeader, marginX + 4, cursorY + 5);
        cursorY += 9;

        // Dialogue text
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(dialogueLines, marginX + 4, cursorY);
        cursorY += (dialogueLines.length * 4) + 2;

        // Simplified analogy sub-box
        if (cleanedAnalogyDesc) {
          doc.setFillColor(254, 243, 199); // Soft amber background
          doc.rect(marginX + 4, cursorY, 210 - marginX * 2 - 8, analogyBoxHeight, "F");
          
          doc.setTextColor(146, 64, 14); // Dark amber color for bold title
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(7.5);
          doc.text(cleanedAnalogyTitle || "ANALOGÍA:", marginX + 6, cursorY + 4.5);
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(7.5);
          doc.text(explanationLines, marginX + 6, cursorY + 8.5);
          cursorY += analogyBoxHeight + 10;
        } else {
          cursorY += 8;
        }
      });

      // Save PDF output
      doc.save("Guion_Simplificado_Foro_Laplace_UniGuajira.pdf");
    } catch (e) {
      console.error("PDF generation crash error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredParts = scriptParts.filter(
    (p) =>
      p.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dialogue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-slate-100 max-w-5xl mx-auto p-1">
      {/* Upper header action banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-t from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-400 shrink-0">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold tracking-tight">Guión Académico Simple y Masticado</h2>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9.5px] font-mono leading-none">
                Revisión 100% Accesible
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-400 max-w-2xl leading-relaxed font-sans">
              Hemos reajustado el guión de la defensa interactiva de 10 minutos reduciendo el lenguaje abstracto. Traducimos Laplace como un <strong>"compilador o traductor inteligente"</strong> que convierte derivadas complejas en sumas y restas sencillas de escuela secundaria. ¡Perfecto para captar la atención de estudiantes de cualquier carrera!
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="relative px-5 py-3 cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border border-indigo-500/40 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 shrink-0"
          id="btn-download-pdf-guion"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              <span>Generando PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 shrink-0" />
              <span>Descargar PDF del Guión</span>
            </>
          )}
        </button>
      </div>

      {/* SEARCH AND ROLES INFO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Left column Search */}
        <div className="md:col-span-1 bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
            🔍 Filtrar Diálogos
          </span>
          <input
            type="text"
            placeholder="Buscar ponente o palabras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-slate-100 transition-all placeholder:text-slate-600"
          />

          <div className="border-t border-slate-900 pt-3 flex flex-col gap-1.5 text-[10px] text-slate-500">
            <span className="font-bold uppercase tracking-wide block">Regla didáctica:</span>
            <div className="bg-slate-900/60 p-2 rounded text-zinc-400 space-y-1">
              <span className="text-zinc-300 font-bold block">★ El gran mensaje:</span>
              <p className="leading-normal">
                No asustes con integrales continuas. Explica que la transformada de Laplace transforma cálculos pesados y móviles en sumas fáciles.
              </p>
            </div>
          </div>
        </div>

        {/* Right timeline and Dialogues */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              💬 Secuencia de Ponencia ({filteredParts.length} Intervenciones)
            </span>
            <span className="text-[10px] font-mono text-indigo-400">
              Usa los bloques resaltados para guiar tu práctica
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {filteredParts.map((part) => {
              const isSelected = activeSpeaker === part.id;
              return (
                <div
                  key={part.id}
                  onClick={() => setActiveSpeaker(isSelected ? null : part.id)}
                  className={`border rounded-xl transition-all cursor-pointer relative overflow-hidden group ${part.borderCol} ${
                    isSelected ? part.bgCol + " ring-1 ring-indigo-500/30 shadow-md" : "bg-slate-950/70 hover:bg-slate-950"
                  }`}
                >
                  <div className="p-4 flex gap-3.5 items-start">
                    {/* Speaker Avatar Icon */}
                    <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs tracking-tight shrink-0 shadow-md ${part.color}`}>
                      {part.avatar}
                    </div>

                    <div className="space-y-2 flex-grow">
                      {/* Name Header and Time */}
                      <div className="flex flex-wrap justify-between items-start gap-1">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-100 leading-tight">
                              {part.speaker}
                            </h4>
                            {part.slideNumber && (
                              <span className="bg-indigo-500/10 text-indigo-300 font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded border border-indigo-500/15">
                                📺 Diapositiva {part.slideNumber}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {part.role}
                          </span>
                          {part.slideTitle && (
                            <span className="text-[10px] text-zinc-400 bg-slate-900/50 px-1.5 py-0.5 rounded inline-block mt-1 font-sans border border-slate-850">
                              📌 {part.slideTitle}
                            </span>
                          )}
                        </div>
                        <span className="bg-slate-900 text-slate-400 font-mono text-[9px] font-semibold px-2 py-0.5 rounded border border-slate-850">
                          ⏱ {part.time}
                        </span>
                      </div>

                      {/* Main Dialogue text */}
                      <p className="text-[11.5px] text-zinc-300 leading-relaxed font-sans text-justify">
                        {part.dialogue}
                      </p>

                      {/* Analogy accordion box inside */}
                      {part.analogyDesc && (
                        <div className="mt-3 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg text-[10.5px] space-y-1 leading-relaxed">
                          <span className="text-amber-400 font-bold font-mono tracking-tight flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {part.analogyTitle}
                          </span>
                          <p className="text-zinc-400 font-sans">
                            {part.analogyDesc}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredParts.length === 0 && (
              <div className="bg-slate-950 border border-slate-850 p-12 text-center rounded-xl text-slate-500 text-xs">
                Aún no hay diálogos que coincidan con tu búsqueda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
