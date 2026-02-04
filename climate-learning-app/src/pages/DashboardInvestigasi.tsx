import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function DashboardInvestigasi() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>CODAP Workspace</CardTitle>
          <Badge variant="secondary">Embed</Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-md overflow-hidden border bg-white">
            <iframe
              title="CODAP"
              className="w-full h-[70vh]"
              // sementara placeholder
              src="https://codap.concord.org/"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Catatan: integrasi load dataset akan dibuat di chapter modul CODAP.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Panduan Investigasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <div className="font-medium">Langkah 1</div>
            <div className="text-slate-600">Import dataset suhu (CSV).</div>
          </div>
          <Separator />
          <div>
            <div className="font-medium">Langkah 2</div>
            <div className="text-slate-600">
              Buat grafik garis: Tahun (X) vs Suhu (Y).
            </div>
          </div>
          <Separator />
          <div>
            <div className="font-medium">Langkah 3</div>
            <div className="text-slate-600">
              Cari tahun suhu tertinggi & tren 2010–2025.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
