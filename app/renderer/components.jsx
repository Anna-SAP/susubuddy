// Shared React components for susubuddy renderer windows.
// Loaded as type="text/babel" so JSX works without a build step.

const SUSU = {
  cream: '#FDF6EE',
  creamDeep: '#F5EADA',
  peach: '#FFD8B5',
  peachDeep: '#E8916B',
  pink: '#FFB8B8',
  pinkSoft: '#FFD6DA',
  mint: '#C9E4D2',
  ink: '#3A2A24',
  inkSoft: '#6B5147',
  inkMuted: '#9E867A',
  surface: '#FFFDF9',
  surfaceDim: '#FAF3E8',
  line: 'rgba(74, 58, 50, 0.10)',
  accent: '#E8916B',
  accentSoft: '#FFE3D0',
  good: '#7AB98F',
};

const MOCHI_PALETTES = {
  peach: { body: '#FFD8B5', bodyDeep: '#F5B98E', highlight: '#FFEBD4', shadow: 'rgba(232,145,107,0.28)', cheek: '#FFB0A8', eye: '#3A2A24', mouth: '#6B3F32', sparkle: '#FFE08A' },
  pink:  { body: '#FFC6D3', bodyDeep: '#F49CB0', highlight: '#FFE1E8', shadow: 'rgba(230,120,140,0.28)', cheek: '#FF9AAA', eye: '#3A2028', mouth: '#6B2F3A', sparkle: '#FFD6E2' },
  cream: { body: '#FDEBCE', bodyDeep: '#E8C79B', highlight: '#FFF6E2', shadow: 'rgba(180,140,90,0.24)',  cheek: '#FFB894', eye: '#3A2E22', mouth: '#6B4A2F', sparkle: '#FFE08A' },
  lilac: { body: '#E2D4F0', bodyDeep: '#BFA7D8', highlight: '#F1E8F8', shadow: 'rgba(150,120,190,0.25)', cheek: '#E4A6C5', eye: '#2E2438', mouth: '#5A3F5E', sparkle: '#F3DCF5' },
};

function MochiEye({ cx, cy, rx = 9, ry = 11, mood, palette }) {
  const closed = mood === 'blink' || mood === 'sleepy' || mood === 'celebrating';
  const happy = mood === 'happy' || mood === 'excited' || mood === 'celebrating';
  const narrowed = mood === 'grumpy' || mood === 'focused';
  if (happy) return <path d={`M ${cx - rx} ${cy + 1} Q ${cx} ${cy - ry} ${cx + rx} ${cy + 1}`} stroke={palette.eye} strokeWidth="2.6" strokeLinecap="round" fill="none" />;
  if (closed) return <path d={`M ${cx - rx + 1} ${cy} Q ${cx} ${cy + 3} ${cx + rx - 1} ${cy}`} stroke={palette.eye} strokeWidth="2.6" strokeLinecap="round" fill="none" />;
  if (narrowed) return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry * 0.55} fill={palette.eye} />
      <circle cx={cx + 2} cy={cy - 2} r="2" fill="#fff" />
    </g>
  );
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={palette.eye} />
      <circle cx={cx + 3} cy={cy - 3.5} r="3" fill="#fff" />
      <circle cx={cx - 2.5} cy={cy + 3} r="1.2" fill="#fff" opacity="0.75" />
    </g>
  );
}

function MochiMouth({ cx, cy, mood, palette }) {
  if (mood === 'happy') return <path d={`M ${cx - 8} ${cy} Q ${cx} ${cy + 8} ${cx + 8} ${cy}`} stroke={palette.mouth} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  if (mood === 'excited') return <ellipse cx={cx} cy={cy + 2} rx="6" ry="7" fill={palette.mouth} />;
  if (mood === 'celebrating') return (
    <g>
      <path d={`M ${cx - 9} ${cy - 1} Q ${cx} ${cy + 9} ${cx + 9} ${cy - 1} Z`} fill={palette.mouth} />
      <path d={`M ${cx - 7} ${cy + 1} Q ${cx} ${cy + 5} ${cx + 7} ${cy + 1}`} fill="#FF8FA8" />
    </g>
  );
  if (mood === 'sleepy') return <ellipse cx={cx} cy={cy + 1} rx="5" ry="3" fill={palette.mouth} opacity="0.8" />;
  if (mood === 'grumpy') return <path d={`M ${cx - 7} ${cy + 3} Q ${cx} ${cy - 3} ${cx + 7} ${cy + 3}`} stroke={palette.mouth} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  if (mood === 'focused') return <path d={`M ${cx - 5} ${cy + 1} L ${cx + 5} ${cy + 1}`} stroke={palette.mouth} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  return <path d={`M ${cx - 5} ${cy} Q ${cx - 2.5} ${cy + 3} ${cx} ${cy} Q ${cx + 2.5} ${cy + 3} ${cx + 5} ${cy}`} stroke={palette.mouth} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}

