import { RefreshCw, Timer, TriangleAlert, WifiOff } from "lucide-react";
import "./SectionState.scss";

const ERROR_STATES = {
  offline: {
    Icon: WifiOff,
    message: "No internet connection",
    detail: "Check your connection and try again.",
  },
  timeout: {
    Icon: Timer,
    message: "Connection is slow",
    detail: "Please try again in a moment.",
  },
  default: {
    Icon: TriangleAlert,
    message: "Something went wrong",
    detail: "Please try again.",
  },
};

const isOffline = () =>
  typeof navigator !== "undefined" && navigator.onLine === false;

const getErrorState = (error) => {
  const errorText = [
    error?.message,
    error?.name,
    error?.code,
    typeof error === "string" ? error : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    isOffline() ||
    /offline|internet|network|failed to fetch|networkerror/.test(errorText)
  ) {
    return ERROR_STATES.offline;
  }

  if (/timeout|timed out|slow|abort/.test(errorText)) {
    return ERROR_STATES.timeout;
  }

  return ERROR_STATES.default;
};

const hasNoData = (data) => {
  if (Array.isArray(data)) return data.length === 0;
  return !data;
};

function SectionState({
  loading = false,
  error = null,
  data,
  empty,
  onRetry,
  loadingMessage = "Loading movies...",
  emptyTitle = "No movies found",
  emptyMessage = "There are no movies available right now.",
  retryLabel = "Retry",
  variant = "section",
  className = "",
  as = "div",
  ...rest
}) {
  const Component = as;
  const stateClassName = `section-state section-state--${variant}${
    className ? ` ${className}` : ""
  }`;

  if (loading) {
    return (
      <Component
        {...rest}
        className={`${stateClassName} section-state--loading`}
        role="status"
        aria-live="polite"
      >
        <span className="section-state__spinner" aria-hidden="true" />
        {variant !== "hero" && <p>{loadingMessage}</p>}
        <span className="sr-only">{loadingMessage}</span>
      </Component>
    );
  }

  if (error) {
    const { Icon, message, detail } = getErrorState(error);
    const retry = onRetry ?? (() => window.location.reload());

    return (
      <Component {...rest} className={`${stateClassName} section-state--error`} role="alert">
        <Icon className="section-state__icon" aria-hidden="true" />
        <h2>{message}</h2>
        <p>{detail}</p>
        <button type="button" className="section-state__action" onClick={retry}>
          <RefreshCw aria-hidden="true" size={15} />
          <span>{retryLabel}</span>
        </button>
      </Component>
    );
  }

  const shouldShowEmpty = empty ?? (data !== undefined && hasNoData(data));

  if (shouldShowEmpty) {
    return (
      <Component {...rest} className={`${stateClassName} section-state--empty`} role="status">
        <h2>{emptyTitle}</h2>
        <p>{emptyMessage}</p>
      </Component>
    );
  }

  return null;
}

export default SectionState;
