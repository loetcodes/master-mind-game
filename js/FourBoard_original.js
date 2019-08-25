/* Javascript for MasterMind 2.0

Made provisions for 2 canvases.
 1. Canvas for drawing the background fixed graphics.
 2. Canvas for drawing the player moves and temporary images in play.

*/


// Declare the two canvasses and the respective context.
let canvas_size, canvas_1, canvas_2, ctx_1, ctx_2;
canvas_1 = document.getElementById('game-bottom');
canvas_2 = document.getElementById('game-player');
let width, height;


sizeInitialCanvas(); // Initialize the canvas sizes and widths based on window
init(); // Initialize the rest of the game variables


// VARIABLES USED THROUGHOUT THE GAME
// The urls for the peg color images and board images to be used in the game
let peg_colors = 8;
let peg_url = {
	1 : "./images/circle_pegs/04_Peg_navyblue.png",
	2 : "./images/circle_pegs/04_Peg_brown.png",
	3 : "./images/circle_pegs/04_Peg_green.png",
	4 : "./images/circle_pegs/04_Peg_teal.png",
	5 : "./images/circle_pegs/04_Peg_purple.png",
	6 : "./images/circle_pegs/04_Peg_lightgold.png",
	7 : "./images/circle_pegs/04_Peg_pink.png",
	8 : "./images/circle_pegs/04_Peg_red.png"
};

let answer_pegs = {
	1 : "./images/05_Answer_red_2.png",
	2 : "./images/05_Answer_white_2.png"
}

let board_hole_url = {
	4 : "./images/02_Line_4.png",
	5 : "./images/02_Line_5.png",
	6 : "./images/02_Line_6.png",
	7 : "./images/03_Answer_box_4.png",
	8 : "./images/03_Answer_box_5.png",
	9 : "./images/03_Answer_box_6.png"
};

let icons_url = {
	"back" : "./images/06_Buttons_back.png",
	"new" : "./images/06_Buttons_new_game.png",
	"hint" : "./images/06_Buttons_hint.png",
	"submit" : "./images/06_Buttons_check_answer.png"
}

let num_board_holes = [4, 5, 6]; // Convert this to a dictionary
let score_cols = [1, 2];


// Initialize the game state to true. This will be true when the player starts the game. If false, then the game has ended, no more moves allowed.
let game_state = true;

let color_panel = 0;
let score_row_start = 0;
let player_row_start = 0;
let right_panel_start = 0;

let color_pegs = []; // stores the color pegs shapes
let color_images = {}; // store all the color panel images created.
let answer_images = {}; // store the answer images for the scoring holes.

let answ_poses = []; // stores x and y relative positions for drawing pos and col ans pegs

let row_circles = {};
let scoring_circles = {};

let row_poses = [0, 0, 0, 0];
let curr_play_row = 10;
let player_answers = [];
let col_selected = false; // For storing colors that are clicked on;

let game_ctrls = {}; // Stores the button objects
let ctrl_btns_action = {
	1 : "BACK BUTTON",
	2 : "NEW GAME BUTTON",
	3 : "SHOW HINT",
	4 : "CHECK ANSWER"
};

// let ctrl_btns_funcs = {
// 	1 : backIcon,
// 	2 : newGame,
// 	3 : showHint,
// 	4 : checkAnswer
// };

let ctrl_btns_funcs = {
	2 : startNewGame,
	4 : checkAnswer
};



// ---------------- COMPUTE THE ANSWERS FOR THE GAME AND STORE THEM ----------------

let base_array;
base_array = generateRandomNumbers(num_board_holes[0]); 
let game_answers = newGameAnswers(base_array, num_board_holes[0]);



// ------- DEFINE AND DRAW FIXED GRAPHICS ONTO THE BACKGROUND CANVAS -----------------

// Includes: Side color panel (8 colors), Scoring image pegs (10 rows), Player peg holes (10), Game control icons at the very bottom

let row_grid_height = canvas_1.height / 12;

