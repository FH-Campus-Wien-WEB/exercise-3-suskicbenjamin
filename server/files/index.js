import { ElementBuilder, ParentChildBuilder } from "./builders.js";

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

function appendMovie(movie, element) {
  new ElementBuilder("article").id(movie.imdbID)
    .append(new ElementBuilder("img").with("src", movie.poster))
    .append(new ElementBuilder("h1").text(movie.title))
    .append(new ElementBuilder("p")
      .append(new ElementBuilder("button").text("Edit")
        .listener("click", () => location.href = "edit.html?imdbID=" + movie.imdbID)))
    .append(new ParagraphBuilder().items(
      "Runtime " + formatRuntime(movie.runtime),
      "\u2022",
      "Released on " +
      new Date(movie.released).toLocaleDateString("en-US")))
    .append(
      new ParagraphBuilder()
      .childClass("genre")
      .class("genres")
      .items(movie.genres))
    .append(new ElementBuilder("p").text(movie.plot))
    .append(new ElementBuilder("h2").pluralizedText("Director", movie.directors))
    .append(new ListBuilder().items(movie.directors))
    .append(new ElementBuilder("h2").pluralizedText("Writer", movie.writers))
    .append(new ListBuilder().items(movie.writers))
    .append(new ElementBuilder("h2").pluralizedText("Actor", movie.actors))
    .append(new ListBuilder().items(movie.actors))
    .appendTo(element);
}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const mainElement = document.querySelector("main");

    while (mainElement.childElementCount > 0) {
      mainElement.firstChild.remove()
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText)
      for (const movie of movies) {
        appendMovie(movie, mainElement)
      }
    } else {
      mainElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  }

  const url = new URL("/movies", location.href)
  /* Task 1.4. Add query parameter to the url if a genre is given */
  if (genre) {
    url.searchParams.append("genre", genre);
  }

  xhr.open("GET", url)
  xhr.send()
}

window.onload = function () {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const listElement = document.querySelector("nav>ul");

    if (xhr.status === 200) {
      /* Task 1.3. Add the genre buttons to the listElement and 
         initialize them with a click handler that calls the 
         loadMovies(...) function above. */
      const genres = JSON.parse(xhr.responseText);

      // "All" button first
      const allButton = document.createElement("button");
      allButton.textContent = "All";
      allButton.addEventListener("click", function () {
        loadMovies();
      });
      listElement.appendChild(allButton);

      // Genre buttons
      for (let i = 0; i < genres.length; i++) {
        const button = document.createElement("button");
        button.textContent = genres[i];

        button.addEventListener("click", function () {
          loadMovies(genres[i]);
        });

        listElement.appendChild(button);
      }

      /* When a first button exists, we click it to load all movies. */
      const firstButton = document.querySelector("nav button");
      if (firstButton) {
        firstButton.click();
      }
    } else {
      document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };
  xhr.open("GET", "/genres");
  xhr.send();
};
