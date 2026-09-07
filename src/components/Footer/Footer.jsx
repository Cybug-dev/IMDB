import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import SectionState from "../Section State/SectionState";
import ComingSoon from "../ComingSoon/ComingSoon";
import { useFooterMovies } from "./useFooterMovies";
import ImageWithSkeleton from "../ImageWithSkeleton/ImageWithSkeleton";
import "./Footer.scss";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";
const SOCIAL_LINKS = [
  { label: "Facebook", mark: "f", href: "https://www.facebook.com" },
  { label: "X", mark: "𝕏", href: "https://x.com" },
  { label: "Instagram", mark: "◎", href: "https://www.instagram.com" },
  { label: "YouTube", mark: "▶", href: "https://www.youtube.com" },
];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FooterMovieGrid() {
  const navigate = useNavigate();
  const { data: movies = [], error, isPending, refetch } = useFooterMovies();

  if (isPending) {
    return (
      <div className="footer__movie-grid footer__movie-grid--loading" aria-label="Loading movies">
        {Array.from({ length: 8 }, (_, index) => (
          <span className="footer__movie-skeleton" key={index} aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (error || movies.length === 0) {
    return (
      <SectionState
        className="footer__movie-state"
        loading={false}
        error={error}
        data={movies}
        emptyTitle="No movies available"
        emptyMessage="Please check back shortly."
        onRetry={refetch}
        retryLabel="Try again"
      />
    );
  }

  return (
    <div className="footer__movie-grid">
      {movies.map((movie) => (
        <button
          className="footer__movie"
          type="button"
          key={movie.id}
          onClick={() => navigate(`/movie/${movie.id}`)}
          aria-label={`View ${movie.title}`}
        >
          <ImageWithSkeleton
            src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : undefined}
            alt=""
            loading="lazy"
            fallbackLabel={"Poster unavailable for " + movie.title}
          />
        </button>
      ))}
    </div>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      setIsComingSoonOpen(false);
      return;
    }

    setEmailError("");
    setEmail("");
    setIsComingSoonOpen(true);
  };

  return (
    <footer className="footer">
      <div className="footer__main">
        <section className="footer__about" aria-labelledby="footer-brand">
          <Link className="footer__logo" id="footer-brand" to="/" aria-label="IMDB home">
            IMDB
          </Link>
          <p className="footer__description">
            Your next great movie night starts here. Discover the stories worth watching.
          </p>
          <address className="footer__contact-list">
            <span><MapPin aria-hidden="true" size={17} /> Lagos, Nigeria</span>
            <a href="mailto:hello@cybugeverton.com"><Mail aria-hidden="true" size={17} /> hello@cybugeverton.com</a>
            <a href="tel:+2348115355715"><Phone aria-hidden="true" size={17} /> +234 811 535 5715</a>
          </address>
        </section>

        <section className="footer__movies" aria-labelledby="footer-movies-title">
          <h2 id="footer-movies-title">Flick Stream</h2>
          <FooterMovieGrid />
        </section>

        <section className="footer__newsletter" aria-labelledby="footer-newsletter-title">
          <h2 id="footer-newsletter-title">Sign <span>Newsletter</span></h2>
          <p>Get the latest movies and watchlist-worthy picks in your inbox.</p>
          <form className="footer__subscribe" onSubmit={handleSubscribe} noValidate>
            <label className="sr-only" htmlFor="footer-email">Email address</label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="Email address"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "footer-email-error" : undefined}
            />
            <button type="submit">Subscribe</button>
          </form>
          {emailError && <p className="footer__email-error" id="footer-email-error" role="alert">{emailError}</p>}
          <div className="footer__socials" aria-label="Social media">
            {SOCIAL_LINKS.map((social) => (
              <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noreferrer">
                <span aria-hidden="true">{social.mark}</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} IMDB. All rights reserved.</p>
        <nav aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/movies">Movies</Link>
          <Link to="/movies">Popular Movies</Link>
          <Link to="/movies">Top Rated Movies</Link>
        </nav>
      </div>

      <ComingSoon
        open={isComingSoonOpen}
        onOpenChange={setIsComingSoonOpen}
        featureName="Newsletter subscriptions"
      />
    </footer>
  );
}

export default Footer;
