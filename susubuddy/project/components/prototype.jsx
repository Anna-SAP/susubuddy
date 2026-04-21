// The interactive prototype scene — a blurred desktop with susubuddy live in the corner.
// Buddy cycles through states: idle → click → capture → ocr → result → idle.
// Also supports inspiration mode via a separate button / right-click.

const PROTO_STATES = {
  idle: { mood: 'idle', label: 'click me ✨' },
  menu: { mood: 'happy', label: 'what do you need?' },
  capturing: { mood: 'focused', label: 'drag to capture…' },
  processing: { mood: 'focused', label: 'reading…' },
  done: { mood: 'celebrating', label: 'saved ✨' },
  inspiration: { mood: 'excited', label: 'tell me!' },
  saved: { mood: 'happy', label: 'saved 💭' },
  sleepy: { mood: 'sleepy', label: 'zzz…' },
  grumpy: { mood: 'grumpy', label: 'let me focus' },
};

function PrototypeScene({ palette = 'peach', width = 1280, height = 800, startState = 'idle' }) {
  const [state, setState] = React.useState(startState);
  const [progress, setProgress] = React.useState(0);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [lastCapture, setLastCapture] = React.useState(null);
  const [libraryOpen, setLibraryOpen] = React.useState(false);

  // Auto-advance the OCR pipeline
  React.useEffect(() => {
    if (state !== 'processing') return;
    setProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += 0.08 + Math.random() * 0.05;
      if (p >= 1) {
        clearInterval(t);
        setProgress(1);
        setLastCapture({
          title: 'GlobalProtect — manual install',
          source: 'ringcentral.freshservice.com',
          chars: 624,
          lines: [
            '# GlobalProtect — manual install',
            '',
            '> captured Apr 21, 14:22',
            '',
            'To manually install Palo Alto GlobalProtect, go to the portal page and',
            'download the appropriate agent for your OS:',
            '',
            '- Windows 64-bit GlobalProtect agent',
            '- Mac 32/64-bit GlobalProtect agent',
            '',
            'After installation, configure the portal address and click Connect.',
          ],
        });
        setTimeout(() => setState('done'), 350);
      } else setProgress(p);
    }, 180);
    return () => clearInterval(t);
  }, [state]);

  // After celebrating for a moment, drift back to idle
  React.useEffect(() => {
    if (state === 'done' || state === 'saved') {
      const t = setTimeout(() => setState('idle'), 3800);
      return () => clearTimeout(t);
    }
  }, [state]);

  const onBuddyClick = () => {
    if (state === 'idle' || state === 'sleepy') {
      setMenuOpen((o) => !o);
      setState('menu');
    } else {
      setMenuOpen(false);
      setState('idle');
    }
  };

  const s = PROTO_STATES[state];

  return (
    <div style={{
      width, height, position: 'relative', overflow: 'hidden',
      fontFamily: 'Nunito, sans-serif',
      userSelect: 'none',
    }}>
      {/* Blurred desktop background */}
      <DesktopBg />

      {/* Ghost apps behind */}
      <GhostApp top={60} left={120} w={520} h={320} />
      <GhostApp top={130} right={160} w={480} h={300} tilt={-1} opacity={0.45} />
      <GhostApp bottom={120} left={280} w={600} h={260} tilt={0.5} opacity={0.35} />

      {/* Foreground: a slightly more visible "focused" window the user is reading */}
      <FocusedBrowser width={width * 0.58} height={height * 0.66} top={90} left={(width - width*0.58)/2} dim={state === 'capturing'} />

      {/* Capture marquee — appears only during capturing */}
      {state === 'capturing' && (
        <OCRMarquee x={(width - 560)/2 + 40} y={140} w={520} h={340} label="release to save" />
      )}

      {/* Taskbar */}
      <Taskbar />

      {/* The buddy lives bottom-right, above tray */}
      <div style={{
        position: 'absolute', right: 28, bottom: 58,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
        zIndex: 20,
      }}>

        {/* Processing card above buddy */}
        {state === 'processing' && (
          <OCRProgress progress={progress}
            stage={progress < 0.35 ? 'framing the area…' : progress < 0.7 ? 'reading characters…' : 'tidying into markdown…'} />
        )}

        {/* Result card above buddy */}
        {state === 'done' && lastCapture && (
          <MarkdownCard
            title={lastCapture.title}
            lines={lastCapture.lines}
            sources={1}
            chars={lastCapture.chars}
            style={{ width: 360 }}
          />
        )}

        {/* Inspiration panel */}
        {state === 'inspiration' && (
          <InspirationPanel
            onClose={() => { setState('saved'); }}
            initialValue=""
            withTags
          />
        )}

        {/* Saved toast */}
        {state === 'saved' && (
          <div style={{
            background: SUSU.mint, color: '#2C5F3F',
            padding: '8px 14px', borderRadius: 14, fontSize: 12.5, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(122, 185, 143, 0.35)',
          }}>saved to your archive 💭</div>
        )}

        {/* Little action menu that appears when buddy is clicked */}
        {menuOpen && state === 'menu' && (
          <ActionMenu
            onCapture={() => { setMenuOpen(false); setState('capturing'); setTimeout(() => setState('processing'), 1600); }}
            onInspiration={() => { setMenuOpen(false); setState('inspiration'); }}
            onArchive={() => { setMenuOpen(false); setLibraryOpen(true); setState('idle'); }}
            onClose={() => { setMenuOpen(false); setState('idle'); }}
          />
        )}

        {/* Label / speech hint for idle states */}
        {(state === 'idle' || state === 'menu' || state === 'capturing') && !menuOpen && (
          <div style={{
            background: 'rgba(58, 42, 36, 0.85)', color: '#FFF',
            padding: '5px 11px', borderRadius: 12, fontSize: 11.5, fontWeight: 600,
            marginBottom: 4,
          }}>{s.label}</div>
        )}

        {/* The buddy */}
        <div
          onClick={onBuddyClick}
          style={{
            cursor: 'pointer', position: 'relative',
            padding: 6, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
          }}
        >
          <Mochi mood={s.mood} size={96} palette={palette} />
          {/* subtle glow when something is pending */}
          {(state === 'processing' || state === 'capturing') && (
            <div style={{
              position: 'absolute', inset: -6, borderRadius: '50%',
              border: `2px dashed ${SUSU.accent}`,
              animation: 'susu-spin 6s linear infinite', pointerEvents: 'none',
            }} />
          )}
        </div>

        {/* Tiny always-visible quick-actions dock (paperclip for drag inspiration) */}
        {!menuOpen && state === 'idle' && (
          <div style={{
            position: 'absolute', right: 110, bottom: 8,
            display: 'flex', flexDirection: 'column', gap: 6,
            opacity: 0.0, /* hidden until buddy hover */
          }} />
        )}
      </div>

      {/* Library window overlay */}
      {libraryOpen && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(58,42,36,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30,
        }} onClick={() => setLibraryOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <TimelineWindow style={{ width: 860, height: 580 }} />
          </div>
        </div>
      )}

      <style>{`@keyframes susu-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function ActionMenu({ onCapture, onInspiration, onArchive, onClose }) {
  return (
    <div style={{
      background: SUSU.surface, borderRadius: 16,
      boxShadow: '0 12px 36px rgba(74,58,50,0.22)',
      border: `1px solid ${SUSU.line}`,
      padding: 6, minWidth: 220,
      fontFamily: 'Nunito, sans-serif',
    }}>
      <MenuRow icon="✨" label="capture something" kbd="⌘⇧S" onClick={onCapture} />
      <MenuRow icon="💭" label="quick thought" kbd="⌘⇧N" onClick={onInspiration} />
      <MenuRow icon="📚" label="open archive" kbd="⌘⇧L" onClick={onArchive} />
      <div style={{ height: 1, background: SUSU.line, margin: '4px 6px' }} />
      <MenuRow icon="🌙" label="focus mode" kbd="⌘⇧." subtle />
      <MenuRow icon="⚙" label="settings" subtle />
    </div>
  );
}

function MenuRow({ icon, label, kbd, onClick, subtle }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', border: 'none', background: 'transparent',
      padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
      color: subtle ? SUSU.inkSoft : SUSU.ink,
      textAlign: 'left',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = SUSU.surfaceDim)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {kbd && <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: SUSU.inkMuted,
        background: SUSU.surfaceDim, padding: '2px 6px', borderRadius: 5,
      }}>{kbd}</span>}
    </button>
  );
}

// A "focused" browser window mockup (higher fidelity than GhostApp) — this is
// what the user is reading when they trigger a capture.
function FocusedBrowser({ top, left, width, height, dim }) {
  return (
    <div style={{
      position: 'absolute', top, left, width, height,
      background: SUSU.surface, borderRadius: 10,
      boxShadow: '0 12px 36px rgba(74,58,50,0.14), 0 2px 6px rgba(74,58,50,0.06)',
      border: `1px solid ${SUSU.line}`,
      overflow: 'hidden',
      opacity: dim ? 0.85 : 1,
      transition: 'opacity .25s',
    }}>
      {/* tab bar */}
      <div style={{ height: 32, background: SUSU.surfaceDim, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, borderBottom: `1px solid ${SUSU.line}` }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#FFB8B8' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#FFD8B5' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#C9E4D2' }} />
        </div>
        <div style={{
          flex: 1, height: 20, background: SUSU.surface, borderRadius: 10,
          padding: '0 10px', display: 'flex', alignItems: 'center',
          fontSize: 10, color: SUSU.inkMuted, fontFamily: 'JetBrains Mono, monospace',
        }}>
          ringcentral.freshservice.com/support/freddy
        </div>
      </div>
      {/* content */}
      <div style={{ padding: '24px 32px', fontFamily: 'Nunito, sans-serif', color: SUSU.ink, fontSize: 14, lineHeight: 1.65 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Install GlobalProtect manually</div>
        <div style={{ color: SUSU.inkSoft, marginBottom: 14 }}>
          To manually install Palo Alto GlobalProtect, go to the portal page and download the appropriate agent for your OS.
        </div>
        <ul style={{ paddingLeft: 22, margin: '10px 0', color: SUSU.inkSoft }}>
          <li style={{ marginBottom: 4 }}>Windows 64-bit GlobalProtect agent</li>
          <li style={{ marginBottom: 4 }}>Mac 32/64-bit GlobalProtect agent</li>
        </ul>
        <div style={{ color: SUSU.inkSoft, marginBottom: 14 }}>
          After installation, configure the portal address as <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: SUSU.peachDeep }}>sslvpn.rcoffice.online:6443</span>, click Connect, and complete Okta authentication. Do not close the browser page until GP connects successfully.
        </div>
        <div style={{ color: SUSU.inkMuted, fontSize: 12 }}>If you're still having trouble, let me know or create a ticket.</div>
      </div>
    </div>
  );
}

window.PrototypeScene = PrototypeScene;
window.ActionMenu = ActionMenu;
window.FocusedBrowser = FocusedBrowser;
