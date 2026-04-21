// Core UI surfaces: speech bubble, OCR progress, markdown preview, timeline

function Bubble({ from = 'br', children, style = {}, tailSize = 10 }) {
  // tail direction: 'br' = bottom-right of bubble, tail points to bottom-right
  return (
    <div style={{
      position: 'relative',
      background: SUSU.surface,
      borderRadius: 18,
      boxShadow: '0 4px 18px rgba(74, 58, 50, 0.14), 0 1px 3px rgba(74,58,50,0.06)',
      border: `1px solid ${SUSU.line}`,
      padding: '14px 16px',
      fontFamily: 'Nunito, sans-serif',
      color: SUSU.ink,
      ...style,
    }}>
      {children}
      {/* tail */}
      <svg width="20" height="14" viewBox="0 0 20 14" style={{
        position: 'absolute',
        right: from === 'br' ? 16 : 'auto',
        left: from === 'bl' ? 16 : 'auto',
        bottom: -12,
      }}>
        <path d="M 2 0 Q 10 2 18 0 Q 14 10 10 13 Q 6 10 2 0 Z"
          fill={SUSU.surface}
          stroke={SUSU.line}
          strokeWidth="1" />
      </svg>
    </div>
  );
}

// Quick-note panel — pops from buddy like a speech bubble
function InspirationPanel({ onClose, initialValue = '', withTags = false, style = {} }) {
  const [text, setText] = React.useState(initialValue);
  const [tags, setTags] = React.useState(['#idea']);
  const ref = React.useRef(null);
  React.useEffect(() => { ref.current?.focus(); }, []);

  const now = new Date();
  const stamp = now.toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div style={{
      width: 320,
      background: SUSU.surface,
      borderRadius: 20,
      boxShadow: '0 12px 36px rgba(74, 58, 50, 0.18), 0 2px 6px rgba(74,58,50,0.08)',
      border: `1px solid ${SUSU.line}`,
      padding: '14px 16px 12px',
      fontFamily: 'Nunito, sans-serif',
      color: SUSU.ink,
      position: 'relative',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>💭</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: SUSU.inkSoft }}>a little thought…</span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: SUSU.inkMuted, letterSpacing: 0.3 }}>
          {stamp}
        </span>
      </div>

      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="what's on your mind?"
        rows={3}
        style={{
          width: '100%', resize: 'none', border: 'none', outline: 'none',
          fontFamily: 'Nunito, sans-serif', fontSize: 14.5, lineHeight: 1.55,
          color: SUSU.ink, background: 'transparent',
          padding: '2px 0',
        }}
      />

      {withTags && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6, marginBottom: 4 }}>
          {tags.map((t) => (
            <span key={t} style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px',
              background: SUSU.accentSoft, color: SUSU.peachDeep, borderRadius: 10,
            }}>{t}</span>
          ))}
          <button style={{ border: 'none', background: 'transparent', color: SUSU.inkMuted, fontSize: 11, cursor: 'pointer', padding: '2px 4px' }}>+ tag</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${SUSU.line}` }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn title="attach screenshot">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="10" height="8" rx="1.5"/><circle cx="5" cy="6" r="1"/><path d="M2 9l3-2 4 3 3-2"/></svg>
          </IconBtn>
          <IconBtn title="hashtag">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 5h10M2 9h10M5 2l-1 10M10 2l-1 10"/></svg>
          </IconBtn>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: SUSU.inkMuted, fontFamily: 'JetBrains Mono, monospace' }}>⌘↵ save</span>
          <button onClick={onClose} style={{
            border: 'none', background: SUSU.accent, color: '#fff',
            padding: '6px 14px', borderRadius: 12, fontWeight: 700, fontSize: 13,
            fontFamily: 'inherit', cursor: 'pointer',
            boxShadow: '0 2px 0 rgba(161,84,49,0.35)',
          }}>save ✨</button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, title, onClick, active }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 26, height: 26, border: 'none',
      background: active ? SUSU.accentSoft : 'transparent',
      color: active ? SUSU.peachDeep : SUSU.inkSoft,
      borderRadius: 8, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background .12s',
    }}
    onMouseEnter={(e) => !active && (e.currentTarget.style.background = SUSU.surfaceDim)}
    onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}
    >{children}</button>
  );
}

// OCR capture overlay — the darkened screen while dragging the marquee
function OCRMarquee({ x = 140, y = 80, w = 440, h = 220, label = 'drag to capture' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* dim overlay with hole */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <mask id="hole">
            <rect width="100%" height="100%" fill="white" />
            <rect x={x} y={y} width={w} height={h} fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(58, 42, 36, 0.42)" mask="url(#hole)" />
      </svg>

      {/* marquee border */}
      <div style={{
        position: 'absolute', left: x, top: y, width: w, height: h,
        border: `2px dashed ${SUSU.accent}`,
        background: 'rgba(255, 216, 181, 0.06)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.4) inset',
      }}>
        {/* corner handles */}
        {[[0,0],[1,0],[0,1],[1,1]].map(([cx,cy],i) => (
          <div key={i} style={{
            position: 'absolute',
            left: cx ? 'auto' : -5, right: cx ? -5 : 'auto',
            top: cy ? 'auto' : -5, bottom: cy ? -5 : 'auto',
            width: 10, height: 10, background: SUSU.accent, borderRadius: 2,
            boxShadow: '0 0 0 2px #fff',
          }} />
        ))}
        {/* dimension label */}
        <div style={{
          position: 'absolute', top: -28, left: 0,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
          color: SUSU.surface, background: SUSU.accent,
          padding: '3px 8px', borderRadius: 6,
        }}>{w} × {h}  ·  {label}</div>
      </div>
    </div>
  );
}

// Processing card — shows during OCR
function OCRProgress({ progress = 0.5, stage = 'reading characters…' }) {
  return (
    <div style={{
      width: 260,
      background: SUSU.surface, borderRadius: 18,
      boxShadow: '0 8px 28px rgba(74, 58, 50, 0.18)',
      border: `1px solid ${SUSU.line}`,
      padding: '14px 16px',
      fontFamily: 'Nunito, sans-serif', color: SUSU.ink,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: SUSU.accent,
          animation: 'susu-pulse 1.2s ease-in-out infinite' }} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>reading for you…</span>
      </div>
      <div style={{ fontSize: 12, color: SUSU.inkSoft, marginBottom: 8 }}>{stage}</div>
      <div style={{ height: 6, background: SUSU.surfaceDim, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${SUSU.peach}, ${SUSU.accent})`,
          borderRadius: 3, transition: 'width .3s ease-out',
        }} />
      </div>
      <style>{`@keyframes susu-pulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }`}</style>
    </div>
  );
}

