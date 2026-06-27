/* ===== Skoobie-Dew & the Mystery Mansion — game data =====
   All content lives here. The engine (game.js) stays generic: rooms expose
   `actions` (interactions) and `exits`, each driven by small callbacks that
   receive the game api `g`. The main mystery is procedurally assembled — one
   suspect is secretly the Phantom and the clues describe THAT suspect, so the
   deduction is real, not scripted. Puzzles, items, traps, secret rooms and
   side-mysteries are all optional depth layered on top. */

/* ---------- Difficulty ---------- */
const DIFFICULTIES = {
  easy:   { id: "easy",   name: "Sleuth",    blurb: "Cozy mystery. Frequent snacks, gentle scares, traps just bruise your courage. Unlimited hints.",
            snacks: 5, courage: 100, scare: 0.15, lethalTraps: false, hints: Infinity },
  normal: { id: "normal", name: "Detective", blurb: "The real deal. The Phantom prowls and the death traps are deadly. Three hints.",
            snacks: 3, courage: 100, scare: 0.28, lethalTraps: true,  hints: 3 },
  spooky: { id: "spooky", name: "Phantom",   blurb: "For brave pups only. Scarce snacks, relentless scares, one hint, no mercy.",
            snacks: 2, courage: 80,  scare: 0.42, lethalTraps: true,  hints: 1 },
};

/* ---------- Suspects (each trait value is unique across suspects) ---------- */
const SUSPECTS = [
  { id: "cragg", name: "Old Man Cragg", role: "The Grumpy Caretaker", face: "🧓",
    cloak: "a mud-stained gray", tool: "a rusty lantern",
    motive: "to scare off buyers and keep his cottage on the grounds",
    tell: "the heavy clomp of work boots", lair: "the damp cellar workshop",
    trinket: "a brass caretaker's whistle" },
  { id: "esmerelda", name: "Madame Esmerelda", role: "The Mysterious Fortune-Teller", face: "🔮",
    cloak: "a shimmering violet", tool: "a trail of incense smoke",
    motive: "to convince the town the manor is cursed and boost her séance business",
    tell: "the jingle of a dozen bangle bracelets", lair: "the moonlit conservatory",
    trinket: "a cracked crystal-ball shard" },
  { id: "hollow", name: "Professor Hollow", role: "The Eccentric Historian", face: "🎩",
    cloak: "a dusty tweed", tool: "a magnifying glass",
    motive: "to hunt the hidden Dew fortune without interruptions",
    tell: "the squeak of a leather elbow patch", lair: "the dusty library loft",
    trinket: "a monogrammed briar pipe" },
  { id: "sterling", name: "Mr. Sterling", role: "The Slick Real-Estate Developer", face: "🤵",
    cloak: "a sleek black", tool: "a silver pocket watch",
    motive: "to crash the manor's price and buy the land for cheap",
    tell: "the sharp click of polished dress shoes", lair: "the grand ballroom balcony",
    trinket: "a platinum cufflink" },
];

/* ---------- Clues. `core: true` clues are the four needed to accuse. ---------- */
const CLUES = {
  cloak:   { key: "cloak",   icon: "🧵", core: true,  text: c => `A snagged thread, torn from ${c.cloak} cloak.` },
  tool:    { key: "tool",    icon: "🔧", core: true,  text: c => `Left behind: ${c.tool} — the Phantom's calling card.` },
  motive:  { key: "motive",  icon: "📜", core: true,  text: c => `A scribbled note reveals the motive: ${c.motive}.` },
  tell:    { key: "tell",    icon: "👂", core: true,  text: c => `Echoing through the dark, you hear ${c.tell}.` },
  lair:    { key: "lair",    icon: "🦇", core: false, text: c => `This hideout belongs to whoever skulks about ${c.lair}.` },
  trinket: { key: "trinket", icon: "💍", core: false, text: c => `Dropped in a struggle: ${c.trinket}.` },
};
const CORE_CLUE_IDS = Object.keys(CLUES).filter(k => CLUES[k].core);
const TOTAL_CLUES = Object.keys(CLUES).length;

