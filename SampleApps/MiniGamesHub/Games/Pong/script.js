const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');
const messageElement = document.getElementById('message');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const player1ScoreElement = document.getElementById('player1-score');
const player2ScoreElement = document.getElementById('player2-score');

// Game settings
let GAME_WIDTH, GAME_HEIGHT;
let PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED;
let BALL_RADIUS, BALL_SPEED_X, BALL_SPEED_Y;
let SCORE_LIMIT = 5;

// Game elements
let player1 = { x: 0, y: 0, width: 0, height: 0, score: 0 };
let player2 = { x: 0, y: 0, width: 0, height: 0, score: 0 };
let ball = { x: 0, y: 0, radius: 0, speedX: 0, speedY: 0 };

let gameActive = false;
let animationFrameId = null;

function resizeCanvas() {
    // Set canvas dimensions based on screen size, maintaining aspect ratio
    const aspectRatio = 16 / 9; // Standard aspect ratio for Pong
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.7;

    if (maxWidth / aspectRatio > maxHeight) {
        GAME_HEIGHT = maxHeight;
        GAME_WIDTH = maxHeight * aspectRatio;
    } else {
        GAME_WIDTH = maxWidth;
        GAME_HEIGHT = maxWidth / aspectRatio;
    }

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    // Adjust element sizes based on new dimensions
    PADDLE_WIDTH = GAME_WIDTH * 0.015;
    PADDLE_HEIGHT = GAME_HEIGHT * 0.1;
    BALL_RADIUS = GAME_WIDTH * 0.015;
    BALL_SPEED_X = GAME_WIDTH * 0.003;
    BALL_SPEED_Y = GAME_WIDTH * 0.003;
    PADDLE_SPEED = GAME_HEIGHT * 0.015;

    // Reset paddle positions
    player1.width = PADDLE_WIDTH;
    player1.height = PADDLE_HEIGHT;
    player1.x = PADDLE_WIDTH;
    player1.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;

    player2.width = PADDLE_WIDTH;
    player2.height = PADDLE_HEIGHT;
    player2.x = GAME_WIDTH - PADDLE_WIDTH * 2;
    player2.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;

    // Reset ball position
    resetBall();
}

function resetBall() {
    ball.radius = BALL_RADIUS;
    ball.x = GAME_WIDTH / 2;
    ball.y = GAME_HEIGHT / 2;
    ball.speedX = -BALL_SPEED_X * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY = BALL_SPEED_Y * (Math.random() > 0.5 ? 1 : -1);
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i < GAME_HEIGHT; i += 15) {
        drawRect(GAME_WIDTH / 2 - 1, i, 2, 10, '#FFF');
    }
}

function updateScore() {
    player1ScoreElement.textContent = player1.score;
    player2ScoreElement.textContent = player2.score;
}

function update() {
    if (!gameActive) return;

    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with top/bottom walls
    if (ball.y + ball.radius > GAME_HEIGHT || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
    }

    // Ball collision with paddles
    let paddle = (ball.x < GAME_WIDTH / 2) ? player1 : player2;
    if (collision(ball, paddle)) {
        // Calculate angle
        let collidePoint = (ball.y - (paddle.y + paddle.height / 2));
        collidePoint = collidePoint / (paddle.height / 2);

        let angleRad = (Math.PI / 4) * collidePoint;

        let direction = (ball.x < GAME_WIDTH / 2) ? 1 : -1;

        ball.speedX = direction * BALL_SPEED_X * (1 + Math.abs(collidePoint) * 0.5); // Increase speed based on impact point
        ball.speedY = BALL_SPEED_Y * angleRad * (1 + Math.abs(collidePoint) * 0.5);

        // Speed up ball slightly with each paddle hit
        ball.speedX *= 1.02;
        ball.speedY *= 1.02;
    }

    // Ball goes out of bounds (score)
    if (ball.x - ball.radius > GAME_WIDTH) {
        player1.score++;
        updateScore();
        resetBall();
        if (player1.score >= SCORE_LIMIT) {
            endGame('Player 1');
            return;
        }
    } else if (ball.x + ball.radius < 0) {
        player2.score++;
        updateScore();
        resetBall();
        if (player2.score >= SCORE_LIMIT) {
            endGame('Player 2');
            return;
        }
    }

    // Update paddle positions (controlled by input)

    // Drawing
    drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT, '#0d0d1f'); // Clear canvas
    drawNet();
    drawRect(player1.x, player1.y, player1.width, player1.height, '#FFF');
    drawRect(player2.x, player2.y, player2.width, player2.height, '#FFF');
    drawCircle(ball.x, ball.y, ball.radius, '#FFF');
}

function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

let player1Up = false;
let player1Down = false;
let player2Up = false;
let player2Down = false;

document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    if (e.key === 'w' || e.key === 'W') player1Up = true;
    if (e.key === 's' || e.key === 'S') player1Down = true;
    if (e.key === 'ArrowUp') player2Up = true;
    if (e.key === 'ArrowDown') player2Down = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W') player1Up = false;
    if (e.key === 's' || e.key === 'S') player1Down = false;
    if (e.key === 'ArrowUp') player2Up = false;
    if (e.key === 'ArrowDown') player2Down = false;
});

function movePaddles() {
    if (player1Up && player1.y > 0) {
        player1.y -= PADDLE_SPEED;
    }
    if (player1Down && player1.y + player1.height < GAME_HEIGHT) {
        player1.y += PADDLE_SPEED;
    }
    if (player2Up && player2.y > 0) {
        player2.y -= PADDLE_SPEED;
    }
    if (player2Down && player2.y + player2.height < GAME_HEIGHT) {
        player2.y += PADDLE_SPEED;
    }
}

function gameLoop() {
    movePaddles();
    update();
    if (gameActive) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    resizeCanvas(); // Initial setup
    gameActive = true;
    player1.score = 0;
    player2.score = 0;
    updateScore();
    messageElement.textContent = '';
    startButton.style.display = 'none';
    restartButton.style.display = 'none';
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
}

function endGame(winner) {
    gameActive = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    messageElement.textContent = `${winner} wins!`;
    startButton.style.display = 'none';
    restartButton.style.display = 'block';
}

function restartGame() {
    player1.score = 0;
    player2.score = 0;
    updateScore();
    resetBall();
    startGame(); // Restart the game loop and state
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
window.addEventListener('resize', resizeCanvas);

// Initial setup
resizeCanvas(); // Set initial size and element properties
updateScore(); // Initialize score display
