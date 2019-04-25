//========================================//
//          Dependencies
//========================================//

let fs = require('fs-extra'); // Load the File System to execute our common tasks (CRUD)
const os = require('os');
const path = require('path');

let homePath = os.homedir();
let desktopPath = path.join(os.homedir(), 'Desktop')
let documentsPath = path.join(os.homedir(), 'Documents')
const fileOp = require('./file-operations');

let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    Sprite = PIXI.Sprite;

//========================================//
//          Create Pixi App
//========================================//

let app = new Application({ 
    width: 1200, 
    height: 650,                       
    transparent: false, 
    backgroundColor: 0xcecece,
    resolution: 1
  }
);

//========================================//
//          Global Variables
//========================================//

const sketchCanvas = new Container();
const fileCanvas = new Container();
const labelCanvas = new Container();
let home, desktop, documents;
let displayTracker = 0;
let chosenPath;
let currentFiles = [];
let pathText;
let rightArrow, leftArrow;

//========================================//
//          load Assets
//========================================//

loader
  .add("assets/sketch-container.png")
  .add("assets/trail.png")
  .add("assets/folder-small.png")
  .add("assets/sketch-container-small.png")
  .add("assets/right-arrow.png")
  .add("assets/left-arrow.png")
  .add("assets/file-icon.png")
  .add("assets/file-bg.png")
  .add("assets/upIcon.png")
  .add("assets/createFile.png")
  .add("assets/createFolder.png")
  .add("assets/draw.png")
  .load(setup);


//========================================//
//          Initialize Assets
//========================================//

const trailTexture = PIXI.Texture.from('assets/trail.png');
const folderTexture = PIXI.Texture.from('assets/folder-small.png');
const fileTexture = PIXI.Texture.from('assets/file-icon.png');
const gameTexture = PIXI.Texture.fromImage('assets/sketch-container-small.png')
const leftTexture = PIXI.Texture.fromImage('assets/left-arrow.png');
const rightTexture = PIXI.Texture.fromImage('assets/right-arrow.png');
const dirUpTexture = PIXI.Texture.fromImage('assets/upIcon.png');
const bgTexture = PIXI.Texture.fromImage("assets/file-bg.png");
const createFileTexture = PIXI.Texture.fromImage("assets/createFile.png");
const createFolderTexture = PIXI.Texture.fromImage("assets/createFolder.png");
const drawTexture = PIXI.Texture.fromImage("assets/draw.png");



// Json stringify for file objects
const craftFileInfo = (filepath, name, ext, stat) => JSON.stringify({
    filepath, name, ext, stat,
  });


//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//=========================================//
//              Font Styles 
//=========================================//
const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: 'bold',
    fill: '#363636',
});

const headerStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'bold',
    fill: '#363636',
});

const labelStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 'bold',
    fill: '#363636',
});

const infoStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 14,
    fill: '#363636',
});

const warnStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 'bold',
    fill: '#d30023',
});

//=========================================//
//              Cursor Rope 
//=========================================//

const historyX = [];
const historyY = [];

//historySize determins how long the trail will be
const historySize = 50;

//rope size determines how smooth it will be
let ropeSize = 100;
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

    let k = Math.floor(t);
    let m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
    let p = [clipInput(k, array), clipInput(k + 1, array)];
    t -= k;
    let t2 = t * t;
    let t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
}

