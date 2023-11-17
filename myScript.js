// DATA
const DEFAULT_TURNS = 5;
let turnsLeft = DEFAULT_TURNS;
let currentScore = 0;
let bonus = false;
const grid = new Map();

// Using extended unicodes to display different colors and shapes
// source: https://www.gaijin.at/en/infos/unicode-character-table-geometry
const greenCircle = "\u{1F7E2}";
const pinkSquare = "\u{1F7EA}";
const blueSquare = "\u{1F7E6}";
const redCircle = "\u{1F7E0}";
const yellowCircle = "\u{1F7E1}";
const brownSquare = "\u{1F7EB}";

const blueJutsu = "img/jutsu32px.png";
const brownKatana = "img/katana32px.png";
const greenKunai = "img/kunai32px.png";
const redNinja = "img/ninja32px.png";
const yellowNunchaku = "img/nunchaku32px.png";
const purpleStar = "img/star32px.png";

let rowsNumber = 0;
let colsNumber = 0;

// ABSTRACTION
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

class Cell {
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

  getCellColor() {
    return this.color;
  }

  setColor(newColor) {
    // model
    this.color = newColor;
    this.cleared = this.color === "";
    // view
    let img = this.cellNode.firstChild;
    img.src = newColor;
  }

  isColorMatch(otherColor) {
    console.log("IS COLOR MATCH? " + this.color + " and " + otherColor);
    return this.color === otherColor;
  }

  markCell() {
    console.log("MARK CELL CLASS");
    this.marked = true;
    this.cellNode.style.borderColor = "red";
    this.cellNode.style.borderWidth = "1px";
    this.cellNode.style.borderStyle = "solid";
  }

  unmarkCell() {
    this.marked = false;
    this.cellNode.style.borderColor = "";
    this.cellNode.style.borderWidth = "";
    this.cellNode.style.borderStyle = "";
  }

  clearCell() {
    this.cleared = true;
    this.setColor("");
    this.unmarkCell();
  }

  imgListener(event) {
    event.target.parentNode.click();
  }

  removeClickListener() {
    this.cellNode.removeEventListener("click", this.onClickCell);
    this.cellNode.firstChild.removeEventListener("click", this.imgListener);
  }
}

/** ABSTRACT TABLE VIEW */
// creates a single row and returns it
function createRow() {
  let row = document.createElement("tr");
  return row;
}

// creates the table, using createRow and
// createCell, and returns it
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

// reads amount of rows and colums from the input fields with IDs rowInputID and columnInputID;
// generates the table using createTable; fetches the HTML element where to
// inject the table based on anID; adds the table to the fetched HTML element
function injectTable(anID, rowInputID, columnInputID) {
  turnsLeft = DEFAULT_TURNS;
  updateTurn(turnsLeft);
  currentScore = 0;
  updateCurrentScore(currentScore);

  let div = document.getElementById(anID);
  div.innerHTML = "";
  let rows = document.getElementById(rowInputID).value;
  let columns = document.getElementById(columnInputID).value;
  let table = createTable(rows, columns);
  div.appendChild(table);
}

function validateNumber(event) {
  if (event.target.value === "") {
    // Do nothing
    return;
  }
  if (isNaN(event.target.value)) {
    alert("Input is not a number. Try again.");
    event.target.value = "";
  }

  if (event.target.value > 100) {
    alert("Input is too big. Try a number smaller than or equal to 100.");
    event.target.value = "";
  } else if (event.target.value < 1) {
    alert("Input must be a positive non-zero number.");
    event.target.value = "";
  }
}

/** MAIN GAME LOGIC */
// INITIALIZE
updateCurrentScore(currentScore);
updateTurn(turnsLeft);
// ADD LISTENERS
let rowInput = document.getElementById("rowInputID");
rowInput.addEventListener("focusout", validateNumber);
let columnInput = document.getElementById("columnInputID");
columnInput.addEventListener("focusout", validateNumber);
let resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", () => {
  injectTable("gameGrid", "rowInputID", "columnInputID");
});
let animating = false;
const clearDelayInMilliseconds = 500;
const fallDownDelayInMilliseconds = 250;
const fillDelayInMilliseconds = 250;

function onClickCell(event) {
  if (animating) return;
  animating = true;
  let cell = event.target;
  //mark cell on click
  console.log("id parsed " + parseId(cell.id));
  bonus = markAdjacentMatches(parseId(cell.id)[0], parseId(cell.id)[1]);

  setTimeout(function () {
    //your code to be executed after 1 second
    clearMarkedCells();

    setTimeout(function () {
      //your code to be executed after 1 second
      fallDownUnmarked();

      setTimeout(function () {
        //your code to be executed after 1 second
        fillNewColors();
        animating = false;
      }, fillDelayInMilliseconds);
    }, fallDownDelayInMilliseconds);
  }, clearDelayInMilliseconds);

  turnsLeft--;
  updateTurn(turnsLeft);
  updateBonusMessage(bonus);
  setTimeout(() => {
    bonus = false;
    // updateBonusMessage(bonus);
  }, 4000);

  if (turnsLeft === 0) {
    gameOver();
  }
}

// GAMING LOGIC FUNCTIONS
// mark the matched colors in the right
// stop when it finds a different color
function markRight(line, column) {
  console.log("mark right " + line + "," + column);
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
  console.log("mark left " + line + "," + column);
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
  console.log("mark up " + line + "," + column);
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
  console.log("mark down " + line + "," + column);
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

// TODO: to optmized, keep map of markeds
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
  console.log("Fall down");
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = rowsNumber - 1; i > 0; i--) {
      for (let j = 0; j < colsNumber; j++) {
        if (isCleared(i + "," + j) && !isCleared(i - 1 + "," + j)) {
          console.log("swapp");
          let temp = getCellColor(i + "," + j); //getCell(i+","+j).cloneNode(true);
          setCellColor(i + "," + j, getCellColor(i - 1 + "," + j));
          //         copyCellColor(getCell((i-1)+","+j), getCell(i+","+j));
          setCellColor(i - 1 + "," + j, temp);
          //         copyCellColor(temp, getCell((i-1)+","+j));
          swapped = true;
        }
      }
    }
  }
}

// replace all the x marks with new colors
function fillNewColors() {
  console.log("Fill colors");
  let filled = true;
  while (filled) {
    filled = false;
    for (let i = rowsNumber - 1; i >= 0; i--) {
      for (let j = 0; j < colsNumber; j++) {
        if (isCleared(i + "," + j)) {
          console.log("fill");
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
  console.log("get cell color " + id);
  return grid.get(id).getCellColor();
}

function setCellColor(id, newColor) {
  grid.get(id).setColor(newColor);
}

// GAME STATUS
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
}

function gameOver() {
  // todo: display game over message
  let turnsView = document.getElementById("turns");
  turnsView.innerText = "GAME OVER";
  removeClickListeners();
}

function removeClickListeners() {
  for (let i = rowsNumber - 1; i >= 0; i--) {
    for (let j = 0; j < colsNumber; j++) {
      grid.get(i + "," + j).removeClickListener();
    }
  }
}
