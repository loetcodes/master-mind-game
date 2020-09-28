/* Javascript for MasterMind 2.0 */

import { ScoreGame } from "./modules/gameScoring.js";
import { AnswerGenerator } from "./modules/gameAnswerGenerator.js";
import {
  BoardCanvas,
  Board,
  ColorCircle,
  GameCircle
} from "./modules/gameBoard.js";
import { GameControlButton } from "./modules/gameControls.js";
import { ratingMsgs, RatingSystem } from "./modules/starRating.js";

// The urls for the pegs, board, icon and answer images to be used in the game.
let pegColors = 8;
let pegUrls = [
  "./images/circle_pegs/04_Peg_navyblue.png",
  "./images/circle_pegs/04_Peg_brown.png",
  "./images/circle_pegs/04_Peg_green.png",
  "./images/circle_pegs/04_Peg_teal.png",
  "./images/circle_pegs/04_Peg_purple.png",
  "./images/circle_pegs/04_Peg_lightgold.png",
  "./images/circle_pegs/04_Peg_pink.png",
  "./images/circle_pegs/04_Peg_red.png"
];
let iconsUrls = [
  "./images/06_Buttons_back.png",
  "./images/06_Buttons_new_game.png",
  "./images/06_Buttons_hint.png",
  "./images/06_Buttons_check_answer.png",
  "./images/09_3_Stars_black.png",
  "./images/09_3_Stars_gold.png"
];
let answersUrls = [
  "./images/05_Answer_red_2.png",
  "./images/05_Answer_white_2.png"
];
let noHintsUrl = "./images/08_X-Icon.png";

// The urls for the board holes and answer pegs for 4, 5 and 6 boards.
let boardHoleUrl;
let boardHoleUrl4 = ["./images/02_Line_4.png", "./images/03_Answer_box_4.png"];
let boardHoleUrl5 = ["./images/02_Line_5.png", "./images/03_Answer_box_5.png"];
let boardHoleUrl6 = ["./images/02_Line_6.png", "./images/03_Answer_box_6.png"];

var width, height, boardCanvas;
let canvasSize, canvas1, canvas2, ctx1, ctx2;
let numBoardHoles, totalHints, rowPoses;
let colorImages, gameCtrlsImgs, answerImages, numBoard;
let gameCtrls = {};
let colorPanel = 0;
let scoreRowStart = 0;
let playerRowStart = 0;
let colorPegs = []; // stores the color pegs shapes
let preloaded = false;
let initialized = false;
let hintsGiven = [];
let mainBoard, codeAnswers;
let newGameYes, newGameNo, hintClose, goBackYes, goBackNo;
let popUpItems = ['back-dialog', 'hint-dialog','newgame-dialog'];

// GET THE GAME BOARD VARIABLES FOR BOARD VALUE, INITIALIZE CONTROL ITEMS AS WELL.

numBoardHoles = parseInt(document.getElementById('board_value').textContent);
totalHints = numBoardHoles - 1;
rowPoses = new Array(numBoardHoles).fill(0);
boardHoleUrl = setBoardUrls(numBoardHoles);

// INITIALIZE GAME VARIABLES AND ITEMS. -----------------------------
init();

// FUNCTION DECLARATIONS --------------------------------------------
function init(){
	// Get game canvas
	canvas1 = document.getElementById('game-bottom');
	canvas2 = document.getElementById('game-player');

	// Create a board Canvas class, then the initial game canvas based on whether it is 4, 5 or 6 game.
	sizeInitialCanvas(numBoardHoles, width, height, canvas1, canvas2);

	// Preload the game images
	answerImages = preloadGameImages(answersUrls);
	numBoard = preloadGameImages(boardHoleUrl);
	colorImages = preloadGameImages(pegUrls);
	gameCtrlsImgs = preloadGameImages(iconsUrls);
	initialized = true;

	// Create first round of game answers.
	let baseValues, codeAnsRound;
	codeAnswers = new AnswerGenerator(numBoardHoles);
	baseValues = codeAnswers.generateRandomNumbers(numBoardHoles);
	codeAnsRound = codeAnswers.newGameAnswers(baseValues, numBoardHoles);

	// Draw Board graphics and initialize the item objects, set event listeners.
	mainBoard = drawBoardItems(numBoardHoles, codeAnswers);
	mainBoard.gameAnswers = codeAnsRound;
	mainBoard.colorImages = colorImages;
}


function setBoardUrls(numBoardHoles) {
	// Sets the urls for the board hole based on the number of board hole.
	let boardUrl;
	if (numBoardHoles === 4) {
		boardUrl = boardHoleUrl4;
	} else if (numBoardHoles === 5) {
		boardUrl = boardHoleUrl5;
	} else if (numBoardHoles === 6) {
		boardUrl = boardHoleUrl6;
	}
	return boardUrl;
}


