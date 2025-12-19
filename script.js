// -------------------- SESSION & STORAGE KEYS --------------------
const SESSION_KEY = "memory-session-active"; // marks if this is a new session/tab open
const STORAGE_KEY = "memory-game-state";     // localStorage key to persist game state

// Check if this is a new session (first load in this tab/browser)
const isNewSession = !sessionStorage.getItem(SESSION_KEY);
sessionStorage.setItem(SESSION_KEY, "1"); // mark session as active

// -------------------- DOM ELEMENTS --------------------
const gridEl = document.getElementById("grid");
const newGameBtn = document.getElementById("newGameBtn");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const difficultyEl = document.getElementById("difficulty");
const modal = document.getElementById("modal");
const modalMsg = document.getElementById("modalMsg");
const playAgainBtn = document.getElementById("playAgainBtn");

// -------------------- GAME CONFIG --------------------
const EMOJI_SET = ["🍎","🍌","🍇","🍉","🍓","🍒","🍍","🥝","🥑","🍑","🍋","🍊","🍐","🥥","🥕","🌽","🍆","🍅"];

let gridSize = 4;         // default grid size (4x4)
let deck = [];             // array of cards for current game
let lockBoard = false;     // prevents clicking during flip animations
let firstPick = null;      // first selected card
let secondPick = null;     // second selected card
let moves = 0;             // total moves count
let matchPairs = 0;        // matched pairs count
let startTime = null;      // game start timestamp
let timeInterval = null;   // timer interval
let gameOver = false;      // flag when all pairs are matched
let winSummary = null;     // stores final score/time/moves when game ends

// -------------------- STATE PERSISTENCE --------------------
function saveState() {
  // map card DOM states to array
  const cards = [...document.querySelectorAll(".card")].map(card => ({
    symbol: card.dataset.symbol,
    flipped: card.classList.contains("is-flipped"),
    matched: card.classList.contains("matched")
  }));

  // store the entire game state in localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    gridSize,
    deck,
    cards,
    moves,
    matchPairs,
    startTime,
    gameOver,
    winSummary
  }));
}

function loadState() {
  // load stored game state
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  return JSON.parse(raw);
}

// -------------------- GAME INITIALIZATION --------------------
function initGame() {
  // Always render default 4×4 grid first so the UI is visible immediately
  gridSize = 4;
  difficultyEl.value = 4;
  deck = buildeck(gridSize);
  renderCards();

  const saved = localStorage.getItem(STORAGE_KEY);

  // Double requestAnimationFrame ensures browser paints default UI before confirmation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // New session with previous saved game
      if (isNewSession && saved) {
        const resume = confirm("Continue your previous game?");

        if (resume) {
          restoreGame(JSON.parse(saved)); // continue previous state
        } else {
          localStorage.removeItem(STORAGE_KEY); // discard previous state
          saveState(); // persist fresh 4x4 grid
        }
        return;
      }

      // Same session refresh: restore previous state silently
      if (saved) {
        restoreGame(JSON.parse(saved));
      }
    });
  });
}

// Restore game state from saved object
function restoreGame(state) {
  gridSize = state.gridSize;
  deck = state.deck;
  moves = state.moves;
  matchPairs = state.matchPairs;
  startTime = state.startTime;
  gameOver = state.gameOver;
  winSummary = state.winSummary;

  // update difficulty select & move count UI
  difficultyEl.value = gridSize;
  movesEl.textContent = moves;

  // render the grid & cards
  renderCards();

  // restore individual card flipped/matched state
  const cardEls = document.querySelectorAll(".card");
  state.cards.forEach((c, i) => {
    if (c.flipped) cardEls[i].classList.add("is-flipped");
    if (c.matched) cardEls[i].classList.add("matched");
  });

  // start timer only if the game is running and not over
  if (startTime && !gameOver) {
    timeInterval = setInterval(() => {
      timeEl.textContent = formatTime(Date.now() - startTime);
      updateScore();
    }, 500);
  }

  // show winning modal if game is over
  if (gameOver && winSummary) {
    modalMsg.textContent =
      `Finished in ${formatTime(winSummary.time)} with ${winSummary.moves} moves. Score: ${winSummary.score}`;
    modal.hidden = false;
  } else {
    modal.hidden = true;
  }

  updateScore();
}

// -------------------- UTILITIES --------------------
function shuffle(array){
  for(let i = array.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]]
  };
  return array;
}

function formatTime(ms){
  const sec = Math.floor(ms/1000);
  const m = String(Math.floor(sec/60)).padStart(2,"0");
  const s = String(Math.floor(sec%60)).padStart(2,"0");

  return `${m}:${s}`;
}

