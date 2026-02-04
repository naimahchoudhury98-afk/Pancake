const baseURL = 'http://localhost:8080';
const triviaURL = 'https://opentdb.com/api.php?amount=20&category=9&difficulty=medium&type=multiple';

let questions = [];
let gameState = { currentIdx: 0, score: 0, lives: 5 };

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('leaderboard-form');
  const quizPage = document.getElementById('screen-quiz');

  if (loginForm) {
    displayLeaderboard(document.getElementById('app')); 
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault(); 
      localStorage.setItem('currentPlayer', document.getElementById('player-name').value);
      window.location.assign('./quiz.html'); 
    });
  }

  if (quizPage) {
    fetchTrivia();
    updateLivesUI();
  }
});

async function fetchTrivia() {
  const response = await fetch(triviaURL);
  const data = await response.json();
  questions = data.results.map((item) => {
    const allAnswers = [...item.incorrect_answers];
    const correctIdx = Math.floor(Math.random() * 4);
    allAnswers.splice(correctIdx, 0, item.correct_answer);
    return { q: decodeHTML(item.question), a: allAnswers.map(decodeHTML), correct: correctIdx };
  });
  loadQuestion();
}

function loadQuestion() {
  const currentQ = questions[gameState.currentIdx];
  if (!currentQ) return;

  document.getElementById('question-number').innerText = gameState.currentIdx + 1;
  document.getElementById('question-text').innerText = currentQ.q;
  
  const container = document.getElementById('answers');
  container.innerHTML = '';
  currentQ.a.forEach((ans, index) => {
    const btn = document.createElement('button');
    btn.className = 'pixel-button answer-btn';
    btn.innerText = ans;
    btn.onclick = () => {
      if (index === currentQ.correct) {
        gameState.score += 100;
        document.getElementById('score').innerText = gameState.score;
      } else {
        gameState.lives--;
        updateLivesUI();
      }
      nextStep();
    };
    container.appendChild(btn);
  });
}

function nextStep() {
  gameState.currentIdx++;
  if (gameState.lives <= 0) showEndScreen('ending');
  else if (gameState.currentIdx >= questions.length) showEndScreen('game-win');
  else loadQuestion();
}

function updateLivesUI() {
  const el = document.getElementById('lives-display');
  if (el) el.innerText = "♥".repeat(Math.max(0, gameState.lives));
}

async function displayLeaderboard(container) {
  if (!container) return;
  const res = await fetch(`${baseURL}/leaderboard`);
  const data = await res.json();
  container.innerHTML = data.map(entry => 
    `<div class="entry"><strong>${entry.username}</strong>: ${entry.score}</div>`
  ).join('');
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
  document.getElementById('screen-quiz').style.display = 'none';
  document.getElementById(screenId).style.display = 'block';
  
  const container = document.querySelector(`#${screenId} .leaderboard-container`);
  displayLeaderboard(container);

  const btnId = screenId === 'game-win' ? 'submit-score-win' : 'submit-score-lose';
  document.getElementById(btnId).onclick = submitScore;
}

async function submitScore() {
  await fetch(`${baseURL}/leaderboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: localStorage.getItem('currentPlayer'), score: gameState.score })
  });
  window.location.assign('./index.html');
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
