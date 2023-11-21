// DATA
const DEFAULT_TURNS = 5;
let turnsLeft = DEFAULT_TURNS;
let currentScore = 0;
let bonus = false;
const grid = new Map();

// Color/image options
const blueJutsu = "img/jutsu32px.png";
const brownKatana = "img/katana32px.png";
const greenKunai = "img/kunai32px.png";
const redNinja = "img/ninja32px.png";
const yellowNunchaku = "img/nunchaku32px.png";
const purpleStar = "img/star32px.png";

let rowsNumber = 0;
let colsNumber = 0;

// HTML elements
let rowInput = document.getElementById("rowInputID");
let columnInput = document.getElementById("columnInputID");
let fightSpiritSoundEffect = new Audio(
  "audio/Naruto - The Rising Fighting Spirit.mp3"
);
let bonusSoundEffect = new Audio("audio/dattebayo.mp3");
let scoreSoundEffect = new Audio("audio/smoke_bomb.mp3");
let resetButton = document.getElementById("resetButton");

// Setting animation variables
let animating = false;
const clearDelayInMilliseconds = 500;
const fallDownDelayInMilliseconds = 250;
const fillDelayInMilliseconds = 250;

/** MAIN GAME LOGIC */
// INITIALIZE
updateCurrentScore(currentScore);
updateTurn(turnsLeft);

// ADD LISTENERS
rowInput.addEventListener("focusout", validateNumber);
columnInput.addEventListener("focusout", validateNumber);
resetButton.addEventListener("click", resetGame);

// Set background music to play in loop
fightSpiritSoundEffect.loop = true;

// EVENT HANDLERS
/**
 * This function holds the game logic.
 * When user clicks a cell:
 * - Mark the cell and the adjacent matches
 * - Clear the marked cells
 * - Fill with new colors
 * - Apply bonus rules
 * - Update score, turns and bonus message
 * - Game over, if applicable
 * @param {*} event
 */
function onClickCell(event) {
  // Check if there is still animation from the previous "click" event
  // Do nothing until previous animation is done
  if (animating) return;
  animating = true;

  let cell = event.target;
  //mark cell and play score sound on click
  scoreSoundEffect.play();
  bonus = markAdjacentMatches(parseId(cell.id)[0], parseId(cell.id)[1]);

  // Apply delay between each step of the game scoring to give an animation effect
  setTimeout(function () {
    clearMarkedCells();
    setTimeout(function () {
      fallDownUnmarked();
      setTimeout(function () {
        fillNewColors();
        animating = false;
        // Delay to display game over after user sees the updated score
        setTimeout(() => {
          if (turnsLeft === 0) {
            gameOver();
          }
        }, 1000);
      }, fillDelayInMilliseconds);
    }, fallDownDelayInMilliseconds);
  }, clearDelayInMilliseconds);
  turnsLeft--;

  // Update score and turns on the screen
  updateTurn(turnsLeft);
  updateBonusMessage(bonus);
  // Reset bonus value to be computed in the next round
  setTimeout(() => {
    bonus = false;
  }, 4000);
}

/**
 * Event handler for the fields to input the rows and the columns number.
 * Check if they are valid numbers from 1 to 100.
 * @param {*} event
 */
function validateNumber(event) {
  if (isNaN(event.target.value)) {
    alert("Input is not a number. Try again.");
    event.target.value = "";
  } else if (event.target.value > 100) {
    alert("Input is too big. Try a number smaller than or equal to 100.");
    event.target.value = "";
  } else if (event.target.value < 1) {
    alert("Input must be a positive non-zero number.");
    event.target.value = "";
  }
}

/**
 * Event handler called when user press the RESET button.
 * - Removes the GameOver message
 * - Resets the turnsLeft and the score, and updates the UI accordingly
 * - Inject the game grid
 * - Then, starts the background music
 */
