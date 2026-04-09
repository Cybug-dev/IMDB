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
const GENRE_MAP = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  37: "Western",
  53: "Thriller",
  80: "Crime",
  87: "Talk",
  99: "Documentary",
  878: "Sci-Fi",
  9648: "Mystery",
  10402: "Music",
  10749: "Romance",
  10751: "Family",
  10752: "War",
};

function HeroBanner({ movie }) {
  if (!movie) return null;

  const backdropPath = movie.backdrop_path || movie.poster_path;
  const primaryGenre = GENRE_MAP[movie.genre_ids?.[0]] || "Feature Film";

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
          <span className="hero-banner__dot">.</span>
          <span className="hero-banner__genre">{primaryGenre}</span>
        </div>

        <p className="hero-banner__overview">{movie.overview}</p>

        <div className="hero-banner__actions">
          <button type="button" className="hero-banner__trailer">
            <FontAwesomeIcon icon={faPlay} />
            <span>Watch Trailer</span>
          </button>

          <button type="button" className="hero-banner__watchlist">
            <FontAwesomeIcon icon={faPlus} />
            <span>Add toWatchlist</span>
          </button>

          <button type="button" className="hero-banner__favourites">
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
            <span>Box Office: N/A</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
