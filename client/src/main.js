const baseURL = 'http://localhost:8080';
const triviaURL = 'https://opentdb.com/api.php?amount=20&category=9&difficulty=medium&type=multiple';

let questions = [];
let gameState = {
  currentIdx: 0,
  score: 0,
  lives: 5
};

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('leaderboard-form');
  const quizPage = document.getElementById('screen-quiz');

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameInput = document.getElementById('player-name');
      const playerName = nameInput?.value || 'Guest';

      localStorage.setItem('currentPlayer', playerName);
      window.location.assign('./quiz.html');
    });
  }

  if (quizPage) {
    fetchTrivia();
    updateLivesUI();
  }
});

async function fetchTrivia() {
  try {
    const response = await fetch(triviaURL);
    const data = await response.json();

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
  const questionNumberEl = document.getElementById('question-number')

  const currentQ = questions[gameState.currentIdx];

  if (!questionText || !answerContainer || !currentQ) return;

    if (questionNumberEl) {
    questionNumberEl.innerText = 
      `${gameState.currentIdx + 1} of ${questions.length}`;
  }

  questionText.innerText = currentQ.q;
  answerContainer.innerHTML = '';

  currentQ.a.forEach((ans, index) => {
    const btn = document.createElement('button');
    btn.className = 'pixel-button answer-btn';
    btn.innerText = ans;
    btn.onclick = () => checkAnswer(index);
    answerContainer.appendChild(btn);
  });
}

function checkAnswer(index) {
  const currentQ = questions[gameState.currentIdx];

  if (index === currentQ.correct) {
    gameState.score += 100;
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.innerText = gameState.score;
  } else {
    gameState.lives--;
    updateLivesUI();
  }

  nextStep();
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
  if (!container) {
    console.log("Leaderboard container not found on this screen");
    return;
  }

  try {
    const res = await fetch(`${baseURL}/leaderboard`);

    if (!res.ok) {
      const text = await res.text();
      console.log("Leaderboard fetch failed:", res.status, text);
      container.innerText = "Leaderboard error";
      return;
    }

    const data = await res.json();

    container.innerHTML = data.map(entry =>
      `<div class="entry"><strong>${entry.username}</strong>: ${entry.score}</div>`
    ).join('');
  } catch (err) {
    console.log("Leaderboard error:", err);
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
      if (screenId === "game-win") displayLeaderboard(document.getElementById("app-win"));
      if (screenId === "ending") displayLeaderboard(document.getElementById("app-lose"));

      window.location.assign('index.html');
    };
  }

  if (screenId === "game-win") {
    displayLeaderboard(document.getElementById("app-win"));
  } else if (screenId === "ending") {
    displayLeaderboard(document.getElementById("app-lose"));
  }
}

async function submitScore() {
  const username = localStorage.getItem('currentPlayer') || 'Guest';

  try {
    const res = await fetch(`${baseURL}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, score: gameState.score })
    });

    if (!res.ok) {
      const text = await res.text();
      console.log("Submit score failed:", res.status, text);
    }
  } catch (err) {
    console.log("Submit score error:", err);
  }
}
