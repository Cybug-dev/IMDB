import { Clapperboard, RefreshCw, TriangleAlert } from "lucide-react";

function MovieDetailsState({
  type,
  title = "We could not load this title",
  message,
  onRetry,
}) {
  if (type === "loading") {
    return (
      <main className="movie-details-state movie-details-state--loading" aria-busy="true">
        <div className="movie-details-state__backdrop" />
        <div className="movie-details-state__content">
          <span className="movie-details-state__eyebrow">Loading title</span>
          <span className="movie-details-state__line movie-details-state__line--title" />
          <span className="movie-details-state__line movie-details-state__line--meta" />
          <span className="movie-details-state__line movie-details-state__line--copy" />
          <span className="movie-details-state__line movie-details-state__line--copy" />
        </div>
      </main>
    );
  }

  const Icon = type === "error" ? TriangleAlert : Clapperboard;

  return (
    <main className="movie-details-state movie-details-state--message">
      <div className="movie-details-state__message">
        <Icon aria-hidden="true" size={31} />
        <h1>{title}</h1>
        <p>{message}</p>
        {type === "error" && onRetry && (
          <button type="button" onClick={onRetry}>
            <RefreshCw aria-hidden="true" size={16} />
            <span>Try again</span>
          </button>
        )}
      </div>
    </main>
  );
}

export default MovieDetailsState;
