const gridContainer = document.getElementById('word-search-grid');
const wordListElement = document.getElementById('words');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

const GRID_SIZE = 12;
const words = ["JAVASCRIPT", "HTML", "CSS", "NODE", "REACT", "ANGULAR", "VUE", "PYTHON", "RUBY", "SWIFT", "KOTLIN", "JAVA"];

let grid = [];
let wordObjects = []; // Stores words with their positions and directions
let selectedCells = [];
let isSelecting = false;
let foundWordsCount = 0;

// Directions: [row_change, col_change]
const directions = {
    horizontal: [0, 1],
    vertical: [1, 0],
    diagonalDownRight: [1, 1],
    diagonalUpRight: [-1, 1],
    horizontalReverse: [0, -1],
    verticalReverse: [-1, 0],
    diagonalDownLeft: [1, -1],
    diagonalUpLeft: [-1, -1]
};

function initializeGrid() {
    grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    wordObjects = [];
    selectedCells = [];
    isSelecting = false;
    foundWordsCount = 0;
    messageElement.textContent = '';
}

function generateGrid() {
    initializeGrid();
    const wordsToPlace = words.slice(0, Math.min(words.length, GRID_SIZE)); // Limit words based on grid size

    wordsToPlace.forEach(word => {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            attempts++;
            const directionName = Object.keys(directions)[Math.floor(Math.random() * Object.keys(directions).length)];
            const [dr, dc] = directions[directionName];

            const startRow = Math.floor(Math.random() * GRID_SIZE);
            const startCol = Math.floor(Math.random() * GRID_SIZE);

            let fits = true;
            let currentGrid = [];
            let currentCells = [];

            for (let i = 0; i < word.length; i++) {
                const r = startRow + i * dr;
                const c = startCol + i * dc;

                if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
                    fits = false;
                    break;
                }

                if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
                    fits = false;
                    break;
                }
                currentGrid.push({ r, c, char: word[i] });
            }

            if (fits) {
                currentGrid.forEach(cellInfo => {
                    grid[cellInfo.r][cellInfo.c] = cellInfo.char;
                });
                wordObjects.push({
                    word: word,
                    cells: currentGrid.map(c => ({ r: c.r, c: c.c }))
                });
                placed = true;
            }
        }
    });

    // Fill remaining empty cells with random letters
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random uppercase letter
            }
        }
    }
}

function createGridUI() {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.textContent = grid[r][c];

            cell.addEventListener('mousedown', () => startSelection(r, c));
            cell.addEventListener('mouseenter', () => extendSelection(r, c));
            cell.addEventListener('mouseup', endSelection);
            cell.addEventListener('mouseleave', () => isSelecting && clearPartialSelection()); // Clear partial if mouse leaves grid while selecting

            gridContainer.appendChild(cell);
        }
    }
}

function createWordListUI() {
    wordListElement.innerHTML = '';
    wordObjects.forEach(wordObj => {
        const li = document.createElement('li');
        li.classList.add('word-item');
        li.textContent = wordObj.word;
        li.dataset.word = wordObj.word;
        wordListElement.appendChild(li);
    });
}

function startSelection(r, c) {
    if (foundWordsCount === wordObjects.length) return;

    isSelecting = true;
    selectedCells = [{ r, c }];
    updateCellSelection();
}

function extendSelection(r, c) {
    if (!isSelecting) return;

    const lastSelected = selectedCells[selectedCells.length - 1];
    if (!lastSelected) return;

    // Check if the new cell is adjacent to the last selected cell in a straight line
    const dr = r - lastSelected.r;
    const dc = c - lastSelected.c;

    // If only one cell selected so far, allow any direction
    if (selectedCells.length === 1) {
        selectedCells.push({ r, c });
    } else {
        const prevSelected = selectedCells[selectedCells.length - 2];
        // Check if the current move continues the line
        const prevDr = lastSelected.r - prevSelected.r;
        const prevDc = lastSelected.c - prevSelected.c;

        if (dr === prevDr && dc === prevDc) {
            selectedCells.push({ r, c });
        } else {
             // If direction changes, reset selection to just the new cell and the last one
             // This allows forming a line starting from the previous point
             selectedCells = [lastSelected, {r, c}];
        }
    }
    updateCellSelection();
}

function updateCellSelection() {
    // Remove previous partial selections
    document.querySelectorAll('.grid-cell.partially-selected').forEach(cell => cell.classList.remove('partially-selected'));
    document.querySelectorAll('.grid-cell.selected').forEach(cell => cell.classList.remove('selected'));

    selectedCells.forEach(({ r, c }, index) => {
        const cellElement = gridContainer.querySelector(`[data-row='${r}'][data-col='${c}']`);
        if (cellElement) {
            if (index === selectedCells.length - 1) {
                cellElement.classList.add('selected');
            } else {
                cellElement.classList.add('partially-selected');
            }
        }
    });
}

function clearPartialSelection() {
     document.querySelectorAll('.grid-cell.partially-selected').forEach(cell => cell.classList.remove('partially-selected'));
}

function endSelection() {
    isSelecting = false;
    if (selectedCells.length < 2) {
        clearSelectionStyles();
        return;
    }

    const selectedWordText = selectedCells.map(({ r, c }) => grid[r][c]).join('');
    const foundWordObj = wordObjects.find(wo => wo.word === selectedWordText);

    if (foundWordObj) {
        // Check if the selected cells match the word's placement
        let matchesPlacement = true;
        for (let i = 0; i < selectedCells.length; i++) {
            if (selectedCells[i].r !== foundWordObj.cells[i].r || selectedCells[i].c !== foundWordObj.cells[i].c) {
                matchesPlacement = false;
                break;
            }
        }

        if (matchesPlacement) {
            messageElement.textContent = `Found: ${foundWordObj.word}`;
            foundWordsCount++;
            const wordListItem = wordListElement.querySelector(`.word-item[data-word='${foundWordObj.word}']`);
            if (wordListItem) {
                wordListItem.classList.add('found');
            }
            selectedCells.forEach(({ r, c }) => {
                const cellElement = gridContainer.querySelector(`[data-row='${r}'][data-col='${c}']`);
                if (cellElement) {
                    cellElement.classList.add('selected'); // Keep selected style for found word
                    cellElement.removeEventListener('mouseenter', extendSelection);
                    cellElement.removeEventListener('mousedown', startSelection);
                    cellElement.removeEventListener('mouseup', endSelection);
                    cellElement.removeEventListener('mouseleave', clearPartialSelection); // Ensure listeners are removed
                }
            });
            if (foundWordsCount === wordObjects.length) {
                messageElement.textContent = 'Congratulations! You found all the words!';
            }
        } else {
            messageElement.textContent = 'Incorrect word or placement.';
            clearSelectionStyles();
        }
    } else {
        messageElement.textContent = 'Not a valid word.';
        clearSelectionStyles();
    }
}

function clearSelectionStyles() {
    document.querySelectorAll('.grid-cell.selected, .grid-cell.partially-selected').forEach(cell => {
        cell.classList.remove('selected', 'partially-selected');
    });
    selectedCells = [];
}

function restartGame() {
    generateGrid();
    createGridUI();
    createWordListUI();
}

restartButton.addEventListener('click', restartGame);

// Initial setup
restartGame();
