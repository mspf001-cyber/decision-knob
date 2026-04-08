import { CSSProperties, useState } from "react";
import { CircleHelp, type LucideIcon } from "lucide-react";

interface SliderProps {
  id: string;
  label: string;
  tooltip: string;
  icon: LucideIcon;
  value: number;
  onChange: (value: number) => void;
  bipolar?: boolean;
  leftLabel?: string;
  rightLabel?: string;
}

const Slider = ({
  id,
  label,
  tooltip,
  icon: Icon,
  value,
  onChange,
  bipolar = false,
  leftLabel,
  rightLabel,
}: SliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const progress = value / 100;

  const sliderStyles = {
    "--progress": `${progress}`,
  } as CSSProperties;

  return (
    <div
      className={`slider-card rounded-2xl border border-slate-200/85 bg-white/82 px-4 py-3 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.82)] backdrop-blur-sm transition-all duration-[380ms] ${isDragging ? "slider-card-active" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-[1px] inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-slate-900/6 text-slate-700">
            <Icon size={16} strokeWidth={2.1} />
          </span>
          <div className="min-w-0">
            <label
              className="block truncate text-sm font-semibold text-slate-900"
              htmlFor={id}
            >
              {label}
            </label>
            <p className="mt-0.5 text-[0.78rem] leading-snug text-slate-500">
              {tooltip}
            </p>
          </div>
        </div>

        <div className="flex flex-none items-center gap-2">
          <span
            aria-label={tooltip}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
            title={tooltip}
          >
            <CircleHelp size={13} />
          </span>
          <output className="w-9 text-right text-sm font-semibold text-slate-900">
            {value}
          </output>
        </div>
      </div>

      <div className="relative px-0.5" style={sliderStyles}>
        <div
          className={`range-shell ${bipolar ? "range-shell-bipolar" : "range-shell-unipolar"}`}
        >
          <div className="range-rail" />
          {!bipolar && <div className="range-progress" />}
          {bipolar && <div className="range-bipolar-sheen" />}
        </div>
        <input
          id={id}
          className="knob-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          onBlur={() => setIsDragging(false)}
        />
        {bipolar && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900/48"
          />
        )}
      </div>

      {bipolar && (
        <div className="mt-1.5 flex justify-between gap-4 text-[0.72rem] font-medium tracking-[0.01em] text-slate-600">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
};

export default Slider;