// Left Side panel of colors
for (let k = 1; k <= 8; k++) {
	let img_height = row_grid_height - (0.40 * row_grid_height);
	let img_width = img_height;

	let img = new Image();
	img.src = peg_url[k];
	color_panel = img_width + (0.02 * canvas_1.width) * 2;
	img.onload = function () {
		let x_pos, y_pos, radius, x_pos_center, y_pos_center;

		x_pos = (0.02 * canvas_1.width); // 2 percent from the edge
		y_pos = k * row_grid_height + (row_grid_height - img_height) / 2;
		radius = (img_width) / 2;

		x_pos_center = x_pos + radius;
		y_pos_center = y_pos + img_height / 2;

		// Create a color peg object used later for detection of click, push to color pegs array. 
		let color_peg = new ColorCircle(x_pos_center, y_pos_center, radius, k, img_width, img_height);
		color_pegs.push(color_peg);

		// Store the color peg in the color_images dictionary
		color_images[k] = img;

		// Draw the image and the color circle.
		ctx_1.drawImage(img, x_pos, y_pos, img_width, img_height);
		// color_peg.drawColorCircle();
	}
}


// -------DEFINE AND DRAW THE SCORE IMAGE PEGS AND PLAYER HOLES IMAGES -----------------

score_row_start = color_panel + (0.012 * canvas_1.width);

// Draw the 10 scoring boxes.
let scoring_img_height, scoring_img_width, scoring_img_scale;
let scoring_img = new Image();
scoring_img.src = board_hole_url[7];
scoring_img.onload = function () {
	let x_pos, y_pos;
	scoring_img_scale = scoring_img.width / scoring_img.height;
	scoring_img_height = row_grid_height - (0.10 * row_grid_height);
	scoring_img_width = scoring_img_height * scoring_img_scale;
	x_pos = score_row_start;
	for (let i = 1; i <= 10; i++){
		y_pos = (i * row_grid_height) + (row_grid_height - scoring_img_height) / 2;
		drawImageOnCanvas(ctx_1, scoring_img, x_pos, y_pos, scoring_img_width, scoring_img_height);
	}
}

// Draw the 10 player peg hole images and the one for the machine answer row
let hole_img, hole_img_width, hole_img_height, hole_img_scale;
let ans_box_width, ans_box_height, ans_top_x, ans_top_y;
window.setTimeout(function() {
	hole_img = new Image();
	hole_img.src = board_hole_url[4];
	player_row_start = score_row_start + scoring_img_width + (0.02 * canvas_1.width) * 2;
	hole_img.onload = function () {
		let x_pos, y_pos;
		hole_img_scale = hole_img.width / hole_img.height;
		hole_img_height = row_grid_height - (0.20 * row_grid_height);
		hole_img_width = hole_img_height * hole_img_scale;
		x_pos = player_row_start;

		ans_box_width = hole_img_width + (0.03 * canvas_1.width) * 2;
		ans_box_height = hole_img_height + (0.05 * hole_img_height) * 2;
		for (let i = 0; i <= 10; i++) {
			if (i == 0) {
				// Draw the box containing the machine answers and the covers.
				drawGameAnswersBox(player_row_start, row_grid_height, hole_img, hole_img_width, hole_img_height, ans_box_width, ans_box_height);
			}
			// Draw the rest of the grid peg hole images
			y_pos = i * row_grid_height + (row_grid_height - hole_img_height) / 2;
			drawImageOnCanvas(ctx_1, hole_img, x_pos, y_pos, hole_img_width, hole_img_height);

			// Row circles array for each row, stored with a corresponding number.
			row_circles[i] = createRowCircles(x_pos, y_pos, hole_img_height, hole_img_width, num_board_holes[0], game_state);
		}
		drawGameAnswers(game_answers);
	}
}, 200);



//---------- CONTROL BUTTONS FOR BACK, NEW GAME, HINT AND CHECK ANSWER --------------

let back_icon, newgame_icon, hint_icon, check_icon

// back game icon located far left of the canvas
back_icon = new Image();
back_icon.src = icons_url["back"];

let back_icon_width, back_icon_height, back_icon_scale;
back_icon.onload = () => {
	let x_pos, y_pos, radius;
	let temp_no = 1;

	back_icon_scale = back_icon.width / back_icon.height;
	back_icon_height = row_grid_height  - (0.40 * row_grid_height);
	back_icon_width = back_icon_height * back_icon_scale;

	x_pos = (0.02 * canvas_1.width); // 2 percent from the edge
	y_pos = canvas_1.height - (0.1 * row_grid_height) - back_icon_height;
	radius = back_icon_height / 2;

	// Circle obj used later for click detection, push to right buttons. 
	let back_circle = new ColorCircle(x_pos + back_icon_width / 2, y_pos + back_icon_height / 2, radius, temp_no, back_icon_width, back_icon_height);
	game_ctrls[temp_no] = back_circle;

	// Draw the icon image
	ctx_1.drawImage(back_icon, x_pos, y_pos, back_icon_width, back_icon_height);
}


