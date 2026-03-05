import { formatHHMM, parseHHMM } from "./time";

export function calcPlannedEnd(startTime: string, pause: string, hours: string) {
  const start = parseHHMM(startTime);
  const pauseMin = Number((pause || "").replace(",", "."));
  const workMin = Number((hours || "").replace(",", ".")) * 60;

  if (
    start === null ||
    !Number.isFinite(pauseMin) ||
    !Number.isFinite(workMin)
  ) {
    return "";
  }

  return formatHHMM(start + Math.round(pauseMin) + Math.round(workMin));
}

export function calcDiff(plannedHHMM: string, actualHHMM: string) {
  const plannedMin = parseHHMM(plannedHHMM);
  const actualMin = parseHHMM(actualHHMM);

  if (plannedMin === null || actualMin === null) return "";

  const d = actualMin - plannedMin; // Minuten
  const sign = d >= 0 ? "+" : "-";
  const abs = Math.abs(d);

  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");

  return `${sign}${hh}:${mm}`;
}