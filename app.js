"use strict";

/* Innovations-Champions-League, eigenständige GitHub-Pages-Anwendung. */

const INNOVATIONS = [
  {id:"fernseher",name:"Fernseher",emoji:"📺"},
  {id:"antibiotika",name:"Antibiotika",emoji:"💊"},
  {id:"waschmaschine",name:"Vollautomatische Waschmaschine",emoji:"🫧"},
  {id:"mikrowelle",name:"Mikrowelle",emoji:"🍲"},
  {id:"computer",name:"Computer",emoji:"💻"},
  {id:"duesenflugzeug",name:"Düsenflugzeug",emoji:"✈️"},
  {id:"solarzellen",name:"Solarzellen",emoji:"☀️"},
  {id:"industrieroboter",name:"Industrieroboter",emoji:"🦾"},
  {id:"internet",name:"Internet",emoji:"🌐"},
  {id:"mobiltelefon",name:"Mobiltelefon",emoji:"📱"},
  {id:"digitalkamera",name:"Digitalkamera",emoji:"📷"},
  {id:"gps",name:"GPS-Navigation",emoji:"🧭"},
  {id:"3d-drucker",name:"3D-Drucker",emoji:"🖨️"},
  {id:"musikstreaming",name:"Musikstreaming",emoji:"🎧"},
  {id:"smartphone",name:"Smartphone",emoji:"📲"},
  {id:"ki",name:"Generative KI",emoji:"🤖"}
];

const IMAGE_FILES = {
  fernseher:"Fernseher.jpg",
  antibiotika:"Antibiotika.jpg",
  waschmaschine:"Waschmaschine.png",
  mikrowelle:"Mikrowelle.jpg",
  computer:"Computer.jpg",
  duesenflugzeug:"Düsenflugzeug.jpg",
  solarzellen:"Solarzellen.jpg",
  industrieroboter:"Industrieroboter.jpeg",
  internet:"Internet.jpg",
  mobiltelefon:"Mobiltelefon.jpg",
  digitalkamera:"Digitalkamera.jpg",
  gps:"GPS.jpg",
  "3d-drucker":"3DDrucker.png",
  musikstreaming:"Musikstreaming.jpg",
  smartphone:"Smartphone.jpg",
  ki:"KI.png"
};

const BY_ID = Object.fromEntries(INNOVATIONS.map(item => [item.id,item]));
const STAGES = [
  { key:"r16", title:"Achtelfinale", ids:Array.from({length:8},(_,i)=>"r16-"+i) },
  { key:"qf", title:"Viertelfinale", ids:Array.from({length:4},(_,i)=>"qf-"+i) },
  { key:"sf", title:"Halbfinale", ids:["sf-0","sf-1"] },
  { key:"bronze", title:"Spiel um Platz 3", ids:["bronze"] },
  { key:"final", title:"Finale", ids:["final"] }
];
const ORDER = STAGES.flatMap(stage => stage.ids);
const STORAGE_KEY = "innovations-champions-league-v2";
const app = document.getElementById("app");
let game = null;
let drawInterval = null;
let drawFinishTimeout = null;
let lastZoomTrigger = null;
const fallbackStorage = {};

