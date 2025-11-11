"use strict"; // Aktiverer strict mode - hjælper med at fange fejl

// Start app når DOM er loaded (hele HTML siden er færdig)
document.addEventListener("DOMContentLoaded", initApp);

// ===== GLOBALE VARIABLER =====
let allGames = []; 

// ===== INITIALISERING =====
function initApp() {
  console.log("initApp: app.js is running 🎉");
  getGames();
  document
    .querySelector("#search-input")
    .addEventListener("input", filterGames); // ← Ændret!
  document
    .querySelector("#genre-select")
    .addEventListener("change", filterGames); // ← Ny!
  document
    .querySelector("#sort-select")
    .addEventListener("change", filterGames);

  // NYE: Kun playtime felter
  document.querySelector("#playtime-from").addEventListener("input", filterGames);
  document.querySelector("#playtime-to").addEventListener("input", filterGames);

  // Rating field event listeners // Tilføj EFTER år listeners
  document.querySelector("#rating-from").addEventListener("input", filterGames);
  document.querySelector("#rating-to").addEventListener("input", filterGames);

  // Clear filters knap - TILFØJ TIL SIDST
  document
    .querySelector("#clear-filters")
    .addEventListener("click", clearAllFilters);
}

// ===== DATA HENTNING =====
async function getGames() {
  // Hent data fra JSON - husk at URL er anderledes!
  // Gem data i allGames variablen
  // Kald andre funktioner (hvilke?)

  console.log("🌐 Henter alle games fra JSON...");
  const response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
  );
  allGames = await response.json();
  console.log(`📊 JSON data modtaget: ${allGames.length} games`);
  populateGenreDropdown(); // Udfyld dropdown med genres <-----
  displayGames(allGames);
}

// ===== VISNING =====  // Vis alle games - loop gennem og kald displayGame() for hver game
function displayGames(games) {
  console.log(` Viser ${games.length} games`);
  // Nulstil #game-list HTML'en
  document.querySelector("#game-list").innerHTML = "";
  // Gennemløb alle games og kør displayGame-funktionen for hver game
  for (const game of games) {
    displayGame(game);
  }
}

// Vis ÉT game card
function displayGame(game) {
  const gameList = document.querySelector("#game-list");
  const gameHTML = `
    <article class="game-card">
        <img src="${game.image}" alt="Poster of ${game.title}" class="game-poster" />
        <img src="Images/Favorit tomt ikon.png" alt="Favorit" class="favorite-icon" onclick="toggleFavorite(event, '${game.title}')">
      <div class="game-info">
        <h3>${game.title} <span class="game-rating"><img src="Images/Stjerne ikon.png" alt="Rating" class="rating-icon"> ${game.rating}</span></h3>
        <p class="game-shelf">Hylde ${game.shelf}</p>
        <p class="game-players"><img src="Images/Spillere ikon.png" alt="Players" class="players-icon"> ${game.players.min}-${game.players.max} spillere</p>
        <p class="game-playtime"><img src="Images/Tid ikon.png" alt="Playtime" class="playtime-icon"> ${game.playtime} minutter </p>
        <p class="game-genre"><img src="Images/Kategori ikon.png" alt="Genre" class="genre-icon"> ${game.genre}</p>  
      </div>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", gameHTML);

  // Tilføj click event til den nye card
  const newCard = gameList.lastElementChild;
  newCard.addEventListener("click", function () {
    console.log(`🎬 Klik på: "${game.title}"`);
    showGameModal(game);
  });


  // Tilføj keyboard support
  newCard.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showGameModal(game);
    }
  });
}
  // Husk: game.players er et OBJECT!
  // Er der andre properties, du skal tænke over?


// ===== FILTRERING =====

// Dropdownmenu med genre
function populateGenreDropdown() {
  const genreSelect = document.querySelector("#genre-select");
  const genres = new Set();

  for (const game of allGames) {
    genres.add(game.genre);
  }

  // Fjern gamle options undtagen 'Alle genrer'
  genreSelect.innerHTML = '<option value="all">Alle genrer</option>';

  const sortedGenres = Array.from(genres).sort();
  for (const genre of sortedGenres) {
    genreSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${genre}">${genre}</option>`
    );
  }
}




