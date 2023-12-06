const fs = require("node:fs");

const SPECIAL_CHARS_REGEX = new RegExp("[-’/`~!#*$@_%+=,^&(){}[]|;:”<>?\\]");

const readFileLines = (filename) =>
  fs.readFileSync(filename).toString("UTF8").split("\n");

const fileLines = readFileLines("./inputFile.txt");

function mapEngineParts(row = "", rowNumber) {
  const parts = row.split(/\D+/g).filter((value) => !!value);
  let cursorPosition = 0;

  return parts.map((part) => {
    const partIndex = row.indexOf(part, cursorPosition);
    cursorPosition = partIndex + part.length;

    const enginePart = { part, position: { x: partIndex, y: rowNumber } };

    const partAdjacent = lookForAdjacent(enginePart);

    return { ...enginePart, partAdjacent };
  });
}

function lookForAdjacent(enginePart) {
  const rowsCount = fileLines.length;
  const { y: rowNumber } = enginePart.position;

  const leftIndex = enginePart.position.x - 1;
  const rightIndex = enginePart.position.x + enginePart.part.length;
  const currentRow = fileLines[rowNumber];

  const aboveRow = rowNumber !== 0 ? fileLines[rowNumber - 1] : "";
  const underRow = rowNumber !== rowsCount - 1 ? fileLines[rowNumber + 1] : "";

  const aboveAdjacent = aboveRow.substring(leftIndex, rightIndex + 1);
  const currentRowAdjacent = [currentRow[leftIndex], currentRow[rightIndex]];
  const underAdjacent = underRow.substring(leftIndex, rightIndex + 1);

  const above = aboveAdjacent
    .split("")
    .filter((char) => char && char !== ".")
    .map((char) => {
      return {
        symbol: char,
        position: {
          y: rowNumber - 1,
          x:
            aboveRow.indexOf(aboveAdjacent, leftIndex) +
            aboveAdjacent.indexOf(char),
        },
      };
    });

  const current = currentRowAdjacent
    .map((char, internalIndex) => ({
      symbol: char,
      position: {
        y: rowNumber,
        x: internalIndex === 0 ? leftIndex : rightIndex,
      },
    }))
    .filter((adjacent) => adjacent.symbol && adjacent.symbol !== ".");

  const under = underAdjacent
    .split("")
    .filter((char) => char && char !== ".")
    .map((char) => {
      return {
        symbol: char,
        position: {
          y: rowNumber + 1,
          x:
            underRow.indexOf(underAdjacent, leftIndex) +
            underAdjacent.indexOf(char),
        },
      };
    });

  // console.log(enginePart.part, "A: ", above, "C: ", current, "U: ", under);

  const adjacentFromNumber = [...above, ...current, ...under];
  return adjacentFromNumber;
}

function part1() {
  let sum = 0;
  fileLines.forEach((row, currentIndex) => {
    const engineParts = mapEngineParts(row, currentIndex);
    engineParts.forEach((enginePart) => {
      const isNumber = !isNaN(Number(enginePart.part));
      const shouldSum = isNumber && !!enginePart.partAdjacent.length;
      if (shouldSum) {
        sum += Number(enginePart.part);
      }
    });
  });
  return sum;
}

function part2() {
  let sum = 0;
  const gearsCandidateMap = new Map("", { parts: [] });

  fileLines.forEach((row, currentIndex) => {
    const engineParts = mapEngineParts(row, currentIndex);
    const enginePartWithAdjacentAsterisk = engineParts.filter((part) => {
      return part.partAdjacent.some((adjacent) => {
        return adjacent.symbol === "*";
      });
    });
    enginePartWithAdjacentAsterisk.forEach((enginePart) => {
      enginePart.partAdjacent.forEach((adjacent) => {
        const partKey = `${adjacent.position.y}:${adjacent.position.x}`;
        const partMapValue = gearsCandidateMap.get(partKey);
        gearsCandidateMap.set(partKey, {
          ...partMapValue,
          symbol: adjacent.symbol,
          parts: partMapValue
            ? [...partMapValue?.parts, enginePart.part]
            : [enginePart.part],
        });
      });
    });
  });

  //remove undesired values
  gearsCandidateMap.forEach((gearCandidate, key) => {
    if (gearCandidate.parts.length <= 1) {
      gearsCandidateMap.delete(key);
    }
  });

  gearsCandidateMap.forEach((gearCandidate) => {
    let gearRatio = 1;

    gearCandidate.parts.forEach((part) => {
      gearRatio *= Number(part);
    });

    sum += gearRatio;
  });

  return sum;
}

console.log("part1: ", part1());
console.log("part2: ", part2());
