/* Javascript for MasterMind 2.0 */

// Declare the two canvasses and the respective context.
let width, height;
let canvas_size, canvas_1, canvas_2, ctx_1, ctx_2;
canvas_1 = document.getElementById('game-bottom');
canvas_2 = document.getElementById('game-player');

// The urls for the peg color images and board images to be used in the game
let peg_colors = 8;
let peg_urls = ["./images/circle_pegs/04_Peg_navyblue.png", "./images/circle_pegs/04_Peg_brown.png", "./images/circle_pegs/04_Peg_green.png", "./images/circle_pegs/04_Peg_teal.png", "./images/circle_pegs/04_Peg_purple.png", "./images/circle_pegs/04_Peg_lightgold.png", "./images/circle_pegs/04_Peg_pink.png", "./images/circle_pegs/04_Peg_red.png"];

let board_hole_url = ["./images/02_Line_5.png", "./images/03_Answer_box_5.png"];
let icons_url = ["./images/06_Buttons_back.png", "./images/06_Buttons_new_game.png", "./images/06_Buttons_hint.png", "./images/06_Buttons_check_answer.png", "./images/09_3_Stars_black.png", "./images/09_3_Stars_gold.png"];
let answer_url = ["./images/05_Answer_red_2.png", "./images/05_Answer_white_2.png"];


let num_board_holes = 5; 

let total_hints = num_board_holes - 1;
let total_rows = 10;
let hints_given = [];


// Load images count
let loadcount = 0;
let loadtotal = 0;
let preloaded = false;


let color_images, four_board, game_ctrls_imgs, answer_images;
let answer_images_2 = {};
let game_ctrls = {};
let game_state = true;
let color_panel = 0;
let score_row_start = 0;
let player_row_start = 0;
let right_panel_start = 0;
let stars_x, stars_y;


let color_pegs = []; // stores the color pegs shapes
let answ_poses = []; // stores x,y relative positions for drawing pos and col
let row_circles = {};
let scoring_circles = {};

let row_poses = [0, 0, 0, 0, 0];
let curr_play_row = 10;
let rel_row_height = 0;
let player_answers = [];
let col_selected = false; // For storing colors that are clicked on;
let initialized = false;

let ctrl_btns_funcs = {
	1 : goBackToMenu,
	2 : newGameOption,
	3 : showHint,
	4 : checkAnswer
};


// COMPUTE THE ANSWERS FOR THE GAME AND STORE THEM -------------------

let base_array;
base_array = generateRandomNumbers(num_board_holes); 
let set_answ = newGameAnswers(base_array, num_board_holes);


// INITIALIZE THE GAME VARIABLES-------------------------------------

sizeInitialCanvas(); // Initialize the canvas sizes and widths based on window
init(); // Initialize the game variables and all the images


// RUN THE GAME INITIALIZER----------------------------------------
main();


function main() {
	// If initialized
	if (!initialized) {
		console.log("Images not initialized. keep loading", initialized);
		// Keep calling the loader animation
	} else {
		// After all the items have been initialized, start the main game by returning to the normal game flow.
		return;
	}	
}


// DRAW FIXED GRAPHICS ONTO THE BACKGROUND CANVAS -----------------

row_grid_height = canvas_1.height / 12;
rel_row_height = row_grid_height + 0.001 * canvas_1.height;

for (let k = 1; k <= 8; k++) { // Draw left Side panel of colors
	let x_pos, y_pos, radius, x_pos_center, y_pos_center;
	let img_height = row_grid_height - (0.40 * row_grid_height);
	let img_width = img_height;
	color_panel = img_width + (0.015 * canvas_1.width) * 2;

	// Calculate spread gap from height minus the answer box, and bottom control panel
	let gap_y = (canvas_1.height - row_grid_height * 3) / 8;

	x_pos = (0.015 * canvas_1.width); // 1.5 percent from the edge
	y_pos = k * row_grid_height + (row_grid_height - img_height) / 2;
	y_pos += ((gap_y / 2 )* (k - 1)) / 2; // Additional gap added
	radius = (img_width) / 2;
	radius += 5; // Additional click detection allowance

	x_pos_center = x_pos + radius - 5;
	y_pos_center = y_pos + img_height / 2;

	// Create a color peg object used later for detection of click
	let color_peg = new ColorCircle(x_pos_center, y_pos_center, radius, k, img_width, img_height);
	color_pegs.push(color_peg);

	let img = color_images[k];
	img.onload = function () {
		ctx_1.drawImage(img, x_pos, y_pos, img_width, img_height);
		// color_peg.drawColorCircle();
	}
}


