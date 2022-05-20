//Function to cache the content of the collection to reduce the number of API requests
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

//Main function to show movie title and cover image
async function displayMovie(movie) {
  function changeMovieCoverUrl() {
    try {
      fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${movie.filmId}/images?type=COVER&page=1`, options)
        .then(response => response.json())
        .then(response => {
			movieCoverElement.src = response.items[0].imageUrl;
			movieCoverElement.alt = movie.nameRu;
			}
		);
    } catch (error) {
    	console.log(error);
		}
  }
  const collection = JSON.parse(localStorage.movieRaterCache),
    	movieTitleElement = document.querySelector(".movie__title"),
      movieCoverElement = document.querySelector(".movie__cover"),
      movieYearElement = document.querySelector(".movie__year");

  changeMovieCoverUrl();
  movieTitleElement.innerText = movie.nameRu;
  movieYearElement.innerText = movie.year;
}

//Function for getting random movie from the cached collection
function getRandomMovie() {
		const collection = JSON.parse(localStorage.movieRaterCache);
		let result;
    
    do {
    	result = collection[Math.floor(Math.random() * (collection.length + 1))];
    } while (false) //collection.filter(movie => "movieRaterRating" in movie));

    return result;
}

//Function that is called when rating a movie
function rateMovie(e) {
  const collection = JSON.parse(localStorage.movieRaterCache),
  		movieId = currentMovie.kinopoiskId;
  let rating = event.target.value;

  collection[collection.findIndex(element => element.kinopoiskId === movieId)].movieRaterRating = rating;
  localStorage.setItem("movieRaterCache", JSON.stringify(collection));
}

const collections = ["TOP_250_BEST_FILMS", "TOP_100_POPULAR_FILMS" /*, "TOP_AWAIT_FILMS"*/ ], //List of available movie collections
      options = {
        method: 'GET',
        headers: {
          'X-API-KEY': '151451fe-e8fe-4c03-8157-f855dd4061d3',
          'Content-Type': 'application/json',
        },
      }, //Options for fetch requests
    menuButton = document.querySelector(".header__hamburger"),
    menu = document.querySelector(".header__menu"),
    menuOverlay = document.querySelector(".overlay"),
    movieScore = document.querySelector(".movie__score"),
    overlay = document.querySelector(".overlay");
    stars = [...document.querySelectorAll(".movie__star")],
    ratingCaptions = ["Ужасный", "Плохой", "Средний", "Хороший", "Отличный!"];
let currentMovie;

menuButton.addEventListener("click", () => {
  menu.classList.toggle("header__menu--open");
  menuOverlay.classList.toggle("overlay--on");
});
stars.forEach(star => star.addEventListener("click", (event) => rateMovie(event.target.value)));
stars.forEach(star => star.addEventListener("mouseleave", function() {
  for (let i = 0; i < stars.length; i++) {
    stars[i].style.fill = "black";
  }
  movieScore.textContent = "";
}));
stars.forEach(star => star.addEventListener("mouseenter", function() {
  for (var i = 0; i < event.target.dataset.value; i++) {
    stars[i].style.fill = "#FFB800";
  }
  movieScore.textContent = ratingCaptions[i - 1];
}))
overlay.addEventListener("click", () => menuButton.dispatchEvent(new Event("click")));

if (!localStorage.movieRaterCache) cacheCollection(collections[0]);
displayMovie(currentMovie = getRandomMovie());
//displayMovie(JSON.parse(localStorage.movieRaterCache)[0]);
