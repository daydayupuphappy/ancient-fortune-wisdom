"use client";

import { hydrateReading, type Reading, type StoredReading } from "./reading";

/**
 * Client-side persistence (MVP). All readings live in localStorage under a
 * single key. Server-side accounts can replace this later behind the same API.
 */
const KEY = "afw:readings:v1";

export function loadStoredReadings(): StoredReading[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredReading[]) : [];
  } catch {
    return [];
  }
}

export function loadReadings(): Reading[] {
  return loadStoredReadings()
    .map(hydrateReading)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveStoredReadings(readings: StoredReading[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(readings));
  window.dispatchEvent(new Event("afw:readings-changed"));
}

export function upsertReading(reading: StoredReading): void {
  const all = loadStoredReadings();
  const idx = all.findIndex((r) => r.id === reading.id);
  if (idx >= 0) all[idx] = reading;
  else all.push(reading);
  saveStoredReadings(all);
}

export function getReading(id: string): Reading | undefined {
  const found = loadStoredReadings().find((r) => r.id === id);
  return found ? hydrateReading(found) : undefined;
}

export function getTodaysReading(now = new Date()): Reading | undefined {
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return loadReadings().find((r) => r.dateKey === key);
}

/** Consecutive days (ending today or yesterday) with at least one reading. */
export function computeStreak(readings: StoredReading[], now = new Date()): number {
  const days = new Set(readings.map((r) => r.dateKey));
  let streak = 0;
  const cursor = new Date(now);
  const keyOf = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (!days.has(keyOf(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(keyOf(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
