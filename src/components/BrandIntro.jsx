import { useEffect, useState } from "react";

const fragments = [
  ["#e600ff", "-38vw", "-22vh", "-62px", "-48px", "0ms"],
  ["#8b00ff", "32vw", "-28vh", "-92px", "-12px", "45ms"],
  ["#164bff", "-15vw", "34vh", "-35px", "-78px", "90ms"],
  ["#00cfff", "41vw", "13vh", "48px", "-68px", "30ms"],
  ["#00d6a0", "-43vw", "9vh", "78px", "12px", "110ms"],
  ["#ff1744", "21vw", "37vh", "-75px", "43px", "70ms"],
  ["#ff6b00", "-27vw", "-36vh", "-27px", "73px", "135ms"],
  ["#ffe600", "43vw", "-19vh", "37px", "70px", "55ms"],
  ["#00cfff", "-9vw", "-43vh", "73px", "-4px", "155ms"],
  ["#e600ff", "12vw", "-39vh", "-66px", "23px", "95ms"],
  ["#00d6a0", "-45vw", "-2vh", "57px", "-53px", "180ms"],
  ["#164bff", "36vw", "34vh", "-52px", "-51px", "125ms"],
  ["#ff6b00", "-32vw", "29vh", "6px", "78px", "165ms"],
  ["#8b00ff", "27vw", "-4vh", "-84px", "-1px", "205ms"],
];

export default function BrandIntro() {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 500 : 3100;
    const startedAt = performance.now();
    let frame = 0;
    let exitTimer;

    const tick = (now) => {
      const amount = Math.min(1, (now - startedAt) / duration);
      setProgress(Math.round(amount * 100));

      if (amount < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      setLeaving(true);
      exitTimer = window.setTimeout(() => setHidden(true), reducedMotion ? 150 : 620);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`brand-intro${leaving ? " brand-intro-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading QELVAIRO, ${progress}%`}
    >
      <div className="brand-intro-center" aria-hidden="true">
        <div className="brand-intro-glow" />
        <div className="brand-intro-fragments">
          {fragments.map(([color, fromX, fromY, toX, toY, delay], index) => (
            <span
              className="brand-intro-fragment"
              key={`${color}-${index}`}
              style={{
                "--fragment-color": color,
                "--from-x": fromX,
                "--from-y": fromY,
                "--to-x": toX,
                "--to-y": toY,
                "--fragment-delay": delay,
              }}
            />
          ))}
        </div>
        <img className="brand-intro-mark" src="/qelvairo-mark.png" alt="" />
      </div>
    </div>
  );
}
