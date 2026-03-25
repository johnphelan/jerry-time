export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const national = searchParams.get("national");

  const baseParams = new URLSearchParams({
    api_key: process.env.FEC_API_KEY,
    election_year: 2026,
    office: "H",
    sort: "-receipts",
    per_page: 100,
  });

  if (state && !national) baseParams.set("state", state);

  const results = [];
  let page = 1;
  let totalPages = 1;
  const maxPages = 25; // safeguard when person requests huge result sets

  while (page <= totalPages && page <= maxPages) {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(page));

    const res = await fetch(
      `https://api.open.fec.gov/v1/candidates/totals/?${params}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) break;
    const data = await res.json();

    if (!Array.isArray(data.results) || data.results.length === 0) break;

    results.push(...data.results);

    if (data.pagination && data.pagination.pages) {
      totalPages = Number(data.pagination.pages);
    } else {
      break;
    }

    page += 1;
  }

  return Response.json({ results });
}
