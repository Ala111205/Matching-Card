**🍀 Memory Game (4×4 / 6×6)**

      A modern, browser-based Memory Matching Game built using Vanilla JavaScript, HTML, and CSS.
      
      Players flip cards to find matching pairs, with persistent game state across sessions and a dynamic scoring system.

**Live Demo** 👉 https://ala111205.github.io/Matching-Card/

**🚀 Features:**

      Responsive Grid Layout: Supports 4×4 and 6×6 card grids.

      Card Flip Animations: Smooth 3D flip effects on card selection.

      Move Counter: Tracks total moves.

      Timer: Measures elapsed time in MM:SS format.

      Scoring System: Calculates score based on time and moves.

      Persistent Game State:

      Save/restore progress after page refresh.

      Resume or start fresh on a new session with confirmation.

      Restores flipped and matched cards.

      Winning Modal: Displays moves, time, and final score when all pairs are matched.

      New Game & Play Again Buttons: Reset the game cleanly.

      Difficulty Selector: Switch between 4×4 and 6×6 grids.

**⚡ Game Mechanics**

      Card Deck: Built dynamically from an array of emoji symbols.

      Shuffle: Fisher-Yates shuffle ensures random card placement.

      Timer: Starts on the first card click and updates every 500ms.

      Score Calculation:

         Score = max(0, 10000 - (elapsed_seconds * 15) - (moves * 120))


      Lock Mechanism: Prevents additional clicks during card flip animations.

**💾 Persistence & Sessions**

      Game state is saved in localStorage under the key memory-game-state.

      Session control via sessionStorage to detect new tab/browser sessions.

      On new session with previous game:

      Player is prompted to continue previous game or start fresh.

      Default 4×4 grid is displayed immediately while waiting for confirmation.

      Card states (flipped/matched), moves, timer, and score are restored on page reload.

**🛠️ Technologies Used:**

      HTML5 – Structure of the game grid and UI.

      CSS3 – Grid layout, 3D card flip animations, responsive styling.

      Vanilla JavaScript – Game logic, state persistence, event handling.

**🎯 How to Play:**

      Click on a card to flip it.

      Flip a second card to try to find a matching pair.

      If the cards match, they remain face-up. If not, they flip back after a short delay.

      Continue until all pairs are matched.

      Your score is calculated based on time elapsed and moves made.