function sizeInitialCanvas(numBoardHoles, width, height, canvas1, canvas2) {
	// Creates a Board canvas of set width and height and sizes the canvas
	let ratioWidth = 9;
	let ratioHeight = 16;
	if (numBoardHoles === 6) {
		ratioWidth = 10;
		ratioHeight = 16;
	}
	boardCanvas = new BoardCanvas(
    window.innerWidth,
    window.innerHeight,
    ratioWidth,
    ratioHeight
  );
	let canvasSize = boardCanvas.canvasSize;
	width = canvasSize.width;
	height = canvasSize.height;
	
	// Size the given canvas and context
	canvas1.width  = canvasSize.width;
	canvas1.height = canvasSize.height;
	canvas2.width  = canvasSize.width;
	canvas2.height = canvasSize.height;

	ctx1 = canvas1.getContext('2d');
	ctx1.width = canvasSize[width];
	ctx1.height = canvasSize[height];
	ctx2 = canvas2.getContext('2d');
	ctx2.width = canvasSize[width];
	ctx2.height = canvasSize[height];
}


function resumeGameState(boardItem, ...element_ids) {
	// Function that takes an element_id and puts its display to none, based on any parameters.
	let board = boardItem;
	for (let arg_id of element_ids) {
		let element = document.getElementById(arg_id);
		element.classList.remove("load-dialog");
		element.classList.add("unload-dialog");
		window.setTimeout(() => {
			element.style.display = "none";
			element.classList.remove("unload-dialog");
			element.classList.add("load-dialog");
		}, 1500);
	}
	board.gameState = true;
}


function delayPageNav(url) {
  window.setTimeout( () =>{
    window.location = url 
  }, 1200);
}


function createDialogBoxSize(maxWidth) {
	// Function that creates the size of the dialog box based on the window view.
	let dialogWidth, dialogHeight;
	let dialogDims = {};
	let tempWidth = window.innerWidth / 2;
	if (tempWidth >= maxWidth) {
		dialogWidth = tempWidth * 0.50;
		dialogHeight = window.innerHeight / 4;
	} else {
		dialogWidth = tempWidth;
		dialogHeight = window.innerHeight / 4;
	}
	dialogDims["dialogWidth"] = dialogWidth;
	dialogDims["dialogHeight"] = dialogHeight;
	dialogDims["maxWidth"] = maxWidth;
	dialogDims["marginLeft"] = 0 - dialogWidth / 2;
	dialogDims["marginTop"] = 0 - dialogHeight / 2;
	return dialogDims;
}


function gamePopUpBox(board, elementIdName) {
	// Returns a function that opens a dialog box.
	let maxBoxWidth = board.width;
	let elementBox = document.getElementById(elementIdName);
	let otherElementIds = [];
	for (let item of popUpItems) {
		if (item !== elementIdName) {
            otherElementIds.push(item);
        }
	}

	function gameFunc() {
		// Close any dialog boxes that may have been open.
		resumeGameState(board, ...otherElementIds);
		let boxDims = createDialogBoxSize(maxBoxWidth);
		elementBox.style.width = `${boxDims["dialogWidth"]}` + "px";
		elementBox.style.height = `${boxDims["dialogHeight"]}` + "px";
		elementBox.style.maxWidth = `${boxDims["maxWidth"]}` + "px";
		elementBox.style.marginLeft = `${boxDims["marginLeft"]}` + "px";
		elementBox.style.marginTop = `${boxDims["marginTop"]}` + "px";
		elementBox.style.display = "flex";
		// set game state to false
		board.gameState = false;
	}
	return gameFunc;
}


function startNewGame(board, codeAnswer, colorImages) {
	let roundAnswers, topRow, baseValues, newAnswers;
	// Close any other dialog boxes.
	resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');

	// Clear the top canvas for a new game, then initialize new variables.
	board.clearFromCanvas(board.ctx2, 0, 0, board.width, board.height);

	// Return game state to initial states.
	board.rowAnswers = board.rowAnswers.fill(0);
	board.currPlayRow = 10;
	board.colSelected = false;
	totalHints = board.boardSize - 1;
	hintsGiven = [];
	board.gameState = true;

	// Return check answer back to start.
	board.moveCheckButton('checkBtn', board.currPlayRow);

	// Clear current game answers from canvas, drawing graphics on ctx1.
	board.drawGameAnswersBox(board);

	// Generate new game answers and set the game answers.
	baseValues = board.gameAnswers;
	newAnswers = codeAnswer.newGameAnswers(baseValues, board.boardSize);
	board.gameAnswers = newAnswers;

	// Draw the game round answers.
	topRow = board.rowCircles[0];
	board.drawAnswer(board, topRow, colorImages);
}


