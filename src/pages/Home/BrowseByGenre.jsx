import { Film } from "lucide-react";
import GenreCard from "./GenreCard";
import { useGenresWithImages } from "../../queries/movieQueries";
import { useGenreRotationEngine } from "../../hooks/useGenreRotationEngine";
import SectionState from "../../components/Section State/SectionState";

function BrowseByGenre({ onNavigate }) {
  const {
    data: genres = [],
    error,
    isPending,
    refetch,
  } = useGenresWithImages(6, 5);
  const isLoading = Boolean(isPending);
  const hasError = Boolean(error);
  const hasData = Array.isArray(genres) && genres.length > 0;

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
        <SectionState
          loading={isLoading}
          error={error}
          data={hasData ? [1] : []}
          loadingMessage="Loading genres..."
          emptyTitle="No genres found"
          emptyMessage="There are no genres available right now."
          onRetry={refetch}
        />
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
