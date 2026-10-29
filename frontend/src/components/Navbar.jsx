import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaSolarPanel, FaArrowRightFromBracket } from "react-icons/fa6";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";

function Navbar() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("solar_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "Operator";
  const initials    = displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const handleLogout = async () => {
    try { await signOut(auth); } catch { /* ignore */ }
    localStorage.removeItem("solar_user");
    navigate("/auth/login", { replace: true });
  };

  return (
    <header style={{
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "14px 24px",
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1.5px solid rgba(109,40,217,0.1)",
      boxShadow: "0 2px 20px rgba(109,40,217,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxSizing: "border-box",
    }}>

      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: "linear-gradient(135deg, #7c3aed, #2563eb)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
          flexShrink: 0,
        }}>
          <FaSolarPanel style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7c3aed", fontWeight: 700, lineHeight: 1, marginBottom: 2 }}>
            Solar Irrigation
          </div>
          <div style={{
            fontSize: 18, fontWeight: 900, lineHeight: 1,
            background: "linear-gradient(135deg, #4c1d95, #7c3aed, #2563eb)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Control Dashboard
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>

        {/* User pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#f5f3ff",
          border: "1.5px solid rgba(124,58,237,0.15)",
          borderRadius: 40,
          padding: "6px 16px 6px 6px",
          boxShadow: "0 2px 8px rgba(124,58,237,0.06)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, lineHeight: 1, marginBottom: 1 }}>Welcome back</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
            e.currentTarget.style.boxShadow = "0 12px 26px rgba(37,99,235,0.24)";
            e.currentTarget.style.borderColor = "rgba(37,99,235,0.32)";
            e.currentTarget.style.background = "linear-gradient(135deg, #7c3aed, #2563eb)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(79,70,229,0.16)";
            e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)";
            e.currentTarget.style.background = "linear-gradient(135deg, #8b5cf6, #2563eb)";
          }}
          style={{
            width: 48, height: 48,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0,
            background: "linear-gradient(135deg, #8b5cf6, #2563eb)",
            border: "1.5px solid rgba(124,58,237,0.2)",
            borderRadius: "50%",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            fontFamily: "inherit",
            boxShadow: "0 8px 20px rgba(79,70,229,0.16)",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 5,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              pointerEvents: "none",
            }}
          />
          <FaArrowRightFromBracket style={{ fontSize: 17, position: "relative", zIndex: 1 }} />
        </button>
      </div>
    </header>
  );
}

export default React.memo(Navbar);
