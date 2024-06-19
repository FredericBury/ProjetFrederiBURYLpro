document.addEventListener('DOMContentLoaded', function () {
  afficherScores();
  const lowerVolumeButton = document.getElementById('lowerVolumeButton');
  const volumeSlider = document.getElementById('volumeSlider');

  if (lowerVolumeButton) {
    lowerVolumeButton.addEventListener('click', baisserVolume);
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', ajusterVolume);
  }
});

const conteneur = document.getElementById('game-container');
const toile = document.getElementById('gameCanvas');
const ctx = toile.getContext('2d');
const menu = document.getElementById('menu');
const scoresContainer = document.getElementById('scoresContainer');
const instructionsButton = document.getElementById('instructions-button');
const startGameButton = document.getElementById('start-game-button');
const backgroundMusic = document.getElementById('backgroundMusic');
const scoreDisplayRealTime = document.getElementById('scoreDisplayRealTime');

instructionsButton.addEventListener('click', afficherInstructions);
startGameButton.onclick = demarrerPartie;

let sourisX = 0;
let sourisY = 0;
let joueurX = conteneur.offsetWidth / 2;
let joueurY = conteneur.offsetHeight - 30;
let rayonObstacle = 20;
let grandRayonObstacle = 50;
let vitesseObstacle = 2;
let obstacles = [];
let score = 0;
let partieEnCours = false;

toile.width = conteneur.offsetWidth;
toile.height = conteneur.offsetHeight;

function dessinerJoueur() {
  ctx.beginPath();
  ctx.arc(joueurX, joueurY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
}

function dessinerObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    ctx.beginPath();
    const imageObstacle = new Image();
    imageObstacle.src = 'ennemi.png';
    ctx.drawImage(imageObstacle, obstacles[i].x - obstacles[i].rayon, obstacles[i].y - obstacles[i].rayon, obstacles[i].rayon * 2, obstacles[i].rayon * 2);
    ctx.closePath();
  }
}

function mettreAJourObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].y += obstacles[i].vitesseY;
    obstacles[i].x += obstacles[i].vitesseX;

    const distance = Math.sqrt(Math.pow(joueurX - obstacles[i].x, 2) + Math.pow(joueurY - obstacles[i].y, 2));
    if (distance < 20) {
      finDePartie();
    }

    if (
      joueurX < 0 ||
      joueurX > conteneur.offsetWidth ||
      joueurY < 0 ||
      joueurY > conteneur.offsetHeight
    ) {
      finDePartie();
    }

    if (
      obstacles[i].y > conteneur.offsetHeight + obstacles[i].rayon ||
      obstacles[i].x > conteneur.offsetWidth + obstacles[i].rayon ||
      obstacles[i].x < -obstacles[i].rayon ||
      obstacles[i].y < -obstacles[i].rayon
    ) {
      obstacles.splice(i, 1);
      i--;
      score++;
    }
  }
}

function dessiner() {
  ctx.clearRect(0, 0, conteneur.offsetWidth, conteneur.offsetHeight);

  dessinerJoueur();
  dessinerObstacles();

  mettreAJourObstacles();

  // Mis à jour de l'affichage en temps réel du score
  scoreDisplayRealTime.textContent = `Score: ${score}`;

  if (partieEnCours) {
    requestAnimationFrame(dessiner);
  }
}

function gestionnaireDeDeplacementSouris(e) {
  sourisX = e.clientX - conteneur.getBoundingClientRect().left;
  sourisY = e.clientY - conteneur.getBoundingClientRect().top;
  joueurX = sourisX;
  joueurY = sourisY;
}

document.addEventListener('mousemove', gestionnaireDeDeplacementSouris);

