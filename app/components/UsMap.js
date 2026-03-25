"use client";

import { useState, useRef, useEffect } from "react";
import states from "../data/states.json";
import alDistricts from "../data/al-districts.json";
import akDistricts from "../data/ak-districts.json";
import azDistricts from "../data/az-districts.json";
import arDistricts from "../data/ar-districts.json";
import caDistricts from "../data/ca-districts.json";
import coDistricts from "../data/co-districts.json";
import ctDistricts from "../data/ct-districts.json";
import deDistricts from "../data/de-districts.json";
import flDistricts from "../data/fl-districts.json";
import gaDistricts from "../data/ga-districts.json";
import hiDistricts from "../data/hi-districts.json";
import idDistricts from "../data/id-districts.json";
import ilDistricts from "../data/il-districts.json";
import inDistricts from "../data/in-districts.json";
import iaDistricts from "../data/ia-districts.json";
import ksDistricts from "../data/ks-districts.json";
import kyDistricts from "../data/ky-districts.json";
import laDistricts from "../data/la-districts.json";
import meDistricts from "../data/me-districts.json";
import mdDistricts from "../data/md-districts.json";
import maDistricts from "../data/ma-districts.json";
import miDistricts from "../data/mi-districts.json";
import mnDistricts from "../data/mn-districts.json";
import msDistricts from "../data/ms-districts.json";
import moDistricts from "../data/mo-districts.json";
import mtDistricts from "../data/mt-districts.json";
import neDistricts from "../data/ne-districts.json";
import nvDistricts from "../data/nv-districts.json";
import nhDistricts from "../data/nh-districts.json";
import njDistricts from "../data/nj-districts.json";
import nmDistricts from "../data/nm-districts.json";
import nyDistricts from "../data/ny-districts.json";
import ncDistricts from "../data/nc-districts.json";
import ndDistricts from "../data/nd-districts.json";
import ohDistricts from "../data/oh-districts.json";
import okDistricts from "../data/ok-districts.json";
import orDistricts from "../data/or-districts.json";
import paDistricts from "../data/pa-districts.json";
import riDistricts from "../data/ri-districts.json";
import scDistricts from "../data/sc-districts.json";
import sdDistricts from "../data/sd-districts.json";
import tnDistricts from "../data/tn-districts.json";
import txDistricts from "../data/tx-districts.json";
import utDistricts from "../data/ut-districts.json";
import vtDistricts from "../data/vt-districts.json";
import vaDistricts from "../data/va-districts.json";
import waDistricts from "../data/wa-districts.json";
import wvDistricts from "../data/wv-districts.json";
import wiDistricts from "../data/wi-districts.json";
import wyDistricts from "../data/wy-districts.json";

const FIPS_TO_ABBR = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE",
  "11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA",
  "20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN",
  "28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM",
  "36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI",
  "45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA",
  "54":"WV","55":"WI","56":"WY","72":"PR",
};

const DISTRICT_DATA = {
  "01":alDistricts,"02":akDistricts,"04":azDistricts,"05":arDistricts,
  "06":caDistricts,"08":coDistricts,"09":ctDistricts,"10":deDistricts,
  "12":flDistricts,"13":gaDistricts,"15":hiDistricts,"16":idDistricts,
  "17":ilDistricts,"18":inDistricts,"19":iaDistricts,"20":ksDistricts,
  "21":kyDistricts,"22":laDistricts,"23":meDistricts,"24":mdDistricts,
  "25":maDistricts,"26":miDistricts,"27":mnDistricts,"28":msDistricts,
  "29":moDistricts,"30":mtDistricts,"31":neDistricts,"32":nvDistricts,
  "33":nhDistricts,"34":njDistricts,"35":nmDistricts,"36":nyDistricts,
  "37":ncDistricts,"38":ndDistricts,"39":ohDistricts,"40":okDistricts,
  "41":orDistricts,"42":paDistricts,"44":riDistricts,"45":scDistricts,
  "46":sdDistricts,"47":tnDistricts,"48":txDistricts,"49":utDistricts,
  "50":vtDistricts,"51":vaDistricts,"53":waDistricts,"54":wvDistricts,
  "55":wiDistricts,"56":wyDistricts,
};

