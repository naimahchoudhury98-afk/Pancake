const baseURL = 'https://pancake-tx1r.onrender.com';
const triviaURL = 'https://opentdb.com/api.php?amount=20&category=9&difficulty=medium&type=multiple';

let questions = [];
let gameState = {
  currentIdx: 0,
  score: 0,
  lives: 5,
  freePassUsed: false,
  fiftyFiftyUsed: false
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = "none";
  });

  const target = document.getElementById(id);
  if (target) target.style.display = "block";
}


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('leaderboard-form');
  const quizPage = document.getElementById('screen-quiz');

 if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameInput = document.getElementById('player-name');
    const playerName = nameInput?.value || 'Guest';
    localStorage.setItem('currentPlayer', playerName);

    showScreen("screen-quiz");
    fetchTrivia();
    updateLivesUI();
  });
}


  if (quizPage) {
    fetchTrivia();
    updateLivesUI();
    
    const freePassBtn = document.getElementById("lifeline-free");
    if (freePassBtn) {
      freePassBtn.addEventListener("click", useFreePass);
    }

    const fiftyFiftyBtn = document.getElementById("lifeline-fiftyfifty");
    if (fiftyFiftyBtn) {
      fiftyFiftyBtn.addEventListener("click", useFiftyFifty);
    }
  }
});

async function fetchTrivia() {
  try {
    const response = await fetch(triviaURL);
    const data = await response.json();
    console.log(data)

    questions = data.results.map((item) => {
      const allAnswers = [...item.incorrect_answers];
      const correctIdx = Math.floor(Math.random() * 4);
      allAnswers.splice(correctIdx, 0, item.correct_answer);

      return {
        q: decodeHTML(item.question),
        a: allAnswers.map(ans => decodeHTML(ans)),
        correct: correctIdx
      };
    });

    loadQuestion();
  } catch (error) {
    console.error("Trivia load error:", error);
  }
}

function loadQuestion() {
  const questionText = document.getElementById('question-text');
  const answerContainer = document.getElementById('answers');
  const questionNumberEl = document.getElementById('question-number');

  const currentQ = questions[gameState.currentIdx];

  if (!questionText || !answerContainer || !currentQ) return;

  if (questionNumberEl) {
    questionNumberEl.innerText = `${gameState.currentIdx + 1} of ${questions.length}`;
  }

  questionText.innerText = currentQ.q;
  answerContainer.innerHTML = '';

  currentQ.a.forEach((ans, index) => {
    const btn = document.createElement('button');
    btn.className = 'pixel-button answer-btn';
    btn.innerText = ans;
    btn.style.visibility = 'visible';
    btn.onclick = () => checkAnswer(index);
    answerContainer.appendChild(btn);
  });
}

function useFiftyFifty() {
  if (gameState.fiftyFiftyUsed) return;

  const currentQ = questions[gameState.currentIdx];
  const buttons = document.querySelectorAll(".answer-btn");
  
  let wrongIndexes = [];
  for (let i = 0; i < currentQ.a.length; i++) {
    if (i !== currentQ.correct) {
      wrongIndexes.push(i);
    }
  }

  wrongIndexes.sort(() => Math.random() - 0.5);
  
  if (buttons[wrongIndexes[0]]) buttons[wrongIndexes[0]].style.visibility = "hidden";
  if (buttons[wrongIndexes[1]]) buttons[wrongIndexes[1]].style.visibility = "hidden";

  gameState.fiftyFiftyUsed = true;
  const fiftyBtn = document.getElementById("lifeline-fiftyfifty");
  if (fiftyBtn) {
    fiftyBtn.disabled = true;
    fiftyBtn.style.opacity = "0.5";
  }
}

function useFreePass() {
  if (gameState.freePassUsed) return;

  gameState.freePassUsed = true;
  const freeBtn = document.getElementById("lifeline-free");
  if (freeBtn) {
    freeBtn.disabled = true;
    freeBtn.style.opacity = "0.5";
  }
  
  nextStep();
}

function lockAnswersAndShowFeedback(selectedIndex) {
  const currentQ = questions[gameState.currentIdx];
  const buttons = document.querySelectorAll(".answer-btn");

  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === currentQ.correct) {
      btn.classList.add("correct");
    }
    if (idx === selectedIndex && selectedIndex !== currentQ.correct) {
      btn.classList.add("wrong");
    }
  });
}

function checkAnswer(index) {
  const currentQ = questions[gameState.currentIdx];
  lockAnswersAndShowFeedback(index);

  if (index === currentQ.correct) {
    gameState.score += 100;
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.innerText = gameState.score;
  } else {
    gameState.lives--;
    updateLivesUI();
  }

  setTimeout(() => {
    nextStep();
  }, 1000);
}

function nextStep() {
  gameState.currentIdx++;

  if (gameState.lives <= 0) {
    showEndScreen('ending');
  } else if (gameState.currentIdx >= questions.length) {
    showEndScreen('game-win');
  } else {
    loadQuestion();
  }
}

function updateLivesUI() {
  const livesEl = document.getElementById('lives-display');
  if (livesEl) livesEl.innerText = "♥".repeat(gameState.lives);
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

async function displayLeaderboard(container) {
  if (!container) return;
  try {
    const res = await fetch(`${baseURL}/leaderboard`);
    if (!res.ok) {
      container.innerText = "Leaderboard error";
      return;
    }
    const data = await res.json();
    container.innerHTML = data.map(entry =>
      `<div class="entry"><strong>${entry.username}</strong>: ${entry.score}</div>`
    ).join('');
  } catch (err) {
    container.innerText = "Leaderboard Offline";
  }
}

function ensureFinalStats(screenEl) {
  const username = localStorage.getItem('currentPlayer') || 'Guest';
  let stats = screenEl.querySelector('#final-stats');
  if (!stats) {
    stats = document.createElement('p');
    stats.id = 'final-stats';
    screenEl.appendChild(stats);
  }
  stats.innerText = `Player: ${username} | Score: ${gameState.score}`;
}

function showEndScreen(screenId) {
  document.getElementById("screen-quiz").style.display = "none";
  const screen = document.getElementById(screenId);
  screen.style.display = "block";

  ensureFinalStats(screen);

  const btnId = screenId === "game-win" ? "submit-score-win" : "submit-score-lose";
  const btn = document.getElementById(btnId);

  if (btn) {
    btn.onclick = async () => {
      await submitScore(); 
      window.location.assign('index.html');
    };
  }

  if (screenId === "game-win") {
    displayLeaderboard(document.getElementById("app-win"));
  } else {
    displayLeaderboard(document.getElementById("app-lose"));
  }
}

async function submitScore() {
  const usernameValue = localStorage.getItem('currentPlayer') || 'Guest';
  try {
    await fetch(`${baseURL}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameValue, score: gameState.score })
    });
  } catch (err) {
    console.log("Submit score error:", err);
  }
}