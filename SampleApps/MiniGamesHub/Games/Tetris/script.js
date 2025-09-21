const boardElement = document.getElementById('tetris-board');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const nextPieceCanvas = document.getElementById('next-piece-canvas');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const messageElement = document.getElementById('message');

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 25;
const NEXT_PIECE_SIZE = 4;

let board = [];
let score = 0;
let level = 1;
let dropInterval = 1000;
let dropTimer = null;
let gameOver = false;

let player = {
    pos: { x: 0, y: 0 },
    matrix: [],
    color: ''
};

const colors = [
    { color: '0,0,0', name: '' }, // Empty
    { color: '0,255,255', name: 'I' }, // Cyan
    { color: '0,0,255', name: 'J' }, // Blue
    { color: '255,165,0', name: 'L' }, // Orange
    { color: '255,255,0', name: 'O' }, // Yellow
    { color: '0,128,0', name: 'S' }, // Green
    { color: '128,0,128', name: 'T' }, // Purple
    { color: '255,0,0', name: 'Z' }  // Red
];

// Tetromino shapes (matrices)
const TETROMINOS = [
    null, // 0 - Empty
    [[1, 1, 1, 1]], // I shape
    [[2, 0, 0], [2, 2, 2]], // J shape
    [[0, 0, 3], [3, 3, 3]], // L shape
    [[4, 4], [4, 4]], // O shape
    [[0, 5, 5], [5, 5, 0]], // S shape
    [[0, 6, 0], [6, 6, 6]], // T shape
    [[7, 7, 0], [0, 7, 7]]  // Z shape
];

let nextPiece = null;

// --- Game Initialization ---
function createBoardElement() {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_WIDTH}, ${BLOCK_SIZE}px)`;
    for (let i = 0; i < BOARD_WIDTH * BOARD_HEIGHT; i++) {
        const block = document.createElement('div');
        block.classList.add('tetromino-block');
        block.dataset.index = i;
        boardElement.appendChild(block);
    }
}

function createEmptyBoard() {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
}

function createPiece() {
    const pieceIndex = Math.floor(Math.random() * TETROMINOS.length);
    player.matrix = TETROMINOS[pieceIndex];
    player.color = colors[pieceIndex].name;
    player.pos = { x: Math.floor(BOARD_WIDTH / 2) - Math.ceil(player.matrix[0].length / 2), y: 0 };
    if (pieceIndex === 0) { // If we somehow got null, get another piece
        createPiece(); 
    }
}

// --- Game Logic ---
function merge(board) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    // Transpose matrix
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    }
}

function playerMove(offset) {
    player.pos.x += offset.x;
    player.pos.y += offset.y;
    if (collide()) {
        player.pos.x -= offset.x;
        player.pos.y -= offset.y;
        return false;
    }
    return true;
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide()) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir); // Revert rotation
            return;
        }
    }
}

function collide() {
    for (let y = 0; y < player.matrix.length; y++) {
        for (let x = 0; x < player.matrix[y].length; x++) {
            if (player.matrix[y][x] !== 0 &&
                (board[y + player.pos.y] &&
                 board[y + player.pos.y][x + player.pos.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function sweepLines() {
    let linesCleared = 0;
    for (let y = board.length - 1; y > 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            linesCleared++;
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            y++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 10 * level;
        scoreElement.innerText = score;
        if (linesCleared >= 4) {
            messageElement.textContent = "Tetris!";
        }
        // Update level based on score or lines cleared
        if (score > level * 500) { // Simple level up condition
            level++;
            levelElement.innerText = level;
            dropInterval = Math.max(100, dropInterval - 100); // Speed up drop
            resetDropTimer();
        }
    }
}

function update() {
    playerMove({ x: 0, y: 1 });
    if (!playerMove({ x: 0, y: 1 })) {
        merge(board);
        sweepLines();
        createPiece();
        if (collide()) {
            gameOver = true;
            messageElement.textContent = "Game Over!";
            startButton.style.display = 'none';
            restartButton.style.display = 'block';
            return;
        }
        draw();
        drawNextPiece();
    }
    dropCounter = 0;
}

function draw() {
    boardElement.innerHTML = '';
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const block = document.createElement('div');
                block.classList.add('tetromino-block');
                block.style.backgroundColor = `rgb(${colors[value].color})`;
                block.style.width = `${BLOCK_SIZE}px`;
                block.style.height = `${BLOCK_SIZE}px`;
                block.style.borderWidth = '1px';
                block.style.borderColor = `#${colors[value].color.split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('')}`; // Basic border color
                boardElement.appendChild(block);
                block.style.gridColumnStart = x + 1;
                block.style.gridRowStart = y + 1;
            }
        });
    });

    // Draw current player piece
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const block = document.createElement('div');
                block.classList.add('tetromino-block');
                block.style.backgroundColor = `rgb(${colors[value].color})`;
                block.style.width = `${BLOCK_SIZE}px`;
                block.style.height = `${BLOCK_SIZE}px`;
                block.style.borderWidth = '1px';
                block.style.borderColor = `#${colors[value].color.split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('')}`;
                boardElement.appendChild(block);
                block.style.gridColumnStart = x + player.pos.x + 1;
                block.style.gridRowStart = y + player.pos.y + 1;
            }
        });
    });
}

