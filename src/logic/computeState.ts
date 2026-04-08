export interface DecisionInputs {
  Ep: number;
  Em: number;
  As: number;
  FC: number;
  CL: number;
  Imp: number;
  Urg: number;
  Eff: number;
  Pas: number;
  Mis: number;
}

export type DecisionInputsLike = Partial<DecisionInputs> | null | undefined;

export interface NormalizedDecisionInputs extends DecisionInputs {}

export interface StateFlags {
  highDistraction: boolean;
  highConfusion: boolean;
  highAnxiety: boolean;
}

export interface StateComputation {
  inputs: DecisionInputs;
  normalized: NormalizedDecisionInputs;
  F_eff: number;
  C_eff: number;
  StateScore: number;
  T_align: number;
  Value: number;
  Resistance: number;
  RawScore: number;
  Score: number;
  Priority: number;
  flags: StateFlags;
}

const INPUT_KEYS: Array<keyof DecisionInputs> = [
  "Ep",
  "Em",
  "As",
  "FC",
  "CL",
  "Imp",
  "Urg",
  "Eff",
  "Pas",
  "Mis",
];

const DEFAULT_INPUTS: DecisionInputs = {
  Ep: 0,
  Em: 0,
  As: 0,
  FC: 0,
  CL: 0,
  Imp: 0,
  Urg: 0,
  Eff: 0,
  Pas: 0,
  Mis: 0,
};

const toSafeNumber = (value: unknown): number => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, toSafeNumber(value)));

export const normalize = (value: number): number => clamp(value / 100, 0, 1);

export const coerceInputs = (inputs: DecisionInputsLike): DecisionInputs => {
  const source: Partial<DecisionInputs> = inputs ?? {};
  const safeInputs: DecisionInputs = { ...DEFAULT_INPUTS };

  for (const key of INPUT_KEYS) {
    safeInputs[key] = clamp(toSafeNumber(source[key]), 0, 100);
  }

  return safeInputs;
};

export const computeState = (inputs: DecisionInputsLike): StateComputation => {
  const safeInputs = coerceInputs(inputs);

  const normalized: NormalizedDecisionInputs = {
    Ep: normalize(safeInputs.Ep),
    Em: normalize(safeInputs.Em),
    As: normalize(safeInputs.As),
    FC: normalize(safeInputs.FC),
    CL: normalize(safeInputs.CL),
    Imp: normalize(safeInputs.Imp),
    Urg: normalize(safeInputs.Urg),
    Eff: normalize(safeInputs.Eff),
    Pas: normalize(safeInputs.Pas),
    Mis: normalize(safeInputs.Mis),
  };

  const { Ep, Em, As, FC, CL, Imp, Urg, Eff, Pas, Mis } = normalized;

  // Step 1: effective focus and clarity.
  const FC_n = FC;
  const CL_n = CL;

  const F_cap = 0.8 * Em + 0.2 * CL_n;
  let F_eff = Math.min(FC_n, F_cap);
  F_eff = F_eff * (1 - 0.5 * As);

  const C_cap = 0.9 * Em;
  let C_eff = Math.min(CL_n, C_cap);
  C_eff = C_eff * (1 - 0.3 * As);

  // Step 2: state score.
  const StateScore =
    0.25 * Ep + 0.25 * Em + 0.25 * F_eff + 0.25 * C_eff - 0.3 * As;

  // Step 3: task alignment.
  const T_align = 0.5 * Pas + 0.5 * Mis;

  // Step 4: task value.
  const Value = 0.4 * Imp + 0.4 * Urg + 0.2 * T_align;

  // Step 5: resistance.
  const Distraction = 1 - FC_n;
  const Confusion = 1 - CL_n;
  const Resistance =
    0.4 * Eff +
    0.3 * Confusion -
    0.3 * Ep -
    0.3 * Em -
    0.2 * F_eff +
    0.3 * As +
    0.3 * Distraction;

  // Step 6: final score.
  const RawScore = Value + StateScore - Resistance;
  const Score = clamp(RawScore * 1000, 0, 1000);

  // Step 7: separate priority axis.
  const Priority = clamp(0.6 * Imp + 0.4 * Urg, 0, 1);

  const flags: StateFlags = {
    highDistraction: safeInputs.FC < 30,
    highConfusion: safeInputs.CL < 30,
    highAnxiety: safeInputs.As > 70,
  };

  return {
    inputs: safeInputs,
    normalized,
    F_eff,
    C_eff,
    StateScore,
    T_align,
    Value,
    Resistance,
    RawScore,
    Score,
    Priority,
    flags,
  };
};
