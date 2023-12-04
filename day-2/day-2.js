const fs = require("node:fs");

const RED_MAX = 12;
const GREEN_MAX = 13;
const BLUE_MAX = 14;

const readFileLines = (filename) =>
  fs.readFileSync(filename).toString("UTF8").split("\n");

const fileLines = readFileLines("./inputFile.txt");

function parseGameSets(gameSets = []) {
  return gameSets.map((set) => {
    const subsets = set.split(", ");
    const setMap = {
      red: 0,
      green: 0,
      blue: 0,
    };

    subsets.forEach((subset) => {
      const [amount, color] = subset.split(" ");
      setMap[color] = Number(amount);
    });

    return setMap;
  });
}

function parseGameLine(line = "") {
  const [gameName, gameSettings] = line.split(": ");
  const [, gameId] = gameName.split(" ");
  const gameSets = gameSettings.split("; ");
  const parsedSets = parseGameSets(gameSets);
  return {
    id: Number(gameId),
    sets: parsedSets,
  };
}

function isValidGame(game = {}) {
  const hasSomeInvalidValue = game.sets.some((set) => {
    return set.red > RED_MAX || set.green > GREEN_MAX || set.blue > BLUE_MAX;
  });
  return !hasSomeInvalidValue;
}

function getMinimumRequiredCubesForGame(game) {
  const minimumRequired = {
    red: 0,
    green: 0,
    blue: 0,
  };
  const colors = Object.keys(minimumRequired);
  game.sets.forEach((set) => {
    colors.forEach((color) => {
      if (set[color] > minimumRequired[color]) {
        minimumRequired[color] = set[color];
      }
    });
  });

  return minimumRequired;
}

function calculateGamePower(game) {
  let gamePower = 1;
  const colors = Object.keys(game.minimumRequired);
  colors.forEach((color) => {
    gamePower *= game.minimumRequired[color];
  });
  return gamePower;
}

function part1() {
  let idsSum = 0;
  fileLines.forEach((line) => {
    const game = parseGameLine(line);
    const isGameValid = isValidGame(game);
    idsSum += isGameValid ? game.id : 0;
  });
  return idsSum;
}

function part2() {
  let gamePowerSum = 0;
  fileLines.forEach((line) => {
    const game = parseGameLine(line);
    game.minimumRequired = getMinimumRequiredCubesForGame(game);
    const gamePower = calculateGamePower(game);
    gamePowerSum += gamePower;
  });
  return gamePowerSum;
}

console.log("part1: ", part1());
console.log("part2: ", part2());
