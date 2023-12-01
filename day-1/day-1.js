const fs = require("node:fs");

const readFileLines = (filename) =>
  fs.readFileSync(filename).toString("UTF8").split("\n");

const fileLines = readFileLines("./inputFile.txt");

const byLettersDigitsMap = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

function getLineDigits(line) {
  const chars = line.split("");
  const onlyDigits = chars.filter((char) => {
    if (isNaN(Number(char))) return false;
    return true;
  });
  if (onlyDigits.length === 0) return 0;

  if (onlyDigits.length === 1) {
    return Number(`${onlyDigits[0]}${onlyDigits[0]}`);
  }
  return Number(`${onlyDigits[0]}${onlyDigits[onlyDigits.length - 1]}`);
}

function transformLineToDigits(line = "") {
  let lineClone = line;
  const digitsMapKeys = Object.keys(byLettersDigitsMap);

  for (let charIndex = 2; charIndex < lineClone.length; charIndex++) {
    let str = lineClone.substring(0, charIndex + 1);
    digitsMapKeys.forEach((key) => {
      const occurrenceIndex = str.indexOf(key);
      if (occurrenceIndex !== -1) {
        lineClone =
          lineClone.substring(0, occurrenceIndex + 1) +
          byLettersDigitsMap[key] +
          lineClone.substring(occurrenceIndex - 1 + key.length);
      }
    });
  }
  return lineClone;
}

function part1() {
  let sum = 0;

  fileLines.forEach((line) => {
    const lineDigits = getLineDigits(line);
    sum += lineDigits;
  });

  return sum;
}

function part2() {
  let sum = 0;

  fileLines.forEach((line) => {
    const transformedLine = transformLineToDigits(line);
    const lineDigits = getLineDigits(transformedLine);
    sum += lineDigits;
  });

  return sum;
}

console.log("part1: ", part1());
console.log("part2: ", part2());
