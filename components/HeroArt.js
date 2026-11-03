import Family from "./Family";

// Illustration laid over house.png. Same 1248x866 box as the photo, so every
// coordinate below is a pixel position in the photo. The photo is not edited.

// Elevation outline of the house, drawn on load like a blueprint.
const TRACE = [
  "M0 592 H140 V706 H958 V392 H636",
  "M133 198 H418 L493 296 V420",
  "M140 706 V198",
  "M477 236 H617 V412",
  "M636 392 V508 H875",
  "M958 514 H1140 V596 M1130 590 H1248",
  "M432 412 H641 V452 H432 Z",
  "M240 323 H365 V452 H240 Z",
  "M240 523 H365 V650 H240 Z",
  "M472 521 H538 V627 H472 Z",
  "M565 523 H622 V645 H565 Z",
  "M733 524 H850 V646 H733 Z",
];

// Wall lights, in the order they come on.
const LAMPS = [
  [72, 648], [213, 580], [213, 383], [389, 580], [389, 383],
  [546, 368], [678, 583], [905, 517], [1192, 648],
];

const WINDOWS = [
  [240, 323, 125, 129], [240, 523, 125, 127], [472, 521, 66, 106], [733, 524, 117, 122],
];

// Marigold toran over the entrance: quadratic from (420,512) to (870,512).
const LEAVES = Array.from({ length: 9 }, (_, i) => {
  const t = (i + 1) / 10;
  return [420 + 450 * t, 512 + 126 * t * (1 - t) + 2, i];
});
const STRING = "M420 512 Q645 575 870 512";

export default function HeroArt() {
  return (
    <svg viewBox="0 0 1248 866" preserveAspectRatio="none" width="100%" height="100%" focusable="false">
      <defs>
        <radialGradient id="lampGlow">
          <stop offset="0" stopColor="#FFE2A8" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#F3C77B" stopOpacity="0.45" />
          <stop offset="1" stopColor="#F3C77B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="doorGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE2A8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#F3C77B" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="doorSpill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD58A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFD58A" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="art-windows">
        {WINDOWS.map(([x, y, w, h], i) => (
          <rect key={i} className="art-win" x={x} y={y} width={w} height={h} rx="4" style={{ "--d": `${i * 0.7}s` }} />
        ))}
      </g>

      <g>
        {TRACE.map((d, i) => (
          <path key={i} className="art-trace" d={d} pathLength="1" style={{ "--d": `${0.2 + i * 0.1}s` }} />
        ))}
      </g>

      <g className="art-door">
        <rect x="567" y="525" width="53" height="120" fill="url(#doorGlow)" />
        <polygon points="565,645 622,645 700,712 490,712" fill="url(#doorSpill)" />
      </g>

      <Family />

      <g className="art-lamps">
        {LAMPS.map(([x, y], i) => (
          <circle key={i} className="art-lamp" cx={x} cy={y} r="58" fill="url(#lampGlow)" style={{ "--d": `${1.6 + i * 0.2}s` }} />
        ))}
      </g>

      <g className="art-toran">
        <path d={STRING} fill="none" stroke="#6B3E1E" strokeWidth="1.5" />
        <path d={STRING} fill="none" stroke="#F2A11B" strokeWidth="9" strokeLinecap="round" strokeDasharray="0 13" />
        <path d={STRING} fill="none" stroke="#FFD36B" strokeWidth="4" strokeLinecap="round" strokeDasharray="0 13" />
        {LEAVES.map(([x, y, i]) => (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <g className="art-leaf" style={{ "--d": `${-i * 0.45}s` }}>
              <path d="M0 0 C-8 10 -9 26 0 38 C9 26 8 10 0 0Z" fill="#2E5540" stroke="#1F3A2B" strokeWidth="1" />
              <path d="M0 3 V33" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
