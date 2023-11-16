// DATA
const DEFAULT_TURNS = 5;
let turnsLeft = DEFAULT_TURNS;
let currentScore = 0;
let bonus = false;

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

// INITIALIZE VIEW
updateCurrentScore(currentScore);
updateTurn(turnsLeft);

// ABSTRACTION
// generate a random color
function generateColor() {
  let colors = [
    greenCircle,
    pinkSquare,
    blueSquare,
    redCircle,
    yellowCircle,
    brownSquare,
  ];
  let colorInt = Math.floor(Math.random() * colors.length);
  return colors[colorInt];
}

// creates a single cell, with the argument
// 'content' (a string) as content, and returns it
function createCell(content) {
  let cell = document.createElement("td");
  cell.setAttribute("id", content);
  console.log("id "+content);
  cell.innerText = generateColor();

  cell.addEventListener("click", onClickCell);

  return cell;
}

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
      let cell = createCell(content);
      row.appendChild(cell);
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

function isNumber(event) {
  if (isNaN(event.target.value)) {
    alert("Input is not a number. Try again.");
    event.target.value = "";
  }
}

function colorRedContent(event) {
  event.target.style.color = "red";
}

function colorBlueContent(event) {
  event.target.style.color = "blue";
}

function onClickCell(event) {
  let cell = event.target;
  //TODO: clear all other cells
  //mark cell on click
  console.log("id parsed " + parseId(cell.id));
  bonus = markAdjacentMatches(parseId(cell.id)[0], parseId(cell.id)[1]);
  var delayInMilliseconds = 500; //1 second

setTimeout(function() {
  //your code to be executed after 1 second
  clearMarkedCells();

  setTimeout(function() {
    //your code to be executed after 1 second
    fallDownUnmarked();

    setTimeout(function() {
      //your code to be executed after 1 second
      fillNewColors();
    }, delayInMilliseconds);
  }, delayInMilliseconds);

}, delayInMilliseconds);

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
  //TODO: forbid user to click other cells for now
}


// GAMING LOGIC FUNCTIONS
// mark the matched colors in the right
// stop when it finds a different color
function markRight(line, column) {
    console.log("mark right "+line+","+column);
  let increaseScore = 0;
  let colorToCheck = getCellColor(line + "," + column);
  let marked = true;
  while (++column < colsNumber && marked) {
    marked = false;
    if (getCellColor(line+","+column) === colorToCheck) {
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
    console.log("mark left "+line+","+column);
  let increaseScore = 0;
  let colorToCheck = getCellColor(line + "," + column);
  let marked = true;
  while (column > 0 && marked) {
    marked = false;
    column--;
    if (getCellColor(line+","+column) === colorToCheck) {
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
    console.log("mark up "+line+","+column);
  let increaseScore = 0;
  let colorToCheck = getCellColor(line + "," + column);
  let marked = true;
  while (line > 0 && marked) {
    marked = false;
    line--;
    if (getCellColor(line+","+column) === colorToCheck) {
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
    console.log("mark down "+line+","+column);
  let increaseScore = 0;
  let colorToCheck = getCellColor(line + "," + column);
  let marked = true;
  while (++line < rowsNumber && marked) {
    marked = false;
    if (getCellColor(line+","+column) === colorToCheck) {
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

// TODO: intermediary step - clear all marked cells
// TODO: to optmized, keep map ok markeds
function clearMarkedCells() {
  for (let i = rowsNumber - 1; i >= 0; i--) {
    for (let j = 0; j < colsNumber; j++) {
      if (isMarked(i+","+j)) {
        clearCell(i+","+j);
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
        if (isCleared(i+","+j) && !isCleared((i - 1)+","+j)) {
          console.log("swapp");
          let temp = getCell(i+","+j).cloneNode(true);
          // let temp = grid[i][j];
         copyCellColor(getCell((i-1)+","+j), getCell(i+","+j));
//          grid[i][j] = grid[i - 1][j];
         copyCellColor(temp, getCell((i-1)+","+j));
          // grid[i - 1][j] = temp;
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
        if (isCleared(i+","+j)) {
          console.log("fill");
          unmarkCell(i+","+j);
          getCell(i+","+j).innerText = generateColor();
          filled = true;
        }
      }
    }
  }
}


// GETTERS AND HELPERS
function parseId(id) {
    let splitted = id.split(",");
    let result = [splitted[0], splitted[1]];
    console.log("parse result "+result);
  return result;
}

function getCell(id) {
  return document.getElementById(id);
}

function markCell(id) {
  let cell = document.getElementById(id);
  cell.style.borderColor = "red";
  cell.style.borderWidth = "1px";
  cell.style.borderStyle = "solid";
}

function unmarkCell(id) {
  let cell = document.getElementById(id);
  cell.style.borderColor = "";
  cell.style.borderWidth = "";
  cell.style.borderStyle = "";
}

function clearCell(id) {
  let cell = document.getElementById(id);
  cell.innerText = "";
  cell.style.borderColor = "red";
  cell.style.borderWidth = "1px";
  cell.style.borderStyle = "solid";
}

function isMarked(id) {
  // console.log("get is marked "+id);
  
  let cell = document.getElementById(id);
  console.log(cell);
  return cell.style.borderColor === "red";
}

function isCleared(id) {
  // console.log("get is marked "+id);
  let cell = document.getElementById(id);
  console.log(cell);
  return cell.innerText === "";
}

function getCellColor(id) {
  console.log("get cell color "+id);
  let cell = document.getElementById(id);
  console.log(cell);
  return cell.innerText;
}

function copyCellColor(from, to) {
  to.innerText = from.innerText;
  to.style.borderColor = from.style.borderColor;
  to.style.borderWidth = from.style.borderWidth;
  to.style.borderStyle = from.style.borderStyle;

  console.log("from "+from);
  console.log("to "+to);
}

function updateCurrentScore(newScore) {
  let scoreView = document.getElementById("score");
  scoreView.innerText = newScore+" points";
}

function updateTurn(newTurns) {
  let turnsView = document.getElementById("turns");
  turnsView.innerText = newTurns+"  turns";
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
        getCell(i+","+j).removeEventListener("click", onClickCell);
    }
  }
}