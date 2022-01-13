const gridWidth = 25;
const gridHeight = 25;

// Creating the grid matrix
var grid = [];
function gridGenerator() {
  for (let i = 0; i < 24; i ++) {
    grid.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
}
gridGenerator();

// Creating the grid canvas
var gridCanvas = document.getElementById("grid-canvas");
var gridctx = gridCanvas.getContext("2d");
function gridCanvasGenerator() {
  for (let i = 1; i < 10; i ++) {
    gridctx.beginPath();
    gridctx.moveTo(gridWidth * i, 0);
    gridctx.lineTo(gridWidth * i, 550);
    gridctx.strokeStyle = "#e6e6e6";
    gridctx.lineWidth = 1;
    gridctx.stroke();
  }
  for (let j = 1; j < 23; j ++) {
    gridctx.beginPath();
    gridctx.moveTo(0, gridWidth * j);
    gridctx.lineTo(250, gridWidth * j);
    gridctx.strokeStyle = "#e6e6e6";
    gridctx.lineWidth = 1;
    gridctx.stroke();
  }  
}

// Creating the main canvas
var mainCanvas = document.getElementById("main-canvas");
var ctx = mainCanvas.getContext("2d");

// Time controls
var timeoutFunction, intervalFunction, scoreAccumulator;
var score = 0;
function interval() {
  var multiplier = 1 - score / 300000;
  return 750 * multiplier;
}
function timeScoreMultiplier() {
  var multiplier = Math.round(1 + (score / 20000))
  return 50 * multiplier;
}

function timeScore() {
  scoreAccumulator = 
    setInterval(() => {
      var increment = timeScoreMultiplier();
      score += increment;
      document.getElementById("score").innerHTML = score;
    }, 10000);
}


// Creating a class template for each Shape object
class Shape {
  constructor(x, y, color, layout, id) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.layout = layout;
    this.id = id;
    this.movement = {
      left: true,
      right: true,
      down: true
    };
  }
  
  xCoordinate() {
    return this.x / gridWidth;
  }
  yCoordinate() {
    return (this.y + 50) / gridHeight;
  }
  
  drawShape() {
    this.layout.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === 1) {
          ctx.beginPath();
          ctx.rect(this.x + gridWidth * j, this.y + gridHeight * i, gridWidth, gridHeight);
          ctx.fillStyle = this.color;
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });
    });
  }
  clearShape() {
    this.layout.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === 1) {
          ctx.clearRect(this.x + gridWidth * j, this.y + gridHeight * i, gridWidth, gridHeight);
        }
      });
    });
  }
 
  // Movement
  moveLeft() {
    this.checkCollision();
    if (this.movement.left == true) {
      this.clearShape();
      this.x = this.x - gridWidth;
      this.drawShape();
      falling();
    }
  }  
  moveRight() {
    this.checkCollision();
    if (this.movement.right == true) {
      this.clearShape();
      this.x = this.x + gridWidth;
      this.drawShape();
      falling();
    }   
  }
  moveDown() {
    this.checkCollision();
    if (this.movement.down == true) {
      this.clearShape();
      this.y += gridHeight;
      this.drawShape();
    } 
    this.checkCollision();
  }
  hardDrop() {
    this.checkCollision();
    if (this.movement.down == true) {
      this.clearShape();
      this.y += gridHeight;
      this.drawShape();
      this.hardDrop();
    }   
    clearTimeout(timeoutFunction);
    timeoutFunction = 
      setTimeout(() => {
      this.updateGrid();
      collisionAudio.currentTime = 0;
      collisionAudio.play();
      newShape();
    }, 50);
  }
  
  rotateClockwise() {
    var ableToRotate = true;
    // Generating a new layout for the shape
    var newLayout = [];
    for (let i = 0; i < this.layout.length; i ++) {
      newLayout.push([]);
    }
    this.layout.forEach((row) => {
      for (let j = 0; j < newLayout.length; j ++) {
        newLayout[j].unshift(row[j]);
      }
    });
    // Checking whether the shape can be rotated
    newLayout.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === 1) {         
          if (typeof grid[0][this.xCoordinate() + j] == "undefined" || grid[this.yCoordinate() + i][this.xCoordinate() + j] == 1) {     
            ableToRotate = false;
          }
          if (typeof grid[this.yCoordinate() + i] == "undefined" || grid[this.yCoordinate() + i][this.xCoordinate() + j] == 1) {            
            ableToRotate = false;
          }
        }
      });
    });
    if (ableToRotate == true) {
      this.clearShape(); 
      this.layout = newLayout;
      this.drawShape();
    }
  }
  rotateAntiClockwise() {
    var ableToRotate = true;
    // Generating a new layout for the shape
    var newLayout = [];
    for (let i = 0; i < this.layout.length; i ++) {
      newLayout.push([]);
    }
    this.layout.forEach((row) => {
      for (let j = 0; j < newLayout.length; j ++) {
        newLayout[j].push(row[newLayout.length - j - 1]);
      }
    });
    // Checking whether the shape can be rotated
    newLayout.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === 1) {         
          if (typeof grid[0][this.xCoordinate() + j] == "undefined" || grid[this.yCoordinate() + i][this.xCoordinate() + j] == 1) {     
            ableToRotate = false;
          }
          if (typeof grid[this.yCoordinate() + i] == "undefined" || grid[this.yCoordinate() + i][this.xCoordinate() + j] == 1) {            
            ableToRotate = false;
          }
        }
      });
    });
    if (ableToRotate == true) {
      this.clearShape(); 
      this.layout = newLayout;
      this.drawShape();
    }
  }

  checkCollision() {    
    this.movement.left = true;
    this.movement.right = true;
    this.movement.down = true;
    clearTimeout(timeoutFunction);
    this.layout.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === 1) {         
          // Checking for collison on the left
          if (typeof grid[0][this.xCoordinate() + j -  1] == "undefined" || grid[this.yCoordinate() + i][this.xCoordinate() + j - 1] == 1) {            
            this.movement.left = false;
          }
          // Checking for collison on the right
          if (typeof grid[0][this.xCoordinate() + j +  1] == "undefined" || grid[this.yCoordinate() + i][this.xCoordinate() + j + 1] == 1) {            
            this.movement.right = false;
          }
          // Checking for collision below
          if (typeof grid[this.yCoordinate() + i +  1] == "undefined" || grid[this.yCoordinate() + i + 1][this.xCoordinate() + j] == 1) {            
            this.movement.down = false; 
            clearTimeout(timeoutFunction);
            clearInterval(intervalFunction);
            timeoutFunction = 
              setTimeout(() => {
              this.updateGrid();
              collisionAudio.currentTime = 0;
              collisionAudio.play();
              newShape();
            }, interval() + 150);
          }
        }
      });
    });
  }
  updateGrid() {
    this.layout.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === 1) {
          grid[this.yCoordinate() + i][this.xCoordinate() + j] = 1;
        }
      });
    });
    checkLosingCondition();
  }
}

