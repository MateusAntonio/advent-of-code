const fs = require("node:fs");

const readFile = (filename: string): string =>
  fs.readFileSync(filename).toString("UTF8");

const file = readFile("./inputFile.txt");

type Seed = number;

interface ConversionMap {
  source: number;
  destination: number;
  rangeLength: number;
}

type MapLines = ConversionMap[][];

interface SeedRange {
  from: number;
  to: number;
}

function isSeedInMapRange(
  number: number,
  { source, rangeLength }: ConversionMap
) {
  return number >= source && number <= source + rangeLength;
}

function convertNumber(inputNumber: number, allMaps: ConversionMap[][]) {
  let carry = inputNumber;
  allMaps.forEach((map) => {
    for (let i = 0; i < map.length; i++) {
      const conversionMap = map[i];
      if (isSeedInMapRange(carry, conversionMap)) {
        carry = carry + (conversionMap.destination - conversionMap.source);
        break;
      }
    }
  });
  return carry;
}

function getSeeds() {
  const startingIndex = file.indexOf("seeds");
  const finalIndex = file.indexOf(`seed-to-soil`) - 2;
  const [, seeds] = file.substring(startingIndex, finalIndex).split(": ");
  const seedsAsNumbers = seeds.split(/\D+/).map((seed) => Number(seed));
  return seedsAsNumbers;
}

function getSeedsRanges() {
  const startingIndex = file.indexOf("seeds");
  const finalIndex = file.indexOf(`seed-to-soil`) - 2;
  const [, seeds] = file.substring(startingIndex, finalIndex).split(": ");
  const seedsAsNumbers = seeds.split(/\D+/).map((seed) => Number(seed));
  const seedRanges: SeedRange[] = [];
  for (let index = 0; index < seedsAsNumbers.length; index = index + 2) {
    seedRanges.push({
      from: seedsAsNumbers[index],
      to: seedsAsNumbers[index] + seedsAsNumbers[index + 1] - 1, //inclusive
    });
  }
  return seedRanges;
}

function getMaps() {
  const [_, ...mapsLines] = file.split("\n\n");
  return mapsLines.map((mapLines) => {
    const [_, ...mapRows] = mapLines.split(":")[1].split("\n");
    return mapRows.map((row) => parseMap(row));
  });
}

function parseMap(valueLine = ""): ConversionMap {
  const [destination, source, rangeLength] = valueLine.split(/\D+/);
  return {
    destination: Number(destination),
    source: Number(source),
    rangeLength: Number(rangeLength),
  };
}

function getLowestSeedLocation(seeds: Seed[], maps: MapLines) {
  const mappedSeeds = seeds.map((seed) => {
    return { seed, result: convertNumber(seed, maps) };
  });

  const lowestLocation = mappedSeeds.reduce((accumulator, currentResult) => {
    accumulator =
      currentResult.result < accumulator ? currentResult.result : accumulator;
    return accumulator;
  }, mappedSeeds[0].result);
  return lowestLocation;
}

interface SeedsBucket extends SeedRange {
  alreadyMapped: boolean;
}

function splitSeedRanges(seedsRanges: Array<SeedRange>, mapBlocks: MapLines) {
  let currentSeedRanges = [...seedsRanges];

  mapBlocks.forEach((mapBlock, mapIndex) => {
    let alreadyMapped: SeedRange[] = [];

    while (currentSeedRanges.length) {
      const seedRange = currentSeedRanges.shift();
      if (!seedRange) return;
      let didSeedMatch = false;

      for (let mapIndex = 0; mapIndex < mapBlock.length; mapIndex++) {
        const map = mapBlock[mapIndex];
        const mapLast = map.source + map.rangeLength - 1; //inclusive

        const intersectionStart = Math.max(seedRange.from, map.source); //inclusive
        const intersectionEnd = Math.min(seedRange.to, mapLast); //inclusive

        if (intersectionStart <= intersectionEnd) {
          didSeedMatch = true;
          const mapOffset = -map.source + map.destination;
          const mappedRange: SeedRange = {
            from: intersectionStart + mapOffset,
            to: intersectionEnd + mapOffset,
          };

          alreadyMapped.push(mappedRange);
          if (seedRange.from < intersectionStart) {
            const newRange: SeedRange = {
              from: seedRange.from,
              to: intersectionStart - 1,
            };
            currentSeedRanges.push(newRange);
          }
          if (seedRange.to > intersectionEnd) {
            const newRange: SeedRange = {
              from: intersectionEnd + 1,
              to: seedRange.to,
            };
            currentSeedRanges.push(newRange);
          }
          break;
        }
      }
      // If didn't match with any map, so it means it's already mapped
      if (!didSeedMatch) alreadyMapped.push(seedRange);
    }

    currentSeedRanges = alreadyMapped;
  });
  return currentSeedRanges;
}

function part1() {
  const seeds = getSeeds();
  const maps = getMaps();
  return getLowestSeedLocation(seeds, maps);
}

function part2() {
  const seedsRanges = getSeedsRanges();
  const maps = getMaps();
  const splittedSeedsRanges = splitSeedRanges(seedsRanges, maps);

  const lowestLocation = splittedSeedsRanges.reduce(
    (accumulator, currentRange) => {
      if (currentRange.from < accumulator) {
        accumulator = currentRange.from;
      }
      return accumulator;
    },
    Number.POSITIVE_INFINITY
  );
  return lowestLocation;
}

console.log("part1:", part1());
console.log("part2:", part2());