// new game icon located far right of the canvas
newgame_icon = new Image();
newgame_icon.src = icons_url["new"];

let newgame_icon_width, newgame_icon_height, newgame_icon_scale;
newgame_icon.onload = () => {
	let x_pos, y_pos, radius;
	let temp_no = 2;

	newgame_icon_scale = newgame_icon.width / newgame_icon.height;
	newgame_icon_height = row_grid_height  - (0.40 * row_grid_height);
	newgame_icon_width = newgame_icon_height * newgame_icon_scale;
	
	x_pos = canvas_1.width - (0.015 * canvas_1.width) - newgame_icon_width;
	y_pos = canvas_1.height - (0.1 * row_grid_height) - newgame_icon_height;
	radius = newgame_icon_width / 2;

	// Circle obj used later for click detection, push to right buttons.
	let newg_circle = new ColorCircle(x_pos + newgame_icon_width / 2, y_pos + newgame_icon_height / 2, radius, temp_no, newgame_icon_width, newgame_icon_height);
	game_ctrls[temp_no] = newg_circle;

	// Draw the icon image
	ctx_1.drawImage(newgame_icon, x_pos, y_pos, newgame_icon_width, newgame_icon_height);
}

// Hint icon located in the middle
hint_icon = new Image();
hint_icon.src = icons_url["hint"];

let hint_icon_width, hint_icon_height, hint_icon_scale;
hint_icon.onload = () => {
	let x_pos, y_pos, radius;
	let temp_no = 3;

	hint_icon_scale = hint_icon.width / hint_icon.height;
	hint_icon_height = row_grid_height  - (0.40 * row_grid_height);
	hint_icon_width = hint_icon_height * hint_icon_scale;

	x_pos = canvas_1.width / 2 - hint_icon_width / 2;
	y_pos = canvas_1.height - (0.1 * row_grid_height) - hint_icon_height;
	radius = hint_icon_width / 2;

	// Circle obj used later for click detection, push to right buttons.
	let hint_circle = new ColorCircle(x_pos + hint_icon_width / 2, y_pos + hint_icon_height / 2, radius, temp_no, hint_icon_width, hint_icon_height);
	game_ctrls[temp_no] = hint_circle;

	// Draw the icon image
	ctx_1.drawImage(hint_icon, x_pos, y_pos, hint_icon_width, hint_icon_height);
}


// Check icon at the bottom.
check_icon = new Image();
check_icon.src = icons_url["submit"];

let check_icon_width, check_icon_height;
check_icon.onload = () => {
	let radius, check_icon_scale;
	let temp_no = 4;

	check_icon_scale = check_icon.width / check_icon.height;
	check_icon_height = row_grid_height - (0.40 * row_grid_height);
	check_icon_width = check_icon_height * check_icon_scale;

	x_pos = canvas_1.width - (0.015 * canvas_1.width) - check_icon_width;
	y_pos = row_grid_height * (curr_play_row) + (row_grid_height - check_icon_height) / 2;
	radius = check_icon_width  / 2;

	// Circle obj used later for click detection and button movement
	let check_circle = new ColorCircle(x_pos + check_icon_width / 2, y_pos + check_icon_height / 2, radius, temp_no, check_icon_width, check_icon_height);
	game_ctrls[temp_no] = check_circle;

	// Draw the icon image
	ctx_1.drawImage(check_icon, x_pos, y_pos, check_icon_width, check_icon_height);
}




// ----------- DRAW THE DIVIDER BOTTOM LINE AND THE MACHINE ANSW COVER------------

// Bottom divider line that separates the controls.
let divider_line = () => {
	// draws a horizontal line across the board
	let start_x = 0;
	let start_y = canvas_1.height - row_grid_height + (0.15 * row_grid_height);
	let end_x = canvas_1.width;
	let end_y = start_y;

	ctx_2.strokeStyle = '#0b0b0c';
	ctx_2.lineWidth = 5;
	ctx_2.beginPath();
	ctx_2.moveTo(start_x, start_y);
	ctx_2.lineTo(end_x, end_y);
	ctx_2.stroke();
}
divider_line();



