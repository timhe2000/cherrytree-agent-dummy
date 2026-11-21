import {
  useState,
  useEffect,
  useRef,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { usePageMeta } from '../hooks/usePageMeta.ts';
import MarketingNav from '../components/MarketingNav.tsx';
import MarketingFooter from '../components/MarketingFooter.tsx';
import MarketingGrain from '../components/MarketingGrain.tsx';
import { goToDashboard } from '../utils/goToDashboard.ts';
import { MARKETING_PLANS } from '../constants/pricing.ts';
import PlanCards from '../components/PlanCards.tsx';
import ScrollLitStatement from '../components/ScrollLitStatement.tsx';
import ProtectCta from '../components/ProtectCta.tsx';
import ButtonArrow from '../components/ButtonArrow.tsx';
import { smoothScrollTo } from '../hooks/useSmoothScroll.ts';

type Timer = ReturnType<typeof setTimeout>;

// ── Panel sub-components ───────────────────────────────────────────────────────

const S1_QUESTION = 'What are you building?';
const S1_ANSWER =
  "We're building Cherrytree, an app that helps founders write their cofounder agreements. " +
  "Avery and I started it last spring. I'm CEO, Avery runs product as CTO, and we're both " +
  "full-time. We're thinking 60/40 since I put in the first $20k.";
const S1_ANSWER_MS = 900;
const S1_CHAR_MS = 28;
const S1_HOLD_MS = 2800;

// The question, then the founder's answer typing itself out on the right, line by line like a doc.
function PanelBrainDump() {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    const timers: Timer[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const run = () => {
      setTyped(0);
      for (let i = 1; i <= S1_ANSWER.length; i++) {
        t(() => setTyped(i), S1_ANSWER_MS + i * S1_CHAR_MS);
      }
      t(run, S1_ANSWER_MS + S1_ANSWER.length * S1_CHAR_MS + S1_HOLD_MS);
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="lp-fp" style={{ backgroundImage: "url('/images/ambient.png?v=2')" }}>
      <div className="lp-fp-overlay" />
      <div className="lp-fp-white">
        <div className="lp-fp-content lp-fp-center">
          <div className="lp-s1-chat">
            <p className="lp-s1-q">{S1_QUESTION}</p>
            {/* The full answer, hidden, holds the space so the question stays put as it types. */}
            <p className="lp-s1-answer">
              <span className="lp-s1-ghost" aria-hidden="true">
                {S1_ANSWER}
              </span>
              <span className="lp-s1-typed">
                {S1_ANSWER.slice(0, typed)}
                <span className="lp-icursor lp-dark" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const S2_MSGS = [
  {
    text: 'You mentioned putting in the first $20k. Was that for equity, or a loan to the company?',
    bot: true,
  },
  { text: "For equity. It's part of why I'm at 60%.", bot: false },
  {
    text: 'Got it. If someone leaves in the first year, what happens to their unvested shares?',
    bot: true,
  },
  { text: 'They go back to the company.', bot: false },
];

function PanelFollowUps() {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const timers: Timer[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const show = (i: number) => {
      if (i >= S2_MSGS.length) {
        t(() => {
          setShown(0);
          show(0);
        }, 2200);
        return;
      }
      if (S2_MSGS[i]!.bot) {
        setTyping(true);
        t(() => {
          setTyping(false);
          setShown(i + 1);
          t(() => show(i + 1), 1600);
        }, 1100);
      } else {
        setShown(i + 1);
        t(() => show(i + 1), 1200);
      }
    };
    t(() => show(0), 400);
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="lp-fp" style={{ backgroundImage: "url('/images/wall.png?v=2')" }}>
      <div className="lp-fp-overlay" />
      <div className="lp-fp-white">
        <div className="lp-fp-content">
          <div className="lp-fu-card">
            <div className="lp-fu-head">
              <div className="lp-fu-avatar">C</div>
              <div>
                <div className="lp-fu-name">Cherrytree</div>
                <div className="lp-fu-role">Following up on your answers</div>
              </div>
            </div>
            <div className="lp-fu-msgs">
              {S2_MSGS.slice(0, shown).map((m, i) => (
                <div key={i} className={`lp-fu-msg${m.bot ? '' : ' user'}`}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="lp-fu-typing">
                  <div className="lp-fu-dot" />
                  <div className="lp-fu-dot" />
                  <div className="lp-fu-dot" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// The agreement types itself out: preamble, background, then two sections.
const S3_BLOCKS = [
  {
    kind: 'p',
    text: 'This Agreement is made between Steve Bobs and Avery Dates (the "Cofounders") of Cherrytree, Inc. (the "Company").',
  },
  { kind: 'h', text: 'Background' },
  {
    kind: 'p',
    text: 'Cherrytree, Inc. is a Delaware corporation that helps startup founders create cofounder agreements. The Cofounders want to record how ownership and decisions are shared between them.',
  },
  { kind: 'h', text: '1. Equity' },
  {
    kind: 'p',
    text: "The Company's shares are allocated 60% to Steve Bobs and 40% to Avery Dates.",
  },
  { kind: 'h', text: '2. Vesting' },
  {
    kind: 'p',
    text: 'Shares vest monthly over four years. Unvested shares return to the Company if a Cofounder leaves.',
  },
].reduce<{ kind: string; text: string; start: number }[]>((blocks, b) => {
  const prev = blocks[blocks.length - 1];
  blocks.push({ ...b, start: prev ? prev.start + prev.text.length : 0 });
  return blocks;
}, []);
const S3_TOTAL = S3_BLOCKS.reduce((n, b) => n + b.text.length, 0);
const S3_CHAR_MS = 14;
const S3_START_MS = 600; // pause on the title before the first character
const S3_CLASS: Record<string, string> = { h: 'lp-dr-h', p: 'lp-dr-p' };

function PanelDraft() {
  const [typed, setTyped] = useState(0);
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const timers: Timer[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const run = () => {
      setTyped(0);
      setCycle((c) => c + 1);
      for (let i = 1; i <= S3_TOTAL; i++) t(() => setTyped(i), S3_START_MS + i * S3_CHAR_MS);
      t(run, S3_START_MS + S3_TOTAL * S3_CHAR_MS + 2600);
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const ready = typed === S3_TOTAL;
  const visible = S3_BLOCKS.filter((b) => typed > b.start);
  return (
    <div className="lp-fp" style={{ backgroundImage: "url('/images/leaf.png?v=2')" }}>
      <div className="lp-fp-overlay" />
      <div className="lp-fp-white">
        <div className="lp-fp-content">
          <div className="lp-dr-paper">
            <div key={cycle} className="lp-dr-head">
              <div className="lp-dr-doc-title">Cofounder Agreement</div>
              <div className="lp-dr-doc-sub">Cherrytree, Inc.</div>
            </div>
            {visible.map((b, i) => {
              const Tag = b.kind === 'h' ? 'h4' : 'p';
              return (
                <Tag key={b.start} className={S3_CLASS[b.kind]}>
                  {b.text.slice(0, typed - b.start)}
                  {i === visible.length - 1 && !ready && <span className="lp-icursor lp-dark" />}
                </Tag>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const S4_SIGNERS = ['Steve Bobs', 'Avery Dates'];
// Abstract agreement: each group is a heading bar followed by text lines (widths in %).
const S4_DOC = [
  [92, 100, 84, 60],
  [100, 96, 72],
  [88, 100, 54],
];
const S4_EDITED = '1-1'; // group-line that gets edited before signing

// The agreement is reviewed (one line edited), then each cofounder's signature writes itself in.
function PanelSign() {
  // 0 draft, 1 edited, 2 first signature, 3 second signature
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers: Timer[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const run = () => {
      setPhase(0);
      [700, 1900, 3000].forEach((ms, i) => t(() => setPhase(i + 1), ms));
      t(run, 6200);
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="lp-fp" style={{ backgroundImage: "url('/images/paper.png?v=2')" }}>
      <div className="lp-fp-overlay" />
      <div className="lp-fp-white">
        <div className="lp-fp-content">
          <div className="lp-sg-card">
            <div className="lp-sg-title">Cofounder Agreement</div>
            <div className="lp-sg-doc" aria-hidden="true">
              {S4_DOC.map((lines, g) => (
                <div key={g} className="lp-sg-group">
                  <div className="lp-sg-line h" />
                  {lines.map((w, l) => (
                    <div
                      key={l}
                      className={`lp-sg-line${phase >= 1 && `${g}-${l}` === S4_EDITED ? ' edited' : ''}`}
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="lp-sg-sigs">
              {S4_SIGNERS.map((name, i) => {
                const signed = phase >= i + 2;
                return (
                  <div key={name} className={`lp-sg-sig${signed ? ' signed' : ''}`}>
                    {signed && <span className="lp-sg-ink">{name}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PANELS: readonly ComponentType[] = [PanelBrainDump, PanelFollowUps, PanelDraft, PanelSign];

const AGREEMENT_SECTIONS = [
  {
    tab: 'coverage',
    title: 'Covers everything that matters.',
    desc: 'One complete agreement across 10 sections, from equity and roles to IP and non-competes.',
    wide: true,
  },
  {
    tab: 'conversations',
    title: 'No awkward convos later.',
    desc: 'The hard topics get settled now, while everyone still gets along.',
  },
  {
    tab: 'clarity',
    title: 'Clear from day one.',
    desc: 'Who owns what, who does what, who decides what, all in writing.',
  },
  {
    tab: 'protection',
    title: 'Ready for anything.',
    desc: 'If someone leaves, steps back or stops pulling their weight, you already know what happens.',
  },
  {
    tab: 'ease',
    title: 'Done in one sitting.',
    desc: 'Answer in your own words, review the draft and sign. No weeks of back-and-forth with a lawyer.',
  },
] as const;

const AG_COVERAGE = [
  'Formation & purpose',
  'Cofounders & roles',
  'Equity allocation',
  'Vesting',
  'Decision-making',
  'Intellectual property',
  'Compensation & expenses',
  'Performance expectations',
  'Non-compete & non-solicit',
  'General provisions',
];

// Panel color behind each section's example, in the same order as AGREEMENT_SECTIONS.
// Muted tints drawn from the blossom painting: hill sage, blossom, cloud, sky, meadow — ordered so
// warm and cool tones alternate across the bento grid rather than splitting by row.
const AG_TINTS = ['#c6d0c1', '#e4d4d1', '#e6e1d8', '#ccd6df', '#d0d3b6'] as const;

const agRow = (label: string, value: string) => (
  <div className="lp-agv-row">
    <span>{label}</span>
    <b>{value}</b>
  </div>
);

// Share kept per half-year over four years: nothing during year 1, 25% at the cliff, then up to 100%.
const AG_VEST = [0, 0, 25, 40, 55, 70, 85, 100];

// Calendar for "done in one sitting": signed on the day you start vs. weeks of lawyer back-and-forth.
const AG_CAL_DAYS = 28; // four Monday-start weeks
const AG_CAL_START = 3; // signed with Cherrytree the same day
const AG_CAL_LAWYER_END = 24; // where the lawyer route would land
const agCalClass = (day: number) => {
  const range = day >= AG_CAL_START && day <= AG_CAL_LAWYER_END;
  return [
    'lp-agv-cal-day',
    range && 'range',
    range && (day === AG_CAL_START || day % 7 === 1) && 'start',
    range && (day === AG_CAL_LAWYER_END || day % 7 === 0) && 'end',
    day === AG_CAL_START && 'signed',
    day === AG_CAL_LAWYER_END && 'lawyer',
  ]
    .filter(Boolean)
    .join(' ');
};

// One small example visual per agreement section, in the same order as AGREEMENT_SECTIONS.
const AG_VISUALS: readonly ReactNode[] = [
  <>
    <div className="lp-agv-list">
      {AG_COVERAGE.map((item, i) => (
        <span key={item} style={{ '--i': i } as CSSProperties}>
          <b className="lp-agv-check">✓</b> {item}
        </span>
      ))}
    </div>
  </>,
  <div className="lp-agv-stack" role="img" aria-label="The hard topics, settled">
    {['Who has the final say?', 'Who gets what?', 'What if someone leaves?'].map((topic, i) => (
      <div key={topic} className={`lp-agv-card c${i}`}>
        <span>{topic}</span>
        {i === 2 && <b className="lp-agv-stamp">Settled</b>}
      </div>
    ))}
  </div>,
  <>
    <div className="lp-agv-bar">
      <div className="lp-agv-seg dark" style={{ flex: 60 }}>
        <span>Steve Bobs</span>
        <b>60%</b>
      </div>
      <div className="lp-agv-seg light" style={{ flex: 40 }}>
        <span>Avery Dates</span>
        <b>40%</b>
      </div>
    </div>
    <div className="lp-agv-gap" />
    {agRow('Roles', 'CEO · CTO')}
    {agRow('Major decisions', 'Both cofounders')}
  </>,
  <div className="lp-agv-vest">
    <div className="lp-agv-cols">
      {AG_VEST.map((pct, i) => (
        <div
          key={i}
          className={`lp-agv-col${pct === 0 ? ' none' : ''}${i === 2 ? ' cliff' : ''}`}
          style={{ height: `${Math.max(pct, 4)}%`, '--i': i } as CSSProperties}
        />
      ))}
    </div>
    <div className="lp-agv-axis">
      {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((y) => (
        <span key={y}>{y}</span>
      ))}
    </div>
  </div>,
  <div className="lp-agv-cal">
    <div className="lp-agv-cal-grid">
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
        <span key={i} className="lp-agv-cal-dow">
          {d}
        </span>
      ))}
      {Array.from({ length: AG_CAL_DAYS }, (_, i) => i + 1).map((day) => (
        <div
          key={day}
          className={agCalClass(day)}
          style={{ '--i': day - AG_CAL_START } as CSSProperties}
        >
          <span>{day}</span>
        </div>
      ))}
    </div>
    <div className="lp-agv-cal-key">
      <span>
        <i className="dot" /> Cherrytree: same day
      </span>
      <span>
        <i className="band" /> Lawyers: weeks
      </span>
    </div>
  </div>,
];

const V2_STEPS = 4;

const FEATURES = [
  {
    num: '01',
    panel: 0,
    title: 'Just brain dump',
    desc: "No rigid form. Talk through your company in your own words, from who's involved to how you think about equity, and Cherrytree pulls out what matters.",
    short: 'Answer in your own words. We pull out what matters.',
  },
  {
    num: '02',
    panel: 1,
    title: 'Smart follow-ups',
    desc: "Questions adapt to what you've said. Cherrytree asks follow-ups only where something is missing or unclear, so nothing important slips through.",
    short: 'Follow-up questions based on your answers, so nothing gets missed.',
  },
  {
    num: '03',
    panel: 2,
    title: 'We draft it',
    desc: 'Cherrytree turns your answers into a complete Cofounder Agreement covering equity, vesting, roles, IP and decision-making.',
    short: 'We turn your answers into a complete agreement. Every section covered.',
  },
  {
    num: '04',
    panel: 3,
    title: 'Review and sign',
    desc: "Read through your draft, edit anything you want, and sign when everyone's on the same page.",
    short: 'Change anything with a click and sign in minutes. No back-and-forth.',
  },
];

// Section titles whose words light up one by one as they scroll up the screen.
const LIT_PRICING =
  "Templates can't ask the right questions and lawyers can't answer them for lunch money. " +
  'Cherrytree does both.';
const LIT_LEGALESE =
  "You don't need to speak legalese to protect what you're building. You just tell your " +
  'story and we handle the rest.';
const LIT_APPLE =
  'In 1976, Steve Jobs and Steve Wozniak signed a partnership agreement in a garage. Apple came after.';

// ── Main component ─────────────────────────────────────────────────────────────

function LandingPage() {
  const navigate = useNavigate();
  usePageMeta({
    title: 'Cherrytree — Build your cofounder agreement',
    description:
      'Answer guided questions and get a complete Cofounder Agreement. No sketchy templates or overpriced lawyers.',
  });

  const [v2Feature, setV2Feature] = useState(0);
  // How it works: the scene and titles stay pinned while the page scrolls through a tall track;
  // how far through the pinned stretch you are picks the step.
  const v2TrackRef = useRef<HTMLDivElement>(null);
  const v2StickyRef = useRef<HTMLDivElement>(null);
  // Where the pinned stretch starts (page scroll position) and how long it lasts.
  const v2PinRange = () => {
    const track = v2TrackRef.current;
    const sticky = v2StickyRef.current;
    if (!track || !sticky) return null;
    const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
    const start = track.getBoundingClientRect().top + window.scrollY - stickyTop;
    return { start, length: track.offsetHeight - sticky.offsetHeight };
  };
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = v2PinRange();
      if (!range) return;
      const progress =
        range.length > 0
          ? Math.min(1, Math.max(0, (window.scrollY - range.start) / range.length))
          : 0;
      setV2Feature(Math.min(V2_STEPS - 1, Math.floor(progress * V2_STEPS)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  // Clicking a step title scrolls to where that step shows.
  const scrollToV2Step = (i: number) => {
    const range = v2PinRange();
    if (!range) return;
    window.scrollTo({
      top: range.start + ((i + 0.5) / V2_STEPS) * range.length,
      behavior: 'smooth',
    });
  };

  const { hash } = useLocation();
  // Arriving at a section link (the nav's "How it works" from another page) skips the painting's slow
  // entrance, which is for opening the page at the top; otherwise it would sit blank for a moment.
  const [arrivedAtSection] = useState(() => hash !== '');

  const goDash = () => goToDashboard(navigate);

  // Arriving as /#section (the nav's "How it works") — ResetPagePosition has just scrolled to the
  // top, so scroll to the target section after it. Then drop the hash so a refresh opens at the top.
  useEffect(() => {
    const id = hash.replace('#', '');
    if (!id) return;
    const target = document.getElementById(id);
    if (target) smoothScrollTo(target);
    navigate({ hash: '' }, { replace: true });
  }, [hash, navigate]);

  // Scroll reveal — fades/slides in each .lp-rv/.lp-rv-l/.lp-rv-r element once as it enters view.
  // Elements already in the viewport at observe() time can have their IntersectionObserver
  // callback fire before the browser has committed a style pass with the base (opacity:0)
  // styles, which causes the transition to opacity:1 to never run (position:sticky elements
  // are especially prone to this — a synchronous reflow read isn't enough to flush their
  // state). Deferring the class add to a fresh macrotask guarantees a real paint of the
  // "from" state happens first, regardless of the element's positioning scheme.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.lp-rv, .lp-rv-l, .lp-rv-r');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          if (entry.isIntersecting && target instanceof HTMLElement) {
            obs.unobserve(target);
            void target.offsetHeight;
            setTimeout(() => target.classList.add('lp-rv-in'), 0);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const V2Panel = PANELS[FEATURES[v2Feature]!.panel]!;

  return (
    <div className="lp lp-has-curtain">
      <MarketingGrain />
      <MarketingNav />

      {/* The page sits on a raised "curtain" with a rounded bottom that scrolls up to reveal the
          footer pinned behind it. */}
      <div className="lp-curtain">
        {/* ── Hero ── */}
        {/* The hero text stays put; the sheet below slides up over it. */}
        <section className="lp-hero lp-hero-pinned">
          <h1 className="lp-hero-headline">
            <span className="lp-hl-line">
              <span className="lp-hl-inner">Great companies start</span>
            </span>
            <span className="lp-hl-line">
              <span className="lp-hl-inner">with great company.</span>
            </span>
          </h1>
          <p className="lp-hero-sub">
            Answer guided questions and get a complete Cofounder Agreement. No sketchy templates or
            overpriced lawyers.
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={goDash}>
              <span className="lp-btn-label">Get started</span>
              <ButtonArrow />
            </button>
          </div>
        </section>

        {/* ── Features v2 (draft — for comparison with the section above) ── */}
        {/* Everything after the hero rides on one sheet that slides up over the hero text. */}
        <div className="lp-sheet">
          {/* The painting with its step demos sits right under the hero's button, where the product
            visual goes. */}
          <section className="lp-features lp-features-under-hero" id="features-v2">
            <div className="lp-feat-scroll lp-feat-v2-track" ref={v2TrackRef}>
              <div className="lp-feat-v2-sticky" ref={v2StickyRef}>
                <div className={`lp-feat-v2-scene${arrivedAtSection ? '' : ' lp-rv lp-d2'}`}>
                  <div className="lp-feat-v2-grain" aria-hidden="true" />
                  <V2Panel key={v2Feature} />
                </div>
                <div className="lp-feat-v2-tabs" role="tablist">
                  {FEATURES.map((f, i) => (
                    <button
                      key={f.num}
                      type="button"
                      role="tab"
                      aria-selected={v2Feature === i}
                      className={`lp-feat-v2-tab${v2Feature === i ? ' active' : ''}`}
                      onClick={() => scrollToV2Step(i)}
                    >
                      <span className="lp-feat-v2-tab-title">{f.title}</span>
                      {v2Feature === i && <span className="lp-feat-v2-tab-desc">{f.short}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── What's in your agreement ── */}
          <section className="lp-features" id="agreement">
            <div className="lp-feat-scroll">
              <div className="lp-feat-header lp-lit-header">
                <ScrollLitStatement text={LIT_LEGALESE} />
              </div>
              <div className="lp-bento">
                {AGREEMENT_SECTIONS.map((item, i) => (
                  <article
                    key={item.tab}
                    className={`lp-bento-tile lp-rv${'wide' in item ? ' lp-bento-wide' : ''}`}
                  >
                    <div
                      className="lp-bento-vis"
                      style={{ '--ag-tint': AG_TINTS[i] } as CSSProperties}
                    >
                      <div className="lp-feat-v2-grain" aria-hidden="true" />
                      <div className="lp-bento-mini">{AG_VISUALS[i]}</div>
                    </div>
                    <div className="lp-bento-copy">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── Scenarios statement ── */}
          <section className="lp-features" id="scenarios">
            <div className="lp-feat-header lp-lit-header">
              <ScrollLitStatement text={LIT_APPLE} />
            </div>
          </section>

          {/* ── Pricing: the two self-serve plans on one white card ── */}
          <section className="lp-features" id="pricing">
            <div className="lp-feat-scroll">
              <div className="lp-feat-header lp-lit-header">
                <ScrollLitStatement text={LIT_PRICING} />
              </div>
              <PlanCards plans={MARKETING_PLANS} onStart={goDash} />
            </div>
          </section>

          {/* ── Protect CTA ── */}
          <ProtectCta onStart={goDash} />
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}

export default LandingPage;
