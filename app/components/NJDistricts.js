import districts from "../data/nj-districts.json";

const PAD = 8;
const X0 = 849.163 - PAD;
const Y0 = 204.012 - PAD;
const W  = 873.197 - 849.163 + PAD * 2;
const H  = 259.152 - 204.012 + PAD * 2;

export default function NJDistricts() {
  return (
    <svg viewBox={`${X0} ${Y0} ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {districts.map(d => (
        <path key={d.cd} d={d.d} fill="#1e3a5f" stroke="#ffffff" strokeWidth={0.1} />
      ))}
    </svg>
  );
}
