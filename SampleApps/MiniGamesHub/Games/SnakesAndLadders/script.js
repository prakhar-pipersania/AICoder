const boardElement = document.getElementById('game-board');
const playerInfoElement = document.getElementById('player-info');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const messageElement = document.getElementById('game-message');
const restartButton = document.getElementById('restart-button');

const BOARD_SIZE = 10;
const NUM_SQUARES = BOARD_SIZE * BOARD_SIZE;

const snakes = {
    16: 6,
    47: 26,
    49: 11,
    56: 53,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 78
};

const ladders = {
    1: 38,
    4: 14,
    9: 31,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    80: 100
};

let playerPosition = 1;
let diceValue = 0;
let isGameActive = true;

function createBoard() {
    boardElement.innerHTML = '';
    for (let i = NUM_SQUARES; i >= 1; i--) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.dataset.square = i;
        square.textContent = i;
        if (i % BOARD_SIZE !== 1) {
            if (Math.floor((i - 1) / BOARD_SIZE) % 2 === 0) {
                square.classList.add('even-row');
            } else {
                square.classList.add('odd-row');
            }
        }
        boardElement.appendChild(square);
    }
    // Add snake/ladder indicators (optional visualization)
    for (const start in snakes) {
        const end = snakes[start];
        const startSquare = boardElement.querySelector(`.square[data-square='${start}']`);
        const endSquare = boardElement.querySelector(`.square[data-square='${end}']`);
        if (startSquare && endSquare) {
            const snakeIndicator = document.createElement('div');
            snakeIndicator.classList.add('snake');
            // Basic positioning logic for visualization
            snakeIndicator.style.top = `calc(${getSquareTop(end)}% + 5px)`;
            snakeIndicator.style.left = `calc(${getSquareLeft(end)}% + 5px)`;
            snakeIndicator.style.width = `calc(${getSquareWidth(start, end)}%)`;
            snakeIndicator.style.height = `calc(${getSquareHeight(start, end)}%)`;
            boardElement.appendChild(snakeIndicator);
        }
    }
    for (const start in ladders) {
        const end = ladders[start];
        const startSquare = boardElement.querySelector(`.square[data-square='${start}']`);
        const endSquare = boardElement.querySelector(`.square[data-square='${end}']`);
        if (startSquare && endSquare) {
            const ladderIndicator = document.createElement('div');
            ladderIndicator.classList.add('ladder');
            // Basic positioning logic for visualization
            ladderIndicator.style.bottom = `calc(${100 - getSquareBottom(start)}% + 5px)`;
            ladderIndicator.style.left = `calc(${getSquareLeft(start)}% + 5px)`;
            ladderIndicator.style.width = `calc(${getSquareWidth(start, end)}%)`;
            ladderIndicator.style.height = `calc(${getSquareHeight(start, end)}%)`;
            boardElement.appendChild(ladderIndicator);
        }
    }
    placePlayer();
}

function getSquareTop(squareNum) {
    const row = BOARD_SIZE - Math.ceil(squareNum / BOARD_SIZE);
    return row * (100 / BOARD_SIZE);
}
function getSquareBottom(squareNum) {
    const row = BOARD_SIZE - Math.ceil(squareNum / BOARD_SIZE);
    return (row + 1) * (100 / BOARD_SIZE);
}
function getSquareLeft(squareNum) {
    const row = BOARD_SIZE - Math.ceil(squareNum / BOARD_SIZE);
    let col;
    if (row % 2 === 0) { // Even row (0-indexed, counting from top)
        col = (squareNum - 1) % BOARD_SIZE;
    } else { // Odd row
        col = BOARD_SIZE - 1 - ((squareNum - 1) % BOARD_SIZE);
    }
    return col * (100 / BOARD_SIZE);
}
function getSquareWidth(start, end) {
    // This is a simplified visualization, actual snake/ladder graphics are complex.
    return 100 / BOARD_SIZE;
}
function getSquareHeight(start, end) {
    // This is a simplified visualization.
    return 100 / BOARD_SIZE;
}

function placePlayer() {
    const playerElement = document.getElementById('player');
    if (playerElement) {
        playerElement.remove();
    }

    const currentPlayerElement = document.createElement('div');
    currentPlayerElement.id = 'player';
    currentPlayerElement.classList.add('player');

    const squareElement = boardElement.querySelector(`[data-square='${playerPosition}']`);
    if (squareElement) {
        const rect = squareElement.getBoundingClientRect();
        const boardRect = boardElement.getBoundingClientRect();

        // Calculate position relative to the board
        const top = squareElement.offsetTop;
        const left = squareElement.offsetLeft;

        currentPlayerElement.style.top = `${top + (squareElement.offsetHeight - currentPlayerElement.offsetHeight) / 2}px`;
        currentPlayerElement.style.left = `${left + (squareElement.offsetWidth - currentPlayerElement.offsetWidth) / 2}px`;

        boardElement.appendChild(currentPlayerElement);
    }
}

function rollDice() {
    if (!isGameActive) return;

    diceValue = Math.floor(Math.random() * 6) + 1;
    messageElement.textContent = `You rolled a ${diceValue}!`;

    let newPosition = playerPosition + diceValue;

    if (newPosition > NUM_SQUARES) {
        newPosition = playerPosition; // Stay put if roll exceeds the board
        messageElement.textContent += ' Stay where you are!';
    } else {
        // Check for snakes and ladders before moving
        if (snakes[newPosition]) {
            messageElement.textContent += ' Oops, a snake!';
            newPosition = snakes[newPosition];
        } else if (ladders[newPosition]) {
            messageElement.textContent += ' Yay, a ladder!';
            newPosition = ladders[newPosition];
        }
    }

    playerPosition = newPosition;
    updatePlayerInfo();
    placePlayer(); // Move player visually

    if (playerPosition === NUM_SQUARES) {
        messageElement.textContent = 'Congratulations! You reached the end!';
        isGameActive = false;
    }
}

function updatePlayerInfo() {
    playerInfoElement.textContent = `Player 1 at Square ${playerPosition}`;
}

function restartGame() {
    playerPosition = 1;
    diceValue = 0;
    isGameActive = true;
    messageElement.textContent = '';
    updatePlayerInfo();
    createBoard(); // Recreate board to reset player position visually
    placePlayer(); // Ensure player is on the board
}

rollDiceBtn.addEventListener('click', rollDice);
restartButton.addEventListener('click', restartGame);

// Initialize the game
createBoard();
updatePlayerInfo();
placePlayer();