// DEFINE AND DRAW THE SCORE IMAGE PEGS AND PLAYER HOLES IMAGES -----------

score_row_start = color_panel + (0.005 * canvas_1.width);

// Draw the 10 scoring boxes and 11 blank hole rows
let scoring_img, scoring_img_height, scoring_img_width, scoring_img_scale;
scoring_img = four_board[2];
scoring_img.onload = function () {
	let x_pos, y_pos;
	scoring_img_scale = scoring_img.width / scoring_img.height;
	scoring_img_height = row_grid_height - (0.28 * row_grid_height);
	scoring_img_width = scoring_img_height * scoring_img_scale;
	x_pos = score_row_start;
	for (let i = 1; i <= 10; i++){
		y_pos = i * rel_row_height + (row_grid_height - scoring_img_height) / 2;
		drawImageOnCanvas(ctx_1, scoring_img, x_pos, y_pos, scoring_img_width, scoring_img_height);
	}
}

// Draw the 10 player peg hole images and the one for the machine answer row
let hole_img, hole_img_width, hole_img_height, hole_img_scale;
let ans_box_width, ans_box_height, ans_top_x, ans_top_y;
hole_img = four_board[1];
hole_img.onload = function() {
	let x_pos, y_pos, box_allowance;
	box_allowance = (0.010 * canvas_1.width);

	hole_img_scale = hole_img.width / hole_img.height;
	hole_img_height = row_grid_height - (0.18 * row_grid_height);
	hole_img_width = hole_img_height * hole_img_scale;

	ans_box_width = hole_img_width + box_allowance / 2;
	ans_box_height = hole_img_height + (0.06 * hole_img_height) * 2;

	window.setTimeout(function() {
		// 1 percent edge allowance added to y_pos
		player_row_start = canvas_1.width - color_panel - hole_img_width;
		player_row_start += box_allowance;

		x_pos = player_row_start;
		
		for (let i = 0; i <= 10; i++) {
			// Compute the y value for the images
			y_pos = i * rel_row_height + (row_grid_height - hole_img_height) / 2;

			// Row circles array for each row, stored with a corresponding number.
			row_circles[i] = createRowCircles(x_pos, y_pos, hole_img_height, hole_img_width, num_board_holes, game_state);

			if (i == 0) {
				// Draw the box containing the machine answers and the covers.
				drawGameAnswersBox(player_row_start, row_grid_height, hole_img, hole_img_width, hole_img_height, ans_box_width, ans_box_height);

				//draw the game answers
				drawGameAnswers(set_answ, row_circles[0]);
			} else {
				// Draw the rest of the grid peg hole images
				drawImageOnCanvas(ctx_1, hole_img, x_pos, y_pos, hole_img_width, hole_img_height);
			}
		}

	}, 400);

}


// BUTTONS FOR BACK, NEW GAME, HINT, CHECK ANSWER, STARS SCORES--------------

// back game icon located far left of the canvas
let back_icon, newgame_icon, hint_icon, check_icon, stars_back, stars_img;

back_icon = game_ctrls_imgs[1];
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
newgame_icon = game_ctrls_imgs[2];
let newgame_icon_width, newgame_icon_height, newgame_icon_scale;
newgame_icon.onload = () => {
	let x_pos, y_pos, radius;
	let temp_no = 2;

	newgame_icon_scale = newgame_icon.width / newgame_icon.height;
	newgame_icon_height = row_grid_height  - (0.40 * row_grid_height);
	newgame_icon_width = newgame_icon_height * newgame_icon_scale;
	
	x_pos = canvas_1.width - (0.010 * canvas_1.width) - newgame_icon_width;
	y_pos = canvas_1.height - (0.1 * row_grid_height) - newgame_icon_height;
	radius = newgame_icon_width / 2;

	// Circle obj used later for click detection, push to right buttons.
	let newg_circle = new ColorCircle(x_pos + newgame_icon_width / 2, y_pos + newgame_icon_height / 2, radius, temp_no, newgame_icon_width, newgame_icon_height);
	game_ctrls[temp_no] = newg_circle;

	// Draw the icon image
	ctx_1.drawImage(newgame_icon, x_pos, y_pos, newgame_icon_width, newgame_icon_height);
}