/* ---------- Items ---------- */
const ITEMS = {
  lantern:   { name: "Brass Lantern",   icon: "🏮", desc: "Throws warm light into the darkest corners." },
  crowbar:   { name: "Crowbar",         icon: "🛠️", desc: "Rusty but sturdy — perfect for prying things open." },
  rope:      { name: "Coil of Rope",    icon: "🪢", desc: "Long and strong. Good for crossing a gap." },
  gasMask:   { name: "Gas Mask",        icon: "😷", desc: "Filters out noxious fumes and choking spores." },
  oilCan:    { name: "Oil Can",         icon: "🛢️", desc: "Loosens the most stubbornly rusted mechanism." },
  magnet:    { name: "Horseshoe Magnet",icon: "🧲", desc: "Pulls metal out of places your paw won't fit." },
  sheet:     { name: "Sheet Music",     icon: "🎼", desc: "A faded lullaby — four notes circled in red." },
  brassKey:  { name: "Brass Key",       icon: "🗝️", desc: "Ornate and heavy. Opens a grand door." },
  silverKey: { name: "Silver Key",      icon: "🔑", desc: "Cold to the touch, cut for a fine lock." },
  locketA:   { name: "Locket Half",     icon: "📿", desc: "Half a tarnished silver locket." },
  locketB:   { name: "Locket Hinge",    icon: "🔗", desc: "The clasp and hinge of an old locket." },
  locketC:   { name: "Locket Portrait", icon: "🖼️", desc: "A tiny painted portrait that fits inside a locket." },
  mapA:       { name: "Map: West Half",  icon: "🗺️", desc: "Half a treasure map. The crease hides the rest." },
  mapB:       { name: "Map: East Half",  icon: "🧭", desc: "The other half of the treasure map." },
};

/* ---------- Rooms ----------
   exit forms: "id"  OR  { to, secret:(g)=>bool, locked:(g)=>bool, lockedMsg }
   action: { id, label, icon, show?(g), once?, risky?, do(g) } */
const START_ROOM = "foyer";

