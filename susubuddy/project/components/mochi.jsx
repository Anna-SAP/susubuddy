// Mochi — the susubuddy. A soft, squishy, limbless blob.
// All expressions are pure SVG — eyes, mouth, cheeks, occasional tears/zzz.
// Props:
//   mood: 'idle' | 'blink' | 'sleepy' | 'happy' | 'focused' | 'grumpy' | 'excited' | 'celebrating'
//   size: number (px)
//   palette: { body, shadow, cheek, eye, mouth }

const MOCHI_PALETTES = {
  peach: {
    body: '#FFD8B5', bodyDeep: '#F5B98E', highlight: '#FFEBD4',
    shadow: 'rgba(232, 145, 107, 0.28)',
    cheek: '#FFB0A8', eye: '#3A2A24', mouth: '#6B3F32',
    sparkle: '#FFE08A',
  },
  pink: {
    body: '#FFC6D3', bodyDeep: '#F49CB0', highlight: '#FFE1E8',
    shadow: 'rgba(230, 120, 140, 0.28)',
    cheek: '#FF9AAA', eye: '#3A2028', mouth: '#6B2F3A',
    sparkle: '#FFD6E2',
  },
  cream: {
    body: '#FDEBCE', bodyDeep: '#E8C79B', highlight: '#FFF6E2',
    shadow: 'rgba(180, 140, 90, 0.24)',
    cheek: '#FFB894', eye: '#3A2E22', mouth: '#6B4A2F',
    sparkle: '#FFE08A',
  },
  lilac: {
    body: '#E2D4F0', bodyDeep: '#BFA7D8', highlight: '#F1E8F8',
    shadow: 'rgba(150, 120, 190, 0.25)',
    cheek: '#E4A6C5', eye: '#2E2438', mouth: '#5A3F5E',
    sparkle: '#F3DCF5',
  },
};

// Reusable eye — returns two <g> blocks (L/R) that tween between states.
function MochiEye({ cx, cy, rx = 9, ry = 11, mood, palette, delay = 0 }) {
  const closed = mood === 'blink' || mood === 'sleepy' || mood === 'celebrating';
  const happy = mood === 'happy' || mood === 'excited' || mood === 'celebrating';
  const narrowed = mood === 'grumpy' || mood === 'focused';

  if (happy) {
    // upward arc ^_^
    return (
      <path d={`M ${cx - rx} ${cy + 1} Q ${cx} ${cy - ry} ${cx + rx} ${cy + 1}`}
        stroke={palette.eye} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    );
  }
  if (closed) {
    return (
      <path d={`M ${cx - rx + 1} ${cy} Q ${cx} ${cy + 3} ${cx + rx - 1} ${cy}`}
        stroke={palette.eye} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    );
  }
  if (narrowed) {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry * 0.55} fill={palette.eye} />
        <circle cx={cx + 2} cy={cy - 2} r="2" fill="#fff" />
      </g>
    );
  }
  // default round with shine
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={palette.eye} />
      <circle cx={cx + 3} cy={cy - 3.5} r="3" fill="#fff" />
      <circle cx={cx - 2.5} cy={cy + 3} r="1.2" fill="#fff" opacity="0.75" />
    </g>
  );
}

function MochiMouth({ cx, cy, mood, palette }) {
  if (mood === 'happy' || mood === 'giggle') {
    return <path d={`M ${cx - 8} ${cy} Q ${cx} ${cy + 8} ${cx + 8} ${cy}`}
      stroke={palette.mouth} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  }
  if (mood === 'excited') {
    return <ellipse cx={cx} cy={cy + 2} rx="6" ry="7" fill={palette.mouth} />;
  }
  if (mood === 'celebrating') {
    return (
      <g>
        <path d={`M ${cx - 9} ${cy - 1} Q ${cx} ${cy + 9} ${cx + 9} ${cy - 1} Z`} fill={palette.mouth} />
        <path d={`M ${cx - 7} ${cy + 1} Q ${cx} ${cy + 5} ${cx + 7} ${cy + 1}`} fill="#FF8FA8" />
      </g>
    );
  }
  if (mood === 'sleepy') {
    return <ellipse cx={cx} cy={cy + 1} rx="5" ry="3" fill={palette.mouth} opacity="0.8" />;
  }
  if (mood === 'grumpy') {
    return <path d={`M ${cx - 7} ${cy + 3} Q ${cx} ${cy - 3} ${cx + 7} ${cy + 3}`}
      stroke={palette.mouth} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  }
  if (mood === 'focused') {
    return <path d={`M ${cx - 5} ${cy + 1} L ${cx + 5} ${cy + 1}`}
      stroke={palette.mouth} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  }
  // idle — tiny w
  return <path d={`M ${cx - 5} ${cy} Q ${cx - 2.5} ${cy + 3} ${cx} ${cy} Q ${cx + 2.5} ${cy + 3} ${cx + 5} ${cy}`}
    stroke={palette.mouth} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}

