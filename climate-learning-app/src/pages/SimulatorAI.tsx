import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

export default function SimulatorAI() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  const { user } = useAuth();

  async function saveSolutionTest() {
    if (!user) return;

    await addDoc(collection(db, "solutions"), {
      user_id: user.uid,
      input_siswa: input,
      ai_response: output ?? "(no output)",
      skor_ai: null,
      timestamp: serverTimestamp(),
    });
  }

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
          <div className="flex gap-2">
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
            <Button
              variant="outline"
              onClick={saveSolutionTest}
              disabled={!output}
            >
              Simpan Solusi (test)
            </Button>
          </div>
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
