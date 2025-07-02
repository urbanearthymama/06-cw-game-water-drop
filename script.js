// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval; // Timer interval variable
let timeLeft = 30; // Countdown time in seconds
let score = 0; // Track the player's score

// Difficulty settings
const DIFFICULTY_SETTINGS = {
    easy:   { time: 40, dropInterval: 1200, dropSpeed: 5, winScore: 15 },
    normal: { time: 30, dropInterval: 1000, dropSpeed: 4, winScore: 25 },
    hard:   { time: 20, dropInterval: 700,  dropSpeed: 2.7, winScore: 35 }
};

let currentDifficulty = 'normal';

// Sound effects
const collectSound = new Audio('sounds/collect.mp3');
const missSound = new Audio('sounds/miss.mp3');
const buttonSound = new Audio('sounds/button.mp3');
const winSound = new Audio('sounds/win.mp3');

// Utility to play a sound from start
function playSound(sound) {
    if (!sound) return;
    sound.currentTime = 0;
    sound.play();
}

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", () => {
    playSound(buttonSound);
    startGame();
});

// Listen for difficulty changes
const difficultySelect = document.getElementById('difficulty');
difficultySelect.addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    // Optionally, reset game state/UI here if needed
});

// Listen for restart button
document.getElementById("restart-btn").addEventListener("click", () => {
    playSound(buttonSound);
    restartGame();
});

function restartGame() {
    // Stop any running game
    clearInterval(timerInterval);
    clearInterval(dropMaker);
    // Remove all drops
    document.querySelectorAll('.water-drop').forEach(drop => drop.remove());
    // Reset UI and state
    gameRunning = false;
    startGame();
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  // Get difficulty settings
  const settings = DIFFICULTY_SETTINGS[currentDifficulty];

  gameRunning = true;
  timeLeft = settings.time; // Set timer based on difficulty
  score = 0; // Reset score
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = score;

  // Remove any leftover drops
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());

  // Reset milestones on new game
  shownMilestones = new Set();

  // Start countdown timer
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      clearInterval(dropMaker);
      gameRunning = false;
      // Optionally, show game over or reset UI here
    }
  }, 1000);

  // Create new drops at the interval for this difficulty
  dropMaker = setInterval(() => createDrop(settings.dropSpeed), settings.dropInterval);
}

// Milestone messages: {score, message}
const MILESTONES = [
    { score: 5, message: "Great start!" },
    { score: 10, message: "Halfway there!" },
    { score: 15, message: "Keep going!" },
    { score: 20, message: "Almost at the goal!" },
    { score: 25, message: "You did it!" }
];

// Track which milestones have been shown
let shownMilestones = new Set();

// Show milestone message overlay
function showMilestoneMessage(msg) {
    if (document.getElementById('milestone-message')) return;
    const overlay = document.createElement('div');
    overlay.id = 'milestone-message';
    overlay.style.position = 'fixed';
    overlay.style.top = '20%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, 0)';
    overlay.style.background = '#FFC907';
    overlay.style.color = '#222';
    overlay.style.padding = '18px 36px';
    overlay.style.borderRadius = '12px';
    overlay.style.fontSize = '2rem';
    overlay.style.fontFamily = "'Proxima Nova', 'Avenir', Arial, Helvetica, sans-serif, Georgia";
    overlay.style.boxShadow = '0 4px 24px rgba(0,0,0,0.15)';
    overlay.style.zIndex = 2000;
    overlay.style.pointerEvents = 'none';
    overlay.textContent = msg;
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.remove();
    }, 1400);
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  // Get difficulty settings
  const settings = DIFFICULTY_SETTINGS[currentDifficulty];

  gameRunning = true;
  timeLeft = settings.time; // Set timer based on difficulty
  score = 0; // Reset score
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = score;

  // Remove any leftover drops
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());

  // Reset milestones on new game
  shownMilestones = new Set();

  // Start countdown timer
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      clearInterval(dropMaker);
      gameRunning = false;
      // Optionally, show game over or reset UI here
    }
  }, 1000);

  // Create new drops at the interval for this difficulty
  dropMaker = setInterval(() => createDrop(settings.dropSpeed), settings.dropInterval);
}

function createDrop(dropSpeed = 4) {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Randomly decide if this is a bad drop (increase frequency: 1 in 3 chance)
  const isBadDrop = Math.random() < 1/3;
  if (isBadDrop) {
    drop.className = "water-drop bad-drop";
    // Set a brown-green-yellow color for bad drops
    drop.style.backgroundColor = '#b5a642'; // olive yellow
  } else {
    drop.className = "water-drop";
  }

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Assign points based on size (smaller = more points)
  // Example: 3 points for smallest, 2 for medium, 1 for largest
  let points = 1;
  if (size < 45) {
    points = 3;
  } else if (size < 60) {
    points = 2;
  }
  drop.dataset.points = points;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for dropSpeed seconds
  drop.style.animationDuration = `${dropSpeed}s`;

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Increase or decrease score when drop is clicked
  drop.addEventListener("click", () => {
    if (isBadDrop) {
      score -= 2;
      if (score < 0) score = 0;
      document.getElementById("score").textContent = score;
      playSound(missSound);
    } else {
      const points = parseInt(drop.dataset.points, 10) || 1;
      score += points;
      document.getElementById("score").textContent = score;
      playSound(collectSound);
      // Milestone check
      for (const milestone of MILESTONES) {
          if (score === milestone.score && !shownMilestones.has(milestone.score)) {
              showMilestoneMessage(milestone.message);
              shownMilestones.add(milestone.score);
          }
      }
    }
    drop.remove(); // This removes the drop when clicked
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    if (!isBadDrop) playSound(missSound);
    drop.remove(); // Clean up drops that weren't caught
  });
}

// Confetti celebration overlay
function showConfetti() {
    playSound(winSound);
    if (document.getElementById('confetti-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'confetti-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontSize = '5rem';
    overlay.style.zIndex = 1000;
    overlay.style.pointerEvents = 'none';
    overlay.innerText = '🎉🎊🎉';
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.remove();
    }, 2000);
}

// Patch score update logic to trigger confetti at winScore for current difficulty
const scoreSpan = document.getElementById('score');
let lastScore = 0;
const observer = new MutationObserver(() => {
    const score = parseInt(scoreSpan.textContent, 10);
    const winScore = DIFFICULTY_SETTINGS[currentDifficulty].winScore;
    if (score === winScore && lastScore < winScore) {
        showConfetti();
    }
    lastScore = score;
});
observer.observe(scoreSpan, { childList: true });
