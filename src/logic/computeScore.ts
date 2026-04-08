import {
  DecisionInputs,
  DecisionInputsLike,
  StateComputation,
  coerceInputs,
  computeState,
} from "./computeState";

export type PriorityBand = "Low" | "Medium" | "High" | "Critical";

export type ScoreBand = "Not viable" | "Difficult" | "Capable" | "Strong";

export interface LimitingFactor {
  key: keyof DecisionInputs;
  label: string;
  explanation: string;
}

export interface ScoreComputation extends StateComputation {
  ScoreRounded: number;
  PriorityBand: PriorityBand;
  ScoreBand: ScoreBand;
  limitingFactor: LimitingFactor | null;
}

interface LimitingFactorMeta {
  ideal: number;
  label: string;
  explanation: string;
}

const LIMITING_FACTOR_META: Record<keyof DecisionInputs, LimitingFactorMeta> = {
  Ep: {
    ideal: 100,
    label: "Physical Energy",
    explanation: "physical depletion is reducing your ability to execute cleanly.",
  },
  Em: {
    ideal: 100,
    label: "Mental Bandwidth",
    explanation: "cognitive load is limiting your effective focus and clarity.",
  },
  As: {
    ideal: 0,
    label: "Anxiety",
    explanation:
      "emotional pressure is reducing your effective focus and clarity.",
  },
  FC: {
    ideal: 100,
    label: "Distraction",
    explanation: "attention drift is increasing friction before you even begin.",
  },
  CL: {
    ideal: 100,
    label: "Confusion",
    explanation: "you have not defined the next step clearly yet.",
  },
  Imp: {
    ideal: 100,
    label: "Importance",
    explanation: "this task is not registering as meaningful enough right now.",
  },
  Urg: {
    ideal: 100,
    label: "Urgency",
    explanation: "time pressure is low, so momentum is naturally softer.",
  },
  Eff: {
    ideal: 0,
    label: "Effort",
    explanation: "this task is heavy relative to your current state.",
  },
  Pas: {
    ideal: 100,
    label: "Passion + Skill",
    explanation: "low enjoyment and confidence are reducing task alignment.",
  },
  Mis: {
    ideal: 100,
    label: "Mission Alignment",
    explanation: "this does not feel strongly connected to your direction.",
  },
};

const getPriorityBand = (priority: number): PriorityBand => {
  if (priority < 0.35) {
    return "Low";
  }
  if (priority < 0.6) {
    return "Medium";
  }
  if (priority <= 0.8) {
    return "High";
  }
  return "Critical";
};

const getScoreBand = (score: number): ScoreBand => {
  if (score < 300) {
    return "Not viable";
  }
  if (score < 500) {
    return "Difficult";
  }
  if (score < 700) {
    return "Capable";
  }
  return "Strong";
};

const getLimitingFactor = (
  inputs: DecisionInputs,
  baseRawScore: number,
  score: number,
): LimitingFactor | null => {
  if (score >= 600) {
    return null;
  }

  let bestKey: keyof DecisionInputs | null = null;
  let bestGain = Number.NEGATIVE_INFINITY;

  const keys = Object.keys(LIMITING_FACTOR_META) as Array<keyof DecisionInputs>;

  for (const key of keys) {
    const { ideal } = LIMITING_FACTOR_META[key];
    const adjustedInputs: DecisionInputs = {
      ...inputs,
      [key]: ideal,
    };
    const comparison = computeState(adjustedInputs);
    const gain = comparison.RawScore - baseRawScore;

    if (gain > bestGain) {
      bestGain = gain;
      bestKey = key;
    }
  }

  if (!bestKey || bestGain <= 0) {
    return null;
  }

  const selected = LIMITING_FACTOR_META[bestKey];
  return {
    key: bestKey,
    label: selected.label,
    explanation: selected.explanation,
  };
};

export const computeScore = (inputs: DecisionInputsLike): ScoreComputation => {
  const safeInputs = coerceInputs(inputs);
  const state = computeState(safeInputs);
  const limitingFactor = getLimitingFactor(
    safeInputs,
    state.RawScore,
    state.Score,
  );

  return {
    ...state,
    ScoreRounded: Math.round(state.Score),
    PriorityBand: getPriorityBand(state.Priority),
    ScoreBand: getScoreBand(state.Score),
    limitingFactor,
  };
};
