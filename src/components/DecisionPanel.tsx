import { LimitingFactor, PriorityBand, ScoreBand } from "../logic/computeScore";

interface DecisionPanelProps {
  score: number;
  scoreDisplay: number;
  scoreBand: ScoreBand;
  priority: number;
  priorityBand: PriorityBand;
  insight: string;
  action: string;
  limitingFactor: LimitingFactor | null;
  warnings: string[];
  highDistraction: boolean;
}

const DecisionPanel = ({
  score,
  scoreDisplay,
  scoreBand,
  priority,
  priorityBand,
  insight,
  action,
  limitingFactor,
  warnings,
  highDistraction,
}: DecisionPanelProps) => {
  const scoreGlowClass =
    score >= 700
      ? "score-strong-glow"
      : score >= 500
        ? "score-soft-glow"
        : "text-slate-800";

  return (
    <section
      className={`output-card sticky top-5 rounded-[1.6rem] border border-slate-300/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(255,252,245,0.83))] px-6 py-6 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.66)] backdrop-blur-md transition-all duration-[420ms] ${highDistraction ? "card-pulse" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/85 px-3 py-1 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          Score: {scoreDisplay} / 1000
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/85 px-3 py-1 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          Priority: {priorityBand}
        </span>
      </div>

      <p
        className={`mt-4 text-5xl font-semibold leading-none tracking-tight text-slate-900 transition-all duration-[420ms] ${scoreGlowClass}`}
      >
        {scoreDisplay} / 1000
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Capability band: {scoreBand} • Priority index: {Math.round(priority * 100)}
        %
      </p>

      {limitingFactor && (
        <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/75 px-3 py-2 text-sm leading-relaxed text-amber-900">
          <span className="font-semibold">Limiting factor: {limitingFactor.label}</span>{" "}
          - {limitingFactor.explanation}
        </p>
      )}

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-slate-200/85 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
            Insight
          </p>
          <p className="mt-1.5 text-[1.02rem] leading-relaxed text-slate-800">
            "{insight}"
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/85 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
            Action
          </p>
          <p className="mt-1.5 text-[1.02rem] leading-relaxed text-slate-800">
            "{action}"
          </p>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {warnings.map((warning) => (
            <p
              className="rounded-xl border border-rose-200/90 bg-rose-50/80 px-3 py-2 text-sm text-rose-900"
              key={warning}
            >
              {warning}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};

export default DecisionPanel;
