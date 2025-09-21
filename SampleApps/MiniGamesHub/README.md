# Documentation

## Project Structure

- `index.html`: Main HTML file for the project, serving as the hub for all mini-games.
- `style.css`: Global CSS file for styling the main hub page and general layout.
- `script.js`: JavaScript file for handling the main hub functionality, including loading games.
- `Games/`: Directory containing individual game folders.
    - `ConnectFour/`: Folder for the Connect Four game.
        - `index.html`: HTML file for the Connect Four game.
        - `style.css`: CSS file for the Connect Four game.
        - `script.js`: JavaScript file for the Connect Four game logic.
    - `Chess/`: Folder for the Chess game.
        - `index.html`: HTML file for the Chess game.
        - `style.css`: CSS file for the Chess game.
        - `script.js`: JavaScript file for the Chess game logic.
    - `Hangman/`: Folder for the Hangman game.
        - `index.html`: HTML file for the Hangman game.
        - `style.css`: CSS file for the Hangman game.
        - `script.js`: JavaScript file for the Hangman game logic.
    - `MemoryMatch/`: Folder for the Memory Match game.
        - `index.html`: HTML file for the Memory Match game.
        - `style.css`: CSS file for the Memory Match game.
        - `script.js`: JavaScript file for the Memory Match game logic.
    - `Pong/`: Folder for the Pong game.
        - `index.html`: HTML file for the Pong game.
        - `style.css`: CSS file for the Pong game.
        - `script.js`: JavaScript file for the Pong game logic.
    - `SimonSays/`: Folder for the Simon Says game.
        - `index.html`: HTML file for the Simon Says game.
        - `style.css`: CSS file for the Simon Says game.
        - `script.js`: JavaScript file for the Simon Says game logic.
    - `SnakesAndLadders/`: Folder for the Snakes and Ladders game.
        - `index.html`: HTML file for the Snakes and Ladders game.
        - `style.css`: CSS file for the Snakes and Ladders game.
        - `script.js`: JavaScript file for the Snakes and Ladders game logic.
    - `Sudoku/`: Folder for the Sudoku game.
        - `index.html`: HTML file for the Sudoku game.
        - `style.css`: CSS file for the Sudoku game.
        - `script.js`: JavaScript file for the Sudoku game logic.
    - `Tetris/`: Folder for the Tetris game.
        - `index.html`: HTML file for the Tetris game.
        - `style.css`: CSS file for the Tetris game.
        - `script.js`: JavaScript file for the Tetris game logic.
    - `TicTacToe/`: Folder for the Tic Tac Toe game.
        - `index.html`: HTML file for the Tic Tac Toe game.
        - `style.css`: CSS file for the Tic Tac Toe game.
        - `script.js`: JavaScript file for the Tic Tac Toe game logic.
    - `WordSearch/`: Folder for the Word Search game.
        - `index.html`: HTML file for the Word Search game.
        - `style.css`: CSS file for the Word Search game.
        - `script.js`: JavaScript file for the Word Search game logic.
- `Assets/Images/`: Directory for game-related image assets.
    - `connect_four_tile.png`: Image asset for the Connect Four game tile.
    - `chess_tile.png`: Image asset for the Chess game tile.
    - `game_tile_placeholder.png`: Placeholder image asset (no longer explicitly used in new `index.html`).
    - `hangman_tile.png`: Image asset for the Hangman game tile.
    - `memory_match_tile.png`: Image asset for the Memory Match game tile.
    - `pong_tile.png`: Image asset for the Pong game tile.
    - `simon_says_tile.png`: Image asset for the Simon Says game tile.
    - `snakes_and_ladders_tile.png`: Image asset for the Snakes and Ladders game tile.
    - `sudoku_tile.png`: Image asset for the Sudoku game tile.
    - `tetris_tile.png`: Image asset for the Tetris game tile.
    - `tic_tac_toe_tile.png`: Image asset for the Tic Tac Toe game tile.
    - `word_search_tile.png`: Image asset for the Word Search game tile.

## File Descriptions