function filterGames() {
  // Filtrer games baseret på søgning, genre, playtime, ovs.
  // OBS: game.genre skal sammenlignes med === (ikke .includes())

  const searchValue = document.querySelector("#search-input").value.toLowerCase();
  const genreValue = document.querySelector("#genre-select").value;
  const sortValue = document.querySelector("#sort-select").value;

  // NYE playtime variable - TILFØJ KUN DISSE TO LINJER
  const playtimeFrom = Number(document.querySelector("#playtime-from").value) || 0;
  const playtimeTo = Number(document.querySelector("#playtime-to").value) || 9999;

  // NYE rating variable
  const ratingFrom = Number(document.querySelector("#rating-from").value) || 0;
  const ratingTo = Number(document.querySelector("#rating-to").value) || 10;

  console.log("🔄 Filtrerer games...");

  // Start med alle games
  let filteredGames = allGames;

  // TRIN 1: Filtrer på søgetekst
  if (searchValue) {
    filteredGames = filteredGames.filter((game) => {
      return game.title.toLowerCase().includes(searchValue);
    });
  }

  // TRIN 2: Filter på genre (fra dropdown)
  if (genreValue !== "all") {
    filteredGames = filteredGames.filter((game) => {
      return game.genre.includes(genreValue);
    });
  }


  
  
  // TRIN 3: Playtime filter
  if (playtimeFrom > 0 || playtimeTo < 9999) {
    filteredGames = filteredGames.filter((game) => {
      // Antag at game.playtime er i minutter (f.eks. "30-60" eller "45")
      const playtime = parseInt(game.playtime); // Tag første nummer
      return playtime >= playtimeFrom && playtime <= playtimeTo;
    });
  }

  // TRIN 4: Rating filter
  filteredGames = filteredGames.filter((game) => {
    return game.rating >= ratingFrom && game.rating <= ratingTo;
  });

  // TRIN 5: Sortering
  if (sortValue === "title") {
    filteredGames.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "playtime") {
    filteredGames.sort((a, b) => parseInt(a.playtime) - parseInt(b.playtime)); // Kortest først
  } else if (sortValue === "rating") {
    filteredGames.sort((a, b) => b.rating - a.rating);
  }

  console.log(`✅ Viser ${filteredGames.length} games`);
  displayGames(filteredGames);
}







// Ryd alle filtre – funktion
function clearAllFilters() {
  console.log("🗑️ Rydder alle filtre");

  // Ryd søgning og dropdown felter
  document.querySelector("#search-input").value = "";
  document.querySelector("#genre-select").value = "all";
  document.querySelector("#sort-select").value = "none";

  // Ryd de nye range felter
  document.querySelector("#playtime-from").value = "";
  document.querySelector("#playtime-to").value = "";
  document.querySelector("#rating-from").value = "";
  document.querySelector("#rating-to").value = "";

  // Kør filtrering igen (viser alle spil)
  filterGames();
}

// ===== MODAL =====

// Håndter favorit klik
function toggleFavorite(event, gameTitle) {
  event.stopPropagation(); // Forhindrer at game card også bliver klikket
  const favoriteIcon = event.target;
  
  // Toggle mellem tomt og fyldt hjerte
  if (favoriteIcon.src.includes("Favorit tomt ikon.png")) {
    favoriteIcon.src = "Images/Favorit fyldt ikon.png";
    console.log(`❤️ Tilføjet til favoritter: ${gameTitle}`);
  } else {
    favoriteIcon.src = "Images/Favorit tomt ikon.png";
    console.log(`💔 Fjernet fra favoritter: ${gameTitle}`);
  }
}

  // Vis (alle) game detaljer i modal
  // Hvilke felter har et game? (Se JSON strukturen)

function showGameModal(game) {
  console.log("🎭 Åbner modal for:", game.title);

  // Byg HTML struktur dynamisk
  const dialogContent = document.querySelector("#dialog-content");
  dialogContent.innerHTML = `
   <img src="${game.image}" 
      alt="Poster of ${game.title}" class="game-poster" />
   <div class="game-info">
      <h3>${game.title} <span class="game-playtime">(${game.playtime})</span></h3>
      <p class="game-genre">${game.genre}</p>   
      <p class="game-rating">⭐ ${game.rating}</p>
      <p class="game-players">${game.players.min}-${game.players.max} spillere</p>
      <p class="game-director"><strong>Difficulty:</strong> ${game.difficulty}</p>
      <p class="game-age"><strong>Age:</strong> ${game.age}+</p>
      </div>
  `;

  // Åbn modalen
  document.querySelector("#game-dialog").showModal();
}