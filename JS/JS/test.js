// Define nb row and col
const rows = 8;
const cols = 9;

// Genarate chessboard
function generateChessboard() {
    let chessboard = '';

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            chessboard += '□';
            chessboard += '  '
        }
        chessboard += '\n';
    }

    return chessboard;
}

// Print chessboard on console
console.log(generateChessboard());