function storageGet() {
  try { return localStorage.getItem(STORAGE_KEY); }
  catch (_) { return fallbackStorage.value || null; }
}
function storageSet(value) {
  fallbackStorage.value = value;
  try { localStorage.setItem(STORAGE_KEY,value); } catch (_) {}
}
function storageRemove() {
  delete fallbackStorage.value;
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
}
function saveGame() { if (game) storageSet(JSON.stringify(game)); }
function loadGame() {
  try {
    const loaded = JSON.parse(storageGet());
    if (!loaded || loaded.version !== 2 ||
        !Array.isArray(loaded.seeds) || loaded.seeds.length !== 16 ||
        new Set(loaded.seeds).size !== 16 || !loaded.seeds.every(id => BY_ID[id]) ||
        !loaded.picks || typeof loaded.picks !== "object" ||
        !["draw","overview","duel","podium"].includes(loaded.phase)) return null;
    return loaded;
  } catch (_) { return null; }
}
function randomIndex(max) {
  if (globalThis.crypto && crypto.getRandomValues) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  }
  return Math.floor(Math.random()*max);
}
function shuffledIds() {
  const ids = INNOVATIONS.map(item=>item.id);
  for (let i=ids.length-1;i>0;i--) {
    const j=randomIndex(i+1);
    [ids[i],ids[j]]=[ids[j],ids[i]];
  }
  return ids;
}
function participants(match) {
  if (!game) return [];
  const picks=game.picks;
  if (match.startsWith("r16-")) {
    const n=Number(match.slice(4));
    return [game.seeds[2*n],game.seeds[2*n+1]];
  }
  if (match.startsWith("qf-")) {
    const n=Number(match.slice(3));
    return [picks["r16-"+(2*n)],picks["r16-"+(2*n+1)]];
  }
  if (match.startsWith("sf-")) {
    const n=Number(match.slice(3));
    return [picks["qf-"+(2*n)],picks["qf-"+(2*n+1)]];
  }
  if (match==="final") return [picks["sf-0"],picks["sf-1"]];
  if (match==="bronze") {
    return [0,1].map(n=>participants("sf-"+n).find(id=>id!==picks["sf-"+n]));
  }
  return [];
}
function nextMatch() { return ORDER.find(id=>!game.picks[id])||null; }
function stageFor(match) { return STAGES.find(stage=>stage.ids.includes(match)); }
function currentStage() { const match=nextMatch(); return match?stageFor(match):STAGES[STAGES.length-1]; }
function completedCount() { return ORDER.filter(id=>game.picks[id]).length; }
function clearDrawTimers() {
  if (drawInterval!==null) clearInterval(drawInterval);
  if (drawFinishTimeout!==null) clearTimeout(drawFinishTimeout);
  drawInterval=null; drawFinishTimeout=null;
}
function scrollTop() { if (typeof window.scrollTo==="function") window.scrollTo({top:0,behavior:"instant"}); }

function startGame() {
  game={version:2,seeds:shuffledIds(),picks:{},phase:"draw",createdAt:Date.now()};
  saveGame();
  render();
}
function restartGame() {
  if (!confirm("Das gesamte Turnier löschen und mit neuer Auslosung starten?")) return;
  clearDrawTimers();
  storageRemove();
  game=null;
  render();
  scrollTop();
}
function decide(id) {
  if (!game || game.phase!=="duel") return;
  const match=nextMatch();
  if (!match || !participants(match).includes(id)) return;
  const oldStage=stageFor(match).key;
  game.picks[match]=id;
  const next=nextMatch();
  game.phase=!next?"podium":stageFor(next).key===oldStage?"duel":"overview";
  saveGame(); render(); scrollTop();
}
function proceedToDuels() {
  if (!game || game.phase!=="overview") return;
  game.phase="duel"; saveGame(); render(); scrollTop();
}
function showBracket() {
  if (!game || game.phase!=="duel") return;
  game.phase="overview"; saveGame(); render(); scrollTop();
}
function roundLabel(match) {
  const stage=stageFor(match);
  const index=stage.ids.indexOf(match);
  return stage.ids.length>1 ? "Duell "+(index+1)+" von "+stage.ids.length : stage.title;
}

