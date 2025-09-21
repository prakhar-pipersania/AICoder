const boardElement = document.getElementById('game-board');
const messageElement = document.getElementById('game-message');
const restartButton = document.getElementById('restart-button');
const changePlayerBtn = document.getElementById('change-player-btn');

const ROWS = 6;
const COLS = 7;
const WIN_COUNT = 4;

let board = [];
let currentPlayer = 'red'; // Player 1 starts
let playerTurn = 1;
let gameActive = true;

// Initialize board structure
for (let r = 0; r < ROWS; r++) {
    board.push(Array(COLS).fill(0)); // 0: empty, 1: red, 2: yellow
}

function createBoardUI() {
    boardElement.innerHTML = ''; // Clear existing board
    for (let c = 0; c < COLS; c++) {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('column');
        columnDiv.dataset.column = c;

        for (let r = 0; r < ROWS; r++) {
            const slotDiv = document.createElement('div');
            slotDiv.classList.add('slot');
            slotDiv.dataset.row = r;
            slotDiv.dataset.column = c;
            columnDiv.appendChild(slotDiv);
        }
        boardElement.appendChild(columnDiv);
    }
}

function updateBoardUI() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const slot = boardElement.querySelector(`.slot[data-row='${r}'][data-column='${c}']`);
            if (slot) {
                slot.classList.remove('red', 'yellow');
                if (board[r][c] === 1) {
                    slot.classList.add('red');
                } else if (board[r][c] === 2) {
                    slot.classList.add('yellow');
                }
            }
        }
    }
}

function getNextOpenRow(col) {
    for (let r = 0; r < ROWS; r++) {
        if (board[r][col] === 0) {
            return r;
        }
    }
    return -1; // Column is full
}

function handleClick(event) {
    if (!gameActive) return;

    const clickedColumn = parseInt(event.target.closest('.column').dataset.column);
    if (isNaN(clickedColumn)) return;

    const row = getNextOpenRow(clickedColumn);

    if (row === -1) {
        messageElement.textContent = 'Column is full! Choose another.';
        return;
    }

    board[row][clickedColumn] = (currentPlayer === 'red' ? 1 : 2);
    updateBoardUI();

    if (checkWin(row, clickedColumn)) {
        messageElement.textContent = `Player ${playerTurn} (${currentPlayer}) wins!`;
        gameActive = false;
        return;
    }

    // Check for draw
    if (board.every(row => row.every(cell => cell !== 0))) {
        messageElement.textContent = "It's a draw!";
        gameActive = false;
        return;
    }

    // Switch player
    switchPlayer();
}

function switchPlayer() {
    currentPlayer = (currentPlayer === 'red' ? 'yellow' : 'red');
    playerTurn = (playerTurn === 1 ? 2 : 1);
    messageElement.textContent = `Player ${playerTurn} (${currentPlayer}) turn`;
}

function checkWin(row, col) {
    const player = board[row][col];

    // Check horizontal
    for (let c = 0; c <= COLS - WIN_COUNT; c++) {
        if (board[row][c] === player &&
            board[row][c+1] === player &&
            board[row][c+2] === player &&
            board[row][c+3] === player) {
            return true;
        }
    }

    // Check vertical
    for (let r = 0; r <= ROWS - WIN_COUNT; r++) {
        if (board[r][col] === player &&
            board[r+1][col] === player &&
            board[r+2][col] === player &&
            board[r+3][col] === player) {
            return true;
        }
    }

    // Check diagonal (down-right)
    for (let r = 0; r <= ROWS - WIN_COUNT; r++) {
        for (let c = 0; c <= COLS - WIN_COUNT; c++) {
            if (board[r][c] === player &&
                board[r+1][c+1] === player &&
                board[r+2][c+2] === player &&
                board[r+3][c+3] === player) {
                return true;
            }
        }
    }

    // Check diagonal (up-right)
    for (let r = WIN_COUNT - 1; r < ROWS; r++) {
        for (let c = 0; c <= COLS - WIN_COUNT; c++) {
            if (board[r][c] === player &&
                board[r-1][c+1] === player &&
                board[r-2][c+2] === player &&
                board[r-3][c+3] === player) {
                return true;
            }
        }
    }

    return false;
}

function restartGame() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board.push(Array(COLS).fill(0));
    }
    currentPlayer = 'red';
    playerTurn = 1;
    gameActive = true;
    messageElement.textContent = `Player 1 (${currentPlayer}) turn`;
    createBoardUI();
    updateBoardUI();
}

// Event listeners
boardElement.addEventListener('click', handleClick);
restartButton.addEventListener('click', restartGame);
changePlayerBtn.addEventListener('click', () => {
    if (gameActive) {
        switchPlayer();
    }
});

// Initial setup
createBoardUI();
updateBoardUI();