// Hint icon located in the middle
hint_icon = game_ctrls_imgs[3];
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
check_icon = game_ctrls_imgs[4];
let check_icon_width, check_icon_height, check_icon_scale;
check_icon.onload = () => {
	let x_pos, y_pos, radius;
	let temp_no = 4;

	check_icon_scale = check_icon.width / check_icon.height;
	check_icon_height = row_grid_height - (0.40 * row_grid_height);
	check_icon_width = check_icon_height * check_icon_scale;

	x_pos = canvas_1.width - (0.010 * canvas_1.width) - check_icon_width;
	y_pos = curr_play_row * rel_row_height + (row_grid_height - check_icon_height) / 2;
	

	radius = check_icon_width  / 2;

	// Circle obj used later for click detection and button movement
	let check_circle = new ColorCircle(x_pos + check_icon_width / 2, y_pos + check_icon_height / 2, radius, temp_no, check_icon_width, check_icon_height);
	game_ctrls[temp_no] = check_circle;

	// Draw the icon image
	ctx_1.drawImage(check_icon, x_pos, y_pos, check_icon_width, check_icon_height);
}


// Stars scoring image black filled
stars_back = game_ctrls_imgs[5];
let stars_back_width, stars_back_height, stars_back_scale;
stars_back.onload = () => {
	let x_pos, y_pos, radius;
	let temp_no = 5;

	stars_back_scale = stars_back.width / stars_back.height;
	stars_back_height = row_grid_height - (0.50 * row_grid_height);
	stars_back_width = stars_back_height * stars_back_scale;

	x_pos = (0.020 * canvas_1.width); // 2% from the edge
	y_pos = (row_grid_height - stars_back_height) / 2;

	stars_x = x_pos;
	stars_y = y_pos;

	// Draw the icon image
	ctx_1.drawImage(stars_back , x_pos, y_pos, stars_back_width, stars_back_height);
}


// ---------- DEFINE THE SCORING PEGS IMAGES FOR THE COLORS OF THE GAME --------------

let pospeg_answ, colpeg_answ;
let pospeg_answ_width, pospeg_answ_height, pospeg_answ_scale;
let colpeg_answ_width, colpeg_answ_height, colpeg_answscale;
window.setTimeout(function() {
	// Create the scoring pegs but dont draw until check answer is clicked on.
	let rel_height = scoring_img_height / 2 - (0.20 * scoring_img_height);

	// Peg used when the player scores one of the correct positions
	pospeg_answ = answer_images[1];
	colpeg_answ = answer_images[2];
	if (initialized) {
		let pospeg_answ_x, pospeg_answ_y;
		pospeg_answ_scale = pospeg_answ.width / pospeg_answ.height;
		pospeg_answ_height = rel_height;
		pospeg_answ_width = pospeg_answ_height * pospeg_answ_scale;

		let colpeg_answ_x, colpeg_answ_y;
		colpeg_answscale = colpeg_answ.width / colpeg_answ.height;
		colpeg_answ_height = rel_height;
		colpeg_answ_width = colpeg_answ_height * colpeg_answscale;

		let pos_ans_coords = calculateRelativeScorePos(num_board_holes, score_row_start, scoring_img_width, scoring_img_height, pospeg_answ_width, pospeg_answ_height);
		let col_ans_coords = calculateRelativeScorePos(num_board_holes, score_row_start, scoring_img_width, scoring_img_height, colpeg_answ_width, colpeg_answ_height);

		answ_poses.push(pos_ans_coords); //Pos ans coords will always be the at index 0
		answ_poses.push(col_ans_coords); //Col ans coords will always be the at index 0
	}
	
}, 500);




// -------------------------- EVENT LISTENERS  -------------------------------------

