/* ===== Skoobie-Dew & the Mystery Mansion — scene art =====
   Immersive room art rendered as layered SVG, so it ships with the game and
   works fully offline (no image files, no network). Each scene is composed from
   a themed PALETTE + a few silhouetted PROPS + atmosphere (light, fog, dust,
   cobwebs, vignette). Driven by the SCENES table keyed on room id. */
const Scenes = (function () {
  "use strict";
  const W = 800, H = 300, FLOOR = 186;

  /* zone palettes: sky gradient, floor, silhouette ink, rim light, glow */
  const PALETTES = {
    royal:  { sky: ["#3a2660", "#140a28"], floor: "#170d2b", sil: "#0c0718", rim: "#b388ff", light: "#d9c2ff" },
    amber:  { sky: ["#4a3416", "#1a0f05"], floor: "#241606", sil: "#160c03", rim: "#ffb347", light: "#ffe2a8" },
    teal:   { sky: ["#16463a", "#08130f"], floor: "#0d2019", sil: "#06120d", rim: "#5fd6a8", light: "#c8f5e0" },
    cold:   { sky: ["#193049", "#060c14"], floor: "#0c1825", sil: "#050a12", rim: "#6fb3ff", light: "#cfe2ff" },
    violet: { sky: ["#3d1d56", "#120720"], floor: "#1d0f2d", sil: "#0d0618", rim: "#d18bff", light: "#f3d6ff" },
    night:  { sky: ["#1d2450", "#070a18"], floor: "#0f1430", sil: "#060a18", rim: "#8fa8ff", light: "#d6e0ff" },
    eerie:  { sky: ["#134029", "#05130c"], floor: "#0a2014", sil: "#04110a", rim: "#6dff9f", light: "#c6ffd8" },
  };

  /* ---- helper drawing bits ---- */
  const flame = (x, y, p) => `<circle cx="${x}" cy="${y}" r="9" fill="${p.light}" opacity=".25" class="s-flicker"/><ellipse cx="${x}" cy="${y}" rx="2.4" ry="4.5" fill="${p.light}" class="s-flicker"/>`;
  const moon = (x, y, p) => `<circle cx="${x}" cy="${y}" r="60" fill="${p.light}" opacity=".10"/><circle cx="${x}" cy="${y}" r="30" fill="${p.light}" opacity=".9"/><circle cx="${x + 12}" cy="${y - 6}" r="26" fill="${p.sky[1]}" opacity=".55"/>`;
  const beam = (x, p) => `<polygon points="${x - 34},40 ${x + 34},40 ${x + 150},${FLOOR + 8} ${x - 150},${FLOOR + 8}" fill="${p.light}" opacity=".07" class="s-flicker-slow"/>`;
  const cobweb = (cx, cy, s, p) => {
    const m = s < 0 ? -1 : 1, a = Math.abs(s);
    let w = `<g opacity=".5" stroke="${p.rim}" stroke-width="1" fill="none" opacity=".22">`;
    for (let i = 1; i <= 3; i++) w += `<path d="M${cx},${cy} q ${m * 40 * a},${8 * i * a} ${m * 70 * a},${i * 22 * a}"/>`;
    w += `<path d="M${cx},${cy} L${cx + m * 78 * a},${cy} M${cx},${cy} L${cx + m * 55 * a},${cy + 55 * a} M${cx},${cy} L${cx + m * 20 * a},${cy + 75 * a}"/></g>`;
    return w;
  };

  /* ---- prop library: each (c,p) -> svg, drawn around c.x with base on FLOOR ---- */
  const PROPS = {
    chandelier: (c, p) => `<g transform="translate(${c.x},0)" class="s-sway"><line x1="0" y1="0" x2="0" y2="42" stroke="${p.sil}" stroke-width="3"/><ellipse cx="0" cy="58" rx="46" ry="9" fill="none" stroke="${p.sil}" stroke-width="5"/><path d="M0 42 L0 58" stroke="${p.sil}" stroke-width="3"/>${flame(-46, 52, p)}${flame(-23, 50, p)}${flame(0, 49, p)}${flame(23, 50, p)}${flame(46, 52, p)}</g>`,
    window: (c, p) => `<g>${moon(c.x, 70, p)}<path d="M${c.x - 48} 130 L${c.x - 48} 56 Q${c.x} 6 ${c.x + 48} 56 L${c.x + 48} 130 Z" fill="none" stroke="${p.sil}" stroke-width="7"/><line x1="${c.x}" y1="20" x2="${c.x}" y2="130" stroke="${p.sil}" stroke-width="5"/><line x1="${c.x - 48}" y1="84" x2="${c.x + 48}" y2="84" stroke="${p.sil}" stroke-width="5"/></g>${beam(c.x, p)}`,
    shelf: (c, p) => { const w = c.w || 110, rows = 4; let s = `<g transform="translate(${c.x},0)"><rect x="${-w / 2}" y="${FLOOR - 150}" width="${w}" height="150" fill="${p.sil}"/>`; for (let i = 0; i < rows; i++) { const y = FLOOR - 138 + i * 34; let k = 0; for (let j = -w / 2 + 8; j < w / 2 - 8; j += 11, k++) { const m = (k + i) % 3; s += `<rect x="${j}" y="${y - (6 + m * 4)}" width="8" height="${10 + m * 6}" fill="${p.rim}" opacity="${0.25 + (k % 2) * 0.15}"/>`; } } return s + "</g>"; },
    table: (c, p) => { const w = c.w || 150; return `<g transform="translate(${c.x},0)"><rect x="${-w / 2}" y="${FLOOR - 44}" width="${w}" height="12" fill="${p.sil}"/><rect x="${-w / 2 + 8}" y="${FLOOR - 32}" width="9" height="32" fill="${p.sil}"/><rect x="${w / 2 - 17}" y="${FLOOR - 32}" width="9" height="32" fill="${p.sil}"/>${c.items ? c.items.map((it, i) => flame(-w / 2 + 24 + i * 26, FLOOR - 52, p)).join("") : ""}</g>`; },
    desk: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-70" y="${FLOOR - 46}" width="140" height="14" fill="${p.sil}"/><rect x="-66" y="${FLOOR - 32}" width="40" height="32" fill="${p.sil}"/><rect x="26" y="${FLOOR - 32}" width="40" height="32" fill="${p.sil}"/>${flame(-44, FLOOR - 56, p)}</g>`,
    safe: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-34" y="${FLOOR - 70}" width="68" height="64" rx="5" fill="${p.sil}"/><circle cx="0" cy="${FLOOR - 38}" r="13" fill="none" stroke="${p.rim}" stroke-width="3" opacity=".6"/><circle cx="0" cy="${FLOOR - 38}" r="3" fill="${p.rim}" opacity=".6"/></g>`,
    pillar: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-18" y="20" width="36" height="${FLOOR - 20}" fill="${p.sil}"/><rect x="-26" y="14" width="52" height="14" fill="${p.sil}"/><rect x="-26" y="${FLOOR - 14}" width="52" height="16" fill="${p.sil}"/></g>`,
    column: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-15" y="30" width="30" height="${FLOOR - 30}" fill="${p.sil}"/><rect x="-22" y="24" width="44" height="12" fill="${p.sil}"/></g>`,
    sarcophagus: (c, p) => `<g transform="translate(${c.x},0)"><polygon points="-70,${FLOOR} -56,${FLOOR - 40} 56,${FLOOR - 40} 70,${FLOOR}" fill="${p.sil}"/><ellipse cx="0" cy="${FLOOR - 40}" rx="56" ry="13" fill="${p.sil}"/><ellipse cx="0" cy="${FLOOR - 46}" rx="40" ry="9" fill="none" stroke="${p.rim}" stroke-width="2" opacity=".4"/><circle cx="0" cy="${FLOOR - 60}" r="8" fill="none" stroke="${p.rim}" stroke-width="2" opacity=".4"/></g>`,
    piano: (c, p) => `<g transform="translate(${c.x},0)"><path d="M-95 ${FLOOR} L-95 ${FLOOR - 50} L70 ${FLOOR - 60} L70 ${FLOOR} Z" fill="${p.sil}"/><rect x="-95" y="${FLOOR - 64}" width="120" height="10" fill="${p.sil}"/><path d="M-95 ${FLOOR - 50} L-95 ${FLOOR - 44} L40 ${FLOOR - 50} L40 ${FLOOR - 56} Z" fill="${p.light}" opacity=".75"/><rect x="-92" y="${FLOOR - 6}" width="8" height="6" fill="${p.sil}"/><rect x="60" y="${FLOOR - 8}" width="8" height="8" fill="${p.sil}"/></g>`,
    fern: (c, p) => { const s = c.s || 1; let f = `<g transform="translate(${c.x},${FLOOR}) scale(${s})">`; for (let i = -3; i <= 3; i++) f += `<path d="M0 0 Q${i * 14} -50 ${i * 26} -${70 - Math.abs(i) * 6}" stroke="${p.sil}" stroke-width="6" fill="none" stroke-linecap="round"/>`; f += `<path d="M0 0 Q4 -40 0 -78" stroke="${p.rim}" stroke-width="3" fill="none" opacity=".4"/></g>`; return f; },
    pod: (c, p) => `<g transform="translate(${c.x},${FLOOR})"><path d="M0 0 Q-30 -50 0 -86 Q30 -50 0 0" fill="${p.sil}"/><ellipse cx="0" cy="-58" rx="16" ry="26" fill="${p.rim}" opacity=".22" class="s-flicker-slow"/><path d="M-14 0 Q-40 -30 -52 -64" stroke="${p.sil}" stroke-width="5" fill="none"/><path d="M14 0 Q40 -30 52 -64" stroke="${p.sil}" stroke-width="5" fill="none"/></g>`,
    telescope: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-10" y="${FLOOR - 26}" width="20" height="26" fill="${p.sil}"/><polygon points="-10,${FLOOR - 26} 10,${FLOOR - 26} 30,${FLOOR - 30} 24,${FLOOR - 36} -4,${FLOOR - 32}" fill="${p.sil}"/><rect x="-30" y="${FLOOR - 96} " width="80" height="22" rx="11" fill="${p.sil}" transform="rotate(-26 0 ${FLOOR - 60})"/><circle cx="48" cy="${FLOOR - 92}" r="11" fill="${p.light}" opacity=".7" transform="rotate(-26 0 ${FLOOR - 60})"/></g>`,
    altar: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-56" y="${FLOOR - 40}" width="112" height="40" fill="${p.sil}"/><rect x="-64" y="${FLOOR - 48}" width="128" height="10" fill="${p.sil}"/><g transform="translate(-22,0)"><rect x="-5" y="${FLOOR - 70}" width="10" height="22" fill="${p.light}" opacity=".85"/><ellipse cx="0" cy="${FLOOR - 70}" rx="9" ry="5" fill="${p.light}" opacity=".85"/></g><g transform="translate(22,0)"><rect x="-5" y="${FLOOR - 70}" width="10" height="22" fill="${p.sil}"/><ellipse cx="0" cy="${FLOOR - 70}" rx="9" ry="5" fill="${p.sil}"/></g></g>`,
    bed: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-90" y="20" width="14" height="${FLOOR - 20}" fill="${p.sil}"/><rect x="76" y="20" width="14" height="${FLOOR - 20}" fill="${p.sil}"/><rect x="-90" y="14" width="180" height="14" fill="${p.sil}"/><rect x="-86" y="${FLOOR - 50}" width="172" height="50" fill="${p.sil}"/><rect x="-78" y="${FLOOR - 62}" width="60" height="16" rx="7" fill="${p.rim}" opacity=".3"/><path d="M-90 28 Q-70 70 -78 ${FLOOR - 50}" stroke="${p.sil}" stroke-width="10" fill="none"/></g>`,
    cradle: (c, p) => `<g transform="translate(${c.x},0)" class="s-rock"><path d="M-50 ${FLOOR - 14} Q0 ${FLOOR + 8} 50 ${FLOOR - 14} L40 ${FLOOR - 54} L-40 ${FLOOR - 54} Z" fill="${p.sil}"/><rect x="-44" y="${FLOOR - 60}" width="88" height="10" fill="${p.sil}"/>${[-30, -15, 0, 15, 30].map(x => `<line x1="${x}" y1="${FLOOR - 54}" x2="${x}" y2="${FLOOR - 18}" stroke="${p.rim}" stroke-width="2" opacity=".3"/>`).join("")}</g>`,
    trunk: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-50" y="${FLOOR - 44}" width="100" height="44" rx="4" fill="${p.sil}"/><path d="M-50 ${FLOOR - 44} Q0 ${FLOOR - 66} 50 ${FLOOR - 44}" fill="${p.sil}"/><rect x="-50" y="${FLOOR - 30}" width="100" height="7" fill="${p.rim}" opacity=".35"/><rect x="-6" y="${FLOOR - 30}" width="12" height="14" fill="${p.rim}" opacity=".5"/></g>`,
    mirror: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-30" y="${FLOOR - 120}" width="60" height="120" rx="30" fill="${p.sil}"/><rect x="-22" y="${FLOOR - 112}" width="44" height="104" rx="22" fill="${p.light}" opacity=".14"/><path d="M-10 ${FLOOR - 108} L6 ${FLOOR - 40} M2 ${FLOOR - 96} L-6 ${FLOOR - 30}" stroke="${p.sky[1]}" stroke-width="2" opacity=".8"/></g>`,
    barrel: (c, p) => `<g transform="translate(${c.x},0)"><path d="M-26 ${FLOOR} Q-34 ${FLOOR - 30} -26 ${FLOOR - 56} L26 ${FLOOR - 56} Q34 ${FLOOR - 30} 26 ${FLOOR} Z" fill="${p.sil}"/><rect x="-30" y="${FLOOR - 40}" width="60" height="5" fill="${p.rim}" opacity=".3"/><rect x="-30" y="${FLOOR - 20}" width="60" height="5" fill="${p.rim}" opacity=".3"/></g>`,
    hearth: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-70" y="${FLOOR - 110}" width="140" height="110" fill="${p.sil}"/><rect x="-46" y="${FLOOR - 70}" width="92" height="70" fill="${p.sky[1]}"/><path d="M-46 ${FLOOR - 70} L-46 ${FLOOR - 84} L46 ${FLOOR - 84} L46 ${FLOOR - 70} Z" fill="${p.sil}"/>${flame(-16, FLOOR - 18, p)}${flame(2, FLOOR - 22, p)}${flame(20, FLOOR - 16, p)}<ellipse cx="0" cy="${FLOOR - 12}" rx="42" ry="14" fill="${p.rim}" opacity=".18"/></g>`,
    door: (c, p) => `<g transform="translate(${c.x},0)"><path d="M${-(c.w || 40)} ${FLOOR} L${-(c.w || 40)} ${FLOOR - 130} Q0 ${FLOOR - 158} ${c.w || 40} ${FLOOR - 130} L${c.w || 40} ${FLOOR} Z" fill="${p.sil}"/><line x1="0" y1="${FLOOR - 140}" x2="0" y2="${FLOOR}" stroke="${p.sky[1]}" stroke-width="3"/><circle cx="${(c.w || 40) - 12}" cy="${FLOOR - 64}" r="4" fill="${p.rim}" opacity=".6"/><circle cx="${-(c.w || 40) + 12}" cy="${FLOOR - 64}" r="4" fill="${p.rim}" opacity=".6"/></g>`,
    portrait: (c, p) => `<g transform="translate(${c.x},${c.crooked ? 6 : 0}) rotate(${c.crooked ? -8 : 0})"><rect x="-32" y="${FLOOR - 150}" width="64" height="84" fill="${p.sil}"/><rect x="-24" y="${FLOOR - 142}" width="48" height="68" fill="${p.rim}" opacity=".18"/><circle cx="0" cy="${FLOOR - 118}" r="11" fill="${p.sil}"/><path d="M-16 ${FLOOR - 78} Q0 ${FLOOR - 100} 16 ${FLOOR - 78} Z" fill="${p.sil}"/></g>`,
    staircase: (c, p) => { let s = `<g transform="translate(${c.x},0)">`; for (let i = 0; i < 7; i++) s += `<rect x="${-110 + i * 16}" y="${FLOOR - i * 22}" width="${150 - i * 16}" height="22" fill="${p.sil}" opacity="${1 - i * 0.04}"/>`; s += `<rect x="-118" y="20" width="10" height="${FLOOR - 20}" fill="${p.sil}"/></g>`; return s; },
    maskStand: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-4" y="${FLOOR - 70}" width="8" height="70" fill="${p.sil}"/><ellipse cx="0" cy="${FLOOR - 92}" rx="22" ry="28" fill="${p.sil}"/><ellipse cx="-8" cy="${FLOOR - 98}" rx="4" ry="6" fill="${p.rim}" opacity=".7"/><ellipse cx="8" cy="${FLOOR - 98}" rx="4" ry="6" fill="${p.rim}" opacity=".7"/></g>`,
    hooks: (c, p) => `<g transform="translate(${c.x},0)">${[-30, 0, 30].map((x, i) => `<line x1="${x}" y1="30" x2="${x}" y2="44" stroke="${p.sil}" stroke-width="3"/><path d="M${x - 16} 44 Q${x} 110 ${x + 12} ${FLOOR - 30}" fill="${p.sil}" opacity="${0.8 - i * 0.1}"/>`).join("")}</g>`,
    labtable: (c, p) => `<g transform="translate(${c.x},0)"><rect x="-70" y="${FLOOR - 44}" width="140" height="12" fill="${p.sil}"/><rect x="-64" y="${FLOOR - 32}" width="9" height="32" fill="${p.sil}"/><rect x="55" y="${FLOOR - 32}" width="9" height="32" fill="${p.sil}"/><path d="M-40 ${FLOOR - 44} L-46 ${FLOOR - 78} L-30 ${FLOOR - 78} Z" fill="${p.sil}"/><ellipse cx="-38" cy="${FLOOR - 78}" rx="8" ry="4" fill="${p.rim}" opacity=".5" class="s-flicker-slow"/><rect x="0" y="${FLOOR - 74}" width="20" height="30" rx="4" fill="${p.sil}"/><rect x="3" y="${FLOOR - 60}" width="14" height="16" fill="${p.rim}" opacity=".3" class="s-flicker-slow"/><rect x="34" y="${FLOOR - 64}" width="14" height="20" fill="${p.sil}"/></g>`,
    pots: (c, p) => `<g transform="translate(${c.x},0)">${[-40, -10, 22, 50].map((x, i) => `<line x1="${x}" y1="20" x2="${x}" y2="${36 + i * 6}" stroke="${p.sil}" stroke-width="2"/><path d="M${x - 14} ${36 + i * 6} a14 14 0 0 0 28 0 Z" fill="${p.sil}"/>`).join("")}</g>`,
    wallnotes: (c, p) => `<g transform="translate(${c.x},0)">${["#5fb0ff", "#5fd687", "#ffd166", "#ff6b81"].map((col, i) => `<circle cx="${-30 + i * 20}" cy="${FLOOR - 120}" r="8" fill="${col}" opacity=".85"/>`).join("")}</g>`,
  };

  /* floor-level effects (chasm, hatch, grate) drawn over the floor */
  const FLOOREFX = {
    chasm: (c, p) => `<ellipse cx="${c.x || 400}" cy="${FLOOR + 60}" rx="170" ry="40" fill="#000"/><ellipse cx="${c.x || 400}" cy="${FLOOR + 54}" rx="140" ry="28" fill="#000" opacity=".7"/>`,
    hatch: (c, p) => `<g transform="translate(${c.x},${FLOOR + 44})"><polygon points="-60,0 60,0 90,40 -90,40" fill="${p.sil}"/><polygon points="-40,6 40,6 56,30 -56,30" fill="#000" opacity=".6"/><rect x="-6" y="6" width="12" height="6" fill="${p.rim}" opacity=".6"/></g>`,
    grate: (c, p) => `<g transform="translate(${c.x},${FLOOR + 52})"><ellipse cx="0" cy="0" rx="34" ry="14" fill="#000" opacity=".7"/>${[-18, -6, 6, 18].map(x => `<line x1="${x}" y1="-11" x2="${x}" y2="11" stroke="${p.rim}" stroke-width="2" opacity=".5"/>`).join("")}<ellipse cx="6" cy="2" rx="3" ry="2" fill="${p.light}" opacity=".8"/></g>`,
    rug: (c, p) => `<ellipse cx="${c.x || 400}" cy="${FLOOR + 58}" rx="150" ry="34" fill="${p.rim}" opacity=".10"/>`,
  };

  /* ---- per-room scene definitions ---- */
  const SCENES = {
    foyer:        { pal: "royal",  light: true, props: [{ t: "chandelier", x: 400 }, { t: "portrait", x: 110 }, { t: "door", x: 690, w: 46 }] },
    library:      { pal: "amber",  props: [{ t: "shelf", x: 120, w: 150 }, { t: "shelf", x: 690, w: 130 }, { t: "desk", x: 410 }] },
    study:        { pal: "amber",  props: [{ t: "desk", x: 300 }, { t: "safe", x: 560 }, { t: "shelf", x: 720, w: 90 }] },
    diningHall:   { pal: "teal",   props: [{ t: "chandelier", x: 400 }, { t: "table", x: 400, w: 260, items: [1, 1, 1] }] },
    kitchen:      { pal: "teal",   props: [{ t: "pots", x: 360 }, { t: "table", x: 380, w: 150 }, { t: "barrel", x: 690 }] },
    pantry:       { pal: "teal",   props: [{ t: "shelf", x: 200, w: 150 }, { t: "shelf", x: 600, w: 150 }] },
    cellar:       { pal: "cold",   props: [{ t: "table", x: 230, w: 150, items: [1] }, { t: "barrel", x: 660 }], efx: [{ t: "hatch", x: 470 }] },
    wineCellar:   { pal: "cold",   props: [{ t: "shelf", x: 150, w: 150 }, { t: "shelf", x: 660, w: 150 }, { t: "barrel", x: 410 }] },
    catacombs:    { pal: "cold",   props: [{ t: "pillar", x: 110 }, { t: "pillar", x: 690 }], efx: [{ t: "chasm", x: 410 }] },
    crypt:        { pal: "cold",   props: [{ t: "pillar", x: 120 }, { t: "sarcophagus", x: 410 }, { t: "pillar", x: 700 }] },
    ballroom:     { pal: "violet", light: true, props: [{ t: "column", x: 110 }, { t: "chandelier", x: 400 }, { t: "hearth", x: 680 }, { t: "column", x: 250 }] },
    gallery:      { pal: "violet", props: [{ t: "portrait", x: 120 }, { t: "portrait", x: 250 }, { t: "portrait", x: 540 }, { t: "portrait", x: 660, crooked: true }] },
    conservatory: { pal: "violet", light: true, props: [{ t: "fern", x: 110, s: 1.1 }, { t: "piano", x: 430 }, { t: "fern", x: 720, s: 1.2 }], efx: [{ t: "grate", x: 300 }] },
    greenhouse:   { pal: "eerie",  props: [{ t: "pod", x: 150 }, { t: "pod", x: 320 }, { t: "fern", x: 470, s: 1 }, { t: "pod", x: 620 }] },
    stairs:       { pal: "night",  props: [{ t: "staircase", x: 410 }, { t: "portrait", x: 120 }] },
    attic:        { pal: "night",  web: true, props: [{ t: "mirror", x: 130 }, { t: "trunk", x: 380 }, { t: "maskStand", x: 640 }] },
    landing:      { pal: "night",  props: [{ t: "door", x: 130, w: 40 }, { t: "door", x: 400, w: 40 }, { t: "door", x: 670, w: 40 }], efx: [{ t: "rug", x: 400 }] },
    masterBedroom:{ pal: "night",  props: [{ t: "mirror", x: 130 }, { t: "bed", x: 430 }, { t: "table", x: 690, w: 90, items: [1] }] },
    nursery:      { pal: "night",  props: [{ t: "wallnotes", x: 400 }, { t: "cradle", x: 410 }, { t: "table", x: 680, w: 90 }] },
    observatory:  { pal: "night",  light: true, props: [{ t: "telescope", x: 430 }] },
    chapel:       { pal: "violet", light: true, props: [{ t: "altar", x: 400 }, { t: "pillar", x: 110 }, { t: "pillar", x: 700 }] },
    lair:         { pal: "eerie",  props: [{ t: "hooks", x: 140 }, { t: "maskStand", x: 420 }, { t: "table", x: 660, w: 110, items: [1, 1] }] },
    lab:          { pal: "eerie",  props: [{ t: "shelf", x: 140, w: 110 }, { t: "labtable", x: 430 }, { t: "labtable", x: 680 }] },
  };

  function build(roomId) {
    const u = roomId;
    const sc = SCENES[roomId] || SCENES.foyer;
    const p = PALETTES[sc.pal];
    const props = (sc.props || []).map(c => PROPS[c.t](c, p)).join("");
    const efx = (sc.efx || []).map(c => FLOOREFX[c.t](c, p)).join("");
    const fog = `<g filter="url(#sBlur-${u})"><ellipse class="s-fog" cx="200" cy="${FLOOR + 40}" rx="180" ry="34" fill="${p.light}" opacity=".05"/><ellipse class="s-fog2" cx="600" cy="${FLOOR + 70}" rx="220" ry="40" fill="${p.light}" opacity=".06"/></g>`;
    let dust = "";
    for (let i = 0; i < 7; i++) dust += `<circle class="s-dust" cx="${80 + i * 100}" cy="${60 + (i % 4) * 50}" r="${1 + (i % 2)}" fill="${p.light}" opacity=".4" style="animation-delay:${i * 0.7}s"/>`;
    const webs = sc.web ? cobweb(0, 14, 1, p) + cobweb(W, 14, -1, p) : cobweb(0, 8, 0.6, p) + cobweb(W, 8, -0.6, p);

    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="scene-svg" role="img" aria-label="${roomId} scene">
      <defs>
        <linearGradient id="sSky-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>
        <linearGradient id="sFloor-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.floor}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>
        <radialGradient id="sVig-${u}" cx="0.5" cy="0.42" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.72"/></radialGradient>
        <filter id="sBlur-${u}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#sSky-${u})"/>
      ${sc.light ? PROPS.window({ x: 400 }, p) : ""}
      <rect y="${FLOOR}" width="${W}" height="${H - FLOOR}" fill="url(#sFloor-${u})"/>
      <line x1="0" y1="${FLOOR}" x2="${W}" y2="${FLOOR}" stroke="${p.rim}" stroke-width="1" opacity=".15"/>
      ${webs}
      ${props}
      ${efx}
      ${fog}
      ${dust}
      <rect width="${W}" height="${H}" fill="url(#sVig-${u})"/>
    </svg>`;
  }

  return { build };
})();
