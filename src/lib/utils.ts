export function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export function formatWeekRange(mondayStr: string): string {
  const monday = new Date(mondayStr + "T00:00:00");
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const mOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const sOpts: Intl.DateTimeFormatOptions =
    monday.getMonth() === sunday.getMonth()
      ? { day: "numeric" }
      : { month: "short", day: "numeric" };

  return `${monday.toLocaleDateString("en-US", mOpts)} – ${sunday.toLocaleDateString("en-US", sOpts)}`;
}

export function getWeekOffset(mondayStr: string, offset: number): string {
  const d = new Date(mondayStr + "T00:00:00");
  d.setDate(d.getDate() + offset * 7);
  return d.toISOString().split("T")[0];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}
