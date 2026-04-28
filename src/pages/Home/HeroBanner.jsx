import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import {
  faCalendar,
  faChevronLeft,
  faChevronRight,
  faCircleInfo,
  faHeart as faHeartSolid,
  faPlay,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { Check, Plus } from "lucide-react";

const IMG_BASE = "https://image.tmdb.org/t/p/original";
const INTERVAL_MS = 7000;
const TRANSITION_MS = 560;

function HeroBanner({
  movies,
  onToggleWatchlist,
  onToggleFavorite,
  watchlist,
  favorites,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousMovie, setPreviousMovie] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isWatchlistAnimating, setIsWatchlistAnimating] = useState(false);
  const [isFavoritesAnimating, setIsFavoritesAnimating] = useState(false);
  const activeIndexRef = useRef(0);
  const watchlistTimeoutRef = useRef(null);
  const favoritesTimeoutRef = useRef(null);
  const movieCount = movies?.length ?? 0;
  const safeActiveIndex = movieCount === 0 ? 0 : activeIndex % movieCount;

  useEffect(() => {
    activeIndexRef.current = safeActiveIndex;
  }, [safeActiveIndex]);

  useEffect(() => {
    if (!isTransitioning) return undefined;

    const timeout = setTimeout(() => {
      setPreviousMovie(null);
      setIsTransitioning(false);
    }, TRANSITION_MS);

    return () => clearTimeout(timeout);
  }, [isTransitioning]);

  useEffect(() => {
    if (movieCount === 0) return undefined;

    const interval = setInterval(() => {
      const currentIndex = activeIndexRef.current;
      const nextIndex = (currentIndex + 1) % movieCount;

      if (nextIndex === currentIndex) return;

      setPreviousMovie(movies[currentIndex] ?? null);
      setActiveIndex(nextIndex);
      setIsTransitioning(true);
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [movieCount, movies]);

  useEffect(
    () => () => {
      clearTimeout(watchlistTimeoutRef.current);
      clearTimeout(favoritesTimeoutRef.current);
    },
    [],
  );

  if (!movies || movieCount === 0) return null;
  const movie = movies[safeActiveIndex] ?? movies[0];

  const isInWatchlist = watchlist.some((item) => item.id === movie.id);
  const isInFavorites = favorites.some((item) => item.id === movie.id);

  const backdropPath = movie.backdrop_path || movie.poster_path;
  const previousBackdropPath =
    previousMovie?.backdrop_path || previousMovie?.poster_path;
  const primaryGenre = movie.genres?.[0]?.name ?? "Feature Film";
  const runtime = movie.runtime ? `${movie.runtime} min` : null;
  const director = movie.director ?? null;
  const boxOffice = movie.revenue
    ? `$${(movie.revenue / 1_000_000).toFixed(1)}M`
    : "N/A";
  const watchlistLabel = isInWatchlist ? "In Watchlist" : "Add to Watchlist";

  const handleMovieChange = (nextIndex) => {
    const currentIndex = activeIndexRef.current;

    if (
      movieCount === 0 ||
      nextIndex === currentIndex ||
      nextIndex < 0 ||
      nextIndex >= movieCount
    ) {
      return;
    }

    setPreviousMovie(movies[currentIndex] ?? null);
    setActiveIndex(nextIndex);
    setIsTransitioning(true);
  };

  const triggerButtonAnimation = (type) => {
    const isWatchlist = type === "watchlist";
    const setAnimating = isWatchlist
      ? setIsWatchlistAnimating
      : setIsFavoritesAnimating;
    const timeoutRef = isWatchlist ? watchlistTimeoutRef : favoritesTimeoutRef;

    clearTimeout(timeoutRef.current);
    setAnimating(true);
    timeoutRef.current = setTimeout(() => {
      setAnimating(false);
    }, 320);
  };

  const handlePrev = () => {
    handleMovieChange((activeIndexRef.current - 1 + movieCount) % movieCount);
  };

  const handleNext = () => {
    handleMovieChange((activeIndexRef.current + 1) % movieCount);
  };

  const handleWatchlistClick = () => {
    triggerButtonAnimation("watchlist");
    onToggleWatchlist(movie);
  };

  const handleFavoriteClick = () => {
    triggerButtonAnimation("favorite");
    onToggleFavorite(movie);
  };

  return (
    <section className="hero-banner">
      <div className="hero-banner__media" aria-hidden="true">
        {previousBackdropPath ? (
          <div
            className="hero-banner__backdrop hero-banner__backdrop--previous"
            style={{
              backgroundImage: `url(${IMG_BASE}${previousBackdropPath})`,
            }}
          />
        ) : null}
        <div
          className={`hero-banner__backdrop hero-banner__backdrop--current${
            isTransitioning ? " is-entering" : ""
          }`}
          style={{ backgroundImage: `url(${IMG_BASE}${backdropPath})` }}
        />
      </div>

      <div className="hero-banner__overlay" />

      <button
        type="button"
        className="hero-banner__nav hero-banner__nav--prev"
        onClick={handlePrev}
        aria-label="Previous movie"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <button
        type="button"
        className="hero-banner__nav hero-banner__nav--next"
        onClick={handleNext}
        aria-label="Next movie"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      <div className="hero-banner__dots">
        {movies.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`hero-banner__dot-btn${
              index === safeActiveIndex ? " is-active" : ""
            }`}
            aria-label={`Go to movie ${index + 1}`}
            aria-pressed={index === safeActiveIndex}
            onClick={() => handleMovieChange(index)}
          />
        ))}
      </div>

      <div key={movie.id} className="hero-banner__content">
        <div className="hero-banner__rating">
          <div className="hero-banner__vote">
            <FontAwesomeIcon icon={faStar} className="hero-banner__star" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
          <span>IMDB Rating</span>
        </div>

        <h1 className="hero-banner__title">{movie.title}</h1>

        <div className="hero-banner__meta">
          <span>{movie.release_date?.split("-")[0]}</span>
          <span className="hero-banner__dot" aria-hidden="true" />
          {runtime && <span>{runtime}</span>}
          {runtime && <span className="hero-banner__dot" aria-hidden="true" />}
          <span className="hero-banner__genre">{primaryGenre}</span>
        </div>

        <p className="hero-banner__overview">{movie.overview}</p>

        {director && (
          <p className="hero-banner__director">
            <span>Director:</span> {director}
          </p>
        )}

        <div className="hero-banner__actions">
          <button type="button" className="hero-banner__trailer">
            <FontAwesomeIcon icon={faPlay} />
            <span>Watch Trailer</span>
          </button>

          <button
            type="button"
            className={`hero-banner__watchlist hero-banner__toggle-button${
              isInWatchlist ? " is-active" : ""
            }${isWatchlistAnimating ? " is-toggling" : ""}`}
            aria-label={
              isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
            }
            onClick={handleWatchlistClick}
          >
            <span className="hero-banner__toggle-icon-stack" aria-hidden="true">
              <span className="hero-banner__toggle-icon hero-banner__toggle-icon--inactive">
                <Plus />
              </span>
              <span className="hero-banner__toggle-icon hero-banner__toggle-icon--active">
                <Check />
              </span>
            </span>

            <span
              className="hero-banner__toggle-label-stack"
              aria-hidden="true"
            >
              <span className="hero-banner__toggle-label hero-banner__toggle-label--inactive">
                Add to Watchlist
              </span>
              <span className="hero-banner__toggle-label hero-banner__toggle-label--active">
                {watchlistLabel}
              </span>
            </span>
          </button>

          <button
            type="button"
            className={`hero-banner__favourites hero-banner__toggle-button${
              isInFavorites ? " is-active" : ""
            }${isFavoritesAnimating ? " is-toggling" : ""}`}
            aria-label={
              isInFavorites ? "Remove from favorites" : "Add to favorites"
            }
            onClick={handleFavoriteClick}
          >
            <span className="hero-banner__toggle-icon-stack" aria-hidden="true">
              <span className="hero-banner__toggle-icon hero-banner__toggle-icon--inactive">
                <FontAwesomeIcon icon={faHeartRegular} />
              </span>
              <span className="hero-banner__toggle-icon hero-banner__toggle-icon--active">
                <FontAwesomeIcon icon={faHeartSolid} />
              </span>
            </span>

            <span
              className="hero-banner__toggle-label-stack"
              aria-hidden="true"
            >
              <span className="hero-banner__toggle-label hero-banner__toggle-label--inactive">
                Add to Favorites
              </span>
              <span className="hero-banner__toggle-label hero-banner__toggle-label--active">
                {isInFavorites ? "In Favorites" : "Add to Favorites"}
              </span>
            </span>
          </button>

          <button type="button" className="hero-banner__more-info">
            <FontAwesomeIcon icon={faCircleInfo} />
            <span>More Info</span>
          </button>
        </div>

        <div className="hero-banner__footer">
          <div className="hero-banner__footer-item">
            <FontAwesomeIcon icon={faCalendar} />
            <span>Released {movie.release_date}</span>
          </div>
          <div className="hero-banner__footer-item">
            <span>Box Office: {boxOffice}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
