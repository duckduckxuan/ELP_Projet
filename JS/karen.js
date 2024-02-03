const readline = require('readline');
const axios = require('axios');
const fs = require('fs').promises;

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
let dejajoue = {
    'Player 1': false,
    'Player 2': false
};

let playerWords = {
    'Player 1': [],
    'Player 2': []
};

let gameLog = [];
let previousPlayer = "";

function generateChessboard(rows, cols) {
    const chessboard = Array.from({ length: rows }, () => Array(cols).fill('□'));
    return chessboard;
}

let chessboardPlayer1 = generateChessboard(3, 9);
let chessboardPlayer2 = generateChessboard(3, 9);

const letterLibrary = {
    A: 14, B: 4, C: 7, D: 5, E: 19, F: 2, G: 4, H: 2, I: 11, J: 1, K: 1, L: 6, M: 5, N: 9, O: 8, P: 4, Q: 1, R: 10, S: 7, T: 9, U: 8, V: 2, W: 1, X: 1, Y: 1, Z: 2
};

function assignRandomLetters(player) {
    const allLetters = Object.entries(letterLibrary).flatMap(([letter, count]) => Array(count).fill(letter));
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
    const availableLetters = Object.entries(letterLibrary).flatMap(([letter, count]) => Array(count).fill(letter));

    // Vérifier si la bibliothèque de lettres est vide
    if (availableLetters.length === 0) {
        console.log("Letter Library is empty!");
        return;
    }

    // Sélectionner une lettre au hasard
    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    const randomLetter = availableLetters[randomIndex];

    // Ajouter la lettre à la liste du joueur spécifié
    playerLetters[player].push(randomLetter);

    // Mettre à jour la bibliothèque de lettres
    letterLibrary[randomLetter] = Math.max(0, letterLibrary[randomLetter] - 1);

    console.log("\x1b[32;1m%s\x1b[0m", `${player} received letter: ${randomLetter}`);
}

