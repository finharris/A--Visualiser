const UNSEARCHED = 'lightgray';
const SEARCHED = 'darkred';
const OPEN = 'lightgreen';
const CLOSED = 'red';
const WALL = 'black';
const ENDPOINT = 'lightblue';

class Node {
  constructor(x, y, endPoint) {
    this.x = x;
    this.y = y;
    this.color = UNSEARCHED;
    this.isLocked = false;
    this.isClosed = false;
    this.isWall = false;
    this.g = Infinity;
    this.h = this.calculateHValue(endPoint);
    this.f = this.g + this.h;
    this.content = '';
    this.parent = undefined;
  }

  calculateFValue() {
    this.f = this.g + this.h;
  }

  calculateHValue(endPoint) {
    return Math.sqrt(
      (Math.max(endPoint.x, this.x) - Math.min(endPoint.x, this.x)) ** 2 +
        (Math.max(endPoint.y, this.y) - Math.min(endPoint.y, this.y)) ** 2
    );
  }

  toggleWall() {
    if (this.isLocked) {
      return;
    }

    if (this.color == WALL) {
      this.color = UNSEARCHED;
      this.isWall = false;
    } else {
      this.color = WALL;
      this.isWall = true;
    }
  }

  open(current, endPoint) {
    // let distanceFromCurrent = sqrt(differenceinx + differenceiny);
    let distanceFromCurrent = Math.sqrt(
      (Math.max(current.x, this.x) - Math.min(current.x, this.x)) ** 2 +
        (Math.max(current.y, this.y) - Math.min(current.y, this.y)) ** 2
    );

    this.g = Math.min(current.f + distanceFromCurrent, this.g);
    this.h = this.calculateHValue(endPoint);
    this.calculateFValue();

    this.color = OPEN;
    this.content = this.f;
    this.isLocked = true;
    this.parent = current;
  }

  close() {
    this.color = CLOSED;
    this.isClosed = true;
  }

  reset() {
    this.color = UNSEARCHED;
    this.isLocked = false;
    this.isClosed = false;
    this.isWall = false;
    this.g = Infinity;
    this.h = 0;
    this.f = this.g + this.h;
    this.content = '';
  }
}

class Grid {
  constructor(cols, rows, startpoint, endpoint) {
    this.cols = cols;
    this.rows = rows;

    this.isNew = true;

    this.startpoint = startpoint;
    this.endpoint = endpoint;

    this.grid = [];
    for (let i = 0; i < rows; i++) {
      let tempRow = [];
      for (let j = 0; j < cols; j++) {
        tempRow.push(new Node(j + 1, i + 1, this.endpoint));
      }
      this.grid.push(tempRow);
    }

    this.setEndPoint(this.startpoint.x, this.startpoint.y, true);
    this.setEndPoint(this.endpoint.x, this.endpoint.y);

    this.renderGrid();
  }

  setEndPoint(x, y, setFValue) {
    const node = this.grid[y - 1][x - 1];
    node.color = ENDPOINT;
    node.isLocked = true;
    if (setFValue) {
      node.g = 0;
      node.h = 0;
      node.calculateFValue();
    }
  }

  renderGrid() {
    let container = document.querySelector('.container');
    container.innerHTML = '';

    for (const row of this.grid) {
      let tempRow = document.createElement('div');
      tempRow.classList.add('row');
      for (const node of row) {
        let tempNode = document.createElement('div');
        tempNode.classList.add('node');
        tempNode.style.backgroundColor = node.color;
        tempNode.addEventListener('mousedown', () => {
          node.toggleWall();
          this.renderGrid();
        });
        // tempNode.innerText = node.content;

        tempRow.appendChild(tempNode);
      }
      container.appendChild(tempRow);
    }
  }

  getNodeFromGrid(x, y) {
    return this.grid[y - 1][x - 1];
  }

