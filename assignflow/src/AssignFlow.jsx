import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, Link2, Timer, BarChart3,
  Plus, X, ChevronRight,
  Edit3, Trash2, ExternalLink,
  Play, Pause, RotateCcw,
  Zap, AlertTriangle,
  Target, Clock, TrendingUp, ClipboardList,
} from "lucide-react";

/* ─────────────────────────────────────────
   COLOUR PALETTE
───────────────────────────────────────── */
const C = {
  lavender: "#7C3AED",
  lavenderMid: "#C4B5FD",
  lavenderLight: "#EDE9FE",
  mint: "#059669",
  mintMid: "#6EE7B7",
  mintLight: "#D1FAE5",
  salmon: "#DC2626",
  salmonMid: "#FCA5A5",
  salmonLight: "#FEE2E2",
  blue: "#2563EB",
  blueMid: "#93C5FD",
  blueLight: "#DBEAFE",
  amber: "#D97706",
  amberMid: "#FCD34D",
  amberLight: "#FEF3C7",
  bg: "#F5F3FF",
  white: "#FFFFFF",
  textDark: "#1E1B4B",
  textMid: "#6B7280",
  textLight: "#9CA3AF",
};

/* ─────────────────────────────────────────
   DATE HELPERS
───────────────────────────────────────── */
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const todayStr = toISO(now);
const mkOffset = (days) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return toISO(d);
};

const formatDate = (s) => {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getDaysLeft = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / 86400000);
};

const daysLabel = (dl) => {
  if (dl === null) return "";
  if (dl < 0) return `${Math.abs(dl)}d overdue`;
  if (dl === 0) return "Due today!";
  if (dl === 1) return "Due tomorrow";
  return `${dl}d left`;
};

const urgencyColor = (dl, status) => {
  if (status === "completed" || status === "submitted") return C.mint;
  if (status === "missed") return C.salmon;
  if (dl === null) return C.textMid;
  if (dl < 0 || dl === 0) return C.salmon;
  if (dl <= 2) return C.amber;
  return C.mint;
};

const urgencyBg = (dl, status) => {
  if (status === "completed" || status === "submitted") return C.mintLight;
  if (status === "missed") return C.salmonLight;
  if (dl < 0 || dl === 0) return C.salmonLight;
  if (dl <= 2) return C.amberLight;
  return C.mintLight;
};

const priorityStyle = (p) => ({
  high: { bg: C.salmonLight, text: C.salmon },
  medium: { bg: C.amberLight, text: C.amber },
  low: { bg: C.blueLight, text: C.blue },
}[p] || { bg: C.blueLight, text: C.blue });

/* ─────────────────────────────────────────
/* ─────────────────────────────────────────
   PRIMITIVE UI COMPONENTS
───────────────────────────────────────── */
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: C.white, borderRadius: 16, padding: "14px 16px",
    boxShadow: "0 2px 14px rgba(124,58,237,.07)",
    border: "1px solid rgba(196,181,253,.25)",
    cursor: onClick ? "pointer" : "default", ...style,
  }}>{children}</div>
);

const Pill = ({ text, bg, color }) => (
  <span style={{
    background: bg, color, fontSize: 10, fontWeight: 700,
    padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: ".5px",
  }}>{text}</span>
);

const FieldLabel = ({ children }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".5px" }}>{children}</label>
);

