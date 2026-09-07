import { ArrowUpRight, Star } from "lucide-react";
import ImageWithSkeleton from "../../components/ImageWithSkeleton/ImageWithSkeleton";
import MovieCardActions from "../../components/MovieCardActions/MovieCardActions";

// Same recommendation poster design, with shared actions layered above it.
export default function SimilarTitleCard({ title, movie, onOpenTitle, ...actions }) {
  return (
    <article
      className="movie-similar-title"
      data-movie-actions
      role="button"
      tabIndex={0}
      onClick={() => onOpenTitle(title)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenTitle(title);
        }
      }}
      aria-label={"View " + title.title}
    >
      {title.posterUrl ? (
        <ImageWithSkeleton src={title.posterUrl} alt={title.title + " poster"} loading="lazy" />
      ) : (
        <span className="movie-similar-title__fallback" aria-hidden="true">{title.title}</span>
      )}
      <span className="movie-similar-title__overlay" aria-hidden="true" />
      <span className="movie-similar-title__meta">
        <span className="movie-similar-title__year">{title.releaseYear}</span>
        <span className="movie-similar-title__rating">
          <Star aria-hidden="true" size={12} fill="currentColor" />
          {title.rating}
        </span>
      </span>
      <span className="movie-similar-title__name">{title.title}</span>
      <ArrowUpRight className="movie-similar-title__arrow" aria-hidden="true" size={17} />
      <MovieCardActions movie={movie} {...actions} position="top" />
    </article>
  );
}
