import { readFileSync, writeFileSync } from 'fs';
import * as d3geo from 'd3-geo';

const geoJSON = JSON.parse(readFileSync('./public/congressional-districts.json', 'utf8'));

const projection = d3geo.geoAlbersUsa().scale(1300).translate([487.5, 305]);
const pathGen = d3geo.geoPath().projection(projection);

const W = 975, H = 610;

// Strip geoAlbersUsa clip-frame artifacts.
// Two checks:
//   1. First coordinate must be inside the viewBox (catches M-65/M-104 Alaska/outer rects)
//   2. Must have >4 coordinate pairs (catches the Hawaii inset rect M209.3,520.8
//      which has valid coords but is just a 4-corner bounding box)
function stripClip(d) {
  if (!d) return '';
  const subpaths = d.match(/M[^M]+/g) || [];
  return subpaths
    .filter(sp => {
      const m = sp.match(/M([\d.-]+),([\d.-]+)/);
      if (!m) return false;
      const x = parseFloat(m[1]), y = parseFloat(m[2]);
      if (x < 0 || x > W || y < 0 || y > H) return false;
      const coords = sp.match(/[\d.-]+,[\d.-]+/g) || [];
      return coords.length > 4;
    })
    .join('');
}

const STATES = [
  { fips: '01', abbr: 'al', name: 'Alabama' },
  { fips: '02', abbr: 'ak', name: 'Alaska' },
  { fips: '04', abbr: 'az', name: 'Arizona' },
  { fips: '05', abbr: 'ar', name: 'Arkansas' },
  { fips: '06', abbr: 'ca', name: 'California' },
  { fips: '08', abbr: 'co', name: 'Colorado' },
  { fips: '09', abbr: 'ct', name: 'Connecticut' },
  { fips: '10', abbr: 'de', name: 'Delaware' },
  { fips: '12', abbr: 'fl', name: 'Florida' },
  { fips: '13', abbr: 'ga', name: 'Georgia' },
  { fips: '15', abbr: 'hi', name: 'Hawaii' },
  { fips: '16', abbr: 'id', name: 'Idaho' },
  { fips: '17', abbr: 'il', name: 'Illinois' },
  { fips: '18', abbr: 'in', name: 'Indiana' },
  { fips: '19', abbr: 'ia', name: 'Iowa' },
  { fips: '20', abbr: 'ks', name: 'Kansas' },
  { fips: '21', abbr: 'ky', name: 'Kentucky' },
  { fips: '22', abbr: 'la', name: 'Louisiana' },
  { fips: '23', abbr: 'me', name: 'Maine' },
  { fips: '24', abbr: 'md', name: 'Maryland' },
  { fips: '25', abbr: 'ma', name: 'Massachusetts' },
  { fips: '26', abbr: 'mi', name: 'Michigan' },
  { fips: '27', abbr: 'mn', name: 'Minnesota' },
  { fips: '28', abbr: 'ms', name: 'Mississippi' },
  { fips: '29', abbr: 'mo', name: 'Missouri' },
  { fips: '30', abbr: 'mt', name: 'Montana' },
  { fips: '31', abbr: 'ne', name: 'Nebraska' },
  { fips: '32', abbr: 'nv', name: 'Nevada' },
  { fips: '33', abbr: 'nh', name: 'New Hampshire' },
  { fips: '35', abbr: 'nm', name: 'New Mexico' },
  { fips: '36', abbr: 'ny', name: 'New York' },
  { fips: '37', abbr: 'nc', name: 'North Carolina' },
  { fips: '38', abbr: 'nd', name: 'North Dakota' },
  { fips: '39', abbr: 'oh', name: 'Ohio' },
  { fips: '40', abbr: 'ok', name: 'Oklahoma' },
  { fips: '41', abbr: 'or', name: 'Oregon' },
  { fips: '44', abbr: 'ri', name: 'Rhode Island' },
  { fips: '45', abbr: 'sc', name: 'South Carolina' },
  { fips: '46', abbr: 'sd', name: 'South Dakota' },
  { fips: '47', abbr: 'tn', name: 'Tennessee' },
  { fips: '48', abbr: 'tx', name: 'Texas' },
  { fips: '49', abbr: 'ut', name: 'Utah' },
  { fips: '50', abbr: 'vt', name: 'Vermont' },
  { fips: '51', abbr: 'va', name: 'Virginia' },
  { fips: '53', abbr: 'wa', name: 'Washington' },
  { fips: '54', abbr: 'wv', name: 'West Virginia' },
  { fips: '55', abbr: 'wi', name: 'Wisconsin' },
  { fips: '56', abbr: 'wy', name: 'Wyoming' },
  { fips: '34', abbr: 'nj', name: 'New Jersey' },
  { fips: '42', abbr: 'pa', name: 'Pennsylvania' },
];

for (const state of STATES) {
  const features = geoJSON.features.filter(f => f.properties.STATE === state.fips);
  const districts = features
    .map(f => {
      const cd = f.properties.CD119.padStart(2, '0');
      const d = stripClip(pathGen(f));
      return { cd, name: f.properties.NAME, d };
    })
    .filter(d => d.d)
    .sort((a, b) => parseInt(a.cd) - parseInt(b.cd));

  writeFileSync(`./app/data/${state.abbr}-districts.json`, JSON.stringify(districts));
  console.log(`${state.name}: ${districts.length} district(s)`);
}

console.log('\nDone.');
