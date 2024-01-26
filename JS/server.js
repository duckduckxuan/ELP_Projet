const express = require('express');
const app = express();
const port = 3000;
const path = require('path');


let gameState = {
    players: [{ name: 'Player1', letters: [] }, { name: 'Player2', letters: [] }],
    currentPlayerIndex: 0,
    bagOfLetters: generateBagOfLetters(),
};

function generateBagOfLetters() {
    // 简化为每个字母一次
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
}

function drawLetters(num) {
    let letters = [];
    for (let i = 0; i < num && gameState.bagOfLetters.length > 0; i++) {
        let randomIndex = Math.floor(Math.random() * gameState.bagOfLetters.length);
        letters.push(gameState.bagOfLetters.splice(randomIndex, 1)[0]);
    }
    return letters;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/start', (req, res) => {
    gameState.players.forEach(player => {
        player.letters = drawLetters(6);
    });
    res.json(gameState);
});

app.get('/turn', (req, res) => {
    let currentPlayer = gameState.players[gameState.currentPlayerIndex];
    currentPlayer.letters = currentPlayer.letters.concat(drawLetters(1));
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    res.json({ currentPlayer, gameState });
});

app.listen(port, () => {
    console.log(`Jarnac game server listening at http://localhost:${port}`);
});
