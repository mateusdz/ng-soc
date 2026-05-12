type StatusPillProps = {
  tone: "good" | "bad" | "warn" | "neutral";
  children: string;
};

const tones = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  bad: "border-rose-200 bg-rose-50 text-rose-800",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  neutral: "border-slate-200 bg-slate-100 text-slate-700"
};

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
