// src/App.jsx
// ─────────────────────────────────────────────────────────────────
//  Root component — handles auth, profile, and Supabase data
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import AuthScreen from "./pages/AuthScreen";
import AssignFlow from "./AssignFlow";

import {
  getSession,
  onAuthChange,
  signOut,
  fetchAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  fetchMCQLinks,
  createMCQLink,
  updateMCQLink,
  deleteMCQLink,
  fetchSessions,
  createSession,
  fetchProfile,
  updateProfile,
} from "./services/supabase";

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#F5F3FF", fontFamily: "'Nunito', system-ui, sans-serif", gap: 16,
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="14" fill="#EDE9FE" />
        <rect x="11" y="10" width="19" height="24" rx="3.5" fill="#C4B5FD" />
        <rect x="15" y="16" width="9" height="2.5" rx="1.25" fill="#7C3AED" />
        <rect x="15" y="21" width="12" height="2" rx="1" fill="#A78BFA" opacity=".5" />
        <circle cx="33" cy="33" r="9" fill="#7C3AED" />
        <path d="M29.5 33l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#7C3AED" }}>
        Loading AssignFlow...
      </p>
    </div>
  );
}

export default function App() {
  const [session,     setSession]     = useState(undefined);
  const [profile,     setProfile]     = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [mcqLinks,    setMcqLinks]    = useState([]);
  const [sessions,    setSessions]    = useState([]);

  // ── Auth listener ─────────────────────────────────────────────
  useEffect(() => {
    getSession().then(setSession);
    const { data: { subscription } } = onAuthChange((s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // ── Load data on login ────────────────────────────────────────
  useEffect(() => {
    if (!session) { setProfile(null); return; }
    Promise.all([fetchAssignments(), fetchMCQLinks(), fetchSessions(), fetchProfile()])
      .then(([a, m, s, p]) => {
        setAssignments(a);
        setMcqLinks(m);
        setSessions(s);
        setProfile(p);
      })
      .catch(console.error);
  }, [session]);

  // ── Assignment handlers ───────────────────────────────────────
  const handleAddAssignment = useCallback(async (payload) => {
    const row = await createAssignment(payload);
    setAssignments((prev) => [...prev, row].sort((a, b) => a.due_date.localeCompare(b.due_date)));
  }, []);

  const handleUpdateAssignment = useCallback(async (id, changes) => {
    const row = await updateAssignment(id, changes);
    setAssignments((prev) => prev.map((a) => (a.id === id ? row : a)));
  }, []);

  const handleDeleteAssignment = useCallback(async (id) => {
    await deleteAssignment(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ── MCQ handlers ──────────────────────────────────────────────
  const handleAddMCQ = useCallback(async (payload) => {
    const row = await createMCQLink(payload);
    setMcqLinks((prev) => [...prev, row].sort((a, b) => a.deadline.localeCompare(b.deadline)));
  }, []);

  const handleUpdateMCQ = useCallback(async (id, changes) => {
    const row = await updateMCQLink(id, changes);
    setMcqLinks((prev) => prev.map((m) => (m.id === id ? row : m)));
  }, []);

  const handleDeleteMCQ = useCallback(async (id) => {
    await deleteMCQLink(id);
    setMcqLinks((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ── Session handler ───────────────────────────────────────────
  const handleAddSession = useCallback(async (payload) => {
    const row = await createSession(payload);
    setSessions((prev) => [row, ...prev]);
  }, []);

  // ── Profile handler ───────────────────────────────────────────
  const handleUpdateProfile = useCallback(async (changes) => {
    const row = await updateProfile(changes);
    setProfile(row);
  }, []);

  // ── Sign out handler ──────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setSession(null);
      setProfile(null);
      setAssignments([]);
      setMcqLinks([]);
      setSessions([]);
    } catch (e) {
      console.error("Sign out error:", e);
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────
  if (session === undefined) return <LoadingScreen />;
  if (!session)              return <AuthScreen />;

  return (
    <AssignFlow
      profile={profile}
      assignments={assignments}
      mcqLinks={mcqLinks}
      sessions={sessions}
      onUpdateProfile={handleUpdateProfile}
      onAddAssignment={handleAddAssignment}
      onUpdateAssignment={handleUpdateAssignment}
      onDeleteAssignment={handleDeleteAssignment}
      onAddMCQ={handleAddMCQ}
      onUpdateMCQ={handleUpdateMCQ}
      onDeleteMCQ={handleDeleteMCQ}
      onAddSession={handleAddSession}
      onSignOut={handleSignOut}
    />
  );
}