//=========================================//
//               App Setup 
//=========================================//
function setup() {
    
    app.stage.addChild(sketchCanvas);
    app.stage.addChild(fileCanvas);
    app.stage.addChild(labelCanvas);

    welcomeLabel = new PIXI.Text("Select Start Directory", labelStyle);
    welcomeLabel.x = 345;
    welcomeLabel.y = 200;
    sketchCanvas.addChild(welcomeLabel);

    home = new Sprite(folderTexture);
    home.anchor.set(0.5);
    home.x = 300;
    home.y = 300;
    home.interactive = true;
    home.buttonMode = true;
    home.on('pointerdown', onHomeClick);
    sketchCanvas.addChild(home);

    homeLabel = new PIXI.Text("Home", style);
    homeLabel.x = 282;
    homeLabel.y = 340;
    sketchCanvas.addChild(homeLabel);

    desktop = new Sprite(folderTexture);
    desktop.anchor.set(0.5);
    desktop.x = 430;
    desktop.y = 300;
    desktop.interactive = true;
    desktop.buttonMode = true;
    desktop.on('pointerdown', onDesktopClick);
    sketchCanvas.addChild(desktop);

    desktopLabel = new PIXI.Text("Desktop", style);
    desktopLabel.x = 405;
    desktopLabel.y = 340;
    sketchCanvas.addChild(desktopLabel);

    documents = new Sprite(folderTexture);
    documents.anchor.set(0.5);
    documents.x = 550;
    documents.y = 300;
    documents.interactive = true;
    documents.buttonMode = true;
    documents.on('pointerdown', onDocumentsClick);
    sketchCanvas.addChild(documents);

    documentsLabel = new PIXI.Text("Documents", style);
    documentsLabel.x = 520;
    documentsLabel.y = 340;
    sketchCanvas.addChild(documentsLabel);

    // Create the rope
    let rope = new PIXI.mesh.Rope(trailTexture, points);
    // Set the blendmode
    rope.blendmode = PIXI.BLEND_MODES.ADD;
    sketchCanvas.addChild(rope);

    let bg = new Sprite(bgTexture);
    sketchCanvas.addChild(bg);

    
    let etchSketch = new Sprite(gameTexture);
    etchSketch.position.set(75, 30);
    sketchCanvas.addChild(etchSketch);

    displayHeader();

    //Start the game loop 
    app.ticker.add(delta => gameLoop(delta));
}

//=========================================//
//              Main Loop
//=========================================//

function gameLoop(delta){

    // Read mouse points, this could be done also in mousemove/touchmove update. For simplicity it is done here for now.
    // When implemeting this properly, make sure to implement touchmove as interaction plugins mouse might not update on certain devices.
    let mouseposition = app.renderer.plugins.interaction.mouse.global;

    // Update the mouse values to history
    historyX.pop();
    historyX.unshift(mouseposition.x);
    historyY.pop();
    historyY.unshift(mouseposition.y);
    // Update the points to correspond with history.
    for (let k = 0; k < ropeSize; k++) {
        let p = points[k];

        // Smooth the curve with cubic interpolation to prevent sharp edges.
        let ix = cubicInterpolation(historyX, k / ropeSize * historySize);
        let iy = cubicInterpolation(historyY, k / ropeSize * historySize);

        p.x = ix;
        p.y = iy;
    }
}

//=========================================//
//                  Helpers
//=========================================//


function populateFiles(currentFiles) {
    clearCanvas(fileCanvas);

    displayCreateButtons()

    displayPath();
    displayDirUp();
    console.log(displayTracker);
    
    if (currentFiles.length > 0){
        displayLeftArrow();

        displayRightArrow();
        
        let maxFullDisplayNum = Math.floor(currentFiles.length/12);
        let lastDisplayedPosition = (displayTracker)*12;
    
        if (displayTracker > maxFullDisplayNum) {
            let leftOverDisplayNum = currentFiles.length%12;
            lastDisplayedPosition = (displayTracker-1)*12;

            fileCanvas.addChild(leftArrow);
    
            for (var i = 0; i < leftOverDisplayNum; i++) {
                let file = currentFiles[lastDisplayedPosition+i];
                file.x = (i % 4) * 100 + 275;
                file.y = Math.floor(i / 4) * 100 + 220;
                let fileInfo = JSON.parse(file.myCustomProperty);
                if (fileInfo.ext === ""){
                    file.setTexture(folderTexture);
                }
                fileCanvas.addChild(file);
            }
        } else {
            if (maxFullDisplayNum > 1 && displayTracker === 0){
                fileCanvas.addChild(rightArrow);
            }
            if (maxFullDisplayNum > 1 && displayTracker > 0){
                fileCanvas.addChild(leftArrow);
                fileCanvas.addChild(rightArrow);
            }
            for (var i = 0; i < 12; i++) {
                let file = currentFiles[i+lastDisplayedPosition];
                file.x = (i % 4) * 100 + 275;
                file.y = Math.floor(i / 4) * 100 + 220;
                let fileInfo = JSON.parse(file.myCustomProperty);
                if (fileInfo.ext === ""){
                    file.setTexture(folderTexture);
                }
                fileCanvas.addChild(file);
            }
        }

    }

}