function updateChessboard(chessboard, word) {
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
        console.log("\x1b[31mInvalid word. Word must be between 3 and 9 characters.\x1b[0m");
        return false;
    }

    // Copier la liste des lettres du joueur
    const playerAvailableLetters = [...playerLetters[currentPlayer]];

    // Vérifier que le joueur a suffisamment d'occurrences de chaque lettre
    const playerLetterCounts = playerAvailableLetters.reduce((counts, letter) => {
        counts[letter] = (counts[letter] || 0) + 1;
        return counts;
    }, {});

    // Vérifier si le mot peut être formé avec les lettres du joueur actuel
    for (let i = 0; i < wordLength; i++) {
        const letter = word[i];

        if (playerLetterCounts[letter] > 0) {
            // La lettre est disponible dans la liste du joueur, décrémenter le nombre d'occurrences
            playerLetterCounts[letter]--;
        } else {
            console.log("\x1b[31mInvalid word. You don't have the necessary letters to form this word, specifically \"" + letter + "\".\x1b[0m");
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
    playerLetters[currentPlayer] = Object.entries(playerLetterCounts).flatMap(([letter, count]) => Array(count).fill(letter));

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
    console.log('      9  16 25 36 49 64 81');
    console.log(chessboard.map(row => row.join('  ')).join('\n'));
}

function switchPlayer() {
    currentPlayerIndex = 1 - currentPlayerIndex; // Toggle between 0 and 1
}

function isGameFinished(chessboard) {
    return !chessboard.some(row => row.every(cell => cell === '□'));
}

async function endGame() {
    const pointsPlayer1 = calculatePoints(chessboardPlayer1);
    const pointsPlayer2 = calculatePoints(chessboardPlayer2);

    console.log("\n------------------- GAME OVER ---------------------\n");
    gameLog.push(`-------------------- GAME OVER ---------------------`, "");
    console.log(`Final Chessboard of Player 1 : `);
    printChessboard(chessboardPlayer1, 'Player 1');
    console.log(`\n`);
    console.log(`Final Chessboard of Player 2 : `);
    printChessboard(chessboardPlayer2, 'Player 2');
    console.log(`\n`);
    console.log(`Points of Player 1 : ${pointsPlayer1}`);
    gameLog.push(`Points of Player 1 : ${pointsPlayer1}`);
    console.log(`Points of Player 2 : ${pointsPlayer2}`);
    gameLog.push(`Points of Player 2 : ${pointsPlayer2}`);
    console.log("╔" + "═".repeat(70) + "╗");
    console.log(`║ W I N N E R : ${pointsPlayer1 > pointsPlayer2 ? 'Player 1' : pointsPlayer1 < pointsPlayer2 ? 'Player 2' : 'Tie'}`);
    console.log("╚" + "═".repeat(70) + "╝");
    gameLog.push(`W I N N E R : ${pointsPlayer1 > pointsPlayer2 ? 'Player 1' : pointsPlayer1 < pointsPlayer2 ? 'Player 2' : 'Tie'}`);


    // Sauvegardez le journal de jeu dans un fichier texte
    try {
        await fs.writeFile('game_log.txt', gameLog.join('\n'));
        console.log('Game log saved to "game_log.txt"');
    } catch (error) {
        console.error('Error saving game log:', error);
    }

    rl.close();
}

playerLetters['Player 1'] = assignRandomLetters('Player 1');
playerLetters['Player 2'] = assignRandomLetters('Player 2'); 

function printPlayerWords(player) {
    console.log("\x1b[34m" + player + "'s words:\x1b[0m");
    playerWords[player].forEach((word, index) => {
        console.log(`  ${index + 1}. ${word}`);
    });    
}

function isValidTransformation(initialWord, newWord, currentPlayer, playerLetters) {
    const initialWordLetters = initialWord.split('');
    const newWordLetters = newWord.split('');

    let initialWordLetterCount = {};
    
    // Compter le nombre de chaque lettre dans le mot initial
    for (let letter of initialWordLetters) {
        initialWordLetterCount[letter] = (initialWordLetterCount[letter] || 0) + 1;
    }

    let availableLetters = [...playerLetters[currentPlayer]];

    for (let i = 0; i < newWord.length; i++) {
        const letter = newWordLetters[i];

        // Si la lettre provient du mot initial, décrémenter le compteur
        if (initialWordLetterCount[letter] > 0) {
            initialWordLetterCount[letter]--;
        } else {
            // Sinon, vérifier si le joueur a la lettre disponible
            const letterIndex = availableLetters.indexOf(letter);
            if (letterIndex === -1) {
                return false;
            } else {
                // Si la lettre est disponible, la retirer de la liste des lettres disponibles
                availableLetters.splice(letterIndex, 1);
            }
        }
    }
    return true;
}

function transformerMot(chessboard, monIndex, newWord) {
    const wordArray = newWord.split('');
    
    const lineLength = chessboard[monIndex].length;

    for (let i = 0; i < wordArray.length; i++) {
        chessboard[monIndex][i] = wordArray[i];
    }
    for (let i = wordArray.length; i < lineLength; i++) {
        chessboard[monIndex][i] = '□';
    }
    return chessboard;
}

function updateLettresDisponibles(currentPlayer, wordToTransform, newWord) {
    const lettersToRemove = newWord.split('').filter(letter => !wordToTransform.includes(letter));
    
    // Compte le nombre de chaque lettre dans les lettres à retirer
    const lettersCountToRemove = lettersToRemove.reduce((count, letter) => {
        count[letter] = (count[letter] || 0) + 1;
        return count;
    }, {});

    // Retire le nombre correct de chaque lettre des lettres disponibles
    playerLetters[currentPlayer] = playerLetters[currentPlayer].filter(letter => {
        if (lettersCountToRemove[letter] && lettersCountToRemove[letter] > 0) {
            lettersCountToRemove[letter]--;
            return false; // Retire cette occurrence de la lettre
        }
        return true; // Garde cette lettre
    });
}

let player1Turns = 0;
let player2Turns = 0;

function isValidNewWord(initialWord, newWord, availableLetters) {
    const initialLetterCount = countLetters(initialWord);
    const newLetterCount = countLetters(newWord);
    for (const letter in initialLetterCount) {
        if (!newLetterCount[letter] || newLetterCount[letter] < initialLetterCount[letter]) {
            return false;
        }
    }
    const addedLetters = newWord.split('').filter(letter => !initialWord.includes(letter) && availableLetters.includes(letter));
    return addedLetters.length > 0 && newWord.length<=9;
}

function countLetters(word) {
    const letterCount = {};
    for (const letter of word) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
    return letterCount;
}

function removeWordFromChessboard(chessboard, word) {
    const rowIndex = findRowIndexByWord(chessboard, word);   
    if (rowIndex !== -1) {
        const lineLength = chessboard[rowIndex].length;
        for (let i = 0; i < lineLength; i++) {
            chessboard[rowIndex][i] = '□';
        }
    } else {
        console.log("Word not found in chessboard:", word);
    }
    return chessboard;
}

function findRowIndexByWord(chessboard, word) {
    for (let i = 0; i < chessboard.length; i++) {
        const currentRow = chessboard[i];
        const currentWord = currentRow.join('').replace(/□/g, '');
        if (currentWord === word) {
            return i;
        }
    }
    return -1; // Word not found in any row
}

function modifier_data_adversaire(motenlever, otherPlayer){
    //Enlever le mot après un JARNAC
    const indexToRemove = playerWords[otherPlayer].indexOf(motenlever);
    if (indexToRemove !== -1) {
        playerWords[otherPlayer].splice(indexToRemove, 1);
    }
    if (otherPlayer == 'Player 1'){
        removeWordFromChessboard(chessboardPlayer1, motenlever);
    }else{
        removeWordFromChessboard(chessboardPlayer2, motenlever);
    }
}

function modifier_data_joueur(newWord, currentPlayer) {
    // Ajoute le newWord à la liste des mots du joueur actuel
    playerWords[currentPlayer].push(newWord);    
    if (currentPlayer == 'Player 1' ){
        updateChessboard(chessboardPlayer1, newWord);
    }else{
        updateChessboard(chessboardPlayer2, newWord);
    }
}

async function jarnac(currentPlayer, otherPlayer) {
    // Affiche la liste des mots de l'adversaire
    // Demande à l'utilisateur de choisir un mot parmi la liste
    
    let wordToJarnacIndex;
    console.log(`\n\x1b[34m Your opponent's letters are : \x1b[0m`);
    console.log("\x1b[34m╔" + "═".repeat(70) + "╗\x1b[0m");
    console.log("\x1b[34m║ " + playerLetters[otherPlayer].join('   ') + "\x1b[0m");
    console.log("\x1b[34m╚" + "═".repeat(70) + "╝\x1b[0m");

    console.log("\x1b[34mHere are the words of " + otherPlayer + ":\x1b[0m");
    printPlayerWords(otherPlayer);
    

    while (true) {
        const input = await new Promise((resolve) => {
            rl.question(`Choose the number of the word for which you want to play JARNAC : `, resolve);
        });

        const index = parseInt(input.trim()) - 1;

        if (!isNaN(index) && index >= 0 && index < playerWords[otherPlayer].length) {
            wordToJarnacIndex = index;
            break; // Sort de la boucle si la saisie est valide
        } else {
            console.log("\x1b[31mPlease enter a valid word number\x1b[0m");

        }
    }

    const wordToJarnac = playerWords[otherPlayer][wordToJarnacIndex];
    console.log(` The selected word is : ${wordToJarnac}`);

    const input = await new Promise((resolve) => {
        rl.question(`By which word do you want to change "${wordToJarnac}" ? : `, resolve);
    });

    newWord = input.trim().toUpperCase();

    if (isValidNewWord(wordToJarnac, newWord, playerLetters[otherPlayer])) {
        // ICI IL FUT VERIFIER SI C'est un mot possible du dictionnaire 
        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${newWord }`);
            if (response.data && response.data.length > 0) {
                console.log(`"${word}" is a valid English word.`);
                //MODIFIER TABLEAU ADVERSAIRE ET DANS SES MOTS 
                modifier_data_adversaire(wordToJarnac, otherPlayer);
                modifier_data_joueur(newWord, currentPlayer);
                //AJOUTER MOT DANS MON TABLEAU ET MES MOTS 
                console.log(`${currentPlayer} changed the word "${wordToJarnac}" to "${newWord}" with a JARNAC.`);
                gameLog.push(`${currentPlayer} changed the word "${wordToJarnac}" to "${newWord}" with a JARNAC.`, "")
            } else {
                console.log(`"${word}" is not a valid English word.`);
            }
        } catch (error) {
            console.log('Error checking English word validity.');
            console.log("JARNAC réfusé");
        }
        
    } else {
        console.log("\x1b[31mJARNAC refused\x1b[0m");
    }

}


async function playTurn() {
    const currentPlayer = players[currentPlayerIndex];
    const currentChessboard = currentPlayerIndex === 0 ? chessboardPlayer1 : chessboardPlayer2;

    if (currentPlayer !== previousPlayer) {
        console.log(`\n-----------------------------------------------`);
        console.log(`${currentPlayer}'s turn:\n`);
        gameLog.push(`-----------------${currentPlayer}'s turn: ------------------`, "")
    }
    printChessboard(currentChessboard, currentPlayer);

    console.log(`\n${currentPlayer}'s letters:`);
    console.log("╔" + "═".repeat(70) + "╗");
    console.log("║ " + playerLetters[currentPlayer].join('   '));
    console.log("╚" + "═".repeat(70) + "╝");

    const currentPlayerTurns = currentPlayer === 'Player 1' ? player1Turns : player2Turns;
    const adversaire = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';

    if (currentPlayerTurns > 0 && currentPlayer !== previousPlayer) {
        while (true) {
            debut = await new Promise((resolve) => {
                console.log(`What do you want to do, ${currentPlayer}?`);
                console.log("1. Draw a letter");
                console.log("2. Change 3 letters ");
        
                if (playerWords[adversaire].length == 0) {  
                    rl.question("Choose option (1 or 2):", (input) => {
                        resolve(input.trim());
                    });
                } else {
                    console.log("3. JARNAC");
                    rl.question("Choose option  (1,2 ou 3): ", (input) => {
                        resolve(input.trim());
                    });
                }
            });
    
            if (playerWords[adversaire].length == 0) {  
                if (["1", "2"].includes(debut)) {
                    break; // Sort de la boucle si l'action est valide
                } else {
                    console.log("\x1b[31mPlease enter a valid option (1 ou 2).\x1b[0m");
                }
            } else {
                if (["1", "2", "3"].includes(debut)) {
                    break; // Sort de la boucle si l'action est valide
                } else {
                    console.log("\x1b[31mPlease enter a valid option (1, 2 ou 3).\x1b[0m");
                }
            }
        }
    
        if (debut == '1'){
            giveRandomLetterToPlayer(currentPlayer);
            gameLog.push(`${currentPlayer} picked a letter `, "")
            console.log(`\n${currentPlayer}'s letters:`);
            console.log("╔" + "═".repeat(70) + "╗");
            console.log("║ " + playerLetters[currentPlayer].join('   '));
            console.log("╚" + "═".repeat(70) + "╝");
        }else if (debut == '2'){
            ///FONCITON QUI CHANGE TROIS LETTRES 
        }else{
            await jarnac(currentPlayer, adversaire);
            if (isGameFinished(chessboardPlayer1) || isGameFinished(chessboardPlayer2)) {
                endGame();
                return;
            }
        }
    }
    
    
    while (true) {
        action = await new Promise((resolve) => {
            console.log(`What do you want to do, ${currentPlayer}?`);
            console.log("1. Skip the turn");
            console.log("2. Add a word to the list");
    
            if (playerWords[currentPlayer].length == 0) {  
                rl.question("Choose the option  (1 ou 2): ", (input) => {
                    resolve(input.trim());
                });
            } else {
                console.log("3. Transformer un mot");
                rl.question("Choose the option  (1,2 ou 3): ", (input) => {
                    resolve(input.trim());
                });
            }
        });

        if (playerWords[currentPlayer].length == 0) {  

            if (["1", "2"].includes(action)) {
                break; // Sort de la boucle si l'action est valide
            } else {
                console.log("\x1b[31mPlease enter a valid option (1 ou 2).\x1b[0m");
            }

        } else {

            if (["1", "2", "3"].includes(action)) {
                break; // Sort de la boucle si l'action est valide
            } else {
                console.log("\x1b[31mPlease enter a valid option (1, 2 ou 3).\x1b[0m");
            }

        }

    }

    previousPlayer = currentPlayer;

    if (action === '1') {
        switchPlayer();
        if (currentPlayer === 'Player 1') {
            player1Turns++;
        } else {
            player2Turns++;
        }
        playTurn(); // Continuez le jeu même si le mot est 'PASS'
    } else if (action === '2'){

        const word = await new Promise((resolve) => {
            rl.question(`Enter the word you want to add to the list: `, (input) => {
                resolve(input.trim().toUpperCase());
            });
        });


        if (await isValidWord(word, currentPlayer)) {
            if (currentPlayer === 'Player 1') {
                giveRandomLetterToPlayer('Player 1');
                chessboardPlayer1 = updateChessboard(chessboardPlayer1, word);
            } else {
                giveRandomLetterToPlayer('Player 2');
                chessboardPlayer2 = updateChessboard(chessboardPlayer2, word);
            }
            playerWords[currentPlayer].push(word);
            gameLog.push(`${currentPlayer} added '${word}' in their chessboard.`);
            if (isGameFinished(chessboardPlayer1) || isGameFinished(chessboardPlayer2)) {
                endGame();
                return;
            }
            playTurn(); // Continuer le tour avec un mot valide
         } else {
            playTurn(); // Demander un nouveau mot car l'ancien était invalide
         }
        
    } else if (action === '3'){
        
         //Logique pour tranformer un mot
        console.log(`Which word do you want to transform? `);
        printPlayerWords(currentPlayer);
        let wordToTransformIndex;

        while (true) {
            const input = await new Promise((resolve) => {
                rl.question("Choose the number of the word to transform: ", resolve);
            });

            const index = parseInt(input.trim()) - 1;

            if (!isNaN(index) && index >= 0 && index < playerWords[currentPlayer].length) {
                wordToTransformIndex = index;
                break; // Sort de la boucle si la saisie est valide
            } else {
                console.log("\x1b[31mPlease enter a valid word number.\x1b[0m");
            }
        }
        const wordToTransform = playerWords[currentPlayer][wordToTransformIndex];
        console.log(`The selected word is: : ${wordToTransform}`);
        const newWord = await new Promise((resolve) => {
            rl.question(`Enter the transformation for the word: "${wordToTransform}": `, (input) => {
                resolve(input.trim().toUpperCase());
            });
        });
        if (isValidTransformation(wordToTransform, newWord, currentPlayer, playerLetters)) {
            // Mettre à jour la liste des mots du joueur
            playerWords[currentPlayer][wordToTransformIndex] = newWord;
            if (currentPlayer === 'Player 1') {
                chessboardPlayer1 = transformerMot(chessboardPlayer1, wordToTransformIndex, newWord);
            } else {
                chessboardPlayer2 = transformerMot(chessboardPlayer2, wordToTransformIndex, newWord);
            }
            //ENLEVER LES LETTRES QU'IL A UTILISE 
            updateLettresDisponibles(currentPlayer,wordToTransform, newWord);
            console.log(`${currentPlayer} transformed the word"${wordToTransform}" in "${newWord}".`);
            gameLog.push(`-------- ${currentPlayer} transformed the word "${wordToTransform}" in "${newWord}" --------`, "");
            playTurn();
        } else {
            console.log(`The transformation of the word "${wordToTransform}" in "${newWord}" is not valid`);
            playTurn();
        }        
    }    
}

playTurn();
