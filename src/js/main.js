// Created by Rob Vogel
// Adapted from https://developer.tizen.org/community/tip-tech/creating-isometric-world-phaser.js-using-isometric-plugin


// set width and height so game is full screen
var width = window.innerWidth;
var height = window.innerHeight;

//setup froups for tiles and objects
var floorGroup;
var itemGroup;
var playerGroup;
var obstacleGroup;

// declare variables
var player;
var button;
var background;
var cursors;
var debugTxt;
var debugOutput;

let debug = false;

// for debug, we declare this outside of init so we can call it from the browser console more easily
var game = {};

var init = function() {

  // create game object
  game = new Phaser.Game(
    width, height, // these are obvious
    Phaser.AUTO, // let Phaser decide which renderer to use, more browser friendly
    '', // specify a DOM element, but I'm not using right now. TODO: Find out if this has an impact on non-HTML5 browsers
    null, // set game state, I'm not doing this here. I create a Basic Game a few lines down
    false, // transparent
    true // anti-aliasing. This smooths texture, set to false for pixel art
  );

  var BasicGame = (game) => {};
  BasicGame.Boot = (game) => {};

  BasicGame.Boot.prototype = {
    preload() {
      // player character is currently a circle
      game.load.image('circle', 'assets/simple.png');
      game.load.image('rock', 'assets/rock.png');

      // tiles are in a tile atlas created with https://www.codeandweb.com/texturepacker
      // with an texture pack from https://opengameart.org/content/isometric-tile-starter-pack
      game.load.atlas('tiles', 'assets/tiles.png', 'assets/tiles.json');

      game.time.advancedTiming = true;

      // Isometric plugin from http://rotates.org/phaser/iso/
      game.add.plugin(new Phaser.Plugin.Isometric(game));

      // Set the world size
      game.world.setBounds(0, 0, 4096, 2048);

      // Start the physical system
      game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

      // set the middle of the world in the middle of the screen
      game.iso.anchor.setTo(0.5, 0);
    },
    create() {
      // set the Background color of our game
      game.stage.backgroundColor = "0x000000";

      // create groups for different tiles
      floorGroup = game.add.group();
      obstacleGroup = game.add.group();
      itemGroup = game.add.group();
      playerGroup = game.add.group();
      game.physics.isoArcade.enable(obstacleGroup);

      // set the gravity in our game
      game.physics.isoArcade.gravity.setTo(0, 0, -500);

      var tilesCache = game.cache.getImage('tiles', true);
      var tilesData = tilesCache.frameData;
      var floorSpriteName = 'snow.png';
      var floorTileIndex = tilesData._frameNames[floorSpriteName];
      var floorSprite = tilesData._frames[floorTileIndex];
      var floorWidth = Math.floor(game.world.width / floorSprite.width);
      var floorHeight = Math.floor(game.world.height / floorSprite.height);

      //create the floor tiles
      var floorTile;
      for (let x = floorWidth; x >= 0; x--) {
        for (let y = floorHeight; y >= 0; y--) {

          floorTile = game.add.isoSprite(
            // because we are using isometrics, we use the height to space the tiles
            x*floorSprite.height, y*floorSprite.height, 0, // x,y,z
            'tiles', // atlas
            floorSpriteName, // sprite in atlas
            floorGroup // group to place the tile
          );
          // sets the anchor point of the sprite to the center of x and y
          floorTile.anchor.set(0.5);

        }
      }

      //create the maze tiles
      var maze = new Maze(20, 20, 100, 100, true);
      maze.generate();
      if(debug){
        maze.printGrid();
      }

      var rockSprite = game.cache.getImage('rock', true);
      // decrease the distance between rocks so they player doesn't fit between
      var rockHeight = rockSprite.data.height / 1.75;
      var obstacleTile;
      for (var xt = maze.grid.length-1; xt >= 0; xt--) {
        for (var yt = maze.grid[xt].length-1; yt >= 0; yt--) {
          if (maze.grid[xt][yt].wall) {
            obstacleTile = game.add.isoSprite(
              xt * rockHeight+maze.x, yt * rockHeight+maze.y, 0, // x,y,z
              'rock', // atlas
              '', // sprite in atlas
              obstacleGroup // group to place the tile
            );
            // sets the anchor point of the sprite to the center of x and y
            obstacleTile.anchor.set(0.5);

            // Let the physics engine do its job on this tile type
            game.physics.isoArcade.enable(obstacleTile);

            // This will prevent our physic bodies from going out of the screen
            obstacleTile.body.collideWorldBounds = true;

            // Make the cactus body immovable
            obstacleTile.body.immovable = true;

            // Add a full bounce on the x and y axes, and a bit on the z axis.
            obstacleTile.body.bounce.set(1, 1, 0.2);

            // Add some X and Y drag to make cubes slow down after being pushed.
            obstacleTile.body.drag.set(100, 100, 0);
          }

        }
      }

      // create the player character
      player = game.add.isoSprite(0, 0, 0, 'circle', 0, obstacleGroup);

      // sets the anchor point of the sprite to the center of x and y
      player.anchor.set(0.5);
      // enable physics
      game.physics.isoArcade.enable(player);
      // stop the player at the edge of the world
      player.body.collideWorldBounds = true;

      // set player to "world's center", similar to many RPGs
      // game.camera.follow(player);
      game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON);

      // keyboard controls
      cursors = game.input.keyboard.createCursorKeys();
      // TODO: handle other controls like touch and controller

      // debug text for testing
      debugTxt = game.add.text(8, 8, debugOutput, {
        font: "16px Arial",
        fill: "#ffffff",
        align: "left"
      });

      // lock text to screen, or we'll lose it as the camera moves
      debugTxt.fixedToCamera = true;
    },
    update() {

      // arbitrary speed that I liked how it looked as the circle moved around
      var speed = 500;
      if (cursors.left.isDown && cursors.up.isDown) {
        player.body.velocity.x = -speed;
        player.body.velocity.y = 0;
      } else if (cursors.left.isDown && cursors.down.isDown) {
        player.body.velocity.x = 0;
        player.body.velocity.y = speed;
      } else if (cursors.up.isDown && cursors.right.isDown) {
        player.body.velocity.y = -speed;
        player.body.velocity.x = 0;
      } else if (cursors.down.isDown && cursors.right.isDown) {
        player.body.velocity.y = 0;
        player.body.velocity.x = speed;
      } else if (cursors.left.isDown) {
        player.body.velocity.x = -(speed * Math.sqrt(2) / 2); // Pythagorean Theorem.
        player.body.velocity.y = (speed * Math.sqrt(2) / 2); // Visually, up/down/left/right is north/south/west/east
      } else if (cursors.right.isDown) { //
        player.body.velocity.x = (speed * Math.sqrt(2) / 2); // But, we can move in 8 directions
        player.body.velocity.y = -(speed * Math.sqrt(2) / 2); //
      } else if (cursors.up.isDown) { // So, if the player is moving diagonally at the same speed
        player.body.velocity.y = -(speed * Math.sqrt(2) / 2); // it would move vertically or horizontally, it is moving
        player.body.velocity.x = -(speed * Math.sqrt(2) / 2); // faster at those angles. Therefore, if we solve for the
      } else if (cursors.down.isDown) { // hypotenuse of the triangle of movement, with speed as
        player.body.velocity.y = (speed * Math.sqrt(2) / 2); // our sides, the hypotenuse is twice the speed we set,
        player.body.velocity.x = (speed * Math.sqrt(2) / 2); // so we cut it in half and the net velocity is always the same
      } else { //
        player.body.velocity.x = 0; // TODO: When configuring controllers, consider percentage of
        player.body.velocity.y = 0; // movement for the analog stick
      }

      //console.log(
        game.physics.isoArcade.collide(obstacleGroup,player, (a,b)=>{
        // console.log(a);
        // console.log(b);
      }, null, this)
    //);
      game.iso.topologicalSort(obstacleGroup);

      // build debug string
      debugOutput = 'Velocity: ' + (player.body.velocity.x).toFixed(2) + ', ' + (player.body.velocity.y).toFixed(2);
      debugOutput += '\nTotal: ' + (Math.hypot(player.body.velocity.x, player.body.velocity.y)).toFixed(2);

      // display debug string
      debugTxt.setText(debugOutput);
    }
  }

  game.state.add('Boot', BasicGame.Boot);
  game.state.start('Boot');
}

window.onload = init;