function removeOptions() {
    sketchCanvas.removeChild(home);
    sketchCanvas.removeChild(desktop);
    sketchCanvas.removeChild(documents);
    sketchCanvas.removeChild(homeLabel);
    sketchCanvas.removeChild(desktopLabel);
    sketchCanvas.removeChild(documentsLabel);
    sketchCanvas.removeChild(welcomeLabel);
}

function clearCanvas(stage) {
    while(stage.children[0]) { 
        stage.removeChild(stage.children[0]); 
    }
}

//=========================================//
//            Display Functions
//=========================================//

function displayPath(){
    pathText = new PIXI.Text(chosenPath, style);
    pathText.x = 220;
    pathText.y = 133;
    fileCanvas.addChild(pathText);
}

function displayDirUp() {
    dirUp = new Sprite(dirUpTexture);
    dirUp.on('mousedown', onDirUpClick);
    dirUp.x = 185;
    dirUp.y = 130;
    dirUp.interactive = true;
    dirUp.buttonMode = true;
    fileCanvas.addChild(dirUp);
}

function displayLeftArrow() {
    leftArrow = new Sprite(leftTexture);
    leftArrow.on('mousedown', onLeftClick);
    leftArrow.x = 185;
    leftArrow.y = 300;
    leftArrow.interactive = true;
    leftArrow.buttonMode = true;
}

function displayRightArrow() {
    rightArrow = new Sprite(rightTexture);
    rightArrow.x = 635;
    rightArrow.y = 300;
    rightArrow.interactive = true;
    rightArrow.buttonMode = true;
    rightArrow.on('mousedown', onRightClick);
}

function displayFile(fileData) {
    clearCanvas(labelCanvas)
    let fileInfo = JSON.parse(fileData)
    console.log(fileInfo);

    nameLabel = new PIXI.Text("Name", labelStyle);
    nameLabel.x = 818;
    nameLabel.y = 160;
    labelCanvas.addChild(nameLabel);

    nameData = new PIXI.Text(fileInfo.name, infoStyle);
    nameData.x = 818;
    nameData.y = 185;
    labelCanvas.addChild(nameData);

    nameLabel = new PIXI.Text("File Size", labelStyle);
    nameLabel.x = 818;
    nameLabel.y = 210;
    labelCanvas.addChild(nameLabel);

    nameData = new PIXI.Text(fileInfo.stat.size, infoStyle);
    nameData.x = 818;
    nameData.y = 230;
    labelCanvas.addChild(nameData);

    creationLabel = new PIXI.Text("Creation Time", labelStyle);
    creationLabel.x = 818;
    creationLabel.y = 255;
    labelCanvas.addChild(creationLabel);

    creationData = new PIXI.Text(fileInfo.stat.birthtime, infoStyle);
    creationData.x = 818;
    creationData.y = 277;
    labelCanvas.addChild(creationData);

    modLabel = new PIXI.Text("Modification Time", labelStyle);
    modLabel.x = 818;
    modLabel.y = 300;
    labelCanvas.addChild(modLabel);

    modData = new PIXI.Text(fileInfo.stat.mtime, infoStyle);
    modData.x = 818;
    modData.y = 320;
    labelCanvas.addChild(modData);


    if (fileInfo.ext === "") {
        openFolderLabel = new PIXI.Text("Open Folder", labelStyle);
        openFolderLabel.x = 818;
        openFolderLabel.y = 400;
        openFolderLabel.interactive = true;
        openFolderLabel.buttonMode = true;
        openFolderLabel.on('mousedown', function(e){ 
            chosenPath = fileInfo.filepath;
            onFolderClick();
         });
        labelCanvas.addChild(openFolderLabel);

        deleteFolderLabel = new PIXI.Text("Delete", warnStyle);
        deleteFolderLabel.x = 1000;
        deleteFolderLabel.y = 400;
        deleteFolderLabel.interactive = true;
        deleteFolderLabel.buttonMode = true;
        deleteFolderLabel.on('mousedown', function(e){ 
            fileOp.deleteFolder(fileInfo.filepath);
            onFolderClick();
         });
        labelCanvas.addChild(deleteFolderLabel);
    } else {
        deleteFileLabel = new PIXI.Text("Delete", warnStyle);
        deleteFileLabel.x = 840;
        deleteFileLabel.y = 400;
        deleteFileLabel.interactive = true;
        deleteFileLabel.buttonMode = true;
        deleteFileLabel.on('mousedown', function(e){ 
            fileOp.deleteFile(fileInfo.filepath);
            onFolderClick(chosenPath);
         });
        labelCanvas.addChild(deleteFileLabel);

    }
}

