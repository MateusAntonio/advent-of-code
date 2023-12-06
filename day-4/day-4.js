const fs = require("node:fs");

const readFileLines = (filename) =>
  fs.readFileSync(filename).toString("UTF8").split("\n");

const fileLines = readFileLines("./inputFile.txt");

const NON_NUMBERS_REGEX = new RegExp(/\D+/g);

function calculatePoints(matchesCount) {
  if (matchesCount === 0) return 0;
  return Math.pow(2, matchesCount - 1);
}

function clearNumbers(numbers) {
  return numbers
    .split(NON_NUMBERS_REGEX)
    .filter((number) => number && !isNaN(Number(number)));
}

function parseCard(inlineCard) {
  const [cardKey, cardNumbers] = inlineCard.split(": ");
  const [winningNumbers, ownNumbers] = cardNumbers.split(" | ");

  return {
    cardId: cardKey.split(NON_NUMBERS_REGEX)[1],
    winningNumbers: clearNumbers(winningNumbers),
    ownNumbers: clearNumbers(ownNumbers),
  };
}

function getWinners(card) {
  return card.ownNumbers.filter((ownNumber) =>
    card.winningNumbers.includes(ownNumber)
  );
}

function storeCopies(cardCopiesMap, card, amount) {
  for (let i = 1; i <= amount; i++) {
    const cardKey = `Card: ${Number(card.cardId) + i}`;

    const copiesAmount = Number(cardCopiesMap.get(cardKey) ?? 0);
    cardCopiesMap.set(cardKey, copiesAmount + 1);
  }
}

function part1() {
  let points = 0;
  fileLines.forEach((inlineCard) => {
    const card = parseCard(inlineCard);
    const winnersNumbers = getWinners(card);
    const cardPoints = calculatePoints(winnersNumbers.length);
    points += cardPoints;
  });
  return points;
}
function part2() {
  let cardsCount = 0;
  const cardCopiesMap = new Map();
  fileLines.forEach((inlineCard) => {
    const card = parseCard(inlineCard);
    const winnersCount = getWinners(card).length;
    //Original

    const ORIGINAL = 1;
    storeCopies(cardCopiesMap, card, winnersCount);
    cardsCount += ORIGINAL;

    //Copies
    const currentCardCopies = cardCopiesMap.get(`Card: ${card.cardId}`);
    for (let i = 1; i <= currentCardCopies; i++) {
      storeCopies(cardCopiesMap, card, winnersCount);
    }
  });

  cardCopiesMap.forEach((value) => {
    cardsCount += value;
  });

  return cardsCount;
}

console.log("part1: ", part1());
console.log("part2: ", part2());
