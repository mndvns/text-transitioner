import React from 'react';

import { TextTransitioner } from './textTransitioner';

import "./styles.css";

export function App() {
  const [fadeDuration, setFadeDuration] = React.useState(250);
  const [sizeDuration, setSizeDuration] = React.useState(750);
  const [textStatus, setTextStatus] = React.useState<0 | 1 | 2>(1);
  const [shortText, setShortText] = React.useState("Short");
  const [longText, setLongText] = React.useState(localStorage.getItem("long") || "Very, very long text");

  const status = (["Empty", "Short", "Long"])[textStatus];
  const text = (["", shortText, longText])[textStatus];

  return <main>
    <section>
      <label>Fade Duration</label>
      <input defaultValue={fadeDuration} onChange={e => setFadeDuration(parseInt(e.target.value, 10))} />
    </section>

    <section>
      <label>Size Duration</label>
      <input defaultValue={sizeDuration} onChange={e => setSizeDuration(parseInt(e.target.value, 10))} />
    </section>

    <section>
      <label>Short Text</label>
      <input defaultValue={shortText} onChange={e => setShortText(e.target.value)} />
    </section>

    <section>
      <label>Long Text</label>
      <textarea defaultValue={longText} onChange={({ target: { value } }) => {
        localStorage.setItem("long", value);
        setLongText(value);
      }}/>
    </section>

    <section>
      <button onClick={() => {
        setTextStatus(({
          0: (() => Math.random() > 0.5 ? 1 : 2),
          1: (() => Math.random() > 0.5 ? 0 : 2),
          2: (() => Math.random() > 0.5 ? 0 : 1),
        })[textStatus]());
      }}>
        Toggle
      </button>
    </section>

    <hr />

    <div>
      Status: {status}
    </div>
    <article>
      <div className="parent">
        <TextTransitioner
          fadeDuration={fadeDuration}
          sizeDuration={sizeDuration}>
          {text}
        </TextTransitioner>
      </div>
    </article>
  </main>
 }
