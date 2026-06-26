import React, { useState, useEffect, useRef } from "react";
import couple from "./assets/bride.png";
// Hedef Tarih
const TARGET = new Date("2026-07-24T17:00:00");

interface TimeLeft {
  d: number;
  h: number;
  m: number;
  s: number;
  done: boolean;
}

function getTimeLeft(): TimeLeft {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor(diff / 3600000) % 24,
    m: Math.floor(diff / 60000) % 60,
    s: Math.floor(diff / 1000) % 60,
    done: false,
  };
}

interface CountUnitProps {
  value: number;
  label: string;
}

function CountUnit({ value, label }: CountUnitProps): React.JSX.Element {
  const display = String(value).padStart(2, "0");
  const [flip, setFlip] = useState<boolean>(false);
  const prev = useRef<string>(display);

  useEffect(() => {
    if (display !== prev.current) {
      setFlip(true);
      prev.current = display;
      const t = setTimeout(() => setFlip(false), 350);
      return () => clearTimeout(t);
    }
  }, [display]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          width: 78,
          height: 86,
          background: "#fff8fb",
          border: "1.5px solid #e8b0c8",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 20px #e090b025, inset 0 1px 0 #fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg,#ffffff70 0%,transparent 50%)",
            borderRadius: 14,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 10,
            right: 10,
            height: 1,
            background: "#e8b0c830",
          }}
        />
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 48,
            fontWeight: 700,
            color: "#8a2248",
            lineHeight: 1,
            animation: flip ? "flipNum .3s ease both" : "none",
          }}
        >
          {display}
        </span>
      </div>
      <span
        style={{
          marginTop: 7,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: ".22em",
          textTransform: "uppercase",
          color: "#c07890",
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface HeartItem {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  drift: number;
  opacity: number;
  phase: number;
  spin: number;
  angle: number;
  pulse: number;
}

interface SparkItem {
  x: number;
  y: number;
  r: number;
  color: string;
  opacity: number;
  speed: number;
  phase: number;
}

function HeartsCanvas(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (canvas && wrap) {
        canvas.width = wrap.offsetWidth;
        canvas.height = wrap.offsetHeight;
      }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const COLORS = [
      "#f4a0c0",
      "#f0b8cc",
      "#fcd0e0",
      "#e87aa8",
      "#f8c8d8",
      "#ffffff",
      "#f9e0ea",
      "#e86898",
    ];
    const hearts: HeartItem[] = Array.from({ length: 55 }, (_, i) => ({
      x: Math.random() * 100,
      y: 100 + Math.random() * 100,
      size: 5 + Math.random() * 18,
      color: COLORS[i % COLORS.length],
      speed: 0.1 + Math.random() * 0.28,
      drift: (Math.random() - 0.5) * 0.28,
      opacity: 0.15 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.018,
      angle: Math.random() * Math.PI * 2,
      pulse: Math.random() * Math.PI * 2,
    }));
    const sparks: SparkItem[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: 1 + Math.random() * 2,
      color: Math.random() > 0.5 ? "#f8b0c8" : "#fff0f8",
      opacity: Math.random(),
      speed: 0.35 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    }));

    function drawHeart(
      cx: number,
      cy: number,
      r: number,
      color: string,
      alpha: number,
      angle: number,
    ) {
      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, r * 0.4);
      ctx.bezierCurveTo(-r * 0.6, -r * 0.3, -r * 1.2, r * 0.1, 0, r);
      ctx.bezierCurveTo(r * 1.2, r * 0.1, r * 0.6, -r * 0.3, 0, r * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = alpha * 0.2;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(
        -r * 0.28,
        r * 0.05,
        r * 0.28,
        r * 0.18,
        -0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }

    let frame = 0;
    let rafId: number;
    function animate() {
      if (!canvas || !ctx) return;
      rafId = requestAnimationFrame(animate);
      const W = canvas.width,
        H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      frame++;
      hearts.forEach((h) => {
        h.y -= h.speed;
        h.x += Math.sin(frame * 0.013 + h.phase) * h.drift;
        h.angle += h.spin;
        const ps = h.size * (1 + 0.07 * Math.sin(frame * 0.04 + h.pulse));
        if (h.y < -h.size * 3) {
          h.y = 110;
          h.x = Math.random() * 100;
        }
        if (h.x < 0) h.x = 100;
        if (h.x > 100) h.x = 0;
        drawHeart(
          (h.x / 100) * W,
          (h.y / 100) * H,
          ps,
          h.color,
          h.opacity,
          h.angle,
        );
      });
      sparks.forEach((s) => {
        s.y -= s.speed;
        if (s.y < -4) {
          s.y = 100;
          s.x = Math.random() * 100;
        }
        const a =
          (0.3 + 0.7 * Math.abs(Math.sin(frame * 0.025 + s.phase))) * s.opacity;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc((s.x / 100) * W, (s.y / 100) * H, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
    animate();
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

function useAutoMusic(): void {
  useEffect(() => {
    let started = false;
    function start() {
      if (started) return;
      started = true;
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const ac = new AudioContextClass();
        const N: Record<string, number> = {
          C4: 261.6,
          D4: 293.7,
          E4: 329.6,
          F4: 349.2,
          G4: 392,
          A4: 440,
          B4: 493.9,
          C5: 523.3,
          D5: 587.3,
          E5: 659.3,
          G5: 784,
        };
        const mel = [
          "E4",
          "G4",
          "A4",
          "C5",
          "B4",
          "A4",
          "G4",
          "E4",
          "D4",
          "F4",
          "G4",
          "A4",
          "C5",
          "E5",
          "D5",
          "C5",
          "B4",
          "G4",
          "A4",
          "C5",
          "E5",
          "G5",
          "E5",
          "C5",
          "A4",
          "G4",
        ];
        const bass = ["C4", "C4", "G4", "G4", "A4", "A4", "F4", "F4"];
        let mi = 0,
          bi = 0;

        function pN(
          freq: number,
          t: number,
          dur: number,
          vol: number,
          type: OscillatorType = "sine",
        ) {
          const o = ac.createOscillator(),
            g = ac.createGain();
          o.type = type;
          o.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(vol, t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.88);
          o.connect(g);
          g.connect(ac.destination);
          o.start(t);
          o.stop(t + dur);
        }
        const i1 = setInterval(() => {
          const f = N[mel[mi % mel.length]];
          pN(f, ac.currentTime, 0.42, 0.13);
          pN(f * 0.794, ac.currentTime, 0.42, 0.05);
          mi++;
        }, 460);
        const i2 = setInterval(() => {
          pN(
            N[bass[bi % bass.length]] * 0.5,
            ac.currentTime,
            0.9,
            0.07,
            "triangle",
          );
          bi++;
        }, 920);
        return () => {
          clearInterval(i1);
          clearInterval(i2);
        };
      } catch (e) {}
    }
    try {
      start();
    } catch (e) {}
    document.addEventListener("click", start, { once: true });
    return () => document.removeEventListener("click", start);
  }, []);
}

export default function App(): React.JSX.Element {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft());
  useAutoMusic();

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 500);
    return () => clearInterval(id);
  }, []);

  const z: React.CSSProperties = { position: "relative", zIndex: 3 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,700;1,400;1,700&family=Lato:wght@300;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fce8f0; min-height: 100vh; }
        @keyframes flipNum {
          from { opacity: 0; transform: translateY(-14px) scaleY(.65); }
          60%  { transform: translateY(3px) scaleY(1.04); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes glowNames {
          from { text-shadow: 0 2px 20px #e8a0b840; }
          to   { text-shadow: 0 2px 36px #e8a0b8aa, 0 0 60px #f0c0d050; }
        }
        @keyframes heartbeat {
          0%,100% { transform: scale(1); }
          14%     { transform: scale(1.3); }
          28%     { transform: scale(1); }
          42%     { transform: scale(1.15); }
        }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.95} }
        @keyframes orbPulse { 0%,100%{opacity:.2} 50%{opacity:.42} }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(170deg,#fdeef5 0%,#f9d8ea 40%,#fce6f1 70%,#f5d0e5 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {/* orbs */}
        {[
          {
            w: 360,
            h: 360,
            top: "-90px",
            left: "-90px",
            delay: "0s",
            bottom: undefined,
            right: undefined,
            transform: undefined,
          },
          {
            w: 300,
            h: 300,
            bottom: "-70px",
            right: "-70px",
            delay: "2.5s",
            top: undefined,
            left: undefined,
            transform: undefined,
          },
          {
            w: 200,
            h: 200,
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
            delay: "1.2s",
            bottom: undefined,
            right: undefined,
          },
        ].map((o, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 0,
              width: o.w,
              height: o.h,
              background: "radial-gradient(#f9b8d0,transparent 70%)",
              top: o.top,
              left: o.left,
              bottom: o.bottom,
              right: o.right,
              transform: o.transform,
              animation: `orbPulse 5s ease-in-out ${o.delay} infinite`,
            }}
          />
        ))}

        <HeartsCanvas />

        {/* eyebrow */}
        <div
          style={{
            ...z,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".3em",
            textTransform: "uppercase",
            color: "#b05878",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          ✦ &nbsp; düğün geri sayımı &nbsp; ✦
        </div>

        {/* couple */}
        <div style={{ ...z, marginBottom: 16, width: "50%" }}>
          <img style={{ width: "50%" }} src={couple} alt="Couple" />
        </div>

        {/* names */}
        <h1
          style={{
            ...z,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(38px, 8vw, 54px)",
            lineHeight: 1,
            textAlign: "center",
            marginBottom: 4,
            color: "#7a1f42",
            animation: "glowNames 3s ease-in-out infinite alternate",
          }}
        >
          Hasan{" "}
          <span
            style={{
              color: "#d4688a",
              fontStyle: "normal",
              fontSize: "clamp(28px,6vw,38px)",
              margin: "0 8px",
              display: "inline-block",
              animation: "heartbeat 1.4s ease-in-out infinite",
            }}
          >
            ♥
          </span>{" "}
          Zeynep
        </h1>

        {/* date */}
        <div
          style={{
            ...z,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "#c07090",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          24 · 07 · 2026 &nbsp;·&nbsp; Evleniyoruz!
        </div>

        {/* divider */}
        <div
          style={{
            ...z,
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 50,
              height: 1,
              background:
                "linear-gradient(90deg,transparent,#d4888a80,transparent)",
            }}
          />
          <span
            style={{
              fontSize: 16,
              color: "#d4688a",
              animation: "heartbeat 1.4s ease-in-out infinite",
            }}
          >
            ♥
          </span>
          <div
            style={{
              width: 50,
              height: 1,
              background:
                "linear-gradient(90deg,transparent,#d4888a80,transparent)",
            }}
          />
        </div>

        {/* countdown */}
        <div
          style={{
            ...z,
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {time.done ? (
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 32,
                fontStyle: "italic",
                color: "#8a2248",
                textAlign: "center",
              }}
            >
              🎊 Mutluluklar Hasan &amp; Zeynep! 🎊
            </div>
          ) : (
            <>
              <CountUnit value={time.d} label="Gün" />
              <div
                style={{
                  fontSize: 34,
                  color: "#e090b0",
                  paddingBottom: 24,
                  animation: "pulse 1s ease-in-out infinite",
                }}
              >
                :
              </div>
              <CountUnit value={time.h} label="Saat" />
              <div
                style={{
                  fontSize: 34,
                  color: "#e090b0",
                  paddingBottom: 24,
                  animation: "pulse 1s ease-in-out infinite",
                }}
              >
                :
              </div>
              <CountUnit value={time.m} label="Dakika" />
              <div
                style={{
                  fontSize: 34,
                  color: "#e090b0",
                  paddingBottom: 24,
                  animation: "pulse 1s ease-in-out infinite",
                }}
              >
                :
              </div>
              <CountUnit value={time.s} label="Saniye" />
            </>
          )}
        </div>

        {/* quote */}
        <p
          style={{
            ...z,
            marginTop: 22,
            textAlign: "center",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 15,
            color: "#a04060",
            letterSpacing: ".04em",
            lineHeight: 1.7,
          }}
        >
          "İki can, tek yürek — sonsuza dek."
        </p>
      </div>
    </>
  );
}
