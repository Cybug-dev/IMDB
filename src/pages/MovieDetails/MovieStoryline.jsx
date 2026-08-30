function MovieStoryline({ movie }) {
  const genreLabel = movie.genres.map((genre) => genre.name).join(" · ");

  return (
    <section
      className="movie-detail-section movie-storyline"
      aria-labelledby="storyline-title"
    >
      <div className="movie-detail-section__header">
        <div>
          <p className="movie-detail-section__eyebrow">The story</p>
          <h2 id="storyline-title">Storyline</h2>
        </div>
      </div>

      <article className="movie-storyline__card">
        <div className="movie-storyline__identity">
          <p>{genreLabel || movie.mediaLabel}</p>
          <h3>{movie.title}</h3>
          {movie.tagline && <span>{movie.tagline}</span>}
        </div>
        <p className="movie-storyline__copy">{movie.summary}</p>
      </article>
    </section>
  );
}

export default MovieStoryline;
