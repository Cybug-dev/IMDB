import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import MovieCard from "./MovieCard";

function FeaturedMovies({
  title,
  movies,
  LeftIcon,
  RightIcon,
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const normalizedTitle = title.toLowerCase();
  const sectionVariant = normalizedTitle.includes("featured")
    ? "featured"
    : normalizedTitle.includes("trending")
      ? "trending"
      : "default";
  const visibleMovies =
    sectionVariant === "featured"
      ? movies.slice(0, 4)
      : sectionVariant === "trending"
        ? movies.slice(0, 3)
        : movies;

  return (
    <section className={`featured-movies featured-movies--${sectionVariant}`}>
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

      <div className="featured-movies__grid">
        {visibleMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavorite={onToggleFavorite}
            isInWatchlist={watchlist.some((m) => m.id === movie.id)}
            isInFavorites={favorites.some((m) => m.id === movie.id)}
            watchlist={watchlist}
            favorites={favorites}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturedMovies;
