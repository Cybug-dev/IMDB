import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function CollectionEmpty({ title, desc, icon, onBrowse }) {
  return (
    <div className="collection-empty">
      <FontAwesomeIcon icon={icon} className="collection-empty__icon" />
      <h2 className="collection-empty__title heading">{title}</h2>
      <p className="collection-empty__desc">{desc}</p>

      <button type="button" className="collection-empty__cta" onClick={onBrowse}>
        Browse Movies
      </button>
    </div>
  );
}

export default CollectionEmpty;
