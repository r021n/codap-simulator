import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SimulatorAI() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Rancang Solusi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-slate-600">
            Tulis rencana kamu (contoh: “Tanam 500 pohon Mahoni di jalan
            utama”).
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik solusi kamu..."
            className="min-h-40"
          />
          <Button
            onClick={() =>
              setOutput(
                "Placeholder output AI: estimasi dampak akan muncul di sini (Gemini via backend).",
              )
            }
            disabled={!input.trim()}
          >
            Simulasikan
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hasil Simulasi (AI)</CardTitle>
        </CardHeader>
        <CardContent>
          {output ? (
            <div className="whitespace-pre-wrap text-slate-800">{output}</div>
          ) : (
            <div className="text-sm text-slate-500">
              Belum ada output. Isi solusi lalu klik <b>Simulasikan</b>.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
