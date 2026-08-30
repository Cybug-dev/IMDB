import { Star, UsersRound } from "lucide-react";

function MovieRatings({ movie }) {
  return (
    <section
      className="movie-detail-section movie-ratings"
      aria-labelledby="ratings-title"
    >
      <div className="movie-detail-section__header">
        <div>
          <p className="movie-detail-section__eyebrow">Community response</p>
          <h2 id="ratings-title">Ratings &amp; reviews</h2>
        </div>
      </div>

      <div className="movie-ratings__card">
        <div className="movie-ratings__score">
          <span className="movie-ratings__star">
            <Star aria-hidden="true" size={23} fill="currentColor" />
          </span>
          <div>
            <strong>{movie.rating}</strong>
            <span>out of 10</span>
          </div>
        </div>

        <p className="movie-ratings__description">
          TMDB community rating based on {movie.voteCountLabel} votes.
        </p>

        <div className="movie-ratings__divider" aria-hidden="true" />

        <div className="movie-ratings__reviews-total">
          <UsersRound aria-hidden="true" size={19} />
          <div>
            <strong>{movie.reviewCount}</strong>
            <span>community reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MovieRatings;
