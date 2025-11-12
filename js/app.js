"use strict"; // Aktiverer strict mode - hjælper med at fange fejl

// Start app når DOM er loaded (hele HTML siden er færdig)
document.addEventListener("DOMContentLoaded", initApp);

// ===== GLOBALE VARIABLER =====
let allGames = []; 

// ===== INITIALISERING =====
function initApp() {
  console.log("initApp: app.js is running 🎉");
  getGames();
  
  // Header søgefelt og filtre
  document
    .querySelector("#header-search-input")
    .addEventListener("input", filterGames);
  document
    .querySelector("#header-genre-select")
    .addEventListener("change", filterGames);
  document
    .querySelector("#header-sort-select")
    .addEventListener("change", filterGames);

  // Playtime felter
  document.querySelector("#header-playtime-from").addEventListener("input", filterGames);
  document.querySelector("#header-playtime-to").addEventListener("input", filterGames);

  // Rating felter
  document.querySelector("#header-rating-from").addEventListener("input", filterGames);
  document.querySelector("#header-rating-to").addEventListener("input", filterGames);

  // Location dropdown (nu udenfor filter panel)
  document
    .querySelector("#location-select")
    .addEventListener("change", filterGames);

  // Clear filters knap
  document
    .querySelector("#header-clear-filters")
    .addEventListener("click", clearAllFilters);

  // Filter panel toggle functionality
  initFilterPanel();
}

// Filter panel functionality
function initFilterPanel() {
  const filterToggle = document.querySelector("#filter-toggle");
  const filterPanel = document.querySelector("#filter-panel");
  const filterClose = document.querySelector("#filter-close");
  const filterBadge = document.querySelector("#filter-badge");

  // Toggle filter panel
  filterToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = filterPanel.classList.contains("open");
    
    if (isOpen) {
      closeFilterPanel();
    } else {
      openFilterPanel();
    }
  });

  // Close filter panel
  filterClose.addEventListener("click", closeFilterPanel);

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!filterPanel.contains(e.target) && !filterToggle.contains(e.target)) {
      closeFilterPanel();
    }
  });

  // Prevent panel close when clicking inside
  filterPanel.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  function openFilterPanel() {
    filterPanel.classList.add("open");
    filterToggle.classList.add("active");
  }

  function closeFilterPanel() {
    filterPanel.classList.remove("open");
    filterToggle.classList.remove("active");
  }

  // Update filter badge count
  function updateFilterBadge() {
    let activeFilters = 0;
    
    // Check search
    if (document.querySelector("#header-search-input").value.trim()) activeFilters++;
    
    // Check dropdowns (location er nu separat)
    if (document.querySelector("#location-select").value !== "all") activeFilters++;
    if (document.querySelector("#header-genre-select").value !== "all") activeFilters++;
    if (document.querySelector("#header-sort-select").value !== "none") activeFilters++;
    
    // Check number inputs
    if (document.querySelector("#header-playtime-from").value) activeFilters++;
    if (document.querySelector("#header-playtime-to").value) activeFilters++;
    if (document.querySelector("#header-rating-from").value) activeFilters++;
    if (document.querySelector("#header-rating-to").value) activeFilters++;
    
    if (activeFilters > 0) {
      filterBadge.style.display = "flex";
      filterBadge.textContent = activeFilters;
    } else {
      filterBadge.style.display = "none";
    }
  }

  // Add event listeners to all filter inputs to update badge
  const filterInputs = [
    "#header-search-input",
    "#location-select", // Nu separat element
    "#header-genre-select",
    "#header-sort-select",
    "#header-playtime-from",
    "#header-playtime-to", 
    "#header-rating-from",
    "#header-rating-to"
  ];

  filterInputs.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener("input", updateFilterBadge);
      element.addEventListener("change", updateFilterBadge);
    }
  });

  // Expose updateFilterBadge globally so clearAllFilters can use it
  window.updateFilterBadge = updateFilterBadge;
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
  LocationDropdown(); // Udfyld dropdown med locations <-----
  displayGames(allGames);
  populateCarousel(); // Tilføj top-rated games til karrussel
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

// Vis ÉT game card til game list
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
  const genreSelect = document.querySelector("#header-genre-select");
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

