import { useEffect, useRef, useState } from "react";

const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_ROTATION_MS = 10000;

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

const findNextLoadedIndex = (posters, currentIndex, imageStatusRef) => {
  for (let step = 1; step <= posters.length; step += 1) {
    const candidateIndex = (currentIndex + step) % posters.length;
    const candidateUrl = posters[candidateIndex];

    if (imageStatusRef.current.get(candidateUrl) === "loaded") {
      return candidateIndex;
    }
  }

  return currentIndex;
};

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
    const timeoutIds = [];
    const intervalIds = [];

    const advanceGenre = (genre) => {
      setPosterIndexes((previousIndexes) => {
        const posters = genre.posters;

        if (posters.length <= 1) {
          return previousIndexes;
        }

        const currentIndex = previousIndexes[genre.id] ?? 0;
        const nextIndex = findNextLoadedIndex(
          posters,
          currentIndex,
          imageStatusRef,
        );

        if (nextIndex === currentIndex) {
          return previousIndexes;
        }

        return {
          ...previousIndexes,
          [genre.id]: nextIndex,
        };
      });
    };

    for (const genre of activeGenres) {
      if (genre.posters.length <= 1) {
        continue;
      }

      const initialDelay = Math.random() * rotationMs;
      const timeoutId = window.setTimeout(() => {
        advanceGenre(genre);

        const intervalId = window.setInterval(() => {
          advanceGenre(genre);
        }, rotationMs);

        intervalIds.push(intervalId);
      }, initialDelay);

      timeoutIds.push(timeoutId);
    }

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      intervalIds.forEach((intervalId) => window.clearInterval(intervalId));
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
