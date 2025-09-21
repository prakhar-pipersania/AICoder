document.addEventListener('DOMContentLoaded', () => {
    const gameTiles = document.querySelectorAll('.game-tile');
    const gameDisplay = document.getElementById('game-display');
    const gameFrame = document.getElementById('game-frame');
    const closeGameBtn = document.getElementById('close-game-btn');

    gameTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            const gameName = tile.getAttribute('data-game');
            loadGame(gameName);
        });
    });

    closeGameBtn.addEventListener('click', () => {
        closeGame();
    });

    function loadGame(gameName) {
        const gamePath = `Games/${gameName}/index.html`;
        gameFrame.src = gamePath;
        gameDisplay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind the game
    }

    function closeGame() {
        gameFrame.src = ''; // Clear the iframe content
        gameDisplay.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Optional: Close game with Escape key
    document.addEventListener('keydown', (event) => {
        if (!gameDisplay.classList.contains('hidden') && event.key === 'Escape') {
            closeGame();
        }
    });
});
