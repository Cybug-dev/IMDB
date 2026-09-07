import MovieCardWithCollections from "../../components/MovieCardWithCollections";
import SimilarTitleCard from "./SimilarTitleCard";

function SimilarTitles({ titles, onOpenTitle }) {
  return (
    <section
      className="movie-detail-section movie-similar-titles"
      aria-labelledby="similar-titles-title"
    >
      <div className="movie-detail-section__header">
        <div>
          <p className="movie-detail-section__eyebrow">More to discover</p>
          <h2 id="similar-titles-title">Similar titles</h2>
        </div>
      </div>

      {titles.length > 0 ? (
        <div className="movie-similar-titles__list">
          {titles.map((title) => (
            <MovieCardWithCollections
              component={SimilarTitleCard}
              key={title.id}
              movie={title.raw}
              title={title}
              onOpenTitle={onOpenTitle}
            />
          ))}
        </div>
      ) : (
        <p className="movie-similar-titles__empty">
          Similar titles are not available for this movie yet.
        </p>
      )}
    </section>
  );
}

export default SimilarTitles;