function header() {
  return `<header class="topbar">
    <div class="brand"><span class="brand-icon">🏆</span><span>INNOVATIONS-CHAMPIONS-LEAGUE</span></div>
    <span class="top-note">DIE LETZTEN 100 JAHRE</span>
  </header>`;
}
function footer() { return ""; }
function restartButton() {
  return '<button type="button" class="small-button" data-action="restart">↻ Kompletter Neustart</button>';
}
function imageBox(item,cls) {
  return `<div class="${cls}">
    <span class="contender-emoji" aria-hidden="true">${item.emoji}</span>
    <img data-photo="${item.id}" src="./bilder/${IMAGE_FILES[item.id]}" alt="" loading="eager" decoding="async">
  </div>`;
}
function initializeImages() {
  document.querySelectorAll("img[data-photo]").forEach(img=>{
    const filename=IMAGE_FILES[img.dataset.photo];
    let triedRoot=false;
    img.addEventListener("error",()=>{
      if (!triedRoot && filename) {
        triedRoot=true;
        img.src="./"+encodeURIComponent(filename);
      } else img.remove();
    });
  });
}
function renderLanding() {
  app.innerHTML=`${header()}
    <section class="hero landing">
      <div class="hero-cup" aria-hidden="true">🏆</div>
      <div class="eyebrow">Das grosse Innovationsturnier</div>
      <h1>INNOVATIONS<br><span>CHAMPIONS LEAGUE</span></h1>
      <p class="subtitle">Welche Innovation der letzten 100 Jahre hat Wirtschaft und Gesellschaft am stärksten verändert?</p>
      <button class="primary-button launch-button" type="button" data-action="start">🏆 Jetzt auslosen</button>
      <p class="landing-note">Nach der Auslosung sehen Sie den vollständigen Turnierbaum. Danach beginnt das Achtelfinale.</p>
    </section>
    ${footer()}`;
}
function drawPairHtml(i) {
  const a=BY_ID[game.seeds[2*i]],b=BY_ID[game.seeds[2*i+1]];
  return `<span>${a.emoji} ${a.name}</span><strong>VS</strong><span>${b.emoji} ${b.name}</span>`;
}
function renderDraw() {
  const cells=Array.from({length:8},(_,i)=>`<div class="draw-pair" id="draw-pair-${i}">
    <span class="draw-pair-num">DUELL ${i+1}</span>
    <div class="draw-pair-inner"><span class="draw-question">?</span><strong>VS</strong><span class="draw-question">?</span></div>
  </div>`).join("");
  app.innerHTML=`${header()}
    <section class="section-panel draw-screen">
      <div class="eyebrow">Die Auslosung läuft</div>
      <h1>Das Los entscheidet!</h1>
      <div class="draw-orb" aria-hidden="true"><span>🏆</span><i></i><i></i><i></i></div>
      <p class="subtitle">16 Innovationen, acht zufällige Begegnungen</p>
      <div class="draw-progress" id="draw-progress">0 / 8 Duelle ausgelost</div>
      <div class="draw-grid">${cells}</div>
    </section>${footer()}`;
  let revealed=0;
  const reveal=()=>{
    const el=document.getElementById("draw-pair-"+revealed);
    if (el) {
      el.querySelector(".draw-pair-inner").innerHTML=drawPairHtml(revealed);
      el.classList.add("revealed");
    }
    revealed++;
    const counter=document.getElementById("draw-progress");
    if (counter) counter.textContent=revealed+" / 8 Duelle ausgelost";
    if (revealed===8) {
      clearInterval(drawInterval); drawInterval=null;
      drawFinishTimeout=setTimeout(()=>{
        drawFinishTimeout=null;
        if (game && game.phase==="draw") {
          game.phase="overview"; saveGame(); render(); scrollTop();
        }
      },850);
    }
  };
  drawInterval=setInterval(reveal,390);
}

