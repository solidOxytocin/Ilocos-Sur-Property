import { Platform } from "react-native";

const STORAGE_KEY = "ilocos-sur.landing.scrollY";

let memoryScrollY = 0;

export function getLandingScrollY(): number {
  if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw != null) {
      const parsed = Number.parseFloat(raw);
      if (Number.isFinite(parsed) && parsed >= 0) {
        memoryScrollY = parsed;
        return parsed;
      }
    }
  }
  return memoryScrollY;
}

export function setLandingScrollY(y: number): void {
  const clamped = Math.max(0, y);
  memoryScrollY = clamped;
  if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, String(clamped));
  }
}