// Creating each of the 7 shape variables
var O = [gridWidth * 4, -50, "#fcf495", [
  [1, 1],
  [1, 1]
], 0];
var L = [gridWidth * 4, -50, "#e6b587", [
  [0, 0, 1],
  [1, 1, 1],
  [0, 0, 0]
], 1];
var J = [gridWidth * 4, -50, "#87a4e6", [
  [1, 0, 0],
  [1, 1, 1],
  [0, 0, 0]
], 2];
var T = [gridWidth * 4, -50, "#ce87e6", [
  [0, 1, 0],
  [1, 1, 1],
  [0, 0, 0]
], 3];
var S = [gridWidth * 4, -50, "#87e6a8", [
  [0, 1, 1],
  [1, 1, 0],
  [0, 0, 0]
], 4];
var Z = [gridWidth * 4, -50, "#e68787", [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0]
], 5];
var I = [gridWidth * 3, -50, "#87e6e6", [
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
], 6];
var lettersArray = [O, L, J, T, S, Z, I];

// Detecting keyboard input
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 37 || e.keyCode === 65) currentShape.moveLeft();
});
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 39 || e.keyCode === 68) currentShape.moveRight();
});
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 40 || e.keyCode == 83) currentShape.moveDown();
});
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 32) currentShape.hardDrop();
});
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 69) currentShape.rotateClockwise();
});
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 81) currentShape.rotateAntiClockwise();
});
document.addEventListener("keydown", (e) => {
  if (e.keyCode === 82) hold();
});