function resetGame() {
  removeGameOverMessage();

  turnsLeft = DEFAULT_TURNS;
  updateTurn(turnsLeft);
  currentScore = 0;
  updateCurrentScore(currentScore);

  // As user is able to press the RESET button, before inputing the rows and columns
  // Check if the input is valid before starting the game
  let rows = parseInt(document.getElementById("rowInputID").value);
  let columns = parseInt(document.getElementById("columnInputID").value);
  if (isNaN(rows) || isNaN(columns)) {
    alert("Please, input amount of rows and amount of columns.");
  } else {
    injectTable("gameGrid", "rowInputID", "columnInputID");
    fightSpiritSoundEffect.play();
  }
}

// GAMING LOGIC FUNCTIONS: functions called by the onClickCell
// mark the matched colors in the right
// stop when it finds a different color
function markRight(line, column) {
  //console.log("mark right " + line + "," + column);
  let increaseScore = 0;
  let colorToCheck = getCellColor(line + "," + column);
  let marked = true;
  while (++column < colsNumber && marked) {
    marked = false;
    if (getCellColor(line + "," + column) === colorToCheck) {
      markCell(line + "," + column);
      marked = true;
      increaseScore++;
    }
  }

  return increaseScore;
}

// mark the matched colors in the left
// stop when it finds a different color
function markLeft(line, column) {
  //console.log("mark left " + line + "," + column);
  let increaseScore = 0;
  let colorToCheck = getCellColor(line + "," + column);
  let marked = true;
  while (column > 0 && marked) {
    marked = false;
    column--;
    if (getCellColor(line + "," + column) === colorToCheck) {
      markCell(line + "," + column);
      marked = true;
      increaseScore++;
    }
  }

  return increaseScore;
}

// mark the matched colors in the up direction
// stop when it finds a different color
function markUp(line, column) {
  //console.log("mark up " + line + "," + column);
  let increaseScore = 0;
  let colorToCheck = getCellColor(line + "," + column);
  let marked = true;
  while (line > 0 && marked) {
    marked = false;
    line--;
    if (getCellColor(line + "," + column) === colorToCheck) {
      markCell(line + "," + column);
      marked = true;
      increaseScore++;
    }
  }

  return increaseScore;
}

// mark the matched colors in the down direction
// stop when it finds a different color
function markDown(line, column) {
  //console.log("mark down " + line + "," + column);
  let increaseScore = 0;
  let colorToCheck = getCellColor(line + "," + column);
  let marked = true;
  while (++line < rowsNumber && marked) {
    marked = false;
    if (getCellColor(line + "," + column) === colorToCheck) {
      markCell(line + "," + column);
      marked = true;
      increaseScore++;
    }
  }

  return increaseScore;
}

// mark color matches in the 4 directions
// keep track of the score
// apply bonus rules
function markAdjacentMatches(line, column) {
  // mark adjacents
  let increaseScore = 0;
  increaseScore += markLeft(line, column);
  increaseScore += markRight(line, column);
  increaseScore += markUp(line, column);
  increaseScore += markDown(line, column);
  markCell(line + "," + column);
  increaseScore++;

  currentScore += increaseScore;
  updateCurrentScore(currentScore);

  if (increaseScore > 3) {
    turnsLeft++;
    return true;
  } else {
    return false;
  }
}

function clearMarkedCells() {
  for (let i = rowsNumber - 1; i >= 0; i--) {
    for (let j = 0; j < colsNumber; j++) {
      if (isMarked(i + "," + j)) {
        clearCell(i + "," + j);
      }
    }
  }
}

// the marks in the columns should bubble up to the surface
function fallDownUnmarked() {
  //console.log("Fall down");
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = rowsNumber - 1; i > 0; i--) {
      for (let j = 0; j < colsNumber; j++) {
        if (isCleared(i + "," + j) && !isCleared(i - 1 + "," + j)) {
          //console.log("swapp");
          let temp = getCellColor(i + "," + j);
          setCellColor(i + "," + j, getCellColor(i - 1 + "," + j));
          setCellColor(i - 1 + "," + j, temp);
          swapped = true;
        }
      }
    }
  }
}

// replace all the x marks with new colors
function fillNewColors() {
  //console.log("Fill colors");
  let filled = true;
  while (filled) {
    filled = false;
    for (let i = rowsNumber - 1; i >= 0; i--) {
      for (let j = 0; j < colsNumber; j++) {
        if (isCleared(i + "," + j)) {
          //console.log("fill");
          unmarkCell(i + "," + j);
          setCellColor(i + "," + j, generateColor());
          filled = true;
        }
      }
    }
  }
}

