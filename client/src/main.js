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
  const appDisplay = document.getElementById('app');

  if (loginForm) {
    displayLeaderboard(appDisplay);
    
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault(); 
      
      const nameInput = document.getElementById('player-name');
      const playerName = nameInput ? nameInput.value : 'Guest';
      
      localStorage.setItem('currentPlayer', playerName);
      
      console.log("Redirecting...");
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
  const currentQ = questions[gameState.currentIdx];

  if (!questionText || !answerContainer || !currentQ) return;

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
    document.getElementById('score').innerText = gameState.score;
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
  if (!container) return;
  try {
    const res = await fetch(`${baseURL}/leaderboard`);
    const data = await res.json();
    container.innerHTML = data.map(entry => 
      `<div class="entry"><strong>${entry.username}</strong>: ${entry.score}</div>`
    ).join('');
  } catch (err) {
    container.innerText = "Leaderboard Offline";
  }
}

function showEndScreen(screenId) {
  document.getElementById('screen-quiz').style.display = 'none';
  document.getElementById(screenId).style.display = 'block';
  const btnId = screenId === 'game-win' ? 'submit-score-win' : 'submit-score-lose';
  document.getElementById(btnId).onclick = submitScore;
}

async function submitScore() {
  const username = localStorage.getItem('currentPlayer') || 'Guest';
  await fetch(`${baseURL}/leaderboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, score: gameState.score })
  });
  window.location.assign('index.html');
}