// GAME BOARD CANVAS CLASS USED TO DRAW THE GAME BOARD.

export class BoardCanvas {
	constructor(width, height, width_ratio, height_ratio) {
		this.window_width = width;
		this.window_height = height;
		this.width_ratio = width_ratio;
		this.height_ratio = height_ratio;
		this.canvas_size = this.calculateOptimumCanvas(width, height, width_ratio, height_ratio);
		this.width = this.canvas_size.width;
		this.height = this.canvas_size.height;
	}

	calculateOptimumCanvas(window_width, window_height){
		// Function that computes the optimum width height that is within the given ratio for the board.
		let canvas_size;
		let max_width = window_width;
		let window_ratio = window_width / window_height;
		let temp_height = Math.round(window_height * 0.99);
	
		if (window_height > window_width) {
			let temp_width = Math.round(temp_height * this.width_ratio/ this.height_ratio);
			if (temp_width <= max_width) {
				canvas_size = {width:temp_width, height:temp_height};
			} else {
				return this.calculateOptimumCanvas(window_width, temp_height);
			}
		} else if (window_width >= window_height) { // Keep canvas width fixed
			let temp_width = Math.round(temp_height * this.width_ratio / this.height_ratio);
			canvas_size = {width:temp_width, height:temp_height};
		}
		return canvas_size;
	}
}


export class ColorCircle {
	constructor(x_center, y_center, radius, img_number, img_width, img_height) {
		// Creates a color circle object that stores info on the color image.
		this.x = x_center;
		this.y = y_center;
		this.radius = radius;
		this.img_number = img_number;
		this.img_width = img_width;
		this.img_height = img_height;
		this.color = 'red';
	}
	
	drawColorCircle(value = 0, color = this.color, size = 1) {
		// Draw a circle in a position (x, y).
		let curr_radius = this.radius - value;
		ctx_2.beginPath();
		ctx_2.lineWidth = size;
		ctx_2.strokeStyle = color;
		ctx_2.arc(this.x, this.y, curr_radius, 0, 2 * Math.PI);
		ctx_2.stroke();
	}
}


export class GameCircle {
	constructor(x_center, y_center, radius, color, state) {
		// Creates a circle object
		this.x = x_center;
		this.y = y_center;
		this.radius = radius;
		this.color = color;
		this.state = state;
	}
	
	drawCircle(ctx, x, y, radius, color) {
		// Draw a circle in a position (x, y)
		let context = ctx;
		context.beginPath();
		context.arc(x, y, radius, 0, 2 * Math.PI);
		context.strokeStyle = color;
		context.stroke();
	}
	
	// clearSelectedColor(selected) {
	// 	// Function that clears a selected color, it takes a color_peg as input
	// 	// Clear the color circle for the color panel
	// 	let top_x = selected.x - selected.radius;
	// 	let top_y = selected.y - selected.radius;
	// 	let clear_width = selected.radius * 2;
	// 	let clear_height = selected.radius * 2;
	// 	clearFromCanvas(ctx_2, top_x, top_y, clear_width, clear_height);
	// }
}


export class Board {
	constructor(canvas_1, canvas_2, ctx_1, ctx_2, board_size) {
		this.canvas_1 = canvas_1;
		this.canvas_2 = canvas_2;
		this.ctx_1 = ctx_1;
		this.ctx_2 = ctx_2;
		this.board_size = board_size;
		this.row_grid_height = canvas_1.height / 12;
		this.color_panel = 1;
		this.height = canvas_1.height;
		this.width = canvas_1.width;
		this.color_pegs = [];
		this.row_circles = {};
	}

