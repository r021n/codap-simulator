import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QuizQuestion } from "@/types/quiz";

type Props = {
  question: QuizQuestion;
  value: string;
  onChange: (newValue: string) => void;
};

export default function QuestionCard({ question, value, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{question.text}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {question.type === "multiple_choice" && question.options && (
          <RadioGroup
            value={value}
            onValueChange={onChange}
            className="space-y-2"
          >
            {question.options.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${question.id}_${opt}`} />
                <Label htmlFor={`${question.id}_${opt}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "short_answer" && (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ketik jawaban kamu..."
            className="min-h-35"
          />
        )}

        {question.required && (
          <div className="text-xs text-slate-500">*Pertanyaan wajib diisi</div>
        )}
      </CardContent>
    </Card>
  );
}
