import { Bookmark, Heart } from "lucide-react";
import { toast } from "sonner";

const TOAST_DURATION_MS = 3600;

const getMovieTitle = (movie) => movie?.title || movie?.name || "Untitled Movie";

export function showCollectionToast({ movie, type, action }) {
  const isWatchlist = type === "watchlist";
  const Icon = isWatchlist ? Bookmark : Heart;
  const collectionLabel = isWatchlist ? "watchlist" : "favourites";
  const message = `${getMovieTitle(movie)} ${action} ${
    action === "removed" ? "from" : "to"
  } ${collectionLabel}`;

  toast.custom(
    () => (
      <div
        className={`app-toast app-toast--${type}`}
        role="status"
        aria-live="polite"
      >
        <Icon aria-hidden="true" size={16} />
        <span>{message}</span>
      </div>
    ),
    {
      duration: TOAST_DURATION_MS,
      id: `${type}-${movie.id}`,
      position: "bottom-center",
    },
  );
}
