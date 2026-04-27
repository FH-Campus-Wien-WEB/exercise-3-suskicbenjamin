const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const movieModel = require('./movie-model.js');

const app = express();

// Parse urlencoded bodies
app.use(bodyParser.json());

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, 'files')));

/* Task 1.2: Add a GET /genres endpoint:
   This endpoint returns a sorted array of all the genres of the movies
   that are currently in the movie model.
*/
app.get("/genres", (req, res) => {
  const genresSet = new Set();

  const movies = Object.values(movieModel);

  movies.forEach(movie => {
    movie.genres.forEach(genre => {
      genresSet.add(genre);
    });
  });

  const genres = Array.from(genresSet).sort();

  res.json(genres);
});

/* Task 1.4: Extend the GET /movies endpoint:
   When a query parameter for a specific genre is given, 
   return only movies that have the given genre
 */
app.get('/movies', function (req, res) {
  const genre = req.query.genre;

  let movies = Object.values(movieModel);

  if (genre) {
    const filtered = [];

    for (let i = 0; i < movies.length; i++) {
      if (movies[i].genres.includes(genre)) {
        filtered.push(movies[i]);
      }
    }

    movies = filtered;
  }

  res.json(movies);
});

// Configure a 'get' endpoint for a specific movie
app.get('/movies/:imdbID', (req, res) => {
  const imdbID = req.params.imdbID;

  const movie = movieModel[imdbID];

  if (movie) {
    res.json(movie);
  } else {
    res.sendStatus(404);
  }
});


app.put('/movies/:imdbID', function (req, res) {
  const imdbID = req.params.imdbID;
  const movie = req.body;

  if (movieModel[imdbID]) {
    movieModel[imdbID] = movie;
    res.sendStatus(200);
  } else {
    movieModel[imdbID] = movie;
    res.status(201).json(movie);
  }
});

app.listen(3000)

console.log("Server now listening on http://localhost:3000/")
