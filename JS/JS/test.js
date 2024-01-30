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

// example: print letter library
for (const letter in letterLibrary) {
    console.log(`${letter}: ${letterLibrary[letter]}`);
}


// Print chessboard on console
console.log(generateChessboard(8,9));