// Dropdownmenu med byer
function LocationDropdown() {
  const locationSelect = document.querySelector("#location-select");
  const location = new Set();

  for (const game of allGames) {
    location.add(game.location);
  }

  // Fjern gamle options undtagen 'Alle lokationer'
  locationSelect.innerHTML = '<option value="all">Alle lokationer</option>';

  const sortedLocation = Array.from(location).sort();
  for (const location of sortedLocation) {
    locationSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${location}">${location}</option>`
    );
  }
}


function filterGames() {
  // Filtrer games baseret på søgning, genre, playtime, ovs.
  // OBS: game.genre skal sammenlignes med === (ikke .includes())

  const searchValue = document.querySelector("#header-search-input").value.toLowerCase();
  const genreValue = document.querySelector("#header-genre-select").value;
  const sortValue = document.querySelector("#header-sort-select").value;
  const locationValue = document.querySelector("#location-select").value;

  // Playtime variable - fra header
  const playtimeFrom = Number(document.querySelector("#header-playtime-from").value) || 0;
  const playtimeTo = Number(document.querySelector("#header-playtime-to").value) || 9999;

  // Rating variable - fra header
  const ratingFrom = Number(document.querySelector("#header-rating-from").value) || 0;
  const ratingTo = Number(document.querySelector("#header-rating-to").value) || 10;

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

  // TRIN 3: Filter på location (fra dropdown)
  if (locationValue !== "all") {
    filteredGames = filteredGames.filter((game) => {
      return game.location === locationValue;
    });
  }

  // TRIN 4: Playtime filter
  if (playtimeFrom > 0 || playtimeTo < 9999) {
    filteredGames = filteredGames.filter((game) => {
      // Antag at game.playtime er i minutter (f.eks. "30-60" eller "45")
      const playtime = parseInt(game.playtime); // Tag første nummer
      return playtime >= playtimeFrom && playtime <= playtimeTo;
    });
  }

  // TRIN 5: Rating filter
  filteredGames = filteredGames.filter((game) => {
    return game.rating >= ratingFrom && game.rating <= ratingTo;
  });

  // TRIN 6: Sortering
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

  // Ryd søgning og dropdown felter - header version
  document.querySelector("#header-search-input").value = "";
  document.querySelector("#header-genre-select").value = "all";
  document.querySelector("#location-select").value = "all";
  document.querySelector("#header-sort-select").value = "none";

  // Ryd de nye range felter - header version
  document.querySelector("#header-playtime-from").value = "";
  document.querySelector("#header-playtime-to").value = "";
  document.querySelector("#header-rating-from").value = "";
  document.querySelector("#header-rating-to").value = "";

  // Opdater filter badge
  if (window.updateFilterBadge) {
    window.updateFilterBadge();
  }

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

// ==== KARUSSEL ====

let currentCarouselIndex = 0;
let carouselGames = [];
let startX = 0;
let currentX = 0;
let isDragging = false;

// Populate karrussel med top-rated games (infinite loop)
function populateCarousel() {
  // Sortér games efter rating og tag de 10 bedste
  carouselGames = allGames
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
  
  // Ryd karrussel
  document.querySelector("#game-carousel").innerHTML = "";
  
  // Tilføj games til karrussel med duplicates for infinite effect
  createInfiniteCarousel();
  
  // Start i midten af den udvidede array
  currentCarouselIndex = carouselGames.length;
  
  // Tilføj click events til karrussel cards
  addCarouselClickEvents();
  
  // Tilføj swipe events
  addSwipeEvents();
  
  // Sæt initial fokus
  updateCarouselPosition();
}

// Opret uendelig karrussel med duplicate kort
function createInfiniteCarousel() {
  const carousel = document.querySelector("#game-carousel");
  
  // Opret extended array: [copies, original, copies]
  const extendedGames = [
    ...carouselGames, // Copies til venstre
    ...carouselGames, // Original games
    ...carouselGames  // Copies til højre
  ];
  
  // Tilføj alle kort til DOM
  for (let i = 0; i < extendedGames.length; i++) {
    const game = extendedGames[i];
    const gameHTML = `
      <article class="game-card" data-index="${i}" data-original-index="${i % carouselGames.length}">
          <img src="${game.image}" alt="Poster of ${game.title}" class="game-poster"/>
      <div class="game-title">
          <h3>${game.title}</h3>
      </div>
      </article>
    `;
    carousel.insertAdjacentHTML("beforeend", gameHTML);
  }
}

// Gå til specifik slide
function goToSlide(index) {
  currentCarouselIndex = index;
  updateCarouselPosition();
}

// Navigation state for at forhindre spam-clicks
let isNavigating = false;

// Næste slide (fixed infinite)
function nextSlide() {
  // Forhindre spam-swipes
  if (isNavigating) return;
  isNavigating = true;
  
  currentCarouselIndex++;
  
  updateCarouselPosition();
  
  // Seamless reset når vi når enden af det andet sæt
  if (currentCarouselIndex >= carouselGames.length * 2) {
    setTimeout(() => {
      const carousel = document.querySelector("#game-carousel");
      carousel.style.transition = 'none';
      currentCarouselIndex = carouselGames.length;
      updateCarouselPosition();
      setTimeout(() => {
        carousel.style.transition = 'transform 0.5s ease';
        isNavigating = false; // Tillad næste navigation
      }, 10);
    }, 500);
  } else {
    // Normal navigation - tillad næste swipe efter transition
    setTimeout(() => {
      isNavigating = false;
    }, 300);
  }
}

// Forrige slide (fixed infinite)
function prevSlide() {
  // Forhindre spam-swipes
  if (isNavigating) return;
  isNavigating = true;
  
  currentCarouselIndex--;
  
  updateCarouselPosition();
  
  // Seamless reset når vi når starten af det første sæt
  if (currentCarouselIndex < carouselGames.length) {
    setTimeout(() => {
      const carousel = document.querySelector("#game-carousel");
      carousel.style.transition = 'none';
      currentCarouselIndex = carouselGames.length * 2 - 1;
      updateCarouselPosition();
      setTimeout(() => {
        carousel.style.transition = 'transform 0.5s ease';
        isNavigating = false; // Tillad næste navigation
      }, 10);
    }, 500);
  } else {
    // Normal navigation - tillad næste swipe efter transition
    setTimeout(() => {
      isNavigating = false;
    }, 300);
  }
}

// Opdater karrussel position og fokus (symmetrisk layout)
function updateCarouselPosition() {
  const carousel = document.querySelector("#game-carousel");
  const cards = document.querySelectorAll("#game-carousel .game-card");
  
  // Præcise målinger for symmetrisk layout
  const cardWidth = 180; // kort bredde (normal størrelse)
  const cardGap = 24; // 1.5rem gap mellem kort
  const totalCardWidth = cardWidth + cardGap;
  
  const containerWidth = carousel.parentElement.offsetWidth;
  
  // Perfekt centrering for symmetrisk visning
  const centerPosition = containerWidth / 2 - cardWidth / 2;
  let offset = centerPosition - (currentCarouselIndex * totalCardWidth);
  
  carousel.style.transform = `translateX(${offset}px)`;
  
  // Opdater fokus classes for infinite carousel
  cards.forEach((card, index) => {
    card.classList.remove("center", "adjacent");
    
    // Find hvilket kort vi faktisk fokuserer på (modulo operation for infinite)
    const actualIndex = currentCarouselIndex % carouselGames.length;
    const cardIndex = index % carouselGames.length;
    
    if (cardIndex === actualIndex) {
      card.classList.add("center");
    } else if (
      cardIndex === (actualIndex - 1 + carouselGames.length) % carouselGames.length ||
      cardIndex === (actualIndex + 1) % carouselGames.length
    ) {
      card.classList.add("adjacent");
    }
  });
}

// Tilføj swipe events
function addSwipeEvents() {
  const carousel = document.querySelector("#game-carousel");
  const container = document.querySelector(".carousel-container");
  
  // Touch events
  container.addEventListener("touchstart", handleTouchStart, { passive: false });
  container.addEventListener("touchmove", handleTouchMove, { passive: false });
  container.addEventListener("touchend", handleTouchEnd);
  
  // Mouse events for desktop
  container.addEventListener("mousedown", handleMouseStart);
  container.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("mouseup", handleMouseEnd);
  container.addEventListener("mouseleave", handleMouseEnd);
}

function handleTouchStart(e) {
  startX = e.touches[0].clientX;
  isDragging = true;
  document.querySelector("#game-carousel").classList.add("dragging");
}

function handleTouchMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  currentX = e.touches[0].clientX;
  
  // Begræns swipe feedback til maksimalt ét kort
  const carousel = document.querySelector("#game-carousel");
  const diffX = startX - currentX;
  
  // Samme centrering som updateCarouselPosition
  const cardWidth = 180;
  const cardGap = 24;
  const totalCardWidth = cardWidth + cardGap;
  const containerWidth = carousel.parentElement.offsetWidth;
  const centerPosition = containerWidth / 2 - cardWidth / 2;
  
  let baseOffset = centerPosition - (currentCarouselIndex * totalCardWidth);
  
  // Begræns drag til maksimalt 80% af et kort i hver retning
  const maxDrag = totalCardWidth * 0.8;
  let dragOffset = Math.max(-maxDrag, Math.min(maxDrag, diffX * -0.3));
  
  carousel.style.transform = `translateX(${baseOffset + dragOffset}px)`;
}

function handleTouchEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  
  const carousel = document.querySelector("#game-carousel");
  carousel.classList.remove("dragging");
  
  const diffX = startX - currentX;
  const threshold = 50; // Øget threshold for mere præcis control
  
  // Kun tillad ét kort ad gangen - ingen multi-swipes
  if (Math.abs(diffX) > threshold && !isNavigating) {
    if (diffX > 0) {
      // Swipe til venstre = næste kort (kun ét)
      nextSlide();
    } else {
      // Swipe til højre = forrige kort (kun ét)
      prevSlide();
    }
  } else {
    // Snap tilbage til current position hvis ikke nok swipe
    updateCarouselPosition();
  }
  
  // Reset touch tracking
  startX = 0;
  currentX = 0;
}

function handleMouseStart(e) {
  startX = e.clientX;
  isDragging = true;
  document.querySelector("#game-carousel").classList.add("dragging");
  e.preventDefault();
}

function handleMouseMove(e) {
  if (!isDragging) return;
  currentX = e.clientX;
  
  // Begræns mouse feedback samme som touch
  const carousel = document.querySelector("#game-carousel");
  const diffX = startX - currentX;
  
  const cardWidth = 180;
  const cardGap = 24;
  const totalCardWidth = cardWidth + cardGap;
  const containerWidth = carousel.parentElement.offsetWidth;
  const centerPosition = containerWidth / 2 - cardWidth / 2;
  
  let baseOffset = centerPosition - (currentCarouselIndex * totalCardWidth);
  
  // Begræns drag til maksimalt 80% af et kort i hver retning
  const maxDrag = totalCardWidth * 0.8;
  let dragOffset = Math.max(-maxDrag, Math.min(maxDrag, diffX * -0.3));
  
  carousel.style.transform = `translateX(${baseOffset + dragOffset}px)`;
}

function handleMouseEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  
  const carousel = document.querySelector("#game-carousel");
  carousel.classList.remove("dragging");
  
  const diffX = startX - currentX;
  const threshold = 50; // Samme threshold som touch
  
  // Kun tillad ét kort ad gangen - ingen multi-drags
  if (Math.abs(diffX) > threshold && !isNavigating) {
    if (diffX > 0) {
      // Drag til venstre = næste kort (kun ét)
      nextSlide();
    } else {
      // Drag til højre = forrige kort (kun ét)
      prevSlide();
    }
  } else {
    // Snap tilbage til current position hvis ikke nok drag
    updateCarouselPosition();
  }
  
  // Reset mouse tracking
  startX = 0;
  currentX = 0;
}

// Tilføj click events til karrussel cards (infinite)
function addCarouselClickEvents() {
  const carouselCards = document.querySelectorAll("#game-carousel .game-card");
  carouselCards.forEach((card, index) => {
    card.addEventListener("click", function(e) {
      if (isDragging) return; // Ignorer click hvis vi swiper
      
      if (index === currentCarouselIndex) {
        // Hvis center kort klikkes, åbn modal
        const originalIndex = parseInt(card.dataset.originalIndex);
        const game = carouselGames[originalIndex];
        console.log(`🎬 Klik på karrussel: "${game.title}"`);
        showGameModal(game);
      } else {
        // Hvis ikke-center kort klikkes, gå til det kort
        goToSlide(index);
      }
    });
  });
}
