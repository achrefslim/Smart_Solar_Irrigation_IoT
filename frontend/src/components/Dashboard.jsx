import { createElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onValue, ref, set, update } from "firebase/database";
import {
  FaDroplet, FaGear, FaCloudRain, FaSun,
  FaBell, FaBolt, FaWifi, FaCircleExclamation,
} from "react-icons/fa6";
import { rtdb } from "../firebase/config";
import Navbar from "./Navbar";

// ── Light purple-blue palette ─────────────────────────────────────────────────
const C = {
  bg:         "#ece8ff",
  card:       "rgba(255,255,255,0.92)",
  cardBorder: "rgba(109,40,217,0.16)",
  cardShadow: "0 10px 34px rgba(79,70,229,0.12), 0 3px 10px rgba(37,99,235,0.08)",
  cardHover:  "0 18px 54px rgba(109,40,217,0.18), 0 6px 16px rgba(37,99,235,0.1)",
  panel:      "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(235,245,255,0.94) 48%, rgba(244,232,255,0.9) 100%)",
  panelBlue:  "linear-gradient(135deg, rgba(239,246,255,0.96) 0%, rgba(224,242,254,0.9) 48%, rgba(238,242,255,0.94) 100%)",
  panelMint:  "linear-gradient(135deg, rgba(236,253,245,0.96) 0%, rgba(219,234,254,0.9) 55%, rgba(245,243,255,0.94) 100%)",
  panelWarm:  "linear-gradient(135deg, rgba(255,251,235,0.96) 0%, rgba(254,243,199,0.86) 45%, rgba(239,246,255,0.94) 100%)",
  purple:     "#7c3aed",
  purpleLight: "#a78bfa",
  blue:       "#2563eb",
  blueLight:  "#60a5fa",
  text:       "#1e1b4b",
  textMuted:  "#6b7280",
  textLight:  "#9ca3af",
  success:    "#059669",
  successBg:  "#d1fae5",
  danger:     "#dc2626",
  dangerBg:   "#fee2e2",
  warn:       "#d97706",
  warnBg:     "#fef3c7",
  infoBg:     "#eff6ff",
  infoText:   "#1d4ed8",
};

