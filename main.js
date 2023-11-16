// DATA
let turnsLeft = 3;
let currentScore = 0;
let grid = [];
let n = 5;
let bonus = false;
// Using extended unicodes to display different colors and shapes
// source: https://www.gaijin.at/en/infos/unicode-character-table-geometry
const greenCircle = "\u{1F7E2}";
const pinkSquare ="\u{1F7EA}";
const blueSquare = "\u{1F7E6}";
const redCircle = "\u{1F7E0}";
const yellowCircle = "\u{1F7E1}";
const brownSquare = "\u{1F7EB}";

// ABSTRACTION
// generate a random color
// function generateColor() {
//   let colors = [greenCircle, pinkSquare, blueSquare, redCircle];
//   let colorInt = Math.floor(Math.random() * 4);
//   return colors[colorInt];
// }

function generateColor() {
    let colors = [greenCircle, pinkSquare, blueSquare, redCircle, yellowCircle, brownSquare];
    let colorInt = Math.floor(Math.random() * 6);
    return colors[colorInt];
  }

// Generate a nxn grid with random colors
function generateGrid(n) {
  let grid = [];
  for (let i = 0; i < n; i++) {
    grid[i] = [];
    for (let j = 0; j < n; j++) {
      grid[i][j] = generateColor();
    }
  }
  return grid;
}

// format a string to display the grid
function gridToString(grid) {
  let gridMessage = "";
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      gridMessage += grid[i][j] + " ";
    }
    gridMessage += "\n";
  }
  return gridMessage;
}

// the x marks in the columns should bubble up to the surface
function bubbleMarks() {
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = grid.length - 1; i > 0; i--) {
      for (let j = 0; j < grid.length; j++) {
        if (grid[i][j] === 'x' && grid[i - 1][j] !== 'x') {
          let temp = grid[i][j];
          grid[i][j] = grid[i - 1][j];
          grid[i - 1][j] = temp;
          swapped = true;
        }
      }
    }
  }
}

// replace all the x marks with new colors
function fillNewColors() {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j] === 'x') {
        grid[i][j] = generateColor();
      }
    }
  }
}

// mark the matched colors in the right
// stop when it finds a different color
function markRight(line, column) {
  let increaseScore = 0;
  let colorToCheck = grid[line][column];
  let marked = true;
  while (++column < grid.length && marked) {
    marked = false;
    if (grid[line][column] === colorToCheck) {
      grid[line][column] = 'x';
      marked = true;
      increaseScore++;
    }
  }

  return increaseScore;
}

// mark the matched colors in the left
// stop when it finds a different color
function markLeft(line, column) {
  let increaseScore = 0;
  let colorToCheck = grid[line][column];
  let marked = true;
  while (column > 0 && marked) {
    marked = false;
    column--;
    if (grid[line][column] === colorToCheck) {
      grid[line][column] = 'x';
      marked = true;
      increaseScore++;
    }
  }

  return increaseScore;
}

// mark the matched colors in the up direction
// stop when it finds a different color
function markUp(line, column) {
  let increaseScore = 0;
  let colorToCheck = grid[line][column];
  let marked = true;
  while (line > 0 && marked) {
    marked = false;
    line--;
    if (grid[line][column] === colorToCheck) {
      grid[line][column] = 'x';
      marked = true;
      increaseScore++;
    }
  }

  return increaseScore;
}

// mark the matched colors in the down direction
// stop when it finds a different color
function markDown(line, column) {
  let increaseScore = 0;
  let colorToCheck = grid[line][column];
  let marked = true;
  while (++line < grid.length && marked) {
    marked = false;
    if (grid[line][column] === colorToCheck) {
      grid[line][column] = 'x';
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
  if (increaseScore > 0) {
    grid[line][column] = 'x';
    increaseScore++;
  }

  currentScore += increaseScore;
  if (increaseScore > 3) {
    turnsLeft++;
    return true;
  } else {
    return false;
  }
}

// validate the range of the user input
function invalidUserInput(line, column) {
  return isNaN(line) || isNaN(column) || (line < 0 || line > n - 1 || column < 0 || column > n - 1);
}

// MAIN
// 1. initialize the grid
// 2. have a loop that keeps running while there are turns left:
//  a. construct the message to the user: give instructions, personalize message if the user got a bonus in the last turn
//  b. validate user input - the user enters a number between 1 and n, we need to transform it to be between 0 and n-1
//  c. find all the adjacent colors matches and keep track of the current score, also get if there is a bonus turn
//  d. replace the matched colors with new colors
//  e. decrease the turns left, restart loop if applicable
// 3. game over!
grid = generateGrid(n);
while (turnsLeft > 0) {
  let bonusMessage = bonus ? "You got a bonus turn! " : "";
  let instructions = "Enter the line and the column of the item you choose. Counting from 1 to " + n + ". Example: 1,1\n";
  let userInput = prompt(instructions +
    "The grid looks as follow:\n\n" + gridToString(grid) + "\n" +
    bonusMessage + "You have " + turnsLeft + " turn left.\n" +
    "Your current score is: " + currentScore + ".\n" +
    "Which cell do you target next?").split(",");

  userInput = [parseInt(userInput[0] - 1), parseInt(userInput[1] - 1)];
  
  if (invalidUserInput(userInput[0], userInput[1])) {
    alert("Invalid input: line " + userInput[0] + ", column " + userInput[1] + ". Try again.");
    continue;
  }

  bonus = markAdjacentMatches(userInput[0], userInput[1]);
  bubbleMarks();
  fillNewColors();
  turnsLeft--;
}

alert("Game over! Your final score is: " + currentScore);