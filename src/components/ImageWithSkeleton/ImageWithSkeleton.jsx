import { useEffect, useRef, useState } from "react";
import "./ImageWithSkeleton.scss";

const SKELETON_DELAY_MS = 100;
const SKELETON_FADE_DURATION_MS = 360;

const getHeroPlaceholder = (src) => {
  if (!src) return null;

  return src.replace(/\/t\/p\/(original|w\d+)\//, "/t/p/w300/");
};

/**
 * Reserves its parent's image area while preloading the source.
 *
 * Usage:
 * <ImageWithSkeleton src={posterUrl} alt={title} loading="lazy" />
 *
 * The optional renderImage callback supports image components that do not render
 * a native img element (for example, a framework image component).
 */
function ImageWithSkeleton({
  src,
  alt = "",
  variant = "default",
  className = "",
  imageClassName = "",
  placeholderSrc,
  fallback,
  fallbackLabel,
  loading = "lazy",
  renderImage,
  onLoad,
  onError,
  ...imageProps
}) {
  const [imageState, setImageState] = useState({
    src: null,
    status: "loading",
    showSkeleton: false,
  });
  const containerRef = useRef(null);
  const callbacksRef = useRef({ onLoad, onError });

  useEffect(() => {
    callbacksRef.current = { onLoad, onError };
  }, [onError, onLoad]);

  useEffect(() => {
    let isActive = true;
    let isSettled = false;
    let hasShownSkeleton = false;
    let skeletonTimer;
    let revealFrame;
    let skeletonFadeTimer;
    let observer;
    let image;

    if (!src) {
      const errorTimer = window.setTimeout(() => {
        if (!isActive) return;

        setImageState({ src, status: "error", showSkeleton: false });
        callbacksRef.current.onError?.();
      }, 0);

      return () => {
        isActive = false;
        window.clearTimeout(errorTimer);
      };
    }

    const finishLoading = () => {
      if (!isActive || isSettled) return;

      isSettled = true;
      window.clearTimeout(skeletonTimer);

      if (hasShownSkeleton) {
        setImageState({ src, status: "revealing", showSkeleton: true });

        revealFrame = window.requestAnimationFrame(() => {
          if (!isActive) return;

          setImageState({ src, status: "loaded", showSkeleton: true });
          skeletonFadeTimer = window.setTimeout(() => {
            if (!isActive) return;

            setImageState({ src, status: "loaded", showSkeleton: false });
          }, SKELETON_FADE_DURATION_MS);
        });
      } else {
        setImageState({ src, status: "loaded", showSkeleton: false });
      }

      callbacksRef.current.onLoad?.();
    };

    const handleLoad = () => {
      if (typeof image.decode !== "function") {
        finishLoading();
        return;
      }

      image.decode().catch(() => undefined).finally(finishLoading);
    };

    const handleError = () => {
      if (!isActive || isSettled) return;

      isSettled = true;
      window.clearTimeout(skeletonTimer);
      setImageState({ src, status: "error", showSkeleton: false });
      callbacksRef.current.onError?.();
    };

    const startLoading = () => {
      if (!isActive || isSettled) return;

      skeletonTimer = window.setTimeout(() => {
        if (isActive && !isSettled) {
          hasShownSkeleton = true;
          setImageState({ src, status: "loading", showSkeleton: true });
        }
      }, SKELETON_DELAY_MS);

      image = new Image();
      image.decoding = "async";
      image.onload = handleLoad;
      image.onerror = handleError;
      image.src = src;

      if (image.complete) {
        if (image.naturalWidth > 0) {
          handleLoad();
        } else {
          handleError();
        }
      }
    };

    if (loading === "lazy" && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;

          observer?.disconnect();
          observer = undefined;
          startLoading();
        },
        { rootMargin: "240px 0px" },
      );
      if (containerRef.current) {
        observer.observe(containerRef.current);
      } else {
        startLoading();
      }
    } else {
      startLoading();
    }

    return () => {
      isActive = false;
      window.clearTimeout(skeletonTimer);
      window.cancelAnimationFrame(revealFrame);
      window.clearTimeout(skeletonFadeTimer);
      observer?.disconnect();
      if (image) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [loading, src]);

  const activeState =
    imageState.src === src
      ? imageState
      : { status: "loading", showSkeleton: false };
  const resolvedPlaceholder =
    placeholderSrc ?? (variant === "hero" ? getHeroPlaceholder(src) : null);
  const isLoaded = activeState.status === "loaded";
  const isRevealing = activeState.status === "revealing";
  const isError = activeState.status === "error";
  const componentClassName = [
    "image-with-skeleton",
    "image-with-skeleton--" + variant,
    className,
    isRevealing && "is-revealing",
    isLoaded && "is-loaded",
    isError && "has-error",
  ]
    .filter(Boolean)
    .join(" ");
  const renderedImageClassName = [
    "image-with-skeleton__image",
    imageClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const imageElement =
    (isRevealing || isLoaded) &&
    (renderImage ? (
      renderImage({
        src,
        alt,
        className: renderedImageClassName,
        loading,
        ...imageProps,
      })
    ) : (
      <img
        {...imageProps}
        className={renderedImageClassName}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
      />
    ));

  return (
    <span ref={containerRef} className={componentClassName}>
      {variant === "hero" && resolvedPlaceholder && !isError && (
        <img
          className="image-with-skeleton__placeholder"
          src={resolvedPlaceholder}
          alt=""
          aria-hidden="true"
        />
      )}

      {activeState.showSkeleton && !isError && (
        <span className="image-with-skeleton__skeleton" aria-hidden="true" />
      )}

      {imageElement}

      {isError &&
        (fallback ?? (
          <span
            className="image-with-skeleton__fallback"
            role="img"
            aria-label={fallbackLabel || alt || "Image unavailable"}
          >
            <span>Image unavailable</span>
          </span>
        ))}
    </span>
  );
}

export default ImageWithSkeleton;
