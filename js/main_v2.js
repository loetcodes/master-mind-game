/* Javascript for MasterMind 2.0

Current window design for is 550px width.

Made provisions for 2 canvases.
 1. Canvas for drawing the background fixed graphics.
 2. Canvas for drawing the player moves and temporary images in play.

*/


// Start by drawing the canvas. For this version will be a fixed canvas of 500 px.
// Declare the two canvasses and the respective context.
let canvas_1, canvas_2, ctx_1, ctx_2;
let width, height;

init(); // Initialize the canvas sizes and widths

// The urls for the peg color images and board images to be used in the game
let peg_colors = 8;
let peg_url = {
	1 : "./images/04_Peg_blue.png",
	2 : "./images/04_Peg_green.png",
	3 : "./images/04_Peg_yellow.png",
	4 : "./images/04_Peg_orange.png",
	5 : "./images/04_Peg_purple.png",
	6 : "./images/04_Peg_red.png",
	7 : "./images/04_Peg_black.png",
	8 : "./images/04_Peg_white.png"
};

let answer_pegs = {
	1 : "./images/05_Answer_black",
	2 : "./images/05_Answer_white",
	3 : "./images/05_Answer_red",
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


// Initialize the game state to false. This will be true when the player starts the game. If false, then the game has ended, no more moves allowed.
let game_state = true;

let color_panel = 0;
let score_row_start = 0;
let player_row_start = 0;
let right_panel_start = 0;

let color_pegs = []; // stores the color pegs shapes
let color_images = {}; // store all the color panel images created.

let row_circles = {};
let scoring_circles = {};

let row_poses = [0, 0, 0, 0];
let curr_play_row = 10;
let player_answers = [];
let col_selected = false; // For storing colours that are clicked on;

let right_ctrl_btns = []; // Stores the button objects
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
	4 : checkAnswer
};



// DRAWING FIXED GRAPHICS ONTO THE BACKGROUND CANVAS.
/* Draw:
	1. Side color panel (8 colors)
	2. Scoring image pegs (10 rows)
	3. Player peg holes (10)
	4. Right side icons
*/


// Left Side panel of colors
for (let k = 1; k <= 8; k++) {
	let img_height = canvas_1.height / 20;
	let img_width = img_height;
	let img = new Image();
	img.src = peg_url[k];
	color_panel = img_width + 8 * 2;

	img.onload = function () {
		let x_pos, y_pos, radius, x_pos_center, y_pos_center;

		x_pos = 10;
		y_pos = (k - 0) * img_height + (20 * 2 * k);
		radius = (img_width) / 2;

		x_pos_center = 10 + radius;
		y_pos_center = y_pos + img_height / 2;

		// Create a color peg object used later for detection of click, push to color pegs array. 
		let color_peg = new ColorCircle(x_pos_center, y_pos_center, radius, k, img_width, img_height);
		color_pegs.push(color_peg);

		// Store the color peg in the color_images dictionary
		color_images[k] = img;

		// Draw the image and the color circle.
		ctx_1.drawImage(img, x_pos, y_pos, img_width, img_height);
		color_peg.drawCircle();
	}
}


console.log("color pegs array is", color_pegs);
console.log("color images in the dictionary are", color_images);


// Draw scoring_image and player peg holes images
let row_height = (canvas_1.height * 0.85) / 12;
score_row_start = color_panel + 15;
player_row_start = score_row_start + 50;