function drawNextPiece() {
    const ctx = nextPieceCanvas.getContext('2d');
    ctx.fillStyle = '#444'; // Background color
    ctx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

    if (nextPiece) {
        const pieceMatrix = TETROMINOS[colors.findIndex(c => c.name === nextPiece.color)];
        const pieceColorValue = colors.find(c => c.name === nextPiece.color).color;

        pieceMatrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = `rgb(${pieceColorValue})`;
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = `#${pieceColorValue.split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('')}`;
                    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }
}

// --- Event Listeners ---
let dropCounter = 0;
let dropIntervalMS = dropInterval;
let lastTime = 0;

function gameLoop(time = 0) {
    if (!gameOver) {
        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > dropIntervalMS) {
            update();
        }

        draw();
        requestAnimationFrame(gameLoop);
    }
}

function resetDropTimer() {
    dropIntervalMS = dropInterval;
}

document.addEventListener('keydown', event => {
    if (gameOver) return;

    if (event.key === 'ArrowLeft') {
        playerMove({ x: -1, y: 0 });
    } else if (event.key === 'ArrowRight') {
        playerMove({ x: 1, y: 0 });
    } else if (event.key === 'ArrowDown') {
        update(); // Move down faster
    } else if (event.key === 'ArrowUp') {
        playerRotate(-1);
    } else if (event.key === ' ') { // Spacebar for hard drop (optional)
        while (playerMove({ x: 0, y: 1 })) {
            // Keep moving down until collision
        }
        update(); // Trigger the update to merge and spawn new piece
    }
    draw();
});

function startGame() {
    gameOver = false;
    score = 0;
    level = 1;
    dropInterval = 1000;
    scoreElement.innerText = score;
    levelElement.innerText = level;
    messageElement.textContent = '';
    startButton.style.display = 'none';
    restartButton.style.display = 'none';
    
    board = createEmptyBoard();
    createPiece();
    nextPiece = {
        matrix: TETROMINOS[Math.floor(Math.random() * (TETROMINOS.length -1)) + 1],
        color: colors[Math.floor(Math.random() * (TETROMINOS.length -1)) + 1].name
    };
    drawNextPiece();
    resetDropTimer();
    lastTime = 0; // Reset time for smooth animation start
    gameLoop();
}

function restartGame() {
    // Reuse startGame logic for restart
    startGame();
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

// Initialize canvas size
nextPieceCanvas.width = NEXT_PIECE_SIZE * BLOCK_SIZE;
nextPieceCanvas.height = NEXT_PIECE_SIZE * BLOCK_SIZE;

createBoardElement(); // Setup the grid divs
