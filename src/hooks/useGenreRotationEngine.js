import { useEffect, useRef, useState } from "react";

const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_ROTATION_MS = 5000;

const normalizeGenres = (genres, maxImagesPerGenre) =>
  genres.map((genre) => ({
    ...genre,
    posters: Array.from(new Set((genre.posters ?? []).filter(Boolean))).slice(
      0,
      maxImagesPerGenre,
    ),
  }));

const buildInitialIndexes = (genres) =>
  genres.reduce((acc, genre) => {
    acc[genre.id] = 0;
    return acc;
  }, {});
export function useGenreRotationEngine({
  genres,
  maxImagesPerGenre = DEFAULT_MAX_IMAGES,
  rotationMs = DEFAULT_ROTATION_MS,
}) {
  const mountedRef = useRef(false); 
  const imageStatusRef = useRef(new Map());
  const normalizedGenres = normalizeGenres(genres, maxImagesPerGenre);

  const [posterIndexes, setPosterIndexes] = useState(() =>
    buildInitialIndexes(normalizedGenres),
  );
  const [, setImageLoadVersion] = useState(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const cleanupImageHandlers = [];
    const activeGenres = normalizeGenres(genres, maxImagesPerGenre);

    for (const genre of activeGenres) {
      for (const posterUrl of genre.posters) {
        const currentStatus = imageStatusRef.current.get(posterUrl);

        if (
          currentStatus === "loading" ||
          currentStatus === "loaded" ||
          currentStatus === "error"
        ) {
          continue;
        }

        const image = new Image();
        imageStatusRef.current.set(posterUrl, "loading");

        image.onload = () => {
          imageStatusRef.current.set(posterUrl, "loaded");

          if (mountedRef.current) {
            setImageLoadVersion((version) => version + 1);
          }
        };

        image.onerror = () => {
          imageStatusRef.current.set(posterUrl, "error");

          if (mountedRef.current) {
            setImageLoadVersion((version) => version + 1);
          }
        };

        image.src = posterUrl;

        cleanupImageHandlers.push(() => {
          image.onload = null;
          image.onerror = null;
        });
      }
    }

    return () => {
      cleanupImageHandlers.forEach((cleanup) => cleanup());
    };
  }, [genres, maxImagesPerGenre]);

  useEffect(() => {
    const activeGenres = normalizeGenres(genres, maxImagesPerGenre);

    const intervalId = window.setInterval(() => {
      setPosterIndexes((previousIndexes) => {
        let changed = false;
        const nextIndexes = { ...previousIndexes };

        for (const genre of activeGenres) {
          const posters = genre.posters;

          if (posters.length <= 1) {
            continue;
          }

          const currentIndex = previousIndexes[genre.id] ?? 0;

          for (let step = 1; step <= posters.length; step += 1) {
            const candidateIndex = (currentIndex + step) % posters.length;
            const candidateUrl = posters[candidateIndex];

            if (imageStatusRef.current.get(candidateUrl) === "loaded") {
              if (candidateIndex !== currentIndex) {
                nextIndexes[genre.id] = candidateIndex;
                changed = true;
              }

              break;
            }
          }
        }

        return changed ? nextIndexes : previousIndexes;
      });
    }, rotationMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [genres, maxImagesPerGenre, rotationMs]);

  const getCurrentPoster = (genre) => {
    const posters = genre.posters ?? [];

    if (posters.length === 0) {
      return "";
    }

    const currentIndex = posterIndexes[genre.id] ?? 0;
    const currentPoster = posters[currentIndex];

    if (imageStatusRef.current.get(currentPoster) === "loaded") {
      return currentPoster;
    }

    return (
      posters.find(
        (posterUrl) => imageStatusRef.current.get(posterUrl) === "loaded",
      ) ?? posters[0]
    );
  };

  return {
    genres: normalizedGenres,
    getCurrentPoster,
  };
}
