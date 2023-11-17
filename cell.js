/**
 * Cell class
 * cell type - enumerator
 * img path
 * is marked
 * is cleared
 * index - x,y
 * add listener
 * remove listener
 */

const greenCircle = "\u{1F7E2}";
const pinkSquare = "\u{1F7EA}";
const blueSquare = "\u{1F7E6}";
const redCircle = "\u{1F7E0}";
const yellowCircle = "\u{1F7E1}";
const brownSquare = "\u{1F7EB}";

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
class Cell {
  constructor(id, onClickCell) {
    this.id = id;
    this.onClickCell = onClickCell;

    this.color = generateColor();
    this.marked = false;
    this.cleared = false;
    this.cellNode = createCell(id);
    this.setColor();
  }

  // creates a single cell, with the argument
  // 'id' (a string) as id, and returns it
  createCell(id) {
    let cell = document.createElement("td");
    cell.setAttribute("id", id);
    console.log("id " + content); // debug
    cell.addEventListener("click", this.onClickCell);
    return cell;
  }

  setColor(newColor) {
    // model
    color = newColor;
    // view
    this.cellNode.innerText = newColor;
  }

  isColorMatch(otherCell) {
    return this.color === otherCell.color;
  }

  markCell() {
    marked = true;
    this.cellNode.style.borderColor = "red";
    this.cellNode.style.borderWidth = "1px";
    this.cellNode.style.borderStyle = "solid";
  }

  unmarkCell() {
    marked = false;
    this.cellNode.style.borderColor = "";
    this.cellNode.style.borderWidth = "";
    this.cellNode.style.borderStyle = "";
  }

  clearCell() {
    cleared = true;
    this.setColor("");
    // unmarkCell();
    this.cellNode.style.borderColor = "red";
    this.cellNode.style.borderWidth = "1px";
    this.cellNode.style.borderStyle = "solid";
  }

  copyColor(from) {
    this.setColor(from.color);
    if (from.marked) {
      this.markCell();
    } else {
      this.unmarkCell();
    }
  }

  removeClickListener() {
    this.cellNode.removeEventListener("click", this.onClickCell);
  }
}