// ---------- DEFINE THE SCORING PEGS IMAGES FOR THE COLORS OF THE GAME --------------

let pospeg_answ, colpeg_answ;
window.setTimeout(function() {
	// Create the scoring pegs but dont draw until check answer is clicked on.
	let score_cols = [1, 2];
	let first_col = score_cols[0];
	let secnd_col = score_cols[1];
	let rel_height = scoring_img_height / 2 - (0.20 * scoring_img_height);

	// Peg used when the player scores one of the correct positions
	pospeg_answ  = new Image();
	pospeg_answ.src = answer_pegs[first_col];
	let pospeg_answ_width, pospeg_answ_height, pospeg_answ_scale;
	pospeg_answ.onload = () => {
		let pospeg_answ_x, pospeg_answ_y;
		pospeg_answ_scale = pospeg_answ.width / pospeg_answ.height;
		pospeg_answ_height = rel_height;
		pospeg_answ_width = pospeg_answ_height * pospeg_answ_scale;

		answer_images[1] = pospeg_answ;

		let pos_ans_coords = calculateRelativeScorePos(num_board_holes[0], score_row_start, scoring_img_width, scoring_img_height, pospeg_answ_width, pospeg_answ_height);

		answ_poses.push(pos_ans_coords); //Pos ans coords will always be the at index 0
	}

	// Peg used when the player scores one of the correct colors
	colpeg_answ  = new Image();
	colpeg_answ.src = answer_pegs[secnd_col];
	let colpeg_answ_width, colpeg_answ_height, colpeg_answscale;
	colpeg_answ.onload = () => {
		let colpeg_answ_x, colpeg_answ_y;
		colpeg_answscale = colpeg_answ.width / colpeg_answ.height;
		colpeg_answ_height = rel_height;
		colpeg_answ_width = colpeg_answ_height * colpeg_answscale;

		answer_images[2] = colpeg_answ;

		let pos_ans_coords = calculateRelativeScorePos(num_board_holes[0], score_row_start, scoring_img_width, scoring_img_height, colpeg_answ_width, colpeg_answ_height);

		answ_poses.push(pos_ans_coords); //Col ans coords will always be the at index 0
	}
}, 1000);



// -------------------------- EVENT LISTENERS  -------------------------------------

window.addEventListener('load', resize, false);
window.addEventListener('resize', resize, false);
canvas_2.addEventListener('click', (e) => {
	// Get location of the mouseclick event
	const pos = getMousePosition(canvas_2, e);

	// Check only if the game is in play
	if (game_state) {
		// Check if the mouseclick was on any of the colors on the side panel. 
		color_pegs.forEach(color_peg => {
			let click_result = checkIntersect(pos, color_peg);

			// Clear any randomly selected colors that have not been played
			clearSelectedColor(color_peg);
			if (click_result) {
				// Add the image selected to col_selected.
				col_selected = color_peg;

				// Draw a circle around the color selected and clear any other circles. #777777ba
				color_peg.drawColorCircle("#4c4f50", 4);
			}
		});

		// Identify the curr game row playing, then circle clicked.
		let circle_clicked = 0; // Identify the circle clicked.
		let check_circles = row_circles[curr_play_row];

		// Check each row for the current play row.
		check_circles.forEach(function (circle, i) {
			let circle_result = checkIntersect(pos, circle);
			if (circle_result) {
				// If clicked on the circle, check if their is a col_selected.
				if (col_selected) {
					// Means a color is selected. Create an obj to store details.
					let curr_col = {
						img_number : col_selected.img_number,
						src : color_images[col_selected.img_number],
						x : circle.x,
						y : circle.y,
						radius : circle.radius,
						width : col_selected.img_width,
						height : col_selected.img_height
					};
					row_poses[i] = curr_col;

					// Clear the color circle for the color panel
					clearSelectedColor(col_selected);

					// Set selected color to false
					col_selected = false;
				} else if (col_selected == false) {
					if (row_poses[i] != 0) {
						// Clicked on a circle with a color, hence remove that color.
						let top_x = circle.x - circle.radius;
						let top_y = circle.y - circle.radius;
						let clear_width = row_poses[i].width + 5;
						let clear_height = row_poses[i].height + 5;

						clearFromCanvas(ctx_2, top_x, top_y, clear_width, clear_height);
						row_poses[i] = 0; // set to zero as a result
					}
				}
			}
		});

		// Draw each pos based on row_poses, in the correct new position.
		for (let item of row_poses) {
			if (item !== 0) {
				ctx_2.drawImage(item.src, item.x - item.radius + 2, item.y - item.radius, item.width, item.height);
			}
		}
	}

	// Check if any of the buttons have been clicked
	let buttons_arrs = Object.entries(game_ctrls);
	buttons_arrs.forEach(function(button) {
		let btn_num = button[0];
		let btn_obj = button[1];
		let button_result = checkIntersect(pos, btn_obj);
		if (button_result) {
			// Create and call the func expression.
			let btn_func = ctrl_btns_funcs[btn_obj.img_number];
			btn_func();

			// Then return color selected to false
			col_selected = false;
		}
	});

});





