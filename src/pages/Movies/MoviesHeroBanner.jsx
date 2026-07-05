import { memo, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPlus, faCheck, faBookmark } from "@fortawesome/free-solid-svg-icons";
import { useHeroCarousel } from "./useHeroCarousel";
import "./MoviesHeroBanner.scss";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const getImageUrl = (path) => (path ? `${IMAGE_BASE_URL}${path}` : "");

function MoviesHeroBanner({
  items,
  loading = false,
  error = null,
  intervalMs,
  watchlist = [],
  favorites = [],
  onPlay,
  onToggleWatchlist,
  onToggleFavorite,
  playLabel = "Play",
  listLabel = "My List",
  favoriteLabel = "Favourite",
  emptyMessage = "No featured movies available.",
}) {
  const {
    activeIndex,
    activeItem,
    goToSlide,
    goToNext,
    goToPrevious,
    pause,
    resume,
    touchHandlers,
  } = useHeroCarousel(items, intervalMs);

  const activeItemKey = `${activeItem?.media_type ?? "media"}-${activeItem?.id}`;

  const watchlistIds = useMemo(
    () => new Set(watchlist.map((item) => item.id)),
    [watchlist],
  );

  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => item.id)),
    [favorites],
  );

  if (loading) {
    return (
      <section aria-busy="true" aria-label="Featured movies">
        <p>Loading featured movies...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section role="status" aria-label="Featured movies">
        <p>{error}</p>
      </section>
    );
  }

  if (!activeItem) {
    return (
      <section role="status" aria-label="Featured movies">
        <p>{emptyMessage}</p>
      </section>
    );
  }

  const backdropUrl = getImageUrl(
    activeItem.backdrop_path || activeItem.poster_path,
  );
  const genreNames = (activeItem.genres ?? []).map((genre) => genre.name);
  const isInWatchlist = watchlistIds.has(activeItem.id);
  const isInFavorites = favoriteIds.has(activeItem.id);
  const handleSlideClick = () => {
    onPlay?.(activeItem);
  };
  const stopSlideClick = (event) => {
    event.stopPropagation();
  };

  return (
    <section
      aria-label="Featured movies"
      onMouseEnter={pause}
      onMouseLeave={resume}
      {...touchHandlers}
    >
      <article
      key={activeItemKey} onClick={handleSlideClick}>

        {backdropUrl && (
          <img src={backdropUrl} alt="" aria-hidden="true" loading="eager" />
        )}

        <div className="hero-banner__content">
          <h1>{activeItem.title}</h1>

          {genreNames.length > 0 && (
            <ul aria-label="Genres">
              {genreNames.map((genre) => (
                <li key={genre}> {genre} </li>
              ))}
            </ul>
          )}

          <div className="hero-banner__actions">
            <button
              type="button"
              className="hero-banner__trailer"
              onClick={(event) => {
                stopSlideClick(event);
                onPlay?.(activeItem);
              }}
            >
              <FontAwesomeIcon icon={faPlay} />
              <span>{playLabel}</span>
            </button>

            <button
              type="button"
              className={`hero-banner__watchlist${
                isInWatchlist ? " is-active" : ""
              }`}
              aria-pressed={isInWatchlist}
              onClick={(event) => {
                stopSlideClick(event);
                onToggleWatchlist?.(activeItem);
              }}
            >
              <FontAwesomeIcon icon={isInWatchlist ? faCheck : faBookmark} />
              <span>{isInWatchlist ? "In My List" : listLabel}</span>
            </button>

            <button
              type="button"
              className={`hero-banner__favourites${
                isInFavorites ? " is-active" : ""
              }`}
              aria-pressed={isInFavorites}
              onClick={(event) => {
                stopSlideClick(event);
                onToggleFavorite?.(activeItem);
              }}
            >
              <FontAwesomeIcon icon={isInFavorites ? faCheck : faPlus} />
              <span>{isInFavorites ? `In ${favoriteLabel}` : favoriteLabel}</span>
            </button>
          </div>
        </div>
      </article>

      {items.length > 1 && (
        <nav aria-label="Featured movie carousel">
          <button type="button" onClick={goToPrevious}>
            Previous
          </button>

          {items.map((item, index) => (
            <button
              key={`${item.media_type ?? "media"}-${item.id}`}
              type="button"
              aria-label={`Show ${item.title}`}
              aria-current={index === activeIndex}
              onClick={() => goToSlide(index)}
            />
          ))}

          <button type="button" onClick={goToNext}>
            Next
          </button>
        </nav>
      )}
    </section>
  );
}

const MemoizedMoviesHeroBanner = memo(MoviesHeroBanner);

export default MemoizedMoviesHeroBanner;
