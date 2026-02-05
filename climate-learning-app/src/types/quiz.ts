export type QuestionType = "multiple_choice" | "short_answer";

export type QuizQuestion = {
  id: string;
  text: string;
  type: QuestionType;
  required?: boolean;
  options?: string[];
  answerKey?: string;
  points?: number;
};

export type QuizAnswer = {
  question_id: string;
  type: QuestionType;
  answer: string;
  is_correct: boolean | null;
  points_awarded: number | null;
  points_max: number | null;
};
