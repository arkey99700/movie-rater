async function cacheCollection(collectionId) {
  var collectionLength = 1;
  let tempStorage = [];

  currentCollectionId = collectionId;

  for (let i = 1; i <= collectionLength; i++) {
    try {
      await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=${collectionId}&page=${i}`, options)
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
  //movieCoverElement.style.backgroundImage = "url('img/none.png')";
  movieTitleElement.innerText = movie.nameRu;
  movieYearElement.innerText = movie.year;
  movieCoverElement.style.backgroundImage = `url(${movie.posterUrl})`;
}

function getRandomMovie() {
  const collection = JSON.parse(localStorage.movieRaterCache),
        unratedMovies = collection.filter((movie) => movie.movieRaterRating === null || !movie.hasOwnProperty("movieRaterRating"));

  if (unratedMovies.length === 0) {
    return showNoMoreMoviesPopup();
  } else {
    return unratedMovies[Math.floor(Math.random() * (unratedMovies.length))];
  }
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

  collection.forEach(function (movie) {
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

function showNoMoreMoviesPopup() {
  let popup = document.createElement("div"),
      popupText = document.createElement("p"),
      popupList = document.createElement("ul");

  menuOverlay.classList.toggle("overlay--on");
  popup.classList.add("popup");
  popupText.textContent = "Вы просмотрели все фильмы в этой коллекции, выберите другую коллекцию:";
  popupText.classList.add("popup__text");

  for (let i = 0; i < collections.length; i++) {
    let popupListLink = document.createElement("a"),
        popupListItem = document.createElement("li");

    if (currentCollectionId !== collections[i].id) popupListLink.textContent = collections[i].nameRu;

    popupListLink.addEventListener("click", function (event) {
      menuOverlay.classList.toggle("overlay--on");
      popup.style.display = "none";
      cacheCollection(collections.filter((collection) => collection.id === event.target.textContent));
      displayMovie(currentMovie = getRandomMovie());
    });

    popupListItem.classList.add("popup__list-item");
    popupListLink.classList.add("popup__list-link");
    popupListItem.appendChild(popupListLink);
    popupList.appendChild(popupListItem);
  }

  popup.appendChild(popupText);
  popup.appendChild(popupList);
  document.body.appendChild(popup);
}

const collections = [
  {
    id: "TOP_250_BEST_FILMS",
    nameRu: "250 лучших фильмов"
  }, {
    id: "TOP_100_POPULAR_FILMS",
    nameRu: "100 лучших фильмов всех времен"
  }
],
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
  movieTitleElement = document.querySelector(".movie__title"),
  movieCoverElement = document.querySelector(".movie__cover"),
  movieYearElement = document.querySelector(".movie__year"),
  overlay = document.querySelector(".overlay"),
  stars = [...document.querySelectorAll(".movie__star")],
  ratingCaptions = ["Ужасный", "Плохой", "Средний", "Хороший", "Отличный!"];

let currentMovie,
    currentCollectionId,
    debugCollection;

(async function() {
  if (!localStorage.movieRaterCache || localStorage.movieRaterCache === "undefined") await cacheCollection(collections[0].id);
  //loadUserRatings();
  displayMovie(currentMovie = getRandomMovie());
})();

menuButton.addEventListener("click", () => {
  menu.classList.toggle("header__menu--open");
  menuOverlay.classList.toggle("overlay--on");
  if (showRatingsButton.dataset.state === "1") {
    showRatingsButton.dataset.state = "0";
    ratingsList.style.display = "none";
  }
});
stars.forEach(star => star.addEventListener("click", function (event) {
  rateMovie(event.target.dataset.value);
  displayMovie(currentMovie = getRandomMovie());
}));
stars.forEach(star => star.addEventListener("mouseleave", function () {
  for (let i = 0; i < stars.length; i++) {
    stars[i].style.fill = "black";
  }
  movieScore.textContent = "Не смотрел(а)";
}));
stars.forEach(star => star.addEventListener("mouseenter", function () {
  for (var i = 0; i < event.target.dataset.value; i++) {
    stars[i].style.fill = "#FFB800";
  }
  movieScore.textContent = ratingCaptions[i - 1];
}));
movieScore.addEventListener("click", function () {
  displayMovie(currentMovie = getRandomMovie());
});
overlay.addEventListener("click", () => menuButton.dispatchEvent(new Event("click")));
clearHistoryButton.addEventListener("click", function (event) {
  event.preventDefault();
  clearHistory();
});
showRatingsButton.addEventListener("click", function (event) {
  event.preventDefault();
  if (event.target.dataset.state === "0") {
    ratingsList.style.display = "flex";
    event.target.dataset.state = "1";
  } else {
    ratingsList.style.display = "none";
    event.target.dataset.state = "0";
  };
})