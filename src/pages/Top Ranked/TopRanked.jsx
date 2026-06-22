import TopRankedCard from "./TopRankedCard";
import SectionState from "../../components/Section State/SectionState";

function TopRanked({
  title = "Top 10 on IMDb this week",
  movies,
  loading = false,
  error = null,
}) {
  const isLoading = Boolean(loading);
  const hasError = Boolean(error);
  const hasInvalidMovies = movies != null && !Array.isArray(movies);
  const safeMovies = Array.isArray(movies)
    ? movies.filter((movie) => movie?.id != null)
    : [];
  const topTenMovies = safeMovies.slice(0, 10);
  const featured = topTenMovies.slice(0, 3);
  const mediumFeatured = topTenMovies.slice(0, 6);
  const compact = topTenMovies.slice(3, 9);
  const hasData = topTenMovies.length > 0;

  if (isLoading || hasError || !hasData) {
    return (
      <section className="top-10-section">
        <SectionState loading={isLoading} error={error || (hasInvalidMovies ? "Invalid ranked movie data." : null)} data={hasData ? [1] : []} />
      </section>
    );
  }

  return (
    <section className="top-10-section">
      <div className="top-10-section__header">
        <h2 className="top-10-section__title">
          <span>{title}</span>
          <span className="top-10-section__title-arrow" aria-hidden="true">
            &rsaquo;
          </span>
        </h2>
      </div>

      <div className="top-10-section__featured">
        {featured.map((movie, index) => (
          <TopRankedCard
            key={movie.id}
            movie={movie}
            rank={index + 1}
            variant="featured"
          />
        ))}
      </div>

      <div className="top-10-section__featured top-10-section__featured--medium">
        {mediumFeatured.map((movie, index) => (
          <TopRankedCard
            key={movie.id}
            movie={movie}
            rank={index + 1}
            variant="featured"
          />
        ))}
      </div>

      <div className="top-10-section__compact">
        {compact.map((movie, index) => (
          <TopRankedCard
            key={movie.id}
            movie={movie}
            rank={featured.length + index + 1}
            variant="compact"
          />
        ))}
      </div>

      <button type="button" className="top-10-section__see-all">
        See all
      </button>
    </section>
  );
}

export default TopRanked;
