/* ===== Skoobie-Dew & the Mystery Mansion — game data ===== */
/* All static content for the mansion lives here so the engine (game.js)
   stays focused on logic. The mystery is procedurally assembled each play:
   one suspect is secretly the Phantom, and the clues describe THAT
   suspect's traits — so the deduction is real, not scripted. */

const ROOMS = {
  foyer: {
    name: "The Grand Foyer",
    art: "🚪",
    desc: "A cavernous entry hall. A dusty chandelier sways though there's no breeze, and a moth-eaten portrait of old Cornelius Dew glowers down at you. Two hallways branch into darkness.",
    exits: ["library", "diningHall", "stairs"],
  },
  library: {
    name: "The Dusty Library",
    art: "📚",
    desc: "Floor-to-ceiling shelves sag with mildewed books. A reading lamp flickers over an open ledger, and one bookcase sits suspiciously ajar.",
    exits: ["foyer", "study"],
  },
  study: {
    name: "The Hidden Study",
    art: "🕯️",
    desc: "Behind the bookcase: a cramped study thick with pipe smoke. Papers are strewn everywhere, as if someone left in a hurry.",
    exits: ["library"],
  },
  diningHall: {
    name: "The Dining Hall",
    art: "🍽️",
    desc: "A banquet table set for a feast that never came. Cobwebs drape the silverware and a single chair lies toppled on the floor.",
    exits: ["foyer", "kitchen"],
  },
  kitchen: {
    name: "The Creaky Kitchen",
    art: "🍲",
    desc: "Copper pots hang like sleeping bats. The pantry door is open a crack — and yes, there are Scooby Snacks in here somewhere.",
    exits: ["diningHall", "cellar"],
  },
  cellar: {
    name: "The Damp Cellar",
    art: "🪤",
    desc: "Stone steps lead down to rows of cobwebbed wine racks. Something skittered just out of the lantern light. Brrr.",
    exits: ["kitchen"],
  },
  stairs: {
    name: "The Grand Staircase",
    art: "🪜",
    desc: "A sweeping staircase groans under every step. Up top, the landing splits toward the attic and the conservatory.",
    exits: ["foyer", "attic", "conservatory"],
  },
  attic: {
    name: "The Spooky Attic",
    art: "🕸️",
    desc: "Trunks, dress forms, and a cracked mirror loom in the gloom. Bats rustle in the rafters. This is exactly where a Phantom would hide.",
    exits: ["stairs"],
  },
  conservatory: {
    name: "The Moonlit Conservatory",
    art: "🌿",
    desc: "Glass walls fogged with mist. Overgrown ferns claw at a grand piano whose keys depress on their own. Plink. Plink.",
    exits: ["stairs"],
  },
};

const START_ROOM = "foyer";

/* The four suspects. The Phantom is one of them — chosen at random each game.
   Each has a unique value per trait, so each clue points to exactly one. */
const SUSPECTS = [
  {
    id: "cragg",
    name: "Old Man Cragg",
    role: "The Grumpy Caretaker",
    face: "🧓",
    cloak: "a mud-stained gray",
    tool: "a rusty lantern",
    motive: "to scare off buyers and keep his cottage on the grounds",
    tell: "the heavy clomp of work boots",
  },
  {
    id: "esmerelda",
    name: "Madame Esmerelda",
    role: "The Mysterious Fortune-Teller",
    face: "🔮",
    cloak: "a shimmering violet",
    tool: "a trail of incense smoke",
    motive: "to convince the town the manor is cursed and boost her séance business",
    tell: "the jingle of a dozen bangle bracelets",
  },
  {
    id: "hollow",
    name: "Professor Hollow",
    role: "The Eccentric Historian",
    face: "🎩",
    cloak: "a dusty tweed",
    tool: "a magnifying glass",
    motive: "to hunt for the hidden Dew family treasure without interruptions",
    tell: "the squeak of a leather elbow patch",
  },
  {
    id: "sterling",
    name: "Mr. Sterling",
    role: "The Slick Real-Estate Developer",
    face: "🤵",
    cloak: "a sleek black",
    tool: "a silver pocket watch",
    motive: "to crash the manor's price so he can buy the land for cheap",
    tell: "the sharp click of polished dress shoes",
  },
];

/* Clue templates. Each returns a written clue that reveals one trait of the
   Phantom (the culprit). Placed across rooms; the player must collect them
   all to make an informed accusation. `key` ties the clue to a suspect field. */
const CLUE_TEMPLATES = [
  { key: "cloak", room: "attic",        icon: "🧵",
    text: c => `A snagged thread on the attic mirror — torn from ${c.cloak} cloak.` },
  { key: "tool", room: "study",         icon: "🔧",
    text: c => `Left behind on the desk: ${c.tool}. The Phantom's calling card.` },
  { key: "motive", room: "library",     icon: "📜",
    text: c => `A scribbled note in the ledger reveals the Phantom's motive: ${c.motive}.` },
  { key: "tell", room: "cellar",        icon: "👂",
    text: c => `Down in the cellar you hear it echo — ${c.tell} — fading into the dark.` },
  { key: "cloak", room: "conservatory", icon: "🪞",
    text: c => `A thread caught on the piano lid matches ${c.cloak} cloak — confirmed.` },
];

const TOTAL_CLUES = CLUE_TEMPLATES.length;

/* Scare lines for when the Phantom appears. */
const SCARE_LINES = [
  "ZOINKS! The Phantom lunges from the shadows! You lose a Scooby Snack steadying your nerves.",
  "A bony hand grabs your shoulder — RUOOOH! You drop a snack and bolt.",
  "The lights cut out and glowing eyes appear! You munch a snack to keep from fainting.",
  "The Phantom's wail rattles the windows! You scarf a snack for courage.",
];

const SEARCH_EMPTY = [
  "You rummage around but find only dust bunnies and cobwebs.",
  "Nothing here but spooky atmosphere and a faint smell of old cheese.",
  "You search high and low… nope, just creaks and shadows.",
  "Empty-pawed again. Even Scooby wouldn't sniff anything out here.",
];
