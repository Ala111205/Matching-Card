const gridEl = document.getElementById("grid");
const newGameBtn = document.getElementById("newGameBtn");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const difficultyEl = document.getElementById("difficulty");
const modal = document.getElementById("modal");
const modalMsg = document.getElementById("modalMsg");
const playAgainBtn = document.getElementById("playAgainBtn")

const EMOJI_SET = ["🍎","🍌","🍇","🍉","🍓","🍒","🍍","🥝","🥑","🍑","🍋","🍊","🍐","🥥","🥕","🌽","🍆","🍅"];

let gridSize = 4;
let deck = [];
let lockBoard = false;
let firstPick = null;
let secondPick = null;
let moves = 0;
let matchPairs = 0;
let startTime = null;
let timeInterval = null;

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
  gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 0fr)`
  gridEl.innerHTML="";

  const frag = document.createDocumentFragment();
  deck.forEach((card)=>{
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.dataset.symbol = card.symbol

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
};

function onCardClick(cardEl){
  if(lockBoard) return;

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
  movesEl.textContent=moves;

  updateScore();
  
  checkMatch();
}

function checkMatch(){
  if(firstPick.dataset.symbol === secondPick.dataset.symbol){
    matchPairs++
    resetPicks();
    if(matchPairs === deck.length/2){
      onWin();
    }
  }
  else{
    lockBoard = true;
    setTimeout(()=>{
      firstPick.classList.remove("is-flipped")
      secondPick.classList.remove("is-flipped")

      resetPicks();
    },800)
  }
}

function resetPicks(){
  [firstPick, secondPick] = [null, null];
  lockBoard = false;
}

function newGame(){
  clearInterval(timeInterval);
  timeInterval=null;
  startTime=null;
  timeEl.textContent="00:00"
  moves=0;
  matchPairs=0;
  movesEl.textContent=0;
  scoreEl.textContent=0;
  deck=buildeck(gridSize);
  renderCards();
  modal.hidden = true;
}

function updateScore(){
  const elapsed = startTime? (Date.now()-startTime)/1000: 0;
  const score= Math.max(0,10000-Math.floor(elapsed*15)-moves*120)

  scoreEl.textContent=score;
}

function onWin(){
  clearInterval(timeInterval);
  const elapsed = Date.now()-startTime;
  modalMsg.textContent = `Finshed in ${formatTime(elapsed)} with ${moves} moves. Score: ${scoreEl.textContent}`;
  modal.hidden = false;
}

newGameBtn.addEventListener("click", ()=>{
  newGame();
})

playAgainBtn.addEventListener("click", ()=>{
  newGame();
})

difficultyEl.addEventListener("click", (e)=>{
  gridSize=parseInt(e.target.value);
  newGame();
});

newGame();