// Markdown preview card after OCR — shows what was captured
function MarkdownCard({ title, lines = [], sources = 0, chars = 0, style = {} }) {
  return (
    <div style={{
      background: SUSU.surface, borderRadius: 18,
      boxShadow: '0 8px 28px rgba(74,58,50,0.18)',
      border: `1px solid ${SUSU.line}`,
      fontFamily: 'Nunito, sans-serif', color: SUSU.ink,
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        padding: '10px 14px',
        background: SUSU.surfaceDim,
        borderBottom: `1px solid ${SUSU.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <span style={{ fontSize: 12.5, fontWeight: 700 }}>got it — copied to clipboard</span>
        </div>
        <span style={{ fontSize: 10, color: SUSU.inkMuted, fontFamily: 'JetBrains Mono, monospace' }}>capture_{String(Date.now()).slice(-6)}.md</span>
      </div>
      <div style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.65, color: SUSU.ink, maxHeight: 240, overflow: 'hidden' }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            color: l.startsWith('#') ? SUSU.peachDeep
                 : l.startsWith('- ') || l.startsWith('* ') ? SUSU.inkSoft
                 : l.startsWith('>') ? SUSU.inkSoft
                 : SUSU.ink,
            fontWeight: l.startsWith('#') ? 700 : 500,
          }}>{l || '\u00A0'}</div>
        ))}
      </div>
      <div style={{
        padding: '8px 14px', borderTop: `1px solid ${SUSU.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, color: SUSU.inkMuted,
      }}>
        <span>{sources} sources linked · {chars} chars</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <MiniBtn>📋 copy</MiniBtn>
          <MiniBtn>📂 open</MiniBtn>
          <MiniBtn primary>save →</MiniBtn>
        </div>
      </div>
    </div>
  );
}

function MiniBtn({ children, primary }) {
  return (
    <button style={{
      border: `1px solid ${primary ? SUSU.accent : SUSU.line}`,
      background: primary ? SUSU.accent : SUSU.surface,
      color: primary ? '#fff' : SUSU.inkSoft,
      padding: '3px 8px', borderRadius: 10,
      fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700,
      cursor: 'pointer',
    }}>{children}</button>
  );
}

window.Bubble = Bubble;
window.InspirationPanel = InspirationPanel;
window.OCRMarquee = OCRMarquee;
window.OCRProgress = OCRProgress;
window.MarkdownCard = MarkdownCard;
window.MiniBtn = MiniBtn;
window.IconBtn = IconBtn;
