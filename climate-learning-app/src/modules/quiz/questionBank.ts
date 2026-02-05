import type { ClimateStats } from "@/modules/quiz/csvStats";
import type { QuizQuestion } from "@/types/quiz";

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickDistractors(years: number[], correct: number, n: number) {
  const pool = years.filter((y) => y !== correct);
  return shuffle(pool).slice(0, n);
}

export function buildQuestionsFromStats(stats: ClimateStats): QuizQuestion[] {
  const years = stats.perYear.map((x) => x.year);
  const maxYear = stats.yearMax;
  const minYear = stats.yearMin;

  const q1Options = shuffle([
    String(maxYear),
    ...pickDistractors(years, maxYear, 3).map(String),
  ]);

  const q2Options = shuffle([
    String(minYear),
    ...pickDistractors(years, minYear, 3).map(String),
  ]);

  return [
    {
      id: "q_max_year",
      text: "Pada tahun berapa suhu rata-rata tertinggi tercatat?",
      type: "multiple_choice",
      required: true,
      options: q1Options,
      answerKey: String(maxYear),
      points: 1,
    },
    {
      id: "q_min_year",
      text: "Pada tahun berapa suhu rata-rata terendah tercatat?",
      type: "multiple_choice",
      required: true,
      options: q2Options,
      answerKey: String(minYear),
      points: 1,
    },
    {
      id: "q_trend",
      text: "Secara umum, tren suhu 2010–2025 cenderung…",
      type: "multiple_choice",
      required: true,
      options: ["naik", "turun", "stabil"],
      answerKey: stats.trendLabel,
      points: 1,
    },
    {
      id: "q_evidence",
      text: "Tulis 1 bukti dari grafik yang mendukung jawabanmu (contoh: sebutkan perubahan dari tahun A ke B).",
      type: "short_answer",
      required: false,
      points: 0,
    },
  ];
}
