import {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BatteryMedium,
  Brain,
  Clock3,
  Globe,
  Heart,
  Search,
  Star,
  Target,
  ToyBrick,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import DecisionPanel from "./components/DecisionPanel";
import Slider from "./components/Slider";
import { computeDecision } from "./logic/computeDecision";
import { computeScore } from "./logic/computeScore";
import { DecisionInputs } from "./logic/computeState";

const initialInputs: DecisionInputs = {
  Ep: 50,
  Em: 50,
  As: 50,
  FC: 50,
  CL: 50,
  Imp: 50,
  Urg: 50,
  Eff: 50,
  Pas: 50,
  Mis: 50,
};

type KnobEntry = {
  key: keyof DecisionInputs;
  label: string;
  tooltip: string;
  icon: LucideIcon;
  bipolar?: boolean;
  leftLabel?: string;
  rightLabel?: string;
};

const stateKnobs: KnobEntry[] = [
  {
    key: "Ep",
    label: "Physical Energy",
    tooltip: "How physically rested or active I feel right now",
    icon: BatteryMedium,
  },
  {
    key: "Em",
    label: "Mental Bandwidth",
    tooltip: "How much cognitive load my mind can handle right now",
    icon: Brain,
  },
  {
    key: "As",
    label: "Anxiety",
    tooltip: "How much stress or overthinking is interfering right now",
    icon: TriangleAlert,
  },
  {
    key: "FC",
    label: "Focus Control",
    tooltip: "Where my attention naturally pulls right now",
    icon: Target,
    bipolar: true,
    leftLabel: "Distracted",
    rightLabel: "Focused",
  },
  {
    key: "CL",
    label: "Clarity",
    tooltip: "How well I understand what needs to be done",
    icon: Search,
    bipolar: true,
    leftLabel: "Confused",
    rightLabel: "Clear",
  },
];

const taskKnobs: KnobEntry[] = [
  {
    key: "Imp",
    label: "Importance",
    tooltip: "Does this genuinely matter for my future?",
    icon: Star,
  },
  {
    key: "Urg",
    label: "Urgency",
    tooltip: "Does this need to happen today or soon?",
    icon: Clock3,
  },
  {
    key: "Eff",
    label: "Effort",
    tooltip: "How hard and heavy is this task?",
    icon: ToyBrick,
  },
  {
    key: "Pas",
    label: "Passion + Skill",
    tooltip: "Do I enjoy this and feel competent doing it?",
    icon: Heart,
  },
  {
    key: "Mis",
    label: "Mission Alignment",
    tooltip: "Does this task reflect my values and direction?",
    icon: Globe,
  },
];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const lerp = (start: number, end: number, t: number): number =>
  start + (end - start) * t;

const getPriorityHue = (priority: number): number => {
  const p = clamp(priority, 0, 1);

  if (p < 0.35) {
    return lerp(205, 48, p / 0.35);
  }
  if (p < 0.6) {
    return lerp(48, 28, (p - 0.35) / 0.25);
  }
  if (p <= 0.8) {
    return lerp(28, 6, (p - 0.6) / 0.2);
  }
  return 6;
};

const getScoreIntensity = (score: number): number => {
  const s = clamp(score, 0, 1000);

  if (s < 300) {
    return lerp(0.12, 0.26, s / 300);
  }
  if (s < 500) {
    return lerp(0.26, 0.48, (s - 300) / 200);
  }
  if (s < 700) {
    return lerp(0.48, 0.72, (s - 500) / 200);
  }
  return lerp(0.72, 1, (s - 700) / 300);
};

const useAnimatedInteger = (target: number, duration = 420): number => {
  const [value, setValue] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const startValue = currentRef.current;
    const delta = target - startValue;

    if (Math.abs(delta) < 0.5) {
      currentRef.current = target;
      setValue(target);
      return;
    }

    let frame = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextValue = startValue + delta * easedProgress;

      currentRef.current = nextValue;
      setValue(nextValue);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, target]);

  return Math.round(value);
};

