import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in your secrets. Please make sure to configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper to generate a complete, high-quality simulated response in Spanish if the Gemini API is offline/rate-limited
function getLocalFallbackResponse(state: string, event: string, query?: string): string {
  if (query) {
    const q = query.toLowerCase();
    
    if (q.includes("hola") || q.includes("saludo") || q.includes("quien eres") || q.includes("quién eres")) {
      return `¡Hola! Soy **Laplace Assistant** en modo de respaldo local. 
      
Estoy totalmente capacitado en tiempo real para instruirte sobre la estabilidad del rack. Mi misión es enseñarte a usar el **dominio s** para predecir si el calor derretirá la silicona en t = 15s. ¿En qué puedo apoyarte hoy?`;
    }
    
    if (q.includes("laplace") || q.includes("transformada")) {
      return `La **Transformada de Laplace** ($L\\{f(t)\\} = F(s)$) es una genialidad matemática que proyecta ecuaciones diferenciales de transferencia de calor desde el dominio del tiempo $t$ al dominio algebraico complejo $s$.
      
En el dominio $s$, las derivadas se convierten en factores algebraicos, facilitando el diseño de filtros s-domain a través de polos que reubican la frecuencia de respuesta y el amortiguamiento para evitar oscilaciones térmicas letales de la CPU.`;
    }
    
    if (q.includes("polo") || q.includes("estabil") || q.includes("plano") || q.includes("raices") || q.includes("raíces")) {
      return `Los **Polos del Sistema** son las raíces del denominador de la función de transferencia $G(s)$. 

- Si un polo tiene parte real positiva (plano derecho de S), el calor crece de forma exponencial e incontrolable ($e^{at}$), lo que funde los núcleos físicos.
- Si los polos están en el plano izquierdo (parte real negativa), el sistema disipa la energía, garantizando que sea inherentemente **estable**.`;
    }
    
    if (q.includes("amortigu") || q.includes("zeta") || q.includes("lazo") || q.includes("omega")) {
      return `El factor de **amortiguamiento ($\\zeta$)** y la **frecuencia natural ($\\omega_n$)** dictan cómo reacciona el servidor:

- Un $\\zeta < 1$ (subamortiguado) genera oscilaciones cíclicas de temperatura en el procesador.
- Un $\\zeta = 1$ (críticamente amortiguado) es el control óptimo: estabiliza el procesador en el menor tiempo posible sin ondulaciones.
- Un $\\zeta > 1$ (sobreamortiguado) disipa el calor lentamente, lo que podría tardar demasiado en reaccionar ante una avalancha de peticiones.`;
    }
    
    if (q.includes("control") || q.includes("filtro") || q.includes("compens")) {
      return `El **Control por Retroalimentación** utiliza la transformada de Laplace para acoplar la temperatura de salida con la velocidad de los extractores.
      
Al diseñar un polo compensador en el dominio $s$, contrarrestamos la inercia térmica y el retardo físico del aluminio antes de que la CPU toque los peligrosos 90°C.`;
    }
    
    if (q.includes("temperatura") || q.includes("calor") || q.includes("grados") || q.includes("90") || q.includes("critico") || q.includes("crítico")) {
      return `El calor generado por la CPU escala con la carga de usuarios/segundo. La temperatura aumenta continuamente debido a la inercia térmica del chip de silicio.
      
Si no se compensa con un controlador Laplace antes de los 15 segundos de simulación, la temperatura cruzará los **90°C**, provocando un desplome térmico crítico de hardware para salvar los transistores.`;
    }

    return `He analizado tu mensaje sobre: *"${query}"*. 
    
Como el servicio de IA de Gemini se encuentra temporalmente con restricción de cuota en su servidor de pruebas, he activado mi motor educativo local de Laplace. 

Matemáticamente, tu simulación se rige por la transferencia de calor de segundo orden de la placa G7. ¿Deseas profundizar en cómo la constante de tiempo térmica interactúa con el amortiguamiento o los polos en el plano complejo?`;
  }
  
  if (state === "success") {
    return `¡Felicidades! Se ha evitado con éxito el colapso estabilizando el servidor DL380 G7 a tiempo.
    
**Explicación en el Dominio S**: Al aplicar la retroalimentación activa de calor de Laplace, el sistema reubicó sus polos dinámicos de manera que la respuesta transitoria en el tiempo es suave y asintótica, limitando la temperatura a unos estables y seguros 60°C. ¡La infraestructura del centro de datos ha sido salvada!`;
  }
  
  if (state === "failed") {
    return `¡Colapso del Servidor! La temperatura ha superado el umbral extremo de 90°C.
    
**Análisis del Fallo**: En el modo 'Sin Control', el sistema térmico cuenta con polos lentos y deficientes en el semiplano izquierdo o inestables en el plano derecho. Al recibir la matrícula de tráfico (escalón unitario), la inercia térmica de los procesadores generó una acumulación de calor exponencial que sobrepasó la capacidad de evacuación de los ventiladores.`;
  }
  
  return `El asistente Laplace Assistant en modo autónomo local está listo. Monitoreando las señales del rack del hardware en espera de perturbaciones exponenciales. 
  
Pulsa **"Lanzar Matrícula Viral"** para cargar tráfico simulado y ver en tiempo real cómo la transformada de Laplace equilibra la curva de calor térmico.`;
}

