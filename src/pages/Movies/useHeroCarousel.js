import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_INTERVAL_MS = 7000;
const SWIPE_THRESHOLD_PX = 48;
const RESUME_DELAY_MS = 1200;

const getItemKey = (item, fallbackIndex) =>
  `${item?.media_type ?? "media"}-${item?.id ?? fallbackIndex}`;

const mergeUniqueByMediaId = (...groups) => {
  const seen = new Set();
  const merged = [];

  groups.flat().forEach((item, index) => {
    if (!item) return;

    const key = getItemKey(item, index);
    if (seen.has(key)) return;

    seen.add(key);
    merged.push(item);
  });

  return merged;
};

const normalizeHeroItem = (item, genreMap, mediaType) => ({
  ...item,
  media_type: item.media_type ?? mediaType,
  title: item.title ?? item.name ?? "Untitled",
  release_date: item.release_date ?? item.first_air_date ?? "",
  genres: (item.genres ?? item.genre_ids ?? [])
    .map((genre) =>
      typeof genre === "number"
        ? { id: genre, name: genreMap.get(genre) ?? "Unknown" }
        : genre,
    )
    .filter(Boolean),
});

export function useFeaturedHeroMedia({
  fetchPopular,
  fetchRecent,
  fetchGenres,
  mediaType = "movie",
  limit = 8,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedMedia = async () => {
      try {
        setLoading(true);
        setError(null);

        const [popularItems, recentItems, genres] = await Promise.all([
          fetchPopular(),
          fetchRecent(),
          fetchGenres ? fetchGenres() : Promise.resolve([]),
        ]);

        if (!isMounted) return;

        const genreMap = new Map(
          genres.map((genre) => [genre.id, genre.name]),
        );

        const normalizedItems = mergeUniqueByMediaId(
          popularItems,
          recentItems,
        )
          .filter((item) => item.backdrop_path || item.poster_path)
          .map((item) => normalizeHeroItem(item, genreMap, mediaType))
          .slice(0, limit);

        setItems(normalizedItems);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Unable to load featured movies.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeaturedMedia();

    return () => {
      isMounted = false;
    };
  }, [fetchPopular, fetchRecent, fetchGenres, limit, mediaType]);

  return { items, loading, error };
}

export function useHeroCarousel(items, intervalMs = DEFAULT_INTERVAL_MS) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeIndexRef = useRef(0);
  const touchStartXRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const itemCount = items.length;

  const safeActiveIndex = itemCount === 0 ? 0 : activeIndex % itemCount;
  const activeItem = items[safeActiveIndex] ?? null;

  useEffect(() => {
    activeIndexRef.current = safeActiveIndex;
  }, [safeActiveIndex]);

  const goToSlide = useCallback(
    (nextIndex) => {
      if (itemCount === 0) return;

      setActiveIndex((nextIndex + itemCount) % itemCount);
    },
    [itemCount],
  );

  const goToNext = useCallback(() => {
    goToSlide(activeIndexRef.current + 1);
  }, [goToSlide]);

  const goToPrevious = useCallback(() => {
    goToSlide(activeIndexRef.current - 1);
  }, [goToSlide]);

  const pause = useCallback(() => {
    window.clearTimeout(resumeTimeoutRef.current);
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.clearTimeout(resumeTimeoutRef.current);
    setIsPaused(false);
  }, []);

  const resumeSoon = useCallback(() => {
    window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(resume, RESUME_DELAY_MS);
  }, [resume]);

  const touchHandlers = useMemo(
    () => ({
      onTouchStart(event) {
        pause();
        touchStartXRef.current = event.touches[0]?.clientX ?? null;
      },
      onTouchEnd(event) {
        const startX = touchStartXRef.current;
        const endX = event.changedTouches[0]?.clientX ?? null;
        touchStartXRef.current = null;

        if (startX !== null && endX !== null) {
          const distance = endX - startX;

          if (Math.abs(distance) >= SWIPE_THRESHOLD_PX) {
            distance < 0 ? goToNext() : goToPrevious();
          }
        }

        resumeSoon();
      },
      onTouchCancel() {
        touchStartXRef.current = null;
        resumeSoon();
      },
    }),
    [goToNext, goToPrevious, pause, resumeSoon],
  );

  useEffect(() => {
    if (isPaused || itemCount <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % itemCount);
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs, isPaused, itemCount]);

  useEffect(
    () => () => {
      window.clearTimeout(resumeTimeoutRef.current);
    },
    [],
  );

  return {
    activeIndex: safeActiveIndex,
    activeItem,
    goToSlide,
    goToNext,
    goToPrevious,
    pause,
    resume,
    touchHandlers,
  };
}