function Mochi({ mood = 'idle', size = 120, palette = 'peach', animated = true, style = {} }) {
  const pal = typeof palette === 'string' ? MOCHI_PALETTES[palette] : palette;
  const [realMood, setRealMood] = React.useState(mood);

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

  const cx = 70, cy = 74;
  const leftEye = 54, rightEye = 86, eyeY = 68;
  const gid = pal.body.replace('#','');

  return (
    <div style={wrapStyle} data-mood={realMood}>
      <svg viewBox="0 0 140 140" width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`mg-${gid}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor={pal.highlight} />
            <stop offset="55%" stopColor={pal.body} />
            <stop offset="100%" stopColor={pal.bodyDeep} />
          </radialGradient>
          <filter id={`mfuzz-${gid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>
        <ellipse cx={cx} cy="128" rx="44" ry="5" fill={pal.shadow} />
        <g>
          <path d={`M ${cx} 22 C 108 22, 124 48, 124 74 C 124 104, 102 124, ${cx} 124 C 38 124, 16 104, 16 74 C 16 48, 32 22, ${cx} 22 Z`}
                fill={`url(#mg-${gid})`} filter={`url(#mfuzz-${gid})`} />
          <g stroke={pal.bodyDeep} strokeWidth="1.3" strokeLinecap="round" opacity="0.55">
            <line x1="70" y1="22" x2="70" y2="18" />
            <line x1="60" y1="23" x2="58" y2="19" />
            <line x1="80" y1="23" x2="82" y2="19" />
            <line x1="50" y1="26" x2="46" y2="23" />
            <line x1="90" y1="26" x2="94" y2="23" />
            <line x1="16" y1="70" x2="12" y2="70" />
            <line x1="124" y1="70" x2="128" y2="70" />
          </g>
          <ellipse cx="52" cy="46" rx="18" ry="10" fill="#fff" opacity="0.35" />
        </g>
        <ellipse cx={leftEye - 10} cy={eyeY + 10} rx="7" ry="4.5" fill={pal.cheek} opacity="0.85" />
        <ellipse cx={rightEye + 10} cy={eyeY + 10} rx="7" ry="4.5" fill={pal.cheek} opacity="0.85" />
        <MochiEye cx={leftEye} cy={eyeY} mood={realMood} palette={pal} />
        <MochiEye cx={rightEye} cy={eyeY} mood={realMood} palette={pal} />
        <MochiMouth cx={cx} cy={eyeY + 18} mood={realMood} palette={pal} />
        {realMood === 'sleepy' && (
          <g>
            <text x="108" y="38" fontSize="14" fontWeight="700" fill={pal.mouth} opacity="0.75">z</text>
            <text x="116" y="28" fontSize="18" fontWeight="700" fill={pal.mouth} opacity="0.55">Z</text>
            <text x="126" y="16" fontSize="22" fontWeight="700" fill={pal.mouth} opacity="0.35">Z</text>
          </g>
        )}
        {realMood === 'excited' && (
          <g>
            <path d="M 28 26 L 30 20 L 32 26 L 38 28 L 32 30 L 30 36 L 28 30 L 22 28 Z" fill={pal.sparkle} />
            <path d="M 110 18 L 112 12 L 114 18 L 120 20 L 114 22 L 112 28 L 110 22 L 104 20 Z" fill={pal.sparkle} opacity="0.85" />
          </g>
        )}
        {realMood === 'happy' && (
          <g>
            <circle cx="26" cy="46" r="1.8" fill={pal.sparkle} />
            <circle cx="114" cy="42" r="1.8" fill={pal.sparkle} />
          </g>
        )}
        {realMood === 'celebrating' && (
          <g>
            <circle cx="22" cy="30" r="2.5" fill="#FF8FA8" />
            <circle cx="118" cy="22" r="2.5" fill="#FFD86E" />
            <circle cx="14" cy="58" r="2" fill="#8FD4FF" />
            <circle cx="126" cy="54" r="2" fill="#A8E3B0" />
          </g>
        )}
      </svg>
    </div>
  );
}