function GameCircle(x_center, y_center, radius, color, state) {
	// Creates a circle object
	this.x = x_center;
	this.y = y_center;
	this.radius = radius;
	this.color = color;
	this.state = state;
}


function ColorCircle(x_center, y_center, radius, img_number, img_width, img_height) {
	// Creates a color circle object that stores info on the color image.
	this.x = x_center;
	this.y = y_center;
	this.radius = radius;
	this.img_number = img_number;
	this.img_width = img_width;
	this.img_height = img_height;
	this.color = 'red';
}

ColorCircle.prototype.drawColorCircle = function(color = this.color, size = 1) {
	// Draw a circle in a position (x, y).
	ctx_2.beginPath();
	ctx_2.lineWidth = size;
	ctx_2.strokeStyle = color;
	ctx_2.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	ctx_2.stroke();
};


// FUNCTION DECLARATIONS

function sizeInitialCanvas() {
	// Sizes the canvas based on the initial window width and height
	let window_width = window.innerWidth;
	let window_height = window.innerHeight;
	let window_ratio = window_width / window_height;

	// Calculate the optimum canvas size based on the current window size
	canvas_size = calculateOptimumCanvas(window_width, window_height);

	width = canvas_size[width];
	height = canvas_size[height];

	canvas_1.width  = canvas_size["width"];
	canvas_1.height = canvas_size["height"];

	canvas_2.width  = canvas_size["width"];
	canvas_2.height = canvas_size["height"];
}


function init() {
	// Initializes game context for drawing
	canvas_1 = document.getElementById('game-bottom');
	canvas_2 = document.getElementById('game-player');

	ctx_1 = canvas_1.getContext('2d');
	ctx_2 = canvas_2.getContext('2d');

	ctx_1.width = canvas_size[width];
	ctx_1.height = canvas_size[height];

	ctx_2.width = canvas_size[width];
	ctx_2.height = canvas_size[height];
}


function calculateOptimumCanvas(window_width, window_height){
	// Recursively calculates the optimum width and height that fits the 9:16 ratio for the board.
	let canvas_size;
	let max_width = window_width;
	let window_ratio = window_width / window_height;
	let temp_height = Math.round(window_height * 0.94);

	if (window_height > window_width) {
		let temp_width = Math.round(temp_height * 9 / 16);
		if (temp_width <= max_width) {
			canvas_size = {width:temp_width, height:temp_height};
		} else {
			return calculateOptimumCanvas(window_width, temp_height);
		}

	} else if (window_width >= window_height) {
		// Keep canvas width fixed
		let temp_width = Math.round(temp_height * 9 / 16);
		canvas_size = {width:temp_width, height:temp_height};
	}
	return canvas_size;
}


function resize(){
	// Get the proper width based on the height, resize the canvas accordingly
	let ratio = width / height;
	canvas_1.style.height = height + "px";
	canvas_1.style.width = (height * ratio) + "px";

	ctx_1.width = height * ratio;
	ctx_1.height = height;

	// canvas 2 should always be equal to canvas 1
	canvas_2.style.width = canvas_2.style.width;
	canvas_2.style.height = canvas_1.style.height;

	ctx_2.width = ctx_1.width;
	ctx_2.height = ctx_1.height;
}


function startNewGame() {
	// Clear the canvas for a new game, Initialize new variables
	clearFromCanvas(ctx_2, 0, 0, canvas_2.width, canvas_2.height);

	// Return game states to initial states
	game_state = true;
	row_poses = [0, 0, 0, 0];
	curr_play_row = 10;
	player_answers = [];
	col_selected = false;

	// Return the check answer back to the start
	moveCheckButton(game_ctrls[4], curr_play_row);

	// Create new game answers
	let new_base = game_answers;
	game_answers = newGameAnswers(new_base, num_board_holes[0]);

	// Clear current game answers from canvas, drawing background graphics on ctx_1 including peg holder
	drawGameAnswersBox(player_row_start, row_grid_height, hole_img, hole_img_width, hole_img_height, ans_box_width, ans_box_height);

	// Draw the new game answers onto the canvas hidden
	drawGameAnswers(game_answers);
}


