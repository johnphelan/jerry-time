import Nav from "../components/Nav";
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

const DISTRICT_COLORS = [
  "#ae5858", "#ae7664", "#ae8a64", "#a19457", "#839757",
  "#579764", "#57978a", "#578b97", "#576fa4", "#6f57a4",
  "#8a57a4", "#a4578b", "#a4576f", "#976262", "#628a90",
  "#7d76a4", "#a18a5c",
];

function districtColor(cd) {
  return DISTRICT_COLORS[(parseInt(cd, 10) - 1) % DISTRICT_COLORS.length];
}

const PAD = 8;

function getState(id) {
  const s = states.find(x => x.id === id);
  return {
    vb: `${s.bounds.x0 - PAD} ${s.bounds.y0 - PAD} ${s.bounds.x1 - s.bounds.x0 + PAD * 2} ${s.bounds.y1 - s.bounds.y0 + PAD * 2}`,
    d: s.d,
  };
}

function StateRow({ name, fips, districts }) {
  const { vb, d } = getState(fips);
  return (
    <div className="mb-10">
      <h2 className="text-sm font-semibold mb-3 text-zinc-300">
        {name} <span className="text-zinc-500 font-normal">· {districts.length} district{districts.length !== 1 ? "s" : ""}</span>
      </h2>
      <div className="flex gap-8 items-start">
        <div style={{ width: 340 }}>
          <p className="text-xs text-zinc-500 mb-1">Outline</p>
          <svg viewBox={vb} style={{ width: "100%", height: "auto", display: "block" }}>
            <path d={d} fill="#1e3a5f" stroke="#ffffff" strokeWidth={0.15} />
          </svg>
        </div>
        <div style={{ width: 340 }}>
          <p className="text-xs text-zinc-500 mb-1">Congressional districts</p>
          <svg viewBox={vb} style={{ width: "100%", height: "auto", display: "block" }}>
            {districts.map(dist => (
              <path
                key={dist.cd}
                d={dist.d}
                fill={districtColor(dist.cd)}
                stroke="#ffffff"
                strokeWidth={0.15}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

const ALL_STATES = [
  { name: "Alabama",       fips: "01", districts: alDistricts },
  { name: "Alaska",        fips: "02", districts: akDistricts },
  { name: "Arizona",       fips: "04", districts: azDistricts },
  { name: "Arkansas",      fips: "05", districts: arDistricts },
  { name: "California",    fips: "06", districts: caDistricts },
  { name: "Colorado",      fips: "08", districts: coDistricts },
  { name: "Connecticut",   fips: "09", districts: ctDistricts },
  { name: "Delaware",      fips: "10", districts: deDistricts },
  { name: "Florida",       fips: "12", districts: flDistricts },
  { name: "Georgia",       fips: "13", districts: gaDistricts },
  { name: "Hawaii",        fips: "15", districts: hiDistricts },
  { name: "Idaho",         fips: "16", districts: idDistricts },
  { name: "Illinois",      fips: "17", districts: ilDistricts },
  { name: "Indiana",       fips: "18", districts: inDistricts },
  { name: "Iowa",          fips: "19", districts: iaDistricts },
  { name: "Kansas",        fips: "20", districts: ksDistricts },
  { name: "Kentucky",      fips: "21", districts: kyDistricts },
  { name: "Louisiana",     fips: "22", districts: laDistricts },
  { name: "Maine",         fips: "23", districts: meDistricts },
  { name: "Maryland",      fips: "24", districts: mdDistricts },
  { name: "Massachusetts", fips: "25", districts: maDistricts },
  { name: "Michigan",      fips: "26", districts: miDistricts },
  { name: "Minnesota",     fips: "27", districts: mnDistricts },
  { name: "Mississippi",   fips: "28", districts: msDistricts },
  { name: "Missouri",        fips: "29", districts: moDistricts },
  { name: "Montana",         fips: "30", districts: mtDistricts },
  { name: "Nebraska",        fips: "31", districts: neDistricts },
  { name: "Nevada",          fips: "32", districts: nvDistricts },
  { name: "New Hampshire",   fips: "33", districts: nhDistricts },
  { name: "New Jersey",      fips: "34", districts: njDistricts },
  { name: "New Mexico",      fips: "35", districts: nmDistricts },
  { name: "New York",        fips: "36", districts: nyDistricts },
  { name: "North Carolina",  fips: "37", districts: ncDistricts },
  { name: "North Dakota",    fips: "38", districts: ndDistricts },
  { name: "Ohio",            fips: "39", districts: ohDistricts },
  { name: "Oklahoma",        fips: "40", districts: okDistricts },
  { name: "Oregon",          fips: "41", districts: orDistricts },
  { name: "Pennsylvania",    fips: "42", districts: paDistricts },
  { name: "Rhode Island",    fips: "44", districts: riDistricts },
  { name: "South Carolina",  fips: "45", districts: scDistricts },
  { name: "South Dakota",    fips: "46", districts: sdDistricts },
  { name: "Tennessee",       fips: "47", districts: tnDistricts },
  { name: "Texas",           fips: "48", districts: txDistricts },
  { name: "Utah",            fips: "49", districts: utDistricts },
  { name: "Vermont",         fips: "50", districts: vtDistricts },
  { name: "Virginia",        fips: "51", districts: vaDistricts },
  { name: "Washington",      fips: "53", districts: waDistricts },
  { name: "West Virginia",   fips: "54", districts: wvDistricts },
  { name: "Wisconsin",       fips: "55", districts: wiDistricts },
  { name: "Wyoming",         fips: "56", districts: wyDistricts },
];

export default function Districts() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <Nav />
      <main className="flex-1 p-6">
        <p className="text-xs text-zinc-500 mb-8">119th Congress · {ALL_STATES.length} states</p>
        {ALL_STATES.map(s => (
          <StateRow key={s.fips} {...s} />
        ))}
      </main>
    </div>
  );
}
