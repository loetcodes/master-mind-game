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

export class BoardGraphics {
	constructor(canvas_1, canvas_2, ctx_1, ctx_2, peg_cols, play_holes, answer_holes, answer_box, star_score_hole) {
		this.canvas_1 = canvas_1;
		this.canvas_2 = canvas_2;
		this.ctx_1 = ctx_1;
		this.ctx_2 = ctx_2;
		this.row_grid_height = canvas_1.height / 12;
	}

	drawSidePegColors(edge_size, images,){

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






// // class GameCircle {
// // 	constructor(x_center, y_center, radius, color, state) {
// // 		// Creates a circle object
// // 		this.x = x_center;
// // 		this.y = y_center;
// // 		this.radius = radius;
// // 		this.color = color;
// // 		this.state = state;
// // 	}
// // }


// // class ColorCircle {
// // 	constructor(x_center, y_center, radius, img_number, img_width, img_height) {
// // 		// Creates a color circle object that stores info on the color image.
// // 		this.x = x_center;
// // 		this.y = y_center;
// // 		this.radius = radius;
// // 		this.img_number = img_number;
// // 		this.img_width = img_width;
// // 		this.img_height = img_height;
// // 		this.color = 'red';
// // 	}
	
// // 	drawColorCircle(value = 0, color = this.color, size = 1) {
// // 		// Draw a circle in a position (x, y).
// // 		let curr_radius = this.radius - value;
// // 		ctx_2.beginPath();
// // 		ctx_2.lineWidth = size;
// // 		ctx_2.strokeStyle = color;
// // 		ctx_2.arc(this.x, this.y, curr_radius, 0, 2 * Math.PI);
// // 		ctx_2.stroke();
// // 	}
// // }