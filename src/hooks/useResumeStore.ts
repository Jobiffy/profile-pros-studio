import { useState, useCallback, useEffect, useRef } from "react";
import { ResumeData } from "@/types/resume";
import { ChatMessage } from "@/hooks/useResumeAI";
import { sampleResume } from "@/data/sampleResume";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export interface SavedResume {
  id: string;
  name: string;
  data: ResumeData;
  chatMessages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// Legacy un-namespaced keys (pre-Supabase). On the first authed device we
// upload them to that account once, then leave the flag so a different account
// signing in on the same browser does not inherit them.
const LEGACY_STORAGE_KEY = "jobiffy-resumes";
const LEGACY_ACTIVE_KEY = "jobiffy-active-resume";
const MIGRATED_FLAG_KEY = "jobiffy-resumes-migrated";

const DEBOUNCE_MS = 500;

const cacheKey = (userId: string) => `jobiffy-resumes:${userId}`;
const activeCacheKey = (userId: string) => `jobiffy-active-resume:${userId}`;

function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function loadCache(userId: string): SavedResume[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (raw) return JSON.parse(raw) as SavedResume[];
  } catch { /* localStorage unavailable */ }
  return null;
}

function saveCache(userId: string, resumes: SavedResume[]) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(resumes));
  } catch { /* localStorage unavailable */ }
}

function loadActiveCache(userId: string): string | null {
  try {
    return localStorage.getItem(activeCacheKey(userId));
  } catch {
    return null;
  }
}

function saveActiveCache(userId: string, id: string) {
  try {
    localStorage.setItem(activeCacheKey(userId), id);
  } catch { /* localStorage unavailable */ }
}

function defaultResume(): SavedResume {
  const now = Date.now();
  return {
    id: generateUuid(),
    name: "My Resume",
    data: { ...sampleResume },
    chatMessages: [],
    createdAt: now,
    updatedAt: now,
  };
}

// One-shot: read pre-Supabase un-namespaced localStorage, mint fresh UUIDs,
// return as SavedResume[]. Returns null if already migrated or nothing to do.
function readLegacyForMigration(): SavedResume[] | null {
  try {
    if (localStorage.getItem(MIGRATED_FLAG_KEY)) return null;
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Array<Partial<SavedResume>>;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const now = Date.now();
    return parsed
      .filter(r => r && r.data)
      .map(r => ({
        id: generateUuid(),
        name: r.name || "My Resume",
        data: r.data as ResumeData,
        chatMessages: r.chatMessages || [],
        createdAt: r.createdAt ?? now,
        updatedAt: r.updatedAt ?? now,
      }));
  } catch {
    return null;
  }
}

function markLegacyMigrated() {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(LEGACY_ACTIVE_KEY);
    localStorage.setItem(MIGRATED_FLAG_KEY, "1");
  } catch { /* localStorage unavailable */ }
}

type ServerRow = {
  id: string;
  user_id: string;
  name: string;
  data: ResumeData;
  chat_messages: ChatMessage[];
  created_at: string;
  updated_at: string;
};

