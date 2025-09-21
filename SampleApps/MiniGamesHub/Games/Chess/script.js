const boardElement = document.getElementById('chess-board');
const messageElement = document.getElementById('game-message');
const restartButton = document.getElementById('restart-button');

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8];

// Unicode characters for chess pieces
const pieces = {
    'wR': '&#9814;', 'wN': '&#9816;', 'wB': '&#9815;', 'wQ': '&#9813;', 'wK': '&#9812;', 'wP': '&#9817;',
    'bR': '&#9814;', 'bN': '&#9816;', 'bB': '&#9815;', 'bQ': '&#9813;', 'bK': '&#9812;', 'bP': '&#9817;'
};

// Simplified initial board setup (FEN string would be better for complex games)
// '0' represents empty square
let boardState = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

let turn = 'w'; // 'w' for white, 'b' for black
let selectedPiece = null;
let selectedSquare = null;

function createBoard() {
    boardElement.innerHTML = '';
    for (let r = RANKS.length - 1; r >= 0; r--) {
        for (let f = 0; f < FILES.length; f++) {
            const square = document.createElement('div');
            square.classList.add('square');
            const isLight = (r + f) % 2 === 0;
            square.classList.add(isLight ? 'light' : 'dark');
            square.dataset.rank = RANKS[r];
            square.dataset.file = FILES[f];
            square.dataset.index = `${FILES[f]}${RANKS[r]}`;

            const piece = boardState[8 - 1 - r][f];
            if (piece !== 0) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.classList.add(piece.startsWith('w') ? 'white' : 'black');
                pieceElement.innerHTML = pieces[piece];
                pieceElement.dataset.piece = piece;
                square.appendChild(pieceElement);
            }
            boardElement.appendChild(square);
        }
    }
    addEventListeners();
}

function addEventListeners() {
    const squares = boardElement.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', handleSquareClick);
    });
}

function handleSquareClick(event) {
    // If the click is on a piece itself, select the piece
    const clickedPieceElement = event.target.closest('.piece');
    if (clickedPieceElement) {
        const square = clickedPieceElement.parentElement;
        selectPiece(square);
        return;
    }

    // If the click is on an empty square or a piece, handle it
    const clickedSquare = event.target.closest('.square');
    if (!clickedSquare) return;

    if (selectedPiece) {
        // Attempt to move the selected piece
        const targetSquare = clickedSquare;
        const success = movePiece(selectedSquare, targetSquare);
        if (success) {
            clearHighlights();
            switchTurn();
        }
    } else {
        // If no piece is selected, try to select one on this square
        selectPiece(clickedSquare);
    }
}

function selectPiece(square) {
    clearHighlights();
    const pieceElement = square.querySelector('.piece');

    if (!pieceElement) {
        // Clicked an empty square, deselect if a piece was selected
        selectedPiece = null;
        selectedSquare = null;
        return;
    }

    const pieceType = pieceElement.dataset.piece;
    const pieceColor = pieceType.startsWith('w') ? 'white' : 'black';

    // Only allow selecting pieces of the current turn's color
    if (pieceColor !== (turn === 'w' ? 'white' : 'black')) {
        return;
    }

    selectedPiece = pieceElement;
    selectedSquare = square;
    square.classList.add('selected');

    // Show valid moves (simplified - no actual move logic yet)
    showValidMoves(square, pieceType);
}

function showValidMoves(square, pieceType) {
    // TODO: Implement actual chess move logic for each piece type
    // This is a placeholder that highlights all squares on the same rank/file/diagonal
    const targetSquares = boardElement.querySelectorAll('.square');
    targetSquares.forEach(targetSquare => {
        if (targetSquare !== square) {
            // Basic logic: If same rank, file, or diagonal, mark as potential move
            // Needs to account for piece type, obstructions, captures, etc.
            const sameRank = targetSquare.dataset.rank === square.dataset.rank;
            const sameFile = targetSquare.dataset.file === square.dataset.file;
            const sameDiagonal = Math.abs(RANKS.indexOf(parseInt(targetSquare.dataset.rank)) - RANKS.indexOf(parseInt(square.dataset.rank))) === Math.abs(FILES.indexOf(targetSquare.dataset.file) - FILES.indexOf(square.dataset.file));

            if (sameRank || sameFile || sameDiagonal) {
                 // Check for obstructions and if it's a capture
                if (isValidMoveForPiece(square.dataset.file, square.dataset.rank, targetSquare.dataset.file, targetSquare.dataset.rank, pieceType)) {
                   targetSquare.classList.add('valid-move');
                    // Check for capture
                   const targetPiece = targetSquare.querySelector('.piece');
                   if (targetPiece) {
                       targetSquare.classList.add('capture');
                   }
                }
            }
        }
    });
}

// Placeholder for actual move validation logic
function isValidMoveForPiece(fromFile, fromRank, toFile, toRank, pieceType) {
    // This function needs to implement the rules for each chess piece.
    // For simplicity, we'll just return true for any move to a different square
    // and assume it's valid for demonstration purposes.
    // Real implementation would check: piece movement rules, obstructions, captures, check, castling, en passant etc.
    if (fromFile === toFile && fromRank === toRank) return false;
    // Check if the target square has a piece of the same color
    const targetSquareElement = boardElement.querySelector(`.square[data-file='${toFile}'][data-rank='${toRank}']`);
    const targetPiece = targetSquareElement?.querySelector('.piece');
    if (targetPiece) {
        const targetColor = targetPiece.classList.contains('white') ? 'white' : 'black';
        const movingColor = pieceType.startsWith('w') ? 'white' : 'black';
        if (targetColor === movingColor) {
            return false; // Cannot capture own piece
        }
    }
    return true; // Simplified: assume valid
}

function movePiece(fromSquare, toSquare) {
    const fromFile = fromSquare.dataset.file;
    const fromRank = fromSquare.dataset.rank;
    const toFile = toSquare.dataset.file;
    const toRank = toSquare.dataset.rank;

    // Check if the move is valid (using the placeholder function)
    const piece = selectedPiece.dataset.piece;
    if (!isValidMoveForPiece(fromFile, fromRank, toFile, toRank, piece)) {
        messageElement.textContent = "Invalid move!";
        return false;
    }

    // Update board state array
    const fromRankIndex = RANKS.indexOf(parseInt(fromRank));
    const toRankIndex = RANKS.indexOf(parseInt(toRank));
    const fileIndex = FILES.indexOf(fromFile);
    const toFileIndex = FILES.indexOf(toFile);

    boardState[8 - 1 - toRankIndex][toFileIndex] = piece;
    boardState[8 - 1 - fromRankIndex][fileIndex] = 0;

    // Move the piece visually
    toSquare.innerHTML = ''; // Clear target square first
    toSquare.appendChild(selectedPiece);
    fromSquare.innerHTML = ''; // Clear origin square

    selectedPiece = null;
    selectedSquare = null;
    return true;
}

function clearHighlights() {
    const squares = boardElement.querySelectorAll('.square');
    squares.forEach(sq => {
        sq.classList.remove('selected', 'valid-move', 'capture');
    });
}

function switchTurn() {
    turn = turn === 'w' ? 'b' : 'w';
    messageElement.textContent = turn === 'w' ? 'White to move' : 'Black to move';
}

function restartGame() {
    boardState = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];
    turn = 'w';
    selectedPiece = null;
    selectedSquare = null;
    messageElement.textContent = 'White to move';
    createBoard();
}

restartButton.addEventListener('click', restartGame);

// Initial setup
createBoard();
