import { memo, useState } from "react";

function WatchlistNotification({ count, className = "" }) {
  const [notification, setNotification] = useState({
    count,
    isVisible: count > 0,
  });

  if (count !== notification.count) {
    setNotification({ count, isVisible: count > 0 });
  }

  if (count <= 0) return null;

  return (
    <span
      key={notification.count}
      className={`watchlist-notification${
        notification.isVisible ? " is-visible" : ""
      }${className ? ` ${className}` : ""}`}
      aria-live="polite"
      onAnimationEnd={() => {
        setNotification((current) => ({
          ...current,
          isVisible: false,
        }));
      }}
    >
      {count}
    </span>
  );
}

export default memo(WatchlistNotification);