// ── Animated background ───────────────────────────────────────────────────────
function DashboardBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Base gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(150deg, #ebe7ff 0%, #dff1ff 42%, #e9fff5 74%, #fff7d6 100%)",
      }} />

      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(79,70,229,0.16) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }} />

      {/* Soft radial blobs */}
      <div style={{ position: "absolute", width: 720, height: 520, top: "-100px", right: "-150px", background: "radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 70%)", borderRadius: "50%", animation: "bgOrb1 12s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", width: 640, height: 430, bottom: "-80px", left: "-100px", background: "radial-gradient(ellipse, rgba(14,165,233,0.2) 0%, transparent 70%)", borderRadius: "50%", animation: "bgOrb2 15s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", width: 460, height: 430, top: "38%", left: "38%", background: "radial-gradient(ellipse, rgba(16,185,129,0.14) 0%, transparent 70%)", borderRadius: "50%", animation: "bgOrb1 18s ease-in-out infinite alternate-reverse" }} />

      {/* Floating solar panel shapes */}
      {[
        { w: 110, h: 76, top: "8%",  left: "4%",  rot: -8,  delay: "0s",   dur: "9s",  col: "109,40,217" },
        { w: 80,  h: 56, top: "72%", left: "6%",  rot:  5,  delay: "2s",   dur: "11s", col: "59,130,246" },
        { w: 90,  h: 62, top: "18%", left: "88%", rot:  10, delay: "1.5s", dur: "10s", col: "124,58,237" },
        { w: 70,  h: 48, top: "80%", left: "85%", rot: -5,  delay: "3s",   dur: "13s", col: "37,99,235"  },
        { w: 60,  h: 42, top: "48%", left: "2%",  rot:  12, delay: "0.5s", dur: "8s",  col: "109,40,217" },
        { w: 55,  h: 38, top: "55%", left: "92%", rot: -10, delay: "4s",   dur: "12s", col: "59,130,246" },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: s.w, height: s.h,
            top: s.top, left: s.left,
            border: `1.5px solid rgba(${s.col},0.26)`,
            borderRadius: 8,
            backgroundImage: `linear-gradient(rgba(${s.col},0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(${s.col},0.12) 1px,transparent 1px)`,
            backgroundSize: `${Math.round(s.w/3)}px ${Math.round(s.h/2)}px`,
            transform: `rotate(${s.rot}deg)`,
            animation: `solarFloat ${s.dur} ease-in-out ${s.delay} infinite alternate`,
            opacity: 0.9,
          }}
        />
      ))}

      {/* Floating energy dots */}
      {[
        { size: 8,  top: "30%", left: "15%", col: "139,92,246",  delay: "0s",   dur: "6s" },
        { size: 6,  top: "65%", left: "20%", col: "59,130,246",  delay: "1.5s", dur: "8s" },
        { size: 10, top: "20%", left: "75%", col: "109,40,217",  delay: "0.8s", dur: "7s" },
        { size: 7,  top: "75%", left: "70%", col: "37,99,235",   delay: "2.5s", dur: "9s" },
        { size: 5,  top: "45%", left: "90%", col: "139,92,246",  delay: "1s",   dur: "5s" },
        { size: 6,  top: "90%", left: "45%", col: "59,130,246",  delay: "3s",   dur: "7s" },
      ].map((d, i) => (
        <div
          key={`dot-${i}`}
          style={{
            position: "absolute",
            width: d.size, height: d.size,
            top: d.top, left: d.left,
            background: `rgba(${d.col},0.7)`,
            borderRadius: "50%",
            boxShadow: `0 0 ${d.size * 2}px rgba(${d.col},0.5)`,
            animation: `dotFloat ${d.dur} ease-in-out ${d.delay} infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ── Sensor card config ────────────────────────────────────────────────────────
const sensorConfig = (data) => [
  {
    key: "etat", label: "Rain Sensor",
    Icon: data.etat === "PLUIE" ? FaCloudRain : FaSun,
    value: data.etat === "PLUIE" ? "Raining" : "Clear sky",
    active: data.etat === "PLUIE",
    activeColor: C.blue, activeBg: C.infoBg,
    inactiveColor: C.warn, inactiveBg: C.warnBg,
    clickable: false,
  },
  {
    key: "pump", label: "Water Pump",
    Icon: FaDroplet,
    value: data.pump ? "Active" : "Stopped",
    active: data.pump,
    activeColor: C.blue, activeBg: "#dbeafe",
    inactiveColor: C.textMuted, inactiveBg: "#f9fafb",
    clickable: true,
  },
  {
    key: "motor", label: "Clean Motor",
    Icon: FaGear,
    value: data.motor ? "Running" : "Stopped",
    active: data.motor,
    activeColor: C.purple, activeBg: "#ede9fe",
    inactiveColor: C.textMuted, inactiveBg: "#f9fafb",
    clickable: true,
  },
  {
    key: "pluie", label: "Rain ADC Value",
    Icon: FaWifi,
    value: String(data.pluie),
    active: data.pluie < 1500,
    activeColor: C.blue, activeBg: C.infoBg,
    inactiveColor: C.textMuted, inactiveBg: "#f9fafb",
    clickable: false,
  },
];

const alertColor = (severity) => {
  if (severity === "danger" || severity === "critical" || severity === "error") return C.danger;
  if (severity === "warning" || severity === "warn") return C.warn;
  return C.blue;
};

// ── Main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("solar_user")) navigate("/auth/login", { replace: true });
  }, [navigate]);

  const [sensorData, setSensorData] = useState({
    etat: "SEC", eau: 0, pluie: 0, pump: false, motor: false, lastSeen: 0,
  });
  const [alerts, setAlerts]                   = useState([]);
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const [isRunning, setIsRunning]             = useState(false);
  const [timeLeft, setTimeLeft]               = useState(0);
  const [hoveredCard, setHoveredCard]         = useState(null);
  const [nowSeconds, setNowSeconds]           = useState(() => Math.floor(Date.now() / 1000));

  // Firebase listeners
  useEffect(() => {
    const unsubSensors = onValue(
      ref(rtdb, "sensors"),
      (snap) => {
        if (!snap.exists()) return;
        const d = snap.val();
        setSensorData({
          etat: d.etat === "PLUIE" ? "PLUIE" : "SEC",
          eau: Number(d.eau ?? 0), pluie: Number(d.pluie ?? 0),
          pump: Boolean(d.pump ?? false), motor: Boolean(d.motor ?? false),
          lastSeen: Number(d.lastSeen ?? 0),
        });
      },
      (err) => console.error("Firebase sensors error:", err),
    );
    const unsubAlerts = onValue(
      ref(rtdb, "irrigationAlerts"),
      (snap) => {
        if (!snap.exists()) {
          setAlerts([]);
          return;
        }
        setAlerts(Object.entries(snap.val()).map(([id, a]) => ({
          id,
          text: a.message || a.title || a.description || "",
          color: alertColor(a.severity),
        })));
      },
      (err) => console.error("Firebase alerts error:", err),
    );
    return () => { unsubSensors(); unsubAlerts(); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      const t = setTimeout(() => {
        setIsRunning(false);
        update(ref(rtdb, "controls"), { cycle: false, pump: false, motor: false });
      }, 0);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [isRunning, timeLeft]);

  const startTimer = async () => {
    await update(ref(rtdb, "controls"), { cycle: true, pump: true, motor: true });
    setTimeLeft(selectedMinutes * 60);
    setIsRunning(true);
  };
  const stopTimer = async () => {
    await update(ref(rtdb, "controls"), { cycle: false, pump: false, motor: false });
    setIsRunning(false); setTimeLeft(0);
  };
  const toggleDevice = async (device) => {
    const nextValue = !sensorData[device];
    if (device === "motor") {
      await update(ref(rtdb, "controls"), { cycle: false, motor: nextValue });
      return;
    }
    await set(ref(rtdb, `controls/${device}`), nextValue);
  };

  // Derived
  const isOnline      = sensorData.lastSeen > 0 && nowSeconds - sensorData.lastSeen < 15;
  const eau           = sensorData.eau;
  const gaugeColor    = eau < 20 ? C.danger : eau < 50 ? C.warn : C.blue;
  const gaugeFill     = eau < 20
    ? "linear-gradient(180deg, #fca5a5, #ef4444)"
    : eau < 50
    ? "linear-gradient(180deg, #fcd34d, #f59e0b)"
    : "linear-gradient(180deg, #93c5fd, #2563eb)";
  const mins          = Math.floor(timeLeft / 60);
  const secs          = timeLeft % 60;
  const progress      = isRunning ? ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100 : 0;
  const circumference = 2 * Math.PI * 48;

  const displayAlerts = alerts.length > 0 ? alerts : [
    ...(eau < 20 ? [{ id: "w1", text: "Water level critical — immediate action required", color: C.danger }] : []),
    ...(eau < 40 && eau >= 20 ? [{ id: "w2", text: "Water level low — consider irrigation", color: C.warn }] : []),
    ...(sensorData.etat === "PLUIE" ? [{ id: "r1", text: "Rain detected — auto-irrigation paused", color: C.blue }] : []),
  ];

  const cards = sensorConfig(sensorData);
  const sensorTone = {
    etat: "linear-gradient(135deg, rgba(255,251,235,0.96) 0%, rgba(224,242,254,0.92) 100%)",
    pump: "linear-gradient(135deg, rgba(239,246,255,0.97) 0%, rgba(219,234,254,0.92) 100%)",
    motor: "linear-gradient(135deg, rgba(245,243,255,0.98) 0%, rgba(237,233,254,0.93) 100%)",
    pluie: "linear-gradient(135deg, rgba(240,253,250,0.96) 0%, rgba(239,246,255,0.92) 100%)",
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", overflowX: "hidden", fontFamily: "Inter, 'Segoe UI', sans-serif", position: "relative" }}>

      <DashboardBg />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        <div style={{ padding: "26px 32px 34px", maxWidth: 1520, margin: "0 auto", boxSizing: "border-box" }}>

          {/* ── Data stream status banner ───────────────────────────────── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 24px", borderRadius: 16, marginBottom: 24,
            background: isOnline
              ? "linear-gradient(135deg, rgba(220,252,231,0.96), rgba(219,234,254,0.92))"
              : "linear-gradient(135deg, rgba(254,226,226,0.96), rgba(255,237,213,0.9))",
            border: `1.5px solid ${isOnline ? "#bbf7d0" : "#fecaca"}`,
            boxShadow: "0 8px 26px rgba(37,99,235,0.09)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: isOnline ? C.successBg : C.dangerBg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {isOnline
                  ? <FaWifi style={{ color: C.success, fontSize: 17 }} />
                  : <FaCircleExclamation style={{ color: C.danger, fontSize: 17 }} />}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: isOnline ? "#065f46" : "#991b1b" }}>
                  Simulator {isOnline ? "Online" : "Offline"}
                </div>
                <div style={{ fontSize: 13, color: isOnline ? "#047857" : "#b91c1c", marginTop: 2 }}>
                  {isOnline ? "Live sensor data streaming in real-time" : "Device offline — check WiFi and power connection"}
                </div>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 700,
              color: isOnline ? C.success : C.danger,
              background: isOnline ? "#dcfce7" : "#fee2e2",
              padding: "7px 14px", borderRadius: 99,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: isOnline ? C.success : C.danger, animation: "statusBlink 2s ease infinite" }} />
              {isOnline ? "LIVE" : "OFFLINE"}
            </div>
          </div>

          {/* ── 4 Sensor cards ───────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
            {cards.map((card) => {
              const isHov = hoveredCard === card.key;
              const color = card.active ? card.activeColor : card.inactiveColor;
              const bg    = card.active ? card.activeBg    : card.inactiveBg;
              return (
                <div
                  key={card.key}
                  onClick={card.clickable ? () => toggleDevice(card.key) : undefined}
                  onMouseEnter={() => card.clickable && setHoveredCard(card.key)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: sensorTone[card.key],
                    border: `1.5px solid ${card.active ? color + "55" : "rgba(109,40,217,0.14)"}`,
                    borderRadius: 20, padding: "30px 26px",
                    minHeight: 188,
                    boxShadow: isHov ? C.cardHover : C.cardShadow,
                    transform: isHov ? "translateY(-5px)" : "none",
                    transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    cursor: card.clickable ? "pointer" : "default",
                    position: "relative", overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `radial-gradient(circle at 85% 15%, ${color}18 0%, transparent 34%)`,
                    pointerEvents: "none",
                  }} />

                  {/* Top accent */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: card.active
                      ? `linear-gradient(90deg, ${color}, ${card.activeColor === C.blue ? C.purple : C.blue})`
                      : "transparent",
                    borderRadius: "20px 20px 0 0",
                    transition: "all 0.3s",
                  }} />

                  {/* Icon box */}
                  <div style={{
                    width: 62, height: 62, borderRadius: 16,
                    background: card.active
                      ? `linear-gradient(135deg, ${bg}, rgba(255,255,255,0.75))`
                      : `linear-gradient(135deg, ${bg}, rgba(219,234,254,0.72))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 18,
                    border: `1px solid ${color}20`,
                    boxShadow: `0 10px 24px ${color}16`,
                    position: "relative",
                  }}>
                    <card.Icon style={{ fontSize: 25, color }} />
                  </div>

                  <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 700, marginBottom: 8, letterSpacing: "0.03em", position: "relative" }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: card.active ? color : C.text, marginBottom: 8, position: "relative" }}>
                    {card.value}
                  </div>

                  {/* Status pill */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 99,
                    background: card.active ? bg : "rgba(255,255,255,0.72)",
                    border: `1px solid ${color}25`,
                    fontSize: 11, fontWeight: 800, color,
                    position: "relative",
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: card.active ? C.success : "#d1d5db", animation: card.active ? "statusBlink 2s ease infinite" : "none" }} />
                    {card.active ? "ACTIVE" : "INACTIVE"}
                  </div>

                  {card.clickable && (
                    <div style={{ position: "absolute", bottom: 16, right: 18, fontSize: 10, color: C.textLight, fontWeight: 700 }}>
                      tap to toggle
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Bottom 3-column section ──────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr", gap: 20 }}>

            {/* ── Water Gauge (large left column) ──────────────────────── */}
            <div style={{
              background: C.panelMint, border: `1.5px solid ${C.cardBorder}`,
              borderRadius: 24, padding: "38px",
              boxShadow: C.cardShadow,
              display: "flex", flexDirection: "column", alignItems: "center",
              position: "relative", overflow: "hidden", minHeight: 482,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(115deg, rgba(37,99,235,0.08), transparent 42%, rgba(16,185,129,0.1))",
                pointerEvents: "none",
              }} />
              {/* Section label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 34, alignSelf: "flex-start", width: "100%", position: "relative" }}>
                <div style={{ width: 4, height: 18, borderRadius: 99, background: `linear-gradient(180deg, ${C.purple}, ${C.blue})` }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: "0.02em" }}>Water Reservoir</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: C.textMuted, fontWeight: 700 }}>Real-time</span>
              </div>

              {/* Gauge + vertical bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 42, width: "100%", justifyContent: "center", flex: 1, position: "relative" }}>

                {/* Big circular gauge */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 244, height: 244, borderRadius: "50%",
                    border: `5px solid ${gaugeColor}30`,
                    boxShadow: `0 0 0 14px ${gaugeColor}10, 0 14px 46px rgba(37,99,235,0.14)`,
                    overflow: "hidden", position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, #ffffff, #eff6ff)",
                  }}>
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      height: `${eau}%`, background: gaugeFill,
                      transition: "height 1.2s cubic-bezier(0.34,1.56,0.64,1)",
                    }} />
                    {/* Wave */}
                    <div style={{
                      position: "absolute", bottom: `${eau}%`,
                      left: "-50%", width: "200%", height: 16,
                      background: `${gaugeColor}30`,
                      borderRadius: "40%",
                      transform: "scaleY(0.5)",
                      animation: "waveRock 3s ease-in-out infinite",
                    }} />
                    <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
                      <div style={{ fontSize: 62, fontWeight: 900, color: eau < 30 ? "#fff" : C.text, lineHeight: 1, textShadow: eau < 50 ? "0 2px 8px rgba(0,0,0,0.2)" : "none" }}>{eau}%</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: eau < 30 ? "rgba(255,255,255,0.8)" : C.textMuted, letterSpacing: "0.08em", marginTop: 4 }}>WATER LEVEL</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 20 }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 18px", borderRadius: 99,
                      background: eau < 20 ? C.dangerBg : eau < 50 ? C.warnBg : C.infoBg,
                      border: `1.5px solid ${gaugeColor}30`,
                      fontSize: 14, fontWeight: 800, color: gaugeColor,
                    }}>
                      <FaDroplet style={{ fontSize: 11 }} />
                      {eau < 20 ? "CRITICAL" : eau < 50 ? "LOW" : "OPTIMAL"}
                    </div>
                  </div>
                </div>

                {/* Vertical bar + thresholds */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.textMuted }}>Level</div>
                  <div style={{ position: "relative", width: 30, height: 220, background: "rgba(255,255,255,0.74)", borderRadius: 14, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(37,99,235,0.1)" }}>
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      height: `${eau}%`, background: gaugeFill,
                      transition: "height 1.2s cubic-bezier(0.34,1.56,0.64,1)",
                      borderRadius: 14,
                    }} />
                  </div>
                  {/* Thresholds */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                    {[
                      { label: "Optimal", min: 50, color: C.blue },
                      { label: "Low",     min: 20, color: C.warn },
                      { label: "Critical",min: 0,  color: C.danger },
                    ].map((t) => (
                      <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 7, opacity: eau >= t.min ? 1 : 0.4 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>{t.label} ≥{t.min}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Middle: Timer + Device Toggles ───────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Irrigation Timer */}
              <div style={{
                background: C.panelBlue, border: `1.5px solid ${C.cardBorder}`,
                borderRadius: 20, padding: "30px 28px", boxShadow: C.cardShadow, flex: 1,
                minHeight: 270,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 99, background: `linear-gradient(180deg, ${C.purple}, ${C.blue})` }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Irrigation Timer</span>
                </div>

                {!isRunning ? (
                  <>
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <div style={{ fontSize: 54, fontWeight: 900, color: C.purple, lineHeight: 1 }}>
                        {selectedMinutes}
                        <span style={{ fontSize: 18, fontWeight: 700, color: C.textMuted, marginLeft: 4 }}>min</span>
                      </div>
                    </div>
                    <input
                      type="range" min={1} max={10} value={selectedMinutes}
                      onChange={(e) => setSelectedMinutes(Number(e.target.value))}
                      style={{ width: "100%", accentColor: C.purple, marginBottom: 16, cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 22 }}>
                      {[1, 2, 5, 10].map((m) => (
                        <button
                          key={m} onClick={() => setSelectedMinutes(m)}
                          style={{
                            padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 800, cursor: "pointer",
                            background: selectedMinutes === m ? `linear-gradient(135deg,${C.purple},${C.blue})` : "rgba(255,255,255,0.74)",
                            color: selectedMinutes === m ? "#fff" : C.purple,
                            border: `1.5px solid ${selectedMinutes === m ? "transparent" : "rgba(109,40,217,0.2)"}`,
                            transition: "all 0.2s",
                          }}
                        >{m}m</button>
                      ))}
                    </div>
                    <button
                      onClick={startTimer}
                      style={{
                        width: "100%", padding: "16px", border: "none", borderRadius: 14,
                        background: `linear-gradient(135deg, ${C.purple}, ${C.blue})`,
                        color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 15,
                        boxShadow: "0 6px 24px rgba(124,58,237,0.3)", letterSpacing: "0.04em",
                        transition: "all 0.2s",
                      }}
                    >
                      START IRRIGATION
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                      <svg width="132" height="132" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="60" cy="60" r="48" fill="none" stroke="#e0e7ff" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="48" fill="none"
                          stroke="url(#timerG)" strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - (progress / 100) * circumference}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                        <defs>
                          <linearGradient id="timerG" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="100%" stopColor="#2563eb" />
                          </linearGradient>
                        </defs>
                        <text x="60" y="60" textAnchor="middle" dominantBaseline="middle"
                          style={{ transform: "rotate(90deg)", transformOrigin: "60px 60px" }}
                          fill={C.text} fontSize="20" fontWeight="900" fontFamily="Inter,sans-serif">
                          {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
                        </text>
                      </svg>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 13, fontWeight: 800, color: C.purple, letterSpacing: "0.1em", marginBottom: 18, animation: "statusBlink 2s ease infinite" }}>
                      IRRIGATION RUNNING
                    </div>
                    <button
                      onClick={stopTimer}
                      style={{
                        width: "100%", padding: "16px", border: "none", borderRadius: 14,
                        background: "linear-gradient(135deg, #dc2626, #ef4444)",
                        color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 15,
                        boxShadow: "0 6px 24px rgba(220,38,38,0.3)",
                      }}
                    >
                      STOP IRRIGATION
                    </button>
                  </>
                )}
              </div>

              {/* Device Toggles */}
              <div style={{
                background: C.panel, border: `1.5px solid ${C.cardBorder}`,
                borderRadius: 20, padding: "28px", boxShadow: C.cardShadow,
                minHeight: 190,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 99, background: `linear-gradient(180deg, ${C.purple}, ${C.blue})` }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Device Controls</span>
                </div>

                {[
                  { key: "pump",  label: "Water Pump",  Icon: FaDroplet, col: C.blue  },
                  { key: "motor", label: "Clean Motor", Icon: FaGear,    col: C.purple },
                ].map(({ key, label, Icon, col }, idx) => (
                  <div
                    key={key}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "17px 15px", borderRadius: 14,
                      background: sensorData[key]
                        ? `linear-gradient(135deg, ${col}14, rgba(255,255,255,0.82))`
                        : "rgba(255,255,255,0.7)",
                      border: `1.5px solid ${sensorData[key] ? col + "35" : "rgba(109,40,217,0.1)"}`,
                      transition: "all 0.3s",
                      marginBottom: idx === 0 ? 12 : 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: sensorData[key] ? `${col}20` : "rgba(239,246,255,0.9)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {createElement(Icon, { style: { fontSize: 17, color: sensorData[key] ? col : C.textMuted } })}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: sensorData[key] ? col : C.textMuted }}>
                          {sensorData[key] ? "Running" : "Stopped"}
                        </div>
                      </div>
                    </div>
                    {/* Toggle */}
                    <div
                      onClick={() => toggleDevice(key)}
                      style={{
                        position: "relative", width: 54, height: 30, borderRadius: 15,
                        background: sensorData[key] ? `linear-gradient(135deg,${col},${col === C.blue ? C.purple : C.blue})` : "#e5e7eb",
                        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                        boxShadow: sensorData[key] ? `0 4px 14px ${col}40` : "none",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 4, left: sensorData[key] ? 28 : 4,
                        width: 22, height: 22, background: "#fff", borderRadius: "50%",
                        transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Alerts + Solar Info ────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Solar energy widget */}
              <div style={{
                background: `linear-gradient(135deg, #5b21b6 0%, #2563eb 58%, #0f766e 100%)`,
                border: "none", borderRadius: 20, padding: "28px",
                boxShadow: "0 12px 36px rgba(37,99,235,0.25)",
                color: "#fff", position: "relative", overflow: "hidden",
                minHeight: 210,
              }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <div style={{ position: "absolute", top: 10, right: 10, width: 88, height: 88, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, position: "relative" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.17)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaBolt style={{ fontSize: 19, color: "#fde68a" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.75, letterSpacing: "0.08em" }}>SOLAR PANEL</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>Energy Status</div>
                  </div>
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 6, lineHeight: 1 }}>73%</div>
                <div style={{ fontSize: 12, opacity: 0.78, marginBottom: 16 }}>Charging efficiency</div>
                <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.17)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: "73%", height: "100%", background: "linear-gradient(90deg, #fde68a, #fbbf24)", borderRadius: 99, animation: "energyAnim 2.5s ease-in-out infinite alternate" }} />
                </div>
              </div>

              {/* System Alerts */}
              <div style={{
                background: C.panelWarm, border: `1.5px solid ${C.cardBorder}`,
                borderRadius: 20, padding: "28px", boxShadow: C.cardShadow, flex: 1,
                minHeight: 250,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 16, borderRadius: 99, background: `linear-gradient(180deg, ${C.purple}, ${C.blue})` }} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>System Alerts</span>
                  </div>
                  <div style={{
                    padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800,
                    background: displayAlerts.length ? C.dangerBg : C.successBg,
                    color: displayAlerts.length ? C.danger : C.success,
                    border: `1px solid ${displayAlerts.length ? "#fca5a5" : "#6ee7b7"}`,
                  }}>
                    {displayAlerts.length} alert{displayAlerts.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {displayAlerts.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "24px 0", color: C.success }}>
                    <div style={{ width: 54, height: 54, borderRadius: 14, background: C.successBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaBolt style={{ fontSize: 21, color: C.success }} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>All systems operational</div>
                    <div style={{ fontSize: 12, color: C.textMuted, textAlign: "center" }}>No issues detected</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {displayAlerts.map((a) => (
                      <div key={a.id} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "14px 16px", borderRadius: 12,
                        background: a.color === C.danger ? C.dangerBg : a.color === C.warn ? C.warnBg : C.infoBg,
                        border: `1px solid ${a.color}25`,
                      }}>
                        <FaBell style={{ color: a.color, fontSize: 13, marginTop: 1, flexShrink: 0 }} />
                        <span style={{ color: C.text, fontSize: 13, fontWeight: 700, lineHeight: 1.45 }}>{a.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes solarFloat {
          0%   { transform: rotate(var(--rot, 0deg)) translateY(0); opacity: 0.6; }
          100% { transform: rotate(var(--rot, 0deg)) translateY(-18px); opacity: 0.9; }
        }
        @keyframes dotFloat {
          0%   { transform: translateY(0) scale(1); }
          100% { transform: translateY(-14px) scale(1.2); }
        }
        @keyframes bgOrb1 {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(20px, -15px); }
        }
        @keyframes bgOrb2 {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-15px, 20px); }
        }
        @keyframes statusBlink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.4; }
        }
        @keyframes waveRock {
          0%,100% { transform: translateX(-5%) scaleY(0.5); }
          50%     { transform: translateX(5%) scaleY(0.5); }
        }
        @keyframes energyAnim {
          0%   { width: 65%; }
          100% { width: 80%; }
        }
      `}</style>
    </div>
  );
}
