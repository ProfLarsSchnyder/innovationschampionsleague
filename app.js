"use strict";

/**
 * Innovations-Champions-League, Gymnasium Laufen.
 * Ohne Framework, Registrierung oder Server.
 *
 * Eigene Bilder: /bilder/<id>.jpg
 * Alternativ werden .jpeg, .png und .webp automatisch gesucht.
 * Die IDs stehen in der Liste INNOVATIONS weiter unten.
 */

const INNOVATIONS = [
  { id: "fernseher", name: "Fernseher", emoji: "📺" },
  { id: "antibiotika", name: "Antibiotika", emoji: "💊" },
  { id: "waschmaschine", name: "Vollautomatische Waschmaschine", emoji: "🫧" },
  { id: "mikrowelle", name: "Mikrowelle", emoji: "🍲" },
  { id: "computer", name: "Computer", emoji: "💻" },
  { id: "duesenflugzeug", name: "Düsenflugzeug", emoji: "✈️" },
  { id: "solarzellen", name: "Solarzellen", emoji: "☀️" },
  { id: "industrieroboter", name: "Industrieroboter", emoji: "🦾" },
  { id: "internet", name: "Internet", emoji: "🌐" },
  { id: "mobiltelefon", name: "Mobiltelefon", emoji: "📱" },
  { id: "digitalkamera", name: "Digitalkamera", emoji: "📷" },
  { id: "gps", name: "GPS-Navigation", emoji: "🧭" },
  { id: "3d-drucker", name: "3D-Drucker", emoji: "🖨️" },
  { id: "musikstreaming", name: "Musikstreaming", emoji: "🎧" },
  { id: "smartphone", name: "Smartphone", emoji: "📲" },
  { id: "ki", name: "Generative KI", emoji: "🤖" }
];

const BY_ID = Object.fromEntries(INNOVATIONS.map(item => [item.id, item]));
const ORDER = [
  ...Array.from({ length: 8 }, (_, i) => "r16-" + i),
  ...Array.from({ length: 4 }, (_, i) => "qf-" + i),
  "sf-0", "sf-1", "bronze", "final"
];
const STORE_PREFIX = "innovations-champions-league-v1-";
const app = document.getElementById("app");

let group = null;
let game = null;
const fallbackStorage = {};

function readStorage(key) {
  try { return localStorage.getItem(key); }
  catch (_) { return fallbackStorage[key] || null; }
}
function writeStorage(key, value) {
  fallbackStorage[key] = value;
  try { localStorage.setItem(key, value); } catch (_) {}
}
function removeStorage(key) {
  delete fallbackStorage[key];
  try { localStorage.removeItem(key); } catch (_) {}
}

function getGroupFromUrl() {
  const value = new URLSearchParams(location.search).get("gruppe");
  return ["1", "2", "3"].includes(value) ? value : null;
}
function getStoreKey() { return STORE_PREFIX + "gruppe-" + group; }

function loadGame() {
  try {
    const loaded = JSON.parse(readStorage(getStoreKey()));
    if (loaded && Array.isArray(loaded.seeds) &&
        loaded.seeds.length === 16 && new Set(loaded.seeds).size === 16 &&
        loaded.seeds.every(id => BY_ID[id]) && loaded.picks &&
        typeof loaded.picks === "object") {
      return loaded;
    }
  } catch (_) {}
  return null;
}
function saveGame() {
  if (game) writeStorage(getStoreKey(), JSON.stringify(game));
}

