// src/pages/AuthScreen.jsx
// ─────────────────────────────────────────────────────────────────
//  Login / Sign-up screen for AssignFlow
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn, signUp } from "../services/supabase";

// ── Palette (matches main app) ────────────────────────────────────
const C = {
  lavender:      "#7C3AED",
  lavenderMid:   "#C4B5FD",
  lavenderLight: "#EDE9FE",
  salmon:        "#DC2626",
  salmonLight:   "#FEE2E2",
  bg:            "#F5F3FF",
  white:         "#FFFFFF",
  textDark:      "#1E1B4B",
  textMid:       "#6B7280",
};

// ── Small reusable input field ────────────────────────────────────
function InputField({ type, placeholder, value, onChange, icon }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: C.lavenderLight, borderRadius: 12,
      padding: "12px 16px", marginBottom: 12,
    }}>
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === "password" ? "current-password" : "email"}
        style={{
          flex: 1, border: "none", background: "transparent",
          outline: "none", fontSize: 15, color: C.textDark,
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────
export default function AuthScreen() {
  const [mode,     setMode]     = useState("login"); // "login" | "signup"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      mode === "login"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    } catch (e) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError("");
    setEmail("");
    setPassword("");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'Nunito', system-ui, sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%", maxWidth: 400,
          background: C.white, borderRadius: 24,
          padding: "36px 28px",
          boxShadow: "0 8px 40px rgba(124,58,237,0.13)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", margin: "0 auto 14px" }}>
            <rect width="56" height="56" rx="16" fill="#EDE9FE" />
            <rect x="13" y="12" width="22" height="28" rx="4" fill="#C4B5FD" />
            <rect x="17" y="18" width="11" height="3" rx="1.5" fill="#7C3AED" />
            <rect x="17" y="24" width="14" height="2.5" rx="1.25" fill="#A78BFA" opacity=".6" />
            <rect x="17" y="29" width="10" height="2.5" rx="1.25" fill="#A78BFA" opacity=".4" />
            <circle cx="37" cy="37" r="11" fill="#7C3AED" />
            <path d="M33 37l3 3 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: C.textDark }}>AssignFlow</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: C.textMid, fontWeight: 600 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Fields */}
        <InputField
          type="email"
          placeholder="Email address"
          value={email}
          onChange={setEmail}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="3" width="16" height="12" rx="3" stroke={C.lavenderMid} strokeWidth="1.4" fill="none"/>
              <path d="M1 6l8 5 8-5" stroke={C.lavenderMid} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          }
        />
        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="8" width="12" height="9" rx="2.5" stroke={C.lavenderMid} strokeWidth="1.4" fill="none"/>
              <path d="M6 8V6a3 3 0 016 0v2" stroke={C.lavenderMid} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              <circle cx="9" cy="12.5" r="1.2" fill={C.lavenderMid}/>
            </svg>
          }
        />

        {/* Error message */}
        {error && (
          <div style={{
            margin: "2px 0 14px",
            padding: "10px 14px",
            background: C.salmonLight,
            borderRadius: 10,
            color: C.salmon,
            fontSize: 13,
            fontWeight: 700,
          }}>
            {error}
          </div>
        )}

        {/* Submit button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading ? C.lavenderLight : C.lavender,
            color: loading ? C.lavender : "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "inherit",
            transition: "background .2s",
          }}
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </motion.button>

        {/* Toggle */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.textMid }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={toggleMode}
            style={{ color: C.lavender, fontWeight: 800, cursor: "pointer" }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </span>
        </p>
      </motion.div>
    </div>
  );
}