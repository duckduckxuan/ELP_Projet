const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const players = ['Player 1', 'Player 2'];
let currentPlayerIndex = 0;
let playerLetters = {
    'Player 1': [],
    'Player 2': []
};
let lettersPicked = {
    'Player 1': false,
    'Player 2': false
};

function generateChessboard(rows, cols) {
    const chessboard = Array.from({ length: rows }, () => Array(cols).fill('□'));
    console.log('      9  16 25 36 49 64 81\n');
    console.log(chessboard.map(row => row.join('  ')).join('\n'));
    return chessboard;
}

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

        // Retirer une lettre du paquet du joueur après avoir joué un mot
        playerLetters[currentPlayer].shift();
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

function isValidWord(word) {
    const wordLength = word.length;
    return wordLength >= 3 && wordLength <= 9;
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
playerLetters['Player 2'] = assignRandomLetters('Player 2');  // Ajout de cette ligne

function playTurn() {
    const currentPlayer = players[currentPlayerIndex];
    const currentChessboard = currentPlayerIndex === 0 ? chessboardPlayer1 : chessboardPlayer2;

    printChessboard(currentChessboard, currentPlayer);
    console.log(`${currentPlayer}'s letters: ${playerLetters[currentPlayer].join(', ')}`);

    if (isGameFinished(chessboardPlayer1) || isGameFinished(chessboardPlayer2)) {
        endGame();
        return;
    }

    // Piocher les lettres initiales uniquement la première fois pour chaque joueur
    if (!lettersPicked[currentPlayer]) {
        playerLetters[currentPlayer] = assignRandomLetters(currentPlayer);
        lettersPicked[currentPlayer] = true;
    }

    rl.question(`Enter word or type 'pass' to switch player: `, (input) => {
        const word = input.trim().toUpperCase();
    
        if (word === 'PASS') {
            switchPlayer();
            playTurn(); // Continuez le jeu même si le mot est 'PASS'
        } else {
            if (isValidWord(word)) {
                if (currentPlayer === 'Player 1') {
                    chessboardPlayer1 = updateChessboard(chessboardPlayer1, word, 'Player 1');
                } else {
                    chessboardPlayer2 = updateChessboard(chessboardPlayer2, word, 'Player 2');
                }
    
                playTurn(); // Continuer le tour avec un mot valide
            } else {
                console.log("Invalid word. Word must be between 3 and 9 characters.");
                // Pause de 2 secondes avant de continuer
                setTimeout(() => {
                    playTurn(); // Demander un nouveau mot car l'ancien était invalide
                }, 2000);
            }
        }
    });
}

playTurn();