function getRandomRangeNum(min, max) {
	// Returns a random number within a min-max range
	return Math.floor(Math.random() * (max - min)) + min;
}


function generateHintItem(board, elementId) {
	let maxBoxWidth = board.width;
	let hintImg = document.getElementById("hint-img");
	let hintCount = document.getElementById("hint-num");
	let elementBox = document.getElementById(elementId);

	function getHint() {
		if (board.gameState) {
			let boxDims = createDialogBoxSize(maxBoxWidth);
			elementBox.style.width = `${boxDims["dialogWidth"]}` + "px";
			elementBox.style.height = `${boxDims["dialogHeight"]}` + "px";
			elementBox.style.maxWidth = `${boxDims["maxWidth"]}` + "px";
			elementBox.style.marginLeft = `${boxDims["marginLeft"]}` + "px";
			elementBox.style.marginTop = `${boxDims["marginTop"]}` + "px";

			// Check if any hints are available.
			if(totalHints > 0) {
				// Random value between 0 and peg holes - 1.
				let numHoles = board.boardSize;
				let answerIdx = getRandomRangeNum(0, numHoles);
				while (hintsGiven.includes(answerIdx)) {
					answerIdx = getRandomRangeNum(0, numHoles);
				}
				// Add hint index to hint arr, set img src, deduct from total hints.
				hintsGiven.push(answerIdx);
				let imgItem = colorImages[board.gameAnswers[answerIdx]]
				let imgSrc = imgItem.src;
				hintImg.src = imgSrc;
				totalHints --;
				hintCount.innerHTML = totalHints;
			} else {
				// No more hints available. 
				let imgSrc = noHintsUrl;
				hintImg.src = imgSrc;
				hintCount.innerHTML = "No";
			}
			// Display the hint item and set game state to false.
			elementBox.style.display = "grid";
			board.gameState = false;
		}
	}
	return getHint;
}

function drawBoardItems(numBoardHoles, codeAnswer) {
	// set edge size variable.
	let spaces = {
		4 : {
            edgeSize: 0.02,
            xSpace : 0.012,
            ySpace : 0.10,
            xBoxSpace : 0.005,
            holeY : 0.12,
            relRowY: 0
        },
		5 : {
            edgeSize: 0.015,
            xSpace : 0.005,
            ySpace : 0.28,
            xBoxSpace : 0.010,
            holeY : 0.18,
            relRowY: 0.001
        },
        6 : {
            edgeSize: 0.015,
            xSpace : 0.008,
            ySpace : 0.20,
            xBoxSpace : 0.008,
            holeY : 0.23,
            relRowY: 0.001
        }
	};

	// Create a new board
	let board = new Board(canvas1, canvas2, ctx1, ctx2, numBoardHoles);
	let edgeSize, xSpace, ySpace, xBoxSpace, holeY, relRowY;
	let boardSpace = spaces[numBoardHoles];
	edgeSize = boardSpace.edgeSize;
	xSpace = boardSpace.xSpace;
	ySpace = boardSpace.ySpace;
	xBoxSpace = boardSpace.xBoxSpace;
	holeY = boardSpace.holeY;
	relRowY = boardSpace.relRowY; // Adds additional spacing between the rows.

	// Draw left side color panels on ctx1
    board.drawLeftSidePegs(pegColors, edgeSize, colorPanel, colorPegs,
        colorImages, ColorCircle, ctx1);
	colorPegs = board.colorPegs;
	
	// Draw the Row Scoring boxes and then Create Scoring Pegs for the game.
	let rows = 10;
    scoreRowStart = board.colorPanel + xSpace * canvas1.width;
    board.drawScoreRowPegs(scoreRowStart, ySpace, relRowY, board.colorPanel,
        numBoard, rows, ctx1, answerImages);
    board.createScorePegs(answerImages);


	// Draw Row Player Hole boxes, Answer Hole box.
	let boxAllowance = xBoxSpace * canvas1.width;
	playerRowStart = canvas1.width - board.colorPanel + boxAllowance;
    board.drawPlayerRowHole(relRowY, boxAllowance, board.colorPanel, holeY,
        numBoard, rows, ctx1, ctx2, GameCircle, board, colorImages);

	// Add Event Listeners to the dialog box actions.
	newGameYes = document.getElementById('new-game-yes');
	newGameNo = document.getElementById('new-game-no');
	hintClose = document.getElementById('hint-close');
	goBackYes = document.getElementById('go-back-yes');
	goBackNo = document.getElementById('go-back-no'); 
	newGameYes.addEventListener('click', function () {
		startNewGame(board, codeAnswer, colorImages);
	});
	newGameNo.addEventListener('click', function() {
		resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');
	});
	hintClose.addEventListener('click', function() {
		resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');
	});
	goBackYes.addEventListener('click', function (e) {
        let link = this.getAttribute('href');
        e.preventDefault();
        resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');
        delayPageNav(link);
	});
	goBackNo.addEventListener('click', function () {
		resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');
	});

	// Add Other features - New Game, Hint, Back.
	let newGame, backBtn, hintBtn;

	// 1. New game button feature.
	let newGameIcon = gameCtrlsImgs[2];
	let positionX = board.width - (0.01 * board.width);
	let positionY = board.height - (0.1 * board.rowGridHeight);
	let newGameOption = gamePopUpBox(board, 'newgame-dialog');
    newGame = createGameControl(board, board.ctx1, board.rowGridHeight, 'newGameBtn',
        ColorCircle, newGameIcon, positionX, positionY, newGameOption);
	addGameControl(board, newGame);

	// 2. Back button feature.
	let backBtnIcon = gameCtrlsImgs[1];
	let goBackOption = gamePopUpBox(board, 'back-dialog');
	positionX = (0.02 * board.width) + board.colorPanel / 2;
    backBtn = createGameControl(board, board.ctx1, board.rowGridHeight, 'backBtn',
        ColorCircle, backBtnIcon, positionX, positionY, goBackOption);
	addGameControl(board, backBtn);

	// 3. Hint button feature.
	let hintBtnIcon = gameCtrlsImgs[3];
	let getHint = generateHintItem(board, 'hint-dialog');
	positionX = (board.width / 2) + board.colorPanel / 4;
    hintBtn = createGameControl(board, board.ctx1, board.rowGridHeight, 'hintBtn',
        ColorCircle, hintBtnIcon, positionX, positionY, getHint);
	addGameControl(board, hintBtn);

	// Draw the Game Controls - Check Row
	let checkIcon = gameCtrlsImgs[4];
	board.drawCheckButton(checkIcon, relRowY, ColorCircle, ctx1, board);

	mainGamePlay(board);
	
	return board;
}


