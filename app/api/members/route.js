export async function GET() {
  const key = process.env.CONGRESS_API_KEY;
  const base = "https://api.congress.gov/v3/member/congress/119";

  async function fetchPage(offset) {
    const params = new URLSearchParams({
      api_key: key,
      limit: 250,
      offset,
    });
    const res = await fetch(`${base}?${params}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { members: [], total: 0 };
    const data = await res.json();
    return { members: data.members || [], total: data.pagination?.count ?? 0 };
  }

  const first = await fetchPage(0);
  let all = first.members;

  if (first.total > 250) {
    const page2 = await fetchPage(250);
    all = [...all, ...page2.members];
    if (first.total > 500) {
      const page3 = await fetchPage(500);
      all = [...all, ...page3.members];
    }
  }

  const TERRITORIES = new Set([
    "District of Columbia", "Puerto Rico", "Guam",
    "Virgin Islands", "American Samoa", "Northern Mariana Islands",
  ]);

  // Filter to currently seated voting House members only
  const members = all.filter(m => {
    if (TERRITORIES.has(m.state)) return false;
    const terms = m.terms?.item ?? (Array.isArray(m.terms) ? m.terms : []);
    if (terms.length === 0) return false;
    const latest = terms[terms.length - 1];
    return latest.chamber === "House of Representatives" && !latest.endYear;
  });

  return Response.json({ members, total: members.length });
}
