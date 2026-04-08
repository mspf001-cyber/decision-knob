# Decision Knob

Decision Knob is a calm behavioral decision engine built with React + Tailwind CSS.

It evaluates two independent axes in real time:

- Capability (`0-1000`): Can I do this right now?
- Priority (`0-1`): Should I do this right now?

The app is intentionally single-page and local only:

- No backend
- No auth
- No storage
- No analytics or gamification

## What It Does

You control 10 sliders across two sections:

- State: `Ep`, `Em`, `As`, `FC`, `CL`
- Task: `Imp`, `Urg`, `Eff`, `Pas`, `Mis`

On every slider change, the app recomputes:

- Effective focus and clarity
- State score
- Task value and resistance
- Final capability score (`0-1000`)
- Separate priority index (`0-1`)
- Limiting factor (only when score is below `600`)
- Insight, action, and contextual warnings

## Core Model

All slider inputs are normalized to `0-1` internally (`value / 100`), without modifying user-entered slider values.

### Derived Focus and Clarity

```text
F_cap = 0.8*Em + 0.2*CL
F_eff = min(FC, F_cap) * (1 - 0.5*As)

C_cap = 0.9*Em
C_eff = min(CL, C_cap) * (1 - 0.3*As)
```

### State Score

```text
StateScore = 0.25*Ep + 0.25*Em + 0.25*F_eff + 0.25*C_eff - 0.3*As
```

### Task Alignment and Value

```text
T_align = 0.5*Pas + 0.5*Mis
Value = 0.4*Imp + 0.4*Urg + 0.2*T_align
```

### Resistance

```text
Distraction = 1 - FC
Confusion   = 1 - CL

Resistance =
  0.4*Eff + 0.3*Confusion - 0.3*Ep - 0.3*Em
  - 0.2*F_eff + 0.3*As + 0.3*Distraction
```

### Final Capability Score

```text
RawScore = Value + StateScore - Resistance
Score    = clamp(RawScore * 1000, 0, 1000)
```

### Separate Priority Axis

```text
Priority = 0.6*Imp + 0.4*Urg
```

## Decision Output

The app uses score bands and priority bands to produce:

- Insight (state-aware framing)
- Action (small, calm next move)
- Optional warning add-ons for:
  - High distraction (`FC < 30`)
  - High confusion (`CL < 30`)
  - High anxiety (`As > 70`)

When `Score < 600`, the app also surfaces one limiting factor and a short human explanation.

## Visual Behavior

- Hue follows priority:
  - Low: blue
  - Medium: yellow
  - High: orange
  - Critical: red
- Intensity follows score (`faded -> vivid`)
- Output glow thresholds:
  - Soft glow near `500`
  - Strong glow near `700`
- Special states:
  - Subtle pulse when distracted
  - Slight task blur when confused
  - Muted heavier tone when anxiety is high

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS (`@tailwindcss/vite`)
- lucide-react icons

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
