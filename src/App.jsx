import { useEffect, useRef, useState } from 'react';

// Edit anything in this file and the page updates instantly — no reload.
// Placeholder content: every question is a stand-in, here to show the sections.
// `options` renders pickable chips; `label` is how the answer reads in the draft.
const SECTIONS = [
  {
    name: 'Formation',
    questions: [
      { text: 'To start, what does your company do?', label: 'Business of the company' },
      {
        text: 'Where is the company incorporated?',
        label: 'State of incorporation',
        options: ['Delaware', 'California', 'Not yet incorporated', 'Somewhere else'],
        explainer:
          'Delaware is the default for VC-backed startups — its corporate law is predictable and investors expect it. California is common if you’re staying small or bootstrapped, but adds its own franchise tax on top. Neither is wrong; it depends on whether you’re raising money.',
      },
    ],
  },
  {
    name: 'Equity',
    questions: [
      {
        text: 'How did you land on the equity split you have today?',
        label: 'Basis for the split',
        options: ['Even split', 'Based on contribution', 'Still deciding', 'A lawyer advised us'],
        explainer:
          'An even split is simple and signals trust, but can breed resentment if one founder ends up doing much more. Splitting by contribution feels fairer but is harder to agree on and revisit later. There’s no “correct” answer — just make sure you both actually agree on the reasoning.',
      },
      {
        text: 'What should happen to those shares if a founder leaves in year one?',
        label: 'Shares on early departure',
      },
    ],
  },
  {
    name: 'Vesting',
    questions: [
      {
        text: 'What vesting schedule do you have in mind?',
        label: 'Vesting schedule',
        options: ['4 years, 1-year cliff', '3 years, no cliff', 'Not sure yet'],
        explainer:
          '4 years with a 1-year cliff is the startup standard: you earn nothing if you leave in year one, then vest monthly after. It protects the company if a founder bails early. A shorter schedule with no cliff vests faster, but gives equity away even to someone who leaves almost immediately.',
      },
      {
        text: 'Should vesting accelerate if the company gets acquired?',
        label: 'Acceleration on acquisition',
      },
    ],
  },
  {
    name: 'Decisions',
    questions: [
      {
        text: 'Which decisions should need both founders to agree?',
        label: 'Decisions requiring unanimity',
      },
      {
        text: 'How do you want to break a deadlock?',
        label: 'Deadlock resolution',
        options: ['An outside advisor', 'The CEO decides', 'Coin flip', 'Not sure yet'],
        explainer:
          'An outside advisor is neutral but slows things down and costs a favor or a fee. Letting the CEO decide keeps things fast but concentrates power with one founder. Whatever you pick, it matters more that you agree on it now, before you actually need it.',
      },
    ],
  },
  {
    name: 'IP',
    questions: [
      {
        text: 'Has everything built so far been assigned to the company?',
        label: 'IP assignment',
        options: ['Yes', 'No', 'Not sure'],
        explainer:
          'If code or designs aren’t formally assigned to the company, the company may not actually own them — even if a founder built them on a company laptop. This matters most for anything built before incorporation, which doesn’t transfer automatically.',
      },
      { text: 'Was any of it built before the company existed?', label: 'Pre-existing IP' },
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

    // A finished section is out of script, so further messages are follow-ups
    // and must not overwrite an answer already captured in the draft.
    if (!wasComplete) {
      setAnswers((current) =>
        current.map((row, i) => (i === section ? row.map((a, j) => (j === qi ? text : a)) : row)),
      );
      setJustFilled(`${section}-${qi}`);
    }

    setTimeout(() => {
      const reply = wasComplete
        ? FOLLOW_UP
        : hasMore
          ? questions[qi + 1].text
          : `That’s everything for ${SECTIONS[section].name}. Ask me anything about it, or pick another section above.`;

      setThreads((current) =>
        current.map((thread, i) =>
          i === section ? [...thread, { role: 'agent', text: reply }] : thread,
        ),
      );

      if (!wasComplete) {
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
  const choices = !thinking && !isComplete ? SECTIONS[si].questions[qi].options : undefined;
  const explainer = !thinking && !isComplete ? SECTIONS[si].questions[qi].explainer : undefined;

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
                let lastAgentIndex = -1;
                for (let i = messages.length - 1; i >= 0; i--) {
                  if (messages[i].role === 'agent') {
                    lastAgentIndex = i;
                    break;
                  }
                }
                const visible = lastAgentIndex === -1 ? [] : messages.slice(lastAgentIndex);
                return visible.map((message, i) => (
                  <div key={lastAgentIndex + i} className={`msg msg--${message.role}`}>
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

              {explainer && <p className="explainer">{explainer}</p>}

              {choices && (
                <div className="choices">
                  {choices.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="choice"
                      onClick={() => send(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
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
