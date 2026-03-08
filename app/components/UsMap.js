"use client";

import { useState, useRef, useEffect } from "react";
import states from "../data/states.json";
import njDistricts from "../data/nj-districts.json";

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
const NJ_CX = 861.18, NJ_CY = 231.58;

function getZoomTransform(bounds) {
  const pad = 1.25;
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
  const [showDistricts, setShowDistricts] = useState(false);
  const [extraZoom, setExtraZoom]   = useState(1);
  const [panOffset, setPanOffset]     = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning]     = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [animateZoom, setAnimateZoom] = useState(true);
  const debounceRef   = useRef(null);
  const nationalRef   = useRef([]);
  const districtsRef  = useRef(null);
  const svgRef        = useRef(null);
  const panStartRef   = useRef(null);
  const didDragRef    = useRef(false);

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

  function resetState() {
    clearTimeout(districtsRef.current);
    setShowDistricts(false);
    setExtraZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedId(null);
    setHoveredId(null);
    setTransform({ scale: 1, tx: 0, ty: 0 });
    setPanel({ label: "National — Top Fundraisers", candidates: nationalRef.current, loading: false });
  }

  function handleClick(s, e) {
    e.stopPropagation();
    if (didDragRef.current) return;
    if (selectedId === s.id) {
      resetState();
    } else {
      clearTimeout(districtsRef.current);
      setShowDistricts(false);
      setExtraZoom(1);
      setPanOffset({ x: 0, y: 0 });
      setSelectedId(s.id);
      setHoveredId(null);
      setTransform(getZoomTransform(s.bounds));
      if (s.id === "34") {
        districtsRef.current = setTimeout(() => setShowDistricts(true), animateZoom ? 1100 : 50);
      }
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
    if (didDragRef.current) return;
    if (selectedId) resetState();
  }

  function handleMouseDown(e) {
    if (!selectedId) return;
    if (e.button !== 0) return;
    didDragRef.current = false;
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
    };
    setIsPanning(true);

    function onMove(e) {
      const dx = e.clientX - panStartRef.current.clientX;
      const dy = e.clientY - panStartRef.current.clientY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDragRef.current = true;
      if (!didDragRef.current) return;
      const svgEl = svgRef.current;
      const ratio = svgEl ? W / svgEl.getBoundingClientRect().width : 1;
      setPanOffset({
        x: panStartRef.current.panX + dx * ratio,
        y: panStartRef.current.panY + dy * ratio,
      });
    }

    function onUp() {
      setIsPanning(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // Compute final transform
  const isNJ = selectedId === "34";
  const baseScale = isNJ ? transform.scale * extraZoom : transform.scale;
  const baseTx    = isNJ ? W / 2 - NJ_CX * baseScale : transform.tx;
  const baseTy    = isNJ ? H / 2 - NJ_CY * baseScale : transform.ty;
  const actualTx  = baseTx + panOffset.x;
  const actualTy  = baseTy + panOffset.y;
  const actualScale = baseScale;

  const cursor = !selectedId ? "default"
               : isPanning   ? "grabbing"
               : "grab";

  return (
    <div className="flex w-full gap-4" style={{ alignItems: "flex-start" }}>
      {/* Map */}
      <div style={{ flex: "1 1 0", minWidth: 0, paddingRight: 24, marginLeft: -12, position: "relative" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block", cursor, userSelect: "none" }}
          onClick={handleBgClick}
          onMouseDown={handleMouseDown}
        >
          <g
            style={{
              transform: `translate3d(${actualTx}px, ${actualTy}px, 0) scale(${actualScale})`,
              transformOrigin: "0 0",
              transition: isPanning || !animateZoom ? "none" : "transform 1s ease-in-out",
              willChange: "transform",
            }}
          >
            {states.map(s => {
              const isSelected = selectedId === s.id;
              const isHovered  = hoveredId  === s.id;
              const fill = isSelected && !(s.id === "34" && showDistricts) ? "#f97316"
                         : isHovered  ? "#facc15"
                         : "#1e3a5f";
              return (
                <path
                  key={s.id}
                  d={s.d}
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2 / actualScale : 1.5 / actualScale}
                  style={{ cursor: selectedId ? "inherit" : "pointer", transition: "fill 0.15s" }}
                  onMouseEnter={() => !selectedId && handleEnter(s)}
                  onMouseLeave={() => !selectedId && handleLeave()}
                  onClick={e => handleClick(s, e)}
                />
              );
            })}
            {showDistricts && njDistricts.map(d => (
              <path
                key={d.cd}
                d={d.d}
                fill={hoveredDistrict === d.cd ? "#facc15" : "#1e3a5f"}
                stroke="#e2e8f0"
                strokeWidth={0.55 / actualScale}
                style={{ cursor: "pointer", transition: "fill 0.15s" }}
                onMouseEnter={() => setHoveredDistrict(d.cd)}
                onMouseLeave={() => setHoveredDistrict(null)}
              />
            ))}
          </g>
        </svg>

        {/* Zoom buttons — NJ only */}
        {isNJ && (
          <div
            style={{ position: "absolute", top: 16, right: 32, display: "flex", flexDirection: "column", gap: 6 }}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            <button
              onClick={() => setExtraZoom(z => Math.min(z * 1.5, 10))}
              style={{
                width: 32, height: 32, borderRadius: 6, border: "1px solid #3f3f46",
                background: "#18181b", color: "#fff", fontSize: 18, lineHeight: 1,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >+</button>
            <button
              onClick={() => setExtraZoom(z => Math.max(z / 1.5, 1))}
              style={{
                width: 32, height: 32, borderRadius: 6, border: "1px solid #3f3f46",
                background: "#18181b", color: "#fff", fontSize: 18, lineHeight: 1,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >−</button>
          </div>
        )}

        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setAnimateZoom(a => !a)}
            style={{
              padding: "4px 12px", borderRadius: 6, border: "1px solid #3f3f46",
              background: "#18181b", color: animateZoom ? "#a1a1aa" : "#52525b",
              fontSize: 11, cursor: "pointer", letterSpacing: "0.03em",
            }}
          >
            zoom animation: {animateZoom ? "on" : "off"}
          </button>
        </div>

        {selectedId && (
          <button
            onClick={e => { e.stopPropagation(); resetState(); }}
            onMouseDown={e => e.stopPropagation()}
            style={{
              position: "absolute", bottom: 8, right: 32,
              width: 28, height: 28, borderRadius: 6, border: "1px solid #3f3f46",
              background: "#18181b", color: "#a1a1aa", fontSize: 14,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
            title="Back to full map"
          >✕</button>
        )}
      </div>

      {/* Side panel */}
      <div
        style={{ width: 360, flexShrink: 0, height: 620, overflowY: "scroll",
          scrollbarWidth: "thin", scrollbarColor: "#3f3f3f #1c1c1c" }}
        className="dark-scroll rounded-lg border border-zinc-700 bg-zinc-900 p-4"
      >
        <h3 className="mb-3 font-semibold text-sm">
          {hoveredDistrict
            ? njDistricts.find(d => d.cd === hoveredDistrict)?.name ?? panel.label
            : panel.label}
        </h3>
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