function getMousePosition(canvas, evt) {
	// Get the mouse position, accounting for the offset resulting from the canvas location being in the middle.
	let bounding_area = canvas.getBoundingClientRect();
	return {
		x : evt.clientX - bounding_area.left,
		y : evt.clientY - bounding_area.top
	};
}


function checkIntersect(point, circle) {
	// Check if a point lies within a certain circle area by computing its distance from the center of the circle.
	let dist = Math.abs(Math.sqrt((point.x - circle.x) ** 2 + (point.y - circle.y) ** 2));
	return dist <= circle.radius;
}


function drawCircle(context, x, y, radius, color) {
	// Draw a circle in a position (x, y)
	ctx_2.beginPath();
	ctx_2.arc(x, y, radius, 0, 2 * Math.PI);
	ctx_2.strokeStyle = color;
	ctx_2.stroke();
}


function clearFromCanvas(context, top_x, top_y, width, height) {
	// Clear the canvas elements within a defined rectangle.
	context.clearRect(top_x, top_y, width, height);
}


function clearSelectedColor(selected) {
	// Function that clears a selected color, it takes a color_peg as input
	// Clear the color circle for the color panel
	let top_x = selected.x - selected.radius - (0.10 * selected.img_width);
	let top_y = selected.y - selected.radius - (0.10 * selected.img_height);
	let clear_width = selected.img_width + (0.20 * selected.img_width);
	let clear_height = selected.img_height + (0.20 * selected.img_height);
	clearFromCanvas(ctx_2, top_x, top_y, clear_width, clear_height);
}


function createRowCircles(top_x, top_y, curr_height, curr_width, no_of_circles, game_state) {
	// Create an array of circle objects.
	let d = curr_width / no_of_circles;
	let x_allowance = d * 0.2;
	d -= x_allowance;
	let r = d / 2;

	let row_circles = [];
	let x_center, y_center;
	y_center = top_y + curr_height / 2;

	// Calculate the center of the circle object, create the circle object, pushing to row_circles
	for (let j = 1; j <= num_board_holes[0]; j++) {
		x_center = (top_x + x_allowance / 2 + r) + (d +  x_allowance) * (j - 1);
		let circle_object = new GameCircle(x_center, y_center, r, "blue", false);
		row_circles.push(circle_object);

		// Draw the circle. Remove the draw function once everything is outlined. FINAL STEPS
		drawCircle(ctx_2, x_center, y_center, r, "");
	}
	return row_circles;
}


function generateRandomNumbers(array_length) {
	// Function that creates an array containing random numbers. The size of the array is based on the number of holes on the board
	let numbers = [];
	for (let i = 0; i < array_length; i++) {
		new_num = Math.floor(Math.random()  * (10 - 3));
		numbers.push(new_num);
	}
	return numbers;
}


function generateRandomColors(base_array) {
	// Function that generates color answers for the current game. It is compounding as it depends on values played in the previous array. At the initial start, the base array will be []. Returns a new sequence of numbers
	let result = [];
	let new_seq = generateRandomNumbers(base_array.length);
	if (base_array) {
		let new_num;
		for (let num of base_array) {
			new_num = num + new_seq.shift();
			if (new_num > 8) {
				new_num -= 7;
			}
			else if (new_num <= 0) {
				new_num += 8; // Remember to change to be another random number below 7;
			}
			result.push(new_num);
		}
	}
	return result;
}


function drawImageOnCanvas(context, image, x_value, y_value, image_width, image_height) {
	context.drawImage(image, x_value, y_value, image_width, image_height);
}


function newGameAnswers(base_array, hole_len) {
	// Creates a new game answers. If a base array exists, it uses the base array to create new game answers.
	// If the base_array is empty, create a base array with zeroes.
	if (base_array == false) {
		base_array = [];
		for (let i = 0; i < hole_len; i++) {
			base_array.push(0);
		}
	}
	// Generate the new color answers for the current new game instance
	let new_numbers = generateRandomColors(base_array);
	return new_numbers;
}