function randomIndex(max) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    return bytes[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function shuffledIds() {
  const ids = INNOVATIONS.map(item => item.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

function startGame() {
  game = { version: 1, seeds: shuffledIds(), picks: {}, created: Date.now() };
  saveGame();
  render();
}

function participants(match) {
  const picks = game.picks;
  if (match.startsWith("r16-")) {
    const n = Number(match.slice(4));
    return [game.seeds[n * 2], game.seeds[n * 2 + 1]];
  }
  if (match.startsWith("qf-")) {
    const n = Number(match.slice(3));
    return [picks["r16-" + n * 2], picks["r16-" + (n * 2 + 1)]];
  }
  if (match.startsWith("sf-")) {
    const n = Number(match.slice(3));
    return [picks["qf-" + n * 2], picks["qf-" + (n * 2 + 1)]];
  }
  if (match === "final") {
    return [picks["sf-0"], picks["sf-1"]];
  }
  if (match === "bronze") {
    return [0, 1].map(n => participants("sf-" + n).find(id => id !== picks["sf-" + n]));
  }
  return [];
}

function nextMatch() { return ORDER.find(match => !game.picks[match]) || null; }
function stageName(match) {
  if (match.startsWith("r16")) return "Achtelfinale";
  if (match.startsWith("qf")) return "Viertelfinale";
  if (match.startsWith("sf")) return "Halbfinale";
  if (match === "bronze") return "Spiel um Platz 3";
  return "Das grosse Finale";
}
function groupHeader() {
  return `<header class="topbar">
    <a class="brand" href="./" data-action="home" aria-label="Zur Gruppenauswahl">
      <span class="brand-icon">🏆</span><span>INNOVATIONS-CHAMPIONS-LEAGUE</span>
    </a>
    <span class="top-note">1W · Gymnasium Laufen</span>
  </header>`;
}
function footer() {
  return '<footer class="footer">Die bedeutendsten Innovationen der letzten 100 Jahre · Wirtschaft &amp; Recht</footer>';
}
function groupToolbar() {
  return `<div class="group-head">
    <span class="group-label">GRUPPE ${group}</span>
    <button class="link-button" data-action="home" type="button">← Gruppe wechseln</button>
  </div>`;
}
function imageBox(item, context) {
  return `<div class="${context}">
    <span class="contender-emoji" aria-hidden="true">${item.emoji}</span>
    <img data-photo="${item.id}" src="./bilder/${item.id}.jpg" alt="${item.name}" loading="eager" decoding="async">
  </div>`;
}
function initializeImages() {
  document.querySelectorAll("img[data-photo]").forEach(img => {
    const id = img.dataset.photo;
    const formats = ["jpg", "jpeg", "png", "webp"];
    let idx = 0;
    img.addEventListener("error", () => {
      idx += 1;
      if (idx < formats.length) img.src = "./bilder/" + id + "." + formats[idx];
      else img.remove(); // Das Emoji darunter bleibt sichtbar.
    });
  });
}

function renderGroupSelection() {
  const buttons = [1, 2, 3].map(n => `
    <button class="group-button" data-group="${n}" type="button">
      <span class="group-icon">🏅</span>
      <strong>Gruppe ${n}</strong>
      <span>Eigenes Turnier starten →</span>
    </button>`).join("");
  app.innerHTML = `
    ${groupHeader()}
    <section class="hero">
      <div class="hero-cup" aria-hidden="true">🏆</div>
      <div class="eyebrow">Das grosse Innovationsturnier</div>
      <h1>INNOVATIONS<br><span>CHAMPIONS LEAGUE</span></h1>
      <p class="subtitle">Welche Innovation hat die Wirtschaft und das Leben der Menschen am stärksten verändert?</p>
      <div class="rules"><span class="chip">Letzte 100 Jahre</span><span class="chip">16 Innovationen</span><span class="chip">3 unabhängige Auslosungen</span></div>
    </section>
    <section class="section-panel">
      <h2 class="section-title">Wählen Sie Ihre Gruppe</h2>
      <p class="section-copy">Jede Gruppe spielt mit denselben 16 Innovationen, aber mit zufällig ausgelosten Paarungen. Entscheiden Sie gemeinsam, welche Innovation ins nächste Duell kommt.</p>
      <div class="group-grid">${buttons}</div>
    </section>
    ${footer()}`;
}
function renderStart() {
  app.innerHTML = `
    ${groupHeader()}
    ${groupToolbar()}
    <section class="section-panel start-screen">
      <div class="hero-cup" aria-hidden="true">🏆</div>
      <div class="eyebrow">Gruppe ${group} · Das Turnier beginnt</div>
      <h2>16 Innovationen.<br>Ein Champion.</h2>
      <p class="subtitle">Die Innovationen der letzten 100 Jahre treten gegeneinander an. Diskutieren Sie in Ihrer Gruppe, welche Innovation Wirtschaft und Gesellschaft stärker verändert hat.</p>
      <div class="rules">
        <span class="chip">16 Duelle inklusive Platz 3</span>
        <span class="chip">Jede Entscheidung per Klick</span>
        <span class="chip">Zufällige Paarungen</span>
      </div>
      <button class="primary-button" data-action="start" type="button">Turnier starten →</button>
      <p class="footer">Keine Anmeldung, kein Schreiben, einfach entscheiden.</p>
    </section>${footer()}`;
}
function contenderButton(id) {
  const item = BY_ID[id];
  return `<button class="contender" data-choice="${item.id}" type="button" aria-label="${item.name} als Sieger wählen">
    ${imageBox(item, "contender-image")}
    <span class="contender-bottom">
      <span class="contender-name">${item.name}</span>
      <span class="contender-select">Als Sieger wählen ↗</span>
    </span>
  </button>`;
}
function renderMatch(match) {
  const [left, right] = participants(match);
  if (!left || !right) {
    app.innerHTML = groupHeader() + '<p>Das Turnier konnte nicht geladen werden. Bitte starten Sie es neu.</p>';
    return;
  }
  const i = ORDER.indexOf(match);
  const progress = Math.round((i / ORDER.length) * 100);
  const undo = i > 0 ? '<button class="small-button" data-action="undo" type="button">↶ Letzte Entscheidung zurück</button>' : '<span></span>';
  app.innerHTML = `
    ${groupHeader()}
    ${groupToolbar()}
    <section class="section-panel">
      <div class="stage-top">
        <div><div class="stage-label">K.-o.-Turnier</div><h2 class="stage-name">${stageName(match)}</h2></div>
        <div class="count">Duell <strong>${i + 1}</strong> von 16</div>
      </div>
      <div class="progress-wrap" role="progressbar" aria-label="Turnierfortschritt" aria-valuenow="${i}" aria-valuemin="0" aria-valuemax="16"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p class="match-prompt"><strong>Welche Innovation hat Wirtschaft und Gesellschaft stärker verändert?</strong><br>Diskutieren Sie kurz und klicken Sie auf Ihren Sieger.</p>
      <div class="match-grid">
        ${contenderButton(left)}
        <div class="versus" aria-hidden="true">VS</div>
        ${contenderButton(right)}
      </div>
      <div class="match-actions">
        ${undo}
        <span class="match-help">Der Sieger rückt <strong>automatisch</strong> weiter.</span>
      </div>
    </section>
    ${footer()}`;
  initializeImages();
}

function podiumEntry(id, place, cssClass) {
  const item = BY_ID[id];
  const medal = place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉";
  return `<div class="podium-entry ${cssClass}">
      <div class="medal" aria-hidden="true">${medal}</div>
      ${imageBox(item, "podium-picture")}
      <div class="podium-name">${item.name}</div>
      <div class="podium-step" aria-label="Platz ${place}">${place}</div>
    </div>`;
}

function bracketItem(match) {
  const players = participants(match);
  const winner = game.picks[match];
  return `<div class="bracket-item">
    ${players.map(id => {
      const item = BY_ID[id];
      return `<div class="bracket-line ${winner === id ? "won" : "lost"}">
        <span class="tiny-mark">${winner === id ? "✓" : ""}</span><span>${item.name}</span>
      </div>`;
    }).join("")}
  </div>`;
}
function bracketColumn(title, matches) {
  return `<div class="bracket-column">
    <h3 class="bracket-col-title">${title}</h3>
    ${matches.map(bracketItem).join("")}
  </div>`;
}

function renderResults() {
  const gold = game.picks.final;
  const [finalA, finalB] = participants("final");
  const silver = finalA === gold ? finalB : finalA;
  const bronze = game.picks.bronze;
  const bracket = [
    bracketColumn("Achtelfinale", ORDER.slice(0, 8)),
    bracketColumn("Viertelfinale", ORDER.slice(8, 12)),
    bracketColumn("Halbfinale", ORDER.slice(12, 14)),
    bracketColumn("Platz 3", ["bronze"]),
    bracketColumn("Finale", ["final"])
  ].join("");
  app.innerHTML = `
    ${groupHeader()}
    ${groupToolbar()}
    <section class="section-panel">
      <div class="result-title">
        <div class="confetti" aria-hidden="true">✨🏆✨</div>
        <div class="eyebrow">Gruppe ${group} · Turnier beendet</div>
        <h2>Unser Siegerpodest</h2>
        <p>Die Innovations-Champions-League der letzten 100 Jahre</p>
      </div>
      <div class="podium" aria-label="Siegerpodest">
        ${podiumEntry(silver, 2, "second")}
        ${podiumEntry(gold, 1, "first")}
        ${podiumEntry(bronze, 3, "third")}
      </div>
      <div class="results-actions">
        <button class="primary-button" data-action="print" type="button">Podest drucken / speichern</button>
        <button class="small-button" data-action="undo" type="button">↶ Letzte Entscheidung ändern</button>
        <button class="small-button" data-action="restart" type="button">Neu auslosen</button>
      </div>
      <details class="bracket-details">
        <summary>Alle Duelle und den Turnierverlauf anzeigen</summary>
        <div class="bracket-scroll" aria-label="Turnierverlauf">${bracket}</div>
      </details>
    </section>
    ${footer()}`;
  initializeImages();
}

function render() {
  if (!group) renderGroupSelection();
  else if (!game) renderStart();
  else {
    const match = nextMatch();
    if (match) renderMatch(match);
    else renderResults();
  }
}

function openGroup(number) {
  const url = new URL(location.href);
  url.searchParams.set("gruppe", String(number));
  history.pushState({}, "", url);
  boot();
}
function goHome() {
  const url = new URL(location.href);
  url.searchParams.delete("gruppe");
  history.pushState({}, "", url);
  boot();
}
function boot() {
  group = getGroupFromUrl();
  game = group ? loadGame() : null;
  render();
}

app.addEventListener("click", event => {
  const choice = event.target.closest("[data-choice]");
  if (choice && game) {
    const match = nextMatch();
    if (!match) return;
    const id = choice.dataset.choice;
    if (!participants(match).includes(id)) return;
    game.picks[match] = id;
    saveGame();
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  const groupButton = event.target.closest("[data-group]");
  if (groupButton) { openGroup(groupButton.dataset.group); return; }

  const button = event.target.closest("[data-action]");
  if (!button) return;
  // Interner Startbildschirm statt Navigation auf die GitHub-Startseite.
  event.preventDefault();
  switch (button.dataset.action) {
    case "home": goHome(); break;
    case "start": startGame(); break;
    case "undo": {
      if (!game) break;
      const chosen = ORDER.filter(match => game.picks[match]);
      if (chosen.length) {
        delete game.picks[chosen[chosen.length - 1]];
        saveGame();
        render();
      }
      break;
    }
    case "restart":
      if (confirm("Wollen Sie dieses Turnier wirklich löschen und neu auslosen?")) {
        removeStorage(getStoreKey());
        game = null;
        startGame();
      }
      break;
    case "print": window.print(); break;
  }
});

window.addEventListener("popstate", boot);
boot();