// -------------------- DECK & GRID --------------------
function buildeck(size){
  const pairs = (size*size)/2;
  const symbol = EMOJI_SET.slice(0, pairs);
  const cards = symbol.flatMap((s,i)=>[
    {id: `${s}-${i}-A`, symbol: s},
    {id: `${s}-${i}-B`, symbol: s}
  ])
  return shuffle(cards)
}

function renderCards(){
  // remove old grid classes & reset grid
  gridEl.classList.remove("grid-4", "grid-6");
  gridEl.classList.add(`grid-${gridSize}`);
  gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 0fr)`;
  gridEl.innerHTML="";

  const frag = document.createDocumentFragment();
  deck.forEach((card)=>{
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.dataset.symbol = card.symbol;

    const inner = document.createElement("div");
    inner.className = "card-inner";

    const front = document.createElement("div");
    front.className = "face front";

    const back = document.createElement("div");
    back.className = "face back";
    back.textContent = card.symbol;

    inner.appendChild(front);
    inner.appendChild(back);
    cardEl.appendChild(inner);

    frag.appendChild(cardEl);

    cardEl.addEventListener("click", ()=>onCardClick(cardEl));
  });

  gridEl.appendChild(frag)
}

// -------------------- CARD CLICK & MATCH LOGIC --------------------
function onCardClick(cardEl){
  if (gameOver || lockBoard) return;
  if(cardEl.classList.contains("is-flipped")) return;

  if(!timeInterval){
    startTime = Date.now();
    timeInterval = setInterval(()=>{
      timeEl.textContent = formatTime(Date.now()-startTime);
      updateScore();
    },500)
  }

  cardEl.classList.add("is-flipped");

  if(!firstPick){
    firstPick = cardEl;
    return;
  }

  secondPick = cardEl;
  moves++;
  movesEl.textContent = moves;

  updateScore();
  checkMatch();
}

function checkMatch() {
  if (firstPick.dataset.symbol === secondPick.dataset.symbol) {
    firstPick.classList.add("matched");
    secondPick.classList.add("matched");

    matchPairs++;
    resetPicks();
    saveState();

    if (matchPairs === deck.length / 2) onWin();
  } else {
    lockBoard = true;
    gridEl.classList.add("locked"); // prevent clicks visually

    setTimeout(() => {
      firstPick.classList.remove("is-flipped");
      secondPick.classList.remove("is-flipped");
      resetPicks();
      gridEl.classList.remove("locked");
      saveState();
    }, 800);
  }
}

function resetPicks(){
  [firstPick, secondPick] = [null, null];
  lockBoard = false;
}

// -------------------- GAME CONTROL --------------------
function hardReset() {
  localStorage.removeItem(SESSION_KEY);

  clearInterval(timeInterval);
  timeInterval = null;
  startTime = null;

  timeEl.textContent = "00:00";
  moves = 0;
  matchPairs = 0;
  movesEl.textContent = 0;
  scoreEl.textContent = 0;

  deck = buildeck(gridSize);
  renderCards();
  modal.hidden = true;

  saveState();
}

function newGame() {
  clearInterval(timeInterval);
  timeInterval = null;
  startTime = null;
  timeEl.textContent = "00:00";
  moves = 0;
  matchPairs = 0;
  movesEl.textContent = 0;
  scoreEl.textContent = 0;
  gameOver = false;
  winSummary = null;

  deck = buildeck(gridSize);
  renderCards();
  modal.hidden = true;

  saveState();
}

// -------------------- SCORE & WIN --------------------
function updateScore(){
  const elapsed = startTime ? (Date.now()-startTime)/1000 : 0;
  const score= Math.max(0, 10000-Math.floor(elapsed*15)-moves*120);
  scoreEl.textContent = score;
}

function onWin() {
  clearInterval(timeInterval);
  timeInterval = null;

  const elapsed = Date.now() - startTime;
  winSummary = { time: elapsed, moves, score: scoreEl.textContent };

  gameOver = true;

  modalMsg.textContent =
    `Finished in ${formatTime(elapsed)} with ${moves} moves. Score: ${scoreEl.textContent}`;
  modal.hidden = false;

  saveState();
}

// -------------------- EVENT LISTENERS --------------------
newGameBtn.addEventListener("click", ()=>newGame());
playAgainBtn.addEventListener("click", ()=>newGame());

difficultyEl.addEventListener("click", (e) => {
  const newSize = parseInt(e.target.value);
  if (newSize !== gridSize) {
    gridSize = newSize;
    hardReset(); // wipe & start new grid
  }
});

// -------------------- START GAME --------------------
initGame();