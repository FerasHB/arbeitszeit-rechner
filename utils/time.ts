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