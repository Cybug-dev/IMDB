import MovieCard from "./MovieCard";

function FeaturedMovies({ title, movies, LeftIcon, RightIcon }) {
  return (
    <section className="featured-movies">
      <div className="featured-movies__header">
        <div className="featured-movies__head">
          {LeftIcon ? <LeftIcon className="lucide-icon" /> : null}
          <h2 className="heading">{title}</h2>
          {RightIcon ? <RightIcon className="lucide-sparkels" /> : null}
        </div>

        <button type="button" className="featured-movies__see-all">
          See all →
        </button>
      </div>

      <div className="featured-movies__grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedMovies;
