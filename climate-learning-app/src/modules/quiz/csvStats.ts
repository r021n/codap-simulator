import Papa from "papaparse";

type AnyRow = Record<string, unknown>;

export type YearStat = { year: number; avgTemp: number };

export type ClimateStats = {
  perYear: YearStat[];
  yearMax: number;
  yearMin: number;
  maxTemp: number;
  minTemp: number;
  trendLabel: "naik" | "turun" | "stabil";
  deltaFirstLast: number;
};

function pickField(row: AnyRow, candidates: string[]) {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const found = keys.find((k) => k.toLowerCase() === c.toLowerCase());
    if (found) return row[found];
  }

  return undefined;
}

function toNumber(v: unknown) {
  if (v == null) return NaN;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v.replace(",", ".").trim());
  return NaN;
}

export async function loadClimateStatsFromCsv(
  url: string,
): Promise<ClimateStats> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal fetch CSV: ${res.status}`);
  const csvText = await res.text();
  const parsed = Papa.parse<AnyRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    throw new Error(`CSV parse error: ${parsed.errors[0].message}`);
  }

  const rows = parsed.data;

  const points: { year: number; temp: number }[] = rows
    .map((r) => {
      const yearRaw = pickField(r, ["tahun", "year"]);
      const tempRaw = pickField(r, [
        "suhu_rata2_c",
        "suhu",
        "temp",
        "temperature",
      ]);

      const year = Math.trunc(toNumber(yearRaw));
      const temp = toNumber(tempRaw);

      return { year, temp };
    })
    .filter((p) => Number.isFinite(p.year) && Number.isFinite(p.temp));

  if (points.length === 0) {
    throw new Error(
      "CSV tidak terbaca. Pastikan ada kolom 'tahun' dan kolom suhu (mis. 'suhu_rata2_c').",
    );
  }

  const map = new Map<number, { sum: number; n: number }>();
  for (const p of points) {
    const cur = map.get(p.year) ?? { sum: 0, n: 0 };
    cur.sum += p.temp;
    cur.n += 1;
    map.set(p.year, cur);
  }

  const perYear: YearStat[] = [...map.entries()]
    .map(([year, agg]) => ({ year, avgTemp: agg.sum / agg.n }))
    .sort((a, b) => a.year - b.year);

  let max = perYear[0];
  let min = perYear[0];
  for (const y of perYear) {
    if (y.avgTemp > max.avgTemp) max = y;
    if (y.avgTemp < min.avgTemp) min = y;
  }

  const first = perYear[0];
  const last = perYear[perYear.length - 1];
  const deltaFirstLast = last.avgTemp - first.avgTemp;

  let trendLabel: ClimateStats["trendLabel"] = "stabil";
  if (deltaFirstLast > 0.2) trendLabel = "naik";
  else if (deltaFirstLast < -0.2) trendLabel = "turun";

  return {
    perYear,
    yearMax: max.year,
    yearMin: min.year,
    maxTemp: max.avgTemp,
    minTemp: min.avgTemp,
    trendLabel,
    deltaFirstLast,
  };
}
