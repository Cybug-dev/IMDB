# IMDB React Project Context

## Project purpose

Build a movie website using TMDB data with React, featuring:

- a home page with trending and top-rated movies
- a hero banner for a featured movie
- watchlist and favorites collections
- search and movie detail functionality (planned)

## Current files and flow

- `src/App.jsx`
  - manages page state: `home`, `watchlist`, `favorites`
  - holds watchlist and favorites state
- `src/pages/Home/HomePage.jsx`
  - fetches TMDB data: trending, top rated, genres, movie details
  - prepares `heroMovie` and sections
- `src/services/tmdb.js`
  - API wrapper using `VITE_API_TOKEN`
  - fetches trending, top rated, genres, movie details
- `src/pages/Home/HeroBanner.jsx`
  - shows the hero movie data and CTA buttons
- `src/pages/Home/FeatureMovies.jsx`
  - displays sections of movie cards
- `src/pages/Home/MovieCard.jsx`
  - renders each movie tile and watchlist/favorite buttons
- `src/pages/Collection/CollectionPage.jsx`
  - renders saved watchlist or favorites lists

## Key project requirements

- Local TMDB API token in `.env` as `VITE_API_TOKEN`
- `npm install` and `npm run dev` to run locally
- `Continue` with local Ollama model configured for workspace-aware help

## Best AI workflow for this project

1. Open one file at a time in VS Code.
2. Ask Continue for a specific task, e.g.:
   - "What does `HomePage.jsx` do when it loads movie data?"
   - "How should I implement a search results page using `HeaderSearch.jsx`?"
3. Keep the AI focused on one feature or bug.
4. Use this note as the project summary instead of pasting the whole repo.

## Next tasks to continue development

1. Add search functionality and a search results page.
2. Add persistent storage for watchlist and favorites (`localStorage`).
3. Add a movie detail view or modal for `More Info`.
4. Improve error handling and loading states.
5. Add routing or a better page nav system.
6. Clean up hero banner button handlers and pass props correctly.

## Helpful prompt when switching AI/tools

"I am building an IMDb-style React app with a home page, watchlist, and favorites. The current file is `src/pages/Home/HomePage.jsx`, and the project uses `src/services/tmdb.js` for TMDB API calls. Help me implement one feature or debug one issue at a time."
