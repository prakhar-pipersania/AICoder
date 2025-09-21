const boardElement = document.getElementById('game-board');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const restartButton = document.getElementById('restart-button');

const CARD_PAIRS = 8; // 16 cards total
const CARD_VALUES = ['🍎', '🍌', '🍒', '🍓', '🍇', '🍊', '🍋', '🍍'];

let cards = [];
let firstCard = null;
let secondCard = null;
let matches = 0;
let moves = 0;
let timerInterval = null;
let seconds = 0;
let gameActive = false;

function shuffleCards() {
    const shuffled = [];
    const availableValues = CARD_VALUES.slice(0, CARD_PAIRS);
    // Duplicate values for pairs
    const values = [...availableValues, ...availableValues];
    
    // Shuffle the values
    values.sort(() => Math.random() - 0.5);
    return values;
}

function createBoard() {
    const values = shuffleCards();
    boardElement.innerHTML = ''; // Clear existing board
    cards = []; // Reset cards array
    
    values.forEach((value, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.dataset.value = value;
        cardDiv.dataset.index = index;

        const frontDiv = document.createElement('div');
        frontDiv.classList.add('front');
        frontDiv.textContent = '?'; // Placeholder

        const backDiv = document.createElement('div');
        backDiv.classList.add('back');
        backDiv.textContent = value;

        cardDiv.appendChild(frontDiv);
        cardDiv.appendChild(backDiv);
        boardElement.appendChild(cardDiv);
        cards.push(cardDiv);
    });
}

function flipCard(event) {
    if (!gameActive || !event.target.classList.contains('card')) return;

    const clickedCard = event.target;

    // Prevent flipping if already matched, flipped, or if it's the same card
    if (clickedCard.classList.contains('matched') || clickedCard.classList.contains('flipped') || clickedCard === firstCard) {
        return;
    }

    clickedCard.classList.add('flipped');

    if (!firstCard) {
        firstCard = clickedCard;
    } else {
        secondCard = clickedCard;
        moves++;
        movesElement.textContent = `Moves: ${moves}`;
        checkForMatch();
    }
}

function checkForMatch() {
    const firstValue = firstCard.dataset.value;
    const secondValue = secondCard.dataset.value;

    if (firstValue === secondValue) {
        // Match found
        matches++;
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetCards();

        if (matches === CARD_PAIRS) {
            endGame(true);
        }
    } else {
        // No match, flip back after a delay
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetCards();
        }, 1000);
    }
}

function resetCards() {
    firstCard = null;
    secondCard = null;
}

function startGame() {
    gameActive = true;
    matches = 0;
    moves = 0;
    seconds = 0;
    movesElement.textContent = `Moves: ${moves}`;
    timerElement.textContent = `Time: ${seconds}s`;

    createBoard();
    cards.forEach(card => card.addEventListener('click', flipCard));

    // Start timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        timerElement.textContent = `Time: ${seconds}s`;
    }, 1000);
}

function endGame(won) {
    gameActive = false;
    clearInterval(timerInterval);
    if (won) {
        alert(`Congratulations! You found all matches in ${moves} moves and ${seconds} seconds!`);
    } else {
        alert('Game Over!');
    }
}

restartButton.addEventListener('click', startGame);

// Initial setup
startGame();
