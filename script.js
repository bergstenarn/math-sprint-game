// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let wrongFirstNumber = 0;
let secondNumber = 0;
let wrongSecondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

// Refresh splash page best scores
function bestScoresToDOM() {
  bestScores.forEach((bestScore, i) => {
    bestScore.textContent = `${bestScoreArray[i].bestScore}s`;
  });
}

// Check local storage for best scores and set bestScoreArray
function getSavedBestScores() {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

// Update best score array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    // Select correct best score to update
    if (score.questions == questionAmount) {
      // Return best score as number with one decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      // Update if the new final score is less or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  // Update splash page
  bestScoresToDOM();
  // Save to local storage
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
}

// Reset game
function playAgain() {
  gamePage.addEventListener("click", startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

// Show score page
function showScorePage() {
  // Show play again button after one second
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 2000);
  gamePage.hidden = true;
  scorePage.hidden = false;
}

// Format and display time in DOM
function scoresToDOM() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  showScorePage();
}

// Stop timer, process results, go to score page
function checkTime() {
  console.log(timePlayed);
  if (playerGuessArray.length >= parseInt(questionAmount)) {
    console.log("player guess array:", playerGuessArray);
    clearInterval(timer);
    // Check for wrong guesses and add penalty time
    penaltyTime = playerGuessArray.reduce((total, guess, i) => {
      // Add penalty only if the guess is wrong
      return total + (guess === equationsArray[i].evaluated ? 0 : 3.0);
    }, 0);
    // Increase penalty if the player tries to cheat
    const allGuessesAreEqual = new Set(playerGuessArray).size === 1;
    penaltyTime +=
      timePlayed < questionAmount * 0.5 || allGuessesAreEqual
        ? questionAmount * 2
        : 0;
    finalTime = timePlayed + penaltyTime;
    console.log(
      "time:",
      timePlayed,
      "penalty:",
      penaltyTime,
      "final",
      finalTime
    );
    scoresToDOM();
  }
}

// Add a tenth of a second to timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// Start timer when game page is clicked
function startTimer() {
  // Reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
}

// Scroll and store user selection in player guess array
function select(guessedTrue) {
  // Scroll 80 pixels
  valueY += 80;
  itemContainer.scroll(0, valueY);
  // Add player guess to array
  return guessedTrue
    ? playerGuessArray.push("true")
    : playerGuessArray.push("false");
}

// Displays game page
function showGamePage() {
  countdownPage.hidden = true;
  gamePage.hidden = false;
  itemContainer.scrollTo({ top: 0, behavior: "instant" });
}

// Get random number up to a max number
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations =
    getRandomInt(questionAmount / 2) + Math.ceil(questionAmount / 4);
  console.log("Correct equations:", correctEquations);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  console.log("Wrong equations:", wrongEquations);
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    wrongFirstNumber = firstNumber === 9 ? firstNumber - 1 : firstNumber + 1;
    secondNumber = getRandomInt(9);
    wrongSecondNumber =
      secondNumber === 9 ? secondNumber - 1 : secondNumber + 1;
    const equationValue = firstNumber * secondNumber;
    const wrongEquationsValue = equationValue === 0 ? 1 : equationValue - 1;
    wrongFormat[0] = `${firstNumber} x ${wrongSecondNumber} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${wrongEquationsValue}`;
    wrongFormat[2] = `${wrongFirstNumber} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Add equations to DOM
function equationsToDOM() {
  equationsArray.forEach((equation) => {
    // Item
    const item = document.createElement("div");
    item.classList.add("item");
    // Equation text
    const equationText = document.createElement("h1");
    equationText.textContent = equation.value;
    // Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

// Display 3,2,1,GO!
async function countdownStart() {
  countdown.textContent = 3;
  for (let i = 2; i >= 0; i--) {
    setTimeout(() => {
      countdown.textContent = i === 0 ? "GO!" : i;
    }, (3 - i) * 1000);
  }
}

// Navigate from splash page to countdown page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
  setTimeout(showGamePage, 4000);
}

// Get the value from selected radio button
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
}

// Form that decides amount of questions
function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  console.log("Question amount:", questionAmount);
  if (questionAmount) {
    showCountdown();
    // Uncheck radio buttons
    radioInputs.forEach((radioInput) => {
      radioInput.checked = false;
    });
    // Remove selected label styling
    radioContainers.forEach((radioEl) => {
      radioEl.classList.remove("selected-label");
    });
  } else {
    alert("Make a selection.");
  }
}

startForm.addEventListener("click", () => {
  radioContainers.forEach((radioEl) => {
    // Remove selected label styling
    radioEl.classList.remove("selected-label");
    // Add it back if radio input is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add("selected-label");
    }
  });
});

// Event listeners
startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);

// On load
getSavedBestScores();
