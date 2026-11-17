export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_TONES = ["teal", "indigo", "amber", "rose", "sky", "violet"];
export function toneFor(text = "") {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntil(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  return Math.round((due - startOfToday()) / 86400000);
}

export function formatDate(isoDate, opts = { day: "numeric", month: "short", year: "numeric" }) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", opts);
}

export function relativeDue(isoDate) {
  const n = daysUntil(isoDate);
  if (n === 0) return "Due today";
  if (n === 1) return "Due tomorrow";
  if (n > 1) return `Due in ${n} days`;
  if (n === -1) return "1 day overdue";
  return `${Math.abs(n)} days overdue`;
}

/** Pending + past due date => Overdue */
export function effectiveStatus(a) {
  if (a.status === "Submitted") return "Submitted";
  return daysUntil(a.dueDate) < 0 ? "Overdue" : "Pending";
}

export function urgency(isoDate) {
  const n = daysUntil(isoDate);
  if (n < 0) return "danger";
  if (n <= 2) return "warning";
  return "neutral";
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function attendanceTone(pct) {
  if (pct >= 85) return "success";
  if (pct >= 75) return "warning";
  return "danger";
}
