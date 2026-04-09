import MovieCard from "./MovieCard";
import { Award, Sparkles } from "lucide-react";

function FeaturedMovies({ title, movies }) {
  return (
    <section className="featured-movies">
      <div className="featured-movies__header">
        <div className="featured-movies__head">
          <Award className="lucide-icon" />
          <h2 className="featured-movies__title">{title}</h2>
          <Sparkles className="lucide-sparkels" />
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
