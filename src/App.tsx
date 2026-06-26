import React, { useState, useEffect, useRef } from "react";
import couple from "./assets/bride.png";
import dugunMuzigi from "./assets/sessiz_yemin.mp3";

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
      ctx.ellipse(-r * 0.28, r * 0.05, r * 0.28, r * 0.18, -0.4, 0, Math.PI * 2);
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
        const a = (0.3 + 0.7 * Math.abs(Math.sin(frame * 0.025 + s.phase))) * s.opacity;
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

export default function App(): React.JSX.Element {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft());
  const [isOpening, setIsOpening] = useState<boolean>(false); 
  const [hasEntered, setHasEntered] = useState<boolean>(false); 
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 500);
    audioRef.current = new Audio(dugunMuzigi);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
      clearInterval(id);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const handleEnter = () => {
    setIsOpening(true); 
    
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Müzik engellendi:", err));
    }

    setTimeout(() => {
      setHasEntered(true);
    }, 1600); 
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Müzik başlatılamadı:", err));
    }
  };

  const z: React.CSSProperties = { position: "relative", zIndex: 3 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,700;1,400;1,700&family=Lato:wght@300;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fce8f0; min-height: 100vh; overflow-x: hidden; }
        
        /* Animasyonlar */
        @keyframes flipNum {
          from { opacity: 0; transform: translateY(-14px) scaleY(.65); }
          60%  { transform: translateY(3px) scaleY(1); }
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
        @keyframes sealPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 4px 15px rgba(138,34,72,0.3); }
          50% { transform: translate(-50%, -50%) scale(1.05); box-shadow: 0 6px 22px rgba(138,34,72,0.5); }
        }
      `}</style>

      {/* 1. REALİSTİK ZARF VE GİRİŞ EKRANI */}
      {!hasEntered && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "linear-gradient(170deg, #fceef5 0%, #f3cadf 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isOpening ? 0 : 1,
            transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s", 
            pointerEvents: isOpening ? "none" : "auto",
            perspective: "1000px",
          }}
        >
          {/* Ana Zarf Gövdesi */}
          <div
            style={{
              position: "relative",
              width: "min(440px, 92vw)",
              height: "280px",
              background: "#edd6e4", 
              borderRadius: "6px",
              boxShadow: "0 20px 50px rgba(122,31,66,0.15)",
              transform: isOpening ? "translateY(120px) scale(0.9)" : "none",
              transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* [A] SÜSLÜ MEKTUP KARTI (Kapak arkasından çıkması için z-index: 2 yapıldı) */}
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "15px",
                right: "15px",
                height: "240px",
                background: "linear-gradient(135deg, #fffdfa 0%, #fffbfd 100%)", // Fildişi kağıt dokusu
                borderRadius: "4px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2, // Yan ve alt kapakların (3) arkasında kalacak, ama üst kapağın tam arkasından yükselecek
                padding: "24px",
                transform: isOpening ? "translateY(-140px)" : "translateY(0)",
                opacity: isOpening ? 1 : 0,
                transition: "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.2s, opacity 0.4s ease 0.2s",
                border: "1px solid #e8b0c860",
              }}
            >
              {/* SÜSLÜ İÇ ÇERÇEVE */}
              <div
                style={{
                  position: "absolute",
                  inset: "8px",
                  border: "1px solid #d4a3b8",
                  borderRadius: "2px",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "12px",
                  border: "0.5px dashed #e8c0d0",
                  borderRadius: "2px",
                  pointerEvents: "none",
                }}
              />

              {/* Üst Zarif Nokta/Desen */}
              <div style={{ fontSize: 10, color: "#d4a3b8", marginBottom: 6, letterSpacing: "2px" }}>✦ ❖ ✦</div>

              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: "#7a1f42", fontStyle: "italic", fontWeight: 700, marginBottom: 2 }}>
                Hasan & Zeynep
              </h1>
              
              {/* Kaligrafik Ayraç Deseni */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0" }}>
                <div style={{ width: 30, height: 0.5, background: "#d4a3b8" }} />
                <span style={{ fontSize: 11, color: "#d4a3b8" }}>❦</span>
                <div style={{ width: 30, height: 0.5, background: "#d4a3b8" }} />
              </div>

              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: "#c07090", letterSpacing: ".25em", textTransform: "uppercase", fontWeight: 700, marginTop: 4 }}>
                Düğün Davetiyesi
              </p>
            </div>

            {/* [B] REALİSTİK ÜST ÜÇGEN KAPAK (Dönüş yönü ve sırası ayarlandı) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "0",
                borderTop: "142px solid #fbf2f7",
                borderLeft: "calc(min(440px, 92vw) / 2) solid transparent",
                borderRight: "calc(min(440px, 92vw) / 2) solid transparent",
                transformOrigin: "top center",
                transform: isOpening ? "rotateX(180deg) translateY(1px)" : "rotateX(0deg)",
                transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: isOpening ? 1 : 4, // Açılınca mektubun (2) arkasına geçmesi için dinamik z-index kapandı/açıldı
                filter: "drop-shadow(0 3px 4px rgba(122,31,66,0.1))",
              }}
            />

            {/* [C] REALİSTİK SOL KAPAK CEPHE */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: 0,
                borderLeft: "calc(min(440px, 92vw) * 0.52) solid #f3dae7",
                borderTop: "140px solid transparent",
                borderBottom: "140px solid transparent",
                zIndex: 3, // Mektubun önünde durarak cep oluşturuyor
                filter: "drop-shadow(3px 0 4px rgba(122,31,66,0.05))",
                borderRadius: "6px 0 0 6px",
              }}
            />

            {/* [D] REALİSTİK SAĞ KAPAK CEPHE */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: 0,
                borderRight: "calc(min(440px, 92vw) * 0.52) solid #f3dae7",
                borderTop: "140px solid transparent",
                borderBottom: "140px solid transparent",
                zIndex: 3, // Mektubun önünde durarak cep oluşturuyor
                filter: "drop-shadow(-3px 0 4px rgba(122,31,66,0.05))",
                borderRadius: "0 6px 6px 0",
              }}
            />

            {/* [E] REALİSTİK ALT ÜÇGEN CEPHE */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 0,
                borderBottom: "145px solid #ebd2e1",
                borderLeft: "calc(min(440px, 92vw) / 2) solid transparent",
                borderRight: "calc(min(440px, 92vw) / 2) solid transparent",
                zIndex: 3, // Mektubun önünde durarak cep oluşturuyor
                filter: "drop-shadow(0 -3px 5px rgba(122,31,66,0.08))",
                borderRadius: "0 0 6px 6px",
              }}
            />

            {/* BALMUMU MÜHÜR (WAX SEAL) BUTONU */}
            <button
              onClick={handleEnter}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 5, 
                width: "70px",
                height: "70px",
                background: "radial-gradient(circle, #aa3360 0%, #8a2248 70%, #6e1637 100%)",
                border: "2px solid #b3426c",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fce6f1",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "24px",
                fontWeight: "bold",
                opacity: isOpening ? 0 : 1,
                visibility: isOpening ? "hidden" : "visible",
                transition: "opacity 0.2s, transform 0.2s, visibility 0.2s",
                animation: isOpening ? "none" : "sealPulse 2.5s ease-in-out infinite",
                userSelect: "none",
              }}
              title="Davetiyeyi Mührü Kırarak Aç"
            >
              ♥
            </button>
          </div>
        </div>
      )}

      {/* 2. ASIL GERI SAYIM SAYFASI (SMOOTH GEÇİŞLİ) */}
      <div
        style={{
          opacity: isOpening ? 1 : 0,
          transform: isOpening ? "scale(1)" : "scale(1)",
          transition: "opacity 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s, transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s",
        }}
      >
        {/* SAĞ ÜST KÖŞEDE SES KONTROL BUTONU */}
        <button
          onClick={toggleMusic}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 10,
            background: "#fff8fb",
            border: "1px solid #e8b0c8",
            borderRadius: "50%",
            width: 44,
            height: 44,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px #e090b030",
            fontSize: 16,
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          title={isPlaying ? "Müziği Sustur" : "Müziği Başlat"}
        >
          {isPlaying ? "🎵" : "🔇"}
        </button>

        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(170deg,#fdeef5 0%,#f9d8ea 40%,#fce6f1 70%,#f5d0e5 100%)",
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
          {/* Orbs */}
          {[
            { w: 360, h: 360, top: "-90px", left: "-90px", delay: "0s", bottom: undefined, right: undefined, transform: undefined },
            { w: 300, h: 300, bottom: "-70px", right: "-70px", delay: "2.5s", top: undefined, left: undefined, transform: undefined },
            { w: 200, h: 200, top: "40%", left: "50%", transform: "translateX(-50%)", delay: "1.2s", bottom: undefined, right: undefined },
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

          {/* Eyebrow */}
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

          {/* Couple Görseli */}
          <div style={{ ...z, marginBottom: 16, width: "50%", display: "flex", justifyContent: "center" }}>
            <img style={{ width: "50%", maxWidth: "180px" }} src={couple} alt="Couple" />
          </div>

          {/* İsimler */}
          <h1
            style={{
              ...z,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(38px, 8vw, 54px)",
              textAlign: "center",
              marginBottom: 14,
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

          {/* Tarih */}
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

          {/* Kalpli Ayraç */}
          <div style={{ ...z, display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 50, height: 1, background: "linear-gradient(90deg,transparent,#d4888a80,transparent)" }} />
            <span style={{ fontSize: 16, color: "#d4688a", animation: "heartbeat 1.4s ease-in-out infinite" }}>♥</span>
            <div style={{ width: 50, height: 1, background: "linear-gradient(90deg,transparent,#d4888a80,transparent)" }} />
          </div>

          {/* Geri Sayım Kutuları */}
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
                <div style={{ fontSize: 34, color: "#e090b0", paddingBottom: 24, animation: "pulse 1s ease-in-out infinite" }}>:</div>
                <CountUnit value={time.h} label="Saat" />
                <div style={{ fontSize: 34, color: "#e090b0", paddingBottom: 24, animation: "pulse 1s ease-in-out infinite" }}>:</div>
                <CountUnit value={time.m} label="Dakika" />
                <div style={{ fontSize: 34, color: "#e090b0", paddingBottom: 24, animation: "pulse 1s ease-in-out infinite" }}>:</div>
                <CountUnit value={time.s} label="Saniye" />
              </>
            )}
          </div>

          {/* Söz / Alıntı */}
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
      </div>
    </>
  );
}