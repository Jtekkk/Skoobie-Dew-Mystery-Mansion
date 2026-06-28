/* ===== Skoobie-Dew & the Mystery Mansion — engine ===== */
(function () {
  "use strict";

  const SAVE_KEY = "skoobie-dew-save-v2";

  // ---- tiny DOM helpers ----
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  let state = null;
  let diff = DIFFICULTIES.normal;

  // ---- state ----
  function freshState(diffId) {
    const d = DIFFICULTIES[diffId] || DIFFICULTIES.normal;
    const culprit = pick(SUSPECTS);
    return {
      diff: d.id,
      culpritId: culprit.id,
      room: START_ROOM,
      snacks: d.snacks,
      courage: d.courage,
      hintsLeft: d.hints,
      inventory: [],
      flags: {},
      done: {},               // "room#action" -> true (for once-actions)
      cluesFound: {},         // clueId -> true
      quests: {},             // questId -> true once completed
      accusedId: null,
      over: false, solved: false,
    };
  }

  const culprit = () => SUSPECTS.find((s) => s.id === state.culpritId);
  const coreFoundCount = () => CORE_CLUE_IDS.filter((id) => state.cluesFound[id]).length;
  const allClueIds = () => Object.keys(CLUES).filter((id) => state.cluesFound[id]);

  // ---- persistence ----
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {} };
  const clearSave = () => { try { localStorage.removeItem(SAVE_KEY); } catch (_) {} };
  function load() { try { const r = localStorage.getItem(SAVE_KEY); if (!r) return null; const s = JSON.parse(r); return s && !s.over ? s : null; } catch (_) { return null; } }

  // ---- screens / log ----
  function show(id) { document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active")); $("#" + id).classList.add("active"); }
  function logMsg(text, kind) {
    const log = $("#log");
    log.appendChild(el("div", "log-entry" + (kind ? " " + kind : ""), text));
    log.scrollTop = log.scrollHeight;
  }

  // ---- the api handed to every interaction / puzzle / quest ----
  const g = {
    rng: () => Math.random(),
    sfx: (name) => { if (Sfx[name]) Sfx[name](); },
    state: () => state,
    has: (id) => state.inventory.includes(id),
    take(id) { if (!this.has(id)) { state.inventory.push(id); const it = ITEMS[id]; logMsg(`🎒 Picked up <b>${it.name}</b> ${it.icon}`, "good"); Sfx.item(); } },
    add(id) { this.take(id); },
    remove(id) { state.inventory = state.inventory.filter((x) => x !== id); },
    flag: (name) => !!state.flags[name],
    set(name, val) { state.flags[name] = val === undefined ? true : val; },
    note: (text, kind) => logMsg(text, kind),
    clue(id) {
      if (state.cluesFound[id]) return;
      state.cluesFound[id] = true;
      const c = CLUES[id];
      logMsg(`${c.icon} <b>${c.core ? "Clue" : "Bonus clue"} found!</b> ${c.text(culprit())}`, "clue");
      Sfx.clue();
      if (coreFoundCount() === CORE_CLUE_IDS.length) logMsg("That's all four key leads — open the <b>Case File</b> to name the Phantom! 🕵️", "good");
    },
    snack(n) { state.snacks = Math.max(0, state.snacks + n); },
    courage(n) {
      state.courage = Math.max(0, Math.min(100, state.courage + n));
      if (state.courage <= 0 && !state.over) loseGame("Your courage runs dry and the whole gang bolts for the door, howling into the night. The Phantom wins this time!");
    },
    move(roomId) { goTo(roomId); },
    puzzle(id) { openPuzzle(id); },
    trap(deathMsg, hintMsg) {
      Sfx.scare();
      if (diff.lethalTraps) {
        loseGame(deathMsg + (hintMsg ? `<br><br><i>${hintMsg}</i>` : ""));
      } else {
        logMsg(deathMsg + " <i>(On Sleuth difficulty you scramble clear, badly shaken.)</i>", "scare");
        if (hintMsg) logMsg("💡 " + hintMsg, "good");
        this.courage(-40);
      }
    },
    win() { winGame(); },
    lose(msg) { loseGame(msg); },
  };

  // ---- quests (side mysteries) ----
  function runQuests() {
    Object.keys(QUESTS).forEach((qid) => {
      const q = QUESTS[qid];
      if (q.tick) q.tick(g);
      if (!state.quests[qid] && q.done(g)) {
        state.quests[qid] = true;
        q.onComplete(g);
        Sfx.puzzle();
      }
    });
  }

  // ---- rendering ----
  function renderHUD() {
    $("#stat-snacks").textContent = state.snacks;
    $("#stat-courage").textContent = state.courage;
    $("#stat-clues").textContent = coreFoundCount();
    $("#hud-room").textContent = ROOMS[state.room].name;
    const hb = $("#btn-hint");
    const unlimited = diff.hints === Infinity;
    hb.textContent = "💡 Hint" + (unlimited ? "" : " (" + state.hintsLeft + ")");
    hb.disabled = !unlimited && state.hintsLeft <= 0;
    $("#btn-sound").textContent = Sfx.isMuted() ? "🔇" : "🔊";
  }

  function exitInfo(exit) {
    if (typeof exit === "string") return { to: exit, visible: true, locked: false };
    if (exit.secret) return { to: exit.to, visible: !!exit.secret(g), locked: false };
    if (exit.locked) { const l = exit.locked(g); return { to: exit.to, visible: true, locked: l, msg: exit.lockedMsg }; }
    return { to: exit.to, visible: true, locked: false };
  }

  function renderRoom() {
    const room = ROOMS[state.room];
    $("#scene-bg").innerHTML = Scenes.build(state.room);
    $("#room-name").textContent = `${room.art} ${room.name}`;
    $("#room-desc").textContent = room.desc;

    // actions
    const actions = $("#actions");
    actions.innerHTML = "";
    (room.actions || []).forEach((a) => {
      if (a.show && !a.show(g)) return;
      const doneKey = state.room + "#" + a.id;
      const isDone = a.once && state.done[doneKey];
      const btn = el("button", "action-btn" + (isDone ? " searched" : ""), `${a.icon || "•"} ${isDone ? "Done — " + a.label : a.label}`);
      if (!isDone) btn.addEventListener("click", () => doAction(a));
      actions.appendChild(btn);
    });
    if (!actions.children.length) actions.appendChild(el("p", "muted small", "Nothing here but shadows. Try the exits."));

    // exits
    const exits = $("#exits");
    exits.innerHTML = "";
    room.exits.forEach((ex) => {
      const info = exitInfo(ex);
      if (!info.visible) return;
      if (info.locked) {
        const b = el("button", "action-btn exit-btn locked", "🔒 " + ROOMS[info.to].name);
        b.addEventListener("click", () => { logMsg(info.msg || "It's locked.", "scare"); Sfx.error(); });
        exits.appendChild(b);
      } else {
        const b = el("button", "action-btn exit-btn", ROOMS[info.to].name);
        b.addEventListener("click", () => goTo(info.to));
        exits.appendChild(b);
      }
    });

    renderInventory();
    renderHUD();
  }

  function renderInventory() {
    const wrap = $("#inv");
    wrap.innerHTML = "";
    if (!state.inventory.length) { wrap.appendChild(el("p", "muted small", "Empty. Search rooms to collect items.")); return; }
    state.inventory.forEach((id) => {
      const it = ITEMS[id];
      const chip = el("button", "inv-item", `${it.icon}<span>${it.name}</span>`);
      chip.title = it.desc;
      chip.addEventListener("click", () => { logMsg(`${it.icon} <b>${it.name}</b> — ${it.desc}`); Sfx.blip(); });
      wrap.appendChild(chip);
    });
  }

  // ---- actions / movement ----
  function doAction(a) {
    Sfx.blip();
    a.do(g);
    if (a.once) state.done[state.room + "#" + a.id] = true;
    if (state.over) return;
    runQuests();
    if (state.over) return;
    if (a.risky) maybeScare();
    if (state.over) return;
    renderRoom();
    save();
  }

  function goTo(roomId) {
    Sfx.door();
    state.room = roomId;
    logMsg(`You creep into <b>${ROOMS[roomId].name}</b>.`);
    runQuests();
    if (state.over) return;
    maybeScare();
    if (state.over) return;
    renderRoom();
    save();
  }

  // ---- the Phantom scare mechanic ----
  function maybeScare() {
    if (state.over || g.rng() >= diff.scare) return;
    const scene = $("#scene");
    scene.classList.remove("scare-flash"); void scene.offsetWidth; scene.classList.add("scare-flash");
    showPhantom();
    Sfx.scare();
    if (state.snacks > 0) { state.snacks -= 1; logMsg(pick(SCARE_LINES), "scare"); }
    else { logMsg("The Phantom strikes and you're all out of snacks! Your courage takes the hit. 😱", "scare"); g.courage(-20); }
    renderHUD();
  }

  function showPhantom() {
    const layer = $("#phantom-layer");
    layer.innerHTML = Sprites.phantom();
    layer.classList.remove("show"); void layer.offsetWidth; layer.classList.add("show");
    setTimeout(() => { layer.classList.remove("show"); layer.innerHTML = ""; }, 1500);
  }

  // ---- puzzles ----
  let activePuzzle = null;
  let seqEntry = [];

  function openPuzzle(id) {
    const p = PUZZLES[id];
    if (!p) return;
    if (p.solved(g)) { logMsg("You've already solved that one.", "good"); return; }
    activePuzzle = id; seqEntry = [];
    $("#pz-title").textContent = `${p.icon} ${p.title}`;
    $("#pz-body").textContent = p.body;
    $("#pz-hint").textContent = "💡 " + (typeof p.hint === "function" ? p.hint(g) : p.hint);
    const area = $("#pz-area");
    area.innerHTML = "";
    if (p.kind === "code") {
      const inp = el("input", "pz-code");
      inp.type = "text"; inp.inputMode = "numeric"; inp.maxLength = p.length || 6; inp.placeholder = "•".repeat(p.length || 4);
      inp.id = "pz-input";
      area.appendChild(inp);
      const submit = el("button", "btn btn-primary", "Enter");
      submit.addEventListener("click", () => tryCode(inp.value));
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") tryCode(inp.value); });
      area.appendChild(submit);
      setTimeout(() => inp.focus(), 50);
    } else if (p.kind === "sequence") {
      const disp = el("div", "pz-display", "&nbsp;"); disp.id = "pz-display"; area.appendChild(disp);
      const row = el("div", "pz-buttons");
      p.buttons.forEach((b) => {
        const btn = el("button", "pz-key", b.label);
        btn.addEventListener("click", () => pressSeq(id, b.id, b.label));
        row.appendChild(btn);
      });
      area.appendChild(row);
      const clear = el("button", "btn btn-ghost", "Clear");
      clear.addEventListener("click", () => { seqEntry = []; $("#pz-display").innerHTML = "&nbsp;"; Sfx.blip(); });
      area.appendChild(clear);
    }
    $("#puzzle").classList.add("open");
  }

  function tryCode(val) {
    const p = PUZZLES[activePuzzle];
    if ((val || "").trim() === p.solution) { solvePuzzle(p); }
    else { Sfx.error(); const i = $("#pz-input"); i.classList.remove("shake"); void i.offsetWidth; i.classList.add("shake"); $("#pz-hint").textContent = "❌ That's not it. " + (typeof p.hint === "function" ? p.hint(g) : p.hint); }
  }

  function pressSeq(id, key, label) {
    const p = PUZZLES[id];
    Sfx.blip();
    seqEntry.push(key);
    $("#pz-display").textContent = seqEntry.map((k) => p.buttons.find((b) => b.id === k).label).join("  ");
    if (seqEntry.length === p.solution.length) {
      if (seqEntry.every((k, i) => k === p.solution[i])) solvePuzzle(p);
      else { Sfx.error(); setTimeout(() => { $("#pz-display").innerHTML = '<span class="pz-wrong">✗ Wrong tune — try again</span>'; seqEntry = []; }, 250); }
    }
  }

  function solvePuzzle(p) {
    Sfx.puzzle();
    closePuzzle();
    p.onSolve(g);
    runQuests();
    if (state.over) return;
    renderRoom();
    save();
  }
  function closePuzzle() { $("#puzzle").classList.remove("open"); activePuzzle = null; seqEntry = []; }

  // ---- hint system ----
  function giveHint() {
    const unlimited = diff.hints === Infinity;
    if (!unlimited && state.hintsLeft <= 0) { logMsg("No hints left — you're on your own, Scoob!", "scare"); Sfx.error(); return; }
    if (!unlimited) state.hintsLeft -= 1;
    Sfx.hint();
    logMsg("🔮 <b>Hint:</b> " + computeHint(), "good");
    renderHUD(); save();
  }

  function computeHint() {
    const missing = {
      cloak: "A torn thread of the Phantom's cloak is snagged on something in the <b>Attic</b> — search the old trunk.",
      tool: "The Phantom left a tool behind in the <b>Hidden Study</b> (slip through the ajar bookcase in the Library) — search the desk.",
      motive: "The motive is written down. Read the open <b>ledger</b> in the Library.",
      tell: "Go down to the <b>Cellar</b>, stand still, and listen for the Phantom's tell.",
    };
    for (const id of CORE_CLUE_IDS) if (!state.cluesFound[id]) return missing[id];
    if (!state.accusedId || coreFoundCount() === CORE_CLUE_IDS.length) {
      const extra = [];
      if (!state.cluesFound.lair) extra.push("the Phantom's lair (play the right tune on the conservatory piano)");
      if (!state.cluesFound.trinket) extra.push("the hidden laboratory (straighten the crooked portrait in the gallery)");
      let msg = "You have all four key leads — open the <b>Case File</b> and accuse the Phantom!";
      if (extra.length) msg += " For an airtight case, two bonus clues hide in " + extra.join(" and ") + ".";
      return msg;
    }
    return "Open the Case File and make your accusation.";
  }

  // ---- case file ----
  function openCaseFile() { renderCaseFile(); $("#casefile").classList.add("open"); }
  function renderCaseFile() {
    const found = allClueIds();
    $("#cf-clue-count").textContent = `(${coreFoundCount()}/${CORE_CLUE_IDS.length} key`+ (found.length>coreFoundCount()? ` + ${found.length-coreFoundCount()} bonus`:"") +")";
    const list = $("#cf-clues"); list.innerHTML = "";
    if (!found.length) list.appendChild(el("li", "muted", "No clues yet — go snooping!"));
    else found.forEach((id) => { const c = CLUES[id]; list.appendChild(el("li", c.core ? "" : "bonus", `${c.icon} ${c.text(culprit())}`)); });

    const wrap = $("#cf-suspects"); wrap.innerHTML = "";
    SUSPECTS.forEach((s) => {
      const btn = el("button", "suspect" + (state.accusedId === s.id ? " selected" : ""));
      btn.innerHTML = `<span class="face">${Sprites.suspect(s.id)}</span><span><span class="who">${s.name}</span><br><span class="role">${s.role}</span></span>`;
      btn.addEventListener("click", () => { state.accusedId = s.id; Sfx.blip(); renderCaseFile(); save(); });
      wrap.appendChild(btn);
    });
    updateAccuseBar();
  }
  function updateAccuseBar() {
    const ready = coreFoundCount() === CORE_CLUE_IDS.length && state.accusedId;
    $("#btn-accuse").disabled = !ready;
    const hint = $("#accuse-hint");
    if (coreFoundCount() < CORE_CLUE_IDS.length) hint.textContent = `Gather all four key leads first (${coreFoundCount()}/${CORE_CLUE_IDS.length}).`;
    else if (!state.accusedId) hint.textContent = "Select the suspect you believe is the Phantom.";
    else hint.textContent = `Ready to unmask ${SUSPECTS.find((x) => x.id === state.accusedId).name}?`;
  }
  function accuse() {
    if (coreFoundCount() !== CORE_CLUE_IDS.length || !state.accusedId) return;
    if (state.accusedId === state.culpritId) winGame();
    else { const guy = SUSPECTS.find((s) => s.id === state.accusedId); loseGame(`You yank off ${guy.name}'s mask… but it really is just them! The clues pointed elsewhere, and the true Phantom slips away cackling into the night.`); }
  }

  // ---- mysteries panel ----
  function openMysteries() {
    const wrap = $("#quest-list"); wrap.innerHTML = "";
    Object.keys(QUESTS).forEach((qid) => {
      const q = QUESTS[qid];
      const done = !!state.quests[qid];
      const prog = q.progress(g);
      const card = el("div", "quest" + (done ? " done" : ""));
      card.innerHTML = `<div class="q-top"><span class="q-icon">${q.icon}</span><span class="q-name">${q.name}</span>
        <span class="q-status">${done ? "✓ Solved" : prog + "/" + q.total}</span></div>
        <p class="q-blurb">${q.blurb}</p>`;
      wrap.appendChild(card);
    });
    $("#mysteries").classList.add("open");
  }

  function closeModals() { document.querySelectorAll(".modal").forEach((m) => m.classList.remove("open")); }

  // ---- endings ----
  function winGame() {
    state.over = true; state.solved = true; clearSave();
    Sfx.win(); closeModals();
    const c = culprit();
    let bonus = "";
    if (state.flags.foundLair) bonus += "Catching them in their own lair sealed the case. ";
    if (state.flags.treasureTaken) bonus += "You even recovered the lost Dew fortune! ";
    if (state.quests.locket) bonus += "And you mended poor Eleanor's locket along the way. ";
    const sideCount = Object.keys(state.quests).length;
    $("#ending-art").innerHTML = Sprites.suspect(c.id) + '<div class="unmask-tag">UNMASKED!</div>';
    $("#ending-title").textContent = "Mystery Solved!";
    $("#ending-text").innerHTML =
      `You whip off the Phantom's mask to reveal&hellip; <b>${c.name}</b>, ${c.role.toLowerCase()}!<br><br>` +
      `"And I would've gotten away with it too, if it weren't for you meddling kids!" Their scheme — ${c.motive} — is foiled at last.<br><br>` +
      (bonus ? `<span class="ending-bonus">${bonus}</span><br><br>` : "") +
      `🦴 ${state.snacks} snacks &nbsp;•&nbsp; 😼 ${state.courage}% courage &nbsp;•&nbsp; 🗂️ ${sideCount}/3 side mysteries &nbsp;•&nbsp; Difficulty: ${diff.name}`;
    $("#ending").classList.add("open");
  }
  function loseGame(reason) {
    state.over = true; clearSave();
    Sfx.lose(); closeModals();
    $("#ending-art").innerHTML = Sprites.phantom();
    $("#ending-title").textContent = "The Phantom Escapes!";
    $("#ending-text").innerHTML = reason + "<br><br>Better luck next time, gang!";
    $("#ending").classList.add("open");
  }

  // ---- boot ----
  function startGame(existing, diffId) {
    state = existing || freshState(diffId);
    diff = DIFFICULTIES[state.diff] || DIFFICULTIES.normal;
    $("#log").innerHTML = "";
    $("#hero-layer").innerHTML = Sprites.hero();
    $("#phantom-layer").innerHTML = "";
    closeModals();
    show("game-screen");
    if (existing) logMsg("↩ <b>Case resumed.</b> Now where were we…", "good");
    else {
      logMsg(`🔦 You and the gang step into <b>Dew Manor</b> on <b>${diff.name}</b> difficulty. The door slams shut behind you!`, "good");
      logMsg("Snoop every room and <b>Search</b> for clues. Four key leads will unmask the Phantom — open the <b>Case File</b> when you're sure. Two bonus clues, side mysteries, items, puzzles and a few <i>deadly</i> traps await the brave.");
    }
    renderRoom(); save();
  }

  function chooseDifficulty() {
    const wrap = $("#difficulty-cards"); wrap.innerHTML = "";
    Object.keys(DIFFICULTIES).forEach((id) => {
      const d = DIFFICULTIES[id];
      const card = el("button", "diff-card");
      card.innerHTML = `<h3>${d.name}</h3><p>${d.blurb}</p>
        <span class="diff-stats">🦴 ${d.snacks} &nbsp; 😱 ${Math.round(d.scare * 100)}% scares &nbsp; 💡 ${d.hints === Infinity ? "∞" : d.hints} hints &nbsp; ${d.lethalTraps ? "☠️ lethal traps" : "🛡️ safe traps"}</span>`;
      card.addEventListener("click", () => { Sfx.blip(); clearSave(); startGame(null, id); });
      wrap.appendChild(card);
    });
    show("difficulty-screen");
  }

  // ---- wire up ----
  function init() {
    const saved = load();
    if (saved) $("#btn-continue").hidden = false;

    $("#btn-new-game").addEventListener("click", () => { Sfx.blip(); chooseDifficulty(); });
    $("#btn-continue").addEventListener("click", () => startGame(load()));
    $("#btn-how").addEventListener("click", () => { Sfx.blip(); show("how-screen"); });
    document.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => { Sfx.blip(); show(b.dataset.goto); }));

    $("#btn-menu").addEventListener("click", () => { save(); $("#btn-continue").hidden = false; show("title-screen"); });
    $("#btn-hint").addEventListener("click", giveHint);
    $("#btn-sound").addEventListener("click", () => { Sfx.toggleMute(); renderHUD(); });
    $("#btn-casefile").addEventListener("click", () => { Sfx.blip(); openCaseFile(); });
    $("#btn-mysteries").addEventListener("click", () => { Sfx.blip(); openMysteries(); });
    $("#btn-accuse").addEventListener("click", accuse);
    $("#btn-play-again").addEventListener("click", () => { Sfx.blip(); chooseDifficulty(); });

    $("#pz-close").addEventListener("click", () => { Sfx.blip(); closePuzzle(); });
    document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => { Sfx.blip(); closeModals(); }));
    document.querySelectorAll(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) { if (m.id === "puzzle") closePuzzle(); else closeModals(); } }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModals(); closePuzzle(); } });

    // light debug hook (handy for testing; harmless in play)
    window.SkoobieDebug = { state: () => state, culprit: () => culprit(), api: g };
  }

  document.addEventListener("DOMContentLoaded", init);
})();