function treeTeam(id,winner) {
  if (!id) return '<div class="tree-team empty"><span class="tree-thumb placeholder">?</span><span class="tree-team-name">Noch offen</span></div>';
  const item=BY_ID[id];
  return `<button class="tree-team ${winner===id?"tree-winner":""}" type="button" data-zoom="${id}" title="${item.name} vergrössern">
    <span class="tree-thumb">${imageBox(item,"tree-thumb-image")}</span>
    <span class="tree-team-name">${item.name}</span>
    <span class="tree-zoom-icon" aria-hidden="true">⤢</span>
  </button>`;
}
function treeCard(match) {
  const [a,b]=participants(match);
  return `<div class="tree-card">
    <span class="tree-match-label">${roundLabel(match)}</span>
    ${treeTeam(a,game.picks[match])}
    ${treeTeam(b,game.picks[match])}
  </div>`;
}
function treeColumn(stage) {
  return `<div class="tree-column tree-column-${stage.key}">
    <div class="tree-column-title">${stage.title}</div>
    <div class="tree-column-body">${stage.ids.map(treeCard).join("")}</div>
  </div>`;
}
function bracketBoard() {
  return `<div class="tree-scroll" aria-label="Turnierbaum, horizontal scrollbar">
    <div class="tree-board">
      ${STAGES.filter(s=>s.key!=="bronze").map(treeColumn).join("")}
    </div>
  </div>`;
}
function renderOverview() {
  const stage=currentStage();
  const firstRound=stage.key==="r16";
  const buttonText=firstRound?"Achtelfinale starten →":
    stage.key==="bronze"?"Spiel um Platz 3 starten →":stage.title+" starten →";
  const bronze=stage.key==="bronze"?
    `<div class="bronze-preview"><h3>🥉 Spiel um Platz 3</h3>${treeCard("bronze")}</div>`:"";
  app.innerHTML=`${header()}
    <section class="section-panel overview-screen">
      <div class="stage-label">${firstRound?"Auslosung abgeschlossen":"Nächste Runde"}</div>
      <div class="overview-heading">
        <div><h1>Der Turnierbaum</h1><p class="section-copy">Alle Paarungen im Überblick. Klicken Sie auf ein Bild, um es gross anzusehen.</p></div>
        <span class="stage-chip">${stage.title}</span>
      </div>
      <p class="scroll-hint">Bei schmalem Bildschirm den Turnierbaum seitlich verschieben ↔</p>
      ${bracketBoard()}
      ${bronze}
      <div class="overview-actions">
        ${restartButton()}
        <button class="primary-button" type="button" data-action="round-start">${buttonText}</button>
      </div>
    </section>${footer()}`;
  initializeImages();
}

function contender(id) {
  const item=BY_ID[id];
  return `<button type="button" class="contender" data-choice="${id}" aria-label="${item.name} als Sieger wählen">
    ${imageBox(item,"contender-image")}
    <span class="contender-bottom">
      <span class="contender-name">${item.name}</span>
      <span class="contender-select">Als Sieger wählen ↗</span>
    </span>
  </button>`;
}
function renderDuel() {
  const match=nextMatch();
  if (!match) {game.phase="podium"; saveGame();render();return;}
  const [a,b]=participants(match);
  if (!a||!b) {game.phase="overview";saveGame();render();return;}
  const round=stageFor(match);
  const idx=ORDER.indexOf(match);
  app.innerHTML=`${header()}
    <section class="section-panel duel-screen">
      <div class="stage-top">
        <div><div class="stage-label">Innovations-Champions-League</div><h1 class="stage-name">${round.title}</h1></div>
        <span class="count">Duell ${idx+1} von 16</span>
      </div>
      <div class="progress-wrap" role="progressbar" aria-label="Fortschritt" aria-valuemin="0" aria-valuemax="16" aria-valuenow="${idx}">
        <div class="progress-bar" style="width:${Math.round(idx/16*100)}%"></div>
      </div>
      <p class="match-prompt"><strong>Welche Innovation hat Wirtschaft und Gesellschaft stärker verändert?</strong><br>Diskutieren Sie kurz und klicken Sie auf einen Sieger.</p>
      <div class="match-grid">${contender(a)}<div class="versus" aria-hidden="true">VS</div>${contender(b)}</div>
      <div class="match-actions">
        <button class="small-button" type="button" data-action="bracket">▦ Turnierbaum ansehen</button>
        ${restartButton()}
      </div>
    </section>${footer()}`;
  initializeImages();
}
function podiumEntry(id,place,position) {
  const item=BY_ID[id];
  const medal=place===1?"🥇":place===2?"🥈":"🥉";
  return `<div class="podium-entry ${position}">
    <div class="medal" aria-hidden="true">${medal}</div>
    ${imageBox(item,"podium-picture")}
    <div class="podium-name">${item.name}</div>
    <div class="podium-step" aria-label="Platz ${place}">${place}</div>
  </div>`;
}
function renderPodium() {
  const gold=game.picks.final;
  const silver=participants("final").find(id=>id!==gold);
  const bronze=game.picks.bronze;
  app.innerHTML=`${header()}
    <section class="section-panel results-screen">
      <div class="result-title">
        <div class="confetti" aria-hidden="true">✨🏆✨</div>
        <div class="eyebrow">Das Turnier ist entschieden</div>
        <h1>Unser Siegerpodest</h1>
        <p>Die bedeutendsten Innovationen der letzten 100 Jahre</p>
      </div>
      <div class="podium">
        ${podiumEntry(silver,2,"second")}
        ${podiumEntry(gold,1,"first")}
        ${podiumEntry(bronze,3,"third")}
      </div>
      <div class="results-actions">
        <button class="primary-button" data-action="print" type="button">Podest speichern / drucken</button>
        <button class="small-button" data-action="results-bracket" type="button">▦ Turnierbaum anzeigen</button>
        ${restartButton()}
      </div>
      <div id="results-tree" class="results-tree" hidden>
        <h2>Der gesamte Turnierverlauf</h2>
        <p class="section-copy">Klicken Sie auf die Bilder, um sie zu vergrössern.</p>
        ${bracketBoard()}
        <div class="bronze-preview"><h3>Spiel um Platz 3</h3>${treeCard("bronze")}</div>
      </div>
    </section>${footer()}`;
  initializeImages();
}
function render() {
  clearDrawTimers();
  if (!game) return renderLanding();
  if (game.phase==="draw") return renderDraw();
  if (game.phase==="overview") return renderOverview();
  if (game.phase==="duel") return renderDuel();
  return renderPodium();
}

