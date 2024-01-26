document.addEventListener('DOMContentLoaded', () => {
    const grilleA = genererGrilleVide(8, 9);
    const grilleB = genererGrilleVide(8, 9);
  
    afficherGrille('grille-container-joueur-a', grilleA, 'Joueur A');
    afficherGrille('grille-container-joueur-b', grilleB, 'Joueur B');
  
    // Simulez le jeu en ajoutant quelques lettres à la grille du joueur A
    placerLettre(grilleA, 'A', 1, 1);
    placerLettre(grilleA, 'B', 2, 2);
    afficherGrille('grille-container-joueur-a', grilleA, 'Joueur A'); // Mettez à jour la grille affichée
  });
  
  function genererGrilleVide(rows, cols) {
    const grille = [];
  
    for (let i = 0; i < rows; i++) {
      const row = Array(cols).fill(' '); // Remplit la ligne avec des espaces vides
      grille.push(row);
    }
  
    return grille;
  }
  
  function afficherGrille(containerId, grille, joueurNom) {
    const grilleContainer = document.getElementById(containerId);
  
    // Supprime tout contenu existant dans le conteneur avant d'ajouter le nouveau
    while (grilleContainer.firstChild) {
      grilleContainer.removeChild(grilleContainer.firstChild);
    }
  
    const table = document.createElement('table');
    table.classList.add('grille-table'); // Ajout d'une classe CSS à la table
  
    // Ajouter un titre pour indiquer le joueur
    const titre = document.createElement('h2');
    titre.style.textAlign = 'center'; 
    titre.textContent = `Grille de ${joueurNom}`;
    grilleContainer.appendChild(titre);
  
    for (let i = 0; i < grille.length; i++) {
      const row = document.createElement('tr');
  
      for (let j = 0; j < grille[i].length; j++) {
        const cell = document.createElement('td');
        cell.textContent = grille[i][j];
        row.appendChild(cell);
      }
  
      table.appendChild(row);
    }
  
    grilleContainer.appendChild(table);
  }
  