const ROOMS = {
  foyer: {
    name: "The Grand Foyer", art: "🚪",
    desc: "A cavernous entry hall. A dusty chandelier sways though there's no breeze, and a moth-eaten portrait of old Cornelius Dew glowers down at you.",
    exits: ["library", "diningHall", "ballroom", "stairs"],
    actions: [
      { id: "clock", label: "Inspect the grandfather clock", icon: "🕰️", once: true, risky: true,
        do: g => { g.note("The clock stopped at midnight. Tucked behind the pendulum: a single Scooby Snack!"); g.snack(1); } },
    ],
  },

  library: {
    name: "The Dusty Library", art: "📚",
    desc: "Floor-to-ceiling shelves sag with mildewed books. A reading lamp flickers over an open ledger, and one bookcase sits suspiciously ajar.",
    exits: ["foyer", "study"],
    actions: [
      { id: "ledger", label: "Read the open ledger", icon: "📜", once: true, risky: true,
        do: g => { g.clue("motive"); g.set("safeHint"); g.note('Scrawled in a margin: "Sealed the fortune the year the manor burned — 1888."', "clue"); } },
      { id: "shelves", label: "Search the shelves", icon: "🔍", once: true, risky: true,
        do: g => { g.take("sheet"); g.set("starHint"); g.note("Behind a hollow book you find faded SHEET MUSIC and a dog-eared star chart (Orion → Lyra → Draco)."); } },
    ],
  },

  study: {
    name: "The Hidden Study", art: "🕯️",
    desc: "Behind the bookcase: a cramped study thick with old pipe smoke. Papers are strewn about, and a heavy iron safe is set into the wall.",
    exits: ["library"],
    actions: [
      { id: "desk", label: "Search the cluttered desk", icon: "🔍", once: true, risky: true,
        do: g => { g.clue("tool"); } },
      { id: "safe", label: "Try the wall safe", icon: "🔐", do: g => g.puzzle("safe") },
    ],
  },

  diningHall: {
    name: "The Dining Hall", art: "🍽️",
    desc: "A banquet table set for a feast that never came. Cobwebs drape the silverware and a single chair lies toppled on the floor.",
    exits: ["foyer", "kitchen"],
    actions: [
      { id: "table", label: "Search under the table", icon: "🔍", once: true, risky: true,
        do: g => { g.note("Only dust, a dropped fork, and the unmistakable feeling of being watched."); } },
    ],
  },

  kitchen: {
    name: "The Creaky Kitchen", art: "🍲",
    desc: "Copper pots hang like sleeping bats. The pantry door is ajar, and a drawer rattles loose beneath the counter.",
    exits: ["diningHall", "pantry", "cellar"],
    actions: [
      { id: "drawer", label: "Rummage the rattling drawer", icon: "🔍", once: true, risky: true,
        do: g => { g.take("oilCan"); } },
    ],
  },

  pantry: {
    name: "The Pantry", art: "🥫",
    desc: "Shelves of ancient preserves — and, gloriously, a tin marked SCOOBY SNACKS. A toolbox sits on the bottom shelf.",
    exits: ["kitchen"],
    actions: [
      { id: "snacks", label: "Grab Scooby Snacks", icon: "🦴",
        do: g => { const n = 1 + Math.floor(g.rng() * 2); g.snack(n); g.note(`You snag ${n} Scooby Snack${n > 1 ? "s" : ""} from the tin. Crunch!`, "good"); g.sfx("snack"); } },
      { id: "toolbox", label: "Open the toolbox", icon: "🔍", once: true, risky: true,
        do: g => { g.take("crowbar"); } },
    ],
  },

  cellar: {
    name: "The Damp Cellar", art: "🪤",
    desc: "Stone steps lead down to a workbench and a bolted iron hatch in the floor. Something skitters just past the lantern light.",
    exits: ["kitchen", "wineCellar",
      { to: "catacombs", locked: g => !g.flag("hatchOpen"), lockedMsg: "The iron hatch is bolted shut. You'd need to pry it open." }],
    actions: [
      { id: "bench", label: "Search the workbench", icon: "🔍", once: true, risky: true,
        do: g => { g.take("lantern"); } },
      { id: "listen", label: "Stand still and listen", icon: "👂", once: true, risky: true,
        do: g => { g.clue("tell"); } },
      { id: "hatch", label: "Pry open the iron hatch", icon: "🛠️", show: g => g.has("crowbar") && !g.flag("hatchOpen"),
        do: g => { g.set("hatchOpen"); g.sfx("door"); g.note("You jam the crowbar under the hatch and HEAVE. It groans open onto a black stairwell down to the catacombs.", "good"); } },
    ],
  },

  wineCellar: {
    name: "The Wine Cellar", art: "🍷",
    desc: "Rows of cobwebbed bottles. One rack is pulled out from the wall, and a canvas sack has been hidden behind it.",
    exits: ["cellar"],
    actions: [
      { id: "sack", label: "Open the hidden sack", icon: "🔍", once: true, risky: true,
        do: g => { g.take("gasMask"); g.note("Inside the sack: a GAS MASK. Now why would anyone hide one of those down here…?"); } },
    ],
  },

  catacombs: {
    name: "The Catacombs", art: "💀",
    desc: "Carved stone passages reek of damp earth. A yawning chasm splits the floor — the far ledge, and the crypt beyond, lie across the dark.",
    exits: ["cellar",
      { to: "crypt", locked: g => !g.flag("chasmCrossed"), lockedMsg: "The chasm still blocks the way to the crypt." }],
    actions: [
      { id: "dark", label: "Too dark to go on", icon: "🌑", show: g => !g.has("lantern"),
        do: g => { g.note("Without a light you can't see a single step. Best not stumble around near that chasm.", "scare"); } },
      { id: "chasm", label: "Cross the bottomless chasm", icon: "🕳️", show: g => g.has("lantern") && !g.flag("chasmCrossed"), risky: true,
        do: g => {
          if (g.has("rope")) {
            g.set("chasmCrossed"); g.sfx("item");
            g.note("You lash the rope to a stone fang and swing across to the far ledge. The crypt door creaks open ahead.", "good");
          } else {
            g.trap("You take a running leap into the dark… and there is no far ledge within reach. ZOINKS — the Phantom's cackle follows you down into the black.",
              "The chasm is too wide to jump. You'll need a good, strong rope to cross.");
          }
        } },
    ],
  },

  crypt: {
    name: "The Family Crypt", art: "⚰️",
    desc: "Stone sarcophagi of the Dew line, lid carvings worn smooth by centuries. One lid sits slightly askew.",
    exits: ["catacombs"],
    actions: [
      { id: "tomb", label: "Search the askew sarcophagus", icon: "🔍", once: true, risky: true,
        do: g => { g.take("locketA"); g.note("Half a tarnished locket rests on the cold stone, as if left as an offering."); } },
    ],
  },

  ballroom: {
    name: "The Grand Ballroom", art: "🪩",
    desc: "A vast parquet floor under a cracked dome. A grand hearth dominates the far wall, its mantle carved with vines.",
    exits: ["foyer", "conservatory", "gallery"],
    actions: [
      { id: "floor", label: "Search the dusty floor", icon: "🔍", once: true, risky: true,
        do: g => { g.note("Scuffs in the dust trace a waltz no one danced. Spooky."); } },
      { id: "hearth", label: "Reach behind the loose hearth-stone", icon: "💎", show: g => g.flag("treasureLocated") && !g.flag("treasureTaken"),
        do: g => { g.set("treasureTaken"); g.sfx("puzzle"); g.note("Behind the hearth-stone: the lost DEW FORTUNE, a chest of gold doubloons! Jinkies, you're rich… well, the museum will be.", "good"); } },
    ],
  },

  gallery: {
    name: "The Portrait Gallery", art: "🖼️",
    desc: "Generations of Dews glare from gilded frames. One portrait — a stern admiral — hangs noticeably crooked.",
    exits: ["ballroom",
      { to: "lab", secret: g => g.flag("labOpen") }],
    actions: [
      { id: "frames", label: "Search beneath the frames", icon: "🔍", once: true, risky: true,
        do: g => { g.take("magnet"); } },
      { id: "portrait", label: "Straighten the crooked portrait", icon: "🖐️", show: g => !g.flag("labOpen"),
        do: g => { g.set("labOpen"); g.sfx("door"); g.note("The portrait clicks — and the whole frame swings aside, revealing a SECRET LABORATORY behind the wall!", "good"); } },
    ],
  },

  conservatory: {
    name: "The Moonlit Conservatory", art: "🌿",
    desc: "Glass walls fogged with mist. Overgrown ferns claw at a grand piano. A rusted drain grate sits in the floor, something glinting below.",
    exits: ["ballroom", "greenhouse",
      { to: "lair", secret: g => g.flag("lairOpen") }],
    actions: [
      { id: "grate", label: "Fish in the drain grate", icon: "🧲", show: g => g.has("magnet") && !g.has("silverKey"),
        do: g => { g.take("silverKey"); g.note("Your magnet drags a SILVER KEY up through the grate. Someone dropped it in a hurry."); } },
      { id: "grateDark", label: "Something glints in the drain", icon: "🔦", show: g => !g.has("magnet") && !g.has("silverKey"),
        do: g => { g.note("A key glints down in the drain, but it's wedged out of paw's reach. If only you had something magnetic…"); } },
      { id: "piano", label: "Play the grand piano", icon: "🎹", show: g => !g.flag("lairOpen"),
        do: g => g.puzzle("piano") },
    ],
  },

  greenhouse: {
    name: "The Overgrown Greenhouse", art: "🪴",
    desc: "A jungle of exotic blooms gone feral. Strange pods bulge among the leaves, twitching when you're not looking.",
    exits: ["conservatory"],
    actions: [
      { id: "pods", label: "Search the bulging pods", icon: "🔍", once: true, risky: true,
        do: g => {
          if (g.has("gasMask")) {
            g.note("Mask on, you poke a pod — it bursts in a cloud of spores that would've dropped you cold. Pinned beneath it: a coil of climbing ROPE.", "good");
            g.take("rope");
          } else {
            g.trap("A pod bursts in your face, gushing choking green spores! You reel back, gasping, courage draining away.",
              "Those pods look like they'd release something nasty. Cover your face before you go poking them.");
          }
        } },
    ],
  },

  stairs: {
    name: "The Grand Staircase", art: "🪜",
    desc: "A sweeping staircase groans under every step. The upstairs landing splits toward several doors; a ladder climbs to the attic.",
    exits: ["foyer", "attic", "landing"],
    actions: [],
  },

  attic: {
    name: "The Spooky Attic", art: "🕸️",
    desc: "Trunks, dress forms, and a cracked mirror loom in the gloom. Bats rustle in the rafters — exactly where a Phantom would hide.",
    exits: ["stairs"],
    actions: [
      { id: "trunk", label: "Search the old steamer trunk", icon: "🔍", once: true, risky: true,
        do: g => { g.clue("cloak"); g.take("rope"); g.note("Coiled atop the costumes: a length of stout ROPE. Might come in handy."); } },
    ],
  },

  landing: {
    name: "The Upstairs Landing", art: "🛋️",
    desc: "A carpeted gallery of doors. Brass nameplates read MASTER BEDROOM, NURSERY, OBSERVATORY, and a narrow door to the chapel.",
    exits: ["stairs", "nursery", "chapel",
      { to: "masterBedroom", locked: g => !g.has("brassKey"), lockedMsg: "The master bedroom is locked. It would take a fine brass key." },
      { to: "observatory", locked: g => !g.has("silverKey"), lockedMsg: "The observatory door is locked, cut for a slender silver key." }],
    actions: [],
  },

  masterBedroom: {
    name: "The Master Bedroom", art: "🛏️",
    desc: "A four-poster bed draped in moth-eaten velvet. A vanity mirror is cracked clean down the middle.",
    exits: ["landing"],
    actions: [
      { id: "vanity", label: "Search the vanity drawers", icon: "🔍", once: true, risky: true,
        do: g => { g.take("locketC"); g.snack(2); g.note("A locket portrait and a stash of two Scooby Snacks, hidden among the lace."); } },
    ],
  },

  nursery: {
    name: "The Nursery", art: "🧸",
    desc: "A cradle rocks gently on its own. A dusty music box sits on the shelf, its crank seized solid with rust. Four colored notes are painted on the wall.",
    exits: ["landing"],
    actions: [
      { id: "oil", label: "Oil the rusted music box", icon: "🛢️", show: g => g.has("oilCan") && !g.flag("boxOiled"),
        do: g => { g.set("boxOiled"); g.note("A few drops of oil and the crank turns freely again. Now it might actually play."); } },
      { id: "play", label: "Wind the music box", icon: "🎵", show: g => g.flag("boxOiled"), do: g => g.puzzle("musicbox") },
      { id: "seized", label: "The music box is seized solid", icon: "🔍", show: g => !g.has("oilCan") && !g.flag("boxOiled"),
        do: g => { g.note("The crank won't budge — decades of rust. Some oil would free it."); } },
    ],
  },

  observatory: {
    name: "The Observatory", art: "🔭",
    desc: "A domed tower open to the night. A great brass telescope points at a dial of constellations waiting to be aligned.",
    exits: ["landing"],
    actions: [
      { id: "scope", label: "Align the constellation dial", icon: "✨", do: g => g.puzzle("stars") },
    ],
  },

  chapel: {
    name: "The Manor Chapel", art: "⛪",
    desc: "A tiny chapel gone to ruin. On the altar stand two goblets — one gold, one silver — beneath a worn Latin inscription.",
    exits: ["landing"],
    actions: [
      { id: "altar", label: "Study the altar inscription", icon: "🔍", once: true, risky: true,
        do: g => { g.set("chaliceWisdom"); g.note('It reads: "The humble cup of GOLD restores; the proud cup of silver is the poisoner\'s due." Good to know.', "clue"); } },
      { id: "gold", label: "Sip from the GOLD goblet", icon: "🏆",
        do: g => { g.note("Cool, sweet water — and a wave of calm courage flows through you!", "good"); g.courage(35); g.sfx("item"); } },
      { id: "silver", label: "Sip from the silver goblet", icon: "🥤",
        do: g => { g.trap("The silver goblet's wine sears your throat — poison! The chapel spins and goes dark.",
            "Two goblets, one inscription. Read the altar before you go drinking strange wine."); } },
    ],
  },

  /* ===== SECRET ROOM 1 — revealed by the piano puzzle ===== */
  lair: {
    name: "The Phantom's Lair", art: "🦇",
    desc: "A hidden den behind the conservatory wall. Disguises hang on hooks, greasepaint litters a table, and a half-finished Phantom mask leers from a stand.",
    exits: ["conservatory"],
    actions: [
      { id: "den", label: "Ransack the disguise table", icon: "🔍", once: true, risky: true,
        do: g => { g.clue("lair"); g.set("foundLair"); g.note("This is where the Phantom suits up. The whole hoax is run from right here!", "clue"); } },
    ],
  },

  /* ===== SECRET ROOM 2 — revealed by the crooked portrait ===== */
  lab: {
    name: "The Hidden Laboratory", art: "⚗️",
    desc: "A cramped lab of bubbling beakers and fog machines — the workshop of the haunting. A glove was dropped mid-experiment.",
    exits: ["gallery"],
    actions: [
      { id: "bench", label: "Examine the cluttered lab bench", icon: "🔍", once: true, risky: true,
        do: g => { g.clue("trinket"); g.courage(15); g.note("Fog machines, glow paint, a rigged tape of howls — and a personal trinket dropped in the rush.", "clue"); } },
    ],
  },
};