const FieldInput = ({ label, value, onChange, type = "text", placeholder, req }) => (
  <div style={{ marginBottom: 14 }}>
    <FieldLabel>{label}{req && <span style={{ color: C.salmon }}> *</span>}</FieldLabel>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.lavenderMid}`, fontSize: 14, color: C.textDark, background: C.lavenderLight, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
  </div>
);

const FieldSelect = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    <FieldLabel>{label}</FieldLabel>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.lavenderMid}`, fontSize: 14, color: C.textDark, background: C.lavenderLight, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const FieldTextarea = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <FieldLabel>{label}</FieldLabel>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.lavenderMid}`, fontSize: 14, color: C.textDark, background: C.lavenderLight, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
  </div>
);

/* ─────────────────────────────────────────
   SVG ILLUSTRATIONS
───────────────────────────────────────── */

/* Empty state — no assignments */
const IllustrationAssignments = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Paper stack shadow */}
    <rect x="20" y="18" width="50" height="62" rx="8" fill="#DDD6FE" transform="rotate(-4 20 18)" />
    {/* Main paper */}
    <rect x="18" y="14" width="52" height="64" rx="8" fill="#EDE9FE" />
    {/* Clip at top */}
    <rect x="36" y="10" width="16" height="8" rx="4" fill="#C4B5FD" />
    <rect x="39" y="12" width="10" height="4" rx="2" fill="#A78BFA" />
    {/* Title line */}
    <rect x="26" y="26" width="30" height="4" rx="2" fill="#A78BFA" />
    {/* Content lines */}
    <rect x="26" y="34" width="38" height="3" rx="1.5" fill="#DDD6FE" />
    <rect x="26" y="41" width="32" height="3" rx="1.5" fill="#DDD6FE" />
    <rect x="26" y="48" width="36" height="3" rx="1.5" fill="#DDD6FE" />
    <rect x="26" y="55" width="24" height="3" rx="1.5" fill="#DDD6FE" />
    {/* Check badge */}
    <circle cx="66" cy="66" r="16" fill="#7C3AED" />
    <circle cx="66" cy="66" r="12" fill="#6D28D9" />
    <path d="M60 66l4 4 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Empty state — no MCQ links */
const IllustrationMCQ = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background form */}
    <rect x="14" y="12" width="58" height="70" rx="8" fill="#DBEAFE" />
    {/* Header bar */}
    <rect x="14" y="12" width="58" height="16" rx="8" fill="#93C5FD" />
    <rect x="22" y="17" width="28" height="4" rx="2" fill="white" opacity=".7" />
    {/* Row 1 */}
    <rect x="22" y="34" width="12" height="12" rx="3" fill="#BFDBFE" />
    <path d="M25 40l3 3 5-5" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="38" y="36" width="24" height="3" rx="1.5" fill="#BFDBFE" />
    <rect x="38" y="42" width="18" height="2.5" rx="1.25" fill="#DBEAFE" />
    {/* Row 2 */}
    <rect x="22" y="52" width="12" height="12" rx="3" fill="#BFDBFE" />
    <rect x="38" y="54" width="24" height="3" rx="1.5" fill="#BFDBFE" />
    <rect x="38" y="60" width="14" height="2.5" rx="1.25" fill="#DBEAFE" />
    {/* Row 3 partial */}
    <rect x="22" y="70" width="12" height="5" rx="2.5" fill="#DBEAFE" />
    <rect x="38" y="71" width="20" height="3" rx="1.5" fill="#DBEAFE" />
    {/* Link badge */}
    <circle cx="70" cy="70" r="16" fill="#2563EB" />
    <path d="M63 70h14M73 65l5 5-5 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Timer screen decorative header illustration */
const IllustrationTimer = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <circle cx="26" cy="30" r="18" fill="#EDE9FE" />
    <circle cx="26" cy="30" r="13" fill="white" />
    <circle cx="26" cy="30" r="13" stroke="#DDD6FE" strokeWidth="1.5" />
    {/* Hour/minute ticks */}
    <line x1="26" y1="18" x2="26" y2="20" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="38" y1="30" x2="36" y2="30" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="26" y1="42" x2="26" y2="40" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14" y1="30" x2="16" y2="30" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
    {/* Hands */}
    <line x1="26" y1="30" x2="26" y2="22" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="30" x2="32" y2="33" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="26" cy="30" r="2" fill="#7C3AED" />
    {/* Crown */}
    <rect x="22" y="10" width="8" height="4" rx="2" fill="#C4B5FD" />
    <rect x="23" y="8" width="6" height="3" rx="1.5" fill="#A78BFA" />
    {/* Ears */}
    <line x1="18" y1="16" x2="20" y2="19" stroke="#C4B5FD" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="34" y1="16" x2="32" y2="19" stroke="#C4B5FD" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/* Stats screen decorative header illustration */
const IllustrationStats = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Base */}
    <rect x="4" y="44" width="44" height="3" rx="1.5" fill="#DDD6FE" />
    {/* Bars */}
    <rect x="8"  y="32" width="8" height="12" rx="3" fill="#C4B5FD" />
    <rect x="20" y="22" width="8" height="22" rx="3" fill="#7C3AED" />
    <rect x="32" y="14" width="8" height="30" rx="3" fill="#5B21B6" />
    {/* Trend line */}
    <path d="M12 30 L24 20 L36 12" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
    {/* Dot on trend */}
    <circle cx="36" cy="12" r="3" fill="#7C3AED" />
    <circle cx="36" cy="12" r="5" fill="#7C3AED" opacity=".2" />
    {/* Small star sparkle */}
    <path d="M44 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#C4B5FD" />
  </svg>
);

/* Small SVG for study session rows */
const SessionDot = ({ color = "#7C3AED", bg = "#EDE9FE" }) => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="34" height="34" rx="10" fill={bg} />
    <circle cx="17" cy="18" r="7" stroke={color} strokeWidth="1.8" fill="none" />
    <line x1="17" y1="18" x2="17" y2="13" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <line x1="17" y1="18" x2="20" y2="20" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    <rect x="13" y="9" width="8" height="3" rx="1.5" fill={color} opacity=".4" />
  </svg>
);

/* Small SVG for assignment detail header */
const AssignmentDetailIcon = ({ priority }) => {
  const colors = { high: ["#FEE2E2","#DC2626"], medium: ["#FEF3C7","#D97706"], low: ["#DBEAFE","#2563EB"] };
  const [bg, fg] = colors[priority] || colors.medium;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="14" fill={bg} />
      <rect x="12" y="10" width="24" height="28" rx="4" fill="white" opacity=".8" />
      <rect x="16" y="15" width="12" height="2.5" rx="1.25" fill={fg} />
      <rect x="16" y="20" width="16" height="2" rx="1" fill={fg} opacity=".5" />
      <rect x="16" y="24" width="13" height="2" rx="1" fill={fg} opacity=".4" />
      <rect x="16" y="28" width="10" height="2" rx="1" fill={fg} opacity=".3" />
    </svg>
  );
};

/* Small SVG for MCQ detail header */
const MCQDetailIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="14" fill="#DBEAFE" />
    <rect x="11" y="12" width="26" height="24" rx="4" fill="white" opacity=".8" />
    <rect x="16" y="17" width="8" height="8" rx="2" fill="#93C5FD" />
    <path d="M18 21l2 2 3.5-3.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="27" y="18.5" width="7" height="2" rx="1" fill="#BFDBFE" />
    <rect x="27" y="22" width="5" height="2" rx="1" fill="#BFDBFE" />
    <path d="M24 40 C24 36 28 34 32 34 C36 34 40 36 40 40" stroke="#93C5FD" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="32" cy="30" r="3" fill="#2563EB" opacity=".3" />
  </svg>
);

const Modal = ({ title, onClose, onSave, saving, saveError, children }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: "fixed", inset: 0, background: "rgba(30,27,75,.45)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
    onClick={onClose}>
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      onClick={(e) => e.stopPropagation()}
      style={{ background: C.white, borderRadius: "22px 22px 0 0", padding: "22px 20px 40px", width: "100%", maxWidth: 480, margin: "0 auto", maxHeight: "88vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.textDark }}>{title}</h3>
        <button onClick={onClose} style={{ background: C.lavenderLight, border: "none", borderRadius: 10, padding: 7, cursor: "pointer", display: "flex" }}>
          <X size={18} color={C.lavender} />
        </button>
      </div>
      {children}
      {saveError && (
        <div style={{ marginBottom: 10, padding: "10px 14px", background: C.salmonLight, borderRadius: 10, color: C.salmon, fontSize: 13, fontWeight: 700 }}>
          {saveError}
        </div>
      )}
      <button
        onClick={onSave}
        disabled={saving}
        style={{ width: "100%", padding: 14, borderRadius: 12, background: saving ? C.lavenderLight : C.lavender, color: saving ? C.lavender : C.white, border: "none", fontSize: 15, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", marginTop: 4, fontFamily: "inherit" }}>
        {saving ? "Saving..." : "Save"}
      </button>
    </motion.div>
  </motion.div>
);

/* ─────────────────────────────────────────
   ASSIGNMENT CARD
───────────────────────────────────────── */
const AssignmentCard = ({ a, onClick }) => {
  const dl = getDaysLeft(a.due_date);
  const uc = urgencyColor(dl, a.status);
  const ub = urgencyBg(dl, a.status);
  const pc = priorityStyle(a.priority);
  const done = a.status === "completed";

  return (
    <motion.div layout whileTap={{ scale: 0.98 }} onClick={onClick}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: C.white, borderRadius: 14, padding: "12px 14px", marginBottom: 10, cursor: "pointer", boxShadow: "0 2px 8px rgba(124,58,237,.07)", border: "1px solid rgba(196,181,253,.2)", display: "flex", alignItems: "center", gap: 12 }}>
      {/* Status icon */}
      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: ub, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {done ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" fill={C.mint} /><path d="M7 11l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : a.status === "in_progress" ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="4" fill={C.amber} opacity=".15"/><path d="M11 4v5l4 2" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="11" r="8" stroke={C.amber} strokeWidth="1.5" fill="none" /></svg>
        ) : dl !== null && dl < 0 ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3L20 19H2L11 3Z" fill={C.salmonLight} stroke={C.salmon} strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 9v4" stroke={C.salmon} strokeWidth="1.8" strokeLinecap="round"/><circle cx="11" cy="16" r="1" fill={C.salmon}/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="16" height="18" rx="3.5" fill={C.lavenderLight} stroke={C.lavenderMid} strokeWidth="1.2"/><rect x="7" y="7" width="8" height="1.8" rx=".9" fill={C.lavender} opacity=".7"/><rect x="7" y="10.5" width="6" height="1.5" rx=".75" fill={C.lavender} opacity=".4"/><rect x="7" y="13.5" width="7" height="1.5" rx=".75" fill={C.lavender} opacity=".3"/></svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: done ? C.textLight : C.textDark, textDecoration: done ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: C.textMid }}>{a.subject}</span>
          <span style={{ fontSize: 11, color: uc, fontWeight: 700 }}>· {daysLabel(dl)}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <Pill text={a.priority} bg={pc.bg} color={pc.text} />
        <ChevronRight size={14} color={C.textLight} />
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   MCQ CARD
───────────────────────────────────────── */
const MCQCard = ({ m, onClick }) => {
  const dl = getDaysLeft(m.deadline);
  const uc = urgencyColor(dl, m.status);
  const ub = urgencyBg(dl, m.status);
  const sc = { pending: { bg: C.amberLight, text: C.amber, label: "Pending" }, submitted: { bg: C.mintLight, text: C.mint, label: "Submitted" }, missed: { bg: C.salmonLight, text: C.salmon, label: "Missed" } }[m.status] || {};

  return (
    <motion.div layout whileTap={{ scale: 0.98 }} onClick={onClick}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: C.white, borderRadius: 14, padding: "12px 14px", marginBottom: 10, cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,.06)", border: "1px solid rgba(147,197,253,.25)", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: ub, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {m.status === "submitted" ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="4" fill={C.mint}/><path d="M7 11l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : m.status === "missed" ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="4" fill={C.salmonLight} stroke={C.salmon} strokeWidth="1.2"/><path d="M8 8l6 6M14 8l-6 6" stroke={C.salmon} strokeWidth="1.8" strokeLinecap="round"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="4" fill={C.blueLight} stroke={C.blueMid} strokeWidth="1.2"/><path d="M8 11h6M12 8.5l3 2.5-3 2.5" stroke={C.blue} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: C.textMid }}>{m.subject}</span>
          <span style={{ fontSize: 11, color: uc, fontWeight: 700 }}>· {daysLabel(dl)}</span>
        </div>
      </div>
      <Pill text={sc.label} bg={sc.bg} color={sc.text} />
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   FILTER CHIPS
───────────────────────────────────────── */
const FilterRow = ({ options, active, onChange, accent }) => (
  <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
    {options.map((o) => {
      const on = active === o.value;
      return (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          padding: "5px 14px", borderRadius: 20, border: "none", whiteSpace: "nowrap",
          background: on ? (accent || C.lavender) : C.lavenderLight,
          color: on ? C.white : (accent || C.lavender),
          fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>{o.label}</button>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────
   SCREEN: DASHBOARD
───────────────────────────────────────── */
const DashboardScreen = ({ assignments, mcqLinks, sessions, nav, profile, onUpdateProfile }) => {
  const { isDesktop, isTablet } = useBreakpoint();
  const px = isDesktop ? 32 : 16;

  const todayTasks = assignments.filter((a) => a.due_date === todayStr && a.status !== "completed");
  const overdue = assignments.filter((a) => { const dl = getDaysLeft(a.due_date); return dl !== null && dl < 0 && a.status !== "completed"; });
  const upcomingMCQ = mcqLinks.filter((m) => { const dl = getDaysLeft(m.deadline); return dl !== null && dl >= 0 && dl <= 2 && m.status === "pending"; });
  const todayStudy = sessions.filter((s) => s.created_at?.slice(0, 10) === todayStr).reduce((sum, s) => sum + s.duration, 0);

  const hasAlert = todayTasks.length > 0 || overdue.length > 0 || upcomingMCQ.length > 0;
  const critAlert = overdue.length > 0;

  // Profile setup modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [nameInput, setNameInput]   = useState(profile?.display_name || "");
  const [genderInput, setGenderInput] = useState(profile?.gender || "");
  const [profileSaving, setProfileSaving] = useState(false);

  const displayName = profile?.display_name;
  const gender      = profile?.gender;

  // Greeting based on gender
  const greeting = displayName
    ? `Hello, ${displayName}`
    : "Good to see you";

  // Gender avatar colors
  const avatarColor = gender === "female" ? C.blue : gender === "male" ? C.lavender : C.mint;
  const avatarBg    = gender === "female" ? C.blueLight : gender === "male" ? C.lavenderLight : C.mintLight;

  // Avatar initials
  const initials = displayName
    ? displayName.trim().split(" ").map((w) => w[0].toUpperCase()).slice(0, 2).join("")
    : "?";

  async function saveProfile() {
    if (!nameInput.trim()) return;
    setProfileSaving(true);
    try {
      await onUpdateProfile({ display_name: nameInput.trim(), gender: genderInput || null });
      setShowProfileModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setProfileSaving(false);
    }
  }

  return (
    <div style={{ padding: `0 ${px}px 100px` }}>

      {/* ── Header ── */}
      <div style={{ padding: "26px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.textMid, letterSpacing: ".5px", textTransform: "uppercase" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, color: C.textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {greeting}
          </h1>
          {gender && (
            <p style={{ margin: "3px 0 0", fontSize: 12, color: C.textMid, fontWeight: 600, textTransform: "capitalize" }}>
              {gender === "male" ? "Student" : gender === "female" ? "Student" : "Student"}
            </p>
          )}
        </div>

        {/* Avatar */}
        <motion.div
          whileTap={{ scale: 0.94 }}
          onClick={() => { setNameInput(profile?.display_name || ""); setGenderInput(profile?.gender || ""); setShowProfileModal(true); }}
          style={{ flexShrink: 0, marginLeft: 12, width: 46, height: 46, borderRadius: 14, background: avatarBg, border: `2px solid ${avatarColor}22`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          {displayName ? (
            <span style={{ fontSize: 16, fontWeight: 800, color: avatarColor }}>{initials}</span>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="8" r="4" stroke={avatarColor} strokeWidth="1.8" fill="none"/>
              <path d="M3 19c0-4 3.6-7 8-7s8 3 8 7" stroke={avatarColor} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
            </svg>
          )}
        </motion.div>
      </div>

      {/* ── Profile setup prompt (first login) ── */}
      {!displayName && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: C.lavenderLight, borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, border: `1px solid ${C.lavenderMid}`, cursor: "pointer" }}
          onClick={() => { setNameInput(""); setGenderInput(""); setShowProfileModal(true); }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill={C.lavenderLight}/>
            <circle cx="16" cy="12" r="5" stroke={C.lavender} strokeWidth="1.8" fill="none"/>
            <path d="M6 27c0-5.5 4.5-9 10-9s10 3.5 10 9" stroke={C.lavender} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          </svg>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.lavender }}>Set up your profile</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textMid, fontWeight: 600 }}>Add your name and gender</p>
          </div>
          <ChevronRight size={16} color={C.lavender} style={{ marginLeft: "auto", flexShrink: 0 }} />
        </motion.div>
      )}

      {/* Alert Banner */}
      {hasAlert && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: critAlert ? C.salmonLight : C.amberLight, borderRadius: 14, padding: "12px 16px", marginBottom: 18, border: `1px solid ${critAlert ? C.salmonMid : C.amberMid}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <AlertTriangle size={18} color={critAlert ? C.salmon : C.amber} style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            {overdue.length > 0 && <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.salmon }}>{overdue.length} overdue assignment{overdue.length > 1 ? "s" : ""}!</p>}
            {todayTasks.length > 0 && <p style={{ margin: overdue.length ? "3px 0 0" : 0, fontSize: 13, fontWeight: 700, color: C.amber }}>{todayTasks.length} assignment{todayTasks.length > 1 ? "s" : ""} due today</p>}
            {upcomingMCQ.length > 0 && <p style={{ margin: "3px 0 0", fontSize: 12, color: C.textMid, fontWeight: 600 }}>{upcomingMCQ.length} MCQ form{upcomingMCQ.length > 1 ? "s" : ""} due very soon</p>}
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
        {[
          {
            label: "Due Today", value: todayTasks.length, color: C.salmon, bg: C.salmonLight,
            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="15" rx="3" stroke={C.salmon} strokeWidth="1.6" fill="none"/><path d="M6 2v2M14 2v2" stroke={C.salmon} strokeWidth="1.6" strokeLinecap="round"/><path d="M2 8h16" stroke={C.salmon} strokeWidth="1.4"/><rect x="6" y="11" width="3" height="3" rx="1" fill={C.salmon}/></svg>,
          },
          {
            label: "MCQ Urgent", value: upcomingMCQ.length, color: C.blue, bg: C.blueLight,
            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="3" stroke={C.blue} strokeWidth="1.6" fill="none"/><rect x="6" y="6" width="4" height="4" rx="1" fill={C.blue} opacity=".5"/><path d="M5.5 8l1.5 1.5 2.5-2.5" stroke={C.blue} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="12" y="7" width="3" height="1.5" rx=".75" fill={C.blue} opacity=".5"/><rect x="12" y="10" width="2" height="1.5" rx=".75" fill={C.blue} opacity=".4"/><rect x="6" y="13" width="8" height="1.5" rx=".75" fill={C.blue} opacity=".3"/></svg>,
          },
          {
            label: "Study (min)", value: todayStudy, color: C.lavender, bg: C.lavenderLight,
            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="11" r="6.5" stroke={C.lavender} strokeWidth="1.6" fill="none"/><path d="M10 8v3l2 1.5" stroke={C.lavender} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="7" y="2" width="6" height="2.5" rx="1.25" fill={C.lavenderMid}/></svg>,
          },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * .07 }}
            style={{ background: s.bg, borderRadius: 14, padding: "13px 10px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{s.icon}</div>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 9.5, color: C.textMid, fontWeight: 700, lineHeight: 1.3, textTransform: "uppercase", letterSpacing: ".4px" }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* All clear hero */}
      {!hasAlert && todayTasks.length === 0 && overdue.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: C.mintLight, borderRadius: 18, padding: "20px 20px 16px", marginBottom: 22, display: "flex", alignItems: "center", gap: 16, border: `1px solid ${C.mintMid}` }}>
          {/* Hero illustration */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <circle cx="32" cy="32" r="28" fill="#D1FAE5" />
            {/* Checkmark shield */}
            <path d="M32 14 L46 20 L46 32 C46 40 39 46 32 50 C25 46 18 40 18 32 L18 20 Z" fill="white" opacity=".9" />
            <path d="M32 14 L46 20 L46 32 C46 40 39 46 32 50 C25 46 18 40 18 32 L18 20 Z" stroke="#6EE7B7" strokeWidth="1.5" fill="none" />
            {/* Big check */}
            <path d="M25 31l5 5 10-10" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Sparkles */}
            <circle cx="12" cy="16" r="2" fill="#6EE7B7" opacity=".7" />
            <circle cx="52" cy="20" r="1.5" fill="#6EE7B7" opacity=".6" />
            <circle cx="14" cy="46" r="1.5" fill="#6EE7B7" opacity=".5" />
            <circle cx="50" cy="48" r="2" fill="#6EE7B7" opacity=".6" />
            <path d="M8 28l1.5 3-1.5 1 1.5-1 1.5 1-1.5-1 1.5-3-1.5 1z" fill="#059669" opacity=".4" />
          </svg>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.mint }}>All clear!</p>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#065F46", fontWeight: 600, lineHeight: 1.4 }}>No overdue work or urgent deadlines today. Keep it up.</p>
          </div>
        </motion.div>
      )}
      <h2 style={{ fontSize: 15, fontWeight: 800, color: C.textDark, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          {
            label: "Add Assignment", screen: "assignments", color: C.lavender, bg: C.lavenderLight,
            svg: (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="3" width="16" height="20" rx="3" fill="#C4B5FD"/><rect x="7" y="7" width="8" height="2" rx="1" fill="#7C3AED"/><rect x="7" y="11" width="10" height="1.5" rx=".75" fill="#A78BFA" opacity=".6"/><rect x="7" y="14.5" width="8" height="1.5" rx=".75" fill="#A78BFA" opacity=".5"/><circle cx="20" cy="20" r="7" fill="#7C3AED"/><path d="M17 20h6M20 17v6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            ),
          },
          {
            label: "Add MCQ Link", screen: "mcq", color: C.blue, bg: C.blueLight,
            svg: (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="4" width="18" height="20" rx="3" fill="#93C5FD"/><rect x="6" y="8" width="6" height="6" rx="1.5" fill="#BFDBFE"/><path d="M7.5 11l2 2 3-3" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="14" y="9" width="5" height="1.5" rx=".75" fill="#BFDBFE"/><rect x="14" y="12" width="3.5" height="1.5" rx=".75" fill="#BFDBFE"/><circle cx="20" cy="20" r="7" fill="#2563EB"/><path d="M16.5 20h7M22 17l3 3-3 3" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ),
          },
          {
            label: "Start Timer", screen: "timer", color: C.mint, bg: C.mintLight,
            svg: (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="16" r="10" fill="#6EE7B7"/><circle cx="14" cy="16" r="7" fill="white"/><line x1="14" y1="16" x2="14" y2="11" stroke="#059669" strokeWidth="1.8" strokeLinecap="round"/><line x1="14" y1="16" x2="17" y2="18" stroke="#34D399" strokeWidth="1.4" strokeLinecap="round"/><circle cx="14" cy="16" r="1.5" fill="#059669"/><rect x="10" y="5" width="8" height="3" rx="1.5" fill="#6EE7B7"/><line x1="8" y1="8" x2="6" y2="10" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/><line x1="20" y1="8" x2="22" y2="10" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/></svg>
            ),
          },
          {
            label: "View Stats", screen: "stats", color: C.amber, bg: C.amberLight,
            svg: (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="18" width="5" height="8" rx="2" fill="#FCD34D"/><rect x="11" y="13" width="5" height="13" rx="2" fill="#D97706"/><rect x="19" y="8" width="5" height="18" rx="2" fill="#B45309"/><path d="M5 17L13 12L21 7" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 1.5"/></svg>
            ),
          },
        ].map((a, i) => (
          <motion.div key={i} whileTap={{ scale: .95 }} onClick={() => nav(a.screen)}
            style={{ background: a.bg, borderRadius: 14, padding: "14px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            {a.svg}
            <span style={{ fontSize: 13, fontWeight: 700, color: a.color }}>{a.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Due Today */}
      {todayTasks.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="2" width="16" height="14" rx="3" fill={C.salmonLight} stroke={C.salmon} strokeWidth="1.3"/><path d="M5 1.5v2M13 1.5v2" stroke={C.salmon} strokeWidth="1.3" strokeLinecap="round"/><path d="M1 7h16" stroke={C.salmon} strokeWidth="1.1"/><rect x="5.5" y="10" width="3" height="3" rx="1" fill={C.salmon}/></svg>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.textDark }}>Due Today</h2>
            </div>
            <span onClick={() => nav("assignments")} style={{ fontSize: 12, color: C.lavender, fontWeight: 700, cursor: "pointer" }}>See all</span>
          </div>
          {todayTasks.map((a) => <AssignmentCard key={a.id} a={a} onClick={() => nav("assignments")} />)}
        </>
      )}

      {/* MCQ Soon */}
      {upcomingMCQ.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="2" width="15" height="14" rx="3" fill={C.blueLight} stroke={C.blueMid} strokeWidth="1.3"/><rect x="4" y="6" width="4" height="4" rx="1" fill={C.blue} opacity=".5"/><path d="M4.5 8l1.5 1.5 2-2" stroke={C.blue} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="10" y="7" width="4" height="1.5" rx=".75" fill={C.blue} opacity=".5"/><rect x="10" y="10" width="3" height="1.5" rx=".75" fill={C.blue} opacity=".4"/></svg>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.textDark }}>MCQ Due Soon</h2>
            </div>
            <span onClick={() => nav("mcq")} style={{ fontSize: 12, color: C.blue, fontWeight: 700, cursor: "pointer" }}>See all</span>
          </div>
          {upcomingMCQ.map((m) => <MCQCard key={m.id} m={m} onClick={() => nav("mcq")} />)}
        </>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <>
          <div style={{ margin: "18px 0 10px" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.salmon, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={16} color={C.salmon} /> Overdue
            </h2>
          </div>
          {overdue.map((a) => <AssignmentCard key={a.id} a={a} onClick={() => nav("assignments")} />)}
        </>
      )}

      {/* ── Profile Modal ── */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(30,27,75,.45)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
            onClick={() => setShowProfileModal(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: C.white, borderRadius: "22px 22px 0 0", padding: "22px 20px 40px", width: "100%", maxWidth: 480, margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.textDark }}>Your Profile</h3>
                <button onClick={() => setShowProfileModal(false)} style={{ background: C.lavenderLight, border: "none", borderRadius: 10, padding: 7, cursor: "pointer", display: "flex" }}>
                  <X size={18} color={C.lavender} />
                </button>
              </div>

              {/* Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".5px" }}>
                  Display Name <span style={{ color: C.salmon }}>*</span>
                </label>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.lavenderMid}`, fontSize: 14, color: C.textDark, background: C.lavenderLight, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>

              {/* Gender */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".5px" }}>Gender</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { value: "male",   label: "Male",   color: C.lavender, bg: C.lavenderLight },
                    { value: "female", label: "Female", color: C.blue,     bg: C.blueLight     },
                    { value: "other",  label: "Other",  color: C.mint,     bg: C.mintLight     },
                  ].map((g) => (
                    <button key={g.value} onClick={() => setGenderInput(g.value)}
                      style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: `2px solid ${genderInput === g.value ? g.color : "transparent"}`, background: genderInput === g.value ? g.bg : "#F5F3FF", color: genderInput === g.value ? g.color : C.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={saveProfile} disabled={profileSaving}
                style={{ width: "100%", padding: 14, borderRadius: 12, background: profileSaving ? C.lavenderLight : C.lavender, color: profileSaving ? C.lavender : C.white, border: "none", fontSize: 15, fontWeight: 800, cursor: profileSaving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {profileSaving ? "Saving..." : "Save Profile"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────
   FILE UPLOADER  (image / PDF / DOCX)
───────────────────────────────────────── */

// Accepted MIME types and their display info
const FILE_TYPES = {
  "image/png":       { label: "Image",  color: C.lavender, bg: C.lavenderLight },
  "image/jpeg":      { label: "Image",  color: C.lavender, bg: C.lavenderLight },
  "image/webp":      { label: "Image",  color: C.lavender, bg: C.lavenderLight },
  "application/pdf": { label: "PDF",    color: C.salmon,   bg: C.salmonLight   },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                     { label: "DOCX",   color: C.blue,     bg: C.blueLight     },
  "application/msword":
                     { label: "DOC",    color: C.blue,     bg: C.blueLight     },
};

const ACCEPT = Object.keys(FILE_TYPES).join(",");

function fileIcon(mime) {
  if (mime?.startsWith("image/")) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="3" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="7" cy="8" r="1.5" fill="currentColor"/>
      <path d="M1 15l5-5 4 4 3-3 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (mime === "application/pdf") return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="1" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M7 7h8M7 11h8M7 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="13" y="13" width="6" height="6" rx="2" fill="currentColor" opacity=".15"/>
      <path d="M14 16h4M16 14v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="1" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M7 6h5M7 10h8M7 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13 1v5h5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

const FileUploader = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const inputRef = useRef(null);

  // value is stored as JSON string: { url, name, mime }
  const attachment = (() => { try { return value ? JSON.parse(value) : null; } catch { return null; } })();
  const isImage    = attachment?.mime?.startsWith("image/");
  const fileInfo   = FILE_TYPES[attachment?.mime] ?? { label: "File", color: C.lavender, bg: C.lavenderLight };

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!FILE_TYPES[file.type]) { setError("Only images, PDF and DOCX are supported."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Max file size is 10 MB."); return; }
    setError(""); setUploading(true);
    try {
      const { supabase } = await import("./services/supabase");
      const ext  = file.name.split(".").pop();
      const path = `assignments/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("assignment-files")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("assignment-files").getPublicUrl(path);
      onChange(JSON.stringify({ url: data.publicUrl, name: file.name, mime: file.type }));
    } catch (e) {
      setError(e.message ?? "Upload failed. Check your Storage bucket.");
    } finally {
      setUploading(false);
    }
  }

  function remove() { onChange(""); if (inputRef.current) inputRef.current.value = ""; }

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>
        Attachment <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(image, PDF or DOCX)</span>
      </label>

      {attachment ? (
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1.5px solid ${fileInfo.bg}` }}>
          {/* Image preview */}
          {isImage && (
            <img src={attachment.url} alt="attachment"
              style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
          )}
          {/* Non-image file row */}
          {!isImage && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: fileInfo.bg }}>
              <div style={{ color: fileInfo.color, flexShrink: 0 }}>{fileIcon(attachment.mime)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{attachment.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.textMid, fontWeight: 600 }}>{fileInfo.label} · tap to open</p>
              </div>
              <a href={attachment.url} target="_blank" rel="noreferrer"
                style={{ background: fileInfo.color, color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none", flexShrink: 0 }}>
                Open
              </a>
            </div>
          )}
          {/* Remove bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 10px", background: "#fff" }}>
            <button onClick={remove}
              style={{ background: C.salmonLight, border: "none", borderRadius: 8, padding: "4px 12px", color: C.salmon, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}>
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <motion.div whileTap={{ scale: 0.98 }}
          onClick={() => !uploading && inputRef.current?.click()}
          style={{ border: `2px dashed ${C.lavenderMid}`, borderRadius: 12, padding: "20px 16px", textAlign: "center", background: C.lavenderLight, cursor: uploading ? "not-allowed" : "pointer" }}>
          {/* Upload icon */}
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style={{ margin: "0 auto 8px", display: "block" }}>
            <circle cx="17" cy="17" r="16" fill="white" />
            <path d="M17 11v10M12 16l5-5 5 5" stroke={C.lavender} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 25h14" stroke={C.lavenderMid} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.lavender }}>
            {uploading ? "Uploading..." : "Tap to attach a file"}
          </p>
          {/* File type pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
            {[
              { label: "Image", color: C.lavender, bg: "#fff" },
              { label: "PDF",   color: C.salmon,   bg: "#fff" },
              { label: "DOCX",  color: C.blue,     bg: "#fff" },
            ].map((t) => (
              <span key={t.label} style={{ fontSize: 10, fontWeight: 700, color: t.color, background: t.bg, border: `1px solid ${t.color}33`, padding: "2px 8px", borderRadius: 6 }}>{t.label}</span>
            ))}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: C.textLight }}>Max 10 MB</p>
        </motion.div>
      )}

      <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleFile} style={{ display: "none" }} />

      {error && <p style={{ margin: "6px 0 0", fontSize: 12, color: C.salmon, fontWeight: 700 }}>{error}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────
   SCREEN: ASSIGNMENTS
───────────────────────────────────────── */
const defaultAForm = { title: "", subject: "", description: "", due_date: todayStr, priority: "medium", status: "pending", image_url: "" };

const AssignmentsScreen = ({ assignments, onAdd, onUpdate, onDelete }) => {
  const { isDesktop } = useBreakpoint();
  const px = isDesktop ? 32 : 16;
  const [filter, setFilter] = useState("all");
  const [subjFilter, setSubjFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultAForm);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const subjects = ["all", ...Array.from(new Set(assignments.map((a) => a.subject).filter(Boolean)))];

  const filtered = assignments
    .filter((a) => (filter === "all" || a.status === filter) && (subjFilter === "all" || a.subject === subjFilter))
    .sort((a, b) => (getDaysLeft(a.due_date) ?? 999) - (getDaysLeft(b.due_date) ?? 999));

  const openAdd = () => { setForm(defaultAForm); setEditing(null); setSaveError(""); setModal(true); };
  const openEdit = (a) => { setForm({ title: a.title, subject: a.subject, description: a.description || "", due_date: a.due_date, priority: a.priority, status: a.status, image_url: a.image_url || "" }); setEditing(a); setSaveError(""); setModal(true); setDetail(null); };
  const handleSave = async () => {
    if (!form.title.trim()) { setSaveError("Title is required."); return; }
    setSaving(true); setSaveError("");
    try {
      editing ? await onUpdate(editing.id, form) : await onAdd(form);
      setModal(false); setEditing(null); setForm(defaultAForm);
    } catch (e) {
      setSaveError(e.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Detail view
  if (detail) {
    const a = assignments.find((x) => x.id === detail.id) || detail;
    const dl = getDaysLeft(a.due_date);
    const pc = priorityStyle(a.priority);
    const statusOpts = ["pending", "in_progress", "completed"];
    return (
      <div style={{ padding: `0 ${px}px 100px` }}>
        <div style={{ padding: "20px 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setDetail(null)} style={{ background: C.lavenderLight, border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
            <ChevronRight size={18} color={C.lavender} style={{ transform: "rotate(180deg)" }} />
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.textDark }}>Assignment</h1>
        </div>
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <AssignmentDetailIcon priority={a.priority} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.textDark, flex: 1, lineHeight: 1.3, paddingRight: 8 }}>{a.title}</h2>
                <Pill text={a.priority} bg={pc.bg} color={pc.text} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                <span style={{ background: C.lavenderLight, color: C.lavender, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>{a.subject}</span>
                <span style={{ background: urgencyBg(dl, a.status), color: urgencyColor(dl, a.status), fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>{daysLabel(dl)}</span>
              </div>
            </div>
          </div>
          {a.description && <p style={{ margin: "4px 0 0", fontSize: 14, color: C.textMid, lineHeight: 1.6 }}>{a.description}</p>}
          {(() => {
            if (!a.image_url) return null;
            let att; try { att = JSON.parse(a.image_url); } catch { att = { url: a.image_url, mime: "image/jpeg", name: "attachment" }; }
            const isImg = att.mime?.startsWith("image/");
            const fi = FILE_TYPES?.[att.mime] ?? { label: "File", color: C.lavender, bg: C.lavenderLight };
            return isImg ? (
              <img src={att.url} alt="attachment" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, marginTop: 12, display: "block" }} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, padding: "12px 14px", background: fi.bg, borderRadius: 10 }}>
                <div style={{ color: fi.color }}>{fileIcon(att.mime)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{att.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.textMid }}>{fi.label}</p>
                </div>
                <a href={att.url} target="_blank" rel="noreferrer"
                  style={{ background: fi.color, color: "white", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                  Open
                </a>
              </div>
            );
          })()}
        </Card>
        <Card style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: ".5px" }}>Due Date</p>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.textDark }}>{formatDate(a.due_date)}</p>
        </Card>
        <Card style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: ".5px" }}>Update Status</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {statusOpts.map((s) => {
              const on = a.status === s;
              const label = s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);
              return (
                <button key={s} onClick={() => { onUpdate(a.id, { status: s }); setDetail({ ...a, status: s }); }}
                  style={{ padding: "10px 4px", borderRadius: 10, border: `2px solid ${on ? C.lavender : C.lavenderMid}`, background: on ? C.lavender : C.lavenderLight, color: on ? C.white : C.textMid, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{label}</button>
              );
            })}
          </div>
        </Card>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => openEdit(a)} style={{ flex: 1, padding: 13, borderRadius: 12, background: C.blueLight, border: "none", color: C.blue, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Edit3 size={16} /> Edit
          </button>
          <button onClick={() => { onDelete(a.id); setDetail(null); }} style={{ flex: 1, padding: 13, borderRadius: 12, background: C.salmonLight, border: "none", color: C.salmon, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
        <AnimatePresence>{modal && (
          <Modal title={editing ? "Edit Assignment" : "New Assignment"} onClose={() => setModal(false)} onSave={handleSave} saving={saving} saveError={saveError}>
            <FieldInput label="Title" value={form.title} onChange={(v) => f("title", v)} req placeholder="Assignment title" />
            <FieldInput label="Subject" value={form.subject} onChange={(v) => f("subject", v)} placeholder="e.g. CS, Math" />
            <FieldTextarea label="Description" value={form.description} onChange={(v) => f("description", v)} placeholder="Details…" />
            <FileUploader value={form.image_url} onChange={(v) => f("image_url", v)} />
            <FieldInput label="Due Date" value={form.due_date} onChange={(v) => f("due_date", v)} type="date" />
            <FieldSelect label="Priority" value={form.priority} onChange={(v) => f("priority", v)} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
            <FieldSelect label="Status" value={form.status} onChange={(v) => f("status", v)} options={[{ value: "pending", label: "Pending" }, { value: "in_progress", label: "In Progress" }, { value: "completed", label: "Completed" }]} />
          </Modal>
        )}</AnimatePresence>
      </div>
    );
  }

  return (
    <div style={{ padding: `0 ${px}px 100px` }}>
      <div style={{ padding: "22px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: C.textDark }}>Assignments</h1>
        <motion.button whileTap={{ scale: .95 }} onClick={openAdd} style={{ background: C.lavender, border: "none", borderRadius: 12, padding: "9px 16px", color: C.white, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> Add
        </motion.button>
      </div>

      <FilterRow active={filter} onChange={setFilter} options={[
        { value: "all", label: "All" }, { value: "pending", label: "Pending" },
        { value: "in_progress", label: "In Progress" }, { value: "completed", label: "Done" },
      ]} />

      {subjects.length > 2 && (
        <FilterRow active={subjFilter} onChange={setSubjFilter} accent={C.blue} options={subjects.map((s) => ({ value: s, label: s === "all" ? "All Subjects" : s }))} />
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <IllustrationAssignments />
          <p style={{ color: C.textMid, fontSize: 15, fontWeight: 600, margin: 0 }}>No assignments here</p>
          <p style={{ color: C.textLight, fontSize: 13, margin: 0 }}>Tap Add to get started</p>
        </div>
      ) : filtered.map((a) => <AssignmentCard key={a.id} a={a} onClick={() => setDetail(a)} />)}

      <AnimatePresence>{modal && (
        <Modal title={editing ? "Edit Assignment" : "New Assignment"} onClose={() => setModal(false)} onSave={handleSave} saving={saving} saveError={saveError}>
          <FieldInput label="Title" value={form.title} onChange={(v) => f("title", v)} req placeholder="Assignment title" />
          <FieldInput label="Subject" value={form.subject} onChange={(v) => f("subject", v)} placeholder="e.g. CS, Math" />
          <FieldTextarea label="Description" value={form.description} onChange={(v) => f("description", v)} placeholder="Details…" />
          <FileUploader value={form.image_url} onChange={(v) => f("image_url", v)} />
          <FieldInput label="Due Date" value={form.due_date} onChange={(v) => f("due_date", v)} type="date" />
          <FieldSelect label="Priority" value={form.priority} onChange={(v) => f("priority", v)} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
          <FieldSelect label="Status" value={form.status} onChange={(v) => f("status", v)} options={[{ value: "pending", label: "Pending" }, { value: "in_progress", label: "In Progress" }, { value: "completed", label: "Completed" }]} />
        </Modal>
      )}</AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────
   SCREEN: MCQ LINKS
───────────────────────────────────────── */
const defaultMForm = { title: "", link: "", subject: "", deadline: todayStr, status: "pending" };

const MCQScreen = ({ mcqLinks, onAdd, onUpdate, onDelete }) => {
  const { isDesktop } = useBreakpoint();
  const px = isDesktop ? 32 : 16;
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultMForm);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const filtered = mcqLinks
    .filter((m) => filter === "all" || m.status === filter)
    .sort((a, b) => (getDaysLeft(a.deadline) ?? 999) - (getDaysLeft(b.deadline) ?? 999));

  const openAdd = () => { setForm(defaultMForm); setEditing(null); setSaveError(""); setModal(true); };
  const openEdit = (m) => { setForm({ title: m.title, link: m.link, subject: m.subject, deadline: m.deadline, status: m.status }); setEditing(m); setSaveError(""); setModal(true); setDetail(null); };
  const handleSave = async () => {
    if (!form.title.trim()) { setSaveError("Title is required."); return; }
    if (!form.link.trim())  { setSaveError("Form URL is required."); return; }
    setSaving(true); setSaveError("");
    try {
      editing ? await onUpdate(editing.id, form) : await onAdd(form);
      setModal(false); setEditing(null); setForm(defaultMForm);
    } catch (e) {
      setSaveError(e.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  if (detail) {
    const m = mcqLinks.find((x) => x.id === detail.id) || detail;
    const dl = getDaysLeft(m.deadline);
    const sc = { pending: { bg: C.amberLight, text: C.amber, label: "Pending" }, submitted: { bg: C.mintLight, text: C.mint, label: "Submitted" }, missed: { bg: C.salmonLight, text: C.salmon, label: "Missed" } }[m.status] || {};
    return (
      <div style={{ padding: `0 ${px}px 100px` }}>
        <div style={{ padding: "20px 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setDetail(null)} style={{ background: C.blueLight, border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
            <ChevronRight size={18} color={C.blue} style={{ transform: "rotate(180deg)" }} />
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.textDark }}>MCQ Form</h1>
        </div>
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <MCQDetailIcon />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.textDark, flex: 1, lineHeight: 1.3, paddingRight: 8 }}>{m.title}</h2>
                <Pill text={sc.label} bg={sc.bg} color={sc.text} />
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={{ background: C.blueLight, color: C.blue, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>{m.subject}</span>
              </div>
            </div>
          </div>
        </Card>
        <Card style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: ".5px" }}>Deadline</p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: urgencyColor(dl, m.status) }}>{formatDate(m.deadline)} · {daysLabel(dl)}</p>
        </Card>
        <motion.button whileTap={{ scale: .97 }} onClick={() => window.open(m.link, "_blank")}
          style={{ width: "100%", padding: 14, borderRadius: 12, background: C.blue, color: C.white, border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <ExternalLink size={18} /> Open Form
        </motion.button>
        <Card style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: ".5px" }}>Update Status</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {["pending", "submitted", "missed"].map((s) => {
              const on = m.status === s;
              return (
                <button key={s} onClick={() => { onUpdate(m.id, { status: s }); setDetail({ ...m, status: s }); }}
                  style={{ padding: 10, borderRadius: 10, border: `2px solid ${on ? C.blue : C.blueMid}`, background: on ? C.blue : C.blueLight, color: on ? C.white : C.textMid, fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
              );
            })}
          </div>
        </Card>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => openEdit(m)} style={{ flex: 1, padding: 13, borderRadius: 12, background: C.blueLight, border: "none", color: C.blue, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Edit3 size={16} /> Edit
          </button>
          <button onClick={() => { onDelete(m.id); setDetail(null); }} style={{ flex: 1, padding: 13, borderRadius: 12, background: C.salmonLight, border: "none", color: C.salmon, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
        <AnimatePresence>{modal && (
          <Modal title="Edit MCQ Link" onClose={() => setModal(false)} onSave={handleSave} saving={saving} saveError={saveError}>
            <FieldInput label="Title" value={form.title} onChange={(v) => f("title", v)} req placeholder="Quiz/form title" />
            <FieldInput label="Google Form URL" value={form.link} onChange={(v) => f("link", v)} req placeholder="https://forms.google.com/..." type="url" />
            <FieldInput label="Subject" value={form.subject} onChange={(v) => f("subject", v)} placeholder="e.g. CS, Math" />
            <FieldInput label="Deadline" value={form.deadline} onChange={(v) => f("deadline", v)} type="date" />
            <FieldSelect label="Status" value={form.status} onChange={(v) => f("status", v)} options={[{ value: "pending", label: "Pending" }, { value: "submitted", label: "Submitted" }, { value: "missed", label: "Missed" }]} />
          </Modal>
        )}</AnimatePresence>
      </div>
    );
  }

  return (
    <div style={{ padding: `0 ${px}px 100px` }}>
      <div style={{ padding: "22px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: C.textDark }}>MCQ Links</h1>
        <motion.button whileTap={{ scale: .95 }} onClick={openAdd} style={{ background: C.blue, border: "none", borderRadius: 12, padding: "9px 16px", color: C.white, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> Add
        </motion.button>
      </div>

      <FilterRow active={filter} onChange={setFilter} accent={C.blue} options={[
        { value: "all", label: "All" }, { value: "pending", label: "Pending" },
        { value: "submitted", label: "Submitted" }, { value: "missed", label: "Missed" },
      ]} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <IllustrationMCQ />
          <p style={{ color: C.textMid, fontSize: 15, fontWeight: 600, margin: 0 }}>No MCQ links here</p>
          <p style={{ color: C.textLight, fontSize: 13, margin: 0 }}>Tap Add to track a form</p>
        </div>
      ) : filtered.map((m) => <MCQCard key={m.id} m={m} onClick={() => setDetail(m)} />)}

      <AnimatePresence>{modal && (
        <Modal title={editing ? "Edit MCQ Link" : "New MCQ Link"} onClose={() => setModal(false)} onSave={handleSave} saving={saving} saveError={saveError}>
          <FieldInput label="Title" value={form.title} onChange={(v) => f("title", v)} req placeholder="Quiz/form title" />
          <FieldInput label="Google Form URL" value={form.link} onChange={(v) => f("link", v)} req placeholder="https://forms.google.com/…" type="url" />
          <FieldInput label="Subject" value={form.subject} onChange={(v) => f("subject", v)} placeholder="e.g. CS, Math" />
          <FieldInput label="Deadline" value={form.deadline} onChange={(v) => f("deadline", v)} type="date" />
          <FieldSelect label="Status" value={form.status} onChange={(v) => f("status", v)} options={[{ value: "pending", label: "Pending" }, { value: "submitted", label: "Submitted" }, { value: "missed", label: "Missed" }]} />
        </Modal>
      )}</AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────
   SCREEN: POMODORO TIMER
───────────────────────────────────────── */
const TimerScreen = ({ assignments, mcqLinks, onSaveSession }) => {
  const { isDesktop } = useBreakpoint();
  const px = isDesktop ? 32 : 16;
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [doneSessions, setDoneSessions] = useState(0);
  const [linked, setLinked] = useState("");
  const [linkedType, setLinkedType] = useState("assignment");
  const tick = useRef(null);
  const stateRef = useRef({ onBreak, focusMin, breakMin, linked, linkedType, doneSessions });

  useEffect(() => { stateRef.current = { onBreak, focusMin, breakMin, linked, linkedType, doneSessions }; });

  useEffect(() => {
    if (running) {
      tick.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(tick.current);
            setRunning(false);
            const { onBreak: ob, focusMin: fm, breakMin: bm, linked: ln, linkedType: lt } = stateRef.current;
            if (!ob) {
              setDoneSessions((s) => s + 1);
              onSaveSession({ duration: fm, type: lt || null, related_title: ln || "Free study" });
              setOnBreak(true);
              return bm * 60;
            } else {
              setOnBreak(false);
              return fm * 60;
            }
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(tick.current);
  }, [running]);

  const toggle = () => setRunning((r) => !r);
  const reset = () => { clearInterval(tick.current); setRunning(false); setTimeLeft(focusMin * 60); setOnBreak(false); };
  const switchFocus = (m) => { if (!running) { setFocusMin(m); setTimeLeft(m * 60); setOnBreak(false); } };

  const total = onBreak ? breakMin * 60 : focusMin * 60;
  const progress = 1 - timeLeft / total;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const R = 90;
  const circ = 2 * Math.PI * R;
  const activeColor = onBreak ? C.mint : C.lavender;

  const allItems = [
    ...assignments.map((a) => ({ label: `[Assignment] ${a.title}`, value: a.title, type: "assignment" })),
    ...mcqLinks.map((m) => ({ label: `[MCQ] ${m.title}`, value: m.title, type: "mcq" })),
  ];

  return (
    <div style={{ padding: `0 ${px}px 100px` }}>
      <div style={{ padding: "22px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: C.textDark }}>Study Timer</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMid, fontWeight: 600 }}>
            {doneSessions} session{doneSessions !== 1 ? "s" : ""} done today
          </p>
        </div>
        <IllustrationTimer />
      </div>

      {/* Mode */}
      <div style={{ display: "flex", gap: 10, marginBottom: 26 }}>
        {[25, 50].map((m) => (
          <motion.button key={m} whileTap={{ scale: .95 }} onClick={() => switchFocus(m)} style={{
            flex: 1, padding: 11, borderRadius: 12, border: "none",
            background: focusMin === m ? C.lavender : C.lavenderLight,
            color: focusMin === m ? C.white : C.lavender,
            fontSize: 15, fontWeight: 800, cursor: running ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
            {m === 25
              ? <Clock size={16} color={focusMin === m ? C.white : C.lavender} />
              : <Zap size={16} color={focusMin === m ? C.white : C.lavender} />}
            {m} min
          </motion.button>
        ))}
      </div>

      {/* Circle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
        <div style={{ position: "relative", width: 224, height: 224 }}>
          <svg width="224" height="224" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="112" cy="112" r={R} fill="none" stroke={C.lavenderLight} strokeWidth="13" />
            <circle cx="112" cy="112" r={R} fill="none" stroke={activeColor} strokeWidth="13"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: C.textLight, letterSpacing: 2, textTransform: "uppercase" }}>{onBreak ? "Break" : "Focus"}</p>
            <p style={{ margin: "4px 0 0", fontSize: 46, fontWeight: 800, color: activeColor, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: C.textMid, fontWeight: 600 }}>{focusMin} min session</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 28 }}>
        <motion.button whileTap={{ scale: .93 }} onClick={reset} style={{ width: 52, height: 52, borderRadius: 16, background: C.lavenderLight, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RotateCcw size={22} color={C.lavender} />
        </motion.button>
        <motion.button whileTap={{ scale: .93 }} onClick={toggle} style={{
          width: 76, height: 76, borderRadius: 24, border: "none", cursor: "pointer",
          background: activeColor, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 28px ${activeColor}55`
        }}>
          {running ? <Pause size={32} color={C.white} /> : <Play size={32} color={C.white} />}
        </motion.button>
        <div style={{ width: 52 }} />
      </div>

      {/* Break Duration */}
      <Card style={{ marginBottom: 14 }}>
        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: ".5px" }}>Break Duration</p>
        <div style={{ display: "flex", gap: 8 }}>
          {[5, 10, 15].map((b) => (
            <button key={b} onClick={() => setBreakMin(b)} style={{
              flex: 1, padding: "9px 4px", borderRadius: 10, border: "none",
              background: breakMin === b ? C.mint : C.mintLight,
              color: breakMin === b ? C.white : C.mint,
              fontSize: 13, fontWeight: 800, cursor: "pointer",
            }}>{b} min</button>
          ))}
        </div>
      </Card>

      {/* Link task */}
      <Card>
        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: ".5px" }}>Link to Task (optional)</p>
        <select value={linked} onChange={(e) => {
          const item = allItems.find((i) => i.value === e.target.value);
          setLinked(e.target.value);
          if (item) setLinkedType(item.type);
        }} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.lavenderMid}`, fontSize: 13, color: C.textDark, background: C.lavenderLight, outline: "none", fontFamily: "inherit" }}>
          <option value="">— Free Study —</option>
          {allItems.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
        </select>
      </Card>
    </div>
  );
};

/* ─────────────────────────────────────────
   SCREEN: STATS
───────────────────────────────────────── */
const StatsScreen = ({ assignments, mcqLinks, sessions }) => {
  const { isDesktop } = useBreakpoint();
  const px = isDesktop ? 32 : 16;
  const completed = assignments.filter((a) => a.status === "completed").length;
  const overdue = assignments.filter((a) => { const dl = getDaysLeft(a.due_date); return dl !== null && dl < 0 && a.status !== "completed"; }).length;
  const inProg = assignments.filter((a) => a.status === "in_progress").length;
  const total = assignments.length;
  const cRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const mcqSub = mcqLinks.filter((m) => m.status === "submitted").length;
  const mcqMissed = mcqLinks.filter((m) => m.status === "missed").length;
  const mcqTotal = mcqLinks.length;
  const sRate = mcqTotal > 0 ? Math.round((mcqSub / mcqTotal) * 100) : 0;

  const totalMin = sessions.reduce((s, x) => s + x.duration, 0);
  const todayMin = sessions.filter((s) => s.created_at?.slice(0, 10) === todayStr).reduce((s, x) => s + x.duration, 0);

  const subjects = {};
  assignments.forEach((a) => {
    if (!subjects[a.subject]) subjects[a.subject] = { total: 0, done: 0 };
    subjects[a.subject].total++;
    if (a.status === "completed") subjects[a.subject].done++;
  });

  const Bar = ({ label, value, max, color, delay = 0 }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color, fontWeight: 800 }}>{value}/{max}</span>
      </div>
      <div style={{ background: C.lavenderLight, borderRadius: 6, height: 8, overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: max > 0 ? `${(value / max) * 100}%` : "0%" }} transition={{ duration: .9, delay }}
          style={{ background: color, borderRadius: 6, height: 8 }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: `0 ${px}px 100px` }}>
      <div style={{ padding: "22px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: C.textDark }}>Progress</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMid, fontWeight: 600 }}>Your academic performance</p>
        </div>
        <IllustrationStats />
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { Icon: Target,      label: "Completion",   value: `${cRate}%`,    color: C.mint,    bg: C.mintLight },
          { Icon: ClipboardList, label: "MCQ Submitted", value: `${sRate}%`, color: C.blue,    bg: C.blueLight },
          { Icon: Clock,       label: "Total Study",  value: `${totalMin}m`, color: C.lavender, bg: C.lavenderLight },
          { Icon: TrendingUp,  label: "Today Study",  value: `${todayMin}m`, color: C.amber,   bg: C.amberLight },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .09 }}
            style={{ background: s.bg, borderRadius: 16, padding: "16px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <s.Icon size={18} color={s.color} />
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textMid, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px" }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Breakdowns — 2-col grid on desktop */}
      <div style={{ display: isDesktop ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Assignments breakdown */}
        <Card style={{ marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: C.textDark }}>Assignments</h3>
          <Bar label="Completed" value={completed} max={total} color={C.mint} delay={.1} />
          <Bar label="In Progress" value={inProg} max={total} color={C.amber} delay={.2} />
          <Bar label="Overdue" value={overdue} max={total} color={C.salmon} delay={.3} />
        </Card>

        {/* MCQ breakdown */}
        <Card style={{ marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: C.textDark }}>MCQ Forms</h3>
          <Bar label="Submitted" value={mcqSub} max={mcqTotal} color={C.mint} delay={.1} />
          <Bar label="Missed" value={mcqMissed} max={mcqTotal} color={C.salmon} delay={.2} />
        </Card>

        {/* Subject breakdown */}
        {Object.keys(subjects).length > 0 && (
          <Card style={{ marginBottom: 14 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: C.textDark }}>By Subject</h3>
            {Object.entries(subjects).map(([subj, d], i) => (
              <Bar key={subj} label={subj} value={d.done} max={d.total} color={C.lavender} delay={i * .08} />
            ))}
          </Card>
        )}

        {/* Recent sessions */}
        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: C.textDark }}>Recent Sessions</h3>
        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="22" fill="#EDE9FE" />
              <circle cx="28" cy="28" r="15" fill="white" />
              <circle cx="28" cy="28" r="15" stroke="#DDD6FE" strokeWidth="1.5" />
              <line x1="28" y1="14.5" x2="28" y2="17" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="41.5" y1="28" x2="39" y2="28" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="28" y1="41.5" x2="28" y2="39" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14.5" y1="28" x2="17" y2="28" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="28" y1="28" x2="28" y2="20" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="28" y1="28" x2="33" y2="30" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="28" cy="28" r="2" fill="#7C3AED" />
            </svg>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textMid }}>No sessions yet</p>
            <p style={{ margin: 0, fontSize: 12, color: C.textLight }}>Complete a timer session to see it here</p>
          </div>
        ) : (
          [...sessions].reverse().slice(0, 5).map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <SessionDot color={s.type === "mcq" ? C.blue : C.lavender} bg={s.type === "mcq" ? C.blueLight : C.lavenderLight} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.related_title}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.textMid }}>{s.duration} min · {formatDate(s.created_at)}</p>
              </div>
              <span style={{ background: C.lavenderLight, color: C.lavender, fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 8, flexShrink: 0 }}>{s.duration}m</span>
            </div>
          ))
        )}
      </Card>

      </div>{/* end responsive breakdowns grid */}
    </div>
  );
};

/* ─────────────────────────────────────────
   BOTTOM NAV
───────────────────────────────────────── */
const TABS = [
  { id: "dashboard",   Icon: Home,     label: "Home"  },
  { id: "assignments", Icon: BookOpen, label: "Tasks" },
  { id: "mcq",         Icon: Link2,    label: "MCQ"   },
  { id: "timer",       Icon: Timer,    label: "Timer" },
  { id: "stats",       Icon: BarChart3,label: "Stats" },
];

const BottomNav = ({ current, nav }) => (
  <div style={{
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 480,
    background: "rgba(255,255,255,.97)", backdropFilter: "blur(16px)",
    borderTop: "1px solid rgba(196,181,253,.25)",
    display: "flex", zIndex: 100,
    padding: "6px 8px env(safe-area-inset-bottom, 12px)",
    gap: 4,
  }}>
    {TABS.map(({ id, Icon, label }) => {
      const active = current === id;
      return (
        <button
          key={id}
          onClick={() => nav(id)}
          style={{
            flex: 1, border: "none", background: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, padding: "6px 4px", position: "relative", borderRadius: 12,
            outline: "none",
          }}
        >
          {/* Pill — always rendered, fades in/out */}
          <div style={{
            position: "absolute",
            top: 4, left: "50%", transform: "translateX(-50%)",
            width: 46, height: 32,
            background: active ? C.lavenderLight : "transparent",
            borderRadius: 10,
            transition: "background 0.22s ease",
            zIndex: 0,
          }} />

          {/* Icon */}
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            height: 32, width: "100%",
          }}>
            <Icon
              size={20}
              color={active ? C.lavender : C.textLight}
              strokeWidth={active ? 2.5 : 1.8}
              style={{ transition: "color 0.2s" }}
            />
          </div>

          {/* Label */}
          <span style={{
            fontSize: 10,
            fontWeight: active ? 800 : 500,
            color: active ? C.lavender : C.textLight,
            letterSpacing: ".3px",
            position: "relative", zIndex: 1,
            transition: "color 0.2s, font-weight 0.2s",
          }}>
            {label}
          </span>
        </button>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────
   RESPONSIVE LAYOUT HOOK
───────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile:  w < 640,
    isTablet:  w >= 640 && w < 1024,
    isDesktop: w >= 1024,
    width: w,
  };
}

/* ─────────────────────────────────────────
   SIDEBAR NAV  (desktop / laptop)
───────────────────────────────────────── */
const SidebarNav = ({ current, nav }) => (
  <div style={{
    width: 220,
    flexShrink: 0,
    background: C.white,
    borderRight: "1px solid rgba(196,181,253,.2)",
    display: "flex",
    flexDirection: "column",
    padding: "28px 16px 24px",
    height: "100vh",
    position: "sticky",
    top: 0,
    boxShadow: "2px 0 12px rgba(124,58,237,.04)",
  }}>
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 8 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill={C.lavenderLight}/>
        <rect x="8" y="8" width="13" height="17" rx="3" fill={C.lavenderMid}/>
        <rect x="10" y="12" width="7" height="2" rx="1" fill={C.lavender}/>
        <rect x="10" y="16" width="9" height="1.5" rx=".75" fill={C.lavender} opacity=".5"/>
        <circle cx="24" cy="24" r="8" fill={C.lavender}/>
        <path d="M21 24l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontSize: 17, fontWeight: 900, color: C.textDark, letterSpacing: "-.3px" }}>AssignFlow</span>
    </div>

    {/* Nav items */}
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      {TABS.map(({ id, Icon, label }) => {
        const active = current === id;
        return (
          <button key={id} onClick={() => nav(id)} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "11px 14px", borderRadius: 12,
            border: "none", cursor: "pointer",
            background: active ? C.lavenderLight : "transparent",
            color: active ? C.lavender : C.textMid,
            fontFamily: "inherit", fontSize: 14,
            fontWeight: active ? 800 : 600,
            transition: "background .18s, color .18s",
            width: "100%", textAlign: "left",
          }}>
            <Icon size={19} color={active ? C.lavender : C.textLight} strokeWidth={active ? 2.5 : 1.8} />
            {label}
            {active && (
              <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: 3, background: C.lavender }} />
            )}
          </button>
        );
      })}
    </div>

    {/* Footer */}
    <div style={{ paddingLeft: 8, borderTop: `1px solid ${C.lavenderLight}`, paddingTop: 16 }}>
      <p style={{ margin: 0, fontSize: 11, color: C.textLight, fontWeight: 600 }}>AssignFlow v1.0</p>
      <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textLight }}>Student Productivity</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   ASSIGNFLOW — MAIN EXPORT
───────────────────────────────────────── */
export default function AssignFlow({
  profile     = null,
  assignments = [],
  mcqLinks    = [],
  sessions    = [],
  onUpdateProfile,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onAddMCQ,
  onUpdateMCQ,
  onDeleteMCQ,
  onAddSession,
}) {
  const [screen, setScreen] = useState("dashboard");
  const { isMobile, isTablet, isDesktop, width } = useBreakpoint();

  const screenMap = {
    dashboard:   <DashboardScreen   assignments={assignments} mcqLinks={mcqLinks} sessions={sessions} nav={setScreen} profile={profile} onUpdateProfile={onUpdateProfile} />,
    assignments: <AssignmentsScreen assignments={assignments} onAdd={onAddAssignment} onUpdate={onUpdateAssignment} onDelete={onDeleteAssignment} />,
    mcq:         <MCQScreen         mcqLinks={mcqLinks}      onAdd={onAddMCQ}        onUpdate={onUpdateMCQ}        onDelete={onDeleteMCQ} />,
    timer:       <TimerScreen       assignments={assignments} mcqLinks={mcqLinks} onSaveSession={onAddSession} />,
    stats:       <StatsScreen       assignments={assignments} mcqLinks={mcqLinks} sessions={sessions} />,
  };

  // Column width: mobile=full, tablet=540px, desktop=auto capped
  const contentMaxWidth = isMobile ? "100%" : isTablet ? 600 : 780;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #F5F3FF; font-family: 'Nunito', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD6FE; border-radius: 6px; }
        input, select, textarea, button { font-family: 'Nunito', system-ui, sans-serif; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: .6; cursor: pointer; }
      `}</style>

      <div style={{
        display: "flex",
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}>
        {/* Sidebar — desktop/laptop only */}
        {isDesktop && <SidebarNav current={screen} nav={setScreen} />}

        {/* Main content area */}
        <div style={{
          flex: 1,
          display: "flex",
          justifyContent: isDesktop ? "flex-start" : "center",
          overflowY: "auto",
          paddingBottom: !isDesktop ? 80 : 0,
        }}>
          <div style={{
            width: "100%",
            maxWidth: contentMaxWidth,
            position: "relative",
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.16 }}
              >
                {screenMap[screen]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom nav — mobile & tablet only */}
        {!isDesktop && <BottomNav current={screen} nav={setScreen} />}
      </div>
    </>
  );
}