function displayHeader() {
    fileInfoHeaderText = new PIXI.Text("File Information", headerStyle);
    fileInfoHeaderText.x = 815;
    fileInfoHeaderText.y = 110;
    sketchCanvas.addChild(fileInfoHeaderText);
}

function displayCreateButtons() {
    createFile = new Sprite(createFileTexture);
    createFile.on('mousedown', onCreateFileClick);
    createFile.x = 550;
    createFile.y = 130;
    createFile.interactive = true;
    createFile.buttonMode = true;
    fileCanvas.addChild(createFile);

    createFolder = new Sprite(createFolderTexture);
    createFolder.on('mousedown', onCreateFolderClick);
    createFolder.x = 590;
    createFolder.y = 129;
    createFolder.interactive = true;
    createFolder.buttonMode = true;
    fileCanvas.addChild(createFolder);
}


//========================================//
//              Event Handlers
//========================================//

function onFolderClick() {
    let i = 0;
    currentFiles = [];
    sketchCanvas.removeChild(pathText)
    clearCanvas(labelCanvas);

    draw = new Sprite(drawTexture);
    draw.on('mousedown', onDrawClick);
    draw.x = 630;
    draw.y = 129;
    draw.interactive = true;
    draw.buttonMode = true;
    sketchCanvas.addChild(draw);

    fileOp.readFiles(chosenPath, (filepath, name, ext, stat) => {

        let fileSprite = new Sprite(fileTexture);
        fileSprite.anchor.set(0.5);
        fileSprite.interactive = true;
        fileSprite.buttonMode = true;
        fileSprite.myCustomProperty = craftFileInfo(filepath, name, ext, stat);
        fileSprite.on('mousedown', onFileClick);
        currentFiles.push(fileSprite);
        i++; 
    });
    let checkExist = setInterval(function() {
        if (currentFiles.length) {
           console.log("Exists!");
           populateFiles(currentFiles);
           clearInterval(checkExist);
        }
     }, 100); 
}

function onHomeClick() {
    removeOptions();

    console.log('home click');
    chosenPath = homePath;
    onFolderClick();
}

function onDesktopClick() {
    removeOptions();

    console.log('desktop click');
    chosenPath = desktopPath
    onFolderClick();
}

function onDocumentsClick() {
    removeOptions();

    console.log('Documents click');
    chosenPath = documentsPath
    onFolderClick();
}

function onCreateFileClick() {
    fileOp.createFile(chosenPath);
    onFolderClick();
}

function onCreateFolderClick() {
    fileOp.createFolder(chosenPath);
    onFolderClick();
}

function onDrawClick() {
    clearCanvas(labelCanvas);
    clearCanvas(fileCanvas);

    backArrow = new Sprite(leftTexture);
    backArrow.on('mousedown', function(e){ 
        clearCanvas(fileCanvas);
        onFolderClick(); 
    });
    backArrow.x = 185;
    backArrow.y = 130;
    backArrow.interactive = true;
    backArrow.buttonMode = true;
    fileCanvas.addChild(backArrow);
}

function onFileClick (event) { 
    displayFile(event.target.myCustomProperty)
}

function onDirUpClick() {
    chosenPath = fileOp.getParentDir(chosenPath);
    onFolderClick(chosenPath);
}

function onLeftClick(){
    displayTracker= displayTracker - 1;
    sketchCanvas.removeChild(pathText);
    populateFiles(currentFiles);

}

function onRightClick() {
    displayTracker = displayTracker + 1;
    sketchCanvas.removeChild(pathText);
    populateFiles(currentFiles);
}

//========================================//
//========================================//