// Build DISTRICT_STATES from states.json bounds — cx/cy = center of bounding box
const DISTRICT_STATES = Object.fromEntries(
  states
    .filter(s => DISTRICT_DATA[s.id])
    .map(s => [s.id, {
      cx: (s.bounds.x0 + s.bounds.x1) / 2,
      cy: (s.bounds.y0 + s.bounds.y1) / 2,
      districts: DISTRICT_DATA[s.id],
    }])
);

// Qualitative palette — cycles through the color wheel, dimmed ~18% so yellow hover pops
const DISTRICT_COLORS = [
  "#ae5858", // coral red
  "#ae7664", // salmon
  "#ae8a64", // peach
  "#a19457", // golden
  "#839757", // yellow-green
  "#579764", // green
  "#57978a", // teal-green
  "#578b97", // teal-blue
  "#576fa4", // blue
  "#6f57a4", // blue-purple
  "#8a57a4", // purple
  "#a4578b", // magenta
  "#a4576f", // rose
  "#976262", // dusty rose
  "#628a90", // sage teal
  "#7d76a4", // soft indigo
  "#a18a5c", // warm amber
];

function districtColor(cd) {
  const n = DISTRICT_COLORS.length;
  return DISTRICT_COLORS[((parseInt(cd, 10) - 1) % n + n) % n];
}

// "Frost, Maxwell" → "Maxwell Frost"
function formatName(n) {
  const p = n.split(", ");
  return p.length === 2 ? `${p[1]} ${p[0]}` : n;
}

