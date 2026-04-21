// Timeline view — unified feed of captures + notes, grouped by day

const SAMPLE_TIMELINE = [
  { day: 'today', date: 'Apr 21', items: [
    { type: 'note', time: '14:22', text: 'design tokens for susubuddy should avoid saturations above 0.02 for whites — keep peaches, pinks, creams in the same hue family', tags: ['#design'] },
    { type: 'capture', time: '13:48', title: 'GlobalProtect manual install',
      preview: 'To manually install Palo Alto GlobalProtect, go to the portal page and download the appropriate agent for your OS…',
      source: 'ringcentral.freshservice.com', chars: 1247 },
    { type: 'note', time: '11:10', text: 'idea: mochi reacts when clipboard changes — little giggle if it\'s a URL', tags: ['#idea', '#susu'] },
    { type: 'capture', time: '09:32', title: 'React 18.3 concurrent features',
      preview: '# useTransition\nLets you update the state without blocking the UI.\n\n```jsx\nconst [isPending, startTransition] = useTransition();\n```',
      source: 'react.dev', chars: 842 },
  ]},
  { day: 'yesterday', date: 'Apr 20', items: [
    { type: 'note', time: '20:04', text: 'book rec from jian — "the shape of design" by frank chimero', tags: ['#reading'] },
    { type: 'capture', time: '16:15', title: 'Tailwind v4 migration notes',
      preview: '## Breaking changes\n- CSS-first config\n- @import "tailwindcss" replaces @tailwind directives\n- Opacity modifiers simplified',
      source: 'tailwindcss.com', chars: 2104 },
    { type: 'note', time: '10:20', text: 'mom called — dinner saturday at 6', tags: ['#life'] },
  ]},
  { day: 'wednesday', date: 'Apr 19', items: [
    { type: 'capture', time: '15:40', title: 'oklch color ranges for warm pastels',
      preview: '- cream: oklch(0.97 0.02 80)\n- peach: oklch(0.88 0.08 60)\n- pink: oklch(0.84 0.08 20)',
      source: 'oklch.com', chars: 412 },
  ]},
];

