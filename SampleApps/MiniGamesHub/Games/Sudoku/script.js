const boardElement = document.getElementById('sudoku-board');
const messageElement = document.getElementById('game-message');
const generateButton = document.getElementById('generate-button');
const solveButton = document.getElementById('solve-button');
const hintButton = document.getElementById('hint-button');
const numberPadButtons = document.querySelectorAll('.number-pad button');

const SIZE = 9;
const BOX_SIZE = 3;

let board = []; // The current state of the Sudoku board
let solution = []; // The solved version of the board
let selectedCell = null;

// Initialize board with empty cells
function initializeBoard() {
    board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    solution = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
}

// Create the visual representation of the board
function createBoardUI() {
    boardElement.innerHTML = ''; // Clear previous board
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Add thick borders for 3x3 subgrids
            if (c % BOX_SIZE === BOX_SIZE - 1 && c !== SIZE - 1) {
                cell.style.borderRight = '2px solid #ecf0f1';
            }
            if (r % BOX_SIZE === BOX_SIZE - 1 && r !== SIZE - 1) {
                cell.style.borderBottom = '2px solid #ecf0f1';
            }

            const value = board[r][c];
            if (value !== 0) {
                cell.textContent = value;
                cell.classList.add('prefilled');
            }

            cell.addEventListener('click', () => selectCell(cell));
            boardElement.appendChild(cell);
        }
    }
}

// Select a cell to input a number
function selectCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    if (cell.classList.contains('prefilled')) {
        selectedCell = null;
        return;
    }
    selectedCell = cell;
    cell.classList.add('selected');
}

// Handle number input from the keypad
function handleNumberInput(num) {
    if (!selectedCell) {
        messageElement.textContent = 'Please select a cell first.';
        return;
    }

    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);

    if (num === 0) { // Clear button
        board[row][col] = 0;
        selectedCell.textContent = '';
    } else {
        // Basic validation: Check if number is valid for the row, col, and box
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            selectedCell.textContent = num;
            // Optionally check if the move completed the puzzle
            if (isBoardFull(board) && checkSolution(board)) {
                messageElement.textContent = 'Congratulations! You solved it!';
            }
        } else {
            messageElement.textContent = 'Invalid number for this cell!';
            // Optionally provide visual feedback for invalid input (e.g., temporary red flash)
            selectedCell.classList.add('invalid');
            setTimeout(() => {
                selectedCell.classList.remove('invalid');
            }, 500);
        }
    }
}

// Check if a number is valid in the given position
function isValid(currentBoard, row, col, num) {
    // Check row
    for (let c = 0; c < SIZE; c++) {
        if (currentBoard[row][c] === num && col !== c) {
            return false;
        }
    }

    // Check column
    for (let r = 0; r < SIZE; r++) {
        if (currentBoard[r][col] === num && row !== r) {
            return false;
        }
    }

    // Check 3x3 box
    const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
            if (currentBoard[r + startRow][c + startCol] === num && (r + startRow !== row || c + startCol !== col)) {
                return false;
            }
        }
    }

    return true;
}

// Check if the entire board is filled
function isBoardFull(currentBoard) {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (currentBoard[r][c] === 0) {
                return false;
            }
        }
    }
    return true;
}

// Check if the current board matches the solution
function checkSolution(currentBoard) {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (currentBoard[r][c] !== solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

// Generate a new Sudoku puzzle (simplified generation)
// A proper generator involves backtracking and difficulty calculation.
// This is a placeholder that fills the board and then removes numbers.
async function generateNewGame() {
    initializeBoard();
    messageElement.textContent = 'Generating puzzle...';
    // A very basic solver to fill the board first
    if (solveSudoku(board)) {
        solution = board.map(row => [...row]); // Store the solution
        // Remove numbers to create a puzzle (difficulty TBD)
        const difficulty = 40; // Number of cells to keep (lower means harder)
        let cellsToRemove = SIZE * SIZE - difficulty;
        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * SIZE);
            const col = Math.floor(Math.random() * SIZE);
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                cellsToRemove--;
            }
        }
        createBoardUI(); // Recreate UI with the generated puzzle
        messageElement.textContent = 'New game started!';
    } else {
        messageElement.textContent = 'Failed to generate puzzle.';
    }
}

// Backtracking solver function
function solveSudoku(boardToSolve) {
    let emptyCell = findEmptyCell(boardToSolve);
    if (!emptyCell) {
        return true; // Board is full, puzzle solved
    }

    const [row, col] = emptyCell;

    for (let num = 1; num <= SIZE; num++) {
        if (isValid(boardToSolve, row, col, num)) {
            boardToSolve[row][col] = num;

            if (solveSudoku(boardToSolve)) {
                return true;
            }

            boardToSolve[row][col] = 0; // Backtrack
        }
    }

    return false;
}

function findEmptyCell(boardToFind) {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (boardToFind[r][c] === 0) {
                return [r, c];
            }
        }
    }
    return null;
}

// Solve the current puzzle
function solvePuzzle() {
    if (!solution || solution.length === 0) {
        messageElement.textContent = 'Generate a new game first.';
        return;
    }
    // Copy the solution to the main board
    board = solution.map(row => [...row]);
    createBoardUI(); // Update UI to show the solved board
    messageElement.textContent = 'Puzzle solved!';
}

// Provide a hint
function getHint() {
    if (!selectedCell) {
        messageElement.textContent = 'Select a cell to get a hint.';
        return;
    }
    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);

    if (board[row][col] !== 0) {
        messageElement.textContent = 'Cell already filled.';
        return;
    }

    // Reveal the correct number from the solution
    const correctNumber = solution[row][col];
    board[row][col] = correctNumber;
    selectedCell.textContent = correctNumber;
    selectedCell.classList.add('hinted');
    selectedCell.classList.remove('selected');
    setTimeout(() => {
        selectedCell.classList.remove('hinted');
    }, 1000);
    selectedCell = null;

    // Check if hint completed the puzzle
    if (isBoardFull(board) && checkSolution(board)) {
        messageElement.textContent = 'Congratulations! You solved it!';
    }
}

// Event listeners
numberPadButtons.forEach(button => {
    button.addEventListener('click', () => handleNumberInput(parseInt(button.dataset.num)));
});
generateButton.addEventListener('click', generateNewGame);
solveButton.addEventListener('click', solvePuzzle);
hintButton.addEventListener('click', getHint);

// Initial setup
initializeBoard();
generateNewGame(); // Start with a new game
