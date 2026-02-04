import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function CheckpointKuis() {
  const questions = [
    "Pada tahun berapa suhu tertinggi tercatat?",
    "Apakah tren suhu cenderung naik, turun, atau stabil?",
    "Sebutkan 1 bukti dari grafik yang mendukung jawabanmu.",
  ];

  const [idx, setIdx] = useState(0);
  const progress = Math.round(((idx + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Checkpoint Literasi Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-slate-600">
              Progress: {idx + 1}/{questions.length}
            </div>
            <Progress value={progress} />
          </div>

          <div className="p-4 rounded-md border bg-white">
            <div className="text-sm font-medium mb-2">Pertanyaan</div>
            <div className="text-slate-800">{questions[idx]}</div>
            <div className="text-xs text-slate-500 mt-2">
              (Input jawaban akan dibuat di modul kuis)
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIdx((v) => Math.max(0, v - 1))}
              disabled={idx === 0}
            >
              Back
            </Button>
            <Button
              onClick={() =>
                setIdx((v) => Math.min(questions.length - 1, v + 1))
              }
              disabled={idx === questions.length - 1}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
