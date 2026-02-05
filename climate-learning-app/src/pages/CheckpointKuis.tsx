import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/QuestionCard";

import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  loadClimateStatsFromCsv,
  type ClimateStats,
} from "@/modules/quiz/csvStats";
import { buildQuestionsFromStats } from "@/modules/quiz/questionBank";
import type { QuizAnswer, QuizQuestion } from "@/types/quiz";

const CSV_URL = "/data/suhu-bmkg-2010-2025.csv";

export default function CheckpointKuis() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<ClimateStats | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ earned: number; max: number } | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setLoading(true);
        const s = await loadClimateStatsFromCsv(CSV_URL);
        const qs = buildQuestionsFromStats(s);
        if (!mounted) return;

        setStats(s);
        setQuestions(qs);
        setErr(null);
      } catch (e) {
        if (!mounted) return;
        if (e instanceof Error) {
          setErr(e?.message);
        } else {
          setErr("Gagal memuat data kuis");
        }
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const requiredIds = useMemo(
    () => questions.filter((q) => q.required).map((q) => q.id),
    [questions],
  );

  const answeredCount = useMemo(() => {
    return questions.filter((q) => (answersMap[q.id] ?? "").trim().length > 0)
      .length;
  }, [questions, answersMap]);

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((answeredCount / questions.length) * 100);
  }, [answeredCount, questions.length]);

  const current = questions[idx];

  function setAnswer(questionId: string, value: string) {
    setAnswersMap((prev) => ({ ...prev, [questionId]: value }));
  }

  const canSubmit = useMemo(() => {
    return requiredIds.every((id) => (answersMap[id] ?? "").trim().length > 0);
  }, [requiredIds, answersMap]);

  function gradeAndBuildPayload(): {
    jawaban_kuis: QuizAnswer[];
    earned: number;
    max: number;
  } {
    let earned = 0;
    let max = 0;

    const jawaban_kuis: QuizAnswer[] = questions.map((q) => {
      const answer = (answersMap[q.id] ?? "").trim();

      if (q.answerKey != null && q.points != null) {
        max += q.points;
        const is_correct = answer === q.answerKey;
        const points_awarded = is_correct ? q.points : 0;
        earned += points_awarded;

        return {
          question_id: q.id,
          type: q.type,
          answer,
          is_correct,
          points_awarded,
          points_max: q.points,
        };
      }

      return {
        question_id: q.id,
        type: q.type,
        answer,
        is_correct: null,
        points_awarded: null,
        points_max: q.points ?? null,
      };
    });

    return { jawaban_kuis, earned, max };
  }

  async function handleSubmit() {
    if (!user) return;
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const payload = gradeAndBuildPayload();

      await addDoc(collection(db, "answers"), {
        user_id: user.uid,
        jawaban_kuis: payload.jawaban_kuis,
        score: { earned: payload.earned, max: payload.max },

        climate_stats: stats
          ? {
              yearMax: stats.yearMax,
              yearMin: stats.yearMin,
              trendLabel: stats.trendLabel,
              deltaFirstLast: stats.deltaFirstLast,
            }
          : null,
        timestamp: serverTimestamp(),
      });

      await setDoc(
        doc(db, "users", user.uid),
        { status_selesai: true, updated_at: serverTimestamp() },
        { merge: true },
      );

      setScore({ earned: payload.earned, max: payload.max });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-6">Memuat kuis...</div>;
  }

  if (err) {
    return (
      <div className="max-w-3xl space-y-3">
        <div className="text-red-600 text-sm">Error: {err}</div>
        <Card>
          <CardHeader>
            <CardTitle>Tips perbaikan CSV</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-1">
            <div>
              Pastikan file bisa diakses di: <code>{CSV_URL}</code>
            </div>
            <div>
              Pastikan ada kolom: <code>tahun</code> dan{" "}
              <code>suhu_rata2_c</code>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current) {
    return <div className="p-6">Tidak ada pertanyaan.</div>;
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Checkpoint Literasi Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm text-slate-600">
              Progress jawaban: {answeredCount}/{questions.length}
            </div>
            <Progress value={progress} />
          </div>

          {stats && (
            <div className="text-xs text-slate-500">
              Data terbaca: max di <b>{stats.yearMax}</b>, min di{" "}
              <b>{stats.yearMin}</b>, tren <b>{stats.trendLabel}</b>. (Ini
              dipakai untuk membuat pertanyaan dinamis.)
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>
          Pertanyaan {idx + 1} dari {questions.length}
        </div>
        {score && (
          <div className="font-medium text-slate-800">
            Skor: {score.earned}/{score.max}
          </div>
        )}
      </div>

      <QuestionCard
        question={current}
        value={answersMap[current.id] ?? ""}
        onChange={(v) => setAnswer(current.id, v)}
      />

      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIdx((v) => Math.max(0, v - 1))}
            disabled={idx === 0}
          >
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => setIdx((v) => Math.min(questions.length - 1, v + 1))}
            disabled={idx === questions.length - 1}
          >
            Next
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting || submitted}
          >
            {submitted
              ? "Tersimpan"
              : submitting
                ? "Menyimpan..."
                : "Submit Jawaban"}
          </Button>

          <Button
            variant="secondary"
            disabled={!submitted}
            onClick={() => navigate("/simulator")}
          >
            Rancang Solusi
          </Button>
        </div>
      </div>

      {!canSubmit && (
        <div className="text-xs text-slate-500">
          Isi semua pertanyaan wajib dulu untuk submit.
        </div>
      )}
    </div>
  );
}
