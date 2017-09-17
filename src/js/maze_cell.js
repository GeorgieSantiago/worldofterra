// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Part 1: https://youtu.be/aKYlikFAV4k
// Part 2: https://youtu.be/EaZxUCWAjb0
// Part 3: https://youtu.be/jwRT4PCT6RU

// An object to describe a spot in the grid
class MazeCell {

  //maybe should be static properties?
  static get LURDMoves() {
    return [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1]
    ];

  }
  static get DiagonalMoves() {
    return [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1]
    ];
  }
  //references to the LURDMoves entries that would block the diagonal
  //if they are both walls and canPassThroughCorners = false
  static get DiagonalBlockers() {
    return [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0]
    ];
  }
  constructor(i, j, isWall, grid) {

    this.grid = grid;

    // Location
    this.i = i;
    this.j = j;

    // Neighbors
    this.neighbors = undefined;
    this.neighboringWalls = undefined;
    // Where did I come from?
    this.previous = undefined;
    // Am I an wall?
    this.wall = isWall;

    // Did the maze algorithm already visit me?
    this.visited = false;
  }

  getNeighbors() {
    if (!this.neighbors) {
      this.populateNeighbors();
    }
    return this.neighbors;
  }

  getNeighboringWalls(grid) {

    if (!this.neighboringWalls) {
      this.populateNeighbors();
    }

    return this.neighboringWalls;
  }

  //return node or null if request is out of bounds
  getNode(i, j) {
    if (i < 0 || i >= this.grid.length ||
      j < 0 || j >= this.grid[0].length) {
      return null;
    }
    return this.grid[i][j];
  }

  //populate neighbor move and neighbor wall arrays
  populateNeighbors() {
    this.neighbors = [];
    this.neighboringWalls = [];

    //Add Left/Up/Right/Down Moves
    for (var i = 0; i < 4; i++) {
      var node = this.getNode(this.i + MazeCell.LURDMoves()[i][0], this.j + MazeCell.LURDMoves()[i][1]);
      if (node != null) {
        if (!node.wall) {
          this.neighbors.push(node);
        } else {
          this.neighboringWalls.push(node);
        }
      }
    }

    //Add Diagonals

    for (var i = 0; i < 4; i++) {
      var gridX = this.i + MazeCell.DiagonalMoves()[i][0];
      var gridY = this.j + MazeCell.DiagonalMoves()[i][1];

      var node = this.getNode(gridX, gridY);

      if (node != null) {
        if (allowDiagonals && !node.wall) {
          if (!canPassThroughCorners) {
            //Check if blocked by surrounding walls
            var border1 = MazeCell.DiagonalBlockers()[i][0];
            var border2 = MazeCell.DiagonalBlockers()[i][1];
            //no need to protect against OOB as diagonal move
            //check ensures that blocker refs must be valid
            var blocker1 = this.grid[this.i + MazeCell.LURDMoves()[border1][0]]
              [this.j + MazeCell.LURDMoves()[border1][1]];
            var blocker2 = this.grid[this.i + LURDMoves()[border2][0]]
              [this.j + MazeCell.LURDMoves()[border2][1]];


            if (!blocker1.wall || !blocker2.wall) {
              //one or both are open so we can move past
              this.neighbors.push(node);
            }
          } else {
            this.neighbors.push(node);
          }
        }
        if (node.wall) {
          this.neighboringWalls.push(node);
        }
      }
    }
  }

}