// Randomising the current shape
var currentShape;
var queue = [];
function shapeRandomiser() {
  var randomIndex = Math.floor(Math.random() * lettersArray.length);
  if (queue.length < 3) {
    queue.unshift(randomIndex);
    shapeRandomiser();
  }
}
function newShape() {
  if (gameOn) {
    checkClear();
    var i = queue[2];
    currentShape = new Shape(lettersArray[i][0], lettersArray[i][1], lettersArray[i][2], lettersArray[i][3], lettersArray[i][4]);
    currentShape.drawShape();
    holderUses = 0;
    queue.pop();
    shapeRandomiser();
    drawQueue();
    falling();
  }
}

// Holder canvas
var holderCanvas = document.getElementById("holder-canvas");
var holderctx = holderCanvas.getContext("2d");
var holder;
var holderUses = 0;

function hold() {  
  var tempHolder = currentShape.id;
  if (holderUses == 0) {
    currentShape.clearShape();
    if (holder) {
      currentShape = new Shape(holder[0], holder[1], holder[2], holder[3], holder[4]);
      currentShape.drawShape();
      holder = lettersArray[tempHolder];
      holderUses += 1
      drawHolder();
    } else {
      holder = lettersArray[tempHolder];
      holderUses += 1
      newShape();
      drawHolder();
    }
  }
  
}
function drawHolder() {
  holderctx.clearRect(0, 0, 130, 90);
  var x, y;
  if (holder[3].length == 2) {
    x = 45;
    y = 20;
  } else if (holder[3].length == 3) {
    x = 30;
    y = 20;
  } else if (holder[3].length == 4) {
    x = 15;
    y = 35;
  }
  holder[3].forEach((row, i) => {
    row.forEach((value, j) => {
     if (value === 1) {
        holderctx.beginPath();
        holderctx.rect(x + gridWidth * j, y + gridHeight * i, gridWidth, gridHeight);
        holderctx.fillStyle = holder[2];
        holderctx.fill();
        holderctx.strokeStyle = "white";
        holderctx.lineWidth = 3;
        holderctx.stroke();
      }
    });
  });
}

// Queue canvas
var queueCanvas = document.getElementById("queue-canvas");
var queuectx = queueCanvas.getContext("2d");
function drawQueue() {
  queuectx.clearRect(0, 0, 130, 270);
  function drawShape(x, y, shape) {
    shape[3].forEach((row, i) => {
      row.forEach((value, j) => {
       if (value === 1) {
          queuectx.beginPath();
          queuectx.rect(x + gridWidth * j, y + gridHeight * i, gridWidth, gridHeight);
          queuectx.fillStyle = shape[2];
          queuectx.fill();
          queuectx.strokeStyle = "white";
          queuectx.lineWidth = 3;
          queuectx.stroke();
        }
      });
    });
  } 
  function shapeSorter(shape) {
    var x, y;
    if (shape[3].length == 2) {
        x = 45;
        y = 20;
      } else if (shape[3].length == 3) {
        x = 30;
        y = 20;
      } else if (shape[3].length == 4) {
        x = 15;
        y = 35;
      }
    return [x, y];
  }
  for (var i = 0; i < queue.length; i ++) {
    var x = shapeSorter(lettersArray[queue[i]])[0];
    var y = shapeSorter(lettersArray[queue[i]])[1];
    drawShape(x, y + 90 * (2 - i), lettersArray[queue[i]]);
  }
}

// Checking for row clearing
function checkClear() {
  var count = 0;
  grid.forEach((row, i) => {
    if (row.every((value) => value == 1)) {
      count ++;
      clearRow(i);
    }
  });
  if (count == 1) {
      score += 1000;
    } else if (count == 2) {
      score += 3000;
    } else if (count == 3) {
      score += 8000;
    } else if (count == 4) {
      score += 12000;
    }
  document.getElementById("score").innerHTML = score;
}
function clearRow(index) {
  grid.splice(index, 1);
  grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  ctx.clearRect(0, (index - 2) * gridHeight, 250, gridHeight)
  var imageData = ctx.getImageData(0, 0, 250, (index - 2) * gridHeight);
  ctx.clearRect(0, 0, 250, (index - 2) * gridHeight);
  ctx.putImageData(imageData, 0, gridHeight);
  lineClearAudio.currentTime = 0;
  lineClearAudio.play();
}

