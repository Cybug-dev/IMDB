import { useState, useEffect } from "react";
import {
  fetchTrendingMovies,
  fetchTopRated,
  fetchGenres,
  fetchMovieDetails,
} from "../../services/tmdb";
import { Award, TrendingUp, Star, Sparkles } from "lucide-react";
import HeroBanner from "./HeroBanner";
import FeaturedMovies from "./FeatureMovies";

function HomePage({
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const [trendingData, topRatedData, genreList] = await Promise.all([
          fetchTrendingMovies(),
          fetchTopRated(),
          fetchGenres(),
        ]);

        const genreMap = {};
        genreList.forEach((genre) => {
          genreMap[genre.id] = genre.name;
        });

        // Attach genre names to every movie
        const enrichWithGenres = (movies) =>
          movies.map((movie) => ({
            ...movie,
            //^^^^^^
            // spread existing movie data, then override genre_ids
            // with a resolved genres array
            genres: (movie.genre_ids ?? [])
              .map((id) => ({ id, 
            // If genreMap[id] is null or undefined, use 'Unknown'
                name: genreMap[id] ?? "Unknown",
               })),
          }));

        const enrichedTrending = enrichWithGenres(trendingData);
        const enrichedTopRated = enrichWithGenres(topRatedData);

        // Fetch additional details for runtime and director
        const enrichWithDetails = async (movies) => {
          const detailedMovies = await Promise.all(
            movies.map(async (movie) => {
              try {
                const details = await fetchMovieDetails(movie.id);
                const director = details.credits?.crew?.find(
                  (person) => person.job === "Director",
                )?.name;
                return {
                  ...movie,
                  runtime: details.runtime,
                  director,
                };
              } catch (error) {
                console.warn(
                  `Failed to fetch details for movie ${movie.id}:`,
                  error,
                );
                return movie;
              }
            }),
          );
          return detailedMovies;
        };

        const detailedTrending = await enrichWithDetails(enrichedTrending);
        const detailedTopRated = await enrichWithDetails(enrichedTopRated);

        setTrending(detailedTrending);
        setTopRated(detailedTopRated);
        setHeroMovies(detailedTrending.slice(0, 5));
      } catch (loadError) {
        setError(
          loadError.message || "Failed to load movies. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;

  const sections = [
    {
      title: "Featured Movies",
      movies: topRated,
      LeftIcon: Award,
      RightIcon: Sparkles,
    },
    {
      title: "Trending Now",
      movies: trending,
      LeftIcon: TrendingUp,
    },
    {
      title: "Top Rated Movies",
      movies: topRated,
      LeftIcon: Star,
    }
  ];

  return (
    <main className="home-page">
      <HeroBanner
        movies={heroMovies}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
        watchlist={watchlist}
        favorites={favorites}
      />

      {sections.map((section) => (
        <FeaturedMovies
          key={section.title}
          title={section.title}
          movies={section.movies}
          LeftIcon={section.LeftIcon}
          RightIcon={section.RightIcon}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavorite={onToggleFavorite}
          watchlist={watchlist}
          favorites={favorites}
        />
      ))}
    </main>
  );
}
export default HomePage;
