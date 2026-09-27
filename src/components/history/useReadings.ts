"use client";

import { useEffect, useState } from "react";
import { loadReadings } from "@/lib/storage";
import type { Reading } from "@/lib/reading";

/** All readings (newest first), refreshed on `afw:readings-changed`. */
export function useReadings(): { readings: Reading[]; loaded: boolean } {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const refresh = () => {
      setReadings(loadReadings());
      setLoaded(true);
    };
    refresh();
    window.addEventListener("afw:readings-changed", refresh);
    return () => window.removeEventListener("afw:readings-changed", refresh);
  }, []);
  return { readings, loaded };
}
