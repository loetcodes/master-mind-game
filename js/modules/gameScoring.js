// SCORING CLASS USED

export class ScoreGame {
  constructor (expected) {
    this.machineAnswers = expected;
    this.playerAnswers = [];
  }
  
  scoreRowValues(machineAns, playerAns) {
    // Check if values are the same. If not, return to what extent they are different.
    // If you find a position that is correct, do not count it anymore, check the rest instead.
    let mAns, pAns;
    let numPosPeg = 0;
    let numColPeg = 0;
    let playerPegs = [];
    let answerPegs = [];
    let result = {};
    // Check for any correctly positioned pegs.
    for (let i = 0; i < machineAns.length; i++) {
      mAns = machineAns[i];
      pAns = playerAns[i];
      if (mAns == pAns) {
        numPosPeg += 1;
      } else {
        answerPegs.push(mAns);
        playerPegs.push(pAns);
      }
    }
    result[1] = numPosPeg;
    result[2] = numColPeg;
    // Check if all correctly positioned. If not, check for correctly colored pegs.
    if (numPosPeg == machineAns.length) {
      return result;
    } else {
      for (let j = 0; j < playerPegs.length; j++) {
        if (answerPegs.includes(playerPegs[j])) {
          let idx = answerPegs.indexOf(playerPegs[j]);
          numColPeg += 1;
          answerPegs.splice(idx, 1);
        }
      }
      result[2] = numColPeg;
    }
    // return the result of the pegs
    return result;
  }
}