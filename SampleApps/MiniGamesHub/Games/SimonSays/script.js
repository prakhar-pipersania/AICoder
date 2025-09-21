const greenPad = document.getElementById('pad-green');
const redPad = document.getElementById('pad-red');
const yellowPad = document.getElementById('pad-yellow');
const bluePad = document.getElementById('pad-blue');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const levelElement = document.getElementById('level');
const messageElement = document.getElementById('message');

const pads = [
    { element: greenPad, color: 'green' },
    { element: redPad, color: 'red' },
    { element: yellowPad, color: 'yellow' },
    { element: bluePad, color: 'blue' }
];

const padColors = ['green', 'red', 'yellow', 'blue'];
const sequence = [];
let currentLevel = 0;
let playerTurn = false;
let playerSequenceIndex = 0;
let gameActive = false;

function startGame() {
    gameActive = true;
    sequence.length = 0; // Clear previous sequence
    currentLevel = 0;
    playerSequenceIndex = 0;
    playerTurn = false;
    levelElement.textContent = `Level: ${currentLevel}`;
    messageElement.textContent = '';
    startButton.style.display = 'none';
    restartButton.style.display = 'none';
    nextLevel();
}

function nextLevel() {
    playerSequenceIndex = 0;
    playerTurn = false;
    currentLevel++;
    levelElement.textContent = `Level: ${currentLevel}`;
    const randomColor = padColors[Math.floor(Math.random() * padColors.length)];
    sequence.push(randomColor);
    playSequence();
}

function playSequence() {
    // Disable player input while sequence plays
    pads.forEach(pad => pad.element.removeEventListener('click', handlePlayerClick));

    let delay = 500;
    sequence.forEach((color, index) => {
        setTimeout(() => {
            activatePad(color);
        }, delay * index);
    });

    // Allow player input after sequence finishes
    setTimeout(() => {
        playerTurn = true;
        pads.forEach(pad => pad.element.addEventListener('click', handlePlayerClick));
        messageElement.textContent = 'Your turn!';
    }, delay * sequence.length);
}

function activatePad(color) {
    const pad = pads.find(p => p.color === color);
    if (pad) {
        pad.element.classList.add('active');
        // Use audio if available (optional)
        // playSound(color);
        setTimeout(() => {
            pad.element.classList.remove('active');
        }, 500);
    }
}

function handlePlayerClick(event) {
    if (!playerTurn || !gameActive) return;

    const clickedPad = event.target.closest('.simon-pad');
    if (!clickedPad) return;

    const color = clickedPad.dataset.color;
    activatePad(color);

    if (color === sequence[playerSequenceIndex]) {
        playerSequenceIndex++;
        if (playerSequenceIndex === sequence.length) {
            // Player completed the sequence correctly
            playerTurn = false;
            messageElement.textContent = 'Correct!';
            setTimeout(nextLevel, 1000);
        }
    } else {
        // Incorrect move
        messageElement.textContent = 'Wrong! Game Over!';
        endGame();
    }
}

function endGame() {
    gameActive = false;
    playerTurn = false;
    pads.forEach(pad => pad.element.removeEventListener('click', handlePlayerClick));
    startButton.style.display = 'none';
    restartButton.style.display = 'block';
}

function playAgain() {
    sequence.length = 0;
    currentLevel = 0;
    playerSequenceIndex = 0;
    playerTurn = false;
    gameActive = false;
    levelElement.textContent = `Level: 0`;
    messageElement.textContent = '';
    startButton.style.display = 'block';
    restartButton.style.display = 'none';
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', playAgain);

// Initial state
