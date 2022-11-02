// Consider tiles sequentially numbered from 0 to 100. 
// You start at tile 0 and move forward based on the outcome of a six sided die. 
// Whenever you land on a tile you gain points based on the number of the tile. 
// If the tile is evenly divisble by 3, you get 2 points. 
// If the tile is evenly divisible by 5, you get 2 points. 
// However, if the tile is both evenly divisible by 3 and 5, then you get 4 points. 
// For all other tiles, you only get 1 point. 
// For example, you get 2 points for landing on tile 3 and 4 points for landing on tile 15. 
// You keep rolling the die and accumulating points until you either land on the last tile, numbered 100, or you move beyond the last tile. 
// For example, if you are currently at tile 95 and roll a 6, you move past 100 and the game ends. 
// Note, you only collect points from tile 100 if you land on it. 
// Please provide 6 digits of precision.
// What is the expected value and standard deviation of the final score?


const die : number = 20
const tiles : number = 2000
const points : number[] = Array(tiles); // The point value of the tiles
const expectedValue : number[] = Array(tiles + 1).fill(0); // The expected value of play starting from a specific tile
const probabilities : ProbabilityList[] = Array(tiles + 1); // The probabilities of different scores starting from a specific tile

// Probability class to store the possible score value, and the probability of acheiving that score
class Probability {
    value: number;
    probability: number;

    constructor(value: number, probability: number) {
        this.value = value;
        this.probability = probability;
    }

    equals(comp: Probability) {
        if (comp.value === this.value) {
            return true;
        } else {
            return false;
        }
    }

    combine(e: Probability) {
        this.probability = this.probability + e.probability;
    }
}

// ProbabilityList class to store a list of probabilities (i.e. a list of probabilities for a specific tile)
class ProbabilityList {
    list: Probability[];

    constructor() {
        this.list = [];
    }


    // Uses binary search to search the current list for a given probability value
    // Returns, an index number, whether the probability value was found, and
    // if it's not found, whether to insert the new probability at the current index or not
    search(e: Probability) : [number, boolean, boolean] {
        let start = 0, end = this.list.length - 1, mid = -1, higherIndex = true;

        while (start <= end) {
            mid = Math.floor((start + end)/2);

            if (this.list[mid].equals(e)) return [mid, true, higherIndex];
            else if (this.list[mid].value < e.value) {
                start = mid + 1;
                higherIndex = true;
            }
            else {
                end = mid - 1;
                higherIndex = false;
            }
        }

        return [mid, false, higherIndex];
    }

    insert(e: Probability) {
        if (this.list.length === 0) {
            this.list.push(e);
        } else {
            let index : number, found : boolean, higherIndex : boolean;
            [index, found, higherIndex] = this.search(e);

            if (found) {
                this.list[index].combine(e);
            } else {
                if (higherIndex) {
                    this.list.splice(index, 0, e);
                } else {
                    this.list.splice(index + 1, 0, e);
                }
            }
        }
    }
}

// Generate tile point value matrix
for (let i = 0; i < tiles; i++) {
    const tileNumber = i + 1;
    if (tileNumber % 3 === 0 && tileNumber % 5 === 0) {
        points[i] = 4;
    } else if (tileNumber % 3 === 0 || tileNumber % 5 === 0) {
        points[i] = 2;
    } else {
        points[i] = 1;
    }
}

// Starting from the end, generate the expected value starting at that tile
// and the list of probabilities starting from that tile.
for (let i = expectedValue.length - 1; i >= 0; i--) {
    if (i === tiles) {
        // Starting at the last tile, the expected value is a
        // guarantee 2.
        expectedValue[i] = 2;
        probabilities[i] = new ProbabilityList();
        const endProbability = new Probability(2, 1);
        probabilities[i].insert(endProbability);
    } else {
        // Set expected value and current tile's point value to 0 for the case
        // where the tile is the 0th tile, then set the expected and current tile value
        // accordingly in the other case. Since the piece is on a valid tile, the expected
        // value is guaranteed to have the point value fo the current tile.
        let ep = 0;
        let currentPoint = 0;
        if (i !== 0) {
            ep = points[i - 1];
            currentPoint = points[i - 1];
        }

        const probabilityList = new ProbabilityList();

        // Examining each of the cases when rolling the dice.
        // If the dice roll moves the piece to a valid tile, the expected value increases
        // by 1/6 * (the expected value of the tile the piece is moving to).
        // Then, a probability list is generated by multiplying each of the probabilities of 
        // the ending tile's probability list by 1/6. 
        for (let j = 1; j <= die; j++) {
            if (i + j <= tiles) {
                ep = ep + (1 / die) * expectedValue[i + j];
                for (const probability of probabilities[i + j].list) {
                    const newProbability = new Probability(currentPoint + probability.value, (1 / die) * probability.probability);
                    probabilityList.insert(newProbability);
                }
            } else {
                const newProbability = new Probability(currentPoint, 1/die);
                probabilityList.insert(newProbability);
            }
        }
        
        expectedValue[i] = ep;
        probabilities[i] = probabilityList;
    }

}

// Expected value of the game is the expected value from the first "tile"
const totalEV = expectedValue[0];
// Calculate variance, which is calculated by taking the potential scores from the first "tile"
// Calculating their deviance from the expected value, squaring it, and then multipling by its probability
// And adding the products.
const variance = probabilities[0].list.reduce((partialSum, p) => partialSum + (p.value - totalEV) ** 2 * p.probability, 0);
// Standard deviation is the square root of variance
const std = Math.sqrt(variance);

console.log(`Expected Value: ${totalEV}`);
console.log(`Standard Deviation: ${std}`);
// console.log(probabilities[0]);
