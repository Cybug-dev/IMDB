import { useNavigate, useParams } from "react-router-dom";

const MEDIA_LABELS = {
  person: "person",
  tv: "TV show",
};

function MediaDetailsPlaceholder({ mediaType }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const label = MEDIA_LABELS[mediaType] ?? "title";

  return (
    <main className="media-placeholder">
      <section className="media-placeholder__inner">
        <p className="media-placeholder__eyebrow">{label}</p>
        <h1 className="media-placeholder__title">Detail page coming soon</h1>
        <p className="media-placeholder__copy">
          TMDB id: {id}. This route is ready for the future {label} detail view.
        </p>
        <button
          className="media-placeholder__button"
          type="button"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </section>
    </main>
  );
}

export default MediaDetailsPlaceholder;
