import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import {
  faCalendar,
  faCircleInfo,
  faHeart,
  faPlay,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Plus, Check } from "lucide-react";

const IMG_BASE = "https://image.tmdb.org/t/p/original";
const INTERVAL_MS = 5000;

function HeroBanner({
  movies,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isInFavorites,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const movieCount = movies?.length 
  ?? 0;

  // --- Auto-rotation logic ---
  useEffect(() => {
    if (movieCount === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % movieCount);
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [movieCount]);

  if (!movies || movieCount === 0) return null;
  const movie = movies[activeIndex];

  const backdropPath = movie.backdrop_path || movie.poster_path;
  const primaryGenre = movie.genres?.[0]?.name ?? "Feature Film";
  const runtime = movie.runtime ? `${movie.runtime} min` : null;
  const director = movie.director ?? null;
  const boxOffice = movie.revenue
    ? `$${(movie.revenue / 1_000_000).toFixed(1)}M`
    : "N/A";

  const watchlistLabel = isInWatchlist ? "In Watchlist" : "Add to Watchlist";
  const favoritesLabel = isInFavorites ? "In Favorites" : "Add to Favorites";
  const watchlistIcon = isInWatchlist ? <Check /> : <Plus />;

  // --- Manual controls ---
  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + movieCount) % movieCount);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % movieCount);
  };

  return (
    <section
      className="hero-banner"
      style={{ backgroundImage: `url(${IMG_BASE}${backdropPath})` }}
    >
      <div className="hero-banner__overlay" />

      {/* Left/Right controls */}
      <button
        type="button"
        className="hero-banner__nav hero-banner__nav--prev"
        onClick={handlePrev}
        aria-label="Previous Movie"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        type="button"
        className="hero-banner__nav hero-banner__nav--next"
        onClick={handleNext}
        aria-label="Next Movie"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* Dot indicators */}
      <div className="hero-banner__dots">
        {movies.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`hero-banner__dot-btn${i === activeIndex ? " is-active" : ""}`}
            aria-label={`Go to movie ${i + 1}`}
          />
        ))}
      </div>
      <div className="hero-banner__content">
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
          <span className="hero-banner__dot">•</span>
          {runtime && <span>{runtime}</span>}
          {runtime && <span className="hero-banner__dot">•</span>}
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
            className="hero-banner__watchlist"
            aria-label={
              isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
            }
            onClick={() => onToggleWatchlist(movie)}
          >
            {watchlistIcon}
            <span>{watchlistLabel}</span>
          </button>

          <button
            type="button"
            className="hero-banner__favourites"
            aria-label={
              isInFavorites ? "Remove from favorites" : "Add to favorites"
            }
            onClick={() => onToggleFavorite(movie)}
          >
            <FontAwesomeIcon icon={faHeart} />
            <span>{favoritesLabel}</span>
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
