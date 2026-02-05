import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InstructionSteps from "@/components/InstructionSteps";

export default function DashboardInvestigasi() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* KIRI: CODAP */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Investigasi Suhu (CODAP)</CardTitle>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/data/suhu-bmkg-2010-2025.csv" download>
                Download CSV
              </a>
            </Button>

            <Button asChild variant="secondary">
              <a
                href="https://codap.concord.org/releases/stable/"
                target="_blank"
                rel="noreferrer"
              >
                Buka CODAP Tab Baru
              </a>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md overflow-hidden border bg-white">
            <iframe
              title="CODAP"
              className="w-full h-[72vh]"
              src="https://codap.concord.org/releases/stable/"
            />
          </div>

          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <div className="font-medium text-slate-600">
              Cara import (manual, Opsi A):
            </div>
            <ol className="list-decimal ml-5 space-y-1">
              <li>
                Klik <b>Download CSV</b> (di atas).
              </li>
              <li>
                Di CODAP: cari menu <b>File</b> → <b>Import</b> (atau tombol
                Import Data).
              </li>
              <li>
                Pilih file <code>suhu-bmkg-2010-2025.csv</code> dari komputer.
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* KANAN: Instruksi */}
      <Card>
        <CardHeader>
          <CardTitle>Panduan Langkah Demi Langkah</CardTitle>
        </CardHeader>
        <CardContent>
          <InstructionSteps />
        </CardContent>
      </Card>
    </div>
  );
}
