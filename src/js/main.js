// Created by Rob Vogel
// Adapted from https://developer.tizen.org/community/tip-tech/creating-isometric-world-phaser.js-using-isometric-plugin


// set width and height so game is full screen
var width = window.innerWidth;
var height = window.innerHeight;

//setup froups for tiles and objects
var floorGroup;
var itemGroup;
var grassGroup;
var obstacleGroup;

// declare variables
var player;
var button;
var background;
var cursors;
var debugTxt;
var debugOutput;

// for debug, we declare this outside of init so we can call it from the browser console more easily
var game = {};

var init = function () {

    // create game object
    game = new Phaser.Game(
        width, height, // these are obvious
        Phaser.AUTO, // let Phaser decide which renderer to use, more browser friendly
        '', // specify a DOM element, but I'm not using right now. TODO: Find out if this has an impact on non-HTML5 browsers
        null, // set game state, I'm not doing this here. I create a Basic Game a few lines down
        false, // transparent
        true // anti-aliasing. This smooths texture, set to false for pixel art
    );

    var BasicGame = function (game) {};
    BasicGame.Boot = function (game) {};

    BasicGame.Boot.prototype = {
        preload() {
            // player character is currently a circle
            game.load.image('circle', 'assets/simple.png');

            // tiles are in a tile atlas created with https://www.codeandweb.com/texturepacker
            // with an texture pack from https://opengameart.org/content/isometric-tile-starter-pack
            game.load.atlas('tiles', 'assets/tiles.png', 'assets/tiles.json');

            // Isometric plugin from http://rotates.org/phaser/iso/
            game.add.plugin(new Phaser.Plugin.Isometric(game));

            // Set the world size
            game.world.setBounds(0, 0, 2048, 1024);

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
            itemGroup = game.add.group();
            grassGroup = game.add.group();
            obstacleGroup = game.add.group();

            // set the gravity in our game
            game.physics.isoArcade.gravity.setTo(0, 0, -500);

            // create the floor tiles
            var floorTile;
            for (var xt = 1024; xt >= 0; xt -= 128) {
                for (var yt = 1024; yt >= 0; yt -= 128) {
                    
                    floorTile = game.add.isoSprite(
                        xt, yt, 0, // x,y,z
                        'tiles', // atlas
                        'snow.png', // sprite in atlas
                        floorGroup // group to place the tile
                    );
                    // sets the anchor point of the sprite to the center of x and y
                    floorTile.anchor.set(0.5);

                }
            }

            // create the player character
            player = game.add.isoSprite(350, 280, 0, 'circle', 0, obstacleGroup);

            // sets the anchor point of the sprite to the center of x and y
            player.anchor.set(0.5);
            // enable physics
            game.physics.isoArcade.enable(player);
            // stop the player at the edge of the world
            player.body.collideWorldBounds = true;

            // set player to "world's center", similar to many RPGs
            game.camera.follow(player);

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
            var speed = 200;
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
                player.body.velocity.x = -(speed * Math.sqrt(2) / 2);   // Pythagorean Theorem.
                player.body.velocity.y = (speed * Math.sqrt(2) / 2);    // Visually, up/down/left/right is north/south/west/east
            } else if (cursors.right.isDown) {                          //
                player.body.velocity.x = (speed * Math.sqrt(2) / 2);    // But, we can move in 8 directions
                player.body.velocity.y = -(speed * Math.sqrt(2) / 2);   //
            } else if (cursors.up.isDown) {                             // So, if the player is moving diagonally at the same speed
                player.body.velocity.y = -(speed * Math.sqrt(2) / 2);   // it would move vertically or horizontally, it is moving
                player.body.velocity.x = -(speed * Math.sqrt(2) / 2);   // faster at those angles. Therefore, if we solve for the 
            } else if (cursors.down.isDown) {                           // hypotenuse of the triangle of movement, with speed as 
                player.body.velocity.y = (speed * Math.sqrt(2) / 2);    // our sides, the hypotenuse is twice the speed we set,
                player.body.velocity.x = (speed * Math.sqrt(2) / 2);    // so we cut it in half and the net velocity is always the same
            } else {                                                    // 
                player.body.velocity.x = 0;                             // TODO: When configuring controllers, consider percentage of
                player.body.velocity.y = 0;                             // movement for the analog stick
            }

            // build debug string
            debugOutput = 'Velocity: ' + (player.body.velocity.x).toFixed(2) + ', ' + (player.body.velocity.y).toFixed(2);
            debugOutput += '\nTotal: ' + (Math.hypot(player.body.velocity.x, player.body.velocity.y)).toFixed(2);

            // display debug string
            debugTxt.setText(debugOutput);
        }
    }

    game.state.add('Boot', BasicGame.Boot);
    game.state.start('Boot');



    function over() {
        console.log('button over');
    }

    function out() {
        console.log('button out');
    }

    function actionOnClick() {

        background.visible = !background.visible;

    }
}

window.onload = init;