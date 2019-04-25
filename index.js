
/* var fs = require('fs-extra'); // Load the File System to execute our common tasks (CRUD)
const os = require('os');
const path = require('path');
const fileOp = require('./file-operations');

var homePath = os.homedir();
var desktopPath = path.join(os.homedir(), 'Desktop')
var documentsPath = path.join(os.homedir(), 'Documents')

fileOp.readFiles(desktopPath, (filepath, name, ext, stat) => {
  console.log('file path:', filepath);
  console.log('file name:', name);
  console.log('file extension:', ext);
  console.log('file information:', stat);
});  */

var app = new PIXI.Application(780, 580, { backgroundColor : 0xcecece });
document.body.appendChild(app.view);

const loader = PIXI.loader;

loader
    .add('trailTexture', 'assets/trail.png');
var container = new PIXI.Container();

app.stage.addChild(container);

//create trail texture
const trailTexture = PIXI.Texture.from('assets/trail.png');
const historyX = [];
const historyY = [];

//historySize determins how long the trail will be
const historySize = 50;

//rope size determines how smooth it will be
const ropeSize = 100;
const points = [];

//Create history array
for (let i = 0; i < historySize; i++) {
  historyX.push(0);
  historyY.push(0);
}

//Create rope points 
for (let i = 0; i < ropeSize; i++) {
  points.push(new PIXI.Point(0,0));
}

// Create the rope
var rope = new PIXI.mesh.Rope(trailTexture, points);

// Set the blendmode
rope.blendmode = PIXI.BLEND_MODES.ADD;

app.stage.addChild(rope);

// Create a new texture
var texture = PIXI.Texture.fromImage('https://pbs.twimg.com/media/D3l37gJX4AAZFTX.jpg');
app.stage.interactive = true;

var bg = PIXI.Sprite.fromImage('assets/sketch-container-small.png');
bg.position.set(50, 30);
app.stage.addChild(bg);

// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// Center bunny sprite in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;
// Listen for animate update
app.ticker.add(function(delta) {
    // Read mouse points, this could be done also in mousemove/touchmove update. For simplicity it is done here for now.
    // When implemeting this properly, make sure to implement touchmove as interaction plugins mouse might not update on certain devices.
    var mouseposition = app.renderer.plugins.interaction.mouse.global;

    // Update the mouse values to history
    historyX.pop();
    historyX.unshift(mouseposition.x);
    historyY.pop();
    historyY.unshift(mouseposition.y);
    // Update the points to correspond with history.
    for (var k = 0; k < ropeSize; k++) {
        var p = points[k];

        // Smooth the curve with cubic interpolation to prevent sharp edges.
        var ix = cubicInterpolation(historyX, k / ropeSize * historySize);
        var iy = cubicInterpolation(historyY, k / ropeSize * historySize);

        p.x = ix;
        p.y = iy;
    }
});

/**
 * Cubic interpolation based on https://github.com/osuushi/Smooth.js
 */
function clipInput(k, arr) {
    if (k < 0) k = 0;
    if (k > arr.length - 1) k = arr.length - 1;
    return arr[k];
}

function getTangent(k, factor, array) {
    return factor * (clipInput(k + 1, array) - clipInput(k - 1, array)) / 2;
}

function cubicInterpolation(array, t, tangentFactor) {
    if (tangentFactor == null) tangentFactor = 1;

    var k = Math.floor(t);
    var m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
    var p = [clipInput(k, array), clipInput(k + 1, array)];
    t -= k;
    var t2 = t * t;
    var t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
}