// GAME GRID - GETTERS AND HELPERS
function parseId(id) {
  let splitted = id.split(",");
  let result = [splitted[0], splitted[1]];
  //  console.log("parse result "+result);
  return result;
}

function getCell(id) {
  return document.getElementById(id);
}

function markCell(id) {
  grid.get(id).markCell();
}

function unmarkCell(id) {
  grid.get(id).unmarkCell();
}

function clearCell(id) {
  grid.get(id).clearCell();
}

function isMarked(id) {
  return grid.get(id).marked;
}

function isCleared(id) {
  return grid.get(id).cleared;
}

function getCellNode(id) {
  return grid.get(id).getCellNode();
}

function getCellColor(id) {
  //console.log("get cell color " + id);
  return grid.get(id).getCellColor();
}

function setCellColor(id, newColor) {
  grid.get(id).setColor(newColor);
}

function removeClickListeners() {
  for (let i = rowsNumber - 1; i >= 0; i--) {
    for (let j = 0; j < colsNumber; j++) {
      grid.get(i + "," + j).removeClickListener();
    }
  }
}

// generate a random color
function generateColor() {
  let colors = [
    greenKunai,
    purpleStar,
    blueJutsu,
    redNinja,
    yellowNunchaku,
    brownKatana,
  ];
  let colorInt = Math.floor(Math.random() * colors.length);
  return colors[colorInt];
}

/** ABSTRACT TABLE VIEW */
/**
 * Reads amount of rows and columns, generates the table using createTable and
 * add the table to the fetched HTML element.
 * @param {*} anID The id of the HTML element where to inject the table
 * @param {*} rowInputID The id of the input field for the number of rows
 * @param {*} columnInputID The if of the input field for the number of columns
 * @returns false if the column and row number is invalid, false otherwise.
 */
function injectTable(anID, rowInputID, columnInputID) {
  let rows = parseInt(document.getElementById(rowInputID).value);
  let columns = parseInt(document.getElementById(columnInputID).value);
  let div = document.getElementById(anID);
  div.innerHTML = "";
  let table = createTable(rows, columns);
  div.appendChild(table);
}

/**
 * Creates the table. It calls createRow and createCell
 * @param {*} rows The number of rows in the table
 * @param {*} columns The number of columns in the table
 * @returns the table HTML element
 */
function createTable(rows, columns) {
  rowsNumber = rows;
  colsNumber = columns;

  let table = document.createElement("table");
  for (let i = 0; i < rows; i++) {
    let row = createRow();
    for (let j = 0; j < columns; j++) {
      let content = i + "," + j;
      let cell = new Cell(content, onClickCell); //createCell(content);
      grid.set(content, cell);
      row.appendChild(cell.cellNode);
    }
    table.appendChild(row);
  }

  table.style.borderColor = "black";
  table.style.borderWidth = "2px";
  table.style.borderStyle = "solid";
  return table;
}

/**
 * Creates a single row
 * @returns the row HTML element
 */
function createRow() {
  let row = document.createElement("tr");
  return row;
}

// ABSTRACT A CELL
/**
 * This class defines a Cell as a td HTML element with a Image child.
 * It works as a level of abstraction.
 * It stores properties like color, marked, and cleared to avoid direct access
 * to the HTML elements.
 */
class Cell {
  /**
   * Constructor of a cell will:
   * - store the id
   * - create the td and the img
   * - Add the listener
   * - set random color/image
   * @param {*} id the id is a string in the format (line,column)
   * @param {*} onClickCell the click event handler function
   */
  constructor(id, onClickCell) {
    this.id = id;
    this.onClickCell = onClickCell;

    this.cellNode = this.createCell(id);
    this.color = generateColor();
    this.setColor(this.color);
    this.marked = false;
    this.cleared = false;
  }

  // creates a single cell, with the argument
  // 'id' (a string) as id, and returns it
  createCell(id) {
    let cell = document.createElement("td");
    cell.setAttribute("id", id);
    cell.addEventListener("click", this.onClickCell);

    let img = document.createElement("img");
    cell.appendChild(img);
    // pass event to the cell
    img.addEventListener("click", this.imgListener);

    return cell;
  }