const W = 975, H = 610;

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
  const [lockedDistrict, setLockedDistrict] = useState(null);
  const [transform, setTransform]   = useState({ scale: 1, tx: 0, ty: 0 });
  const [panel, setPanel] = useState({ label: "National — Top Fundraisers", candidates: [], loading: true });
  const [showDistricts, setShowDistricts] = useState(false);
  const [extraZoom, setExtraZoom]         = useState(1);
  const [panOffset, setPanOffset]         = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning]         = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [animateZoom, setAnimateZoom]     = useState(true);
  const [membersMap, setMembersMap]       = useState({});
  const debounceRef  = useRef(null);
  const nationalRef  = useRef([]);
  const districtsRef = useRef(null);
  const svgRef       = useRef(null);
  const panStartRef  = useRef(null);
  const didDragRef   = useRef(false);

  useEffect(() => {
    fetch("/api/candidates?national=1")
      .then(r => r.json())
      .then(data => {
        nationalRef.current = data.results || [];
        setPanel({ label: "National — Top Fundraisers", candidates: nationalRef.current, loading: false });
      });
  }, []);

  useEffect(() => {
    fetch("/api/members")
      .then(r => r.json())
      .then(data => {
        const map = {};
        for (const m of data.members || []) {
          map[`${m.state}-${m.district}`] = { name: formatName(m.name), party: m.partyName };
        }
        setMembersMap(map);
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
    setLockedDistrict(null);
    setExtraZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setHoveredDistrict(null);
    setSelectedId(null);
    setHoveredId(null);
    setTransform({ scale: 1, tx: 0, ty: 0 });
    setPanel({ label: "National — Top Fundraisers", candidates: nationalRef.current, loading: false });
    didDragRef.current = false;
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        if (lockedDistrict) {
          setLockedDistrict(null);
          setHoveredDistrict(null);
          setExtraZoom(1);
        } else {
          resetState();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lockedDistrict]);

  function handleClick(s, e) {
    e.stopPropagation();
    if (didDragRef.current) return;
    if (lockedDistrict) {
      setLockedDistrict(null);
      setHoveredDistrict(null);
      setExtraZoom(1);
      return;
    }
    if (selectedId === s.id) {
      resetState();
    } else {
      clearTimeout(districtsRef.current);
      setShowDistricts(false);
      setLockedDistrict(null);
      setHoveredDistrict(null);
      setExtraZoom(1);
      setPanOffset({ x: 0, y: 0 });
      setSelectedId(s.id);
      setHoveredId(null);
      setTransform(getZoomTransform(s.bounds));
      if (s.id in DISTRICT_STATES) {
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
    // Lock mode is exited only by the X button now.
    if (!lockedDistrict && selectedId) {
      resetState();
    }
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

  // Compute final transform — use centroid-based zoom for district states
  const districtInfo = selectedId ? DISTRICT_STATES[selectedId] : null;
  const baseScale = districtInfo ? transform.scale * extraZoom : transform.scale;
  const baseTx    = districtInfo ? W / 2 - districtInfo.cx * baseScale : transform.tx;
  const baseTy    = districtInfo ? H / 2 - districtInfo.cy * baseScale : transform.ty;
  const actualTx  = baseTx + panOffset.x;
  const actualTy  = baseTy + panOffset.y;
  const actualScale = baseScale;

  const activeDistricts = showDistricts && districtInfo ? districtInfo.districts : null;

  const cursor = !selectedId ? "default"
               : isPanning   ? "grabbing"
               : "grab";

  return (
    <div className="flex w-full gap-4" style={{ alignItems: "flex-start" }}>
      {/* Map container */}
      <div style={{ flex: "1 1 0", minWidth: 0, paddingRight: 24, marginLeft: -12, position: "relative" }}>
        {/* Instructions above map */}
        <div
          style={{
            textAlign: "center",
            color: "#ffffff",
            fontSize: 16,
            lineHeight: 1.5,
            marginBottom: 16,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selectedId ? (
            <div style={{ fontSize: 15, color: "#f0f0f0", fontWeight: 500 }}>
              {lockedDistrict
                ? "District locked. Click the X to exit lock mode and return to district hover."
                : districtInfo
                  ? "Hover over districts to see details. Click a district to lock it."
                  : "Press Escape to deselect"}
            </div>
          ) : hoveredId ? (
            <div style={{ fontSize: 15, color: "#f0f0f0", fontWeight: 500 }}>
              Click to select a state
            </div>
          ) : (
            <div style={{ fontSize: 15, color: "#e4e4e7", fontWeight: 500 }}>
              Hover over a state to view statistics
            </div>
          )}
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block", cursor, userSelect: "none" }}
          onClick={handleBgClick}
          onMouseDown={handleMouseDown}
        >
          <defs>
            {selectedId && (
              <clipPath id="state-clip">
                <path d={states.find(s => s.id === selectedId)?.d || ""} />
              </clipPath>
            )}
          </defs>
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
              // When districts are visible, hide the state path entirely —
              // district paths cover the correct geography (fixes Hawaii bounding-box artifact)
              const hideForDistricts = showDistricts && isSelected;
              // States with no district overlay (e.g. Hawaii) can still be hovered when selected
              const noDistrictOverlay = isSelected && !(s.id in DISTRICT_STATES);
              const fill = hideForDistricts ? "none"
                         : isSelected && isHovered && noDistrictOverlay ? "#facc15"
                         : isSelected ? "#f97316"
                         : isHovered  ? "#facc15"
                         : "#1e3a5f";
              return (
                <path
                  key={s.id}
                  d={s.d}
                  fill={fill}
                  stroke={hideForDistricts ? "none" : "#ffffff"}
                  strokeWidth={isSelected ? 2 / actualScale : 1.5 / actualScale}
                  style={{ cursor: noDistrictOverlay ? "default" : selectedId ? "inherit" : "pointer", transition: "fill 0.15s" }}
                  onMouseEnter={() => { if (!selectedId) handleEnter(s); else if (noDistrictOverlay) setHoveredId(s.id); }}
                  onMouseLeave={() => { if (!selectedId) handleLeave(); else if (noDistrictOverlay) setHoveredId(null); }}
                  onClick={e => handleClick(s, e)}
                />
              );
            })}
            {activeDistricts && (
              <g clipPath="url(#state-clip)">
                {activeDistricts.map(d => {
                  const isSelectedDistrict = lockedDistrict === d.cd;
                  const isHoveredDistrict = hoveredDistrict === d.cd;
                  return (
                    <path
                      key={d.cd}
                      d={d.d}
                      fill={isSelectedDistrict || isHoveredDistrict ? "#facc15" : districtColor(d.cd)}
                      stroke={isSelectedDistrict || isHoveredDistrict ? "#ffffff" : "#e2e8f0"}
                      strokeWidth={(isSelectedDistrict || isHoveredDistrict ? 1.4 : 0.5) / actualScale}
                      style={{ cursor: "pointer", transition: "fill 0.15s" }}
                      onMouseEnter={() => {
                        if (!lockedDistrict) setHoveredDistrict(d.cd);
                      }}
                      onMouseLeave={() => {
                        if (!lockedDistrict) setHoveredDistrict(null);
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        if (!lockedDistrict) {
                          setLockedDistrict(d.cd);
                          setHoveredDistrict(d.cd);
                        }
                      }}
                    />
                  );
                })}
              </g>
            )}
          </g>
        </svg>

        {/* Zoom buttons — district states only */}
        {districtInfo && (
          <>
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
          </>
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

        {(selectedId || lockedDistrict) && (
          <button
            onClick={e => {
              e.stopPropagation();
              if (lockedDistrict) {
                setLockedDistrict(null);
                setHoveredDistrict(null);
                setExtraZoom(1);
                return;
              }
              resetState();
            }}
            onMouseDown={e => e.stopPropagation()}
            style={{
              position: "absolute", bottom: 16, right: 16,
              width: 44, height: 44, borderRadius: "50%", border: "2px solid #facc15",
              background: "#111827", color: "#facc15", fontSize: 22,
              fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 10px rgba(250, 204, 21, 0.35)",
            }}
            title="Exit locked view"
          >✕</button>
        )}
      </div>

      {/* Side panel */}
      <div
        style={{ width: 400, flexShrink: 0, height: 620, overflowY: "scroll",
          scrollbarWidth: "thin", scrollbarColor: "#3f3f3f #1c1c1c" }}
        className="dark-scroll rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden"
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a2744 0%, #0f172a 100%)",
          borderBottom: "1px solid #3f3f46",
          padding: "16px 16px 14px",
        }}>
          {/* Row 1: small label */}
          <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 4 }}>
            {selectedId || hoveredId ? "State" : "National"}
          </p>
          {/* Row 2: state / national title — always present */}
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "#f4f4f5", lineHeight: 1.2, margin: "0 0 12px" }}>
            {panel.label}
          </h3>
          {/* Rows 3+4: district block — shown on district hover, or when hovering a no-overlay state (e.g. Hawaii) */}
          {(() => {
            const hawaiiHover = selectedId === "15" && hoveredId === "15";
          const selectedDistrict = (lockedDistrict || hoveredDistrict) && activeDistricts ? (lockedDistrict || hoveredDistrict) : null;
          const show = (selectedDistrict && activeDistricts) || hawaiiHover;
          const districtLabel = selectedDistrict && activeDistricts
            ? activeDistricts.find(d => d.cd === selectedDistrict)?.name ?? ""
            : hawaiiHover ? "At Large" : "placeholder";

            // Look up incumbent
            const selectedStateName = states.find(s => s.id === selectedId)?.name;
            const districtNum = selectedDistrict ? parseInt(selectedDistrict, 10) : 0;
            const incumbent = selectedStateName
              ? membersMap[`${selectedStateName}-${districtNum}`]
              : null;

            return (
              <div style={{ visibility: show ? "visible" : "hidden" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 4 }}>
                  Congressional District
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#e4e4e7", lineHeight: 1.2, margin: "0 0 10px" }}>
                  {districtLabel}
                </p>
                <div style={{ visibility: incumbent ? "visible" : "hidden", display: "flex", alignItems: "center", gap: 6, minHeight: 20 }}>
                  <span style={{
                    fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                    background: "#292524", color: "#a8a29e", border: "1px solid #44403c",
                    borderRadius: 4, padding: "2px 5px", fontWeight: 600,
                  }}>Incumbent</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#e4e4e7" }}>{incumbent?.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 5px",
                    background: incumbent?.party === "Republican" ? "#7f1d1d" : incumbent?.party === "Democratic" ? "#1e3a8a" : "#3f3f46",
                    color: incumbent?.party === "Republican" ? "#fca5a5" : incumbent?.party === "Democratic" ? "#93c5fd" : "#d4d4d8",
                  }}>
                    {incumbent?.party === "Republican" ? "REP" : incumbent?.party === "Democratic" ? "DEM" : (incumbent?.party ?? "")}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
        <div className="p-4">
        {panel.loading ? (
          <p className="text-sm text-zinc-400">Loading...</p>
        ) : (() => {
          const selectedDistrictVal = lockedDistrict || hoveredDistrict;
          const displayed = selectedDistrictVal && activeDistricts
            ? panel.candidates.filter(c => parseInt(c.district) === parseInt(selectedDistrictVal))
            : panel.candidates;
          return displayed.length === 0 ? (
            <p className="text-sm text-zinc-500">No 2026 filings yet.</p>
          ) : (
          <ul className="space-y-2">
            {displayed.map((c, idx) => (
              <li key={`${c.candidate_id}-${c.district}-${idx}`} className="rounded border border-zinc-700 p-2 text-sm">
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
          );
        })()}
        </div>{/* end p-4 */}
      </div>
    </div>
  );
}
