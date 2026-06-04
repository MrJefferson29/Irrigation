/** Parse due date from ISO or "YYYY-MM-DD HH:mm" (safe on iOS JSC). */
export function parseDueDate(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("T")) {
    const iso = new Date(trimmed);
    return Number.isNaN(iso.getTime()) ? null : iso;
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})$/);
  if (match) {
    const [, y, mo, d, h, mi] = match;
    const local = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), 0, 0);
    return Number.isNaN(local.getTime()) ? null : local;
  }

  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function formatDueDateInput(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d} ${h}:${mi}`;
}

export function formatDisplayDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function defaultReminderDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(8, 0, 0, 0);
  return date;
}

export function reminderStatus(iso: string, done: boolean): "done" | "overdue" | "today" | "upcoming" {
  if (done) {
    return "done";
  }
  const due = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  if (due.getTime() < now.getTime()) {
    return "overdue";
  }
  if (startOfDue.getTime() === startOfToday.getTime()) {
    return "today";
  }
  return "upcoming";
}
