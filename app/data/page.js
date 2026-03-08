import Nav from "../components/Nav";

async function getTopFundraisers() {
  const params = new URLSearchParams({
    api_key: process.env.FEC_API_KEY,
    election_year: 2026,
    office: "H",
    sort: "-receipts",
    per_page: 20,
  });

  const res = await fetch(
    `https://api.open.fec.gov/v1/candidates/totals/?${params}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export default async function DataPage() {
  const candidates = await getTopFundraisers();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <Nav />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h2 className="text-lg font-semibold mb-1">Top 2026 House Fundraisers</h2>
        <p className="text-sm text-zinc-400 mb-4">FEC filings — updated every 5 minutes</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400 text-left">
              <th className="py-2 pr-4">Candidate</th>
              <th className="py-2 pr-4">Party</th>
              <th className="py-2 pr-4">State</th>
              <th className="py-2 text-right">Total Raised</th>
              <th className="py-2 text-right">Cash on Hand</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.candidate_id} className="border-b border-zinc-800 hover:bg-zinc-900">
                <td className="py-2 pr-4 font-medium">{c.name}</td>
                <td className="py-2 pr-4">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                    c.party === "REP" ? "bg-red-900 text-red-200" :
                    c.party === "DEM" ? "bg-blue-900 text-blue-200" :
                    "bg-zinc-700 text-zinc-300"
                  }`}>
                    {c.party}
                  </span>
                </td>
                <td className="py-2 pr-4 text-zinc-400">{c.state}-{c.district}</td>
                <td className="py-2 text-right font-mono">
                  ${(c.receipts || 0).toLocaleString()}
                </td>
                <td className="py-2 text-right font-mono text-zinc-400">
                  ${(c.cash_on_hand_end_period || 0).toLocaleString()}
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  No data yet — FEC filings for 2026 may not be available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
