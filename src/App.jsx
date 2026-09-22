import { useEffect, useRef, useState } from 'react';

// Edit anything in this file and the page updates instantly — no reload.
// Placeholder content: every question is a stand-in, here to show the sections.
// `options` renders pickable chips; `label` is how the answer reads in the draft.
const SECTIONS = [
  {
    name: 'Formation',
    questions: [
      {
        text: 'To start, what does your company do?',
        label: 'Business of the company',
        explainer:
          'This grounds the rest of the agreement — vesting, IP assignment, and decision rights all get interpreted in light of what the company actually does. There’s no wrong answer here, just be specific enough that the assignment and non-compete language later can point back to it.',
      },
      {
        text: 'Where is the company incorporated?',
        label: 'State of incorporation',
        options: [
          {
            value: 'Delaware',
            explainer:
              'The default for VC-backed startups — predictable corporate law, and investors will often ask you to reincorporate here anyway before a raise.',
          },
          {
            value: 'California',
            explainer:
              'Common if you’re staying small or bootstrapped, but adds its own franchise tax on top of whatever state you’re also registered in.',
          },
          {
            value: 'Not yet incorporated',
            explainer:
              'Fine for now, but equity, vesting, and IP assignment can’t actually be legally binding until there’s an entity to assign them to.',
          },
          {
            value: 'Somewhere else',
            explainer:
              'Less common for startups planning to raise — investors may ask you to reincorporate in Delaware before a priced round.',
          },
        ],
      },
    ],
  },
  {
    name: 'Equity',
    questions: [
      {
        text: 'How did you land on the equity split you have today?',
        label: 'Basis for the split',
        options: [
          {
            value: 'Even split',
            explainer:
              'Simple and signals trust, but can breed resentment if one founder ends up doing much more over time.',
          },
          {
            value: 'Based on contribution',
            explainer:
              'Feels fairer on paper, but is harder to agree on up front and even harder to revisit later without conflict.',
          },
          {
            value: 'Still deciding',
            explainer:
              'Fine to leave open, but the agreement should specify how and when you’ll actually decide — otherwise “later” tends to become “never.”',
          },
          {
            value: 'A lawyer advised us',
            explainer:
              'Worth having the underlying reasoning documented anyway — a lawyer’s suggestion still needs both founders to actually agree with it.',
          },
        ],
      },
      {
        text: 'What should happen to those shares if a founder leaves in year one?',
        label: 'Shares on early departure',
        explainer:
          'A 1-year cliff already means nothing is owed if someone leaves that early — but for anything vested, most agreements also give the company (or remaining founders) a right to repurchase those shares at cost, so equity doesn’t outlive someone’s involvement. Without that clause, a departed founder can end up owning a chunk of a company they no longer work on.',
      },
    ],
  },
  {
    name: 'Vesting',
    questions: [
      {
        text: 'What vesting schedule do you have in mind?',
        label: 'Vesting schedule',
        options: [
          {
            value: '4 years, 1-year cliff',
            explainer:
              'The startup standard — nothing vests if you leave in year one, then monthly after. Protects the company if a founder bails early.',
          },
          {
            value: '3 years, no cliff',
            explainer:
              'Vests faster and rewards commitment sooner, but gives away equity even to someone who leaves almost immediately.',
          },
          {
            value: 'Not sure yet',
            explainer:
              'Reasonable to leave open, but most investors will expect something close to the 4-year, 1-year-cliff standard before they’ll invest.',
          },
        ],
      },
      {
        text: 'Should vesting accelerate if the company gets acquired?',
        label: 'Acceleration on acquisition',
        explainer:
          'Single-trigger acceleration (vests immediately on acquisition) protects founders from being pushed out right after a deal to dodge unvested payouts, but can make the company less attractive to acquirers who want the team to stay. Double-trigger — acceleration only if you’re also let go post-acquisition — is the more common middle ground.',
      },
    ],
  },
  {
    name: 'Decisions',
    questions: [
      {
        text: 'Which decisions should need both founders to agree?',
        label: 'Decisions requiring unanimity',
        explainer:
          'The classic list is raising money, selling the company, taking on debt, and changing the equity split or firing a cofounder. Requiring unanimity on too much invites deadlock over small stuff; too little lets one founder make irreversible calls alone — most agreements stick to a short list of the biggest, hardest-to-undo decisions.',
      },
      {
        text: 'How do you want to break a deadlock?',
        label: 'Deadlock resolution',
        options: [
          {
            value: 'An outside advisor',
            explainer:
              'Neutral, but slows things down and costs a favor or a fee every time it’s invoked.',
          },
          {
            value: 'The CEO decides',
            explainer:
              'Keeps things fast, but concentrates power with one founder — worth naming explicitly rather than assuming.',
          },
          {
            value: 'Coin flip',
            explainer:
              'Fully neutral and fast, but resolves nothing about who was actually right — fine for small stuff, risky for big calls.',
          },
          {
            value: 'Not sure yet',
            explainer:
              'Worth deciding before you actually hit a deadlock — it’s much harder to agree on a process once you’re already stuck.',
          },
        ],
      },
    ],
  },
  {
    name: 'IP',
    questions: [
      {
        text: 'Has everything built so far been assigned to the company?',
        label: 'IP assignment',
        options: [
          {
            value: 'Yes',
            explainer:
              'Good — get the assignment documented in writing if it isn’t already, since “yes” without paperwork doesn’t hold up in diligence.',
          },
          {
            value: 'No',
            explainer:
              'This needs to happen before a fundraise or acquisition — unassigned IP is one of the most common deal-blockers in diligence.',
          },
          {
            value: 'Not sure',
            explainer:
              'Worth checking founder agreements, employment contracts, or IP assignment forms from any prior work — the answer affects what the company actually owns.',
          },
        ],
      },
      {
        text: 'Was any of it built before the company existed?',
        label: 'Pre-existing IP',
        explainer:
          'Pre-existing work isn’t automatically owned by the company — even as the sole founder, even if you built it specifically for this idea. It needs a formal assignment (or an explicit license if you want to keep personal ownership), since this is exactly what investors and acquirers diligence later.',
      },
    ],
  },
];

