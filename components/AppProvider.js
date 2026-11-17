"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { assignments as seedAssignments } from "@/data/data";
import { effectiveStatus } from "@/lib/utils";
import Icon from "@/components/Icon";

const AppContext = createContext(null);
const STORE_KEY = "cc-state-v1";

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeStore(patch) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), ...patch }));
  } catch {
    /* storage unavailable — demo still works in memory */
  }
}

export function AppProvider({ children }) {
  const [submissions, setSubmissions] = useState({}); // id -> { file, note, at }
  const [accent, setAccentState] = useState("teal");
  const [toasts, setToasts] = useState([]);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const s = readStore();
    if (s.submissions) setSubmissions(s.submissions);
    if (s.accent) setAccentState(s.accent);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  const assignments = useMemo(
    () =>
      seedAssignments.map((a) => {
        const sub = submissions[a.id];
        const base = sub ? { ...a, status: "Submitted", submission: sub } : a;
        return { ...base, state: effectiveStatus(base) };
      }),
    [submissions]
  );

  const toast = useCallback((message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const submitAssignment = useCallback((id, payload) => {
    setSubmissions((prev) => {
      const next = { ...prev, [id]: { ...payload, at: new Date().toISOString() } };
      writeStore({ submissions: next });
      return next;
    });
  }, []);

  const setAccent = useCallback((value) => {
    setAccentState(value);
    writeStore({ accent: value });
  }, []);

  const resetDemo = useCallback(() => {
    setSubmissions({});
    writeStore({ submissions: {} });
  }, []);

  const value = { assignments, submitAssignment, resetDemo, accent, setAccent, toast };

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            <Icon name={t.tone === "success" ? "checkCircle" : "alert"} size={18} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
