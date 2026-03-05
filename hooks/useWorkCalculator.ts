import { useCallback, useState } from "react";
import { formatHHMM, parseHHMM } from "../utils/time";

export function useWorkCalculator() {
  const [endTime, setEndTime] = useState("");
  const [diff, setDiff] = useState("");

  const calculate = useCallback(
    (startTime: string, pause: string, hours: string, actualEnd: string) => {
      const start = parseHHMM(startTime);
      const pauseMin = Number((pause || "").replace(",", "."));
      const workMin = Number((hours || "").replace(",", ".")) * 60;

      if (start === null || !Number.isFinite(pauseMin) || !Number.isFinite(workMin)) {
        setEndTime("");
        setDiff("");
        return { planned: "", diff: "" };
      }

      const planned = formatHHMM(start + Math.round(pauseMin) + Math.round(workMin));
      setEndTime(planned);

      const actual = parseHHMM(actualEnd);
      if (actual !== null) {
        const plannedMin = parseHHMM(planned)!;
        const d = actual - plannedMin;
        const sign = d >= 0 ? "+" : "-";
        const abs = Math.abs(d);
        const hh = String(Math.floor(abs / 60)).padStart(2, "0");
        const mm = String(abs % 60).padStart(2, "0");
        const diffStr = `${sign}${hh}:${mm}`;
        setDiff(diffStr);
        return { planned, diff: diffStr };
      } else {
        setDiff("");
        return { planned, diff: "" };
      }
    },
    []
  );

  return { endTime, diff, calculate, setEndTime, setDiff };
}