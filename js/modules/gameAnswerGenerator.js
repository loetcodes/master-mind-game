// ANSWER GENERATOR USED TO CREATE RANDOM VALUE GIVEN A SIZE AND RANGE

export class AnswerGenerator {
  constructor(answerSize) {
    this.answerLength = answerSize;
    this.baseAnswerArr = [];
    this.givenHints = [];
  }

  generateRandomNumbers(arrLength) {
    // Function that creates an array of given size containing random numbers.
    let numbers = [];
    let newNum;
    for (let i = 0; i < arrLength; i++) {
      newNum = Math.floor(Math.random() * (10 - 3));
      numbers.push(newNum);
    }
    return numbers;
  }

  generateRandomColors(baseArray) {
    // Function that generates color answers factoring in the answers from previous random values.
    let result = [];
    let newSeq = this.generateRandomNumbers(baseArray.length);
    if (baseArray) {
      let newNum;
      for (let num of baseArray) {
        newNum = num + newSeq.shift();
        if (newNum > 8) {
          newNum -= 7;
        } else if (newNum <= 0) {
          newNum += 8; // Remember to change to random number below 7;
        }
        result.push(newNum);
      }
    }
    return result;
  }

  newGameAnswers(baseArray, arrLength) {
    // Function that generates new game answers utilizing old game answers if they exist.
    let newSequence, baseArr;
    baseArr = baseArray;
    if (baseArr == false) {
      baseArr = new Array(arrLength).fill(0);
    }
    newSequence = this.generateRandomColors(baseArr);
    return newSequence;
  }
}