for (let i = 1; i <= 10; i++) {
	// Positioning scoring counter image.
	let scoring_img = new Image();
	scoring_img.src = board_hole_url[7];

	let scoring_img_height, scoring_img_width, scoring_img_scale;
	scoring_img.onload = function () {
		let x_pos, y_pos;

		scoring_img_scale = scoring_img.width / scoring_img.height;
		scoring_img_height = row_height;
		scoring_img_width = scoring_img_height * scoring_img_scale;

		x_pos = score_row_start;
		y_pos = scoring_img_height + ((i - 1) * scoring_img_height + (14 * (i - 1)));

		ctx_1.drawImage(scoring_img, x_pos, y_pos, scoring_img_width, scoring_img_height);
	}

	// Positioning player image peg holes
	let hole_img = new Image();
	hole_img.src = board_hole_url[4];

	let hole_img_width, hole_img_height, hole_img_scale;
	hole_img.onload = function () {
		let x_pos, y_pos;
		
		hole_img_scale = hole_img.width / hole_img.height;
		hole_img_height = row_height;
		hole_img_width = hole_img_height * hole_img_scale;

		player_row_start = score_row_start + scoring_img_width + 25;

		x_pos = player_row_start;
		y_pos = hole_img_height + ((i - 1) * hole_img_height + (14 * (i - 1)));

		ctx_1.drawImage(hole_img, x_pos, y_pos, hole_img_width, hole_img_height);

		// Create row circles array for each row with a number as well.
		row_circles[i] = createRowCircles(x_pos, y_pos, row_height, num_board_holes[0], game_state);
	}
}


// Control buttons for back, new game, hint and check answer.

// back game icon
let back_icon = new Image();
back_icon.src = icons_url["back"];

let back_icon_width, back_icon_height, back_icon_scale;
back_icon.onload = () => {
	let x_pos, y_pos, radius;
	let temp_no = 1;

	back_icon_scale = back_icon.width / back_icon.height;
	back_icon_height = row_height - 15;
	back_icon_width = back_icon_height * back_icon_scale;

	x_pos = 8;
	y_pos = row_height * 11 + (10 * 14);
	radius = back_icon_width - 10;

	// Create a hint circle obj used later for click detection, push to right buttons.
	// use the number to access the correct function in the right_panel_key.
	let back_circle = new ColorCircle(x_pos + back_icon_width / 2, y_pos + back_icon_height / 2, radius, temp_no, back_icon_width, back_icon_height);
	right_ctrl_btns.push(back_circle);

	back_circle.drawCircle();

	// Draw the icon image
	ctx_1.drawImage(back_icon, x_pos, y_pos, back_icon_width, back_icon_height);
}


// new game icon
let newgame_icon = new Image();
newgame_icon.src = icons_url["new"];

let newgame_icon_width, newgame_icon_height, newgame_icon_scale;
newgame_icon.onload = () => {
	let x_pos, y_pos, radius;
	let temp_no = 2;

	newgame_icon_scale = newgame_icon.width / newgame_icon.height;
	newgame_icon_height = row_height - 15;
	newgame_icon_width = newgame_icon_height * newgame_icon_scale;

	
	x_pos = score_row_start + (12 * 2);
	y_pos = row_height + row_height * 10 + 10 * 14;
	radius = newgame_icon_width - (12 * 2);

	// Create a hint circle obj used later for click detection, push to right buttons.
	// use the number to access the correct function in the right_panel_key.
	let newg_circle = new ColorCircle(x_pos + newgame_icon_width / 2, y_pos + newgame_icon_height / 2, radius, temp_no, newgame_icon_width, newgame_icon_height);
	right_ctrl_btns.push(newg_circle);

	newg_circle.drawCircle();

	// Draw the icon image
	ctx_1.drawImage(newgame_icon, x_pos, y_pos, newgame_icon_width, newgame_icon_height);
}


// Hint icon
let hint_icon = new Image();
hint_icon.src = icons_url["hint"];

