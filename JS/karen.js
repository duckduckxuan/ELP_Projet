const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const players = ['Player 1', 'Player 2'];
let currentPlayerIndex = Math.floor(Math.random() * 2);
let playerLetters = {
    'Player 1': [],
    'Player 2': []
};
let lettersPicked = {
    'Player 1': false,
    'Player 2': false
};
let playerRounds = {
    'Player 1': 1,
    'Player 2': 1
};
let hasExchangedLetters = {
    'Player 1': false,
    'Player 2': false
};

function generateChessboard(rows, cols) {
    const chessboard = Array.from({ length: rows }, () => Array(cols).fill('□'));
    return chessboard;
}

const letterLibrary = {
    A: 14, B: 4, C: 7, D: 5, E: 19, F: 2, G: 4, H: 2, I: 11, J: 1, K: 1, L: 6, M: 5, N: 9, O: 8, P: 4, Q: 1, R: 10, S: 7, T: 9, U: 8, V: 2, W: 1, X: 1, Y: 1, Z: 2
};

function assignRandomLetters(player) {
    const allLetters = Object.keys(letterLibrary);
    const letters = [];

    for (let i = 0; i < 6; i++) {
        if (allLetters.length === 0) {
            console.log("Letter Library is empty!");
            break;
        }

        const randomIndex = Math.floor(Math.random() * allLetters.length);
        const randomLetter = allLetters[randomIndex];
        letters.push(randomLetter);

        allLetters.splice(randomIndex, 1);
    }

    playerLetters[player] = letters;
    return letters;
}

function giveRandomLetterToPlayer(player) {
    const allLetters = Object.keys(letterLibrary);

    // Vérifier si la bibliothèque de lettres est vide
    if (allLetters.length === 0) {
        console.log("Letter Library is empty!");
        return;
    }

    // Sélectionner une lettre au hasard
    const randomIndex = Math.floor(Math.random() * allLetters.length);
    const randomLetter = allLetters[randomIndex];

    // Ajouter la lettre à la liste du joueur spécifié
    playerLetters[player].push(randomLetter);

    // Mettre à jour la bibliothèque de lettres
    if (letterLibrary[randomLetter] > 1) {
        letterLibrary[randomLetter]--;
    } else {
        delete letterLibrary[randomLetter];
    }

    console.log(`${player} received letter: ${randomLetter}`);
}


function updateLetterLibrary(letters) {
    letters.forEach(letter => {
        if (letterLibrary[letter] !== undefined && letterLibrary[letter] > 0) {
            letterLibrary[letter]--;
        } else {
            console.log(`Cannot update letter library. Letter ${letter} not available.`);
        }
    });
}

function updateChessboard(chessboard, word, currentPlayer) {
    const emptyRowIndex = findEmptyRowIndex(chessboard);
    if (emptyRowIndex !== -1) {
        const wordArray = word.split('');
        const lineLength = chessboard[emptyRowIndex].length;

        if (wordArray.length <= lineLength) {
            for (let i = 0; i < wordArray.length; i++) {
                chessboard[emptyRowIndex][i] = wordArray[i];
            }
            for (let i = wordArray.length; i < lineLength; i++) {
                chessboard[emptyRowIndex][i] = '□';
            }
        } else {
            chessboard[emptyRowIndex] = wordArray.slice(0, lineLength);
        }

    } else {
        console.log("No empty row available. Cannot add word:", word);
    }
    return chessboard;
}

function findEmptyRowIndex(chessboard) {
    for (let i = 0; i < chessboard.length; i++) {
        if (chessboard[i].every(cell => cell === '□')) {
            return i;
        }
    }
    return -1; // No empty row found
}

async function isValidWord(word, currentPlayer) {
    const wordLength = word.length;

    // Vérifier la longueur du mot
    if (wordLength < 3 || wordLength > 9) {
        console.log("Invalid word. Word must be between 3 and 9 characters.");
        return false;
    }

    // Copier la liste des lettres du joueur
    const playerAvailableLetters = [...playerLetters[currentPlayer]];

    // Vérifier si le mot peut être formé avec les lettres du joueur actuel
    for (let i = 0; i < wordLength; i++) {
        const letter = word[i];
        const index = playerAvailableLetters.indexOf(letter);

        if (index !== -1) {
            // La lettre est disponible dans la liste du joueur, retirer cette occurrence
            playerAvailableLetters.splice(index, 1);
        } else {
            console.log("Invalid word. Tu n'as pas les lettres nécessaires pour former ce mot.");
            return false; // La lettre n'est pas disponible dans les lettres du joueur
        }
    }

    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (response.data && response.data.length > 0) {
            console.log(`"${word}" is a valid English word.`);
        } else {
            console.log(`"${word}" is not a valid English word.`);
            return false;
        }
    } catch (error) {
        console.log('Error checking English word validity.');
        return false;
    }

    // Mettre à jour la liste des lettres du joueur avec la copie modifiée
    playerLetters[currentPlayer] = playerAvailableLetters;

    return true;
}


