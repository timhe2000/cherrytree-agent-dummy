import { useState } from 'react';

// Edit anything in this file and the page updates instantly — no reload, and
// the current question/recording state is preserved. That's Vite's HMR.
const QUESTIONS = [
  'To start, what does your company do?',
  'What made you start looking for a cofounder agreement in the first place?',
  'Walk me through the last time you and your cofounder disagreed on something.',
  'How did you land on the equity split you have today?',
  'Can you tell me more about how you’re using ChatGPT in your day-to-day work?',
  'Which parts of that would you want an agent to handle for you?',
  'What would have to be true for you to trust it with something important?',
  'Where do you think it would get things wrong?',
  'How are you handling that today, without an agent?',
  'What would make you recommend this to another founder?',
  'Anything else you want to add before we wrap up?',
];

const DOT_COUNT = 8;
const RING_RADIUS = 28;

function DotRing({ live }) {
  return (
    <div className={live ? 'ring ring--live' : 'ring'}>
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <span
          key={i}
          className="ring__dot"
          style={{
            '--pos': `rotate(${(360 / DOT_COUNT) * i}deg) translate(${RING_RADIUS}px)`,
            animationDelay: `${(i / DOT_COUNT) * 1.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [index, setIndex] = useState(4);
  const [live, setLive] = useState(false);

  // Stopping a recording advances to the next question, wrapping at the end.
  function toggleRecording() {
    if (live) {
      setIndex((current) => (current + 1) % QUESTIONS.length);
    }
    setLive((current) => !current);
  }

  const progress = ((index + 1) / QUESTIONS.length) * 100;

  return (
    <>
      <div className="progress">
        <div className="progress__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="page">
        <div className="breadcrumb">
          Section 1 / <strong>Question {index + 1}</strong>
        </div>

        <h1 className="question">{QUESTIONS[index]}</h1>

        <div className="stage">
          <DotRing live={live} />
        </div>

        <div className="footer">
          <button
            type="button"
            className={live ? 'record record--live' : 'record'}
            onClick={toggleRecording}
          >
            {live ? 'Stop Recording' : 'Start Recording'}
          </button>
          <p className="hint">
            {live ? 'Listening… press stop for the next question' : 'Dummy app — nothing is recorded'}
          </p>
        </div>
      </div>
    </>
  );
}