let hint_icon_width, hint_icon_height, hint_icon_scale;
hint_icon.onload = () => {
	let x_pos, y_pos, radius;
	let temp_no = 3;

	hint_icon_scale = hint_icon.width / hint_icon.height;
	hint_icon_height = row_height - 15;
	hint_icon_width = hint_icon_height * hint_icon_scale;

	x_pos = score_row_start * 2 + (12 * 6);
	y_pos = row_height + row_height * 10 + 10 * 14;
	radius = hint_icon_width - (12 * 2);

	// Create a hint circle obj used later for click detection, push to right buttons.
	// use the number to access the correct function in the right_panel_key.
	let hint_circle = new ColorCircle(x_pos + hint_icon_width / 2, y_pos + hint_icon_height / 2, radius, temp_no, hint_icon_width, hint_icon_height);
	right_ctrl_btns.push(hint_circle);

	hint_circle.drawCircle();

	// Draw the icon image
	ctx_1.drawImage(hint_icon, x_pos, y_pos, hint_icon_width, hint_icon_height);
}


// Check icon at the bottom.
let check_icon = new Image();
check_icon.src = icons_url["submit"];

let check_icon_width, check_icon_height;
check_icon.onload = () => {
	let radius, check_icon_scale;
	let temp_no = 4;

	check_icon_scale = check_icon.width / check_icon.height;
	check_icon_height = row_height - 15;
	check_icon_width = check_icon_height * check_icon_scale;

	right_panel_start = canvas_1.width - 4 - check_icon_width;

	x_pos = right_panel_start;
	y_pos = row_height * (curr_play_row + 2) + 10;
	radius = check_icon_width - (12 * 2);

	// Create a hint circle obj used later for click detection, push to right buttons.
	// use the number to access the correct function in the right_panel_key.
	let check_circle = new ColorCircle(x_pos + check_icon_width / 2, y_pos + check_icon_height / 2, radius, temp_no, check_icon_width, check_icon_height);
	right_ctrl_btns.push(check_circle);

	check_circle .drawCircle();

	// Draw the icon image
	ctx_1.drawImage(check_icon, x_pos, y_pos, check_icon_width, check_icon_height);
}





// COMPUTE THE ANSWERS FOR THE GAME AND STORE THEM
let base_array;
base_array = generateRandomNumbers(num_board_holes[0]); 
let game_answers = newGameAnswers(base_array, num_board_holes[0]);

console.log("Game answers are now", game_answers);
console.log("Row circles are now", row_circles);





// EVENT LISTENERS  --Updated: 12 August.

