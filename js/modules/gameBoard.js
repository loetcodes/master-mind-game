// GAME BOARD CANVAS CLASS USED TO DRAW THE GAME BOARD.

// import {ScoreGame} from "./gameScoring.js"

export class BoardCanvas {
    constructor(width, height, wRatio, hRatio) {
        this.windowWidth = width;
        this.windowHeight = height;
        this.widthRatio = wRatio;
        this.heightRatio = hRatio;
		this.canvasSize = this.calculateOptimumCanvas(width, height, wRatio, hRatio);
		this.width = this.canvasSize.width;
		this.height = this.canvasSize.height;
	}

	calculateOptimumCanvas(windowW, windowH){
        // Function that computes the optimum width height that is within the given ratio
        // for the board.
		let canvasSize;
		let maxWidth = windowW;
		let ratio = windowW / windowH;
		let tempHeight = Math.round(windowH * 0.99);	
		if (windowH > windowW) {
			let tempWidth = Math.round(tempHeight * this.widthRatio/ this.heightRatio);
			if (tempWidth <= maxWidth) {
				canvasSize = {width:tempWidth, height:tempHeight};
			} else {
				return this.calculateOptimumCanvas(windowW, tempHeight);
			}
		} else if (windowW >= windowH) { // Keep canvas width fixed
			let tempWidth = Math.round(tempHeight * this.widthRatio / this.heightRatio);
			canvasSize = {width:tempWidth, height:tempHeight};
		}
		return canvasSize;
	}
}

export class ColorCircle {
	constructor(centerX, centerY, radius, objNum, objWidth, objHeight) {
		// Creates a color circle object that stores info on the color image.
		this.x = centerX;
		this.y = centerY;
		this.radius = radius;
		this.imgNum = objNum;
		this.imgWidth = objWidth;
		this.imgHeight = objHeight;
		this.color = 'red';
	}
	
	drawColorCircle(ctx, value = 0, color = this.color, size = 1) {
		// Draw a circle in a position (x, y).
		let context = ctx;
		let currRadius = this.radius - value;
		context.beginPath();
		context.lineWidth = size;
		context.strokeStyle = color;
		context.arc(this.x, this.y, currRadius, 0, 2 * Math.PI);
		context.stroke();
	}
}