	drawLeftSidePegs(edge_size, color_panel, color_pegs, color_images, k, ColorCircle, ctx_1) {
		// Draws the left side image pegs.
		let x_pos, y_pos, radius, x_pos_center, y_pos_center;
		let img_height = this.row_grid_height - (0.40 * this.row_grid_height);
		let img_width = img_height;
		this.color_panel = img_width + (edge_size * this.canvas_1.width) * 2;

		// Calculate spread gap from height minus answer box and bottom panel
		let gap_y = (this.canvas_1.height - this.row_grid_height * 3) / 8;

		x_pos = (edge_size * this.canvas_1.width); // Percent from edge.
		y_pos = k * this.row_grid_height + (this.row_grid_height - img_height) / 2;
		y_pos += ((gap_y / 2 ) * (k - 1)) / 2; // Additional gap added
		radius = (img_width) / 2;
		radius += 5; // Additional click detection allowance

		x_pos_center = x_pos + radius - 5;
		y_pos_center = y_pos + img_height / 2;

		// Create a color peg object used later for detection of click
		let color_peg = new ColorCircle(x_pos_center, y_pos_center, radius, k, img_width, img_height);
		this.color_pegs.push(color_peg);

		let img = color_images[k];
		img.onload = function () {
			ctx_1.drawImage(img, x_pos, y_pos, img_width, img_height);
			// color_peg.drawColorCircle();
		}	
	}

	drawScoreRowPegs (score_row_start, y_space, rel_row_y = 0, color_panel, num_board, rows, ctx_1) {
		// Draws the Scoring row image pegs.
		let scoring_img, scoring_img_height, scoring_img_width;
		let scoring_img_scale;
		let row_grid_height = this.row_grid_height;
		let rel_row_height = this.row_grid_height + rel_row_y * this.height;
		scoring_img = num_board[2];
		scoring_img.onload = function () {
			let x_pos, y_pos;
			scoring_img_scale = scoring_img.width / scoring_img.height;
			scoring_img_height = row_grid_height - (y_space * row_grid_height);
			scoring_img_width = scoring_img_height * scoring_img_scale;
			x_pos = score_row_start;
			for (let i = 1; i <= rows; i++){
				y_pos = (i * rel_row_height) + (row_grid_height - scoring_img_height) / 2;
				ctx_1.drawImage(scoring_img, x_pos, y_pos, scoring_img_width, scoring_img_height);
			}
		}
	}

	drawPlayerRowHole(row_start, rel_row_y=0, box_allowance, color_panel, hole_y, num_board, rows, ctx_1, ctx_2, GameCircle, board) {
		// Draws the row holes for each player and creates circle detection area.
		let hole_img, hole_img_width, hole_img_height, hole_img_scale;
		let ans_box_width, ans_box_height, ans_top_x, ans_top_y;
		let row_grid_height = this.row_grid_height;
		let width = this.width;
		let rel_row_height = this.row_grid_height + rel_row_y * this.height;
		let row_circles = this.row_circles;
		let board_size = this.board_size;
		// let board = board;
		hole_img = num_board[1];
		hole_img.onload = function () {
			console.log('this when called from hole_img is',this);
			console.log('The board is', board);
			let x_pos, y_pos;
			hole_img_scale = hole_img.width / hole_img.height;
			hole_img_height = row_grid_height - (hole_y * row_grid_height);
			hole_img_width = hole_img_height * hole_img_scale;
			ans_box_width = hole_img_width;
			ans_box_height = hole_img_height + (0.06 * hole_img_height) * 2;
			let player_row_start = width - hole_img_width - color_panel + box_allowance * 1.4;
			x_pos = player_row_start;
			for (let i = 0; i <= rows; i++) {
				// Compute the y value for the images
				y_pos = i * rel_row_height + (row_grid_height - hole_img_height) / 2;
				
				// Row circles array for each row, stored with a corresponding number.
				row_circles[i] = board.createRowCircles(x_pos, y_pos, hole_img_height, hole_img_width, board_size, ctx_2, GameCircle);
				
				if (i == 0) {
					// Draw the Answer box cover, background peg hole images.
					board.drawGameAnswersBox(player_row_start, rel_row_height, hole_img, hole_img_width, hole_img_height, ans_box_width, ans_box_height, width, ctx_1, ctx_2);

					// drawGameAnswers(set_answ, row_circles[0]);
					// ctx_1.drawImage(hole_img, x_pos, y_pos, hole_img_width, hole_img_height);
				} else {
					// Draw the rest of the grid peg hole images.
					ctx_1.drawImage(hole_img, x_pos, y_pos, hole_img_width, hole_img_height);
				}
			}

		}
		
	}

