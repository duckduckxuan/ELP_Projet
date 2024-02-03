# JARNAC - Jeu de mots stratégique

## Accomplissements et fonctionnalités
Nous avons réussi à implémenter le jeu de JARNAC, avec : 

- **Joueurs :** Nous avons deux joueurs" et le joueur qui commence la partie est choisi aleatoirement. 
- **Début du jeu :**Au début du jeu, les joueurs reçoivent 6 lettres de manière aléatoire.
- **Validation des mots :** Nous avons utilisé une API pour la validation des mots en anglais : (https://api.dictionaryapi.dev/api/v2/entries/en/<word>)
- **Enregistrer le jeu :** À la fin du jeu, les coups joués par chaque joueur seront enregistrés dans un fichier .txt

Au cours du jeu, il est possible de :

- **Piocher des lettres :** Les joueurs peuvent piocher des lettres pour enrichir leur main.
- **Changer des lettres :** Les joueurs peuvent changer jusqu'à 3 lettres de leur main.
- **Transformer des mots :** Une stratégie avancée permet aux joueurs de transformer des mots déjà joués.
- **JARNAC :** Il est possible de faire un JARNAC dans ce jeu !  

## Installation
1. Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé sur votre ordinateur.
2. Clonez ce dépôt git
3. Accédez au répertoire du projet : `cd JS`
4. Installez : `npm install axios readline`
   
## Comment jouer
1. Lancez le jeu en exécutant `node game.js` dans le terminal.
2. Suivez les instructions pour jouer des tours, former des mots et interagir avec le jeu.

## Fin de partie
La partie se termine lorsque l'un des tableau des joueurs est complet. Le joueur avec le plus de points remporte la partie.

## Sauvegarde du journal de jeu
Le journal de jeu est sauvegardé dans un fichier texte `game_log.txt` à la fin de la partie.

Amusez-vous bien en jouant à JARNAC !
