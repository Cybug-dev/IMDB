import { useState, useEffect } from "react";
import {
  fetchTrendingMovies,
  fetchTopRated,
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchGenresListOnly,
  fetchMovieDetails,
  discoverRankingEngine,
} from "../../services/tmdb";
import { Award, TrendingUp, Star, Sparkles } from "lucide-react";
import HeroBanner from "./HeroBanner";
import WhatToWatch from "./WhatToWatch";
import FeaturedMovies from "./FeatureMovies";
import TopRanked from "../Top Ranked/TopRanked";
import BrowseByGenre from "./BrowseByGenre";
import SectionState from "../../components/Section State/SectionState";

function HomePage({
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
  onNavigate,
  heroContentBoundaryRef,
}) {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]);
  const [topRankedMovies, setTopRankedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const randomPage = () => Math.floor(Math.random() * 5) + 1;

    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          trendingData,
          topRatedData,
          featuredData,
          heroData,
          topRankedData,
          genreList,
        ] = await Promise.all([
          fetchTrendingMovies("day"),
          fetchTopRated(randomPage()),
          fetchPopularMovies(randomPage()),
          fetchNowPlayingMovies(randomPage()),
          discoverRankingEngine(),
          fetchGenresListOnly(),
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
            genres: (movie.genre_ids ?? []).map((id) => ({
              id,
              // If genreMap[id] is null or undefined, use 'Unknown'
              name: genreMap[id] ?? "Unknown",
            })),
          }));

        const enrichedTrending = enrichWithGenres(trendingData).slice(0, 4);
        const enrichedTopRated = enrichWithGenres(topRatedData).slice(0, 6);
        const enrichedFeatured = enrichWithGenres(featuredData).slice(0, 3);
        const enrichedHero = enrichWithGenres(heroData).slice(0, 5);
        const enrichedTopRanked = enrichWithGenres(topRankedData).slice(0, 10);

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

        const [
          detailedTrending,
          detailedTopRated,
          detailedFeatured,
          detailedHero,
          detailedTopRanked,
        ] = await Promise.all([
          enrichWithDetails(enrichedTrending),
          enrichWithDetails(enrichedTopRated),
          enrichWithDetails(enrichedFeatured),
          enrichWithDetails(enrichedHero),
          enrichWithDetails(enrichedTopRanked),
        ]);

        setTrending(detailedTrending);
        setTopRated(detailedTopRated);
        setFeatured(detailedFeatured);
        setHeroMovies(detailedHero);
        setTopRankedMovies(detailedTopRanked);
      } catch (loadError) {
        setError(
          loadError.message ||
            "Unable to load movies. Please check your internet connection.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Render page immediately and let individual sections handle their
  // loading / error states via `SectionState` (passed through props).

  const sections = [
    {
      title: "Featured Movies",
      movies: featured,
      LeftIcon: Award,
      RightIcon: Sparkles,
      visibleLimit: 3,
    },
    {
      title: "Trending Now",
      movies: trending,
      LeftIcon: TrendingUp,
      visibleLimit: 4,
    },
    {
      title: "Top Rated Movies",
      movies: topRated,
      LeftIcon: Star,
      visibleLimit: 6,
    },
  ];

  return (
    <main className="home-page">
      <HeroBanner
        movies={heroMovies}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
        watchlist={watchlist}
        favorites={favorites}
        contentBoundaryRef={heroContentBoundaryRef}
      />

      <WhatToWatch
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
        watchlist={watchlist}
        favorites={favorites}
      />

      <div className="home-page__main-content">
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
            visibleLimit={section.visibleLimit}
            loading={loading}
            error={error}
          />
        ))}
        <TopRanked movies={topRankedMovies} 
        loading={loading} 
        error={error} />

        <BrowseByGenre onNavigate={onNavigate} />
      </div>
    </main>
  );
}
export default HomePage;
