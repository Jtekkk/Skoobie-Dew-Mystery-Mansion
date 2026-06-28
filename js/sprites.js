/* ===== Skoobie-Dew & the Mystery Mansion — character sprites =====
   Hand-built SVG characters so they ship with the game and work offline:
   the hero pup who stands in every scene, the Phantom who swoops in on a
   scare, and a portrait bust for each suspect (Case File + unmasking). */
const Sprites = (function () {
  "use strict";

  /* The hero: "Skoobie", a plucky cartoon Great Dane detective. */
  function hero() {
    const B = "#b9824a", D = "#7a4f25", L = "#e0b079", N = "#1a1014", C = "#3ad29a";
    return `<svg viewBox="0 0 130 150" class="spr-hero" aria-label="Skoobie the detective pup">
      <ellipse cx="66" cy="142" rx="46" ry="9" fill="#000" opacity=".28"/>
      <!-- tail -->
      <path d="M104 96 Q128 86 122 64 Q116 74 108 78 Q112 90 98 100 Z" fill="${B}"/>
      <!-- legs -->
      <rect x="40" y="108" width="13" height="34" rx="6" fill="${D}"/>
      <rect x="58" y="110" width="13" height="32" rx="6" fill="${B}"/>
      <rect x="80" y="108" width="13" height="34" rx="6" fill="${D}"/>
      <rect x="96" y="110" width="13" height="32" rx="6" fill="${B}"/>
      <ellipse cx="46" cy="143" rx="9" ry="5" fill="${L}"/><ellipse cx="86" cy="143" rx="9" ry="5" fill="${L}"/>
      <!-- body -->
      <ellipse cx="74" cy="92" rx="42" ry="27" fill="${B}"/>
      <ellipse cx="70" cy="100" rx="30" ry="17" fill="${L}" opacity=".55"/>
      <ellipse cx="92" cy="80" rx="13" ry="10" fill="${D}"/><ellipse cx="58" cy="98" rx="9" ry="7" fill="${D}" opacity=".7"/>
      <!-- neck + head -->
      <path d="M44 96 Q24 86 30 60 L56 66 Q58 86 60 92 Z" fill="${B}"/>
      <ellipse cx="34" cy="50" rx="24" ry="21" fill="${B}"/>
      <!-- snout -->
      <ellipse cx="13" cy="58" rx="16" ry="11" fill="${L}"/>
      <ellipse cx="6" cy="56" rx="6" ry="5" fill="${N}"/>
      <path d="M13 62 Q13 70 6 70" stroke="${N}" stroke-width="2" fill="none"/>
      <!-- ears -->
      <path d="M44 32 Q66 26 60 58 Q50 56 46 44 Z" fill="${D}"/>
      <path d="M28 30 Q22 6 40 18 Q40 34 36 42 Z" fill="${D}"/>
      <!-- eyes -->
      <ellipse cx="30" cy="44" rx="7" ry="8" fill="#fff"/><ellipse cx="44" cy="44" rx="7" ry="8" fill="#fff"/>
      <circle cx="32" cy="46" r="3.4" fill="${N}"/><circle cx="46" cy="46" r="3.4" fill="${N}"/>
      <circle cx="33" cy="45" r="1.1" fill="#fff"/><circle cx="47" cy="45" r="1.1" fill="#fff"/>
      <ellipse cx="38" cy="38" rx="9" ry="6" fill="${D}" opacity=".5"/>
      <!-- collar + tag -->
      <path d="M40 64 Q34 72 26 68" stroke="${C}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="30" cy="72" r="4.5" fill="#ffd166" stroke="${D}" stroke-width="1"/>
    </svg>`;
  }

  /* The Phantom that appears during a scare. */
  function phantom() {
    return `<svg viewBox="0 0 150 180" class="spr-phantom" aria-label="The Phantom">
      <defs><filter id="phGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>
      <ellipse cx="75" cy="96" rx="62" ry="80" fill="#7bf1a8" opacity=".18" filter="url(#phGlow)"/>
      <!-- billowing cloak -->
      <path d="M75 8 Q128 16 130 92 Q132 150 132 168
               Q120 156 110 168 Q98 154 86 168 Q75 152 64 168
               Q52 154 40 168 Q30 156 18 168 Q20 150 20 92 Q22 16 75 8 Z"
            fill="#f2fff7" opacity=".95"/>
      <path d="M75 8 Q24 16 20 92 Q20 130 20 150 Q34 120 36 92 Q40 30 75 18 Z" fill="#bfe9d2" opacity=".5"/>
      <!-- raised arms -->
      <path d="M22 86 Q-2 70 8 52 Q18 60 30 70 Z" fill="#f2fff7" opacity=".92"/>
      <path d="M128 86 Q152 70 142 52 Q132 60 120 70 Z" fill="#f2fff7" opacity=".92"/>
      <!-- glowing eyes -->
      <ellipse cx="56" cy="64" rx="9" ry="14" fill="#06210f"/><ellipse cx="94" cy="64" rx="9" ry="14" fill="#06210f"/>
      <ellipse cx="56" cy="62" rx="4" ry="7" fill="#7bf1a8" class="s-flicker"/><ellipse cx="94" cy="62" rx="4" ry="7" fill="#7bf1a8" class="s-flicker"/>
      <path d="M62 96 Q75 88 88 96" stroke="#06210f" stroke-width="4" fill="none"/>
    </svg>`;
  }

  /* Suspect portrait busts (head + shoulders). */
  const SUS = {
    cragg(s) { return wrap("#3f4a3a", `
      <ellipse cx="50" cy="48" rx="22" ry="23" fill="#d8b48c"/>
      <path d="M26 40 Q50 16 74 40 Q72 30 50 26 Q28 30 26 40 Z" fill="#6b7280"/>
      <ellipse cx="50" cy="33" rx="26" ry="9" fill="#6b7280"/>
      <path d="M32 44 q6 -5 12 0" stroke="#9aa0a6" stroke-width="3" fill="none"/>
      <path d="M56 44 q6 -5 12 0" stroke="#9aa0a6" stroke-width="3" fill="none"/>
      <circle cx="40" cy="50" r="2.6" fill="#26210f"/><circle cx="62" cy="50" r="2.6" fill="#26210f"/>
      <path d="M38 64 q12 -6 24 0" stroke="#8a8f98" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M40 60 Q50 56 60 60" stroke="#7a4a2a" stroke-width="2" fill="none"/>`); },
    esmerelda(s) { return wrap("#5b3a86", `
      <ellipse cx="50" cy="49" rx="21" ry="22" fill="#c98a5e"/>
      <path d="M27 46 Q26 20 50 18 Q74 20 73 46 Q66 30 50 30 Q34 30 27 46 Z" fill="#8b5cf6"/>
      <path d="M27 46 Q22 60 30 70 L36 50 Z" fill="#7c3aed"/>
      <circle cx="31" cy="62" r="4" fill="none" stroke="#ffd166" stroke-width="2"/>
      <ellipse cx="42" cy="50" rx="4" ry="3" fill="#fff"/><ellipse cx="60" cy="50" rx="4" ry="3" fill="#fff"/>
      <circle cx="42" cy="50" r="2.2" fill="#2a1533"/><circle cx="60" cy="50" r="2.2" fill="#2a1533"/>
      <path d="M37 44 q5 -3 10 0M55 44 q5 -3 10 0" stroke="#3a2050" stroke-width="2" fill="none"/>
      <path d="M44 62 q6 4 12 0" stroke="#b23a5b" stroke-width="3" fill="none" stroke-linecap="round"/>`); },
    hollow(s) { return wrap("#6b5436", `
      <ellipse cx="50" cy="50" rx="21" ry="22" fill="#e0c0a0"/>
      <rect x="30" y="14" width="40" height="22" rx="3" fill="#1c1c22"/>
      <rect x="24" y="34" width="52" height="6" rx="3" fill="#1c1c22"/>
      <circle cx="42" cy="50" r="2.6" fill="#26210f"/><circle cx="60" cy="51" r="2.6" fill="#26210f"/>
      <circle cx="60" cy="51" r="8" fill="none" stroke="#caa15a" stroke-width="2"/>
      <path d="M67 56 Q72 66 66 74" stroke="#caa15a" stroke-width="1.5" fill="none"/>
      <path d="M36 46 q6 -3 12 0" stroke="#5a4326" stroke-width="2.5" fill="none"/>
      <path d="M40 63 q10 -7 20 0 q-10 5 -20 0 Z" fill="#6b4f2a"/>`); },
    sterling(s) { return wrap("#1f2937", `
      <ellipse cx="50" cy="49" rx="21" ry="22" fill="#d9b08c"/>
      <path d="M28 44 Q30 22 50 22 Q70 22 72 44 Q64 32 50 33 Q40 30 36 38 Q32 40 28 44 Z" fill="#15151c"/>
      <path d="M36 45 q5 -3 10 0M54 45 q5 -3 10 0" stroke="#2a1c10" stroke-width="2" fill="none"/>
      <circle cx="41" cy="51" r="2.6" fill="#26210f"/><circle cx="59" cy="51" r="2.6" fill="#26210f"/>
      <path d="M42 63 q8 3 16 -1" stroke="#7a4a30" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M30 78 L44 70 L50 78 L56 70 L70 78 Z" fill="#f4f4f5"/>
      <path d="M50 78 L46 92 L54 92 Z" fill="#c0354a"/>`); },
  };
  function wrap(coat, inner) {
    return `<svg viewBox="0 0 100 100" class="spr-sus" aria-hidden="true">
      <path d="M16 100 Q16 76 50 74 Q84 76 84 100 Z" fill="${coat}"/>
      <rect x="42" y="64" width="16" height="14" fill="#d9b08c" opacity=".9"/>
      ${inner}</svg>`;
  }
  function suspect(id) { return (SUS[id] || SUS.cragg)(); }

  return { hero, phantom, suspect };
})();
