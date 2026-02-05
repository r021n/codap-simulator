import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  desc?: string;
};

const STEPS: Step[] = [
  {
    id: "import",
    title: "Import dataset suhu (CSV)",
    desc: "Download CSV dari tombol di bawah, lalu import lewat menu File/Import di CODAP.",
  },
  {
    id: "chart",
    title: "Buat grafik garis: Tahun (X) vs Suhu (Y)",
    desc: "Tarik kolom 'tahun' ke sumbu X dan 'suhu' ke sumbu Y.",
  },
  {
    id: "maxmin",
    title: "Identifikasi tahun tertinggi & terendah",
    desc: "Cari puncak dan lembah pada grafik, catat tahunnya.",
  },
  {
    id: "trend",
    title: "Catat tren 2010–2025",
    desc: "Apakah cenderung naik/turun/stabil? Beri 1 bukti dari grafik.",
  },
];

const LS_KEY = "investigasi_steps_v1";

export default function InstructionSteps() {
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(doneMap));
  }, [doneMap]);

  const completed = useMemo(
    () => STEPS.filter((s) => doneMap[s.id]).length,
    [doneMap],
  );
  const progress = Math.round((completed / STEPS.length) * 100);
  const allDone = completed === STEPS.length;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm text-slate-600">
          Progress: {completed}/{STEPS.length}
        </div>
        <Progress value={progress} />
      </div>

      <div className="space-y-3">
        {STEPS.map((s) => {
          const checked = !!doneMap[s.id];
          return (
            <div
              key={s.id}
              className={cn(
                "rounded-md border bg-white p-3",
                checked && "border-slate-300",
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) =>
                    setDoneMap((prev) => ({ ...prev, [s.id]: Boolean(v) }))
                  }
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium">{s.title}</div>
                  {s.desc && (
                    <div className="text-xs text-slate-500 mt-1">{s.desc}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={() => setDoneMap({})} type="button">
          Reset checklist
        </Button>

        <div className="text-xs text-slate-500">
          {allDone
            ? "Siap lanjut ke checkpoint kuis."
            : "Selesaikan langkah di atas dulu."}
        </div>
      </div>
    </div>
  );
}
