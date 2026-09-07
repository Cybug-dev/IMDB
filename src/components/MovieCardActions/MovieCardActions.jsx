import { Bookmark, Heart } from "lucide-react";
import "../../pages/Movies/MovieCard.scss";
import "./MovieCardActions.scss";

// Reuse the existing poster controls; collection state stays outside the view.
export default function MovieCardActions({ movie, onToggleWatchlist, onToggleFavorite,
  isInWatchlist = false, isInFavorites = false, position = "bottom" }) {
  const actions = [
    { toggle: onToggleWatchlist, active: isInWatchlist, kind: "watchlist", Icon: Bookmark,
      label: isInWatchlist ? "Remove from watchlist" : "Add to watchlist" },
    { toggle: onToggleFavorite, active: isInFavorites, kind: "favorite", Icon: Heart,
      label: isInFavorites ? "Remove from favourites" : "Add to favourites" },
  ].filter(({ toggle }) => typeof toggle === "function");
  if (!actions.length) return null;
  return (
    <div className={`movies-card__action-panel movie-card-actions movie-card-actions--${position}`} aria-label="Movie actions">
      {actions.map(({ toggle, active, kind, Icon: icon, label }) => {
        const Icon = icon;
        return (
        <button
          key={kind}
          type="button"
          className={`movies-card__action${active ? ` is-active movies-card__action--${kind}` : ""}`}
          aria-label={label}
          aria-pressed={active}
          title={label}
          onKeyDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggle(movie);
          }}
        >
          <Icon aria-hidden="true" size={17} />
        </button>
        );
      })}
    </div>
  );
}
