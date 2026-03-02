export function parseHHMM(value: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((value || "").trim());
  if (!m) return null;

  const hh = Number(m[1]);
  const mm = Number(m[2]);

  if (hh < 0 || hh > 23) return null;
  if (mm < 0 || mm > 59) return null;

  return hh * 60 + mm;
}

export function formatHHMM(totalMinutes: number) {
  let m = totalMinutes % (24 * 60);
  if (m < 0) m += 24 * 60;

  const hh = Math.floor(m / 60);
  const mm = m % 60;

  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function diffMinutes(targetMin: number, actualMin: number) {
  let d = actualMin - targetMin;

  if (d <= -12 * 60) d += 24 * 60;
  if (d >= 12 * 60) d -= 24 * 60;

  return d;
}

export function formatSignedMinutes(minutes: number) {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);

  const hh = Math.floor(abs / 60);
  const mm = abs % 60;

  return `${sign}${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}