const REPLY_DELAY_MS = 1600;
const FOLLOW_UP = 'Good question — a real agent would answer that here.';
const TOTAL_QUESTIONS = SECTIONS.reduce((sum, section) => sum + section.questions.length, 0);

const firstMessage = (index) => [{ role: 'agent', text: SECTIONS[index].questions[0].text }];

/** The draft that fills in as the interview goes. */
function Draft({ answers, justFilled, activeSection }) {
  return (
    <article className="draft">
      <header className="draft__head">
        <h2 className="draft__title">Cofounder Agreement</h2>
        <p className="draft__status">Draft · updates as you answer</p>
      </header>

      {SECTIONS.map((section, si) => (
        <section
          key={section.name}
          className={`clause ${si === activeSection ? 'clause--active' : ''}`}
        >
          <h3 className="clause__title">
            <span className="clause__num">{si + 1}</span>
            {section.name}
          </h3>

          {section.questions.map((question, qi) => {
            const value = answers[si][qi];
            const key = `${si}-${qi}`;
            return (
              <div
                key={key}
                className={`field ${value ? 'field--filled' : ''} ${
                  justFilled === key ? 'field--new' : ''
                }`}
              >
                <span className="field__label">{question.label}</span>
                <span className="field__value">{value || 'Not yet answered'}</span>
              </div>
            );
          })}
        </section>
      ))}
    </article>
  );
}

