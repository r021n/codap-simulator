import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Galeri() {
  const items = [
    { title: "Solusi #1", date: "2026-02-04", status: "Draft" },
    { title: "Solusi #2", date: "2026-02-03", status: "Submitted" },
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Galeri Solusi</CardTitle>
          <Button variant="outline">Export PDF (dummy)</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="p-4 border rounded-md bg-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-xs text-slate-500">{it.date}</div>
                </div>
                <Badge
                  variant={it.status === "Submitted" ? "default" : "secondary"}
                >
                  {it.status}
                </Badge>
              </div>
              <Separator className="my-3" />
              <div className="text-sm text-slate-600">
                Placeholder ringkasan solusi + output AI.
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