  aStarPathfind(speed) {
    speed = speed ? speed : 100;

    this.isNew = false;

    let open = [this.getNodeFromGrid(this.startpoint.x, this.startpoint.y)];
    let closed = [];

    let loop = setInterval(() => {
      let current = open[0];

      if (!current) {
        alert('Not Found');
        clearInterval(loop);
        return;
      }
      current.close();
      closed.push(open.shift());

      // open all neibours of current that are traversable and calculate g,h and f values
      let currentNeibours = [];
      {
        // left
        if (current.x > 1) {
          currentNeibours.push(this.getNodeFromGrid(current.x - 1, current.y));
        }
        // right
        if (current.x < 10) {
          currentNeibours.push(this.getNodeFromGrid(current.x + 1, current.y));
        }
        // down
        if (current.y < 10) {
          currentNeibours.push(this.getNodeFromGrid(current.x, current.y + 1));
        }
        // up
        if (current.y > 1) {
          currentNeibours.push(this.getNodeFromGrid(current.x, current.y - 1));
        }
        // down-left
        if (current.y < 10 && current.x > 1) {
          currentNeibours.push(
            this.getNodeFromGrid(current.x - 1, current.y + 1)
          );
        }
        // up-left
        if (current.y > 1 && current.x > 1) {
          currentNeibours.push(
            this.getNodeFromGrid(current.x - 1, current.y - 1)
          );
        }
        // down-right
        if (current.y < 10 && current.x < 10) {
          currentNeibours.push(
            this.getNodeFromGrid(current.x + 1, current.y + 1)
          );
        }
        // up-right
        if (current.y > 1 && current.x < 10) {
          currentNeibours.push(
            this.getNodeFromGrid(current.x + 1, current.y - 1)
          );
        }
      }

      currentNeibours = currentNeibours.filter(
        node => !node.isClosed && !node.isWall
      );

      for (const neibour of currentNeibours) {
        neibour.open(current, this.endpoint);
      }

      open = [...open, ...currentNeibours];
      open = open.filter((node, pos) => open.indexOf(node) === pos);
      sortOpen();

      if (current == this.getNodeFromGrid(this.endpoint.x, this.endpoint.y)) {
        let finalPath = [];
        let tempCurrent = this.getNodeFromGrid(
          this.endpoint.x,
          this.endpoint.y
        );
        while (true) {
          finalPath.push(tempCurrent);
          tempCurrent.color = ENDPOINT;
          if (tempCurrent.parent) {
            tempCurrent = tempCurrent.parent;
          } else {
            break;
          }
        }
        clearInterval(loop);
      }
      this.renderGrid();
    }, Math.round(parseInt(speed)));

    function sortOpen() {
      open.sort(function (a, b) {
        var aF = a.f;
        var bF = b.f;
        var aH = a.h;
        var bH = b.h;
        if (aF == bF) {
          return aF < bF ? -1 : aF > bF ? 1 : 0;
        } else {
          return aH < bH ? -1 : 1;
        }
      });
    }
  }
}

let testGrid = new Grid(10, 10, { x: 2, y: 9 }, { x: 9, y: 2 });

const speedInput = document.querySelector('.inputSpeed');

const startInputX = document.querySelector('.startInputX');
const startInputY = document.querySelector('.startInputY');
const endInputX = document.querySelector('.endInputX');
const endInputY = document.querySelector('.endInputY');

const startButton = document.querySelector('.startButton');
const clearButton = document.querySelector('.clearButton');

function spawnGrid(doStart) {
  let startX = startInputX.value ? parseInt(startInputX.value) : 2;
  let startY = startInputY.value ? parseInt(startInputY.value) : 9;
  let endX = endInputX.value ? parseInt(endInputX.value) : 9;
  let endY = endInputY.value ? parseInt(endInputY.value) : 2;

  if (!testGrid.isNew) {
    testGrid = new Grid(10, 10, { x: startX, y: startY }, { x: endX, y: endY });
  }

  if (!doStart) {
    testGrid = new Grid(10, 10, { x: startX, y: startY }, { x: endX, y: endY });
  }

  doStart ? testGrid.aStarPathfind(speedInput.value) : pass;
}

clearButton.addEventListener('click', () => {
  spawnGrid();
});

startButton.addEventListener('click', () => {
  spawnGrid(true);
});