/* ---------- Puzzles ----------
   kinds: 'code' (type the digits) | 'sequence' (press buttons in order) */
const PUZZLES = {
  safe: {
    kind: "code", title: "The Wall Safe", icon: "🔐",
    body: "A heavy four-digit dial set into the iron door.",
    solution: "1888", length: 4,
    hint: g => g.flag("safeHint") ? 'The ledger said: "the year the manor burned — 1888."' : "You don't know the combination yet. The library might.",
    solved: g => g.flag("safeOpen"),
    onSolve: g => { g.set("safeOpen"); g.take("brassKey"); g.take("mapA"); g.note("The safe swings open: a BRASS KEY and the west half of a TREASURE MAP!", "good"); },
  },
  piano: {
    kind: "sequence", title: "The Grand Piano", icon: "🎹",
    body: "Four keys glow faintly, waiting for the right tune. Play the lullaby.",
    buttons: [{ id: "c", label: "C 🔵" }, { id: "e", label: "E 🟢" }, { id: "g", label: "G 🟡" }, { id: "a", label: "A 🔴" }],
    solution: ["c", "e", "g", "c"],
    hint: g => g.has("sheet") ? "The sheet music circles: C · E · G · C." : "There's sheet music somewhere — the library, perhaps.",
    solved: g => g.flag("lairOpen"),
    onSolve: g => { g.set("lairOpen"); g.sfx("door"); g.note("The lullaby finishes and a section of wall grinds open — a SECRET passage to the Phantom's lair!", "good"); },
  },
  musicbox: {
    kind: "sequence", title: "The Music Box", icon: "🎵",
    body: "Press the colored tabs in the order painted on the nursery wall.",
    buttons: [{ id: "blue", label: "🔵" }, { id: "green", label: "🟢" }, { id: "yellow", label: "🟡" }, { id: "red", label: "🔴" }],
    solution: ["yellow", "yellow", "red", "green"],
    hint: () => "The nursery wall shows: 🟡 🟡 🔴 🟢.",
    solved: g => g.flag("boxSolved"),
    onSolve: g => { g.set("boxSolved"); g.take("locketB"); g.courage(15); g.note("The lid springs up to a tinkling tune, revealing a hidden LOCKET HINGE.", "good"); },
  },
  stars: {
    kind: "sequence", title: "The Constellation Dial", icon: "✨",
    body: "Rotate the dial to the constellations in the proper order.",
    buttons: [{ id: "orion", label: "Orion" }, { id: "lyra", label: "Lyra" }, { id: "draco", label: "Draco" }, { id: "ursa", label: "Ursa" }],
    solution: ["orion", "lyra", "draco"],
    hint: g => g.flag("starHint") ? "The star chart read: Orion → Lyra → Draco." : "A star chart would tell you the order. Try the library.",
    solved: g => g.flag("starsSolved"),
    onSolve: g => { g.set("starsSolved"); g.take("mapB"); g.note("The dome clicks; the telescope drops a brass tube into your paws — the east half of the TREASURE MAP!", "good"); },
  },
};

