const hangmanDrawing = document.getElementById('hangman-drawing');
const wordDisplay = document.getElementById('word-display');
const guessesLeftElement = document.getElementById('guesses-left');
const keyboardElement = document.getElementById('keyboard');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

const words = [
    "PROGRAMMING", "COMPUTER", "JAVASCRIPT", "DEVELOPER", "WEBSITE", 
    "ALGORITHM", "DATABASE", "FRAMEWORK", "INTERNET", "LANGUAGE",
    "NETWORK", "SOFTWARE", "SYSTEM", "VARIABLE", "FUNCTION",
    "OBJECT", "ARRAY", "STRING", "BOOLEAN", "INTEGER"
];

const maxGuesses = 10;
let selectedWord = '';
let displayedWord = [];
let incorrectGuesses = 0;
let guessedLetters = new Set();
let svgParts = {}; // To store references to SVG elements

function initializeSvgParts() {
    svgParts = {
        gallows: hangmanDrawing.querySelector('svg'),
        head: hangmanDrawing.querySelector('.head'),
        body: hangmanDrawing.querySelector('.body'),
        leftArm: hangmanDrawing.querySelector('.left-arm'),
        rightArm: hangmanDrawing.querySelector('.right-arm'),
        leftLeg: hangmanDrawing.querySelector('.left-leg'),
        rightLeg: hangmanDrawing.querySelector('.right-leg')
    };
    // Ensure parts are hidden initially if they exist
    for (const part in svgParts) {
        if (svgParts[part]) {
            svgParts[part].style.display = 'none';
        }
    }
}

function drawHangmanPart(partName) {
    if (svgParts[partName]) {
        svgParts[partName].style.display = 'block';
    }
}

function selectRandomWord() {
    selectedWord = words[Math.floor(Math.random() * words.length)];
    displayedWord = Array(selectedWord.length).fill('_');
    guessedLetters.clear();
    incorrectGuesses = 0;
    messageElement.textContent = '';
    guessesLeftElement.textContent = `Guesses Left: ${maxGuesses}`;
    wordDisplay.textContent = displayedWord.join(' ');
    generateKeyboard();
    initializeSvgParts(); // Reset drawing
}

function generateKeyboard() {
    keyboardElement.innerHTML = '';
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    alphabet.forEach(letter => {
        const button = document.createElement('button');
        button.classList.add('key');
        button.textContent = letter;
        button.addEventListener('click', () => handleGuess(letter, button));
        keyboardElement.appendChild(button);
    });
}

function handleGuess(letter, button) {
    if (guessedLetters.has(letter) || incorrectGuesses >= maxGuesses || !selectedWord) {
        return;
    }

    guessedLetters.add(letter);
    button.classList.add('disabled');

    if (selectedWord.includes(letter)) {
        // Correct guess
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === letter) {
                displayedWord[i] = letter;
            }
        }
        wordDisplay.textContent = displayedWord.join(' ');
        if (displayedWord.join('') === selectedWord) {
            messageElement.textContent = 'Congratulations! You guessed the word!';
            endGame(true);
        }
    } else {
        // Incorrect guess
        incorrectGuesses++;
        guessesLeftElement.textContent = `Guesses Left: ${maxGuesses - incorrectGuesses}`;
        drawHangmanPart(getHangmanPart(incorrectGuesses));
        if (incorrectGuesses >= maxGuesses) {
            messageElement.textContent = `Game Over! The word was: ${selectedWord}`;
            endGame(false);
        }
    }
}

function getHangmanPart(guessCount) {
    switch (guessCount) {
        case 1: return 'head';
        case 2: return 'body';
        case 3: return 'leftArm';
        case 4: return 'rightArm';
        case 5: return 'leftLeg';
        case 6: return 'rightLeg';
        default: return '';
    }
}

function endGame(won) {
    const keys = keyboardElement.querySelectorAll('.key');
    keys.forEach(key => key.classList.add('disabled'));
    restartButton.style.display = 'block';
}

function restartGame() {
    selectRandomWord();
    // Ensure the SVG drawing is reset visually (handled by selectRandomWord calling initializeSvgParts)
}

restartButton.addEventListener('click', restartGame);

// Initial setup
window.onload = () => {
    // Ensure SVG elements are correctly referenced and initially hidden
    // This part of the JS might need to be adjusted based on the exact SVG structure.
    // We'll create the parts here dynamically if they aren't in the HTML template
    const svg = hangmanDrawing.querySelector('svg');
    if (!svg.querySelector('.head')) {
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        head.setAttribute('cx', '150'); head.setAttribute('cy', '80'); head.setAttribute('r', '20'); head.className.baseVal = 'hangman-part head';
        svg.appendChild(head);
    }
    if (!svg.querySelector('.body')) {
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        body.setAttribute('x1', '150'); body.setAttribute('y1', '100'); body.setAttribute('x2', '150'); body.setAttribute('y2', '170'); body.className.baseVal = 'hangman-part body';
        svg.appendChild(body);
    }
    if (!svg.querySelector('.left-arm')) {
        const leftArm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftArm.setAttribute('x1', '150'); leftArm.setAttribute('y1', '120'); leftArm.setAttribute('x2', '130'); leftArm.setAttribute('y2', '140'); leftArm.className.baseVal = 'hangman-part left-arm';
        svg.appendChild(leftArm);
    }
    if (!svg.querySelector('.right-arm')) {
        const rightArm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightArm.setAttribute('x1', '150'); rightArm.setAttribute('y1', '120'); rightArm.setAttribute('x2', '170'); rightArm.setAttribute('y2', '140'); rightArm.className.baseVal = 'hangman-part right-arm';
        svg.appendChild(rightArm);
    }
    if (!svg.querySelector('.left-leg')) {
        const leftLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftLeg.setAttribute('x1', '150'); leftLeg.setAttribute('y1', '170'); leftLeg.setAttribute('x2', '130'); leftLeg.setAttribute('y2', '200'); leftLeg.className.baseVal = 'hangman-part left-leg';
        svg.appendChild(leftLeg);
    }
    if (!svg.querySelector('.right-leg')) {
        const rightLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightLeg.setAttribute('x1', '150'); rightLeg.setAttribute('y1', '170'); rightLeg.setAttribute('x2', '170'); rightLeg.setAttribute('y2', '200'); rightLeg.className.baseVal = 'hangman-part right-leg';
        svg.appendChild(rightLeg);
    }

    initializeSvgParts();
    selectRandomWord();
};
