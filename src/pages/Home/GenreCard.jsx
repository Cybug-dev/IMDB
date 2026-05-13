import { useCallback, useEffect, useRef, useState } from "react";

const EMPTY_LAYERS = ["", ""];

const loadImage = async (src) => {
  const image = new Image();
  image.decoding = "async";

  const loaded = new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  image.src = src;

  if (image.decode) {
    await image.decode();
    return src;
  }

  await loaded;

  return src;
};
function GenreCard({ genre, currentPoster, onClick }) {
  const [imageState, setImageState] = useState(() => ({
    activeLayer: 0,
    incomingLayer: null,
    phase: "idle",
    sources: currentPoster ? [currentPoster, ""] : EMPTY_LAYERS,
  }));

 const imageStateRef = useRef(imageState);
 const requestIdRef = useRef(0);
 const frameRef = useRef(null);
  useEffect(() => {
   imageStateRef.current = imageState;
 }, [imageState]);

 useEffect(() => {
  if (!currentPoster) return undefined;

  const { activeLayer, sources } = imageStateRef.current;

  if (currentPoster === sources[activeLayer]) {
    return undefined;
  }

  const requestId = ++requestIdRef.current;

  loadImage(currentPoster)
  .then((loadedPoster) => {
    if (requestIdRef.current !== requestId) return;

        setImageState((previousState) => {
          if (loadedPoster === previousState.sources[previousState.activeLayer]) {
            return previousState;
          }

          const incomingLayer = 1 - previousState.activeLayer;
          const nextSources = [...previousState.sources];
          nextSources[incomingLayer] = loadedPoster;

          return {
            ...previousState,
            incomingLayer,
            phase: "primed",
            sources: nextSources,
          };
        });

         if (frameRef.current) {
          window.cancelAnimationFrame(frameRef.current);
         }

         frameRef.current = window.requestAnimationFrame (() => {
          frameRef.current = null;

          if (requestIdRef.current !== requestId) return;

          setImageState((previousState) => {
            if (previousState.phase !== "primed") {
              return previousState;
            }

            return {
              ...previousState,
              phase: "crossfading",
            };
           });
         });
    })
    .catch(() => {
           // Keep the current decoded poster mounted if the next one fails.
    });
   
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [currentPoster]);

  const handleImageTransitionEnd = useCallback((event) => {
    if (event.propertyName !== "opacity") return;

    const layer = Number(event.currentTarget.dataset.layer);

    setImageState((previousState) => {
      if (
        previousState.phase !== "crossfading" ||
        previousState.incomingLayer !== layer
      ) {
        return previousState;
      }

      const nextSources = [...previousState.sources];
      nextSources[previousState.activeLayer] = "";

      return {
        activeLayer: previousState.incomingLayer,
        incomingLayer: null,
        phase: "idle",
        sources: nextSources,
      };
    });
  }, []);

  return (
    <button
      type="button"
      className="genre-card heading"
      onClick={onClick}
      aria-label={`Browse ${genre.name} movies`}
    >
  <div className="genre-card__image-stack">
    {imageState.sources.map((source, layer) => {
      if (!source) return null;

      const isActive = layer === imageState.activeLayer;
      const isIncoming = layer === imageState.incomingLayer;
      const shouldShow = isActive || (isIncoming && imageState.phase === "crossfading");

          return (
            <img
              key={layer}
              data-layer={layer}
              src={source}
              alt=""
              decoding="async"
              loading="eager"
              onTransitionEnd={handleImageTransitionEnd}
              className={`genre-card__image ${
                shouldShow ? "is-visible" : ""
              } ${
                isIncoming ? "is-top" : ""
              }`}
            />
          );
        })}
      </div>
      <div className="genre-card__overlay" />
      <span className="genre-name">{genre.name}</span>
    </button>
  );
}
export default GenreCard;