function rowToResume(row: ServerRow): SavedResume {
  return {
    id: row.id,
    name: row.name,
    data: row.data,
    chatMessages: Array.isArray(row.chat_messages) ? row.chat_messages : [],
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export function useResumeStore() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Refs the debounced flush reads at fire time so it sees the latest state
  // and the latest user even when the closure was created several edits ago.
  const dirtyIdsRef = useRef<Set<string>>(new Set());
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const flushTimerRef = useRef<number | null>(null);
  const flushingRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const resumesRef = useRef<SavedResume[]>([]);
  // flushRef breaks the scheduleFlush ↔ flush cycle: scheduleFlush reads
  // .current at fire time, after flush has been assigned.
  const flushRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => { resumesRef.current = resumes; }, [resumes]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current != null) return;
    flushTimerRef.current = window.setTimeout(() => {
      flushTimerRef.current = null;
      void flushRef.current();
    }, DEBOUNCE_MS);
  }, []);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    const uid = userIdRef.current;
    if (!uid) return;

    const dirtyIds = Array.from(dirtyIdsRef.current);
    const deletedIds = Array.from(deletedIdsRef.current);
    if (dirtyIds.length === 0 && deletedIds.length === 0) return;

    dirtyIdsRef.current.clear();
    deletedIdsRef.current.clear();
    flushingRef.current = true;

    try {
      const list = resumesRef.current;
      const upserts = dirtyIds
        .map(id => list.find(r => r.id === id))
        .filter((r): r is SavedResume => !!r)
        .map(r => ({
          id: r.id,
          user_id: uid,
          name: r.name,
          data: r.data as unknown as Json,
          chat_messages: r.chatMessages as unknown as Json,
        }));

      if (upserts.length > 0) {
        const { error } = await supabase
          .from("resumes")
          .upsert(upserts, { onConflict: "id" });
        if (error) {
          // Re-queue so the next edit (or unmount) retries them.
          upserts.forEach(u => dirtyIdsRef.current.add(u.id));
          console.error("resume upsert failed", error);
        }
      }

      if (deletedIds.length > 0) {
        const { error } = await supabase
          .from("resumes")
          .delete()
          .in("id", deletedIds);
        if (error) {
          deletedIds.forEach(id => deletedIdsRef.current.add(id));
          console.error("resume delete failed", error);
        }
      }
    } finally {
      flushingRef.current = false;
      if (dirtyIdsRef.current.size > 0 || deletedIdsRef.current.size > 0) {
        scheduleFlush();
      }
    }
  }, [scheduleFlush]);

  useEffect(() => { flushRef.current = flush; }, [flush]);

  const markDirty = useCallback((id: string) => {
    dirtyIdsRef.current.add(id);
    scheduleFlush();
  }, [scheduleFlush]);

  // Hydrate when auth resolves. Cache paints first; server reconciles after.
  useEffect(() => {
    if (authLoading) return;

    // Logged out: drop in-memory state. Cache stays in place per-user, so
    // signing back in restores it.
    if (!userId) {
      setResumes([]);
      setActiveId("");
      setLoading(false);
      dirtyIdsRef.current.clear();
      deletedIdsRef.current.clear();
      if (flushTimerRef.current != null) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      return;
    }

    let cancelled = false;
    setLoading(true);

    const cached = loadCache(userId);
    if (cached && cached.length > 0) {
      setResumes(cached);
      const cachedActive = loadActiveCache(userId);
      setActiveId(
        cachedActive && cached.find(r => r.id === cachedActive)
          ? cachedActive
          : cached[0].id,
      );
    }

    (async () => {
      const { data: rows, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        // Couldn't reach the server. If we had a warm cache we keep using it;
        // otherwise seed a default locally and queue it for when we recover.
        console.error("resume fetch failed", error);
        if (!cached || cached.length === 0) {
          const def = defaultResume();
          setResumes([def]);
          setActiveId(def.id);
          dirtyIdsRef.current.add(def.id);
          scheduleFlush();
        }
        setLoading(false);
        return;
      }

      const serverResumes = (rows as ServerRow[] | null)?.map(rowToResume) ?? [];

      // Merge server with whatever was cached. Server wins on rows present in
      // both, unless cache.updatedAt is newer (offline edits resync). Cache-only
      // rows are uploaded as a recovery pass.
      const cacheList = cached ?? [];
      const cacheMap = new Map(cacheList.map(r => [r.id, r]));
      const serverMap = new Map(serverResumes.map(r => [r.id, r]));
      const allIds = new Set<string>([...cacheMap.keys(), ...serverMap.keys()]);
      const merged: SavedResume[] = [];
      for (const id of allIds) {
        const c = cacheMap.get(id);
        const s = serverMap.get(id);
        if (c && s) {
          if (c.updatedAt > s.updatedAt) {
            merged.push(c);
            dirtyIdsRef.current.add(id);
          } else {
            merged.push(s);
          }
        } else if (s) {
          merged.push(s);
        } else if (c) {
          merged.push(c);
          dirtyIdsRef.current.add(id);
        }
      }
      merged.sort((a, b) => b.updatedAt - a.updatedAt);

      if (merged.length === 0) {
        // Brand-new account on this device. Try the one-shot legacy lift.
        const legacy = readLegacyForMigration();
        if (legacy && legacy.length > 0) {
          setResumes(legacy);
          setActiveId(legacy[0].id);
          legacy.forEach(r => dirtyIdsRef.current.add(r.id));
          markLegacyMigrated();
          scheduleFlush();
        } else {
          const def = defaultResume();
          setResumes([def]);
          setActiveId(def.id);
          dirtyIdsRef.current.add(def.id);
          scheduleFlush();
        }
      } else {
        setResumes(merged);
        const cachedActive = loadActiveCache(userId);
        setActiveId(
          cachedActive && merged.find(r => r.id === cachedActive)
            ? cachedActive
            : merged[0].id,
        );
        if (dirtyIdsRef.current.size > 0) scheduleFlush();
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authLoading]);

  // Mirror state to the namespaced cache so a quick reload paints instantly.
  useEffect(() => {
    if (!userId) return;
    saveCache(userId, resumes);
  }, [resumes, userId]);

  useEffect(() => {
    if (!userId || !activeId) return;
    saveActiveCache(userId, activeId);
  }, [activeId, userId]);

  // Best-effort flush on tab close. Pending writes also live in the namespaced
  // cache, so the merge step on next login uploads anything that didn't make it.
  useEffect(() => {
    const onBeforeUnload = () => {
      if (flushTimerRef.current != null) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
        void flush();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [flush]);

  const activeResume = resumes.find(r => r.id === activeId) || resumes[0];

  const updateActiveData = useCallback((data: ResumeData) => {
    if (!activeId) return;
    setResumes(prev => prev.map(r =>
      r.id === activeId ? { ...r, data, updatedAt: Date.now() } : r,
    ));
    markDirty(activeId);
  }, [activeId, markDirty]);

  const updateActiveChatMessages = useCallback((chatMessages: ChatMessage[]) => {
    if (!activeId) return;
    setResumes(prev => prev.map(r =>
      r.id === activeId ? { ...r, chatMessages, updatedAt: Date.now() } : r,
    ));
    markDirty(activeId);
  }, [activeId, markDirty]);

  const addResume = useCallback((name: string, data?: ResumeData) => {
    const id = generateUuid();
    const now = Date.now();
    const newResume: SavedResume = {
      id,
      name,
      data: data || { ...sampleResume },
      chatMessages: [],
      createdAt: now,
      updatedAt: now,
    };
    setResumes(prev => [...prev, newResume]);
    setActiveId(id);
    markDirty(id);
    return id;
  }, [markDirty]);

  const deleteResume = useCallback((id: string) => {
    setResumes(prev => {
      if (prev.length <= 1) return prev; // never delete last resume
      const next = prev.filter(r => r.id !== id);
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
    // If a write was pending for this id, drop it; the delete supersedes it.
    dirtyIdsRef.current.delete(id);
    deletedIdsRef.current.add(id);
    scheduleFlush();
  }, [activeId, scheduleFlush]);

  const renameResume = useCallback((id: string, name: string) => {
    setResumes(prev => prev.map(r =>
      r.id === id ? { ...r, name, updatedAt: Date.now() } : r,
    ));
    markDirty(id);
  }, [markDirty]);

  const switchResume = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  // Flush pending writes immediately. Callers that hold the JWT briefly
  // (e.g. signOut) should await this so the last edits aren't lost when
  // the session is revoked.
  const flushNow = useCallback(async () => {
    if (flushTimerRef.current != null) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    await flush();
  }, [flush]);

  return {
    resumes,
    activeResume,
    activeId,
    loading,
    updateActiveData,
    updateActiveChatMessages,
    addResume,
    deleteResume,
    renameResume,
    switchResume,
    flushNow,
  };
}