const App = () => {
  const [inputs, setInputs] = useState<DecisionInputs>(initialInputs);

  const scoreData = useMemo(() => computeScore(inputs), [inputs]);

  const decision = useMemo(() => {
    return computeDecision({
      score: scoreData.Score,
      priority: scoreData.Priority,
      highDistraction: scoreData.flags.highDistraction,
      highConfusion: scoreData.flags.highConfusion,
      highAnxiety: scoreData.flags.highAnxiety,
    });
  }, [scoreData]);

  const animatedScore = useAnimatedInteger(scoreData.ScoreRounded);
  const hue = getPriorityHue(scoreData.Priority);
  const intensity = getScoreIntensity(scoreData.Score);
  const accentLight = lerp(50, 64, intensity);
  const accentAlpha = lerp(0.14, 0.48, intensity);

  const dynamicTheme = {
    "--accent-hue": `${hue}`,
    "--priority-hue": `${hue.toFixed(2)}`,
    "--score-intensity": `${intensity.toFixed(3)}`,
    "--accent-lightness": `${accentLight.toFixed(2)}%`,
    "--accent-alpha": `${accentAlpha.toFixed(3)}`,
  } as CSSProperties;

  const updateValue = (key: keyof DecisionInputs, value: number) => {
    setInputs((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const renderSliderGroup = (
    title: string,
    subtitle: string,
    knobs: KnobEntry[],
    blurOnLowClarity = false,
  ) => (
    <section
      className={`panel-rise rounded-[1.45rem] border border-slate-300/70 bg-white/74 p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.9)] backdrop-blur-md transition-all duration-[420ms] ${blurOnLowClarity ? "task-section-blur" : ""}`}
      key={title}
    >
      <div className="mb-3.5">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
      <div className="space-y-3">
        {knobs.map((knob) => (
          <Slider
            key={knob.key}
            id={knob.key}
            label={knob.label}
            tooltip={knob.tooltip}
            icon={knob.icon}
            value={inputs[knob.key]}
            onChange={(value) => updateValue(knob.key, value)}
            bipolar={knob.bipolar}
            leftLabel={knob.leftLabel}
            rightLabel={knob.rightLabel}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div
      className={`app-surface min-h-screen overflow-hidden px-4 py-5 transition-all duration-[420ms] md:px-8 md:py-8 ${scoreData.flags.highAnxiety ? "anxiety-weight" : ""}`}
      style={{
        ...dynamicTheme,
        opacity: scoreData.Score < 300 ? 0.76 : 1,
      }}
    >
      <div aria-hidden className="bg-orb bg-orb-one" />
      <div aria-hidden className="bg-orb bg-orb-two" />
      <div aria-hidden className="bg-orb bg-orb-three" />

      <div className="relative mx-auto max-w-[1240px]">
        <header className="hero-panel panel-rise mb-5 rounded-[1.65rem] border border-slate-300/65 bg-white/76 px-6 py-6 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.8)] backdrop-blur-sm transition-all duration-[420ms]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Behavioral Decision Engine
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-slate-900 md:text-[2.9rem]">
            Decision Knob
          </h1>
          <p className="mt-2 max-w-3xl text-[0.98rem] leading-relaxed text-slate-700">
            Capability answers <span className="font-semibold">Can I do this right now?</span>
            {" "}
            Priority answers <span className="font-semibold">Should I do this right now?</span>
            {" "}
            They stay independent, so the recommendation reflects both your
            condition and task reality.
          </p>
        </header>

        <main className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.84fr]">
          <div className="space-y-4">
            {renderSliderGroup(
              "State",
              "How you are showing up right now.",
              stateKnobs,
            )}
            {renderSliderGroup(
              "Task",
              "What the work itself is asking from you.",
              taskKnobs,
              scoreData.flags.highConfusion,
            )}
          </div>

          <DecisionPanel
            score={scoreData.Score}
            scoreDisplay={animatedScore}
            scoreBand={scoreData.ScoreBand}
            priority={scoreData.Priority}
            priorityBand={scoreData.PriorityBand}
            insight={decision.insight}
            action={decision.action}
            limitingFactor={scoreData.limitingFactor}
            warnings={decision.warnings}
            highDistraction={scoreData.flags.highDistraction}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
