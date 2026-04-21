// Shared design tokens for susubuddy
const SUSU = {
  // warm pastels
  cream: '#FDF6EE',
  creamDeep: '#F5EADA',
  peach: '#FFD8B5',
  peachDeep: '#E8916B',
  pink: '#FFB8B8',
  pinkSoft: '#FFD6DA',
  mint: '#C9E4D2',
  // text
  ink: '#3A2A24',
  inkSoft: '#6B5147',
  inkMuted: '#9E867A',
  // surfaces
  surface: '#FFFDF9',
  surfaceDim: '#FAF3E8',
  line: 'rgba(74, 58, 50, 0.10)',
  lineStrong: 'rgba(74, 58, 50, 0.18)',
  // semantic
  accent: '#E8916B',
  accentSoft: '#FFE3D0',
  good: '#7AB98F',
  warn: '#E8A86B',
};

// Blurred desktop wallpaper — stripy placeholder in warm tones
function DesktopBg({ style = {}, children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(ellipse at 25% 30%, #FFE3D0 0%, transparent 55%),
        radial-gradient(ellipse at 75% 70%, #FFD6DA 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, #FDF6EE 0%, #F0DFC8 100%)
      `,
      ...style,
    }}>
      {/* subtle blur texture — concentric soft bands */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.35, mixBlendMode: 'soft-light' }}>
        <defs>
          <filter id="bgblur"><feGaussianBlur stdDeviation="22" /></filter>
        </defs>
        <g filter="url(#bgblur)">
          <circle cx="20%" cy="25%" r="120" fill="#FFB8B8" />
          <circle cx="80%" cy="75%" r="160" fill="#FFD8B5" />
          <circle cx="55%" cy="20%" r="100" fill="#E8C9A8" />
        </g>
      </svg>
      {children}
    </div>
  );
}

// A blurred-out ghost "browser window" behind the buddy
function GhostApp({ top, left, right, bottom, w = 420, h = 260, tilt = 0, opacity = 0.55 }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom,
      width: w, height: h,
      background: 'rgba(255, 253, 249, 0.7)',
      borderRadius: 8,
      boxShadow: '0 8px 28px rgba(74, 58, 50, 0.12)',
      filter: 'blur(1.5px)',
      opacity,
      transform: `rotate(${tilt}deg)`,
      overflow: 'hidden',
    }}>
      <div style={{ height: 22, background: 'rgba(245, 234, 218, 0.7)', display: 'flex', alignItems: 'center', padding: '0 8px', gap: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: 4, background: '#FFB8B8' }} />
        <div style={{ width: 7, height: 7, borderRadius: 4, background: '#FFD8B5' }} />
        <div style={{ width: 7, height: 7, borderRadius: 4, background: '#C9E4D2' }} />
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ height: 8, width: '65%', background: 'rgba(74,58,50,0.18)', borderRadius: 4, marginBottom: 10 }} />
        <div style={{ height: 6, width: '90%', background: 'rgba(74,58,50,0.10)', borderRadius: 3, marginBottom: 5 }} />
        <div style={{ height: 6, width: '82%', background: 'rgba(74,58,50,0.10)', borderRadius: 3, marginBottom: 5 }} />
        <div style={{ height: 6, width: '88%', background: 'rgba(74,58,50,0.10)', borderRadius: 3, marginBottom: 14 }} />
        <div style={{ height: 6, width: '40%', background: 'rgba(74,58,50,0.12)', borderRadius: 3, marginBottom: 5 }} />
        <div style={{ height: 6, width: '70%', background: 'rgba(74,58,50,0.10)', borderRadius: 3, marginBottom: 5 }} />
        <div style={{ height: 6, width: '60%', background: 'rgba(74,58,50,0.10)', borderRadius: 3 }} />
      </div>
    </div>
  );
}

// Taskbar — windows-ish but stripped/generic, 40px tall
function Taskbar({ style = {} }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 40,
      background: 'rgba(253, 246, 238, 0.85)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(74,58,50,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 14px',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {['#FFD8B5','#FFB8B8','#C9E4D2','#E8C9A8','#FFD6DA'].map((c, i) => (
          <div key={i} style={{ width: 22, height: 22, borderRadius: 5, background: c, opacity: 0.85 }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Nunito, sans-serif', fontSize: 11, color: SUSU.inkSoft }}>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>14:22</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>4/21</span>
      </div>
    </div>
  );
}

window.SUSU = SUSU;
window.DesktopBg = DesktopBg;
window.GhostApp = GhostApp;
window.Taskbar = Taskbar;