canvas_2.addEventListener('click', (e) => {
	// Get location of the mouseclick event
	const pos = getMousePosition(canvas_2, e);

	if (game_state) {// If the game is in play
		// Check if the mouseclick was on any of the colors on the side panel. 
		color_pegs.forEach(color_peg => {
			let click_result = checkIntersect(pos, color_peg);

			// Clear any randomly selected colors that have not been played
			clearSelectedColor(color_peg);
			if (click_result) {
				// Add the image selected to col_selected, draw a circle around selected color
				col_selected = color_peg;
				color_peg.drawColorCircle(3, "#797979", 4);
			}
		});

		// Identify the curr game row playing, then circle clicked.
		let circle_clicked = 0; 
		let check_circles = row_circles[curr_play_row];

		// Check each row for the current play row.
		check_circles.forEach(function (circle, i) {
			let circle_result = checkIntersect(pos, circle);
			if (circle_result) {
				// If clicked on the circle, check if their is a col_selected.
				if (col_selected) {
					// Means a color is selected. Create an obj to store details.
					let curr_col = {img_number : col_selected.img_number, src : color_images[col_selected.img_number], x : circle.x, y : circle.y, radius : circle.radius, width : col_selected.img_width, height : col_selected.img_height};
					row_poses[i] = curr_col;

					// Clear the color circle for the color panel and set col_selected to false
					clearSelectedColor(col_selected);
					col_selected = false;
				} else if (col_selected == false) {
					if (row_poses[i] != 0) {
						// Clicked on a circle with a color, hence remove that color.
						let top_x = circle.x - circle.radius;
						let top_y = circle.y - circle.radius;
						// let clear_width = row_poses[i].width + 5;
						// let clear_height = row_poses[i].height + 5;


						let clear_width = circle.radius * 2;
						let clear_height = circle.radius * 2;

						clearFromCanvas(ctx_2, top_x, top_y, clear_width, clear_height);
						row_poses[i] = 0; // set to zero as a result
					}
				}
			}
		});

		// Draw each pos based on row_poses, in the correct new position.
		for (let item of row_poses) {
			if (item !== 0) {
				// ctx_2.drawImage(item.src, item.x - item.radius + 2, item.y - item.radius, item.width, item.height);
				ctx_2.drawImage(item.src, item.x - item.width / 2, item.y - item.height / 2, item.width, item.height);
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


//--------------- CLASSES, FUNCTION DECLARATIONS --------------------------------


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

ColorCircle.prototype.drawColorCircle = function(value = 0, color = this.color, size = 1) {
	// Draw a circle in a position (x, y).
	let curr_radius = this.radius - value;
	ctx_2.beginPath();
	ctx_2.lineWidth = size;
	ctx_2.strokeStyle = color;
	ctx_2.arc(this.x, this.y, curr_radius, 0, 2 * Math.PI);
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


	// Preload the images
	color_images = preloadGameImages(peg_urls);
	four_board = preloadGameImages(board_hole_url);
	game_ctrls_imgs = preloadGameImages(icons_url);
	answer_images = preloadGameImages(answer_url);
	initialized = true;
}


function calculateOptimumCanvas(window_width, window_height){
	// Function that computes the optimum width height that is within the 10:16 ratio for the board.
	let canvas_size;
	let max_width = window_width;
	let window_ratio = window_width / window_height;
	let temp_height = Math.round(window_height * 0.99);

	if (window_height > window_width) {
		let temp_width = Math.round(temp_height * 9 / 16);
		if (temp_width <= max_width) {
			canvas_size = {width:temp_width, height:temp_height};
		} else {
			return calculateOptimumCanvas(window_width, temp_height);
		}
	} else if (window_width >= window_height) { // Keep canvas width fixed
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


function getMousePosition(canvas, evt) {
	// Get the mouse position, accounting for the offset resulting from the canvas location being in the middle.
	let bounding_area = canvas.getBoundingClientRect();
	return {
		x : evt.clientX - bounding_area.left,
		y : evt.clientY - bounding_area.top
	};
}


function checkIntersect(point, circle) {
	// Check if a point lies within a certain circle area.
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


function clearSelectedColor(selected) {
	// Function that clears a selected color, it takes a color_peg as input
	// Clear the color circle for the color panel
	let top_x = selected.x - selected.radius;
	let top_y = selected.y - selected.radius;

	let clear_width = selected.radius * 2;
	let clear_height = selected.radius * 2;
	clearFromCanvas(ctx_2, top_x, top_y, clear_width, clear_height);
}


function createRowCircles(top_x, top_y, curr_height, curr_width, no_of_circles, game_state) {
	// Returns an array of row circles representing the possible play positions.
	let row_circles = [];
	let x_center, y_center;

	let outer_allowance = curr_height * 0.15;
	let diameter = curr_height - outer_allowance;
	let radius = diameter / 2;
	let spacing = (curr_width - (diameter * no_of_circles)) / num_board_holes;
	
	y_center = top_y + curr_height / 2;

	// Calculate the center of the circle object, create the circle object, pushing to row_circles
	for (let j = 1; j <= num_board_holes; j++) {
		x_center = (top_x  + spacing / 2 + radius) + (diameter +  spacing) * (j - 1);

		let circle_object = new GameCircle(x_center, y_center, radius, "blue", false);
		row_circles.push(circle_object);

		// Draw the circle. Remove the draw function once everything is outlined. FINAL STEPS
		drawCircle(ctx_2, x_center, y_center, radius, "");
	}
	return row_circles;
}


function generateRandomNumbers(array_length) {
	// Function that creates an array containing random numbers. The size of the array is based on the number of holes on the board
	let numbers = [];
	for (let i = 0; i < array_length; i++) {
		new_num = Math.floor(Math.random() * (10 - 3));
		numbers.push(new_num);
	}
	return numbers;
}


function getRandomRangeNum(min, max) {
	// Returns a random number within a min-max range
	return Math.floor(Math.random() * (max - min)) + min;
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


function clearFromCanvas(context, top_x, top_y, width, height) {
	// Clear the canvas elements within a defined rectangle.
	context.clearRect(top_x, top_y, width, height);
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

	// Check for any correctly positioned pegs.
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
	// Calculates the relative x and y coordinates to place pegs on an image. Returns an array with the relative coordinates.
	let result = [];
	let mid = Math.round(num_of_holes / 2);
	let x_gap = 0.05 * scoring_img_width;
	let y_gap = 0.08 * scoring_img_height;
	for (let h = 1; h <= num_of_holes; h++) {
		let corner_x, corner_y;
		if (h != 3) {
			if (h < mid) {
				corner_x = score_row_start + h * (image_width + x_gap) - (x_gap * 2) + (h - 1) * (image_width + x_gap * 1.5);
				corner_y = scoring_img_height / 2 - image_height / 2;
			} else if(h > mid) {
				corner_x = score_row_start + (h - mid) * (image_width + x_gap) - (x_gap * 2) + ((h - mid) - 1) * (image_width + x_gap * 1.5);
				corner_y = scoring_img_height / 2 + image_height / 2 + y_gap ;
			}
			// let rel_pos_coords = {name : 'Relative Coords', x : corner_x, y : corner_y, width : image_width, height : image_height};
			// result.push(rel_pos_coords);

		} else {
			corner_x = score_row_start  + scoring_img_width / 2 - (image_width / 2);
			corner_y = scoring_img_height / 2 + y_gap / 2;

		}
		let rel_pos_coords = {name : 'Relative Coords', x : corner_x, y : corner_y, width : image_width, height : image_height};
		result.push(rel_pos_coords);


		// if (h <= num_of_holes / 2) {
		// 	corner_x = score_row_start + h * (image_width + x_gap) - (x_gap * 2);
		// 	corner_y = scoring_img_height / 2 - image_height / 2 - y_gap;
		// } else if(h > num_of_holes / 2) {
		// 	corner_x = score_row_start + (h - num_of_holes / 2) * (image_width + x_gap) - (x_gap * 2);
		// 	corner_y = scoring_img_height / 2 + image_height / 2 ;
		// }
		// let rel_pos_coords = {name : 'Relative Coords', x : corner_x, y : corner_y, width : image_width, height : image_height};
		// result.push(rel_pos_coords);


	}
	
	return result;
}


function drawGameAnswers(set_answ, row_array) {
	// Function that draws the game answers in the answer box.
	let answer_row = row_array;
	answer_row.forEach(function (circle, i) {
		let x_pos, y_pos, col_peg_img, curr_peg, curr_width, curr_height;
		col_peg_img = color_images[set_answ[i]];

		curr_peg = color_pegs[i];
		curr_width = curr_peg.img_width;
		curr_height = curr_peg.img_height;

		x_pos = circle.x - curr_peg.img_width / 2;
		y_pos = circle.y - curr_peg.img_height / 2;

		//Always draw this on canvas
		ctx_1.drawImage(col_peg_img, x_pos, y_pos, curr_width, curr_height);
	});
}


function drawGameAnswersBox(player_row_start, row_grid_height, hole_img, hole_img_width, hole_img_height, ans_box_width, ans_box_height){
	// Draws the game answers box that stores the machines answers.
	let ans_top_x = player_row_start - (0.004 * canvas_1.width);
	let ans_top_y = (row_grid_height - hole_img_height) / 2 - (0.04 * row_grid_height);

	// Clear the bottom canvas graphics if any
	clearFromCanvas(ctx_1, ans_top_x, ans_top_y, ans_box_width, row_grid_height);

	// Draw the Background graphic color
	ctx_1.lineWidth = 2.5;
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
	ctx_2.fillStyle = '#3e3e3e';
	ctx_2.fillStyle = '#222226';
	ctx_2.strokeStyle = '#0b0b0c';
	ctx_2.strokeStyle = '#040707';
	ctx_2.fillRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);
	ctx_2.strokeRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);

	ctx_2.lineWidth = 1;
	ctx_1.lineWidth = 1;
	ctx_2.strokeStyle = 'transparent';
}


function createDialogBoxSize() {
	// Function that creates the size of the dialog box based on the window view.
	let dialog_dims = {};
	let dialog_width, dialog_height;

	let temp_width = window.innerWidth / 2;
	let temp_height = window.innerHeight / 4

	if (temp_width >= canvas_1.width) {
		dialog_width = temp_width * 0.50;
		dialog_height = window.innerHeight / 4;
	} else {
		dialog_width = temp_width;
		dialog_height = window.innerHeight / 4;
	}
	dialog_dims["dialog_width"] = dialog_width;
	dialog_dims["dialog_height"] = dialog_height;
	dialog_dims["max_width"] = canvas_1.width;

	dialog_dims["margin_left"] = 0 - dialog_width / 2;
	dialog_dims["margin_top"] = 0 - dialog_height / 2;

	return dialog_dims;
}


function showHint() {
	// Function that opens a dialog box with the hint color.
	// Checking the game_state ensures the button is unclickable when game is false.
	if (game_state) {
		let hint_img = document.getElementById("hint-img");
		let hint_count = document.getElementById("hint-num");

		// Compute dialog box size and set sizes
		let box_dims = createDialogBoxSize();
		let hint_box = document.getElementById("hint-dialog");
		hint_box.style.width = `${box_dims["dialog_width"]}` + "px";
		hint_box.style.height = `${box_dims["dialog_height"]}` + "px";
		hint_box.style.maxWidth = `${box_dims["max_width"]}` + "px";
		hint_box.style.marginLeft = `${box_dims["margin_left"]}` + "px";
		hint_box.style.marginTop = `${box_dims["margin_top"]}` + "px";

		// Check if hints are available
		if (total_hints > 0) {
			// Get random number between 0 and number of peg holes - 1
			let num_holes = num_board_holes;
			let answ_idx = getRandomRangeNum(0, num_holes);

			while (hints_given.includes(answ_idx)) {
				answ_idx = getRandomRangeNum(0, num_holes);
			}

			// Add the hint idx to the hint arr, set img src, deduct total hints
			hints_given.push(answ_idx);

			let img_src = peg_urls[set_answ[answ_idx] - 1];
			hint_img.src = img_src;

			total_hints --;
			hint_count.innerHTML = total_hints;

		} else {
			// No more hints, show all hints exhausted text, update hint dialog box
			let img_src = "./images/08_X-Icon.png";
			hint_img.src = img_src;
			hint_count.innerHTML = "No";
		}

		// Display the box if the game state is true, set game to false
		hint_box.style.display = "grid";
		game_state = false;
	}	
}


function newGameOption() {
	// Prompt player to confirm they want to start a new game.
	// Close any dialog boxes for hint and go back
	resumeGameState('hint-dialog', 'back-dialog');

	let box_dims = createDialogBoxSize();

	let newgame_box = document.getElementById("newgame-dialog");

	newgame_box.style.width = `${box_dims["dialog_width"]}` + "px";
	newgame_box.style.height = `${box_dims["dialog_height"]}` + "px";
	newgame_box.style.maxWidth = `${box_dims["max_width"]}` + "px";
	newgame_box.style.marginLeft = `${box_dims["margin_left"]}` + "px";
	newgame_box.style.marginTop = `${box_dims["margin_top"]}` + "px";
	newgame_box.style.display = "flex";

	// set game state to false
	game_state = false;
}


function startNewGame() {
	// Close any dialog boxes for hint and go back
	resumeGameState('hint-dialog', 'back-dialog', 'newgame-dialog');

	// Clear the canvas for a new game, Initialize new variables
	clearFromCanvas(ctx_2, 0, 0, canvas_2.width, canvas_2.height);

	// Create new game answers
	let new_base = set_answ;
	set_answ = newGameAnswers(new_base, num_board_holes);

	// Return game states to initial states
	row_poses = [0, 0, 0, 0, 0];
	curr_play_row = 10;
	player_answers = [];
	col_selected = false;
	total_hints = num_board_holes - 1;
	hints_given = [];
	game_state = true;

	// Return the check answer back to the start
	moveCheckButton(game_ctrls[4], curr_play_row);

	// Clear current game answers from canvas, drawing background graphics on ctx_1 including peg holder
	drawGameAnswersBox(player_row_start, row_grid_height, hole_img, hole_img_width, hole_img_height, ans_box_width, ans_box_height);

	// Draw the new game answers onto the canvas hidden
	drawGameAnswers(set_answ, row_circles[0]);

	// Clear the rated stars of the previous game.
}


function goBackToMenu() {
	// Function that opens a dialog box providing options to quit or continue with the game.

	// Close any dialog boxes for hint and newgame
	resumeGameState('hint-dialog', 'newgame-dialog');


	let box_dims = createDialogBoxSize();

	let back_box = document.getElementById("back-dialog");

	back_box.style.width = `${box_dims["dialog_width"]}` + "px";
	back_box.style.height = `${box_dims["dialog_height"]}` + "px";
	back_box.style.maxWidth = `${box_dims["max_width"]}` + "px";
	back_box.style.marginLeft = `${box_dims["margin_left"]}` + "px";
	back_box.style.marginTop = `${box_dims["margin_top"]}` + "px";
	back_box.style.display = "flex";

	// set game state to false
	game_state = false;
}


function getNumberOfHints() {
	let curr_hints = total_hints;
	return curr_hints;
}


function resumeGameState(...element_ids) {
	// Function that takes an element_id and puts its display to none, based on any parameters.
	for (let arg_id of element_ids) {
		let element = document.getElementById(arg_id);
		element.classList.remove("load-dialog");
		element.classList.add("unload-dialog");

		window.setTimeout(() => {
			element.style.display = "none";
			element.classList.remove("unload-dialog");
			element.classList.add("load-dialog");
		}, 1500);

		// element.style.display = "none";
		// element.className += "";
	}
	game_state = true;
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

		// Score the players answer into red and white pegs
		let row_scores = calulatePegValues(set_answ, row_player_answers);

		// Draw the resulting pegs based on the row_scores
		let num_pos_ans = row_scores[1];
		let num_col_ans = row_scores[2];
		let counter = 0;

		let pos_coords = answ_poses[0];
		let col_coords = answ_poses[1];

		// Calculate height up to the position that is currently playing
		let y_abs = row_grid_height * curr_play_row;
		y_abs = rel_row_height * curr_play_row;

		// Draw the pos pegs if any
		for (let i = num_pos_ans; i > 0; i--) {
			let pos_img = pospeg_answ;
			let width = pos_coords[counter].width;
			let height = pos_coords[counter].height;
			let x = pos_coords[counter].x;
			let y = pos_coords[counter].y + y_abs;
			drawImageOnCanvas(ctx_2, pos_img, x, y, width, height);
			counter += 1;
		}

		// Draw the col pegs if any
		for (let i = num_col_ans; i > 0; i--) {
			let col_img = colpeg_answ;
			let width = col_coords[counter].width;
			let height = col_coords[counter].height;
			let x = col_coords[counter].x;
			let y = col_coords[counter].y +  y_abs;
			drawImageOnCanvas(ctx_2, col_img, x, y, width, height);
			counter += 1;
		}

		// If all 6 pegs, game_state should be false. If not, move to the next row, clear the player answers, move the submit button to the next row.
		if (num_pos_ans == num_board_holes) {
			game_state = false;
			// Reveal answers and rate winner accordingly
			revealGameAnswers(player_row_start, row_grid_height, ans_box_width, ans_box_height);
			scoreGamePlayed(stars_x, stars_y, curr_play_row, stars_back_height);

		} else if(curr_play_row > 1) {
			// Move to the next row, slide the submit answer as well.
			curr_play_row -= 1;
			moveCheckButton(game_ctrls[4], curr_play_row);
		} else {
			// Reset play row and game_state, reveal answers, return check box to start
			curr_play_row = 10;
			game_state = false;
			revealGameAnswers(player_row_start, row_grid_height, ans_box_width, ans_box_height);
			moveCheckButton(game_ctrls[4], curr_play_row);
		}
		row_poses = [0, 0, 0, 0, 0]; // reset the row poses to 0
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
	let new_y = curr_play_row * rel_row_height + (row_grid_height - check_icon_height) / 2;

	radius = check_icon_width  / 2;
	check_obj.y = new_y + check_icon_height / 2;

	// Draw the new check button in the new position
	ctx_1.drawImage(check_icon, new_x, new_y, check_icon_width, check_icon_height);
}


function revealGameAnswers(player_row_start, row_grid_height, ans_box_width, ans_box_height) {
	let start_x = player_row_start - (0.01 * canvas_1.width);
	let start_y = (row_grid_height - hole_img_height) / 2 - (0.04 * row_grid_height);
	let clear_size = ans_box_width / 50;
	setInterval(() => {
		clearFromCanvas(ctx_2, start_x, start_y, clear_size, row_grid_height);
		start_x += clear_size;
	}, 50);
}


function scoreGamePlayed(stars_x, stars_y, curr_play_row, stars_back_height) {
	// Function that scores the current game played according to 3 star system
	// Stars image gold filled
	let stars_img = game_ctrls_imgs[6];
	let x_pos = stars_x;
	let y_pos = stars_y;

	let sourc_width, sourc_height, img_scale;
	let dest_width, dest_height;

	sourc_height = stars_img.height;
	sourc_width = stars_img.width;

	img_scale = sourc_width / sourc_height;
	dest_height = stars_back_height;
	dest_width = dest_height * img_scale;

	if (curr_play_row > 5) {
		// Played in less than 5 rows, hence give 3 stars
		dest_width *= 1.0;
	} else if (curr_play_row > 3 ) {
		// Played in less than 8 rows, hence give 2 stars
		sourc_width *= 0.66;
		dest_width *= 0.66;
	} else {
		// Played in less than 10 rows, hence give 1 star
		sourc_width *= 0.33;
		dest_width *= 0.33;
	}

	// Draw the icon image
	ctx_2.drawImage(stars_img, 0, 0, sourc_width, sourc_height, x_pos, y_pos, dest_width, dest_height);
}


function preloadGameImages(image_files) {
	// Preload images into a dictionary where the number is the key and property the image
	curr_load = 0;
	total_load = image_files.length;
	preloaded = false;

	let img_files = {};
	for (let i = 0; i < image_files.length; i++) {
		// Create the image object
		let img = new Image();

		// Load the image object
		img.onload = function () {
			curr_load++;
			if (curr_load == total_load) {
				preloaded = true;
			}
		};
		// Set the source of the image
		img.src = image_files[i];

		// Save the image to the color peg dict
		img_files[i + 1] = img;
	}
	// Return the images
	return img_files;
}