// The family, drawn from behind in Kerala traditional dress. Each figure has its
// feet at (0,0) and is drawn upward; the walker groups place them at the door.
const SKIN = "#B97A56";
const HAIR = "#1B1411";
const CREAM = "#F6F0E0";
const GOLD = "#C9A24B";

function Shadow({ w = 16 }) {
  return <ellipse cx="0" cy="0" rx={w} ry="4" fill="rgba(0,0,0,.35)" />;
}

function Feet({ x = 6 }) {
  return (
    <>
      <ellipse className="foot-a" cx={-x} cy="-1.5" rx="4" ry="2.2" fill="#7A4B2E" />
      <ellipse className="foot-b" cx={x} cy="-1.5" rx="4" ry="2.2" fill="#7A4B2E" />
    </>
  );
}

// Father: white mundu with kasavu border, shirt, and a shoulder cloth.
function Father() {
  return (
    <g transform="scale(.86)">
      <Shadow w={20} />
      <g className="bob">
        <Feet />
        <g className="cloth">
          <path d="M-13 -50 L13 -50 L16 -4 L-16 -4 Z" fill={CREAM} />
          <path d="M0 -50 V-9" stroke="#DAD2BF" strokeWidth="1" />
          <rect x="-16" y="-9" width="32" height="5" fill={GOLD} />
        </g>
        <g className="arm-l"><rect x="-20" y="-91" width="6.5" height="27" rx="3.2" fill="#FBF8F0" /><rect x="-19.5" y="-66" width="5.5" height="15" rx="2.7" fill={SKIN} /></g>
        <g className="arm-r"><rect x="13.5" y="-91" width="6.5" height="27" rx="3.2" fill="#FBF8F0" /><rect x="14" y="-66" width="5.5" height="15" rx="2.7" fill={SKIN} /></g>
        <path d="M-15 -90 Q-15 -94 -10 -95 H10 Q15 -94 15 -90 L14 -50 H-14 Z" fill="#FBF8F0" />
        <polygon points="-15,-92 -7,-93 15,-60 15,-52 8,-52 -15,-84" fill="#F0E6CC" stroke={GOLD} strokeWidth=".9" />
        <rect x="-4" y="-101" width="8" height="8" fill={SKIN} />
        <ellipse cx="-9" cy="-106" rx="1.8" ry="3" fill={SKIN} />
        <ellipse cx="9" cy="-106" rx="1.8" ry="3" fill={SKIN} />
        <ellipse cx="0" cy="-106" rx="9" ry="10.5" fill={HAIR} />
      </g>
    </g>
  );
}

// Mother: kasavu set-mundu, maroon blouse, bun with jasmine, a lit lamp in her hand.
function Mother() {
  const jasmine = Array.from({ length: 8 }, (_, k) => {
    const a = (k / 8) * 6.2832;
    return [6.9 * Math.cos(a), -111 + 6.9 * Math.sin(a), k];
  });
  return (
    <g transform="scale(.8)">
      <Shadow w={19} />
      <g className="bob">
        <Feet />
        <g className="cloth">
          <path d="M-14 -54 L14 -54 L18 -4 L-18 -4 Z" fill={CREAM} />
          <rect x="-18" y="-10" width="36" height="6" fill={GOLD} />
          <rect x="-18" y="-12.5" width="36" height="1.4" fill="#E8C879" />
        </g>
        <g className="arm-l"><rect x="-19" y="-89" width="6" height="13" rx="3" fill="#7E2230" /><rect x="-18.5" y="-78" width="5" height="23" rx="2.5" fill={SKIN} /></g>
        <path d="M-13 -86 Q-13 -90 -9 -91 H9 Q13 -90 13 -86 L12 -54 H-12 Z" fill={CREAM} />
        <polygon points="-13,-86 -9,-91 9,-91 13,-86 12,-70 -12,-70" fill="#7E2230" />
        <polygon points="-13,-88 -5,-90 14,-58 14,-50 6,-50 -13,-80" fill="#FBF6E8" stroke={GOLD} strokeWidth="1" />
        <path d="M12 -87 L17.5 -76" stroke="#7E2230" strokeWidth="6.5" strokeLinecap="round" />
        <path d="M17.5 -76 L25 -61" stroke={SKIN} strokeWidth="4.8" strokeLinecap="round" />
        <circle cx="25" cy="-60" r="3" fill={SKIN} />
        <path d="M19.5 -58 h11 q-1 6 -5.5 6 q-4.5 0 -5.5 -6Z" fill="#C9972B" />
        <circle cx="25" cy="-66" r="17" fill="url(#lampGlow)" style={{ mixBlendMode: "screen" }} />
        <ellipse className="mflame" cx="25" cy="-65" rx="2.3" ry="4.4" fill="#FFE08A" />
        <rect x="-4" y="-97" width="8" height="7" fill={SKIN} />
        <ellipse cx="-9.5" cy="-103" rx="1.8" ry="3" fill={SKIN} />
        <ellipse cx="9.5" cy="-103" rx="1.8" ry="3" fill={SKIN} />
        <ellipse cx="0" cy="-103" rx="9.5" ry="10.5" fill={HAIR} />
        <circle cx="0" cy="-111" r="6.2" fill={HAIR} />
        {jasmine.map(([x, y, k]) => (
          <circle key={k} cx={x.toFixed(1)} cy={y.toFixed(1)} r="1.6" fill="#FFFBEF" />
        ))}
      </g>
    </g>
  );
}