- `index.html`: The main entry point of the project, acting as a hub page that displays game tiles and loads selected games into an iframe.
- `style.css`: Global styles for the main hub page, including layout, typography, and styling for game tiles and the iframe display.
- `script.js`: Handles the dynamic loading of games into an iframe when a game tile is clicked and provides functionality to close the game view.
- `Games/TicTacToe/index.html`: HTML structure for the Tic Tac Toe game interface.
- `Games/TicTacToe/style.css`: Styles specific to the Tic Tac Toe game.
- `Games/TicTacToe/script.js`: Implements the game logic, state management, and user interactions for Tic Tac Toe.
- `Games/SnakesAndLadders/index.html`: HTML structure for the Snakes and Ladders game interface.
- `Games/SnakesAndLadders/style.css`: Styles specific to the Snakes and Ladders game.
- `Games/SnakesAndLadders/script.js`: Implements the game logic, state management, and user interactions for Snakes and Ladders.
- `Games/ConnectFour/index.html`: HTML structure for the Connect Four game interface.
- `Games/ConnectFour/style.css`: Styles specific to the Connect Four game.
- `Games/ConnectFour/script.js`: Implements the game logic, state management, and user interactions for Connect Four.
- `Games/Chess/index.html`: HTML structure for the Chess game interface.
- `Games/Chess/style.css`: Styles specific to the Chess game.
- `Games/Chess/script.js`: Implements the game logic, state management, and user interactions for Chess.
- `Games/Sudoku/index.html`: HTML structure for the Sudoku game interface.
- `Games/Sudoku/style.css`: Styles specific to the Sudoku game.
- `Games/Sudoku/script.js`: Implements the game logic, state management, and user interactions for Sudoku, including generation and solving.
- `Games/MemoryMatch/index.html`: HTML structure for the Memory Match game interface.
- `Games/MemoryMatch/style.css`: Styles specific to the Memory Match game.
- `Games/MemoryMatch/script.js`: Implements the game logic, state management, and user interactions for Memory Match.
- `Games/Hangman/index.html`: HTML structure for the Hangman game interface.
- `Games/Hangman/style.css`: Styles specific to the Hangman game, including SVG drawing.
- `Games/Hangman/script.js`: Implements the game logic, state management, and user interactions for Hangman.
- `Games/WordSearch/index.html`: HTML structure for the Word Search game interface.
- `Games/WordSearch/style.css`: Styles specific to the Word Search game.
- `Games/WordSearch/script.js`: Implements the game logic, state management, and user interactions for Word Search.
- `Games/SimonSays/index.html`: HTML structure for the Simon Says game interface.
- `Games/SimonSays/style.css`: Styles specific to the Simon Says game.
- `Games/SimonSays/script.js`: Implements the game logic, state management, and user interactions for Simon Says.
- `Games/Tetris/index.html`: HTML structure for the Tetris game interface.
- `Games/Tetris/style.css`: Styles specific to the Tetris game.
- `Games/Tetris/script.js`: Implements the game logic, state management, and user interactions for Tetris.
- `Games/Pong/index.html`: HTML file for the Pong game.
- `Games/Pong/style.css`: CSS file for the Pong game.
- `Games/Pong/script.js`: JavaScript file for the Pong game logic.
- `Assets/Images/*.png`: Image assets used for game tiles on the main hub page and potentially within specific games.

## Dependencies

- Standard HTML, CSS, and JavaScript environments.
- No external libraries or frameworks are explicitly required for the core functionality of these games.
- Browser support for modern JavaScript features and CSS.

## Recent Changes

- **2023-10-27**:
    - Updated `index.html`, `style.css`, `script.js` to create a central hub for games.
    - Created `Games/TicTacToe/index.html`, `Games/TicTacToe/style.css`, `Games/TicTacToe/script.js`.
    - Created `Games/SnakesAndLadders/index.html`, `Games/SnakesAndLadders/style.css`, `Games/SnakesAndLadders/script.js`.
    - Created `Assets/Images/game_tile_placeholder.png`.

- **2023-10-28**:
    - Added new games: `ConnectFour`, `Chess`, `Sudoku`, `MemoryMatch`, `Hangman`, `WordSearch`, `SimonSays`, `Tetris`, `Pong`.
    - Created corresponding HTML, CSS, and JavaScript files for each new game within the `Games/` directory.
    - Added new image assets for the game tiles in `Assets/Images/`.
    - Updated `index.html`, `style.css`, and `script.js` to integrate the new games into the main hub.
    - Updated `Games/TicTacToe/index.html`, `Games/TicTacToe/style.css`, `Games/TicTacToe/script.js` to be complete implementations.
    - Updated `Games/SnakesAndLadders/index.html`, `Games/SnakesAndLadders/style.css`, `Games/SnakesAndLadders/script.js` to be complete implementations.

## TODOs

- Implement win condition checking for Chess.
- Refine Sudoku puzzle generation for varying difficulty levels.
- Add multiplayer functionality for applicable games (e.g., Pong, Connect Four).
- Implement more robust error handling and user feedback across all games.
- Optimize performance for more complex games like Tetris and Chess.
- Add sound effects and background music to enhance gameplay.
- Consider adding a settings menu for volume control, difficulty selection, etc.
- Ensure all games are fully responsive across different screen sizes.