function TimelineWindow({ style = {}, highlight = null }) {
  return (
    <div style={{
      background: SUSU.surface,
      borderRadius: 14,
      boxShadow: '0 16px 48px rgba(74,58,50,0.18), 0 2px 6px rgba(74,58,50,0.08)',
      border: `1px solid ${SUSU.line}`,
      fontFamily: 'Nunito, sans-serif',
      color: SUSU.ink,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}>
      <TimelineHeader />
      <TimelineToolbar />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <TimelineSidebar />
        <TimelineFeed highlight={highlight} />
      </div>
    </div>
  );
}

function TimelineHeader() {
  return (
    <div style={{
      height: 44, background: SUSU.surfaceDim,
      borderBottom: `1px solid ${SUSU.line}`,
      display: 'flex', alignItems: 'center', padding: '0 14px',
      gap: 10,
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#FFB8B8' }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#FFD8B5' }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#C9E4D2' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Mochi mood="idle" size={22} palette="peach" animated={false} />
        <span style={{ fontSize: 13, fontWeight: 700, color: SUSU.ink }}>susubuddy</span>
        <span style={{ fontSize: 11, color: SUSU.inkMuted }}>· your little archive</span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: SUSU.inkMuted }}>
        142 captures · 68 notes
      </div>
    </div>
  );
}

function TimelineToolbar() {
  return (
    <div style={{
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
      borderBottom: `1px solid ${SUSU.line}`,
    }}>
      <div style={{
        flex: 1, position: 'relative',
        background: SUSU.surfaceDim, borderRadius: 10,
        padding: '7px 12px 7px 32px',
        fontSize: 12.5, color: SUSU.inkMuted,
      }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6"
          style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="5.5" cy="5.5" r="3.5" /><path d="M8 8l3 3" strokeLinecap="round" />
        </svg>
        search captures and ideas…
      </div>
      <FilterChip active>all</FilterChip>
      <FilterChip>✨ captures</FilterChip>
      <FilterChip>💭 ideas</FilterChip>
      <FilterChip>#tags</FilterChip>
    </div>
  );
}

function FilterChip({ children, active }) {
  return (
    <button style={{
      border: `1px solid ${active ? SUSU.accent : SUSU.line}`,
      background: active ? SUSU.accentSoft : 'transparent',
      color: active ? SUSU.peachDeep : SUSU.inkSoft,
      padding: '5px 11px', borderRadius: 12,
      fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}

function TimelineSidebar() {
  return (
    <div style={{
      width: 150, borderRight: `1px solid ${SUSU.line}`,
      padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3,
      background: SUSU.surfaceDim,
    }}>
      <SideLink active>📚 all</SideLink>
      <SideLink>⭐ starred</SideLink>
      <SideLink>🌱 recent</SideLink>
      <div style={{ padding: '14px 10px 6px', fontSize: 10, fontWeight: 700, color: SUSU.inkMuted, letterSpacing: 0.6 }}>TAGS</div>
      <SideLink>#design <Dot /></SideLink>
      <SideLink>#reading</SideLink>
      <SideLink>#susu</SideLink>
      <SideLink>#idea</SideLink>
      <SideLink>#life</SideLink>
      <div style={{ flex: 1 }} />
      <div style={{
        padding: 10, background: SUSU.surface, borderRadius: 10,
        fontSize: 11, color: SUSU.inkSoft, textAlign: 'center', border: `1px solid ${SUSU.line}`,
      }}>
        <Mochi mood="happy" size={36} palette="peach" animated={false} style={{ margin: '0 auto 6px' }} />
        <div style={{ fontWeight: 700, color: SUSU.ink, marginBottom: 2 }}>7-day streak ✨</div>
        <div>keep going!</div>
      </div>
    </div>
  );
}

function SideLink({ children, active }) {
  return (
    <div style={{
      padding: '6px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
      color: active ? SUSU.peachDeep : SUSU.inkSoft,
      background: active ? SUSU.accentSoft : 'transparent',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>{children}</div>
  );
}

function Dot() { return <span style={{ width: 5, height: 5, background: SUSU.accent, borderRadius: 3 }} />; }

function TimelineFeed({ highlight }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '18px 24px' }}>
      {SAMPLE_TIMELINE.map((group) => (
        <div key={group.day} style={{ marginBottom: 22 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12,
            paddingBottom: 6, borderBottom: `1px dashed ${SUSU.line}`,
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: SUSU.ink }}>{group.day}</span>
            <span style={{ fontSize: 11, color: SUSU.inkMuted, fontFamily: 'JetBrains Mono, monospace' }}>{group.date}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 10, color: SUSU.inkMuted }}>{group.items.length} items</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
            {group.items.map((item, i) => (
              <TimelineItem key={i} item={item} highlighted={highlight && item.title === highlight} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineItem({ item, highlighted }) {
  if (item.type === 'capture') {
    return (
      <div style={{
        display: 'flex', gap: 12,
        background: highlighted ? SUSU.accentSoft : SUSU.surface,
        border: `1px solid ${highlighted ? SUSU.accent : SUSU.line}`,
        borderRadius: 12, padding: '12px 14px',
        boxShadow: highlighted ? '0 4px 14px rgba(232,145,107,0.22)' : 'none',
      }}>
        <div style={{ flexShrink: 0, width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 14 }}>✨</div>
          <div style={{ fontSize: 9.5, color: SUSU.inkMuted, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>{item.time}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: SUSU.ink }}>{item.title}</span>
            <span style={{ fontSize: 10.5, color: SUSU.inkMuted, fontFamily: 'JetBrains Mono, monospace' }}>{item.source}</span>
          </div>
          <div style={{
            fontSize: 12, lineHeight: 1.55, color: SUSU.inkSoft,
            fontFamily: 'JetBrains Mono, monospace',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          }}>{item.preview}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 10.5, color: SUSU.inkMuted }}>
            <span>{item.chars} chars</span>
            <span>·</span>
            <span style={{ color: SUSU.accent, fontWeight: 700 }}>markdown</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      display: 'flex', gap: 12,
      background: highlighted ? SUSU.pinkSoft : '#FFF9F0',
      border: `1px solid ${SUSU.line}`, borderRadius: 12, padding: '11px 14px',
    }}>
      <div style={{ flexShrink: 0, width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 14 }}>💭</div>
        <div style={{ fontSize: 9.5, color: SUSU.inkMuted, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>{item.time}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: SUSU.ink }}>{item.text}</div>
        {item.tags && (
          <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
            {item.tags.map((t) => (
              <span key={t} style={{
                fontSize: 10.5, fontWeight: 700, padding: '1px 7px',
                background: SUSU.accentSoft, color: SUSU.peachDeep, borderRadius: 8,
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

window.TimelineWindow = TimelineWindow;
