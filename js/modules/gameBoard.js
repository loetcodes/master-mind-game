// GAME BOARD CANVAS CLASS USED TO DRAW THE GAME BOARD.

// import {ScoreGame} from "./gameScoring.js"


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
	
	drawColorCircle(ctx, value = 0, color = this.color, size = 1) {
		// Draw a circle in a position (x, y).
		let context = ctx;
		let curr_radius = this.radius - value;
		context.beginPath();
		context.lineWidth = size;
		context.strokeStyle = color;
		context.arc(this.x, this.y, curr_radius, 0, 2 * Math.PI);
		context.stroke();
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
}


export class Board {
	constructor(canvas_1, canvas_2, ctx_1, ctx_2, board_size) {
		this.canvas_1 = canvas_1;
		this.canvas_2 = canvas_2;
		this.ctx_1 = ctx_1;
		this.ctx_2 = ctx_2;
		this.boardSize = board_size;
		this.curr_play_row = 10;
		this.row_grid_height = canvas_1.height / 12;
		this.rel_row_h = canvas_1.height / 12;
		this.color_panel = 1;
		this.height = canvas_1.height;
		this.width = canvas_1.width;
		this.color_pegs = [];
		this.scorePegImgs = {};
		this.row_circles = {};
		this.game_ctrls = {};
		this.game_state = true;
		this.row_answers = new Array (board_size).fill(0);
		this.game_answers = [];
		this.col_selected = false; // For storing colors that are clicked on;
		this.scoringBoxDetails = {};
		this.answerBoxDetails = {};
		this.scoringPegsCoords = [];
		this.scoreRelPositions = [];
		this.answerImgs = null;
	}