function calulatePegValues(machine_ans, player_ans) {
	// Check if values are the same. If not, return to what extent they are different.
	// If you find a position that is correct, do not count it anymore, check the rest instead.
	let m_ans, p_ans;
	let num_black_peg = 0;
	let num_white_peg = 0;
	let result = {};
	let p_reduced = [];
	let m_reduced = [];

	// First check for any positioned pegs. Positioned pegs are where the player puts the color in the correct position.
	for (let i = 0; i < machine_ans.length; i++) {
		m_ans = machine_ans[i];
		p_ans = player_ans[i];
		if (m_ans == p_ans) {
			num_black_peg += 1;
		} else {
			m_reduced.push(m_ans);
			p_reduced.push(p_ans);
		}
	}
	result[1] = num_black_peg;
	result[2] = num_white_peg;

	// Check for white pegs from the reduced array where positioned scored pegs have been removed.
	if (num_black_peg == machine_ans.length) {
		return result;
	} else {
		// check for white pegs
		for (let j = 0; j < p_reduced.length; j++) {
			if (m_reduced.includes(p_reduced[j])) { num_white_peg += 1;}
		}
		result[2] = num_white_peg;
	}
	// return the result of the pegs
	return result;
}


function calculateRelativeScorePos(num_of_holes, score_row_start, scoring_img_width, scoring_img_height, image_width, image_height) {
	// Calculates the relative x and y coordinates to place pegs on an image. Returns an array with the relative coordinates for each position on the scoring image.
	let result = [];
	for (let h = 1; h <= num_of_holes; h++) {
		let corner_x, corner_y;
		if (h % 2 != 0) {
			corner_x = score_row_start + scoring_img_width / 2 - image_width - (0.02 * scoring_img_width);
		} else if (h % 2 == 0) {
			corner_x = score_row_start + scoring_img_width / 2 + (0.04 * scoring_img_width);
		}
		if (h <= num_board_holes[0] / 2) {
			corner_y = scoring_img_height / 2 - image_height;
		} else {
			corner_y = scoring_img_height / 2 + (0.08 * scoring_img_height);
		}
		let rel_pos_coords = {
			name : 'Relative Coords',
			x : corner_x,
			y : corner_y,
			width : image_width,
			height : image_height
		}
		result.push(rel_pos_coords);
	}
	return result;
}


function drawGameAnswers(game_answers) {
	// Function that draws the game answers in the answer box.
	let answer_row = row_circles[0];
	answer_row.forEach(function (circle, i) {
		let x_pos, y_pos, col_peg_img, curr_peg, curr_width, curr_height;
		col_peg_img = color_images[game_answers[i]];
		x_pos = circle.x - circle.radius;
		y_pos = circle.y - circle.radius;
		curr_peg = color_pegs[i];
		curr_width = curr_peg.img_width;
		curr_height = curr_peg.img_height;

		//Always draw this on canvas one
		ctx_1.drawImage(col_peg_img, x_pos, y_pos, curr_width, curr_height);
	});
}


function drawGameAnswersBox(player_row_start, row_grid_height, hole_img, hole_img_width, hole_img_height, ans_box_width, ans_box_height){
	// Draws the game answers box that stores the machines answers.
	let ans_top_x = player_row_start - (0.03 * canvas_1.width);
	let ans_top_y = (row_grid_height - hole_img_height) / 2 - (0.04 * row_grid_height);

	// Clear the bottom canvas graphics if any
	clearFromCanvas(ctx_1, ans_top_x, ans_top_y, ans_box_width, row_grid_height);

	// Draw the Background graphic color
	ctx_1.lineWidth = 3;
	ctx_1.fillStyle = '#141415e0';
	ctx_1.fillStyle = '#0c0c0c';
	ctx_1.fillStyle = '#0b0b0ce3';
	ctx_1.fillStyle = '#0e0e0ecc';
	ctx_1.strokeStyle = '#040707';
	ctx_1.fillRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);
	ctx_1.strokeRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);

	// Draw the background graphic peg image
	let img_x = player_row_start;
	let img_y = (row_grid_height - hole_img_height) / 2;
	drawImageOnCanvas(ctx_1, hole_img, img_x, img_y, hole_img_width, hole_img_height);

	// Foreground graphic
	ctx_2.lineWidth = 3;
	ctx_2.fillStyle = '#131313';
	ctx_2.strokeStyle = '#0b0b0c';
	ctx_2.fillRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);
	ctx_2.strokeRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);

	ctx_2.lineWidth = 1;
	ctx_2.strokeStyle = 'transparent';

	ctx_1.lineWidth = 1;
}


