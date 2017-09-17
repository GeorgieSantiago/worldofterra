class Maze {

  constructor(cols, rows, x, y, addBorder) {
    this.cols = addBorder ? cols - 1 : cols;
    this.rows = addBorder ? rows - 1 : rows;
    this.x = x;
    this.y = y;
    this.addBorder = addBorder;

    this.grid = [];
    this.path = [];
    this.start = {
      x: 0,
      y: 0
    };
    this.end = {
      x: addBorder ? cols - 1 : cols - 1,
      y: addBorder ? cols - 1 : cols - 1
    };
  }

  generate() {
    var x;
    var y;
    for (var i = 0; i < this.rows; i++) {
      this.grid[i] = [];
      for (var j = 0; j < this.cols; j++) {
        if (this.addBorder) {
          x = i + 1;
          y = j + 1;
        } else {
          x = i;
          y = j;
        }

        this.grid[i][j] = new MazeCell(x, y, true, this.grid);
      }
    }
    // collumn and row
    var c = 0;
    var r = 0;
    var history = [
      [0, 0]
    ];

    // As long as there is at least one location in history
    while (history.length) {
      var left = this.grid[c][r - 2];
      var right = this.grid[c][r + 2];
      var up = this.grid[c - 2] && this.grid[c - 2][r];
      var down = this.grid[c + 2] && this.grid[c + 2][r];
      var current = this.grid[c][r];
      current.visited = true;
      current.wall = false;

      var check = [] // The neighbors that need to be checked
      if (left && !left.visited) {
        check.push(left);
      }

      if (up && !up.visited) {
        check.push(up);
      }

      if (right && !right.visited) {
        check.push(right);
      }

      if (down && !down.visited) {
        check.push(down);
      }

      // If there is a valid neighbor location
      if (check.length) {
        history.push([c, r]);
        // We choose a random location to make a path
        var direction = check[Math.floor(Math.random() * check.length)];
        if (direction == left) {
          left.wall = false;
          this.grid[c][r - 1].wall = false;
          r -= 2;
        } else if (direction == up) {
          up.wall = false;
          this.grid[c - 1][r].wall = false;
          c -= 2;
        } else if (direction == right) {
          right.wall = false;
          this.grid[c][r + 1].wall = false;
          r += 2;
        } else if (direction == down) {
          down.wall = false;
          this.grid[c + 1][r].wall = false;
          c += 2;
        }
      } else {
        // We backtrack to the last place in history
        // if there is no valid neighbor
        var next = history.pop();
        c = next[0];
        r = next[1];
      }
    }

    if (this.addBorder) {
      var borderRowNorth = [];
      var borderRowSouth = [];
      for (let i = 0; i <= this.cols + 1; i++) {
        var north = new MazeCell(0, i, true, this.grid);
        var south = new MazeCell(this.cols + 1, i, true, this.grid);
        borderRowNorth.push(north);
        borderRowSouth.push(south);
      }
      // console.log(borderRowNorth);
      this.grid.forEach((row, i) => {
        var first = new MazeCell(i + 1, 0, true, this.grid);
        var last = new MazeCell(i + 1, this.cols + 1, true, this.grid);
        row.unshift(first);
        row.push(last);
      })
      this.grid.unshift(borderRowNorth);
      this.grid.push(borderRowSouth);

    }

    this.grid[this.end.x][this.end.y].wall = false;
    this.grid[this.end.x + 1][this.end.y].wall = false;
    this.grid[this.end.x + 1][this.end.y + 1].wall = false;
    this.grid[this.end.x][this.end.y + 1].wall = false;
    this.grid[this.start.x][this.start.y].wall = false;
    this.grid[this.start.x + 1][this.start.y].wall = false;
    this.grid[this.start.x + 1][this.start.y + 1].wall = false;
    this.grid[this.start.x][this.start.y + 1].wall = false;
  }

  printGrid() {
    console.log(this.grid);
    console.log(`Columns: ${this.cols}`);
    console.log(`Rows: ${this.rows}`);
    console.log(`X: ${this.x}`);
    console.log(`Y: ${this.y}`);
    console.log(`Border: ${this.addBorder}`);
    this.grid.forEach((row, i) => {
      this.printRow(i);
    });
  }

  printRow(x) {
    let str = '';
    this.grid[x].forEach((col, i) => {
      str += col.wall ? '1' : '0';
    });
    console.log(`${str}: ${x},${str.length}`);
  }
}