function calculatePoints(chessboard) {
    let points = 0;

    for (let i = 0; i < chessboard.length; i++) {
        const wordLength = chessboard[i].join('').replace(/□/g, '').length;
        points += Math.pow(wordLength, 2);
    }

    return points;
}

function printChessboard(chessboard, currentPlayer) {
    console.log(`${currentPlayer}'s turn:`);
    console.log('      9  16 25 36 49 64 81\n');
    console.log(chessboard.map(row => row.join('  ')).join('\n'));
}

function switchPlayer() {
    currentPlayerIndex = 1 - currentPlayerIndex; // Toggle between 0 and 1
}

function isGameFinished(chessboard) {
    return !chessboard.some(row => row.every(cell => cell === '□'));
}

function endGame() {
    const pointsPlayer1 = calculatePoints(chessboardPlayer1);
    const pointsPlayer2 = calculatePoints(chessboardPlayer2);

    console.log(`Game over!`);
    console.log(`Player 1's points: ${pointsPlayer1}`);
    console.log(`Player 2's points: ${pointsPlayer2}`);
    console.log(`Winner: ${pointsPlayer1 > pointsPlayer2 ? 'Player 1' : 'Player 2'}`);
    rl.close();
}

let chessboardPlayer1 = generateChessboard(8, 9);
let chessboardPlayer2 = generateChessboard(8, 9);
playerLetters['Player 1'] = assignRandomLetters('Player 1');
playerLetters['Player 2'] = assignRandomLetters('Player 2'); 

async function playTurn() {
    const currentPlayer = players[currentPlayerIndex];
    const currentChessboard = currentPlayerIndex === 0 ? chessboardPlayer1 : chessboardPlayer2;

    printChessboard(currentChessboard, currentPlayer);
    console.log(`${currentPlayer}'s letters: ${playerLetters[currentPlayer].join(', ')}`);

    if (isGameFinished(chessboardPlayer1) || isGameFinished(chessboardPlayer2)) {
        endGame();
        return;
    }

    // Ask player to change letters or not
    const exchangeChoice = await new Promise((resolve) => {
        rl.question(`Do you want to exchange letters? (yes/no): `, (input) => {
            resolve(input.trim().toLowerCase());
        });
    });

    if (exchangeChoice === 'yes') {
        if (playerRounds[currentPlayer] > 1 && !hasExchangedLetters[currentPlayer]) {

            // Ask player to exchange 3 letters or draw 1 letter
            const exchangeType = await new Promise((resolve) => {
                rl.question(`Do you want to exchange three letters or draw one letter? (three/draw): `, (input) => {
                    resolve(input.trim().toLowerCase());
                });
            });

            if (exchangeType === 'three') {
                // Ask which 3 letters to exchange
                const lettersToExchange = await new Promise((resolve) => {
                    rl.question(`Enter the three letters you want to exchange (e.g., ABC): `, (input) => {
                        resolve(input.trim().toUpperCase().split(''));
                    });
                });

                // Put letters back to library and give 3 new letters
                updateLetterLibrary(lettersToExchange);
                playerLetters[currentPlayer] = assignRandomLetters(currentPlayer);
                console.log(`${currentPlayer}'s letters: ${playerLetters[currentPlayer].join(', ')}`);
            } else if (exchangeType === 'draw') {
                // Give 1 letter to player
                giveRandomLetterToPlayer(currentPlayer);
            }

            hasExchangedLetters[currentPlayer] = true;
        }
    }
    playerRounds[currentPlayer]++;

    while (true) {
        const word = await new Promise((resolve) => {
            rl.question(`Enter word or type 'pass' to switch player: `, (input) => {
                resolve(input.trim().toUpperCase());
            });
        });

        if (word === 'PASS') {
            switchPlayer();
            hasExchangedLetters['Player 1'] = false;
            hasExchangedLetters['Player 2'] = false;
            break;
        } else {
            // Utiliser await pour attendre la résolution de la fonction isValidWord
            if (await isValidWord(word, currentPlayer)) {
                if (currentPlayer === 'Player 1') {
                    giveRandomLetterToPlayer('Player 1');
                    chessboardPlayer1 = updateChessboard(chessboardPlayer1, word, 'Player 1');
                } else {
                    giveRandomLetterToPlayer('Player 2');
                    chessboardPlayer2 = updateChessboard(chessboardPlayer2, word, 'Player 2');
                }
                break;
            } else {
                // Pause de 2 secondes avant de continuer
                console.log("Invalid word. Please try again.");
            }
        }
    }

    playTurn();
}

playTurn();