window.addEventListener('load', resize, false);
window.addEventListener('resize', resize, false);
canvas_2.addEventListener('click', (e) => {
	// Get location of the mouseclick event
	const pos = getMousePosition(canvas_2, e);
	console.log("Mouse was clicked on x pos", pos.x, "and y pos is", pos.y);

	// Check if the mouseclick was on any of the colors on the side panel. 
	color_pegs.forEach(color_peg => {
		let click_result = checkIntersect(pos, color_peg);
		if (click_result) {
			// Add the image selected to col_selected.
			col_selected = color_peg;
			console.log("The color selected is color number", col_selected);
		}
	});


	// Identify the curr game row playing, then circle clicked.
	let circle_clicked = 0; // Identify the circle clicked.
	let check_circles = row_circles[curr_play_row];
	console.log("Game row consists of the following circles", check_circles);

	// Check each row for the current play row.
	check_circles.forEach(function (circle, i) {
		let circle_result = checkIntersect(pos, circle);
		console.log("The result of checking circle", i, "is", circle_result);

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
	console.log("Row poses are", row_poses);
	for (let item of row_poses) {
		if (item !== 0) {
			ctx_2.drawImage(item.src, item.x - item.radius + 2, item.y - item.radius, item.width, item.height);
		}
	}


	// Check if any of the buttons have been clicked
	right_ctrl_btns.forEach(function(button) {
		let button_result = checkIntersect(pos, button);

		if (button_result) {
			console.log("You clicked on button", button.img_number,"which is the", ctrl_btns_action[button.img_number]);

			// Create and call the func expression.
			let btn_func = ctrl_btns_funcs[button.img_number];
			btn_func();
		}

	});



	// If submit is clicked, draw the scoring pegs from the result.

});





































// CONSTRUCTORS 

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

ColorCircle.prototype.drawCircle = function() {
	// Draw a circle in a position (x, y).
	ctx_2.beginPath();
	ctx_2.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	ctx_2.strokeStyle = this.color;
	ctx_2.stroke();
};




// FUNCTION DECLARATIONS

function init() {
	canvas_1 = document.getElementById('game-bottom');
	canvas_2 = document.getElementById('game-player');

	ctx_1 = canvas_1.getContext('2d');
	ctx_2 = canvas_2.getContext('2d');

	canvas_1.width  = 520;
	canvas_1.height = 890;
	let ratio = width / height;

	canvas_2.width  = canvas_1.width;
	canvas_2.height = canvas_1.height;

	ctx_1.width = 520;
	ctx_2.height = 890;

	ctx_2.width = ctx_1.width;
	ctx_2.height = ctx_1.height;
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
	// Check if a point lies within a certain circle area by computing its distance from the center of the circle.
	let dist = Math.abs(Math.sqrt((point.x - circle.x) ** 2 + (point.y - circle.y) ** 2));
	return dist <= circle.radius;
}


function drawCircle(context, x, y, radius, color) {
	// Draw a circle in a position (x, y)
	ctx_2.beginPath();
	ctx_2.arc(x, y, radius, 0, 2 * Math.PI);
	ctx_2.strokeStyle = "color";
	ctx_2.stroke();
}


// function drawImageOnCanvas(context, image, x, y, width, height) {
// 	// Draws on a specific context.
// 	context.drawImage(image, x, y, width, height);
// }


function clearFromCanvas(context, top_x, top_y, width, height) {
	// Clear the canvas elements within a defined rectangle.
	context.clearRect(top_x, top_y, width, height);
}


function createRowCircles(top_x, top_y, height, no_of_circles, game_state) {
	// Create an array of circle objects.
	let radius = (height - 15) / 2;
	let diameter = radius * 2;

	let x_center, y_center;
	y_center = top_y + 1 + height / 2;

	let row_circles = [];

	for (let j = 1; j <= num_board_holes[0]; j++) {
		// Calculate the center of the circle object.
		x_center = (top_x + radius + 6.5) + radius * 2 * (j - 1) + (j - 1) * (15); // when you deduct 15 from height

		// Create a circle object then push it to row_circles
		let circle_object = new GameCircle(x_center, y_center, radius, "", false);
		row_circles.push(circle_object);

		// Draw the circle. Remove the draw function once everything is outlined. FINAL STEPS
		drawCircle(x_center, y_center, radius, "");
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

	// First check for any black pegs. Black pegs are where the player puts the color in the correct position
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

	// Check for white pegs from the reduced array where black scored pegs have been removed.
	if (num_black_peg == machine_ans.length) {
		return result;
	} else {
		// check for white pegs
		for (let j = 0; j < p_reduced.length; j++) {
			if (m_reduced.includes(p_ans[j])) {
				num_white_peg += 1;
			}
		}
		result[2] = num_white_peg;
	}

	// return the result of the black and white pegs
	return result;
}


function checkAnswer() {
	// Checks the answer submitted for the row against the machine answer.
	let curr_row = row_poses;
	let row_player_answers = [];
	console.log("When submitted the row answers were", curr_row);

	if (curr_row.includes(0)) {
		// Meaning their is an unfilled position
		return;
	} else {
		// Extract the players answers into an array.
		curr_row.forEach((img_obj) => {
			row_player_answers.push(img_obj.img_number);
		});

		// Consider selecting submit when you have not answered everything should do nothing

		// Score the players answer into black and white pegs
		let row_scores = calulatePegValues(game_answers, row_player_answers);
		console.log("The resulting score is", row_scores);

		// Draw the resulting pegs based on the row_scores


		// If all 4 pegs, game_state should be false


		// If not, move the submit button higher up a row, then change the curr row play

	
		//return result;
	}

}


