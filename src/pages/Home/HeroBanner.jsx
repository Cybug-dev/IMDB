import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import {
  faCalendar,
  faCircleInfo,
  faHeart,
  faPlay,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

const IMG_BASE = "https://image.tmdb.org/t/p/original";

function HeroBanner({ movie, onToggleWatchlist, onToggleFavorite }) {
  if (!movie) return null;

  const backdropPath = movie.backdrop_path || movie.poster_path;
  const primaryGenre = movie.genre_ids?.[0]?.name ?? "Feature Film";
  const runtime = movie.runtime ? `${movie.runtime} min` : null;
  const director = movie.director ?? null;
  const boxOffice = movie.revenue
    ? `$${(movie.revenue / 1_000_000).toFixed(1)}M`
    : "N/A";

  return (
    <section
      className="hero-banner"
      style={{ backgroundImage: `url(${IMG_BASE}${backdropPath})` }}
    >
      <div className="hero-banner__overlay" />
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

          <button type="button" className="hero-banner__watchlist"
          onClick={() => onToggleWatchlist(movie)}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Add toWatchlist</span>
          </button>

          <button type="button" className="hero-banner__favourites"
          onClick={() => onToggleFavorite(movie)}>
            <FontAwesomeIcon icon={faHeart} />
            <span>Add to Favourites</span>
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