// API Route for educational Laplace explanations
app.post("/api/explain", async (req, res) => {
  try {
    const { state, event, query } = req.body;
    // state: 'success' | 'failed' | 'idle' | 'running'
    // event: string description of the state
    // query: any personalized question from the user chat box

    let client;
    try {
      client = getGeminiClient();
    } catch (credentialError: any) {
      console.warn("Gemini client initialization failed, falling back:", credentialError.message);
      const fallbackText = getLocalFallbackResponse(state, event, query);
      return res.json({ text: fallbackText, isFallback: true });
    }

    let prompt = "";
    if (query) {
      prompt = `El usuario tiene una duda específica o mensaje sobre el simulador de Laplace y servidores: "${query}".
Responde con excelencia didáctica internacional en español. Explica el concepto físico/matemático detrás (transformada de Laplace, dominio S, polos, amortiguamiento, ecuaciones de transferencia o temperatura) de forma muy visual, breve y comprensible (máximo 130 palabras).`;
    } else if (state === "success") {
      prompt = `¡Éxito! El sistema del servidor ha sido estabilizado a tiempo utilizando el Protocolo de Estabilización de Laplace (control por retroalimentación activa de calor).
El evento de colapso evitado fue: "${event}".
Por favor, explica en español, de forma muy entusiasta, clara y corta (máximo 120 palabras), cómo al aplicar la transformada pasamos del peligro exponencial en t (crecimiento e^{a*t}) a un sistema de polos bien ubicados en la parte izquierda del plano complejo S, amortiguando la oscilación térmica.`;
    } else if (state === "failed") {
      prompt = `¡Colapso crítico! El servidor se fundió (alcanzó >90°C) debido a que el usuario no aplicó la estabilización de Laplace a tiempo frente al pico de tráfico viral (escalón unitario o rampa exponencial).
El evento destructivo fue: "${event}".
Explica en un tono empático pero enérgico y educativo en español (máximo 120 palabras) qué pasó matemáticamente: la temperatura subió de forma exponencial y acumulativa en el dominio del tiempo porque en el s-domain teníamos un polo inestable o con lenta disipación (constante de tiempo grande). Explica la importancia de la transformada para predecir y contrarrestar este colapso.`;
    } else {
      prompt = `El servidor está en estado estable en reposo esperando el estallido viral de tráfico masivo.
Explica de manera breve y motivadora en español (máximo 110 palabras) qué es Laplace Assistant y cómo usar la transformada de Laplace para modelar la temperatura CPU s(T) y salvar el centro de datos. Invítalo a hacer clic en 'Lanzar App Viral' para iniciar.`;
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres 'Laplace Assistant', un simpático ingeniero de sistemas especializado en control dinámico y Laplace. Escribes exclusivamente en español de forma motivadora, educativa, sencilla y ágil (concisa, sin rodeos, estructurada en un par de párrafos atractivos con términos matemáticos clave en negrita).",
        }
      });

      res.json({ text: response.text });
    } catch (apiError: any) {
      console.warn("Gemini API call failed, falling back:", apiError.message || apiError);
      const fallbackText = getLocalFallbackResponse(state, event, query);
      res.json({ text: fallbackText, isFallback: true });
    }
  } catch (error: any) {
    console.error("General API Route error:", error);
    const fallbackText = getLocalFallbackResponse(req.body.state, req.body.event, req.body.query);
    res.json({ text: fallbackText, isFallback: true });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
