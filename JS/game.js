const readline = require('readline');
const axios = require('axios');

// Genarate chessboard
function generateChessboard(rows, cols) {
    let chessboard = '      9  16 25 36 49 64 81\n';

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            chessboard += '□';
            chessboard += '  '
        }
        chessboard += '\n';
    }

    return chessboard;
}


// Generate Letter Library
const letterLibrary = {
    A: 14,
    B: 4,
    C: 7,
    D: 5,
    E: 19,
    F: 2,
    G: 4,
    H: 2,
    I: 11,
    J: 1,
    K: 1,
    L: 6,
    M: 5,
    N: 9,
    O: 8,
    P: 4,
    Q: 1,
    R: 10,
    S: 7,
    T: 9,
    U: 8,
    V: 2,
    W: 1,
    X: 1,
    Y: 1,
    Z: 2
};


// Read user's input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


// Initialise game
function assignRandomLetters() {
    const playerLetters = [];
    
    // Distuibute 6 letters to player
    for (let i = 0; i < 6; i++) {
        const allLetters = Object.keys(letterLibrary);
        if (allLetters.length === 0) {
            console.log("Letter Library is empty!");
            break;
        }

        const randomIndex = Math.floor(Math.random() * allLetters.length);
        const randomLetter = allLetters[randomIndex];
        playerLetters.push(randomLetter);

        // Update Lettre Library
        letterLibrary[randomLetter]--;
        if (letterLibrary[randomLetter] === 0) {
            delete letterLibrary[randomLetter];
        }
    }
    
    return playerLetters;
}


// Let user to enter a word
function promptUser() {
    rl.question(`Enter a word consisting of ${playerLetters.join(', ')} (length: 3-9 letters): `, (word) => {
        word = word.toLowerCase();  // Convert user input to lowercase
        const availableLetters = new Set(playerLetters.map(letter => letter.toLowerCase()));  // Convert user's letters to lowercase

        try {
            if (word.length < 3 || word.length > 9) {
                throw new Error('Invalid word length');
            }

            if (!word.split('').every(letter => availableLetters.has(letter))) {
                throw new Error('Invalid letter in the word');
            }

            axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
                .then(response => {
                    if (response.data) {
                        console.log(`"${word}" is a valid English word.`);
                        rl.close();
                    } else {
                        console.log('Invalid input, please re-enter.');
                        promptUser();
                    }
                })
                .catch(error => {
                    console.log('Invalid input, please re-enter.');
                    promptUser();
                });
        } catch (error) {
            console.log('Invalid input, please re-enter.');
            promptUser();
        }
    });
}


let playerLetters = assignRandomLetters();
console.log(generateChessboard(8,9));
console.log("Player's letters:", playerLetters);
promptUser();