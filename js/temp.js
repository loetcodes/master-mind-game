/* Javascript for MasterMind 2.0 */


import {BoardCanvas, Board, ColorCircle, GameCircle} from "./modules/gameBoard.js"




// The urls for the pegs, board, icon and answer images to be used in the game.
let peg_colors = 8;
let peg_urls = ["./images/circle_pegs/04_Peg_navyblue.png", "./images/circle_pegs/04_Peg_brown.png", "./images/circle_pegs/04_Peg_green.png", "./images/circle_pegs/04_Peg_teal.png", "./images/circle_pegs/04_Peg_purple.png", "./images/circle_pegs/04_Peg_lightgold.png", "./images/circle_pegs/04_Peg_pink.png", "./images/circle_pegs/04_Peg_red.png"];
let icons_url = ["./images/06_Buttons_back.png", "./images/06_Buttons_new_game.png", "./images/06_Buttons_hint.png", "./images/06_Buttons_check_answer.png", "./images/09_3_Stars_black.png", "./images/09_3_Stars_gold.png"];
let answer_url = ["./images/05_Answer_red_2.png", "./images/05_Answer_white_2.png"];

// The urls for the board holes and answer pegs for 4, 5 and 6 boards.
let board_hole_url;
let boardhole_url4 = ["./images/02_Line_4.png", "./images/03_Answer_box_4.png"];
let boardhole_url5 = ["./images/02_Line_5.png", "./images/03_Answer_box_5.png"];
let boardhole_url6 = ["./images/02_Line_6.png", "./images/03_Answer_box_6.png"];

var width, height, board_canvas;
let canvas_size, canvas_1, canvas_2, ctx_1, ctx_2;
let num_board_holes, total_hints, row_poses;
let color_images, game_ctrls_imgs, answer_images, num_board;
let color_panel = 0;
let score_row_start = 0;
let player_row_start = 0;
let right_panel_start = 0;
let color_pegs = []; // stores the color pegs shapes
let preloaded = false;
let initialized = false;



// GET THE GAME BOARD VARIABLES FOR BOARD VALUE, COMPUTE AND STORE ANSWERS.

num_board_holes = parseInt(document.getElementById('board_value').textContent);
total_hints = num_board_holes - 1;
row_poses = new Array(num_board_holes).fill(0);
board_hole_url = setBoardUrls(num_board_holes);


// INITIALIZE GAME VARIABLES AND ITEMS. -----------------------------
init();

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

	// Draw Board graphics and initialize the item objects.
	drawBoardItems(num_board_holes);

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


function drawBoardItems(num_board_holes) {
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
	for (let k = 1; k <= 8; k++) {
		board.drawLeftSidePegs(edge_size, color_panel, color_pegs, color_images, k , ColorCircle, ctx_1);
	}
	color_pegs = board.color_pegs;
	
	// Draw the Row Scoring boxes.
	let rows = 10;
	score_row_start = board.color_panel + x_space * canvas_1.width;
	board.drawScoreRowPegs(score_row_start, y_space, rel_row_y, board.color_panel, num_board, rows, ctx_1);

	// Draw Row Player Hole boxes and Answer Hole box.
	let box_allowance = x_box_space * canvas_1.width;
	player_row_start = canvas_1.width - board.color_panel + box_allowance;
	board.drawPlayerRowHole(player_row_start, rel_row_y, box_allowance, board.color_panel, hole_y, num_board, rows, ctx_1, ctx_2, GameCircle, board);
	
	
	// Set and Draw Game answers below answer box.


	// Draw the Game buttons - Back, Hint, New game, Check Row.



}


// function drawSideColorPanel() {
// 	// Draws the Side Color Panel.
// 	pass
// }

// function drawRowScoreBox() {
// 	// Draws the Row Scoring Boxes.
// 	pass
// }

// function drawPlayerRowBox() {
// 	// Draws the Player Row Box.
// 	pass
// }


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