"use client";

import { useState, useRef, useEffect } from "react";
import states from "../data/states.json";

const FIPS_TO_ABBR = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE",
  "11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA",
  "20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN",
  "28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM",
  "36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI",
  "45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA",
  "54":"WV","55":"WI","56":"WY","72":"PR",
};

const W = 975, H = 610;

function getZoomTransform(bounds) {
  const pad = 1.25; // lower = more zoom
  const scale = Math.min(W / (bounds.w * pad), H / (bounds.h * pad));
  const tx = W / 2 - bounds.cx * scale;
  const ty = H / 2 - bounds.cy * scale;
  return { scale, tx, ty };
}

export default function UsMap() {
  const [hoveredId, setHoveredId]   = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [transform, setTransform]   = useState({ scale: 1, tx: 0, ty: 0 });
  const [panel, setPanel] = useState({ label: "National — Top Fundraisers", candidates: [], loading: true });
  const debounceRef  = useRef(null);
  const nationalRef  = useRef([]);

  useEffect(() => {
    fetch("/api/candidates?national=1")
      .then(r => r.json())
      .then(data => {
        nationalRef.current = data.results || [];
        setPanel({ label: "National — Top Fundraisers", candidates: nationalRef.current, loading: false });
      });
  }, []);

  function handleEnter(s) {
    setHoveredId(s.id);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const abbr = FIPS_TO_ABBR[s.id];
      if (!abbr) return;
      setPanel(p => ({ ...p, label: s.name, loading: true }));
      const res  = await fetch(`/api/candidates?state=${abbr}`);
      const data = await res.json();
      setPanel({ label: s.name, candidates: data.results || [], loading: false });
    }, 200);
  }

  function handleLeave() {
    setHoveredId(null);
    clearTimeout(debounceRef.current);
    if (!selectedId) {
      setPanel({ label: "National — Top Fundraisers", candidates: nationalRef.current, loading: false });
    }
  }

  function handleClick(s, e) {
    e.stopPropagation();
    if (selectedId === s.id) {
      // deselect / zoom out
      setSelectedId(null);
      setHoveredId(null);
      setTransform({ scale: 1, tx: 0, ty: 0 });
      setPanel({ label: "National — Top Fundraisers", candidates: nationalRef.current, loading: false });
    } else {
      setSelectedId(s.id);
      setHoveredId(null);
      setTransform(getZoomTransform(s.bounds));
      // fetch for panel
      const abbr = FIPS_TO_ABBR[s.id];
      if (abbr) {
        setPanel(p => ({ ...p, label: s.name, loading: true }));
        fetch(`/api/candidates?state=${abbr}`)
          .then(r => r.json())
          .then(data => setPanel({ label: s.name, candidates: data.results || [], loading: false }));
      }
    }
  }

  function handleBgClick() {
    if (selectedId) {
      setSelectedId(null);
      setTransform({ scale: 1, tx: 0, ty: 0 });
      setPanel({ label: "National — Top Fundraisers", candidates: nationalRef.current, loading: false });
    }
  }

  const { scale, tx, ty } = transform;

  return (
    <div className="flex w-full gap-4" style={{ alignItems: "flex-start" }}>
      {/* Map */}
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block", cursor: selectedId ? "zoom-out" : "default" }}
          onClick={handleBgClick}
        >
          <g
            style={{
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              transformOrigin: "0 0",
              transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {states.map(s => {
              const isSelected = selectedId === s.id;
              const isHovered  = hoveredId  === s.id;
              const fill = isSelected ? "#f97316"
                         : isHovered  ? "#facc15"
                         : "#1e3a5f";
              return (
                <path
                  key={s.id}
                  d={s.d}
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2 / scale : 1.5 / scale}
                  style={{ cursor: "pointer", transition: "fill 0.15s" }}
                  onMouseEnter={() => !selectedId && handleEnter(s)}
                  onMouseLeave={() => !selectedId && handleLeave()}
                  onClick={e => handleClick(s, e)}
                />
              );
            })}
          </g>
        </svg>
        {selectedId && (
          <p className="mt-2 text-center text-xs text-zinc-500">
            Click the state again or anywhere on the map to zoom out
          </p>
        )}
      </div>

      {/* Side panel */}
      <div
        style={{ width: 280, flexShrink: 0, height: 500, overflowY: "scroll",
          scrollbarWidth: "thin", scrollbarColor: "#3f3f3f #1c1c1c" }}
        className="dark-scroll rounded-lg border border-zinc-700 bg-zinc-900 p-4"
      >
        <h3 className="mb-3 font-semibold text-sm">{panel.label}</h3>
        {panel.loading ? (
          <p className="text-sm text-zinc-400">Loading...</p>
        ) : panel.candidates.length === 0 ? (
          <p className="text-sm text-zinc-500">No 2026 filings yet.</p>
        ) : (
          <ul className="space-y-2">
            {panel.candidates.map(c => (
              <li key={c.candidate_id} className="rounded border border-zinc-700 p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium leading-tight">{c.name}</span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold ${
                    c.party === "REP" ? "bg-red-900 text-red-200" :
                    c.party === "DEM" ? "bg-blue-900 text-blue-200" :
                    "bg-zinc-700 text-zinc-300"
                  }`}>{c.party}</span>
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  {c.state}-{c.district} · ${(c.receipts || 0).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
