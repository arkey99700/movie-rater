//Function to cache the content of the collection to reduce the number of API requests
async function cacheCollection(collectionName) { 
    var collectionLength;
    let tempStorage = [];
  
    for (let i = 1; i <= collectionLength || 1; i++) {
        await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=${collectionName}&page=${i}`, reqOptions)
            .then(response => response.json())
            .then(response => {
            if (collectionLength !== response.pagesCount) collectionLength = response.pagesCount;
            tempStorage.push(response.films);
        });
    }
  
    localStorage.setItem(collectionName, JSON.stringify(tempStorage));
}
  
  //Main function to show movie title and cover image
async function displayRandomMovie(collectionName) {
    if (!localStorage[collectionName]) await cacheCollection(collectionName);
  
    function changeMovieCoverUrl(movie) {
        fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${movie.filmId}/images?type=COVER&page=1`, reqOptions)
            .then(response => response.json())
            .then(response => movieCoverPath.src = response.items[0].imageUrl);
    }
    
    function getRandomMovie(collection) {
        let result;
      
        do {
            result = collection[Math.floor(Math.random() * (collection.length + 1))];
        } while (result in JSON.parse(localStorage.movieRates));
  
        return result;
    }
  
    const collection = JSON.parse(localStorage[collectionName]).flat(1),
          randomMovie = getRandomMovie(collection);
  
    changeMovieCoverUrl(randomMovie);
    movieTitle.innerText = randomMovie.nameRu;
  }
  
const collections = ["TOP_250_BEST_FILMS", "TOP_100_POPULAR_FILMS" /*, "TOP_AWAIT_FILMS"*/ ], //List of available movie collections
    movieTitle = document.querySelector(".movie__title"),
    movieCoverPath = document.querySelector(".movie__cover"),
    reqOptions = {
        method: 'GET',
        headers: {
            'X-API-KEY': '151451fe-e8fe-4c03-8157-f855dd4061d3',
            'Content-Type': 'application/json',
        },
    }; //Options for fetch requests
  
if (!localStorage.movieRates) localStorage.setItem("movieRates", "[]");
  
displayRandomMovie(collections[0]);
  