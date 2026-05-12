import { Film } from "lucide-react";
import GenreCard from "./GenreCard";
import React, { useState, useEffect } from "react";
import { fetchGenresWithImages } from "../../services/tmdb";
import { useGenreRotationEngine } from "../../hooks/useGenreRotationEngine";

function BrowseByGenre({ onNavigate }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetchGenresWithImages(6, 5)
      .then((genreList) => {
        if (!cancelled && Array.isArray(genreList)) {
          setGenres(genreList);
        }
      })
      .catch((error) => {
        console.warn("Failed to load genre posters:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const genreEngine = useGenreRotationEngine({
    genres,
    maxImagesPerGenre: 5,
    rotationMs: 5000,
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
        <Film className="icon" />
        Browse by Genre
      </h2>
      <p className="description">Discover movies by your favorite genres</p>
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
    </div>
  );
}

export default BrowseByGenre;
