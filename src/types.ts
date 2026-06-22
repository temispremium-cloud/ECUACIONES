export type SimState = "idle" | "spiking" | "stabilizing" | "success" | "failed";

export interface Message {
  id: string;
  sender: "assistant" | "user";
  text: string;
  timestamp: string;
}

export interface SimulationPoint {
  t: number;             // Time in seconds (0 to 15)
  traffic: number;       // Connected users
  tempUncontrolled: number; // Passive uncontrolled temperature in C
  tempControlled: number;   // Controlled Laplace-stabilized temperature in C
}

export interface Pole {
  real: number;
  imag: number;
  type: "conjugate" | "real" | "origin" | "unstable";
}

export interface ProtocolOption {
  id: string;
  name: string;
  formula: string;
  sFormula: string;
  dampingDesc: string;
  poles: string;
  zeta: number;
  omegaN: number;
  description: string;
  benefits: string;
}
