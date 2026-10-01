// A realistic built-in sample dataset so the app demos instantly without an
// upload. Generated deterministically and exposed as CSV text (users can also
// download it) plus the column list.

const REGIONS = ["North America", "EMEA", "APAC", "LATAM"];
const COUNTRY: Record<string, string[]> = {
  "North America": ["USA", "Canada"],
  EMEA: ["Germany", "UK", "France"],
  APAC: ["Japan", "Australia", "India"],
  LATAM: ["Brazil", "Mexico"],
};
const PRODUCTS = ["DataLens Pro", "Embed Analytics", "Warehouse Sync", "Cloud Optimize", "Security Suite"];
const SEGMENTS = ["Enterprise", "Mid-Market", "SMB"];
const CHANNELS = ["Direct", "Partner", "Self-Serve"];

const BASE_PRICE: Record<string, number> = {
  "DataLens Pro": 1200,
  "Embed Analytics": 800,
  "Warehouse Sync": 650,
  "Cloud Optimize": 500,
  "Security Suite": 950,
};

export const SAMPLE_HEADER = [
  "date", "region", "country", "product", "segment", "channel", "units", "revenue", "cost", "profit",
];

function buildRows(): string[][] {
  const rows: string[][] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let year = 2024; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      const perMonth = 9 + Math.floor(rand() * 4);
      for (let i = 0; i < perMonth; i++) {
        const region = REGIONS[Math.floor(rand() * REGIONS.length)];
        const country = COUNTRY[region][Math.floor(rand() * COUNTRY[region].length)];
        const product = PRODUCTS[Math.floor(rand() * PRODUCTS.length)];
        const segment = SEGMENTS[Math.floor(rand() * SEGMENTS.length)];
        const channel = CHANNELS[Math.floor(rand() * CHANNELS.length)];
        const day = String(1 + Math.floor(rand() * 27)).padStart(2, "0");

        const segMult = segment === "Enterprise" ? 6 : segment === "Mid-Market" ? 2.5 : 1;
        const units = Math.max(1, Math.round(segMult * (1 + rand() * 6)));
        const unitPrice = BASE_PRICE[product] * (0.9 + rand() * 0.3);
        const revenue = Math.round(units * unitPrice);
        const cost = Math.round(revenue * (0.45 + rand() * 0.2));
        const profit = revenue - cost;

        rows.push([
          `${year}-${String(month).padStart(2, "0")}-${day}`,
          region, country, product, segment, channel,
          String(units), String(revenue), String(cost), String(profit),
        ]);
      }
    }
  }
  return rows;
}

function toCSV(header: string[], rows: string[][]): string {
  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export const SAMPLE_CSV = toCSV(SAMPLE_HEADER, buildRows());
export const SAMPLE_NAME = "sample_sales.csv";
