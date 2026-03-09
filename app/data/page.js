"use client";

import { useState, useEffect } from "react";
import Nav from "../components/Nav";

function TabBar({ active, onChange }) {
  const tabs = ["FEC Fundraisers", "Current Members"];
  return (
    <div className="flex gap-1 mb-6 border-b border-zinc-700 pb-0">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: active === t ? 600 : 400,
            color: active === t ? "#f4f4f5" : "#71717a",
            borderTop: "none", borderLeft: "none", borderRight: "none",
            borderBottom: active === t ? "2px solid #f97316" : "2px solid transparent",
            background: "none",
            cursor: "pointer",
            marginBottom: -1,
          }}
        >{t}</button>
      ))}
    </div>
  );
}

function FecTab() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    fetch("/api/candidates?national=1")
      .then(r => r.json())
      .then(d => setRows(d.results || []));
  }, []);

  if (!rows) return <p className="text-sm text-zinc-400">Loading...</p>;

  return (
    <>
      <p className="text-sm text-zinc-400 mb-4">FEC filings — top 10 by receipts</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700 text-zinc-400 text-left">
            <th className="py-2 pr-4">Candidate</th>
            <th className="py-2 pr-4">Party</th>
            <th className="py-2 pr-4">District</th>
            <th className="py-2 text-right">Total Raised</th>
            <th className="py-2 text-right">Cash on Hand</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.candidate_id} className="border-b border-zinc-800 hover:bg-zinc-900">
              <td className="py-2 pr-4 font-medium">{c.name}</td>
              <td className="py-2 pr-4">
                <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                  c.party === "REP" ? "bg-red-900 text-red-200" :
                  c.party === "DEM" ? "bg-blue-900 text-blue-200" :
                  "bg-zinc-700 text-zinc-300"
                }`}>{c.party}</span>
              </td>
              <td className="py-2 pr-4 text-zinc-400">{c.state}-{c.district}</td>
              <td className="py-2 text-right font-mono">${(c.receipts || 0).toLocaleString()}</td>
              <td className="py-2 text-right font-mono text-zinc-400">${(c.cash_on_hand_end_period || 0).toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="py-8 text-center text-zinc-500">No data available.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

function MembersTab() {
  const [members, setMembers] = useState(null);

  useEffect(() => {
    fetch("/api/members")
      .then(r => r.json())
      .then(d => setMembers(d.members || []));
  }, []);

  if (!members) return <p className="text-sm text-zinc-400">Loading...</p>;

  const dems = members.filter(m => m.partyName === "Democratic").length;
  const reps = members.filter(m => m.partyName === "Republican").length;
  const other = members.length - dems - reps;

  return (
    <>
      {/* Party summary */}
      <div className="flex gap-4 mb-6">
        <div className="rounded-lg border border-blue-800 bg-blue-950 px-5 py-3 text-center">
          <p className="text-2xl font-bold text-blue-300">{dems}</p>
          <p className="text-xs text-blue-400 mt-1">Democrats</p>
        </div>
        <div className="rounded-lg border border-red-800 bg-red-950 px-5 py-3 text-center">
          <p className="text-2xl font-bold text-red-300">{reps}</p>
          <p className="text-xs text-red-400 mt-1">Republicans</p>
        </div>
        {other > 0 && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-3 text-center">
            <p className="text-2xl font-bold text-zinc-300">{other}</p>
            <p className="text-xs text-zinc-400 mt-1">Other</p>
          </div>
        )}
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-3 text-center">
          <p className="text-2xl font-bold text-zinc-200">{members.length}</p>
          <p className="text-xs text-zinc-400 mt-1">Total</p>
        </div>
      </div>

      {/* Member table */}
      <p className="text-sm text-zinc-400 mb-3">119th Congress · Current House members</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700 text-zinc-400 text-left">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Party</th>
            <th className="py-2 pr-4">State</th>
            <th className="py-2">District</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.bioguideId} className="border-b border-zinc-800 hover:bg-zinc-900">
              <td className="py-2 pr-4 font-medium">{m.name}</td>
              <td className="py-2 pr-4">
                <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                  m.partyName === "Republican" ? "bg-red-900 text-red-200" :
                  m.partyName === "Democratic" ? "bg-blue-900 text-blue-200" :
                  "bg-zinc-700 text-zinc-300"
                }`}>{m.partyName === "Republican" ? "REP" : m.partyName === "Democratic" ? "DEM" : m.partyName}</span>
              </td>
              <td className="py-2 pr-4 text-zinc-400">{m.state}</td>
              <td className="py-2 text-zinc-400">{m.district ?? "At Large"}</td>
            </tr>
          ))}
          {members.length === 0 && (
            <tr><td colSpan={4} className="py-8 text-center text-zinc-500">No members returned.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default function DataPage() {
  const [tab, setTab] = useState("FEC Fundraisers");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <Nav />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h2 className="text-lg font-semibold mb-4">Data</h2>
        <TabBar active={tab} onChange={setTab} />
        {tab === "FEC Fundraisers" ? <FecTab /> : <MembersTab />}
      </main>
    </div>
  );
}