// Starting and pausing
var gameOn = false;
function pauseButton() {
  pauseAudio.currentTime = 0;
  pauseAudio.play();
  if (typeof currentShape == "undefined") {
    ctx.clearRect(0, 0, 250, 550);
    holderctx.clearRect(0, 0, 130, 90);
    queuectx.clearRect(0, 0, 130, 270);
    gridCanvasGenerator();
    score = 0;
    gameOn = true;
    shapeRandomiser();
    newShape();
    clearInterval(scoreAccumulator);
    timeScore();
    document.getElementById("icon").className = "fas fa-pause";
  } else if (gameOn) {
    clearTimeout(timeoutFunction);
    clearInterval(intervalFunction);
    document.getElementById("icon").className = "fas fa-play";
    gameOn = false;
    clearInterval(scoreAccumulator);
  } else if (gameOn == false) {
    document.getElementById("icon").className = "fas fa-pause";
    gameOn = true;
    clearInterval(scoreAccumulator);
    timeScore();
    falling();
  }
}
function falling() {
  clearInterval(intervalFunction);
  if (gameOn) {
      intervalFunction = setInterval(() => {
      currentShape.moveDown();
    }, interval());
  }
}

// Checking for losing condition
function checkLosingCondition() {
  grid[0].forEach((value) => {
    if (value == 1) {
      loseAudio.currentTime = 0;
      loseAudio.play();
      clearTimeout(timeoutFunction);
      clearInterval(intervalFunction);
      clearInterval(scoreAccumulator);
      grid = [];
      ctx.clearRect(0, 0, 250, 550);
      gridctx.clearRect(0, 0, 250, 550);
      holderctx.clearRect(0, 0, 130, 90);
      queuectx.clearRect(0, 0, 130, 270);
      gridGenerator();
      ctx.font = "30px Major Mono Display";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText("you lost!", mainCanvas.width / 2, mainCanvas.width / 2 - 1);
      ctx.fillText("_________", mainCanvas.width / 2, mainCanvas.width / 2 + 10)
      ctx.fillText("score:", mainCanvas.width / 2, mainCanvas.width / 2 + 49);
      ctx.fillText(score, mainCanvas.width / 2, mainCanvas.width / 2 + 87);
      
      // Reseting the game to starting conditions
      gameOn = false;
      currentShape = undefined;
      holder = undefined;
      holderUses = 0;
      queue = [];
      document.getElementById("icon").className = "fas fa-play";
    }
  });
}

// Game sounds
var lineClearAudio = new Audio("http://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a");
var collisionAudio = new Audio("http://commondatastorage.googleapis.com/codeskulptor-assets/Collision8-Bit.ogg");
var pauseAudio = new Audio("http://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/bonus.wav");
var loseAudio = new Audio("http://commondatastorage.googleapis.com/codeskulptor-demos/pyman_assets/theygotcha.ogg");

// Instructions on startup
function startUp() {
  ctx.font = "30px Major Mono Display";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText("controls:", mainCanvas.width / 2, mainCanvas.width / 2 - 1);
  ctx.fillText("_________", mainCanvas.width / 2, mainCanvas.width / 2 + 10);
  ctx.font = "20px Major Mono Display";
  ctx.textAlign = "center";
  ctx.fillText("a/←: left", mainCanvas.width / 2, mainCanvas.width / 2 + 45);
  ctx.fillText("d/→: right" , mainCanvas.width / 2, mainCanvas.width / 2 + 70);
  ctx.fillText("s/↓: down" , mainCanvas.width / 2, mainCanvas.width / 2 + 95);
  ctx.fillText("space: drop", mainCanvas.width / 2, mainCanvas.width / 2 + 120);
  ctx.fillText("q: rotate ↻", mainCanvas.width / 2, mainCanvas.width / 2 + 145);
  ctx.fillText("e: rotate ↺", mainCanvas.width / 2, mainCanvas.width / 2 + 170);
  ctx.fillText("r: hold", mainCanvas.width / 2, mainCanvas.width / 2 + 195);
  holderctx.font = "20px Major Mono Display";
  holderctx.fillStyle = "black";
  holderctx.textAlign = "center";
  holderctx.fillText("held", holderCanvas.width / 2, holderCanvas.height / 2 - 5);
  holderctx.fillText("block", holderCanvas.width / 2, holderCanvas.height / 2 + 20);
  queuectx.font = "20px Major Mono Display";
  queuectx.fillStyle = "black";
  queuectx.textAlign = "center";
  queuectx.fillText("queued", queueCanvas.width / 2, queueCanvas.height / 2 - 10);
  queuectx.fillText("blocks", queueCanvas.width / 2, queueCanvas.height / 2 + 15);
  document.getElementById("score").innerHTML = "score";
}

window.onload = startUp;