function Mochi({ mood = 'idle', size = 120, palette = 'peach', animated = true, className = '', style = {} }) {
  const pal = typeof palette === 'string' ? MOCHI_PALETTES[palette] : palette;
  const [tick, setTick] = React.useState(0);
  const [realMood, setRealMood] = React.useState(mood);

  // auto-blink on idle
  React.useEffect(() => {
    if (!animated || mood !== 'idle') { setRealMood(mood); return; }
    setRealMood('idle');
    let t;
    const loop = () => {
      const delay = 2800 + Math.random() * 2200;
      t = setTimeout(() => {
        setRealMood('blink');
        setTimeout(() => { setRealMood('idle'); loop(); }, 140);
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, [mood, animated]);

  // body squish — gentle breathing for idle; bounce for excited/celebrating
  const breathing = animated && (realMood === 'idle' || realMood === 'blink' || realMood === 'focused' || realMood === 'grumpy');
  const bouncing = animated && (realMood === 'excited' || realMood === 'celebrating' || realMood === 'happy');
  const sleeping = animated && realMood === 'sleepy';

  const wrapStyle = {
    width: size, height: size, position: 'relative',
    animation: bouncing ? 'mochi-bounce 0.9s ease-in-out infinite'
              : breathing ? 'mochi-breathe 3.4s ease-in-out infinite'
              : sleeping ? 'mochi-breathe 4.8s ease-in-out infinite'
              : 'none',
    transformOrigin: 'center bottom',
    ...style,
  };

  // viewBox is 140×140; body is centered
  const cx = 70, cy = 74;
  const leftEye = 54, rightEye = 86, eyeY = 68;

  return (
    <div className={`mochi ${className}`} style={wrapStyle} data-mood={realMood}>
      <svg viewBox="0 0 140 140" width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`mg-${pal.body.replace('#','')}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor={pal.highlight} />
            <stop offset="55%" stopColor={pal.body} />
            <stop offset="100%" stopColor={pal.bodyDeep} />
          </radialGradient>
          <filter id={`mfuzz-${pal.body.replace('#','')}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        {/* ground shadow */}
        <ellipse cx={cx} cy="128" rx="44" ry="5" fill={pal.shadow} />

        {/* squishy body — rounded blob, slightly wider than tall */}
        <g>
          <path
            d={`M ${cx} 22
               C 108 22, 124 48, 124 74
               C 124 104, 102 124, ${cx} 124
               C 38 124, 16 104, 16 74
               C 16 48, 32 22, ${cx} 22 Z`}
            fill={`url(#mg-${pal.body.replace('#','')})`}
            filter={`url(#mfuzz-${pal.body.replace('#','')})`}
          />
          {/* fuzz hairs — short radial strokes at the perimeter */}
          <g stroke={pal.bodyDeep} strokeWidth="1.3" strokeLinecap="round" opacity="0.55">
            <line x1="70" y1="22" x2="70" y2="18" />
            <line x1="60" y1="23" x2="58" y2="19" />
            <line x1="80" y1="23" x2="82" y2="19" />
            <line x1="50" y1="26" x2="46" y2="23" />
            <line x1="90" y1="26" x2="94" y2="23" />
            <line x1="16" y1="70" x2="12" y2="70" />
            <line x1="18" y1="58" x2="14" y2="56" />
            <line x1="18" y1="82" x2="14" y2="84" />
            <line x1="124" y1="70" x2="128" y2="70" />
            <line x1="122" y1="58" x2="126" y2="56" />
            <line x1="122" y1="82" x2="126" y2="84" />
            <line x1="30" y1="108" x2="27" y2="112" />
            <line x1="110" y1="108" x2="113" y2="112" />
          </g>
          {/* inner highlight */}
          <ellipse cx="52" cy="46" rx="18" ry="10" fill="#fff" opacity="0.35" />
        </g>

        {/* cheeks — always-on pink blush */}
        <ellipse cx={leftEye - 10} cy={eyeY + 10} rx="7" ry="4.5" fill={pal.cheek} opacity="0.85" />
        <ellipse cx={rightEye + 10} cy={eyeY + 10} rx="7" ry="4.5" fill={pal.cheek} opacity="0.85" />

        {/* eyes */}
        <MochiEye cx={leftEye} cy={eyeY} mood={realMood} palette={pal} />
        <MochiEye cx={rightEye} cy={eyeY} mood={realMood} palette={pal} />

        {/* mouth */}
        <MochiMouth cx={cx} cy={eyeY + 18} mood={realMood} palette={pal} />

        {/* mood-specific accessories */}
        {realMood === 'sleepy' && (
          <g>
            <text x="108" y="38" fontFamily="'Nunito', sans-serif" fontSize="14" fontWeight="700" fill={pal.mouth} opacity="0.75">z</text>
            <text x="116" y="28" fontFamily="'Nunito', sans-serif" fontSize="18" fontWeight="700" fill={pal.mouth} opacity="0.55">Z</text>
            <text x="126" y="16" fontFamily="'Nunito', sans-serif" fontSize="22" fontWeight="700" fill={pal.mouth} opacity="0.35">Z</text>
          </g>
        )}
        {realMood === 'focused' && (
          <g>
            {/* magnifying glass */}
            <circle cx="108" cy="44" r="10" fill="none" stroke={pal.mouth} strokeWidth="2.2" />
            <circle cx="108" cy="44" r="10" fill="#fff" opacity="0.35" />
            <line x1="115" y1="51" x2="122" y2="58" stroke={pal.mouth} strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 104 40 Q 108 38 112 40" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        )}
        {realMood === 'grumpy' && (
          <g>
            {/* angry brows */}
            <path d={`M 44 58 L 62 62`} stroke={pal.eye} strokeWidth="3" strokeLinecap="round" />
            <path d={`M 96 58 L 78 62`} stroke={pal.eye} strokeWidth="3" strokeLinecap="round" />
            {/* steam */}
            <path d="M 30 30 Q 34 26 30 22 Q 26 18 30 14" stroke={pal.bodyDeep} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          </g>
        )}
        {realMood === 'excited' && (
          <g>
            <path d="M 28 26 L 30 20 L 32 26 L 38 28 L 32 30 L 30 36 L 28 30 L 22 28 Z" fill={pal.sparkle} />
            <path d="M 110 18 L 112 12 L 114 18 L 120 20 L 114 22 L 112 28 L 110 22 L 104 20 Z" fill={pal.sparkle} opacity="0.85" />
          </g>
        )}
        {realMood === 'celebrating' && (
          <g>
            <circle cx="22" cy="30" r="2.5" fill="#FF8FA8" />
            <circle cx="118" cy="22" r="2.5" fill="#FFD86E" />
            <circle cx="14" cy="58" r="2" fill="#8FD4FF" />
            <circle cx="126" cy="54" r="2" fill="#A8E3B0" />
            <path d="M 34 16 L 38 12 M 36 14 L 40 10" stroke="#FF8FA8" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 102 14 L 106 10" stroke="#FFD86E" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}
        {realMood === 'happy' && (
          <g>
            <circle cx="26" cy="46" r="1.8" fill={pal.sparkle} />
            <circle cx="114" cy="42" r="1.8" fill={pal.sparkle} />
          </g>
        )}
      </svg>

      <style>{`
        @keyframes mochi-breathe {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          50% { transform: scaleX(1.03) scaleY(0.97); }
        }
        @keyframes mochi-bounce {
          0%, 100% { transform: translateY(0) scaleX(1) scaleY(1); }
          30% { transform: translateY(-6px) scaleX(0.96) scaleY(1.04); }
          60% { transform: translateY(0) scaleX(1.05) scaleY(0.95); }
        }
      `}</style>
    </div>
  );
}

window.Mochi = Mochi;
window.MOCHI_PALETTES = MOCHI_PALETTES;
