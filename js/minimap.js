/* ===== Skoobie-Dew & the Mystery Mansion — minimap + Phantom AI =====
   A schematic floor-plan of the mansion that tracks Skoobie and the roaming
   Phantom, plus the graph helpers the Phantom uses to stalk you (BFS distance
   and shortest-path stepping). Secret rooms are excluded from the Phantom's
   wanderings so it never gets stuck somewhere you can't reach. */
const Minimap = (function () {
  "use strict";
  const SECRET = ["lair", "lab"];

  /* hand-placed schematic positions on a 720 x 480 canvas */
  const POS = {
    observatory: [110, 52], chapel: [232, 44], landing: [360, 52], masterBedroom: [490, 44], nursery: [612, 52],
    attic: [360, 124], stairs: [360, 192],
    study: [70, 250], library: [186, 250], foyer: [360, 262], diningHall: [492, 250], kitchen: [592, 246], pantry: [684, 244],
    ballroom: [330, 344], gallery: [196, 360], conservatory: [456, 344], greenhouse: [548, 414],
    lair: [456, 420], lab: [120, 432],
    cellar: [648, 322], wineCellar: [704, 388], catacombs: [624, 412], crypt: [612, 462],
  };
  const SHORT = {
    observatory: "Obsv", chapel: "Chapel", landing: "Landing", masterBedroom: "Bedrm", nursery: "Nursery",
    attic: "Attic", stairs: "Stairs", study: "Study", library: "Library", foyer: "Foyer", diningHall: "Dining",
    kitchen: "Kitchen", pantry: "Pantry", ballroom: "Ballrm", gallery: "Gallery", conservatory: "Consv",
    greenhouse: "Green", lair: "Lair", lab: "Lab", cellar: "Cellar", wineCellar: "Wine", catacombs: "Catacb", crypt: "Crypt",
  };

  let ADJ = null;
  function adj() {
    if (ADJ) return ADJ;
    ADJ = {};
    for (const id in ROOMS) ADJ[id] = ROOMS[id].exits.map(e => (typeof e === "string" ? e : e.to));
    for (const id in ADJ) ADJ[id].forEach(n => { if (ADJ[n] && !ADJ[n].includes(id)) ADJ[n].push(id); });
    return ADJ;
  }
  const neighbors = (id) => adj()[id] || [];
  /* neighbors the Phantom may step to (no secret rooms) */
  const roamNeighbors = (id) => neighbors(id).filter(n => !SECRET.includes(n));

  function bfs(start) {
    const dist = { [start]: 0 }, q = [start];
    while (q.length) { const c = q.shift(); for (const n of neighbors(c)) if (dist[n] === undefined) { dist[n] = dist[c] + 1; q.push(n); } }
    return dist;
  }
  const distance = (a, b) => { const d = bfs(b); return d[a] === undefined ? 99 : d[a]; };

  /* next hop from `from` along the shortest path toward `to` */
  function stepToward(from, to) {
    const d = bfs(to); let best = from, bd = Infinity;
    for (const n of roamNeighbors(from)) if ((d[n] ?? Infinity) < bd) { bd = d[n]; best = n; }
    return best;
  }

  function build(state) {
    const cur = state.room, ph = state.phantomRoom, visited = state.visited || {};
    let edges = "", drawn = new Set();
    for (const id in POS) for (const n of neighbors(id)) {
      if (!POS[n]) continue; const key = [id, n].sort().join("|"); if (drawn.has(key)) continue; drawn.add(key);
      edges += `<line x1="${POS[id][0]}" y1="${POS[id][1]}" x2="${POS[n][0]}" y2="${POS[n][1]}" stroke="#2c3360" stroke-width="2"/>`;
    }
    let nodes = "";
    for (const id in POS) {
      const [x, y] = POS[id];
      const isCur = id === cur, isPh = id === ph, seen = visited[id] || isCur;
      const fill = isCur ? "#7bf1a8" : seen ? "#3a4170" : "#1a1e3a";
      nodes += `<circle cx="${x}" cy="${y}" r="${isCur || isPh ? 11 : 7}" fill="${fill}" stroke="${isPh ? "#ff5d73" : "#2c3360"}" stroke-width="${isPh ? 3 : 1.5}"/>`;
      if (isCur) nodes += `<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="#7bf1a8" stroke-width="2" opacity=".6" class="mm-pulse"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11">🐾</text>`;
      if (isPh) nodes += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" class="mm-pulse">👻</text>`;
      if (seen && !isCur && !isPh) nodes += `<text x="${x}" y="${y + 20}" text-anchor="middle" font-size="9" fill="#9aa0c8">${SHORT[id]}</text>`;
    }
    return `<svg viewBox="0 0 720 488" class="mm-svg" role="img" aria-label="mansion map">${edges}${nodes}
      <g font-size="11" fill="#9aa0c8"><text x="14" y="478">🐾 You</text><text x="90" y="478" fill="#ff8a98">👻 Phantom</text></g></svg>`;
  }

  return { neighbors, roamNeighbors, distance, stepToward, build, SECRET };
})();