	drawGameAnswersBox(player_row_start, row_grid_height, hole_img, hole_img_width, hole_img_height, ans_box_width, ans_box_height, width, ctx_1, ctx_2){
		// Draws the game answers box that stores the machines answers.
		let ans_top_x = player_row_start - (0.004 * width);
		let ans_top_y = (row_grid_height - hole_img_height) / 2 - (0.04 * row_grid_height);
	
		// Clear the bottom canvas graphics if any
		// clearFromCanvas(ctx_1, ans_top_x, ans_top_y, ans_box_width, row_grid_height);
	
		// Draw the Background graphic color.
		ctx_1.lineWidth = 2.5;
		ctx_1.fillStyle = '#0e0e0ecc';
		ctx_1.strokeStyle = '#040707';
		ctx_1.fillRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);
		ctx_1.strokeRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);
	
		// Draw the background graphic peg image.
		let img_x = player_row_start;
		let img_y = (row_grid_height - hole_img_height) / 2;
		ctx_1.drawImage(hole_img, img_x, img_y, hole_img_width, hole_img_height);
	
		// Foreground graphic
		ctx_2.lineWidth = 2.5;
		ctx_2.fillStyle = '#222226';
		ctx_2.strokeStyle = '#040707';
		ctx_2.fillRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);
		ctx_2.strokeRect(ans_top_x, ans_top_y, ans_box_width, ans_box_height);
	
		ctx_2.lineWidth = 1;
		ctx_2.strokeStyle = 'transparent';
		ctx_1.lineWidth = 1;
	}

	createRowCircles(top_x, top_y, curr_height, curr_width, num_board_holes, ctx, GameCircle) {
		// Returns an array of row circles representing the possible play positions.
		let row_circles = [];
		let x_center, y_center;
		let outer_allowance = curr_height * 0.15;
		let diameter = curr_height - outer_allowance;
		let radius = diameter / 2;
		let spacing = (curr_width - (diameter * num_board_holes)) / num_board_holes;	
		y_center = top_y + curr_height / 2;
		console.log('Num board holes is ', num_board_holes);
	
		// Calculate the center of the circle object, create the circle object, pushing to row_circles
		for (let j = 1; j <= num_board_holes; j++) {
			x_center = (top_x  + spacing / 2 + radius) + (diameter +  spacing) * (j - 1);
			let circle_object = new GameCircle(x_center, y_center, radius, "blue", false);
			row_circles.push(circle_object);
			console.log('Circle object is ', GameCircle);
			console.log('x_center is ', x_center);
			console.log('radius is ', radius);
	
			// Draw the circle. Remove the draw function once everything is outlined. FINAL STEPS
			circle_object.drawCircle(ctx, x_center, y_center, radius, "blue");
		}
		// console.log('Game Circles are', row_circles);
		return row_circles;
	}

}










































// class GameBoard {
// 	constructor(peg_colors, num_pegs, width, height, total_rows, curr_play_row, BoardCanvas) {
// 		this.board_ratio_width = 9;
// 		this.board_ratio_height = 16;
// 		this.peg_colors = peg_colors;
// 		this.board_width = width;
// 		this.board_height = height;
// 	}
	
// }






// class GameCircle {
// 	constructor(x_center, y_center, radius, color, state) {
// 		// Creates a circle object
// 		this.x = x_center;
// 		this.y = y_center;
// 		this.radius = radius;
// 		this.color = color;
// 		this.state = state;
// 	}
// }