	drawLeftSidePegs(num_pegs, edge_size, color_panel, color_pegs, color_images, ColorCircle, ctx_1) {
		// Draws the left side image pegs.
		for (let k = 1; k <= num_pegs; k++) {
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
			}
		}
	}

	drawScoreRowPegs (score_row_start, y_space, rel_row_y = 0, color_panel, num_board, rows, ctx_1, answer_images) {
		// Draws the Scoring row image pegs.
		let scoring_img, scoring_img_height, scoring_img_width;
		let scoring_img_scale;
		let row_grid_height = this.row_grid_height;
		let rel_row_height = this.row_grid_height + rel_row_y * this.height;
		this.rel_row_h = rel_row_height; // Used later to place pegs in positions.
		let board = this;
		scoring_img = num_board[2];
		scoring_img.onload = () => {
			let x_pos, y_pos;
			scoring_img_scale = scoring_img.width / scoring_img.height;
			scoring_img_height = row_grid_height - (y_space * row_grid_height);
			scoring_img_width = scoring_img_height * scoring_img_scale;
			x_pos = score_row_start;
			this.scoringBoxDetails['width'] = scoring_img_width;
			this.scoringBoxDetails['height'] = scoring_img_height;
			this.scoringBoxDetails['x_pos'] = x_pos;			
			for (let i = 1; i <= rows; i++){
				y_pos = (i * rel_row_height) + (row_grid_height - scoring_img_height) / 2;
				ctx_1.drawImage(scoring_img, x_pos, y_pos, scoring_img_width, scoring_img_height);
			}
			// Create the scoring peg item using the box details.
			this.createScorePegs(board, answer_images);
		}
	}

	drawPlayerRowHole(row_start, rel_row_y=0, box_allowance, color_panel, hole_y, num_board, rows, ctx_1, ctx_2, GameCircle, board, color_images) {
		// Draws the row holes for each player and creates circle detection area.
		let hole_img, hole_img_width, hole_img_height, hole_img_scale;
		let ans_box_width, ans_box_height, ans_top_x, ans_top_y;
		let row_grid_height = this.row_grid_height;
		let width = this.width;
		let rel_row_height = this.row_grid_height + rel_row_y * this.height;
		let row_circles = this.row_circles;
		let boardSize = this.boardSize;
		hole_img = num_board[1];
		hole_img.onload = function () {
			let x_pos, y_pos, player_row_start;
			hole_img_scale = hole_img.width / hole_img.height;
			hole_img_height = row_grid_height - (hole_y * row_grid_height);
			hole_img_width = hole_img_height * hole_img_scale;
			ans_box_width = hole_img_width;
			ans_box_height = hole_img_height + (0.06 * hole_img_height) * 2;
			player_row_start = width - hole_img_width - color_panel + box_allowance * 1.4;
			x_pos = player_row_start;
			for (let i = 0; i <= rows; i++) {
				// Compute the y value, row_circle arr for each row.
				y_pos = i * rel_row_height + (row_grid_height - hole_img_height) / 2;
				row_circles[i] = board.createRowCircles(x_pos, y_pos, hole_img_height, hole_img_width, boardSize, ctx_2, GameCircle);
				if (i == 0) {
					// Store the answer box details
					board.createGameAnswerBox(player_row_start, rel_row_height, hole_img, hole_img_width, hole_img_height, ans_box_width, ans_box_height, width, board);
					// Draw the game answer box cover and bottom.
					board.drawGameAnswersBox(board);
				} else {
					// Draw the rest of the grid peg holes.
					ctx_1.drawImage(hole_img, x_pos, y_pos, hole_img_width, hole_img_height);
				}
			}

		}
		
	}

	createGameAnswerBox(playerRowStart, rowGridHeight, holeImg, holeImgWidth, holeImgHeight, ansBoxWidth, ansBoxHeight, width, board) {
		// Creates and draws the game answers box that stores the machines answers.
		let ansTopX = playerRowStart - (0.004 * width);
		let ansTopY = (rowGridHeight - holeImgHeight) / 2 - (0.04 * rowGridHeight);

		// Store the answerBox details for later use with reveal and to redraw the box.
		board.answerBoxDetails['holeImgHeight'] = holeImgHeight;
		board.answerBoxDetails['holeImgWidth'] = holeImgWidth;
		board.answerBoxDetails['holeImgSrc'] = holeImg;
		board.answerBoxDetails['width'] = ansBoxWidth;
		board.answerBoxDetails['height'] = ansBoxHeight;
		board.answerBoxDetails['startX'] = ansTopX;
		board.answerBoxDetails['startY'] = ansTopY;
		board.answerBoxDetails['playerRowStart'] = playerRowStart;
		board.answerBoxDetails['rowHeight'] = rowGridHeight;
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
		// Calculate the center of the circle object, create the circle object, pushing to row_circles
		for (let j = 1; j <= num_board_holes; j++) {
			x_center = (top_x  + spacing / 2 + radius) + (diameter +  spacing) * (j - 1);
			let circle_object = new GameCircle(x_center, y_center, radius, "blue", false);
			row_circles.push(circle_object);
		}
		return row_circles;
	}

	drawGameAnswersBox(board){
		// Draws the game answers box that stores the machines answers.
		// Draws the game answers box.
		let boxDetails = board.answerBoxDetails;
		let topX = boxDetails['startX'];
		let topY = boxDetails['startY'];
		let boxWidth = boxDetails['width'];
		let boxHeight = boxDetails['height'];
		let rowHeight = boxDetails['rowHeight'];
		let imgSrc = boxDetails['holeImgSrc'];
		let imgWidth = boxDetails['holeImgWidth'];
		let imgHeight = boxDetails['holeImgHeight'];
		let imgX = boxDetails['playerRowStart'];
		let imgY = (rowHeight - imgHeight) / 2;
		let ctx_1 = board.ctx_1;
		let ctx_2 = board.ctx_2;

		// Draw the Foreground graphic cover.
		ctx_2.lineWidth = 2.5;
		ctx_2.fillStyle = '#222226';
		ctx_2.strokeStyle = '#040707';
		ctx_2.fillRect(topX, topY, boxWidth, boxHeight);
		ctx_2.strokeRect(topX, topY, boxWidth, boxHeight);	
		ctx_2.lineWidth = 1;
		ctx_2.strokeStyle = 'transparent';
		ctx_1.lineWidth = 1;

		// Clear the bottom canvas graphics if any.
		board.clearFromCanvas(ctx_1, topX, topY, boxWidth, rowHeight);

		// Draw the background graphic color.
		ctx_1.lineWidth = 2.5;
		ctx_1.fillStyle = '#0e0e0ecc';
		ctx_1.strokeStyle = '#040707';
		ctx_1.fillRect(topX, topY, boxWidth, boxHeight);
		ctx_1.strokeRect(topX, topY, boxWidth, boxHeight);

		// Draw the background graphic peg image.
		ctx_1.drawImage(imgSrc, imgX, imgY, imgWidth, imgHeight);
	}

	drawAnswer(board, topRow, color_images) {
		// Draws the board answers in the answerBox, at the top.
		let ansRow = topRow;
		let roundAnswer = board.game_answers;
		let ctx_1 = board.ctx_1;
		ansRow.forEach((circle, i) => {
			let xPos, yPos, pegImg, currPeg, currWidth, currHeight;
			pegImg = color_images[roundAnswer[i]];
			currPeg = board.color_pegs[i];
			currWidth = currPeg.img_width;
			currHeight = currPeg.img_height;
			xPos = circle.x - currPeg.img_width / 2;
			yPos = circle.y - currPeg.img_height / 2;
			// Always draw on bottom canvas.
			ctx_1.drawImage(pegImg, xPos, yPos, currWidth, currHeight);
		})
	}

	drawCheckButton(check_icon, rel_row_y = 0, ColorCircle, ctx_1) {
		let check_icon_width, check_icon_height, check_icon_scale;
		let curr_play_row = this.curr_play_row;
		let row_grid_height = this.row_grid_height;
		let rel_row_height = this.row_grid_height + rel_row_y * this.height;
		let width = this.width;
		let temp = 'checkBtn';
		let game_ctrls = this.game_ctrls;
		let checkAnswer = this.checkAnswer;
		check_icon.onload = () => {
			let x_pos, y_pos, radius;
			check_icon_scale = check_icon.width / check_icon.height;
			check_icon_height = row_grid_height - (0.40 * row_grid_height);
			check_icon_width = check_icon_height * check_icon_scale;
			x_pos = width - (0.010 * width) - check_icon_width;
			y_pos = rel_row_height * curr_play_row + (row_grid_height - check_icon_height) / 2;
			radius = check_icon_width  / 2;
		
			// Circle obj used later for click detection and button movement
			let check_circle = new ColorCircle(x_pos + check_icon_width / 2, y_pos + check_icon_height / 2, radius, temp, check_icon_width, check_icon_height);

			// Store the action in a obj - circle, img, function.
			game_ctrls[temp] = [check_circle, check_icon, checkAnswer];
		
			// Draw the icon image
			ctx_1.drawImage(check_icon, x_pos, y_pos, check_icon_width, check_icon_height);
		}
	}

	createScorePegs(board, scoringImages) {
		// Creates the score pegs and stores them without drawing them.
		let posPegWidth, posPegHeight, colPegWidth, colPegHeight;
		let posPegScale, colPegScale;
		let posPegAnsCoords, colPegAnsCoords;
		let scoringBox = board.scoringBoxDetails;
		let boxHeight = scoringBox['height'];
		let boxWidth = scoringBox['width'];
		let boxStartX = scoringBox['x_pos'];
		let rel_height = boxHeight / 2 - (0.2 * boxHeight);
		let posPeg = scoringImages[1]
		let colPeg = scoringImages[2];
		let numPoses = board.boardSize;
		posPeg.onload = () => {
			posPegScale = posPeg.width / posPeg.height;
			posPegHeight = rel_height;
			posPegWidth = posPegHeight * posPegScale;
			let posPegCoords = board.calculateRelativeScorePos(numPoses, boxStartX, boxWidth, boxHeight, posPegWidth, posPegHeight);
			board.scoreRelPositions.push(posPegCoords); //Pos coords at idx 0.
		}
		colPeg.onload = () => {
			colPegScale = colPeg.width / colPeg.height;
			colPegHeight = rel_height;
			colPegWidth = colPegHeight * colPegScale;
			let colPegCoords = board.calculateRelativeScorePos(numPoses, boxStartX, boxWidth, boxHeight, colPegWidth, colPegHeight);
			board.scoreRelPositions.push(colPegCoords); //Col coords at idx 1.
		}
	}

	calculateRelativeScorePos(boardSize, score_row_start, scoring_img_width, scoring_img_height, image_width, image_height) {
		// Calculates the relative x and y coordinates to place pegs on an image. Returns an array with the relative coordinates/positions.
		let relativePoses;

		function calcFourBoard(size, score_row_start, scoring_img_width, scoring_img_height, image_width, image_height) {
			let result = [];
			for (let h = 1; h <= size; h++) {
				let corner_x, corner_y;
				if (h % 2 != 0) {
					corner_x = score_row_start + scoring_img_width / 2 - image_width - (0.02 * scoring_img_width);
				} else if (h % 2 == 0) {
					corner_x = score_row_start + scoring_img_width / 2 + (0.04 * scoring_img_width);
				}
				if (h <= size / 2) {
					corner_y = scoring_img_height / 2 - image_height;
				} else {
					corner_y = scoring_img_height / 2 + (0.08 * scoring_img_height);
				}
				let rel_pos_coords = {name : 'Relative Coords', x : corner_x, y : corner_y, width : image_width, height : image_height};
				result.push(rel_pos_coords);
			}
			return result;
		} 

		function calcFiveBoard(size, score_row_start, scoring_img_width, scoring_img_height, image_width, image_height) {
			let result = [];
			let mid = Math.round(size / 2);
			let x_gap = 0.05 * scoring_img_width;
			let y_gap = 0.08 * scoring_img_height;
			for (let h = 1; h <= size; h++) {
				let corner_x, corner_y;
				if (h != 3) {
					if (h < mid) {
						corner_x = score_row_start + h * (image_width + x_gap) - (x_gap * 2) + (h - 1) * (image_width + x_gap * 1.5);
						corner_y = scoring_img_height / 2 - image_height / 2;
					} else if(h > mid) {
						corner_x = score_row_start + (h - mid) * (image_width + x_gap) - (x_gap * 2) + ((h - mid) - 1) * (image_width + x_gap * 1.5);
						corner_y = scoring_img_height / 2 + image_height / 2 + y_gap ;
					}
				} else {
					corner_x = score_row_start  + scoring_img_width / 2 - (image_width / 2);
					corner_y = scoring_img_height / 2 + y_gap / 2;
				}
				let rel_pos_coords = {name : 'Relative Coords', x : corner_x, y : corner_y, width : image_width, height : image_height};
				result.push(rel_pos_coords);
			}
			return result;
		}

		function calcSixBoard(size, score_row_start, scoring_img_width, scoring_img_height, image_width, image_height) {
			let result = [];
			let x_gap = 0.05 * scoring_img_width;
			let y_gap = 0.08 * scoring_img_height;
			for (let h = 1; h <= size; h++) {
				let corner_x, corner_y;
				if (h <= size / 2) {
					corner_x = score_row_start + h * (image_width + x_gap) - (x_gap * 2);
					corner_y = scoring_img_height / 2 - image_height / 2 - y_gap;
				} else if(h > size / 2) {
					corner_x = score_row_start + (h - size / 2) * (image_width + x_gap) - (x_gap * 2);
					corner_y = scoring_img_height / 2 + image_height / 2 ;
				}
				let rel_pos_coords = {name : 'Relative Coords', x : corner_x, y : corner_y, width : image_width, height : image_height};
				result.push(rel_pos_coords);
			}
			return result;
		}

		// determines boardSize and call corresponding function.
		if (boardSize === 4) {
			relativePoses = calcFourBoard(4, score_row_start, scoring_img_width, scoring_img_height, image_width, image_height);
		} else if (boardSize === 5) {
			relativePoses = calcFiveBoard(5, score_row_start, scoring_img_width, scoring_img_height, image_width, image_height);
		} else if (boardSize === 6) {
			relativePoses = calcSixBoard(6, score_row_start, scoring_img_width, scoring_img_height, image_width, image_height);
		}
		return relativePoses;
		
	}

	getMousePosition(canvas, evt) {
		// Get the mouse position, accounting for the offset resulting from the canvas location being in the middle.
		let bounding_area = canvas.getBoundingClientRect();
		return {x : evt.clientX - bounding_area.left, y : evt.clientY - bounding_area.top};
	}

	checkIntersect(point, circle) {
		// Check if a point lies within a certain circle area.
		let dist = Math.abs(Math.sqrt((point.x - circle.x) ** 2 + (point.y - circle.y) ** 2));
		return dist <= circle.radius;
	}

	clearFromCanvas(ctx, top_x, top_y, width, height) {
		// Clear the canvas elements within a defined rectangle.
		let context = ctx;
		context.clearRect(top_x, top_y, width, height);
	}

	clearSelectedColor(ctx, selected) {
		// Function that clears a selected color, it takes a color_peg as input
		// Clear the color circle for the color panel
		let top_x = selected.x - selected.radius;
		let top_y = selected.y - selected.radius;
		let clear_width = selected.radius * 2;
		let clear_height = selected.radius * 2;
		let context = ctx;
		this.clearFromCanvas(context, top_x, top_y, clear_width, clear_height);
	}	
	
	checkAnswer(board) {
		// Uses a scoring class to score the row and overall game results.
		let result = [];
		let game_state = board.state;
		let curr_row = board.row_answers;
		let row_player_answers = [];
		if (curr_row.includes(0)) {
			// If one selects submit before all poses have been filled.
			return;
		} else {
			// Extract players answers into an array
			curr_row.forEach((img_obj) => {
				row_player_answers.push(img_obj.img_number);
			});

			// Score the players answer into black and white pegs
			let row_scores = board.scoreClass.scoreRowValues(board.game_answers, row_player_answers);

			// Draw the resulting pegs based on the row_scores
			let num_pos_ans = row_scores[1];
			let num_col_ans = row_scores[2];
			let counter = 0;
			let pos_coords = board.scoreRelPositions[0];
			let col_coords = board.scoreRelPositions[1];

			// Calculate height to curr play row.
			let y_abs = board.rel_row_h * board.curr_play_row;

			// Draw the pos pegs and col pegs if any.
			let ctx = board.ctx_2;
			let pospegImg = board.answerImgs[1];
			let colpegImg = board.answerImgs[2];
			counter = board.checkPegPositions(num_pos_ans, pospegImg, pos_coords, counter, ctx, y_abs);
			counter = board.checkPegPositions(num_col_ans, colpegImg, col_coords, counter, ctx, y_abs);

			// If all pegs, move to the next row, clear the player answers, move the submit/check button to the next row.
			if (num_pos_ans == board.boardSize) {
				// Game won, Reveal answers, Rate game.
				board.game_state = false;
				// Draw game answers.
				board.drawAnswer(board, board.row_circles[0], board.color_images);
				board.revealGameAnswers(board.ctx_2);
				result = board.rateGame(board, board.curr_play_row);
			} else if(board.curr_play_row > 1) {
				// Move to the next row, slide the submit answer as well.
				board.curr_play_row -= 1;
				board.moveCheckButton('checkBtn', board.curr_play_row);
			} else {
				// Reset board details and draw answers
				board.curr_play_row = 10;
				board.game_state = false;
				board.drawAnswer(board, board.row_circles[0], board.color_images);
				board.revealGameAnswers(board.ctx_2);
				result = board.rateGame(board, 0);
				board.moveCheckButton('checkBtn', board.curr_play_row);
			}

			// Reset the row poses to initial state
			board.row_answers = board.row_answers.fill(0);
			// Calculate game result if done
			if (board.game_state === false && board.starImgBack !== undefined) {
				if (result[0] === 0) {
					// Player lost. No stars only message
					board.displayResult(result[1]);
				} else {
					// Player won
					board.drawStarsFront(result[0]);
					board.displayResult(result[1]);
				}
			}
		}

	}

	checkPegPositions(numAnsw, pegAnswImg, coords, counter, ctx, yAbs) {
		// Check the positions of the passed pegs and draw on the canvas.
		let currCounter = counter;
		let context = ctx;
		for (let i = numAnsw; i > 0; i--) {
			let pegImg = pegAnswImg;
			let width = coords[currCounter].width;
			let height = coords[currCounter].height;
			let x = coords[currCounter].x;
			let y = coords[currCounter].y + yAbs;
			context.drawImage(pegImg, x, y, width, height);
			currCounter += 1;
		}
		return currCounter;
	}

	revealGameAnswers(ctx) {
		// Reveals the Board answers.
		let answerBoxDetails = this.answerBoxDetails;
		let startX = answerBoxDetails['startX'];
		let startY = answerBoxDetails['startY'];
		let rowGridHeight = this.row_grid_height;
		let clearSize = answerBoxDetails['width'] / 50;
		let context = ctx;
		setInterval(() => {
			this.clearFromCanvas(context, startX, startY, clearSize, rowGridHeight);
			startX += clearSize;
		}, 50);
	}

	moveCheckButton(btnName, newRow) {
		// Function that moves the check button to the current row playing.
		let nextRow = newRow;
		let checkArr = this.game_ctrls[btnName];
		let checkCircle = checkArr[0];
		let checkImg = checkArr[1];
		let clear_x = checkCircle.x - checkCircle.radius;
		let clear_y = checkCircle.y - checkCircle.radius;
		let clear_width = checkCircle.img_width + 0.02 * checkCircle.radius;
		let clear_height = checkCircle.img_height + 0.02 * checkCircle.radius;
		let ctx = this.ctx_1;
		this.clearFromCanvas(ctx, clear_x, clear_y, clear_width, clear_height);
		// Compute the new check button x and y positions.
		let new_x = clear_x;
		let new_y = nextRow * this.rel_row_h + (this.row_grid_height - checkCircle.img_height) / 2;
		checkCircle.y = new_y + checkCircle.img_height / 2;
		this.game_ctrls[btnName][0] = checkCircle;
		ctx.drawImage(checkImg, new_x, new_y, checkCircle.img_width, checkCircle.img_height);
	}

	playGame(color_images, answer_images) {
		this.answerImgs = answer_images;
		let canvas_1 = this.canvas_1;
		let canvas_2 = this.canvas_2;
		let ctx_2 = this.ctx_2;
		let board = this;
		canvas_2.addEventListener('click', (e) => {
			const pos = this.getMousePosition(canvas_2, e);
			if (this.game_state) {// If the game is in play
				// Check if the mouseclick was on any of the colors on the side panel.
				this.color_pegs.forEach(color_peg => {
					let click_result = this.checkIntersect(pos, color_peg);		
					// Clear any randomly selected colors that have not been played
					this.clearSelectedColor(ctx_2, color_peg);
					if (click_result) {
						// Add to col_selected, draw a circle around selected color
						this.col_selected = color_peg;
						color_peg.drawColorCircle(ctx_2, 3, "#797979", 4);
					}
				});
				// Identify the curr game row playing, then circle clicked.
				let circle_clicked = 0; 
				let check_circles = this.row_circles[this.curr_play_row];
				check_circles.forEach((circle, i) => {
					let circle_result = this.checkIntersect(pos, circle);
					if (circle_result) {
						// If clicked on the circle, check if their is a col_selected.
						if (this.col_selected) {
							// Means a color is selected store details.
							let curr_col = {
								img_number : this.col_selected.img_number, 
								src : color_images[this.col_selected.img_number], 
								x : circle.x, 
								y : circle.y, 
								radius : circle.radius, 
								width : this.col_selected.img_width, 
								height : this.col_selected.img_height
							};
							this.row_answers[i] = curr_col;
							// Clear color panel color circle, set col_selected to false
							this.clearSelectedColor(ctx_2, this.col_selected);
							this.col_selected = false;
						} else if (this.col_selected == false) {
							if (this.row_answers[i] != 0) {
								// Clicked on a circle with a color, hence remove that color.
								let top_x = circle.x - circle.radius;
								let top_y = circle.y - circle.radius;
								let clear_width = circle.radius * 2;
								let clear_height = circle.radius * 2;
								this.clearFromCanvas(ctx_2, top_x, top_y, clear_width, clear_height);
								this.row_answers[i] = 0; // set to zero as a result
							}
						}
					}
				});

				// Draw each pos based on row_poses, in the correct new position.
				for (let item of this.row_answers) {
					if (item !== 0) {
						ctx_2.drawImage(item.src, item.x - item.width / 2, item.y - item.height / 2, item.width, item.height);
					}
				}
			}
			// Check if any of the buttons have been clicked.
			let buttons_arrs = Object.entries(this.game_ctrls);
			buttons_arrs.forEach((button) => {
				let btn_name = button[0];
				let btn_item = button[1][0];
				let button_result = this.checkIntersect(pos, btn_item);
				if (button_result) {
					// Create and call the func expression. Return color selected.
					let btn_img = button[1][1];
					let btn_func = button[1][2];
					let game_state = this.game_state;
					btn_func(board);
					this.col_selected = false;
				}	
			});
		})
	}

	rateGame(board, playRow){
		// If a rating system has been defined
		let starRating, ratingMessage;
		if (board.ratingSys !== undefined) {
			let goldStars = board.goldStars;
			let goldStarImg = goldStars.goldStar;
			let maxRating = board.ratingSys.maxRating;
			starRating = board.ratingSys.starRating(playRow);
			ratingMessage = board.ratingSys.getRatingMsg(playRow);
			// Draw the starFront image.
			board.ratingSys.drawStarsScore(board, board.ctx_2, goldStars.posX, goldStars.posY, goldStars.width, goldStars.height, goldStarImg, starRating, maxRating);
			// Display Game Message.

		}
		return [starRating, ratingMessage];

	}

}