# 🔦 Skoobie-Dew & the Mystery Mansion

A spooky, self-contained **point-and-click mystery adventure** that runs entirely
in your browser — no build step, no dependencies, no install. Explore the haunted
Dew Manor, snoop out clues, dodge the Phantom, and unmask the culprit before your
Scooby Snacks run out!

![play in browser](https://img.shields.io/badge/play-in_browser-7bf1a8) ![no build](https://img.shields.io/badge/build-none-b388ff)

## ▶️ Play

Just open `index.html` in any modern browser:

```bash
# easiest: double-click index.html, or…
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 🕵️ How to Play

- **Explore** the mansion by moving room to room through the exit doors.
- **Search** each room to uncover hidden **clues**. There are **5 clues**, each
  revealing one trait of the Phantom (their cloak, their tool, their motive…).
- **Munch Scooby Snacks** to keep your courage up — the Phantom prowls the halls,
  and every scare costs a snack. Out of snacks? Your courage takes the hit. Hit
  zero courage and the gang flees!
- Stock up on snacks in the **Kitchen** pantry.
- When you've gathered all the evidence, open the **Case File**, pick your suspect,
  and **make your accusation**.

## 🎲 Replayable by design

The Phantom is chosen **at random every game**, and the clues are generated to
point at *that* suspect — so the deduction is real, not scripted. Each of the four
suspects has a unique cloak, tool, motive, and "tell," so every clue narrows the
field. Solve it, then hit **New Mystery** for a fresh culprit.

### The Suspects

| | Suspect | Role |
|---|---|---|
| 🧓 | Old Man Cragg | The Grumpy Caretaker |
| 🔮 | Madame Esmerelda | The Mysterious Fortune-Teller |
| 🎩 | Professor Hollow | The Eccentric Historian |
| 🤵 | Mr. Sterling | The Slick Real-Estate Developer |

## 🗂️ Project layout

```
index.html       # markup + screens (title, game, modals)
css/style.css    # spooky atmospheric theme
js/data.js       # rooms, suspects, clue templates (all content)
js/game.js       # game engine: state, rendering, save/load, deduction
```

Progress auto-saves to `localStorage`, so you can close the tab and **Continue Case**
later.

---

*"And I would've gotten away with it too, if it weren't for you meddling kids!"* 🎭