function genererObstacle() {
  const maxObstaclesCount = 15; // Maximum number of obstacles to generate
  const randomObstaclesCount = Math.floor(Math.random() * maxObstaclesCount) + 1;

  for (let i = 0; i < randomObstaclesCount; i++) {
    const estGrandObstacle = Math.random() < 0.2;
    const rayonObstacle = estGrandObstacle ? grandRayonObstacle : 20;

    const cote = Math.floor(Math.random() * 4);
    let obstacleX, obstacleY, vitesseX, vitesseY;

    // Adjust the speed range to reduce maximum speed
    vitesseX = (Math.random() * 2 - 1) * 6; // Values between -2 and 2
    vitesseY = (Math.random() * 2 - 1) * 6; // Values between -2 and 2

    switch (cote) {
      case 0:
        obstacleX = Math.random() * conteneur.offsetWidth;
        obstacleY = -rayonObstacle;
        break;
      case 1:
        obstacleX = conteneur.offsetWidth + rayonObstacle;
        obstacleY = Math.random() * conteneur.offsetHeight;
        break;
      case 2:
        obstacleX = Math.random() * conteneur.offsetWidth;
        obstacleY = conteneur.offsetHeight + rayonObstacle;
        break;
      case 3:
        obstacleX = -rayonObstacle;
        obstacleY = Math.random() * conteneur.offsetHeight;
        break;
    }

    const couleurObstacle = obtenirCouleurAleatoire();
    obstacles.push({ x: obstacleX, y: obstacleY, vitesseX, vitesseY, rayon: rayonObstacle, couleur: couleurObstacle });
  }
}

function obtenirCouleurAleatoire() {
  const lettres = '0123456789ABCDEF';
  let couleur = '#';
  for (let i = 0; i < 6; i++) {
    couleur += lettres[Math.floor(Math.random() * 16)];
  }
  return couleur;
}

function demarrerPartie() {
  partieEnCours = true;
  menu.style.display = 'none';
  
  // Réinitialiser la liste des obstacles
  obstacles = [];

  genererObstacle();
  dessiner();

  // Démarrer la musique de fond
  backgroundMusic.play();

  setInterval(genererObstacle, 1000);
}

function finDePartie() {
  partieEnCours = false;
  const modal = document.getElementById('myModal');
  const span = document.getElementsByClassName('close')[0];
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreForm = document.getElementById('scoreForm');
  const gameOverSound = document.getElementById('gameOverSound');

  // Arrêter la musique de fond
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;

  // Enregistrer le score actuel dans scoreEnCours
  const scoreEnCours = score;

  gameOverSound.play();

  scoreDisplay.textContent = `Votre score : ${scoreEnCours}`;
  modal.style.display = 'block';

  span.onclick = function () {
    modal.style.display = 'none';
    menu.style.display = 'block'; // Affiche à nouveau l'écran de menu
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
      menu.style.display = 'block'; // Affiche à nouveau l'écran de menu
    }
  };

  scoreForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const playerName = document.getElementById('playerName').value;

    enregistrerScore(playerName, scoreEnCours);

    afficherScores();

    // Réinitialiser le score à zéro
    score = 0;

    modal.style.display = 'none';
    menu.style.display = 'block'; // Affiche à nouveau l'écran de menu
  });

  // Réinitialiser les variables de jeu
  score = 0;
  obstacles = [];
  joueurX = conteneur.offsetWidth / 2;
  joueurY = conteneur.offsetHeight - 30;
}

function enregistrerScore(playerName, playerScore) {
  let scores = JSON.parse(localStorage.getItem('esquiveChallengeScores')) || [];
  scores.push({ name: playerName, score: playerScore });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('esquiveChallengeScores', JSON.stringify(scores));
}

function afficherScores() {
  const scores = JSON.parse(localStorage.getItem('esquiveChallengeScores')) || [];
  scoresContainer.innerHTML = '<h2>Scores précédents</h2>';

  const limitedScores = scores.slice(0, 8);
  if (limitedScores.length > 0) {
    limitedScores.forEach((score, index) => {
      scoresContainer.innerHTML += `<p>${index + 1}. ${score.name}: ${score.score}</p>`;
    });
  } else {
    scoresContainer.innerHTML += '<p>Aucun score précédent disponible.</p>';
  }
}

function afficherInstructions() {
  const instructionsModal = document.getElementById('instructionsModal');
  const closeInstructionsButton = document.getElementById('closeInstructionsButton');

  instructionsModal.style.display = 'block';

  closeInstructionsButton.onclick = function () {
    instructionsModal.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target == instructionsModal) {
      instructionsModal.style.display = 'none';
    }
  };
}

function baisserVolume() {
  backgroundMusic.volume = Math.max(0, backgroundMusic.volume - 0.1);
}

function ajusterVolume() {
  backgroundMusic.volume = this.value;
}
