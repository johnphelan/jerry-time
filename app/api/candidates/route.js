export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const national = searchParams.get("national");

  const params = new URLSearchParams({
    api_key: process.env.FEC_API_KEY,
    election_year: 2026,
    office: "H",
    sort: "-receipts",
    per_page: 10,
  });

  if (state && !national) params.set("state", state);

  const res = await fetch(
    `https://api.open.fec.gov/v1/candidates/totals/?${params}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return Response.json({ results: [] });
  const data = await res.json();
  return Response.json({ results: data.results || [] });
}
