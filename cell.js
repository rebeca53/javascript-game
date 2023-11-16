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

let id = "";
let color = "";
let marked = false;
let cleared = false;
let path = "";

// constructor
// returns the HTML element with the img content
function createCell() {
    
}



function getCellView() {

}

function isColorMatch(otherCell) {
    return this.color === otherCell.color;
}

function markCell(id) {
    marked = true;
    let cell = document.getElementById(id);
    cell.style.borderColor = "red";
    cell.style.borderWidth = "1px";
    cell.style.borderStyle = "solid";
  }
  
  function unmarkCell(id) {
    marked = false;
    let cell = document.getElementById(id);
    cell.style.borderColor = "";
    cell.style.borderWidth = "";
    cell.style.borderStyle = "";
  }
  
  function clearCell(id) {
    cleared = true;
    let cell = document.getElementById(id);
    cell.innerText = "";
    cell.style.borderColor = "red";
    cell.style.borderWidth = "1px";
    cell.style.borderStyle = "solid";
  }
  
  function getCellColor(id) {
    console.log("get cell color "+id);
    let cell = document.getElementById(id);
    console.log(cell);
    return cell.innerText;
  }
  
  function setColor() {

  }
  
  function copyCellColor(from, to) {
    to.innerText = from.innerText;
    to.style.borderColor = from.style.borderColor;
    to.style.borderWidth = from.style.borderWidth;
    to.style.borderStyle = from.style.borderStyle;
  
    console.log("from "+from);
    console.log("to "+to);
  }
  