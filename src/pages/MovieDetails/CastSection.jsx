 const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

function CastSection({ cast, onViewFullCast }) {
  return (
    <div className="cast-section">
      <h2 className="cast-section__title">Top Billed Cast</h2>

      <div className="cast-section__list">
        {cast?.slice(0, 10).map((actor) => (
          <div key={actor.id} className="cast-section__item">
            {actor.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                alt={actor.name}
                className="cast-section__image"
              />
            ) : (
              <div className="cast-section__initials">
                {getInitials(actor.name)}
              </div>
            )}

            <h3 className="cast-section__name">{actor.name}</h3>
            <span className="cast-section__character">{actor.character}</span>
          </div>
        ))}
        <button
          onClick={onViewFullCast}
          className="cast-section__button"
        >
          View All Cast
        </button>
      </div>

    </div>
  );
}

export default CastSection;