function createGameControl(boardItem, context, itemHeight, name, DetectionCircle,
    itemIcon, relativeX, relativeY, functionality) {
	// Creates a functionality button used in the game.
	// Adds this button to the gameCtrls of the board.
	let newbtn, newArr, functionalArr, otherArr;
	let iconImageButton = new GameControlButton(boardItem, itemHeight, name, itemIcon);
    iconImageButton.drawButtonImage(boardItem, context, relativeX, relativeY,
        DetectionCircle, functionality);
	return iconImageButton;
}


function addGameControl(boardItem, controlItem) {
	// Adds a functionality to the game control property in the board.
	let ctrlsArr = controlItem.getButtonControl();
	let ctrlsName = controlItem.name;
	boardItem.gameCtrls[ctrlsName] = ctrlsArr;	
}


function mainGamePlay(board) {
	// Define the scoring class used to score the images.
	let scoreClass = new ScoreGame(board.gameAnswers);
	board.scoreClass = scoreClass;

	// Define the rating system to be used when scoring the game.
	let minRating = 0;
	let maxRating = 3;
	let ratingRatio = [1, 2, 3, 2, 2, 1]; // Ratios sum should match highestLevel + 1
	let highestLevel = 10;
	let gameRating = new RatingSystem(maxRating, minRating, ratingRatio, highestLevel);
	gameRating.msgRating(ratingRatio, highestLevel);
	board.ratingSys = gameRating;
	// Since rating is defined, draw stars as well.
	let starsBack = gameCtrlsImgs[5];
	let starsFront = gameCtrlsImgs[6];
	gameRating.drawStarImgs(board, board.width, board.ctx1, starsBack, starsFront, board.rowGridHeight);

	board.playGame(colorImages, answerImages);
}


function preloadGameImages(imageFiles) {
	// Preload images into a dictionary where the number is the key and property the image.
	let imgFiles = {};
	let currLoad = 0;
	let totalLoad = imageFiles.length;
	preloaded = false;
	for (let i = 0; i < imageFiles.length; i++) {
		// Create and load the image object
		let img = new Image();
		img.onload = function () {
			currLoad++;
			if (currLoad == totalLoad) {
				preloaded = true;
			}
		};
		// Set the source of the image and add to imgFiles
		img.src = imageFiles[i];
		imgFiles[i + 1] = img;
	}
	return imgFiles;
}
