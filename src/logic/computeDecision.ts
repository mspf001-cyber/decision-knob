export interface DecisionResult {
  insight: string;
  action: string;
  warnings: string[];
}

export interface DecisionParams {
  score: number;
  priority: number;
  highDistraction: boolean;
  highConfusion: boolean;
  highAnxiety: boolean;
}

const toSafeNumber = (value: number): number =>
  Number.isFinite(value) ? value : 0;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, toSafeNumber(value)));

export const computeDecision = ({
  score,
  priority,
  highDistraction,
  highConfusion,
  highAnxiety,
}: DecisionParams): DecisionResult => {
  const safeScore = clamp(score, 0, 1000);
  const safePriority = clamp(priority, 0, 1);
  let insight: string;
  let action: string;

  if (safeScore < 300) {
    insight = "This is not a good state to act.";
    action = "Reset first - then return.";
  } else if (safeScore >= 700 && safePriority >= 0.6) {
    insight = "You are in a strong state, and this matters.";
    action = "This is the right moment - step in without hesitation.";
  } else if (safeScore >= 500 && safeScore < 700 && safePriority >= 0.6) {
    insight = "You have enough to act, and this matters.";
    action = "Don't aim big - just begin.";
  } else if (safeScore >= 300 && safeScore < 500 && safePriority >= 0.6) {
    insight = "This matters, but your current state is resisting it.";
    action = "Reduce the task - start smaller than you think.";
  } else if (safeScore >= 500 && safePriority >= 0.35 && safePriority < 0.6) {
    insight = "You are capable, but this is not urgent.";
    action = "Place it after what truly matters.";
  } else if (safeScore >= 500 && safePriority < 0.35) {
    insight = "You have the capacity.";
    action = "This doesn't need your energy right now.";
  } else {
    insight = "Your state is currently strained, and this is not urgent.";
    action = "Let this wait while you recover clarity and energy.";
  }

  const warnings: string[] = [];

  if (highDistraction) {
    warnings.push(
      "Your attention is pulling elsewhere. Be deliberate before starting.",
    );
  }

  if (highConfusion) {
    warnings.push(
      "You're not blocked by effort - just unclear. Define the first step before acting.",
    );
  }

  if (highAnxiety) {
    warnings.push(
      "Emotional pressure is active. A smaller action will serve you better than a full attempt.",
    );
  }

  return { insight, action, warnings };
};
