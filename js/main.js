/* Javascript for MasterMind 2.0
*/


// Start by drawing the canvas based on the width of the window display, and space to be occupied by the canvas based on that outlined in the css grid template. Currently that is 90%.
let width = window.innerWidth * (90 / 100);
let height = window.innerHeight * (90 / 100);
let ratio = width / height;

let canvas = document.querySelector("canvas");
let ctx = document.querySelector("canvas").getContext("2d");

// Calculate the canvas width and height based on calculated ratio
canvas.width = height * ratio;
canvas.height = height;


// Load and store the peg color images and board images to be used in the game
let peg_colors = 8;
let peg_color_dict = {
	1 : "./images/peg_blue.png",
	2 : "./images/peg_green.png",
	3 : "./images/peg_yellow.png",
	4 : "./images/peg_orange.png",
	5 : "./images/peg_purple.png",
	6 : "./images/peg_red.png",
	7 : "./images/peg_black.png",
	8 : "./images/peg_white.png"
};

let board_hole_dict = {
	4 : "./images/board_holes_4slots.png",
	5 : "./images/board_holes_5slots.png",
	6 : "./images/board_holes_6slots.png",
	7 : "./images/answer_4slots.png",
	8 : "./images/answer_5slots.png",
	9 : "./images/answer_6slots.png"
};



// Event listeners for resize or load
// window.addEventListener('load', resize, false);
// window.addEventListener('resize', resize, false);






// DRAWING FIXED GRAPHICS ONTO THE CANVAS.

// Creating standard color pegs located on the left side panel.
// Compute the position to put the score panel based on the color panel
let color_panel;
for (let x = 1; x <= 8; x++) {
	let img = new Image();
	img.src = peg_color_dict[x];
	let img_height = canvas.height / 18;
	let img_width = img_height;
	color_panel = img_width + 15 * 2;
	img.onload = function () {
		y_pos = (x - 0) * img_height + (16 * 2 * x);
		ctx.drawImage(img, 15, y_pos, img_width, img_height);
	}
}


// Draw scoring_image and player peg holes images
// Compute the number of rows and row heights for each of the peg holes
let row_height = (canvas.height * 0.85) / 12;
for (let x = 1; x <= 10; x++) {
	// Positioning score image counter
	let scoring_img = new Image();
	scoring_img.src = board_hole_dict[7];

	let scoring_img_height, scoring_img_width;

	scoring_img.onload = function () {
		let scoring_img_scale = scoring_img.width / scoring_img.height;
		scoring_img_height = row_height;
		scoring_img_width = scoring_img_height * scoring_img_scale;

		console.log("scale for pegs is", scoring_img_scale);

		x_pos = color_panel + 50;
		y_pos = scoring_img_height + ((x - 1) * scoring_img_height + (12 * x));
		ctx.drawImage(scoring_img, x_pos, y_pos, scoring_img_width, scoring_img_height);
	}


	// Positioning player peg holes
	let hole_img = new Image();
	hole_img.src = board_hole_dict[4];

	let hole_img_width, hole_img_height;
	hole_img.onload = function () {
		let hole_img_scale = hole_img.width / hole_img.height;
		hole_img_height = row_height;
		hole_img_width = hole_img_height * hole_img_scale;

		console.log("scale for pegs is", hole_img_scale);

		x_pos = color_panel + scoring_img_width + 50 * 2;
		y_pos = hole_img_height + ((x - 1) * hole_img_height + (12 * x));
		ctx.drawImage(hole_img, x_pos, y_pos, hole_img_width, hole_img_height);
	}

}

let base_array;
base_array = generateRandomNumbers(4);

console.log("THE BASE ARRAY BEFORE THE GAME IS", base_array);

startNewGame(base_array, 4);




// Draw the circles that will hold the colors on each row.
// Each row shall have 4 color pockets positioned right above the peg holes. Implemented August 9th.





// Event listeners for resize or load
window.addEventListener('load', resize, false);
window.addEventListener('resize', resize, false);



// Function Declarations
function resize(){
	// Get the proper width based on the height, resize the canvas accordingly
	let ratio = width / height;
	canvas.style.height = height + "px";
	canvas.style.width = (height * ratio) + "px";

	ctx.width = height * ratio;
	ctx.height = height;
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


function generateColorAnswers(base_array) {
	// Function that generates color answers for the current game. It is compounding as it depends on values played in the previous array. At the initial start, the base array will be []. Returns a new sequence of numbers
	let answer_seq = [];
	let new_seq = generateRandomNumbers(base_array.length);

	if (base_array) {
		let new_num;
		for (let num of base_array) {
			new_num = num + new_seq.shift();
			if (new_num > 8) {
				new_num -= 7;
			}
			else if (new_num <= 0) {
				new_num += 8; // Remember to change this to be another random number below 7;
			}
			answer_seq.push(new_num);
		}
	}
	return answer_seq;
}


function startNewGame(base_array, hole_len) {
	// Function that starts a new game by generating new answers from an empty base,or building up on the previous base array if base array is not empty.
	if (base_array == false) {
		console.log("The base array is indeed empty");
		base_array = [];
		for (let i = 0; i < hole_len; i++) {
			base_array.push(0);
		}
	}

	// Generate the random numbers to add to the base numbers
	console.log("base array before is", base_array);

	let new_numbers = generateColorAnswers(base_array);
	console.log("new numbers logged for this round of the game is", new_numbers);
	return new_numbers;
}




















// function scaleToFit(img, max_width, y_pos){
// 	// get the canvas scale
// 	let canvas_scale = canvas.width / canvas.height;
// 	console.log("canvas scale is", canvas_scale);

// 	// canvas_width = document.getcanvas.width;
// 	// canvas_height = canvas.height;
// 	console.log("canvas width is now", canvas.width);
// 	console.log("canvas height is now", canvas.height);


// 	let box_height = canvas.height / 8;
// 	let image_scale = img.width / img.height;
// 	console.log("box height is now", box_height);
// 	console.log("image height is", img.height);



// 	let img_height = box_height;
// 	let img_width = box_height;
// 	console.log("image width is", img_width);
// 	console.log("image height is", img_height);
//     // ctx.drawImage(img, 0, 0, img.width, img.height / canvas_scale);
//     ctx.imageSmoothingEnabled = false;
//     ctx.drawImage(img, 0, 0, img_width, img_height);
// }







// for (let x = 1; x < 2; x++) {
// 	let image = new Image();
// 	image.src = peg_color_dict[x];
// 	image.onload = function () {
// 		scaleToFit(this, color_panel, x)
// 	}
	// let img = document.createElement("img");
	// img.src = peg_color_dict[x];
	// let img_width = color_panel;
	// let img_height = color_panel;
	// img.addEventListener("load", () => {
	// 	scaleToFit(this);
	// 	// ctx.drawImage(img, 0, x * color_panel);

	// 	console.log("drawn image", peg_color_dict[x], "with a height of", img_height, "and a width of", img_width,  "at x position", x, "y position", x * color_panel);
	// });
// }





// BACKGROUND IMAGE CHANGES

// let bk_img = new Image();
// bk_img.src = "./images/overview_background.png";
// bk_img.onload = function() {
// 	scaleToFill(this);
// }

// function scaleToFill(img){
// 	// get the scale
//     let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
//     // get the top left position of the image
//     let x = (canvas.style.width / 2) - (img.width / 2) * scale;
//     let y = (canvas.style.height / 2) - (img.height / 2) * scale;
//     ctx.drawImage(img, x, y, img.width, img.height);
// }