export default function App() {
  // Each section keeps its own chat, its own place in the script, and its own
  // completed flag. Switching tabs swaps which one is on screen.
  const [threads, setThreads] = useState(() =>
    SECTIONS.map((_, i) => (i === 0 ? firstMessage(0) : [])),
  );
  const [positions, setPositions] = useState(() => SECTIONS.map(() => 0));
  const [completed, setCompleted] = useState(() => SECTIONS.map(() => false));
  // Answers mirrored out of the chat so the draft can render them.
  const [answers, setAnswers] = useState(() => SECTIONS.map((s) => s.questions.map(() => null)));
  const [justFilled, setJustFilled] = useState(null);
  const [si, setSi] = useState(0);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);

  const inputRef = useRef(null);
  const transcriptRef = useRef(null);

  const messages = threads[si];
  const qi = positions[si];
  const isComplete = completed[si];

  // Keep the newest message in view. Assigning scrollTop works everywhere;
  // `scroll-behavior: smooth` is deliberately not used — see index.css.
  useEffect(() => {
    const scroller = transcriptRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [messages, thinking, si]);

  // A new question means any hovered option from the last one is stale.
  useEffect(() => {
    setHoveredOption(null);
  }, [si, qi]);

  // Clear the highlight on a freshly filled field after it has played.
  useEffect(() => {
    if (!justFilled) return;
    const timer = setTimeout(() => setJustFilled(null), 1400);
    return () => clearTimeout(timer);
  }, [justFilled]);

  function updateAt(setter, index, value) {
    setter((current) => current.map((item, i) => (i === index ? value : item)));
  }

  // `choice` is set when the answer came from a chip rather than the composer.
  function send(choice) {
    const text = (choice ?? input).trim();
    if (!text || thinking) return;

    const section = si;
    setThreads((current) =>
      current.map((thread, i) => (i === section ? [...thread, { role: 'user', text }] : thread)),
    );
    setInput('');
    setThinking(true);

    // Clearing the value doesn't undo the inline height the auto-grow set.
    if (inputRef.current) inputRef.current.style.height = 'auto';

    const questions = SECTIONS[section].questions;
    const wasComplete = completed[section];
    const hasMore = qi + 1 < questions.length;
    // No real NLP here — a trailing "?" is the stand-in for "this is a
    // follow-up, not an answer to the current question."
    const isFollowUp = !wasComplete && !choice && text.endsWith('?');

    // A finished section is out of script, and a follow-up mid-section is
    // off-script too — neither should overwrite an answer already captured
    // in the draft or move the interview along.
    if (!wasComplete && !isFollowUp) {
      setAnswers((current) =>
        current.map((row, i) => (i === section ? row.map((a, j) => (j === qi ? text : a)) : row)),
      );
      setJustFilled(`${section}-${qi}`);
    }

    setTimeout(() => {
      const reply =
        wasComplete || isFollowUp
          ? FOLLOW_UP
          : hasMore
            ? questions[qi + 1].text
            : `That’s everything for ${SECTIONS[section].name}. Ask me anything about it, or pick another section above.`;

      setThreads((current) =>
        current.map((thread, i) =>
          i === section ? [...thread, { role: 'agent', text: reply }] : thread,
        ),
      );

      if (!wasComplete && !isFollowUp) {
        if (hasMore) {
          updateAt(setPositions, section, qi + 1);
        } else {
          updateAt(setCompleted, section, true);
        }
      }

      setThinking(false);
      inputRef.current?.focus();
    }, REPLY_DELAY_MS);
  }

  // Step back to the previous question in the current section, clearing its
  // answer so it can be given again.
  function goBack() {
    if (thinking) return;
    const section = si;

    if (isComplete) {
      const lastIndex = SECTIONS[section].questions.length - 1;
      setThreads((current) =>
        current.map((thread, i) => (i === section ? thread.slice(0, -1) : thread)),
      );
      updateAt(setCompleted, section, false);
      updateAt(setPositions, section, lastIndex);
      return;
    }

    if (qi === 0) return;
    const prevIndex = qi - 1;
    setThreads((current) =>
      current.map((thread, i) => (i === section ? thread.slice(0, thread.length - 2) : thread)),
    );
    setAnswers((current) =>
      current.map((row, i) => (i === section ? row.map((a, j) => (j === prevIndex ? null : a)) : row)),
    );
    updateAt(setPositions, section, prevIndex);
    inputRef.current?.focus();
  }

  // Each tab is its own conversation; opening an untouched one starts it.
  function openSection(index) {
    if (thinking || index === si) return;
    if (threads[index].length === 0) {
      updateAt(setThreads, index, firstMessage(index));
    }
    setSi(index);
    inputRef.current?.focus();
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  // Grow the composer with the text, up to the max-height set in CSS.
  function handleInput(event) {
    setInput(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  }

  const answered = answers.flat().filter(Boolean).length;
  const progress = (answered / TOTAL_QUESTIONS) * 100;
  const currentQuestion = SECTIONS[si].questions[qi];
  const choices = !thinking && !isComplete ? currentQuestion.options : undefined;
  // Multi-choice questions swap the explainer to whichever option is hovered;
  // open-ended ones just show the question's own explainer.
  const explainer = !thinking && !isComplete
    ? choices
      ? (choices.find((option) => option.value === hoveredOption)?.explainer)
      : currentQuestion.explainer
    : undefined;

  return (
    <div className="app">
      <div className="progress">
        <div className="progress__fill" style={{ width: `${progress}%` }} />
      </div>

      <header className="topbar">
        <nav className="tabs">
          {SECTIONS.map((section, i) => {
            const state = completed[i] ? 'done' : i === si ? 'active' : 'upcoming';
            return (
              <button
                key={section.name}
                type="button"
                className={`tab tab--${state}`}
                onClick={() => openSection(i)}
                aria-current={i === si ? 'step' : undefined}
              >
                {completed[i] && <span className="tab__check">✓</span>}
                {section.name}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="panes">
        <div className="pane pane--chat">
          <main className="transcript" ref={transcriptRef}>
            <div className="thread">
              {(() => {
                // Anchor on the last agent message that actually moved the
                // script forward (asked a question or closed the section) —
                // not just the last agent message, since a follow-up reply
                // shouldn't bump the current question off screen.
                let anchor = -1;
                for (let i = messages.length - 1; i >= 0; i--) {
                  if (messages[i].role === 'agent' && messages[i].text !== FOLLOW_UP) {
                    anchor = i;
                    break;
                  }
                }
                const visible = anchor === -1 ? [] : messages.slice(anchor);
                return visible.map((message, i) => (
                  <div key={anchor + i} className={`msg msg--${message.role}`}>
                    {message.text}
                  </div>
                ));
              })()}

              {thinking && (
                <div className="msg msg--agent typing" aria-label="Typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}

              {!choices && explainer && <p className="explainer">{explainer}</p>}

              {choices && (
                <div className="choices">
                  {choices.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="choice"
                      onClick={() => send(option.value)}
                      onMouseEnter={() => setHoveredOption(option.value)}
                      onMouseLeave={() => setHoveredOption(null)}
                      onFocus={() => setHoveredOption(option.value)}
                      onBlur={() => setHoveredOption(null)}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
              )}

              {choices && explainer && <p className="explainer explainer--option">{explainer}</p>}
            </div>
          </main>

          <footer className="composer-wrap">
            <div className="composer-row">
              <button
                type="button"
                className="composer__back"
                onClick={goBack}
                disabled={thinking || (qi === 0 && !isComplete)}
                aria-label="Back"
              >
                ←
              </button>
              <div className="composer">
                <textarea
                  ref={inputRef}
                  className="composer__input"
                  rows={1}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  // The placeholder carries the fact that this isn't just a form —
                  // answering and asking both happen in the same box.
                  placeholder={
                    isComplete
                      ? 'Ask a follow-up…'
                      : choices
                        ? 'Pick one, or ask a question…'
                        : 'Answer, or ask a question…'
                  }
                  autoFocus
                />
                <button
                  type="button"
                  className="composer__send"
                  onClick={() => send()}
                  disabled={!input.trim() || thinking}
                  aria-label="Send"
                >
                  →
                </button>
              </div>
            </div>
            <p className="hint">Dummy app — nothing is saved</p>
          </footer>
        </div>

        {/* Collapsed by default; the handle on the right edge pulls it open. */}
        <aside className={`draft-panel ${draftOpen ? 'draft-panel--open' : ''}`}>
          <button
            type="button"
            className="draft-handle"
            onClick={() => setDraftOpen((open) => !open)}
            aria-expanded={draftOpen}
            aria-label={draftOpen ? 'Hide draft' : 'Show draft'}
          >
            <span className="draft-handle__arrow">{draftOpen ? '›' : '‹'}</span>
            {!draftOpen && (
              <span className="draft-handle__count">
                {answered}/{TOTAL_QUESTIONS}
              </span>
            )}
          </button>

          <div className="draft-panel__body">
            <Draft answers={answers} justFilled={justFilled} activeSection={si} />
          </div>
        </aside>
      </div>
    </div>
  );
}
