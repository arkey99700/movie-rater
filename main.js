async function cacheCollection(collectionName) {
  var collectionLength = 1;
  let tempStorage = [];

  for (let i = 1; i <= collectionLength; i++) {
    try {
      await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=${collectionName}&page=${i}`, options)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(`${response.status} ${response.statusText}`);
        })
        .then(response => {
          if (collectionLength !== response.pagesCount) collectionLength = response.pagesCount;
            tempStorage.push(response.films);
        });
     } catch (error) {
     	console.log(error);
     }
  }
  localStorage.setItem("movieRaterCache", JSON.stringify(tempStorage.flat(1)));
}

function displayMovie(movie) {
  const movieTitleElement = document.querySelector(".movie__title"),
        movieCoverElement = document.querySelector(".movie__cover"),
        movieYearElement = document.querySelector(".movie__year");

  movieCoverElement.src = "img/none.png"
  movieTitleElement.innerText = movie.nameRu;
  movieYearElement.innerText = movie.year;
  movieCoverElement.src = movie.posterUrl;
}

function getRandomMovie() {
		const collection = JSON.parse(localStorage.movieRaterCache);
		let result;
    
    do {
    	result = collection[Math.floor(Math.random() * (collection.length + 1))];
    } while (result.movieRaterRating);

    return result;
}

function rateMovie(rating) {
  const collection = JSON.parse(localStorage.movieRaterCache),
  		  movieId = currentMovie.filmId;

  currentMovie.movieRaterRating = rating;
  collection[collection.map((movie) => movie.filmId).indexOf(movieId)].movieRaterRating = rating;
  localStorage.setItem("movieRaterCache", JSON.stringify(collection));
  addToUserRatings(currentMovie);
}

function clearHistory() {
  const collection = JSON.parse(localStorage.movieRaterCache);

  for (let i = 0; i < collection.length; i++) {
    collection[i].movieRaterRating = null;
  };

  localStorage.setItem("movieRaterCache", JSON.stringify(collection));
  ratingsList.innerHTML = "";
  menuButton.dispatchEvent(new Event("click"));
}

function loadUserRatings() {
    const collection = JSON.parse(localStorage.movieRaterCache);
    let ratedMovies = [];

    collection.forEach(function(movie) {
      if (movie.movieRaterRating) {
        ratedMovies.push(movie);
      };
    });

    ratedMovies.forEach((movie) => addToUserRatings(movie));
}

function addToUserRatings(movie) {
    let movieItem = document.createElement("div"),
        movieItemImg = document.createElement("div"),
        movieItemRating = document.createElement("div"),
        movieItemName = document.createElement("span");

    movieItem.classList.add("header__ratings-item");
    movieItemImg.classList.add("header__ratings-img");
    movieItemName.classList.add("header__ratings-name");
    movieItemRating.classList.add("header__ratings-score");
    movieItemImg.style.backgroundImage = `url(${movie.posterUrl})`;
    movieItemName.textContent = movie.nameRu;
    movieItemRating.innerHTML = "⭐".repeat(+movie.movieRaterRating);
    movieItem.appendChild(movieItemImg);
    movieItem.appendChild(movieItemRating);
    movieItem.appendChild(movieItemName);
    ratingsList.appendChild(movieItem);
}

const collections = ["TOP_250_BEST_FILMS", "TOP_100_POPULAR_FILMS"/*, "TOP_AWAIT_FILMS"*/],
      options = {
        method: 'GET',
        headers: {
          'X-API-KEY': '151451fe-e8fe-4c03-8157-f855dd4061d3',
          'Content-Type': 'application/json',
        },
      },
    clearHistoryButton = document.querySelector(".header__menu-item--clear"),
    showRatingsButton = document.querySelector(".header__menu-item--ratings"),
    ratingsList = document.querySelector(".header__ratings"),
    menuButton = document.querySelector(".header__hamburger"),
    menu = document.querySelector(".header__menu"),
    menuOverlay = document.querySelector(".overlay"),
    movieScore = document.querySelector(".movie__score"),
    overlay = document.querySelector(".overlay");
    stars = [...document.querySelectorAll(".movie__star")],
    ratingCaptions = ["Ужасный", "Плохой", "Средний", "Хороший", "Отличный!"];
let currentMovie;

if (!localStorage.movieRaterCache) cacheCollection(collections[0]);

menuButton.addEventListener("click", () => {
  menu.classList.toggle("header__menu--open");
  menuOverlay.classList.toggle("overlay--on");
  if (showRatingsButton.dataset.state === "1") {
    showRatingsButton.dataset.state = "0";
    ratingsList.style.display = "none";
  }
});
stars.forEach(star => star.addEventListener("click", function(event) {
  rateMovie(event.target.dataset.value);
  displayMovie(currentMovie = getRandomMovie());
}));
stars.forEach(star => star.addEventListener("mouseleave", function() {
  for (let i = 0; i < stars.length; i++) {
    stars[i].style.fill = "black";
  }
  movieScore.textContent = "Не смотрел(а)";
}));
stars.forEach(star => star.addEventListener("mouseenter", function() {
  for (var i = 0; i < event.target.dataset.value; i++) {
    stars[i].style.fill = "#FFB800";
  }
  movieScore.textContent = ratingCaptions[i - 1];
}));
movieScore.addEventListener("click", function() {
  displayMovie(currentMovie = getRandomMovie());
});
overlay.addEventListener("click", () => menuButton.dispatchEvent(new Event("click")));
clearHistoryButton.addEventListener("click", function(event) {
  event.preventDefault();
  clearHistory();
});
showRatingsButton.addEventListener("click", function(event) {
  event.preventDefault();
  if (event.target.dataset.state === "0") {
    ratingsList.style.display = "flex";
    event.target.dataset.state = "1";
  } else {
    ratingsList.style.display = "none";
    event.target.dataset.state = "0";
  };
})

loadUserRatings();
displayMovie(currentMovie = getRandomMovie());
