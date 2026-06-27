/* ===== Skoobie-Dew & the Mystery Mansion — engine ===== */
(function () {
  "use strict";

  const SAVE_KEY = "skoobie-dew-save-v1";

  // ---- DOM helpers ----
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---- Game state ----
  let state = null;

  function freshState() {
    const culprit = pick(SUSPECTS);
    // Place each clue (with a unique id) into its designated room.
    const clues = CLUE_TEMPLATES.map((t, i) => ({
      id: "clue" + i,
      key: t.key,
      icon: t.icon,
      room: t.room,
      text: t.text(culprit),
      found: false,
    }));
    return {
      culpritId: culprit.id,
      room: START_ROOM,
      snacks: 3,
      courage: 100,
      clues,
      foundClues: [],
      searched: {},          // room -> true once searched
      accusedId: null,
      solved: false,
      over: false,
    };
  }

  const culprit = () => SUSPECTS.find((s) => s.id === state.culpritId);
  const foundCount = () => state.clues.filter((c) => c.found).length;

  // ---- Persistence ----
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return s && !s.over ? s : null;
    } catch (_) { return null; }
  }
  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
  }

  // ---- Screen navigation ----
  function show(screenId) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $("#" + screenId).classList.add("active");
  }

  // ---- Log ----
  function logMsg(text, kind) {
    const log = $("#log");
    const entry = el("div", "log-entry" + (kind ? " " + kind : ""), text);
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  // ---- Rendering ----
  function renderHUD() {
    $("#stat-snacks").textContent = state.snacks;
    $("#stat-courage").textContent = state.courage;
    $("#stat-clues").textContent = foundCount();
    $("#stat-clues-total").textContent = TOTAL_CLUES;
    $("#hud-room").textContent = ROOMS[state.room].name;
  }

  function renderRoom() {
    const room = ROOMS[state.room];
    $("#scene-art").textContent = room.art;
    $("#room-name").textContent = room.name;
    $("#room-desc").textContent = room.desc;

    // Actions: Search + Snack pantry (kitchen only)
    const actions = $("#actions");
    actions.innerHTML = "";

    const searched = !!state.searched[state.room];
    const searchBtn = el("button", "action-btn" + (searched ? " searched" : ""),
      searched ? "🔍 Already searched" : "🔍 Search the room");
    if (!searched) searchBtn.addEventListener("click", searchRoom);
    actions.appendChild(searchBtn);

    if (state.room === "kitchen") {
      const snackBtn = el("button", "action-btn", "🦴 Grab Scooby Snacks");
      snackBtn.addEventListener("click", grabSnacks);
      actions.appendChild(snackBtn);
    }

    // Exits
    const exits = $("#exits");
    exits.innerHTML = "";
    room.exits.forEach((id) => {
      const b = el("button", "action-btn exit-btn", ROOMS[id].name);
      b.addEventListener("click", () => goTo(id));
      exits.appendChild(b);
    });

    renderHUD();
  }

  // ---- Actions ----
  function goTo(roomId) {
    state.room = roomId;
    logMsg(`You creep into <b>${ROOMS[roomId].name}</b>.`);
    maybeScare();
    renderRoom();
    save();
  }

  function searchRoom() {
    if (state.searched[state.room]) return;
    state.searched[state.room] = true;

    const clue = state.clues.find((c) => c.room === state.room && !c.found);
    if (clue) {
      clue.found = true;
      logMsg(`${clue.icon} <b>Clue found!</b> ${clue.text}`, "clue");
      flashClueToast();
      if (foundCount() === TOTAL_CLUES) {
        logMsg("That's every clue! Open the <b>Case File</b> and name the Phantom. 🕵️", "good");
      }
    } else {
      logMsg(pick(SEARCH_EMPTY));
    }
    maybeScare();
    renderRoom();
    save();
  }

  function grabSnacks() {
    const got = 1 + Math.floor(Math.random() * 2);
    state.snacks += got;
    logMsg(`🦴 You snag <b>${got}</b> Scooby Snack${got > 1 ? "s" : ""} from the pantry. Crunch!`, "good");
    renderHUD();
    save();
  }

  // ---- The Phantom scare mechanic ----
  function maybeScare() {
    if (state.over) return;
    // 28% chance on each move/search; needs a snack to recover.
    if (Math.random() < 0.28) {
      $("#scene").classList.remove("scare-flash");
      void $("#scene").offsetWidth; // restart animation
      $("#scene").classList.add("scare-flash");

      if (state.snacks > 0) {
        state.snacks -= 1;
        logMsg(pick(SCARE_LINES), "scare");
      } else {
        state.courage = Math.max(0, state.courage - 25);
        logMsg("The Phantom strikes and you're all out of snacks! Your courage takes a hit. 😱", "scare");
        if (state.courage <= 0) {
          loseGame("Out of courage AND Scooby Snacks, you and the gang flee the manor screaming. The Phantom wins… this time!");
        }
      }
      renderHUD();
    }
  }

  function flashClueToast() {
    const stat = $("#stat-clues").parentElement;
    stat.classList.remove("scare-flash");
    void stat.offsetWidth;
    stat.style.transition = "transform .2s";
    stat.style.transform = "scale(1.3)";
    setTimeout(() => (stat.style.transform = "scale(1)"), 200);
  }

  // ---- Case File ----
  function openCaseFile() {
    renderCaseFile();
    $("#casefile").classList.add("open");
  }
  function closeModals() {
    document.querySelectorAll(".modal").forEach((m) => m.classList.remove("open"));
  }

  function renderCaseFile() {
    const list = $("#cf-clues");
    const found = state.clues.filter((c) => c.found);
    $("#cf-clue-count").textContent = `(${found.length}/${TOTAL_CLUES})`;
    list.innerHTML = "";
    if (found.length === 0) {
      list.appendChild(el("li", "muted", "No clues yet — go snooping!"));
    } else {
      found.forEach((c) => list.appendChild(el("li", null, `${c.icon} ${c.text}`)));
    }

    const wrap = $("#cf-suspects");
    wrap.innerHTML = "";
    SUSPECTS.forEach((s) => {
      const btn = el("button", "suspect" + (state.accusedId === s.id ? " selected" : ""));
      btn.innerHTML = `<span class="face">${s.face}</span>
        <span><span class="who">${s.name}</span><br><span class="role">${s.role}</span></span>`;
      btn.addEventListener("click", () => {
        state.accusedId = s.id;
        renderCaseFile();
        updateAccuseBar();
      });
      wrap.appendChild(btn);
    });

    updateAccuseBar();
  }

  function updateAccuseBar() {
    const allClues = foundCount() === TOTAL_CLUES;
    const ready = allClues && state.accusedId;
    const btn = $("#btn-accuse");
    btn.disabled = !ready;
    const hint = $("#accuse-hint");
    if (!allClues) {
      hint.textContent = `Find all the clues first (${foundCount()}/${TOTAL_CLUES} gathered).`;
    } else if (!state.accusedId) {
      hint.textContent = "Select the suspect you believe is the Phantom.";
    } else {
      const s = SUSPECTS.find((x) => x.id === state.accusedId);
      hint.textContent = `Ready to unmask ${s.name}?`;
    }
  }

  function accuse() {
    if (foundCount() !== TOTAL_CLUES || !state.accusedId) return;
    const correct = state.accusedId === state.culpritId;
    state.solved = correct;
    if (correct) {
      winGame();
    } else {
      const guessed = SUSPECTS.find((s) => s.id === state.accusedId);
      loseGame(`You yank off ${guessed.name}'s mask… but it's really them! The clues pointed elsewhere. The true Phantom cackles and vanishes into the night.`);
    }
  }

  // ---- Endings ----
  function winGame() {
    state.over = true;
    clearSave();
    const c = culprit();
    closeModals();
    $("#ending-art").textContent = "🎭✨";
    $("#ending-title").textContent = "Mystery Solved!";
    $("#ending-text").innerHTML =
      `You whip off the Phantom's mask to reveal&hellip; <b>${c.name}</b>, ${c.role.toLowerCase()}!<br><br>` +
      `"And I would've gotten away with it too, if it weren't for you meddling kids!" ` +
      `Their plan — ${c.motive} — is foiled at last.<br><br>` +
      `🦴 Snacks left: ${state.snacks} &nbsp;•&nbsp; 😼 Courage: ${state.courage}% &nbsp;•&nbsp; Case closed!`;
    $("#ending").classList.add("open");
  }

  function loseGame(reason) {
    state.over = true;
    clearSave();
    closeModals();
    $("#ending-art").textContent = "👻💨";
    $("#ending-title").textContent = "The Phantom Escapes!";
    $("#ending-text").innerHTML = reason + "<br><br>Better luck next time, gang!";
    $("#ending").classList.add("open");
  }

  // ---- Boot a game ----
  function startGame(existing) {
    state = existing || freshState();
    $("#log").innerHTML = "";
    closeModals();
    show("game-screen");
    if (existing) {
      logMsg("↩ <b>Case resumed.</b> Where were we…", "good");
    } else {
      logMsg("🔦 You and the gang step into <b>Dew Manor</b>. The door slams shut behind you!", "good");
      logMsg("Snoop through every room, gather all 5 clues, then open the Case File to unmask the Phantom.");
    }
    renderRoom();
    save();
  }

  // ---- Wire up UI ----
  function init() {
    const saved = load();
    if (saved) $("#btn-continue").hidden = false;

    $("#btn-new-game").addEventListener("click", () => { clearSave(); startGame(null); });
    $("#btn-continue").addEventListener("click", () => startGame(load()));
    $("#btn-how").addEventListener("click", () => show("how-screen"));
    document.querySelectorAll("[data-goto]").forEach((b) =>
      b.addEventListener("click", () => show(b.dataset.goto)));

    $("#btn-menu").addEventListener("click", () => { save(); show("title-screen"); $("#btn-continue").hidden = false; });
    $("#btn-casefile").addEventListener("click", openCaseFile);
    $("#btn-accuse").addEventListener("click", accuse);
    $("#btn-play-again").addEventListener("click", () => { clearSave(); startGame(null); });

    document.querySelectorAll("[data-close]").forEach((b) =>
      b.addEventListener("click", closeModals));
    document.querySelectorAll(".modal").forEach((m) =>
      m.addEventListener("click", (e) => { if (e.target === m) closeModals(); }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
