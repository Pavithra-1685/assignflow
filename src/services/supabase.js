// src/services/supabase.js
// ─────────────────────────────────────────────────────────────────
//  Supabase client + all database service functions for AssignFlow
//  Requires: npm install @supabase/supabase-js
//  Env vars:  VITE_SUPABASE_URL  /  VITE_SUPABASE_ANON_KEY
// ─────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

// ── Client singleton ──────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    "[AssignFlow] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n" +
    "Create a .env file in the project root with these two values."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Auth ──────────────────────────────────────────────────────────

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ── Assignments ───────────────────────────────────────────────────

export async function fetchAssignments() {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createAssignment(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("assignments")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAssignment(id, changes) {
  const { data, error } = await supabase
    .from("assignments")
    .update(changes)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAssignment(id) {
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throw error;
}

// ── MCQ Links ─────────────────────────────────────────────────────

export async function fetchMCQLinks() {
  const { data, error } = await supabase
    .from("mcq_links")
    .select("*")
    .order("deadline", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createMCQLink(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("mcq_links")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMCQLink(id, changes) {
  const { data, error } = await supabase
    .from("mcq_links")
    .update(changes)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMCQLink(id) {
  const { error } = await supabase.from("mcq_links").delete().eq("id", id);
  if (error) throw error;
}

// ── Study Sessions ────────────────────────────────────────────────

export async function fetchSessions() {
  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function createSession(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("study_sessions")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSession(id) {
  const { error } = await supabase.from("study_sessions").delete().eq("id", id);
  if (error) throw error;
}

// ── User Profile ──────────────────────────────────────────────────

/** Fetch the current user's profile row from public.users */
export async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
}

/** Update display_name and gender for the current user */
export async function updateProfile(changes) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("users")
    .upsert({ id: user.id, email: user.email, ...changes })
    .select()
    .single();
  if (error) throw error;
  return data;
}