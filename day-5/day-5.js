const fs = require("node:fs");

const readFile = (filename) => fs.readFileSync(filename).toString("UTF8");

const file = readFile("./inputFile.txt");

function isInRange(number, { source, rangeLength }) {
  return number >= source && number <= source + rangeLength;
}

function convertNumber(
  inputNumber = 0,
  conversionMaps = [{ source, destination, rangeLength }]
) {
  let output = inputNumber;
  for (let i = 0; i < conversionMaps.length; i++) {
    const conversionMap = conversionMaps[i];
    if (isInRange(inputNumber, conversionMap)) {
      output = inputNumber + (conversionMap.destination - conversionMap.source);
      break;
    }
  }
  return output;
}

function getSeeds() {
  const startingIndex = file.indexOf("seeds");
  const finalIndex = file.indexOf(`seed-to-soil`) - 2;
  const [, seeds] = file.substring(startingIndex, finalIndex).split(": ");
  const seedsAsNumbers = seeds.split(/\D+/).map((seed) => Number(seed));
  return seedsAsNumbers;
}

function getMapNames() {
  const results = file.matchAll(/(.*map)/g);
  let mapNames = [];
  for (map of results) {
    const [name] = map[0].split(" ");
    mapNames.push(name);
  }
  return mapNames;
}

function getMaps() {
  const mapNames = getMapNames();
  return mapNames.reduce((accumulatorObj, mapName, index) => {
    const startingIndex = file.indexOf(mapName);

    const nextMapName = mapNames[index + 1] ?? "";
    const nextMapIndexOnFile = file.indexOf(nextMapName);

    const isLastElement = index === mapNames.length - 1;
    const fileLastIndex = file.length;

    const endingIndex = isLastElement ? fileLastIndex : nextMapIndexOnFile;

    const [, ...valueLines] = file
      .substring(startingIndex, endingIndex)
      .split("\n")
      .filter((value) => !!value);

    const parsedLines = valueLines.map((valueLine) => parseMap(valueLine));
    return { ...accumulatorObj, [mapName]: parsedLines };
  }, {});
}

function parseMap(valueLine = "") {
  const [destination, source, rangeLength] = valueLine.split(/\D+/);
  return {
    destination: Number(destination),
    source: Number(source),
    rangeLength: Number(rangeLength),
  };
}

function part1() {
  const seeds = getSeeds();
  const maps = getMaps();

  const mappedSeeds = seeds.map((seed) => {
    let result = seed;
    Object.keys(maps).forEach((mapKey) => {
      result = convertNumber(result, maps[mapKey]);
    });

    return {
      seed,
      result,
    };
  });
  const lowestLocation = mappedSeeds.reduce((accumulator, currentResult) => {
    accumulator =
      currentResult.result < accumulator ? currentResult.result : accumulator;
    return accumulator;
  }, mappedSeeds[0].result);
  return lowestLocation;
}
console.log("part1", part1());
