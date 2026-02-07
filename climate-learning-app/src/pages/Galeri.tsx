import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import ReportView from "@/components/ReportView";
import { loadClimateStatsFromCsv } from "@/modules/quiz/csvStats";
import type { QuizAnswer } from "@/types/quiz";

type SolutionDoc = {
  id: string;
  user_id: string;
  input_siswa: string;
  ai_response: string;
  skor_ai: number | null;
  timestamp?: any; // Firestore Timestamp
};

type AnswersDoc = {
  id: string;
  user_id: string;
  jawaban_kuis: QuizAnswer[];
  timestamp?: any;
};

const CSV_URL = "/data/suhu-bmkg-2010-2025.csv";

function tsToLabel(ts: any) {
  try {
    if (!ts?.toDate) return "-";
    return ts.toDate().toLocaleString();
  } catch {
    return "-";
  }
}

export default function Galeri() {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<SolutionDoc[]>([]);
  const [latestAnswers, setLatestAnswers] = useState<AnswersDoc | null>(null);
  const [perYear, setPerYear] = useState<{ year: number; avgTemp: number }[]>(
    [],
  );
  const [selected, setSelected] = useState<SolutionDoc | null>(null);

  const reportRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stats = await loadClimateStatsFromCsv(CSV_URL);
      if (!mounted) return;
      setPerYear(stats.perYear);
    })().catch(() => {
      // kalau gagal, biarkan kosong
      setPerYear([]);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "solutions"),
      where("user_id", "==", user.uid),
      orderBy("timestamp", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows: SolutionDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setSolutions(rows);
      if (!selected && rows.length > 0) setSelected(rows[0]);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "answers"),
      where("user_id", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(1),
    );

    const unsub = onSnapshot(q, (snap) => {
      const d = snap.docs[0];
      if (!d) {
        setLatestAnswers(null);
        return;
      }
      setLatestAnswers({
        id: d.id,
        ...(d.data() as any),
      });
    });

    return () => unsub();
  }, [user]);

  const selectedForReport = useMemo(() => {
    if (!selected) return null;
    return {
      input_siswa: selected.input_siswa,
      ai_response: selected.ai_response,
      created_at_label: tsToLabel(selected.timestamp),
    };
  }, [selected]);

  async function exportPdf() {
    if (!reportRef.current) return;

    setExporting(true);
    try {
      // Render report to canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // A4 portrait in points
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fit image to page width
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Jika melebihi 1 halaman, kita potong jadi beberapa halaman sederhana
      let y = 0;
      let remainingHeight = imgHeight;

      // Draw first page
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        y += pageHeight;
        pdf.addPage();
        // trik: geser gambar ke atas (negative y) untuk menampilkan bagian bawah
        pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save("laporan-climate-learning.pdf");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* LIST SOLUSI */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Galeri Solusi</CardTitle>
          <Badge variant="secondary">{solutions.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {solutions.length === 0 ? (
            <div className="text-sm text-slate-500">
              Belum ada solusi tersimpan. Buat dulu di menu <b>Simulator AI</b>.
            </div>
          ) : (
            solutions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full text-left p-3 rounded-md border bg-white hover:bg-slate-50 ${
                  selected?.id === s.id
                    ? "border-slate-900"
                    : "border-slate-200"
                }`}
              >
                <div className="font-medium line-clamp-1">{s.input_siswa}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {tsToLabel(s.timestamp)}
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* DETAIL + EXPORT */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Detail & Laporan</CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!selected}>
                  Lihat Detail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detail Solusi</DialogTitle>
                </DialogHeader>
                {!selected ? (
                  <div className="text-sm text-slate-500">
                    Pilih solusi dulu.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500">Waktu</div>
                      <div className="text-sm">
                        {tsToLabel(selected.timestamp)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Input siswa</div>
                      <div className="text-sm whitespace-pre-wrap">
                        {selected.input_siswa}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Respons AI</div>
                      <div className="text-sm whitespace-pre-wrap">
                        {selected.ai_response}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Button onClick={exportPdf} disabled={!selected || exporting}>
              {exporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="text-sm text-slate-600">
            PDF akan berisi grafik ringkas (dari CSV), jawaban kuis terakhir,
            dan solusi AI terpilih.
          </div>

          {/* Area report untuk di-capture (disembunyikan dari user boleh juga, tapi ini kita tampilkan preview) */}
          <div className="overflow-auto border rounded-md bg-slate-100 p-3">
            <div ref={reportRef}>
              <ReportView
                studentEmail={user?.email}
                perYear={perYear}
                answers={latestAnswers?.jawaban_kuis ?? null}
                solution={selectedForReport}
              />
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Catatan: CODAP tidak disertakan di PDF karena iframe cross-origin.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
