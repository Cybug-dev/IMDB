import { MessageSquareQuote, Star } from "lucide-react";
import ImageWithSkeleton from "../../components/ImageWithSkeleton/ImageWithSkeleton";
import { getInitials } from "../../utils/stringUtils";

function ReviewAvatar({ review }) {
  if (review.avatarUrl) {
    return <ImageWithSkeleton src={review.avatarUrl} alt="" loading="lazy" />;
  }

  return <span aria-hidden="true">{getInitials(review.author)}</span>;
}

function MovieReviews({ reviews }) {
  return (
    <section
      className="movie-detail-section movie-reviews"
      aria-labelledby="reviews-title"
    >
      <div className="movie-detail-section__header">
        <div>
          <p className="movie-detail-section__eyebrow">From the audience</p>
          <h2 id="reviews-title">Recent reviews</h2>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="movie-reviews__list">
          {reviews.map((review) => (
            <article key={review.id} className="movie-review">
              <div className="movie-review__head">
                <div className="movie-review__avatar">
                  <ReviewAvatar review={review} />
                </div>
                <div className="movie-review__author">
                  <h3>{review.author}</h3>
                  {review.date && <p>{review.date}</p>}
                </div>
                {review.rating && (
                  <span className="movie-review__rating">
                    <Star aria-hidden="true" size={13} fill="currentColor" />
                    {review.rating}
                  </span>
                )}
              </div>
              <p className="movie-review__copy">{review.content}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="movie-reviews__empty">
          <MessageSquareQuote aria-hidden="true" size={22} />
          <p>No community reviews are available for this title yet.</p>
        </div>
      )}
    </section>
  );
}

export default MovieReviews;
