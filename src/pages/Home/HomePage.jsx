import { Award, TrendingUp, Star, Sparkles } from "lucide-react";
import HeroBanner from "./HeroBanner";
import WhatToWatch from "./WhatToWatch";
import FeaturedMovies from "./FeatureMovies";
import TopRanked from "../Top Ranked/TopRanked";
import BrowseByGenre from "./BrowseByGenre";
import { useHomePageMovies } from "../../queries/movieQueries";

function HomePage({
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
  onNavigate,
  heroContentBoundaryRef,
}) {
  const {
    data = {},
    error,
    isPending,
  } = useHomePageMovies();
  const {
    featured = [],
    heroMovies = [],
    topRankedMovies = [],
    topRated = [],
    trending = [],
  } = data;
  const loading = Boolean(isPending);
  const errorMessage =
    error?.message ||
    (error ? "Unable to load movies. Please check your internet connection." : null);

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
            error={errorMessage}
          />
        ))}
        <TopRanked movies={topRankedMovies} 
        loading={loading} 
        error={errorMessage} />

        <BrowseByGenre onNavigate={onNavigate} />
      </div>
    </main>
  );
}
export default HomePage;
