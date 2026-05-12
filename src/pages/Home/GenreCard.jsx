function GenreCard({ genre, currentPoster, onClick }) {
  return (
    <button
      type="button"
      className="genre-card"
      onClick={onClick}
      aria-label={`Browse ${genre.name} movies`}
    >
      {currentPoster ? (
        <img src={currentPoster} alt="" className="genre-image" />
      ) : null}
      <span className="genre-name">{genre.name}</span>
    </button>
  );
}
export default GenreCard;