function showHint() {
	// Function that shows a hint of one of the colors featuring in the machine's answer. Hint is colored in green or another color.
	
}


function checkAnswer() {
	// Checks the answer submitted for the row against the machine answer.
	let curr_row = row_poses;
	let row_player_answers = [];
	if (curr_row.includes(0)) {
		// If one selects submit before all positions have been filled, nothing should happen
		return;
	} else {
		// Extract the players answers into an array.
		curr_row.forEach((img_obj) => {
			row_player_answers.push(img_obj.img_number);
		});

		// Score the players answer into black and white pegs
		let row_scores = calulatePegValues(game_answers, row_player_answers);

		// Draw the resulting pegs based on the row_scores
		let num_pos_ans = row_scores[1];
		let num_col_ans = row_scores[2];
		let counter = 0;

		let pos_coords = answ_poses[0];
		let col_coords = answ_poses[1];

		// Calculate height up to the position that is currently playing
		let y_abs = row_grid_height * curr_play_row;

		// Draw the pos pegs if any
		for (let i = num_pos_ans; i > 0; i--) {
			let pos_img = answer_images[1];
			let width = pos_coords[counter].width;
			let height = pos_coords[counter].height;
			let x = pos_coords[counter].x;
			let y = pos_coords[counter].y + y_abs;
			drawImageOnCanvas(ctx_2, pos_img, x, y, width, height);
			counter += 1;
		}

		// Draw the col pegs if any
		for (let i = num_col_ans; i > 0; i--) {
			let col_img = answer_images[2];
			let width = col_coords[counter].width;
			let height = col_coords[counter].height;
			let x = col_coords[counter].x;
			let y = col_coords[counter].y +  y_abs;
			drawImageOnCanvas(ctx_2, col_img, x, y, width, height);
			counter += 1;
		}

		// If all 4 pegs, game_state should be false. If not, move to the next row, clear the player answers, move the submit button to the next row.
		if (num_pos_ans == num_board_holes[0]) {
			game_state = false;
			// Reveal machine answers at this point
			revealGameAnswers(player_row_start, row_grid_height, ans_box_width, ans_box_height);
		} else if(curr_play_row > 1) {
			// Move to the next row, slide the submit answer as well.
			curr_play_row -= 1;
			moveCheckButton(game_ctrls[4], curr_play_row);
		} else {
			curr_play_row = 10;
			game_state = false;

			// Reveal machine answers.
			revealGameAnswers(player_row_start, row_grid_height, ans_box_width, ans_box_height);

			// At new game, return the check answer to the current row
			moveCheckButton(game_ctrls[4], curr_play_row);
		}
		row_poses = [0, 0, 0, 0]; // reset the row poses to 0
	}

}

function moveCheckButton(check_obj, curr_row) {
	// Function that moves the check button to the current row playing
	// Clear the current submit button from its position
	let clear_x = check_obj.x - check_obj.radius;
	let clear_y = check_obj.y - check_obj.radius;
	let clear_width = check_obj.img_width + 0.02 * check_obj.radius;
	let clear_height = check_obj.img_height + 0.02 * check_obj.radius;
	clearFromCanvas(ctx_1, clear_x, clear_y, clear_width, clear_height);

	// Compute the new check button x and y values.
	let new_x = clear_x;
	let new_y = row_grid_height * (curr_row) + (row_grid_height - check_icon_height) / 2;
	radius = check_icon_width  / 2;
	check_obj.y = new_y + check_icon_height / 2;

	// Draw the new check button in the new position
	ctx_1.drawImage(check_icon, new_x, new_y, check_icon_width, check_icon_height);
}


function revealGameAnswers(player_row_start, row_grid_height, ans_box_width, ans_box_height) {
	let start_x = player_row_start - (0.03 * canvas_1.width);
	let start_y = (row_grid_height - hole_img_height) / 2 - (0.04 * row_grid_height);
	let clear_size = ans_box_width / 50;
	setInterval(() => {
		clearFromCanvas(ctx_2, start_x, start_y, clear_size, row_grid_height);
		start_x += clear_size;
	}, 50);
}