/* ---------- Side mysteries (optional) ---------- */
const QUESTS = {
  locket: {
    name: "The Shattered Locket", icon: "📿",
    blurb: "Three pieces of a broken locket are scattered through the manor. Make it whole.",
    progress: g => ["locketA", "locketB", "locketC"].filter(i => g.has(i)).length,
    total: 3,
    done: g => g.has("locketA") && g.has("locketB") && g.has("locketC"),
    onComplete: g => { g.note("The three locket pieces snap together. Inside: young Eleanor Dew and a note — 'Whoever frightens this house frightens her memory.' Heartened, you press on.", "good"); g.courage(25); g.snack(2); },
  },
  treasure: {
    name: "The Dew Family Fortune", icon: "💎",
    blurb: "A treasure map was torn in two. Find both halves and follow it to the lost Dew fortune.",
    progress: g => (g.has("mapA") || g.flag("treasureLocated") ? 1 : 0) + (g.has("mapB") || g.flag("treasureLocated") ? 1 : 0),
    total: 2,
    done: g => g.flag("treasureTaken"),
    /* When both halves are held, mark the location so the ballroom hearth opens up. */
    tick: g => { if (g.has("mapA") && g.has("mapB") && !g.flag("treasureLocated")) { g.set("treasureLocated"); g.note("The two map halves align — X marks the loose hearth-stone in the BALLROOM!", "clue"); } },
    onComplete: g => { g.note("Side mystery solved: the lost Dew fortune is recovered!", "good"); g.snack(3); },
  },
  lair: {
    name: "The Phantom's Hideout", icon: "🦇",
    blurb: "Somewhere in the manor the Phantom suits up between scares. Find the lair.",
    progress: g => g.flag("foundLair") ? 1 : 0,
    total: 1,
    done: g => g.flag("foundLair"),
    onComplete: g => { g.note("Side mystery solved: you've found the Phantom's lair. The unmasking will be all the sweeter.", "good"); },
  },
};

/* ---------- Flavor text ---------- */
const SCARE_LINES = [
  "ZOINKS! The Phantom lunges from the shadows! You steady your nerves with a Scooby Snack.",
  "A bony hand grabs your shoulder — RUOOOH! You drop a snack and bolt.",
  "The lights gutter out and glowing eyes appear! You munch a snack to keep from fainting.",
  "The Phantom's wail rattles the windows! You scarf a snack for courage.",
];
const SEARCH_EMPTY = [
  "You rummage around but find only dust bunnies and cobwebs.",
  "Nothing here but spooky atmosphere and a faint smell of old cheese.",
  "You search high and low… nope, just creaks and shadows.",
];
