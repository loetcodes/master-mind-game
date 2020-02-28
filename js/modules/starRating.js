// RATING THE FULL GAME PLAY AT THE END OF THE GAME.
export var ratingMsgs = {
  0 : ["You'll get it next time!", "Give it another go!"],
  1 : ["Good One!", "You got this!", "Woohoo!"],
  2 : ["Great Job!", "Sweet!", "Amazing!"],
  3 : ["Impressive!", "Fantastic!", "Awesome"],
  4 : ["You're a Mastermind!", "Insanely Awesome!"],
  5 : ["Lucky! Lucky! Lucky!"]
};

export class RatingSystem {
  constructor (maxRating,  minRating, ratingRatios, maxRows, scoreMsgSystem = ratingMsgs) {
    this.maxRating = maxRating;
    this.minRating = minRating;
    this.ratingRatioArr = ratingRatios;
    this.totalValues = [];
    this.scoreMsgs = scoreMsgSystem;
    this.msgArr = [];
    this.starArr = [];
    this.highestLevel = maxRows;
  }
  
  msgRating(rateObj, totalNum) {
    // Creates a rating to select text to show the player depending on the row they win or lose on.
    let rating = [];
    let totalRatioSum = this.ratingRatioArr.reduce((a, b) => a + b);
    console.assert(totalRatioSum === totalNum + 1); // Plus one for zero rating.
    let count = 0;
    for (let value of rateObj) {
      let temp = [];
      for (let i = 1; i <= value; i ++) {
        temp.push(count);
        count ++;
      }
      rating.push(temp);
    }
    // Set this rating system to the ratingSystem property.
    this.msgArr = rating;
  }
  
  starRating(playRow) {
    let ratingNum = 0;
    let highestWin = this.highestLevel;
    if (playRow === 0 || playRow > highestWin) {
      // Player lost, no stars.
      ratingNum = 0;
      return ratingNum;
    }
    if (highestWin - playRow <= Math.round(highestWin / 2)) {
      ratingNum = 3;
    } else if (highestWin - playRow <= Math.round(highestWin * 4 / 5)) {
      ratingNum = 2;
    } else {
      ratingNum = 1;
    }
    return ratingNum;
  }
  
  getRatingMsg(playRow) {
    let msgArr = this.msgArr;
    let idx = 0;
    for (let i = 0; i <= msgArr.length; i++) {
      idx = i;
      if (msgArr[i].includes(playRow)) {
        let allMessages = this.scoreMsgs[idx];
        let randomChoice = Math.floor(Math.random() * allMessages.length);
        return allMessages[randomChoice];
      }
    }
  }
  
  drawStarImgs(board, canvasWidth, context, starsBackImg, starsFrontImg, height) {
    let ctx = context;
    let rowHeight = height;
    let starsBack = starsBackImg;
    let starsBackWidth, starsBackHeight, starsBackScale;
    let starsImgDetails = {'goldStar' : starsFrontImg};
    starsBack.onload = () => {
        let posX, posY, radius;
        let tempNo = 1;
        starsBackScale = starsBack.width / starsBack.height;
        starsBackHeight = rowHeight - (0.45 * rowHeight);
        starsBackWidth = starsBackHeight * starsBackScale;
        posX = (0.020 * canvasWidth); // 2 percent from the edge
        posY = (rowHeight - starsBackHeight) / 2;
        starsImgDetails['posX'] = posX;
        starsImgDetails['posY'] = posY;
        starsImgDetails['width'] = starsBackWidth;
        starsImgDetails['height'] = starsBackHeight;
        // Draw the icon image
        ctx.drawImage(starsBack , posX, posY, starsBackWidth, starsBackHeight);
        // Store details in board for use by board
        board.goldStars = starsImgDetails;
    }
  }
  
  drawStarsScore(board, context, positionX, positionY, width, height, img, ratingNum, totalRating) {
    // Draws a portion of the starScore based on the rating the game received.
    let sourcWidth, sourcHeight, imgScale, destWidth, destHeight;
    let ctx = context;
    let posX = positionX;
    let posY = positionY;
    sourcWidth = img.width;
    sourcHeight = img.height;
    imgScale = sourcWidth / sourcHeight;
    sourcWidth *= (ratingNum / totalRating);
    destHeight = height;
    destWidth = (destHeight * imgScale) * (ratingNum / totalRating);
    ctx.drawImage(img, 0, 0, sourcWidth, sourcHeight, posX, posY, destWidth, destHeight);
  }

}