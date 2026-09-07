// Development-only browser fixture. These targets never enter the evidence store.
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { RollingNumber } from "../../components/rolling-number";

function Fixture() {
  const [value, setValue] = useState<number | null>(null);
  const [mounted, setMounted] = useState(true);
  const [renders, setRenders] = useState(0);
  return <main>
    <h1>Number animation test fixture</h1>
    {[638, 640, 24, 1, 0].map(target => <button key={target} onClick={() => setValue(target)}>Load {target}</button>)}
    <button onClick={() => setValue(null)}>Clear</button>
    <button onClick={() => setMounted(v => !v)}>Toggle mount</button>
    <button onClick={() => setRenders(n => n + 1)}>Rerender {renders}</button>
    <div className="engineering-proof-grid" style={{ width: 800, maxWidth: "100%" }}>
      <article className="engineering-proof-card"><strong className="engineering-proof-value evidence-value" data-testid="main-number">
        {mounted && <RollingNumber value={value} loading />}
      </strong><p>Controlled animation fixture</p></article>
      <article className="engineering-proof-card"><strong className="engineering-proof-value evidence-value" data-testid="suffix-number">
        <RollingNumber value={value} loading suffix="d" />
      </strong><p>Suffix fixture</p></article>
      <article className="engineering-proof-card"><strong className="engineering-proof-value evidence-value" data-testid="padded-number">
        <RollingNumber value={value === null ? null : 2} loading minimumDigits={2} />
      </strong><p>Padding fixture</p></article>
    </div>
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><Fixture /></StrictMode>);
