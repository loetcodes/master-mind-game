/* Javascript for MasterMind 2.0 */

import {ScoreGame} from "./modules/gameScoring.js"
import {AnswerGenerator} from "./modules/gameAnswerGenerator.js"
import {BoardCanvas, Board, ColorCircle, GameCircle} from "./modules/gameBoard.js"
import {GameControlButton} from "./modules/gameControls.js"
import {ratingMsgs, RatingSystem} from "./modules/starRating.js"


// The urls for the pegs, board, icon and answer images to be used in the game.
let peg_colors = 8;
let peg_urls = ["./images/circle_pegs/04_Peg_navyblue.png", "./images/circle_pegs/04_Peg_brown.png", "./images/circle_pegs/04_Peg_green.png", "./images/circle_pegs/04_Peg_teal.png", "./images/circle_pegs/04_Peg_purple.png", "./images/circle_pegs/04_Peg_lightgold.png", "./images/circle_pegs/04_Peg_pink.png", "./images/circle_pegs/04_Peg_red.png"];
let icons_url = ["./images/06_Buttons_back.png", "./images/06_Buttons_new_game.png", "./images/06_Buttons_hint.png", "./images/06_Buttons_check_answer.png", "./images/09_3_Stars_black.png", "./images/09_3_Stars_gold.png"];
let answer_url = ["./images/05_Answer_red_2.png", "./images/05_Answer_white_2.png"];
let noHintsUrl = "./images/08_X-Icon.png";


// The urls for the board holes and answer pegs for 4, 5 and 6 boards.
let board_hole_url;
let boardhole_url4 = ["./images/02_Line_4.png", "./images/03_Answer_box_4.png"];
let boardhole_url5 = ["./images/02_Line_5.png", "./images/03_Answer_box_5.png"];
let boardhole_url6 = ["./images/02_Line_6.png", "./images/03_Answer_box_6.png"];

var width, height, board_canvas;
let canvas_size, canvas_1, canvas_2, ctx_1, ctx_2;
let num_board_holes, totalHints, row_poses;
let color_images, game_ctrls_imgs, answer_images, num_board;
let game_ctrls = {};
let color_panel = 0;
let score_row_start = 0;
let player_row_start = 0;
let right_panel_start = 0;
// let curr_play_row = 10;
let color_pegs = []; // stores the color pegs shapes
let preloaded = false;
let initialized = false;
let hintsGiven = [];
let mainBoard, codeAnswers;
let newGameYes, newGameNo, hintClose, goBackYes, goBackNo;
let popUpItems = ['back-dialog', 'hint-dialog','newgame-dialog']; 


// GET THE GAME BOARD VARIABLES FOR BOARD VALUE, INITIALIZE CONTROL ITEMS AS WELL.

num_board_holes = parseInt(document.getElementById('board_value').textContent);
totalHints = num_board_holes - 1;
row_poses = new Array(num_board_holes).fill(0);
board_hole_url = setBoardUrls(num_board_holes);


// INITIALIZE GAME VARIABLES AND ITEMS. -----------------------------
init();

//Play the game.
mainGamePlay(mainBoard);


// FUNCTION DECLARATIONS --------------------------------------------
function init(){
	// Get game canvas
	canvas_1 = document.getElementById('game-bottom');
	canvas_2 = document.getElementById('game-player');

	// Create a board Canvas class, then the initial game canvas based on whether it is 4, 5 or 6 game.
	sizeInitialCanvas(num_board_holes, width, height, canvas_1, canvas_2);

	// Preload the game images
	color_images = preloadGameImages(peg_urls);
	num_board = preloadGameImages(board_hole_url);
	game_ctrls_imgs = preloadGameImages(icons_url);
	answer_images = preloadGameImages(answer_url);
	initialized = true;

	// Create first round of game answers.
	let baseValues, codeAnsRound;
	codeAnswers = new AnswerGenerator(num_board_holes);
	baseValues = codeAnswers.generateRandomNumbers(num_board_holes);
	codeAnsRound = codeAnswers.newGameAnswers(baseValues, num_board_holes);

	// Draw Board graphics and initialize the item objects, then set this main Board.
	mainBoard = drawBoardItems(num_board_holes, codeAnswers);
	mainBoard.game_answers = codeAnsRound;
	mainBoard.color_images = color_images;
	return mainBoard;
}


function setBoardUrls(num_board_holes) {
	// Sets the urls for the board hole based on the number of board hole.
	let board_url;
	if (num_board_holes === 4) {
		board_url = boardhole_url4;
	} else if (num_board_holes === 5) {
		board_url = boardhole_url5;
	} else if (num_board_holes === 6) {
		board_url = boardhole_url6;
	}
	return board_url;
}