// Girl: pattu pavada with gold border, braid with jasmine. Her right hand holds her brother's.
function Girl() {
  return (
    <g transform="scale(.75)">
      <Shadow w={20} />
      <g className="bob">
        <Feet x={7} />
        <g className="cloth">
          <path d="M-11 -44 L11 -44 L22 -4 L-22 -4 Z" fill="#1F6B4A" />
          <path d="M-4 -44 L-9 -8 M4 -44 L9 -8 M0 -44 V-8" stroke="rgba(0,0,0,.18)" strokeWidth="1" />
          <rect x="-22" y="-9" width="44" height="5" fill="#D9A93C" />
          <rect x="-22" y="-12" width="44" height="1.6" fill="#F3D27B" />
        </g>
        <g className="arm-l"><rect x="-15" y="-70" width="4.4" height="22" rx="2.2" fill={SKIN} /></g>
        <path d="M-10 -72 Q-10 -75 -7 -76 H7 Q10 -75 10 -72 L10 -44 H-10 Z" fill="#E8B94A" />
        <circle cx="-11" cy="-71" r="4.6" fill="#E8B94A" />
        <circle cx="11" cy="-71" r="4.6" fill="#E8B94A" />
        <path d="M10 -68 L18.7 -45" stroke={SKIN} strokeWidth="4.4" strokeLinecap="round" />
        <circle cx="18.7" cy="-45" r="2.6" fill={SKIN} />
        <rect x="-3" y="-81" width="6" height="6" fill={SKIN} />
        <ellipse cx="-8.5" cy="-87" rx="1.6" ry="2.6" fill={SKIN} />
        <ellipse cx="8.5" cy="-87" rx="1.6" ry="2.6" fill={SKIN} />
        <ellipse cx="0" cy="-87" rx="8.5" ry="9.5" fill={HAIR} />
        <path d="M0 -79 Q-2.5 -66 0 -52" stroke={HAIR} strokeWidth="5" strokeLinecap="round" fill="none" />
        {[-76, -70, -64, -58, -53].map((y) => (
          <circle key={y} cx={y % 2 ? 1.2 : -1.2} cy={y} r="1.7" fill="#FFFBEF" />
        ))}
        <circle cx="0" cy="-49" r="2.2" fill="#C0392B" />
      </g>
    </g>
  );
}

// Boy: small mundu with kasavu border and a cream shirt.
function Boy() {
  return (
    <g transform="scale(.72)">
      <Shadow w={17} />
      <g className="bob">
        <Feet x={5.5} />
        <g className="cloth">
          <path d="M-11 -34 L11 -34 L13 -4 L-13 -4 Z" fill={CREAM} />
          <rect x="-13" y="-8" width="26" height="4" fill={GOLD} />
        </g>
        <g className="arm-r"><rect x="11" y="-66" width="5" height="12" rx="2.5" fill="#FBF8F0" /><rect x="11.4" y="-56" width="4.2" height="13" rx="2.1" fill={SKIN} /></g>
        <path d="M-12 -64 Q-12 -67 -8 -68 H8 Q12 -67 12 -64 L11 -34 H-11 Z" fill="#FBF8F0" />
        <path d="M-12 -64 L-19.4 -47" stroke="#FBF8F0" strokeWidth="5.4" strokeLinecap="round" />
        <path d="M-17 -52 L-19.4 -47" stroke={SKIN} strokeWidth="4.2" strokeLinecap="round" />
        <circle cx="-19.4" cy="-47" r="2.6" fill={SKIN} />
        <rect x="-3" y="-73" width="6" height="6" fill={SKIN} />
        <ellipse cx="-8" cy="-78" rx="1.6" ry="2.6" fill={SKIN} />
        <ellipse cx="8" cy="-78" rx="1.6" ry="2.6" fill={SKIN} />
        <ellipse cx="0" cy="-78" rx="8" ry="9" fill={HAIR} />
      </g>
    </g>
  );
}

// Feet end at the door threshold (594,652). --dx/--dy/--s0 are where each walker
// starts (below the photo edge) and how big it looks there; --w is its start delay.
export default function Family() {
  return (
    <g className="art-family" transform="translate(594 652)">
      <g className="walker" style={{ "--w": "1.2s", "--dx": "-18px", "--dy": "235px", "--s0": 1.4 }}>
        <g transform="translate(-6 0)"><Mother /></g>
      </g>
      <g className="walker" style={{ "--w": "1.55s", "--dx": "14px", "--dy": "250px", "--s0": 1.45 }}>
        <g transform="translate(-14 0)"><Girl /></g>
        <g transform="translate(14 0)"><Boy /></g>
      </g>
      <g className="walker" style={{ "--w": "2s", "--dx": "58px", "--dy": "262px", "--s0": 1.5 }}>
        <g transform="translate(5 0)"><Father /></g>
      </g>
    </g>
  );
}
