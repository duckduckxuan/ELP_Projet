# Word Guessing Game - Projet ELM
This Elm application lets players guess words based on their definitions fetched from an external API, aiming to guess as many words as possible within a set time frame. The game includes a timer and offers the option to play again, though it ensures a fresh sequence of words for each new game.

## Structure
- **Main.elm :** The main application logic, including game initialization, state management, and view rendering. 
- **LesDefinitions.elm :** Handles fetching and decoding word definitions from the external API.
- **MotAleatoire.elm :** Generates random words from a predefined list ensuring game variety.
- **PasAffichage.elm :** Contains utility functions for UI elements, like hiding and showing game components based on the game state.
- **/static/monFichier.txt :** A text file with a list of words used to generate random game words.

## Setup
1. Ensure Elm is installed on your system.
2. Clone the repository to your local machine.
3. Navigate to the project directory and run '**elm make src/Main.elm --output=main.html**' to compile the application.
4. Open '**main.html**' in a web browser to start the game.
   
## Features
- Guess words based on their definitions.
- Timer to challenge players in guessing as many words as possible.
- Dynamic word sequence for each game to keep the challenge fresh.
- Option to view the correct answer for learning purposes.
- Play again feature to restart the game after completion.

## Contributions
Contributions to the project are welcome. Please ensure you follow the project's coding standards and submit your pull requests for review.

Amusez-vous bien en jouant à notre projet !