  /**
   * A getter to abstract the color without direct access to the HTML element
   * @returns the current color
   */
  getCellColor() {
    return this.color;
  }

  /**
   * Assigns a new color/image by changing the src of the image
   * @param {*} newColor The color/image to assign to the cell
   */
  setColor(newColor) {
    // model
    this.color = newColor;
    this.cleared = this.color === "";
    // view
    let img = this.cellNode.firstChild;
    img.src = newColor;
  }

  /**
   * Draw a red border to a marked cell
   */
  markCell() {
    this.marked = true;
    this.cellNode.style.borderColor = "red";
    this.cellNode.style.borderWidth = "1px";
    this.cellNode.style.borderStyle = "solid";
  }

  /**
   * Removes the border from a marked cell
   */
  unmarkCell() {
    this.marked = false;
    this.cellNode.style.borderColor = "";
    this.cellNode.style.borderWidth = "";
    this.cellNode.style.borderStyle = "";
  }

  /**
   * Remove image/color from a cell
   */
  clearCell() {
    this.cleared = true;
    this.setColor("");
    this.unmarkCell();
  }

  /**
   * The image listener will throw its parent click event
   * @param {*} event
   */
  imgListener(event) {
    event.target.parentNode.click();
  }

  /**
   * Removing the click listener from both the td and the img elements
   */
  removeClickListener() {
    this.cellNode.removeEventListener("click", this.onClickCell);
    this.cellNode.firstChild.removeEventListener("click", this.imgListener);
  }
}

// GAME STATUS: functions to update status info in the user interface
function updateCurrentScore(newScore) {
  let scoreView = document.getElementById("score");
  scoreView.innerText = newScore;
}

function updateTurn(newTurns) {
  let turnsView = document.getElementById("turns");
  turnsView.innerText = newTurns;
}

function updateBonusMessage(bonus) {
  let bonusMessage = bonus ? "You got a bonus turn! " : "";
  let bonusView = document.getElementById("bonus");
  bonusView.innerText = bonusMessage;
  if (bonus) {
    bonusSoundEffect.play();
  }
}

function gameOver() {
  fightSpiritSoundEffect.pause();
  removeClickListeners();
  // clear the game grid
  let parent = document.getElementById("gameGrid");
  parent.innerHTML = "";

  // add game over message
  let gameOverMessage = document.createElement("p");
  gameOverMessage.setAttribute("id", "gameOverMessage");
  gameOverMessage.innerText = "Game Over!";
  parent.appendChild(gameOverMessage);
}

function removeGameOverMessage() {
  let gameOverMessage = document.getElementById("gameOverMessage");
  if (gameOverMessage) {
    let parent = document.getElementById("gameGrid");
    parent.removeChild(gameOverMessage);
  }
}

// SOUND OPTIONS
const turnOffMusic = "Mute music";
const turnOnMusic = "Unmute music";
const turnOnEffect = "Unmute Sound Effect";
const turnOffEffect = "Mute Sound Effect";

let musicOn = true;
const musicButton = document.getElementById("musicControl");
musicButton.innerText = turnOffMusic;

let effectOn = true;
const soundEffectButton = document.getElementById("soundEffectControl");
soundEffectButton.innerText = turnOffEffect;

musicButton.addEventListener("click", () => {
  if (musicOn) {
    musicButton.innerText = turnOnMusic;
    fightSpiritSoundEffect.muted = true;
    musicOn = false;
  } else {
    musicButton.innerText = turnOffMusic;
    fightSpiritSoundEffect.muted = false;
    musicOn = true;
  }
});

soundEffectButton.addEventListener("click", () => {
  if (effectOn) {
    soundEffectButton.innerText = turnOnEffect;
    bonusSoundEffect.muted = true;
    scoreSoundEffect.muted = true;
    effectOn = false;
  } else {
    soundEffectButton.innerText = turnOffEffect;
    bonusSoundEffect.muted = false;
    scoreSoundEffect.muted = false;
    effectOn = true;
  }
});
