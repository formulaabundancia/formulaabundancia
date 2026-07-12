export interface ProgramWeek {
  numero: number;
  titulo: string;
  objetivo: string;
  contenido: string[];
  ejercicio: string;
}

// Temario de la mentoría de pareja (8 semanas).
export const PROGRAM_WEEKS: ProgramWeek[] = [
  {
    numero: 1,
    titulo: "Descubrimiento del “Por Qué”",
    objetivo: "Salir del “qué hago” al “por qué lo hago”.",
    contenido: [
      "Método “Golden Circle” (Why → How → What)",
      "Ejercicio de los 5 “¿Por qué?”",
      "Valores personales vs. valores heredados",
      "Escribir la misión personal (la PERSONAL, no la de la empresa)",
    ],
    ejercicio: "“¿Por qué queremos ganar dinero online?” → responder 5 veces, profundizando cada vez.",
  },
  {
    numero: 2,
    titulo: "Panel de Sueños + Visión Compartida",
    objetivo: "Definir sueños individuales y crear la versión compartida.",
    contenido: [
      "Sueños a 1, 5 y 10 años (salud, finanzas, relación, crecimiento)",
      "Crear un Vision Board juntos",
      "Identificar y negociar conflictos de sueños",
      "Establecer milestones de pareja",
    ],
    ejercicio: "Cada uno hace su panel de sueños en silencio (30 min). Luego buscan 3 puntos comunes mínimo.",
  },
  {
    numero: 3,
    titulo: "Motivaciones Profundas",
    objetivo: "Entender qué mueve realmente a cada uno.",
    contenido: [
      "Tipología: autonomía, competencia, relación",
      "Motivadores extrínsecos vs. intrínsecos",
      "Perfil de energía (qué carga vs. qué descarga)",
    ],
    ejercicio: "Cada uno responde: “¿Qué me hace sentir más vivo(a)?” y buscan actividades que multipliquen energía juntos.",
  },
  {
    numero: 4,
    titulo: "Ingresos Online + Modelo de Negocio",
    objetivo: "Definir cómo haremos dinero online de forma alineada.",
    contenido: [
      "Mapeo de skills y expertise de ambos",
      "Opciones viables (trading, consultoría, SaaS, educación…)",
      "Definir roles: ¿quién hace qué?",
      "Timeline de ingresos (mes 1-3, 3-6, 6-12)",
    ],
    ejercicio: "Puntuar 5 opciones de negocio en viabilidad, tiempo y motivación. Profundizar en las 2-3 mejores.",
  },
  {
    numero: 5,
    titulo: "Hábitos de Éxito + Rutinas Compartidas",
    objetivo: "Establecer los hábitos que sostienen el proyecto de vida compartida.",
    contenido: [
      "Atomic Habits aplicado a la relación y los negocios",
      "Rutina matutina de pareja (los hábitos CLAVE)",
      "Rutina nocturna de sincronización",
      "Hábitos individuales que apoyan lo compartido",
    ],
    ejercicio: "Cada uno elige 3 hábitos clave para 90 días + 2 hábitos compartidos. Se usa un tracker simple.",
  },
  {
    numero: 6,
    titulo: "No Negociables + Acuerdos",
    objetivo: "Definir las líneas rojas de la relación y el proyecto.",
    contenido: [
      "No negociables vs. preferencias",
      "Áreas: finanzas, familia, salud, tiempo, valores",
      "Crear un Acuerdo de Pareja escrito",
      "Revisión cada 3 meses",
    ],
    ejercicio: "Cada uno lista 5-7 no negociables en silencio. Se comparten y se firma un acuerdo escrito.",
  },
  {
    numero: 7,
    titulo: "Comunicación + Resolución de Conflictos",
    objetivo: "Desarrollar habilidades de comunicación consciente.",
    contenido: [
      "Escucha activa: escuchar para entender, no para responder",
      "Comunicación No Violenta (observación, sentimiento, necesidad, petición)",
      "Protocolo de conflictos (no en caliente)",
      "Feedback constructivo y apreciación",
    ],
    ejercicio: "Conversación consciente de 30 min: cada uno habla 15 min sin interrupción. El otro solo escucha.",
  },
  {
    numero: 8,
    titulo: "Plan de Acción 90 Días",
    objetivo: "Materializar todo en un plan ejecutable.",
    contenido: [
      "Definir OKRs conjuntos para 90 días",
      "Breakdown a semanas y acciones concretas",
      "Sistema de seguimiento semanal",
      "Ritmo de revisión (semanal, mensual, trimestral)",
    ],
    ejercicio: "Crear un documento vivo con sueños, no negociables, hábitos y plan 90 días. Repaso cada viernes 30 min.",
  },
];
