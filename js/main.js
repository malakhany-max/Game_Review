const APILink = "https://www.freetogame.com/api/games";      //all games
const detailsUrl = "https://www.freetogame.com/api/game";   //details game by id
const loading = document.getElementById("loading");
const categoriesList = document.getElementById("categories-list");
const gamesContainer = document.getElementById("gamesContainer");
const detailsSection = document.getElementById("detailsSection");
const searchInput = document.getElementById("searchInput");
const gameDetails = document.getElementById("gameDetails");
const reviewBack = document.getElementById("reviewBack");
const sort = document.getElementById("sort");
const platform = document.getElementById("platform");
const resetBtn = document.getElementById("resetBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const homeBtn = document.getElementById("homeBtn");
let searchData;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];   // arr of all fav
async function getGames() {
    loading.classList.remove("d-none");
    try {
        let response = await fetch(APILink);
        let data = await response.json();
        displayGames(data);
        displayCategories(data);
        loading.classList.add("d-none");
    } catch (error) {
        console.log(error);
        loading.classList.add("d-none");
    }
}
getGames();
async function displayCategories(data) {
    let categories = {};
    data.forEach(game => {
        if (game.genre) {
            categories[game.genre] = (categories[game.genre] || 0) + 1;
        }
    });
    let box = `<li data-category="all" class="active">All</li>`;
    for (let category in categories) {
        box += `<li data-category="${category}">
                    ${category} <span>${categories[category]}</span>
                </li>`;
    }
    categoriesList.innerHTML = box;
    addCategoryEvents();
}
function displayGames(games) {
    let box = "";
    for (let i = 0; i < games.length; i++) {
        box += `<div class="col-lg-3 col-md-4 col-sm-6">
                    <div class="game-card">
                        <div class="card-image">
                            <img src="${games[i].thumbnail || 'images/default.jpg'}">
                        </div>
                        <div class="card-body">
                            <div class="game-title">
                                <h3>${games[i].title}</h3>
                                <i class="fa-${favorites.some(f => f.id === games[i].id) ? "solid fav-active" : "regular"} fa-heart fav-btn"
                                onclick="addFavorite(${games[i].id})"></i>
                            </div>
                            <p class="game-desc">
                                ${games[i].short_description}
                            </p>
                            <div class="game-info">
                                <span>${games[i].genre}</span>
                                <span>${games[i].platform}</span>
                            </div>
                            <div class="status">
                                <span>${games[i].publisher}</span>
                            </div>
                            <button class="review-btn" onclick="getGameDetails(${games[i].id})">
                                Review
                            </button>
                        </div>
                    </div>
                </div>`;
    }
    console.log(games);
    gamesContainer.innerHTML = box;
    let categories = {};
    games.forEach(game => {
        if (categories[game.genre]) {
            categories[game.genre]++;
        } else {
            categories[game.genre] = 1;
        }
    });
    console.log(categories);
}
async function getGameDetails(id) {
    loading.classList.remove("d-none");
    try {
        let response = await fetch(`${detailsUrl}?id=${id}`);
        let game = await response.json();
        displayGameDetails(game);
        document.querySelector(".games").classList.add("d-none");
        detailsSection.classList.remove("d-none");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        reviewBack.classList.remove("d-none");
        loading.classList.add("d-none");
    }
    catch (error) {
        console.log(error);
        loading.classList.add("d-none");
    }
}
function displayGameDetails(game) {
    gameDetails.innerHTML = `<div class="container">
            <div class="details-header">
                <h2>Game Review</h2>
            </div>
            <div class="details-card row align-items-center g-5">
                <div class="col-lg-4">
                    <img src="${game.thumbnail}" class="img-fluid rounded-4 w-100" alt="${game.title}">
                </div>
                <div class="col-lg-8">
                    <h2 class="mb-3">${game.title}</h2>
                    <p class="mb-4">${game.description}</p>
                    <div class="details-info">
                        <p><strong>Genre :</strong> ${game.genre}</p>
                        <p><strong>Platform :</strong> ${game.platform}</p>
                        <p><strong>Status :</strong> ${game.status}</p>
                        <p><strong>Publisher :</strong> ${game.publisher}</p>
                        <p><strong>Developer :</strong> ${game.developer}</p>
                        <p><strong>Release Date :</strong> ${game.release_date}</p>
                        <a href="${game.game_url}" target="_blank" class="show-game">
                            Show Game
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
}
function backToGames() {
    detailsSection.classList.add("d-none");
    document.querySelector(".games").classList.remove("d-none");
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    reviewBack.classList.add("d-none");
}
searchInput.addEventListener("input", async function () {
    let value = searchInput.value.toLowerCase().trim();
    if (value === "") {
        getGames();
        return;
    }
    let response = await fetch(APILink);
    let searchData = await response.json();
    let result = searchData.filter(game =>
        game.title.toLowerCase().includes(value)
    );
    if (result.length === 0) {
        gamesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h2>No Results Found 😢</h2>
                <p>There is no game with this name.</p>
            </div>`;
        return;
    }
    displayGames(result);
});
platform.addEventListener("change", getPlatformGames);
async function getPlatformGames() {
    loading.classList.remove("d-none");
    try {
        let url = APILink;
        if (platform.value !== "all") {
            url += `?platform=${platform.value}`;
        }
        let response = await fetch(url);
        let searchData = await response.json();
        displayGames(searchData);
    } catch (error) {
        console.log(error);
    }
    loading.classList.add("d-none");
}
sort.addEventListener("change", sortGames);
async function sortGames() {
    let value = sort.value;
    if (value === "") {
        getGames();
        return;
    }
    if (
        value === "release-date" ||
        value === "popularity" ||
        value === "alphabetical"
    ) {
        let response = await fetch(`${APILink}?sort-by=${value}`);
        let data = await response.json();
        displayGames(data);
    }
    else {
        let response = await fetch(APILink);
        let data = await response.json();
        if (value === "oldest") {
            data.sort(function (a, b) {
                return new Date(a.release_date) - new Date(b.release_date);
            });
        }
        else if (value === "desc") {
            data.sort(function (a, b) {
                return b.title.localeCompare(a.title);
            });
        }
        displayGames(data);
    }
}
resetBtn.addEventListener("click", resetFilters);
function resetFilters() {
    searchInput.value = "";
    sort.value = "";
    platform.value = "all";
    getGames();
}
async function addFavorite(id) {
    let index = favorites.findIndex(game => game.id === id);
    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        let response = await fetch(`${detailsUrl}?id=${id}`);
        let game = await response.json();
        favorites.push(game);
    }
    saveFavorites();
    if (!document.querySelector(".games").classList.contains("d-none") &&
        document.getElementById("favoritesBtn").classList.contains("active")) {
        displayGames(favorites);
    } else {
        getGames();
    }
}
favoritesBtn.addEventListener("click", function () {
    changeActive(this);
    if (favorites.length === 0) {
        gamesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h2>No Favorites ❤️</h2>
                <p>You haven't added any favorite games yet.</p>
            </div>`;
        return;
    }
    displayGames(favorites);
});
function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}
homeBtn.addEventListener("click", function () {
    changeActive(this);
    getGames();
});
function changeActive(element) {
    document.querySelectorAll(".sidebar li")
        .forEach(item => item.classList.remove("active"));
    element.classList.add("active");
}
function addCategoryEvents() {
    document.querySelectorAll("#categories-list li")
        .forEach(category => {
            category.addEventListener("click", async function () {
                document.querySelectorAll("#categories-list li")
                    .forEach(item => item.classList.remove("active"));
                this.classList.add("active");
                let value = this.dataset.category;
                let response = await fetch(APILink);
                let data = await response.json();
                if (value !== "all") {
                    data = data.filter(game =>
                        game.genre === value);
                }
                displayGames(data);
            });
        });
}