function zoomImage(id,trigger) {
  if (!BY_ID[id]) return;
  closeZoom(false);
  lastZoomTrigger=trigger;
  const item=BY_ID[id];
  const modal=document.createElement("div");
  modal.className="image-overlay";
  modal.id="image-overlay";
  modal.innerHTML=`<div class="image-dialog" role="dialog" aria-modal="true" aria-label="${item.name}">
    <button type="button" class="modal-close" data-action="close-zoom" aria-label="Bild schliessen">✕</button>
    ${imageBox(item,"image-dialog-photo")}
    <h2>${item.name}</h2>
  </div>`;
  document.body.appendChild(modal);
  document.body.classList.add("modal-open");
  initializeImages();
  modal.querySelector(".modal-close").focus();
}
function closeZoom(restoreFocus=true) {
  const existing=document.getElementById("image-overlay");
  if (existing) existing.remove();
  document.body.classList.remove("modal-open");
  if (restoreFocus && lastZoomTrigger && lastZoomTrigger.isConnected) lastZoomTrigger.focus();
  lastZoomTrigger=null;
}

app.addEventListener("click",event=>{
  const contender=event.target.closest("[data-choice]");
  if (contender) {decide(contender.dataset.choice);return;}
  const zoom=event.target.closest("[data-zoom]");
  if (zoom) {zoomImage(zoom.dataset.zoom,zoom);return;}
  const action=event.target.closest("[data-action]");
  if (!action) return;
  switch(action.dataset.action) {
    case "start":startGame();break;
    case "round-start":proceedToDuels();break;
    case "bracket":showBracket();break;
    case "restart":restartGame();break;
    case "results-bracket":{
      const el=document.getElementById("results-tree");
      if (el) {el.hidden=!el.hidden; if (!el.hidden) el.scrollIntoView({behavior:"smooth",block:"start"});}
      break;
    }
    case "print":window.print();break;
    case "close-zoom":closeZoom();break;
  }
});
document.addEventListener("click",event=>{
  if (event.target.closest('[data-action="close-zoom"]')) {
    closeZoom();
    return;
  }
  if (event.target.id==="image-overlay") closeZoom();
});
document.addEventListener("keydown",event=>{
  if (event.key==="Escape") closeZoom();
});
window.addEventListener("pagehide",clearDrawTimers);
game=loadGame();
render();