function sizeInitialCanvas(num_board_holes, width, height, canvas_1, canvas_2) {
	// Creates a Board canvas of set width and height and sizes the canvas
	let width_ratio_width = 9;
	let width_ratio_height = 16;
	if (num_board_holes === 6) {
		width_ratio_width = 10;
		width_ratio_height = 16;
	}
	board_canvas = new BoardCanvas(window.innerWidth, window.innerHeight, width_ratio_width, width_ratio_height);
	let canvas_size = board_canvas.canvas_size;
	width = canvas_size.width;
	height = canvas_size.height;
	
	// Size the given canvas and context
	canvas_1.width  = canvas_size.width;
	canvas_1.height = canvas_size.height;
	canvas_2.width  = canvas_size.width;
	canvas_2.height = canvas_size.height;

	ctx_1 = canvas_1.getContext('2d');
	ctx_1.width = canvas_size[width];
	ctx_1.height = canvas_size[height];
	ctx_2 = canvas_2.getContext('2d');
	ctx_2.width = canvas_size[width];
	ctx_2.height = canvas_size[height];
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
	board.game_state = true;
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
		if (item !== elementIdName) {otherElementIds.push(item);}
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
		board.game_state = false;
	}
	return gameFunc;
}


function startNewGame(board, codeAnswer, color_images) {
	let roundAnswers, topRow, baseValues, newAnswers;
	// Close any other dialog boxes.
	resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');

	// Clear the top canvas for a new game, then initialize new variables.
	board.clearFromCanvas(board.ctx_2, 0, 0, board.width, board.height);

	// Return game state to initial states.
	board.row_answers = board.row_answers.fill(0);
	board.curr_play_row = 10;
	board.col_selected = false;
	totalHints = board.boardSize - 1;
	hintsGiven = [];
	board.game_state = true;

	// Return check answer back to start.
	board.moveCheckButton('checkBtn', board.curr_play_row);

	// Clear current game answers from canvas, drawing graphics on ctx_1.
	board.drawGameAnswersBox(board);

	// Generate new game answers and set the game answers.
	baseValues = board.game_answers;
	newAnswers = codeAnswer.newGameAnswers(baseValues, board.boardSize);
	board.game_answers = newAnswers;

	// Draw the game round answers.
	topRow = board.row_circles[0];
	board.drawAnswer(board, topRow, color_images);
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
		if (board.game_state) {
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
				let imgItem = color_images[board.game_answers[answerIdx]]
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
			board.game_state = false;
		}
	}
	return getHint;
}


