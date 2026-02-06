import { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type GatewayResult = {
  uid: string;
  rawText: string;
  parsed: any | null;
};

export default function SimulatorAI() {
  const { user } = useAuth();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GatewayResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const remaining = useMemo(() => 1500 - input.length, [input.length]);
  const gatewayUrl = import.meta.env.VITE_AI_GATEWAY_URL as string;

  async function handleSimulate() {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const idToken = await user.getIdToken();

      const resp = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ input }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error ?? "Gagal memanggil gateway");
      }

      setResult(data as GatewayResult);
    } catch (e) {
      if (e instanceof Error) {
        setError(e?.message);
      } else {
        setError("Gagal memanggil simulator.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user || !result) return;

    await addDoc(collection(db, "solutions"), {
      user_id: user.uid,
      input_siswa: input,
      ai_response: result.rawText,
      skor_ai: null,
      timestamp: serverTimestamp(),
    });

    setSaved(true);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Climate Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-slate-600">
            Tulis rencana aksi kamu. AI memberi estimasi berbasis asumsi umum.
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Contoh: "Saya ingin menanam 500 pohon mahoni di sepanjang jalan utama..."'
            className="min-h-45"
          />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div>Maks 1500 karakter</div>
            <div className={remaining < 0 ? "text-red-600" : ""}>
              Sisa: {remaining}
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex gap-2">
            <Button
              onClick={handleSimulate}
              disabled={
                loading || input.trim().length < 10 || input.length > 1500
              }
            >
              {loading ? "Memproses..." : "Simulasikan"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setResult(null)}
              disabled={!result || loading}
            >
              Reset hasil
            </Button>
          </div>

          <div className="text-xs text-slate-500">
            Disclaimer: hasil adalah <b>estimasi</b> berbasis asumsi, bukan
            pengukuran lapangan/prediksi pasti.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Hasil Simulasi</CardTitle>
          {saved && <Badge variant="secondary">Tersimpan</Badge>}
        </CardHeader>

        <CardContent className="space-y-3">
          {!result ? (
            <div className="text-sm text-slate-500">
              Belum ada hasil. Isi rencana aksi lalu klik <b>Simulasikan</b>.
            </div>
          ) : result.parsed ? (
            <div className="space-y-2">
              <div className="font-medium">{result.parsed.ringkasan}</div>

              <div className="text-sm">
                <div className="font-medium">Estimasi</div>
                <div className="text-slate-700">
                  CO₂ (kg/tahun):{" "}
                  <b>
                    {String(
                      result.parsed?.estimasi?.penyerapan_co2_kg_per_tahun ??
                        "null",
                    )}
                  </b>
                  <br />
                  Penurunan suhu (°C):{" "}
                  <b>
                    {String(
                      result.parsed?.estimasi?.potensi_penurunan_suhu_c ??
                        "null",
                    )}
                  </b>
                  <br />
                  Catatan: {result.parsed?.estimasi?.catatan}
                </div>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm text-slate-800">
              {result.rawText}
            </div>
          )}

          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={!result || saved}
          >
            Simpan ke Galeri
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
