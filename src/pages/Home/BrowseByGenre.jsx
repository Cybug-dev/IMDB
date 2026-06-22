import { Film } from "lucide-react";
import GenreCard from "./GenreCard";
import React, { useState, useEffect } from "react";
import { fetchGenresWithImages } from "../../services/tmdb";
import { useGenreRotationEngine } from "../../hooks/useGenreRotationEngine";
import SectionState from "../../components/Section State/SectionState";

function BrowseByGenre({ onNavigate }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isLoading = Boolean(loading);
  const hasError = Boolean(error);
  const hasData = Array.isArray(genres) && genres.length > 0;

  useEffect(() => {
    let cancelled = false;

    const loadGenres = async () => {
      try {
        setLoading(true);
        setError(null);
        const genreList = await fetchGenresWithImages(6, 5);
        if (!cancelled && Array.isArray(genreList)) {
          setGenres(genreList);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load genres.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadGenres();

    return () => {
      cancelled = true;
    };
  }, []);

  const genreEngine = useGenreRotationEngine({
    genres,
    maxImagesPerGenre: 5,
    rotationMs: 11000,
  });

  const handleGenreClick = (genre) => {
    onNavigate("genre", {
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
    });
  };

  return (
    <div className="browse-by-genre">
      <h2 className="heading">
        <Film className="lucide-icon film-icon" />
        Browse by Genre
      </h2>
      <p className="description">Discover movies by your favorite genres</p>
       {isLoading || hasError || !hasData ? (
        <SectionState loading={isLoading} error={error} data={hasData ? [1] : []} />
      ) : (
       <div className="genre-list">
        {genreEngine.genres.map((genre) => (
          <GenreCard
            key={genre.id}
            genre={genre}
            currentPoster={genreEngine.getCurrentPoster(genre)}
            onClick={() => handleGenreClick(genre)}
          />
        ))}
         </div>
      )}
     
    </div>
  );
}

export default BrowseByGenre;
