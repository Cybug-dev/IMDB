import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import MovieCard from "../Movies/MovieCard";
import SectionState from "../../components/Section State/SectionState";
import MovieCategoryRow from "../../components/MovieCategoryRow/MovieCategoryRow";
import "../Movies/MoviesSection.scss";

function FeaturedMovies({
  title,
  movies,
  LeftIcon,
  RightIcon,
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
  loading = false,
  error = null,
  onRetry,
}) {
  const normalizedTitle = title.toLowerCase();
  const isFeaturedSection = normalizedTitle.includes("featured");
  const isTopRatedSection = normalizedTitle.includes("top rated");
  const isTrendingSection = normalizedTitle.includes("trending");
  const sectionVariant = isFeaturedSection
    ? "featured"
    : isTrendingSection
      ? "trending"
      : isTopRatedSection
        ? "top-rated"
        : "default";
  const isCompactSection = isFeaturedSection || isTopRatedSection;

  const visibleMovies = movies;
  const isLoading = Boolean(loading);
  const hasError = Boolean(error);
  const hasData = Array.isArray(visibleMovies) && visibleMovies.length > 0;  

  return (
    <section
      className={`featured-movies featured-movies--${sectionVariant}${
        isCompactSection ? " featured-movies--compact" : ""
      }`}
    >
      <div className="featured-movies__header">
        <div className="featured-movies__head">
          {LeftIcon ? <LeftIcon className="lucide-icon" /> : null}
          <h2 className="heading">{title}</h2>
          {sectionVariant === "trending" ? (
            <div className="featured-movies__trending-dots">
              <span className="featured-movies__trend-dot" />
              <span className="featured-movies__trend-dot featured-movies__trend-dot--delay-1" />
              <span className="featured-movies__trend-dot featured-movies__trend-dot--delay-2" />
            </div>
          ) : RightIcon ? (
            <RightIcon className="lucide-sparkels" />
          ) : null}
        </div>

        <button type="button" className="featured-movies__see-all">
          <span>See all</span>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {isLoading || hasError || !hasData ? (
        <SectionState
          loading={isLoading}
          error={error}
          data={visibleMovies}
          onRetry={onRetry}
        />
      ) : (
        <MovieCategoryRow label={title} className="movies-section__list">
          {visibleMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onToggleWatchlist={onToggleWatchlist}
              onToggleFavorite={onToggleFavorite}
              isInWatchlist={watchlist.some((m) => m.id === movie.id)}
              isInFavorites={favorites.some((m) => m.id === movie.id)}
            />
          ))}
        </MovieCategoryRow>
      )}
    </section>
  );
}

export default FeaturedMovies;