function drawBoardItems(num_board_holes, codeAnswer) {
	// set edge size variable.
	let spaces = {
		4 : {edge_size: 0.02, x_space : 0.012, y_space : 0.10, x_box_space : 0.005, hole_y : 0.12, rel_row_y: 0},
		5 : {edge_size: 0.015, x_space : 0.005, y_space : 0.28, x_box_space : 0.010, hole_y : 0.18, rel_row_y: 0.001},
		6 : {edge_size: 0.015, x_space : 0.008, y_space : 0.20, x_box_space : 0.008, hole_y : 0.23, rel_row_y: 0.001},
	};

	// Create a new board
	let board = new Board(canvas_1, canvas_2, ctx_1, ctx_2, num_board_holes);
	let edge_size, x_space, y_space, x_box_space, hole_y, rel_row_y;
	let board_space = spaces[num_board_holes];
	edge_size = board_space.edge_size;
	x_space = board_space.x_space;
	y_space = board_space.y_space;
	x_box_space = board_space.x_box_space;
	hole_y = board_space.hole_y;
	rel_row_y = board_space.rel_row_y; // Adds additional spacing between the rows.

	// Draw left side color panels on ctx_1
	board.drawLeftSidePegs(peg_colors, edge_size, color_panel, color_pegs, color_images, ColorCircle, ctx_1);
	color_pegs = board.color_pegs;
	
	// Draw the Row Scoring boxes and then Create Scoring Pegs for the game.
	let rows = 10;
	score_row_start = board.color_panel + x_space * canvas_1.width;
	board.drawScoreRowPegs(score_row_start, y_space, rel_row_y, board.color_panel, num_board, rows, ctx_1, answer_images);

	// Draw Row Player Hole boxes, Answer Hole box.
	let box_allowance = x_box_space * canvas_1.width;
	player_row_start = canvas_1.width - board.color_panel + box_allowance;
	board.drawPlayerRowHole(player_row_start, rel_row_y, box_allowance, board.color_panel, hole_y, num_board, rows, ctx_1, ctx_2, GameCircle, board, color_images);

	// Add Event Listeners to the dialog box actions.
	newGameYes = document.getElementById('new-game-yes');
	newGameNo = document.getElementById('new-game-no');
	hintClose = document.getElementById('hint-close');
	goBackYes = document.getElementById('go-back-yes');
	goBackNo = document.getElementById('go-back-no'); 
	newGameYes.addEventListener('click', function () {
		startNewGame(board, codeAnswer, color_images);
	});
	newGameNo.addEventListener('click', function() {
		resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');
	});
	hintClose.addEventListener('click', function() {
		resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');
	});
	goBackYes.addEventListener('click', function () {
		resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');
	});
	goBackNo.addEventListener('click', function () {
		resumeGameState(board, 'back-dialog', 'hint-dialog','newgame-dialog');
	});

	// Draw the Game Controls - Check Row
	let check_icon = game_ctrls_imgs[4];
	board.drawCheckButton(check_icon, rel_row_y, ColorCircle, ctx_1);

	// Add Other features - New Game, Hint, Back.
	let newGame, backBtn, hintBtn;

	// 1. New game button feature.
	let newGameIcon = game_ctrls_imgs[2];
	let positionX = board.width - (0.01 * board.width);
	let positionY = board.height - (0.1 * board.row_grid_height);
	let newGameOption = gamePopUpBox(board, 'newgame-dialog');
	newGame = createGameControl(board, board.ctx_1, board.row_grid_height, 'newGameBtn', ColorCircle, newGameIcon, positionX, positionY, newGameOption);
	addGameControl(board, newGame);

	// 2. Back button feature.
	let backBtnIcon = game_ctrls_imgs[1];
	let goBackOption = gamePopUpBox(board, 'back-dialog');
	positionX = (0.02 * board.width) + board.color_panel / 2;
	backBtn = createGameControl(board, board.ctx_1, board.row_grid_height, 'backBtn', ColorCircle, backBtnIcon, positionX, positionY, goBackOption);
	addGameControl(board, backBtn);

	// 3. Hint button feature.
	let hintBtnIcon = game_ctrls_imgs[3];
	let getHint = generateHintItem(board, 'hint-dialog');
	positionX = (board.width / 2) + board.color_panel / 4;
	hintBtn = createGameControl(board, board.ctx_1, board.row_grid_height, 'hintBtn', ColorCircle, hintBtnIcon, positionX, positionY, getHint);
	addGameControl(board, hintBtn);
	return board;
}


function createGameControl(boardItem, context, itemHeight, name, DetectionCircle, itemIcon, relativeX, relativeY, functionality) {
	// Creates a functionality button used in the game.
	// Adds this button to the game_ctrls of the board.
	let newbtn, newArr, functionalArr, otherArr;
	let iconImageButton = new GameControlButton(boardItem, itemHeight, name, itemIcon);
	iconImageButton.drawButtonImage(boardItem, context, relativeX, relativeY, DetectionCircle, functionality);
	return iconImageButton;
}


function addGameControl(boardItem, controlItem) {
	// Adds a functionality to the game control property in the board.
	let ctrlsArr = controlItem.getButtonControl();
	let ctrlsName = controlItem.name;
	boardItem.game_ctrls[ctrlsName] = ctrlsArr;	
}


function mainGamePlay(board) {
	// Define the scoring class used to score the images.
	let scoreClass = new ScoreGame(board.game_answers);
	board.scoreClass = scoreClass;

	// Define the rating system to be used when scoring the game.
	let minRating = 0;
	let maxRating = 3;
	let ratingRatio = [1, 2, 3, 2, 2, 1]; // Ratios sum should match highestLevel + 1
	let highestLevel = 10;
	let gameRating = new RatingSystem (maxRating, minRating, ratingRatio, highestLevel);
	gameRating.msgRating(ratingRatio, highestLevel);
	board.ratingSys = gameRating;
	// Since rating is defined, draw stars as well.
	let starsBack = game_ctrls_imgs[5];
	let starsFront = game_ctrls_imgs[6];
	gameRating.drawStarImgs(board, board.width, board.ctx_1, starsBack, starsFront, board.row_grid_height);

	console.log('BOARD AFTER STARS IS NOW', board);

	board.playGame(color_images, answer_images);
}


function preloadGameImages(image_files) {
	// Preload images into a dictionary where the number is the key and property the image.
	let img_files = {};
	let curr_load = 0;
	let total_load = image_files.length;
	preloaded = false;
	for (let i = 0; i < image_files.length; i++) {
		// Create and load the image object
		let img = new Image();
		img.onload = function () {
			curr_load++;
			if (curr_load == total_load) {
				preloaded = true;
			}
		};
		// Set the source of the image and add to img_files
		img.src = image_files[i];
		img_files[i + 1] = img;
	}
	return img_files;
}