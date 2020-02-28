// CONTROL BUTTONS FOR GAME - NEW GAME, BACK AND HINT

// import {ColorCircle} from "./gameBoard.js"

export class GameControlButton {
  constructor(board, height, name, icon, width=1) {
    this.width = width;
    this.height = height;
    this.name = name;
    this.gameControlIcon = icon;
    this.gameControlName = "";
    this.gameControlArr = [];
  }
  
  drawButtonImage(board, ctx, xPos, yPos, ColorCircle, functionality) {
    let gameBtnWidth, gameBtnHeight, gameIconScale;
    let gameBtnImg = this.gameControlIcon;
    let btnHeight = this.height;
    let btnName = this.name;
    let context = ctx;
    let gameControlName = this.gameControlName;
    let gameControlArr = this.gameControlArr;
    let btnFunc = functionality;
    gameBtnImg.onload = () => {
      let posX, posY, radius;
      let centerX, centerY;
      
      gameIconScale = gameBtnImg.width / gameBtnImg.height;
      gameBtnHeight = btnHeight - (0.40 * btnHeight);
      gameBtnWidth = gameBtnHeight * gameIconScale;

      posX = xPos - gameBtnWidth;
      posY = yPos - gameBtnHeight;
      radius = gameBtnWidth / 2;
      // Circle obj used for click detection.
      centerX = posX + gameBtnWidth / 2;
      centerY = posY + gameBtnHeight / 2;
      let gameBtnCircle = new ColorCircle(centerX, centerY, radius, btnName, gameBtnWidth, gameBtnHeight);

      // Store the action in a obj - circle, img, function.
      gameControlName = btnName;
      gameControlArr.push(gameBtnCircle, gameBtnImg, btnFunc);

      // Draw the icon image.
      context.drawImage(gameBtnImg, posX, posY, gameBtnWidth, gameBtnHeight);
    }
  }
  
  getButtonControl() {
    let controlArr = this.gameControlArr;
    return controlArr;
  }

}