export class GameCircle {
	constructor(centerX, centerY, radius, color, state) {
		// Creates a circle object
		this.x = centerX;
		this.y = centerY;
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
	constructor(canvas1, canvas2, ctx1, ctx2, boardSize) {
		this.canvas1 = canvas1;
		this.canvas2 = canvas2;
		this.ctx1 = ctx1;
		this.ctx2 = ctx2;
		this.boardSize = boardSize;
		this.currPlayRow = 10;
		this.rowGridHeight = canvas1.height / 12;
		this.relRowH = canvas1.height / 12;
		this.colorPanel = 1;
		this.height = canvas1.height;
		this.width = canvas1.width;
		this.colorPegs = [];
		this.scorePegImgs = {};
		this.rowCircles = {};
		this.gameCtrls = {};
		this.gameState = true;
		this.rowAnswers = new Array (boardSize).fill(0);
		this.gameAnswers = [];
		this.colSelected = false; // For storing colors that are clicked on;
		this.scoringBoxDetails = {};
		this.answerBoxDetails = {};
		this.scoringPegsCoords = [];
		this.scoreRelPositions = null;
		this.answerImgs = null;
	}

	drawLeftSidePegs(numPegs, edgeSize, colorPanel, colorPegs, colorImages, ColorCircle, ctx1) {
		// Draws the left side image pegs.
		for (let k = 1; k <= numPegs; k++) {
			let xPos, yPos, radius, xPosCenter, yPosCenter;
			let imgH = this.rowGridHeight - (0.40 * this.rowGridHeight);
			let imgW = imgH;
			this.colorPanel = imgW  + (edgeSize * this.canvas1.width) * 2;

			// Calculate spread gap from height minus answer box and bottom panel
			let gapY = (this.canvas1.height - this.rowGridHeight * 3) / 8;
			xPos = (edgeSize * this.canvas1.width); // Percent from edge.
			yPos = k * this.rowGridHeight + (this.rowGridHeight - imgH) / 2;
			yPos += ((gapY / 2 ) * (k - 1)) / 2; // Additional gap added
			radius = (imgW) / 2;
			radius += 5; // Additional click detection allowance
			xPosCenter = xPos + radius - 5;
			yPosCenter = yPos + imgH / 2;

			// Create a color peg object used later for detection of click
			let colorPeg = new ColorCircle(xPosCenter, yPosCenter, radius, k, imgW, imgH);
			this.colorPegs.push(colorPeg);
			let img = colorImages[k];
			img.onload = function () {
				ctx1.drawImage(img, xPos, yPos, imgW, imgH);
			}
		}
	}

    drawScoreRowPegs (scoreRowStart, ySpace, relRowY = 0, colorPanel,
                      numBoard, rows, ctx1, answerImages) {
		// Draws the Scoring row image pegs.
		let scoringImg, scoringImgHeight, scoringImgWidth;
		let scoringImgScale;
		let rowGridHeight = this.rowGridHeight;
		let relRowHeight = this.rowGridHeight + relRowY * this.height;
		this.relRowH = relRowHeight; // Used later to place pegs in positions.
		let board = this;
		scoringImg = numBoard[2];
		scoringImg.onload = () => {
			let xPos, yPos;
			let boxDetails = {};
			scoringImgScale = scoringImg.width / scoringImg.height;
			scoringImgHeight = rowGridHeight - (ySpace * rowGridHeight);
			scoringImgWidth = scoringImgHeight * scoringImgScale;
			xPos = scoreRowStart;
			board.scoringBoxDetails['width'] = scoringImgWidth;
			board.scoringBoxDetails['height'] = scoringImgHeight;
			board.scoringBoxDetails['xPos'] = xPos;
			boxDetails['width'] = scoringImgWidth;
			boxDetails['height'] = scoringImgHeight;
			boxDetails['xPos'] = xPos;		
			for (let i = 1; i <= rows; i++){
				yPos = (i * relRowHeight) + (rowGridHeight - scoringImgHeight) / 2;
				ctx1.drawImage(scoringImg, xPos, yPos, scoringImgWidth, scoringImgHeight);
			}
			// Create the scoring peg item using the box details and draw check button.
            // board.createScorePegs(board, answerImages, boxDetails);
            console.log("CREATING SCORE PEGS");
		}
        // board.createScorePegs(answerImages, boxDetails);
	}

    drawPlayerRowHole(relRowY=0, boxAllowance, colorPanel, holeY, numBoard,
                      rows, ctx1, ctx2, GameCircle, board, colorImages) {
		// Draws the row holes for each player and creates circle detection area.
		let holeImg, holeImgWidth, holeImgHeight, holeImgScale;
		let ansBoxWidth, ansBoxHeight;
		let rowGridHeight = this.rowGridHeight;
		let width = this.width;
		let relRowHeight = this.rowGridHeight + relRowY * this.height;
		let rowCircles = this.rowCircles;
		let boardSize = this.boardSize;
		holeImg = numBoard[1];
		holeImg.onload = function () {
			let xPos, yPos, playerRowStart;
			holeImgScale = holeImg.width / holeImg.height;
			holeImgHeight = rowGridHeight - (holeY * rowGridHeight);
			holeImgWidth = holeImgHeight * holeImgScale;
			ansBoxWidth = holeImgWidth;
			ansBoxHeight = holeImgHeight + (0.06 * holeImgHeight) * 2;
			playerRowStart = width - holeImgWidth - colorPanel + boxAllowance * 1.4;
			xPos = playerRowStart;
			for (let i = 0; i <= rows; i++) {
				// Compute the y value, row_circle arr for each row.
				yPos = i * relRowHeight + (rowGridHeight - holeImgHeight) / 2;
                rowCircles[i] = board.createRowCircles(xPos, yPos, holeImgHeight, holeImgWidth,
                                                       boardSize, ctx2, GameCircle);
				if (i == 0) {
					// Store the answer box details
                    board.createGameAnswerBox(playerRowStart, relRowHeight, holeImg,
                                              holeImgWidth, holeImgHeight, ansBoxWidth,
                                              ansBoxHeight, width, board);
					// Draw the game answer box cover and bottom.
					board.drawGameAnswersBox(board);
				} else {
					// Draw the rest of the grid peg holes.
					ctx1.drawImage(holeImg, xPos, yPos, holeImgWidth, holeImgHeight);
				}
			}
		}	
	}

    createGameAnswerBox(playerRowStart, rowGridHeight, holeImg, holeImgWidth, holeImgHeight,
                        ansBoxWidth, ansBoxHeight, width, board) {
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

	createRowCircles(topX, topY, currHeight, currWidth, boardHoles, ctx, GameCircle) {
		// Returns an array of row circles representing the possible play positions.
		let rowCircles = [];
		let centerX, centerY;
		let outerEdge = currHeight * 0.15;
		let diameter = currHeight - outerEdge;
		let radius = diameter / 2;
		let spacing = (currWidth - (diameter * boardHoles)) / boardHoles;
		centerY = topY + currHeight / 2;	
		// Calculate the center of the circle object, create the circle object, pushing to rowCircles
		for (let j = 1; j <= boardHoles; j++) {
			centerX = (topX  + spacing / 2 + radius) + (diameter +  spacing) * (j - 1);
			let circleObj = new GameCircle(centerX, centerY, radius, "blue", false);
			rowCircles.push(circleObj);
		}
		return rowCircles;
	}

	drawGameAnswersBox(board){
		// Draws the game answers box that stores the machines answers.
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
		let ctx1 = board.ctx1;
		let ctx2 = board.ctx2;

		// Draw the Foreground graphic cover.
		ctx2.lineWidth = 2.5;
		ctx2.fillStyle = '#222226';
		ctx2.strokeStyle = '#040707';
		ctx2.fillRect(topX, topY, boxWidth, boxHeight);
		ctx2.strokeRect(topX, topY, boxWidth, boxHeight);	
		ctx2.lineWidth = 1;
		ctx2.strokeStyle = 'transparent';
		ctx1.lineWidth = 1;

		// Clear the bottom canvas graphics if any and draw the background.
		board.clearFromCanvas(ctx1, topX, topY, boxWidth, rowHeight);
		ctx1.lineWidth = 2.5;
		ctx1.fillStyle = '#0e0e0ecc';
		ctx1.strokeStyle = '#040707';
		ctx1.fillRect(topX, topY, boxWidth, boxHeight);
		ctx1.strokeRect(topX, topY, boxWidth, boxHeight);

		// Draw the background graphic peg image.
		ctx1.drawImage(imgSrc, imgX, imgY, imgWidth, imgHeight);
	}

	drawAnswer(board, topRow, colorImages) {
		// Draws the board answers in the answerBox, at the top.
		let ansRow = topRow;
		let roundAnswer = board.gameAnswers;
		let ctx1 = board.ctx1;
		ansRow.forEach((circle, i) => {
			let xPos, yPos, pegImg, currPeg, currWidth, currHeight;
			pegImg = colorImages[roundAnswer[i]];
			currPeg = board.colorPegs[i];
			currWidth = currPeg.imgWidth;
			currHeight = currPeg.imgHeight;
			xPos = circle.x - currPeg.imgWidth / 2;
			yPos = circle.y - currPeg.imgHeight / 2;
			// Always draw on bottom canvas.
			ctx1.drawImage(pegImg, xPos, yPos, currWidth, currHeight);
		})
	}

	drawCheckButton(checkIcon, relRowY = 0, ColorCircle, ctx1) {
		let checkIconWidth, checkIconHeight, checkIconScale;
		let currPlayRow = this.currPlayRow;
		let rowGridHeight = this.rowGridHeight;
		let relRowHeight = this.rowGridHeight + relRowY * this.height;
		let width = this.width;
		let temp = 'checkBtn';
		let gameCtrls = this.gameCtrls;
		let checkAnswer = this.checkAnswer;
		checkIcon.onload = () => {
			let xPos, yPos, radius;
			checkIconScale = checkIcon.width / checkIcon.height;
			checkIconHeight = rowGridHeight - (0.40 * rowGridHeight);
			checkIconWidth = checkIconHeight * checkIconScale;
			xPos = width - (0.010 * width) - checkIconWidth;
			yPos = relRowHeight * currPlayRow + (rowGridHeight - checkIconHeight) / 2;
            radius = checkIconWidth  / 2;
      
			// Circle obj used later for click detection and button movement
            let checkCircle = new ColorCircle(xPos + checkIconWidth / 2, yPos + checkIconHeight / 2, radius,
                                              temp, checkIconWidth, checkIconHeight);

			// Store the action in a obj - circle, img, function.
			gameCtrls[temp] = [checkCircle, checkIcon, checkAnswer];
		
			// Draw the icon image
			ctx1.drawImage(checkIcon, xPos, yPos, checkIconWidth, checkIconHeight);
		}
	}

	createScorePegs(scoringImages, boxDetails) {
        // Creates the score pegs and stores them without drawing them.
        let board = this;
		let posPegWidth, posPegHeight, colPegWidth, colPegHeight;
		let posPegScale, colPegScale;
		let posPegAnsCoords, colPegAnsCoords;
        let scoringBox = boxDetails;
        console.log("INSIDE THE SCORE PEGS, THE SCORE BOX DETS", scoringBox);
		let boxHeight = scoringBox['height'];
		let boxWidth = scoringBox['width'];
		let boxStartX = scoringBox['xPos'];
        let relHeight = boxHeight / 2 - (0.2 * boxHeight);
        console.log("INSIDE THE SCORE PEGS, THE relHeight is", relHeight);
        console.log("INSIDE THE SCORE PEGS, THE boxHeight is", boxHeight);
        console.log("INSIDE THE SCORE PEGS, THE boxWidth is", boxWidth);
        console.log("The box height directly is", scoringBox['height'])
		let posPeg = scoringImages[1];
        let colPeg = scoringImages[2];
        let numPoses = board.boardSize;
		posPeg.onload = () => {
            posPegScale = posPeg.width / posPeg.height;
            console.log("pospeg width and height", posPeg.width, posPeg.height);
            console.log("Rel height is", relHeight);
			posPegHeight = relHeight;
            posPegWidth = posPegHeight * posPegScale;
            console.log("Calling the calculate relative score poses for pospeg");
            board.scorePegImgs["posPegActualHeight"] = posPeg.height;
            board.scorePegImgs["posPegActualWidth"] = posPeg.width;
            // board.calculateRelativeScorePos(numPoses, boxStartX, boxWidth, boxHeight,
            //                                                              posPegWidth, posPegHeight, 0)
            // board.calculateRelativeScorePos(numPoses, boxStartX, boxWidth, boxHeight,
            //                                 posPegWidth, posPegHeight, board.scoreRelPositions, 0);
            // board.scoreRelPositions[0] = this.calculateRelativeScorePos(numPoses, boxStartX,
            //                                                boxWidth, boxHeight,
            //                                                posPegWidth, posPegHeight);
        }
		colPeg.onload = () => {
			colPegScale = colPeg.width / colPeg.height;
			colPegHeight = relHeight;
            colPegWidth = colPegHeight * colPegScale;
            board.scorePegImgs["colPegActualHeight"] = colPeg.height;
            board.scorePegImgs["colPegActualWidth"] = colPeg.width;
            console.log("Calling the calculate relative score poses for colpeg");
            // board.calculateRelativeScorePos(numPoses, boxStartX,
            //                                                             boxWidth, boxHeight,
            //                                                             colPegWidth, colPegHeight, 1);
            // board.calculateRelativeScorePos(numPoses, boxStartX, boxWidth, boxHeight,
            //                                 colPegWidth, colPegHeight, board.scoreRelPositions, 1);
            // board.scoreRelPositions[1] = this.calculateRelativeScorePos(numPoses, boxStartX,
            //                                                boxWidth, boxHeight,
            //                                                colPegWidth, colPegHeight);
        }
        
    }
    
    calculateRelativeScorePos(boardSize, scoreRowStart, scoringImgWidth, scoringImgHeight, imageWidth,
                              imageHeight) {
        // calculateRelativeScorePos(boardSize, scoreRowStart, scoringImgWidth, scoringImgHeight, imageWidth,
        //                           imageHeight, scoreRelPositions, idx) {
        // Calculates the relative x and y coordinates to place pegs on an image. 
        // Returns an array with the relative coordinates/positions.
        let relativePoses;
        // console.log("PARAMETERS ARE: ", boardSize, scoreRowStart, scoringImgWidth, scoringImgHeight, imageWidth,
        // imageHeight);

		function calcFourBoard(size, scoreRowStart, scoringImgWidth, scoringImgHeight, imageWidth, imageHeight) {
			let result = [];
			for (let h = 1; h <= size; h++) {
				let cornerX, cornerY;
				if (h % 2 != 0) {
					cornerX = scoreRowStart + scoringImgWidth / 2 - imageWidth - (0.02 * scoringImgWidth);
				} else if (h % 2 == 0) {
					cornerX = scoreRowStart + scoringImgWidth / 2 + (0.04 * scoringImgWidth);
				}
				if (h <= size / 2) {
					cornerY = scoringImgHeight / 2 - imageHeight;
				} else {
					cornerY = scoringImgHeight / 2 + (0.08 * scoringImgHeight);
				}
				let relPosCoords = {name : 'Relative Coords', x : cornerX, y : cornerY, width : imageWidth, height : imageHeight};
				result.push(relPosCoords);
			}
			return result;
		} 

		function calcFiveBoard(size, scoreRowStart, scoringImgWidth, scoringImgHeight, imageWidth, imageHeight) {
			let result = [];
			let mid = Math.round(size / 2);
			let gapX = 0.05 * scoringImgWidth;
			let gapY = 0.08 * scoringImgHeight;
			for (let h = 1; h <= size; h++) {
				let cornerX, cornerY;
				if (h != 3) {
					if (h < mid) {
						cornerX = scoreRowStart + h * (imageWidth + gapX) - (gapX * 2) + (h - 1) * (imageWidth + gapX * 1.5);
						cornerY = scoringImgHeight / 2 - imageHeight / 2;
					} else if(h > mid) {
						cornerX = scoreRowStart + (h - mid) * (imageWidth + gapX) - (gapX * 2) + ((h - mid) - 1) * (imageWidth + gapX * 1.5);
						cornerY = scoringImgHeight / 2 + imageHeight / 2 + gapY ;
					}
				} else {
					cornerX = scoreRowStart  + scoringImgWidth / 2 - (imageWidth / 2);
					cornerY = scoringImgHeight / 2 + gapY / 2;
				}
				let relPosCoords = {name : 'Relative Coords', x : cornerX, y : cornerY, width : imageWidth, height : imageHeight};
				result.push(relPosCoords);
			}
			return result;
		}

		function calcSixBoard(size, scoreRowStart, scoringImgWidth, scoringImgHeight, imageWidth, imageHeight) {
			let result = [];
			let gapX = 0.05 * scoringImgWidth;
			let gapY = 0.08 * scoringImgHeight;
			for (let h = 1; h <= size; h++) {
				let cornerX, cornerY;
				if (h <= size / 2) {
					cornerX = scoreRowStart + h * (imageWidth + gapX) - (gapX * 2);
					cornerY = scoringImgHeight / 2 - imageHeight / 2 - gapY;
				} else if(h > size / 2) {
					cornerX = scoreRowStart + (h - size / 2) * (imageWidth + gapX) - (gapX * 2);
					cornerY = scoringImgHeight / 2 + imageHeight / 2 ;
				}
				let relPosCoords = {name : 'Relative Coords', x : cornerX, y : cornerY, width : imageWidth, height : imageHeight};
				result.push(relPosCoords);
			}
			return result;
        }
    
		// determines boardSize and call corresponding function.
		if (boardSize === 4) {
			relativePoses = calcFourBoard(4, scoreRowStart, scoringImgWidth, scoringImgHeight, imageWidth, imageHeight);
		} else if (boardSize === 5) {
			relativePoses = calcFiveBoard(5, scoreRowStart, scoringImgWidth, scoringImgHeight, imageWidth, imageHeight);
		} else if (boardSize === 6) {
			relativePoses = calcSixBoard(6, scoreRowStart, scoringImgWidth, scoringImgHeight, imageWidth, imageHeight);
		}

        return relativePoses;
		
	}

	getMousePosition(canvas, evt) {
		// Get the mouse position, accounting for the offset resulting from the canvas location being in the middle.
		let boundingArea = canvas.getBoundingClientRect();
		return {x : evt.clientX - boundingArea.left, y : evt.clientY - boundingArea.top};
	}

	checkIntersect(point, circle) {
		// Check if a point lies within a certain circle area.
		let dist = Math.abs(Math.sqrt((point.x - circle.x) ** 2 + (point.y - circle.y) ** 2));
		return dist <= circle.radius;
	}

	clearFromCanvas(ctx, topX, topY, width, height) {
		// Clear the canvas elements within a defined rectangle.
		let context = ctx;
		context.clearRect(topX, topY, width, height);
	}

	clearSelectedColor(ctx, selected) {
		// Function that clears a selected color, it takes a colorPeg as input
		// Clear the color circle for the color panel
		let topX = selected.x - selected.radius;
		let topY = selected.y - selected.radius;
		let clearWidth = selected.radius * 2;
		let clearHeight = selected.radius * 2;
		let context = ctx;
		this.clearFromCanvas(context, topX, topY, clearWidth, clearHeight);
	}	
	
	checkAnswer(board) {
		// Uses a scoring class to score the row and overall game results.
        let result = [];
		let gameState = board.gameState;
		let currentRow = board.rowAnswers;
		let currPlayerAnswers = [];
		if (currentRow.includes(0)) {
			// If one selects submit before all poses have been filled.
			return;
		} else {
			// Extract players answers into an array
			currentRow.forEach((imgObject) => {
				currPlayerAnswers.push(imgObject.imgNum);
			});

			// Score the players answer into black and white pegs
			let rowScores = board.scoreClass.scoreRowValues(board.gameAnswers, currPlayerAnswers);

			// Draw the resulting pegs based on the rowScores
			let numPosAnswer = rowScores[1];
			let numColAnswer = rowScores[2];
            let counter = 0;
            let posCoords, colCoords;
            if (board.scoreRelPositions == null) {
                // Compute the relative coords
                board.scoreRelPositions = {};
                let numBoard = board.boardSize;
                // Get the scoring box hole sizes
                let boxWidth = board.scoringBoxDetails['width'];
                let boxHeight = board.scoringBoxDetails['height'];
                let startX = board.scoringBoxDetails['xPos'];
                let relHeight = boxHeight / 2 - (0.2 * boxHeight)

                // Compute the relative position values for both ColPegs and PosPegs
                let currPosWidth = board.scorePegImgs['posPegActualWidth'];
                let currPosHeight = board.scorePegImgs['posPegActualHeight'];
                let posPegScale = currPosWidth / currPosHeight;
                let posPegHeight = relHeight;
                let posPegWidth = posPegHeight * posPegScale;

                // Compute the drawing size for the colPegs
                let currColWidth = board.scorePegImgs['colPegActualWidth'];
                let currColHeight = board.scorePegImgs['colPegActualHeight'];
                let colPegScale = currColWidth / currColHeight;
                let colPegHeight = relHeight;
                let colPegWidth = colPegHeight * colPegScale;

                // store the coords for both in board.scoreRelPositions
                board.scoreRelPositions[0] = board.calculateRelativeScorePos(numBoard, startX, boxWidth,
                    boxHeight, posPegWidth, posPegHeight);
                board.scoreRelPositions[1] = board.calculateRelativeScorePos(numBoard, startX, boxWidth,
                        boxHeight, colPegWidth, colPegHeight);
            }
			posCoords = board.scoreRelPositions[0];
			colCoords = board.scoreRelPositions[1];

			// Calculate height to curr play row.
			let relativeY = board.relRowH * board.currPlayRow;

			// Draw the pos pegs and col pegs if any.
			let ctx = board.ctx2;
			let pospegImg = board.answerImgs[1];
            let colpegImg = board.answerImgs[2];
            // console.log("POSPEG IMAGE: ", pospegImg);
            // console.log("COLPEG IMAGE: ", colpegImg);
            // console.log("POS COORDS: ", posCoords);
            // console.log("COL COORDS: ",colCoords);
            // console.log("BOARD IS", board);
			counter = board.checkPegPositions(numPosAnswer, pospegImg, posCoords, counter, ctx, relativeY);
			counter = board.checkPegPositions(numColAnswer, colpegImg, colCoords, counter, ctx, relativeY);

			// If all pegs, move to the next row, clear the player answers, move the submit/check button to the next row.
			if (numPosAnswer == board.boardSize) {
				// Game won, Reveal answers, Rate game.
				board.gameState = false;
				// Draw game answers.
				board.drawAnswer(board, board.rowCircles[0], board.colorImages);
				board.revealGameAnswers(board.ctx2);
				result = board.rateGame(board, board.currPlayRow);
			} else if(board.currPlayRow > 1) {
				// Move to the next row, slide the submit answer as well.
				board.currPlayRow -= 1;
				board.moveCheckButton('checkBtn', board.currPlayRow);
			} else {
				// Reset board details and draw answers
				board.currPlayRow = 10;
				board.gameState = false;
				board.drawAnswer(board, board.rowCircles[0], board.colorImages);
				board.revealGameAnswers(board.ctx2);
				result = board.rateGame(board, 0);
				board.moveCheckButton('checkBtn', board.currPlayRow);
			}

			// Reset the row poses to initial state
			board.rowAnswers = board.rowAnswers.fill(0);
			// Calculate game result if done
			if (board.gameState === false && board.starImgBack !== undefined) {
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
		let rowGridHeight = this.rowGridHeight;
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
		let checkArr = this.gameCtrls[btnName];
		let checkCircle = checkArr[0];
		let checkImg = checkArr[1];
		let clearX = checkCircle.x - checkCircle.radius;
		let clearY = checkCircle.y - checkCircle.radius;
		let clearWidth = checkCircle.imgWidth + 0.02 * checkCircle.radius;
		let clearHeight = checkCircle.imgHeight + 0.02 * checkCircle.radius;
		let ctx = this.ctx1;
		this.clearFromCanvas(ctx, clearX, clearY, clearWidth, clearHeight);
		// Compute the new check button x and y positions.
		let newX = clearX;
		let newY = nextRow * this.relRowH + (this.rowGridHeight - checkCircle.imgHeight) / 2;
		checkCircle.y = newY + checkCircle.imgHeight / 2;
		this.gameCtrls[btnName][0] = checkCircle;
		ctx.drawImage(checkImg, newX, newY, checkCircle.imgWidth, checkCircle.imgHeight);
	}

	playGame(colorImages, answerImages) {
		this.answerImgs = answerImages;
		let canvas1 = this.canvas1;
		let canvas2 = this.canvas2;
		let ctx2 = this.ctx2;
		let board = this;
		canvas2.addEventListener('click', (e) => {
			const pos = this.getMousePosition(canvas2, e);
			if (this.gameState) {// If the game is in play
				// Check if the mouseclick was on any of the colors on the side panel.
				this.colorPegs.forEach(colorPeg => {
					let clickResult = this.checkIntersect(pos, colorPeg);		
					// Clear any randomly selected colors that have not been played
					this.clearSelectedColor(ctx2, colorPeg);
					if (clickResult) {
						// Add to colSelected, draw a circle around selected color
						this.colSelected = colorPeg;
						colorPeg.drawColorCircle(ctx2, 3, "#797979", 4);
					}
				});
				// Identify the curr game row playing, then circle clicked.
				let checkCircles = this.rowCircles[this.currPlayRow];
				checkCircles.forEach((circle, i) => {
					let circleResult = this.checkIntersect(pos, circle);
					if (circleResult) {
						// If clicked on the circle, check if their is a colSelected.
						if (this.colSelected) {
							// Means a color is selected store details.
							let currCol = {
								imgNum : this.colSelected.imgNum, 
								src : colorImages[this.colSelected.imgNum], 
								x : circle.x, 
								y : circle.y, 
								radius : circle.radius, 
								width : this.colSelected.imgWidth, 
								height : this.colSelected.imgHeight
							};
							this.rowAnswers[i] = currCol;
							// Clear color panel color circle, set colSelected to false
							this.clearSelectedColor(ctx2, this.colSelected);
							this.colSelected = false;
						} else if (this.colSelected == false) {
							if (this.rowAnswers[i] != 0) {
								// Clicked on a circle with a color, hence remove that color.
								let topX = circle.x - circle.radius;
								let topY = circle.y - circle.radius;
								let clearWidth = circle.radius * 2;
								let clearHeight = circle.radius * 2;
								this.clearFromCanvas(ctx2, topX, topY, clearWidth, clearHeight);
								this.rowAnswers[i] = 0; // set to zero as a result
							}
						}
					}
				});

				// Draw each pos based on row_poses, in the correct new position.
				for (let item of this.rowAnswers) {
					if (item !== 0) {
						ctx2.drawImage(item.src, item.x - item.width / 2, item.y - item.height / 2, item.width, item.height);
					}
				}
			}
			// Check if any of the buttons have been clicked.
			let buttonsArrs = Object.entries(this.gameCtrls);
			buttonsArrs.forEach((button) => {
				let btnName = button[0];
				let btnItem = button[1][0];
				let buttonResult = this.checkIntersect(pos, btnItem);
				if (buttonResult) {
					// Create and call the func expression. Return color selected.
					let btnImg = button[1][1];
					let btnFunc = button[1][2];
					let gameState = this.gameState;
					btnFunc(board);
					this.colSelected = false;
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
            board.ratingSys.drawStarsScore(board, board.ctx2, goldStars.posX,
                                           goldStars.posY, goldStars.width, goldStars.height,
                                           goldStarImg, starRating, maxRating);
			// Display Game Message.

		}
		return [starRating, ratingMessage];

	}

}