const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const formatRuntime = (runtime) => {
  if (!Number.isFinite(runtime) || runtime <= 0) return "Runtime TBA";

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (!hours) return minutes + " min";
  if (!minutes) return hours + "h";

  return hours + "h " + minutes + "m";
};

const formatVoteCount = (voteCount) => {
  if (!Number.isFinite(voteCount) || voteCount <= 0) return "0";
  if (voteCount >= 1000) return (voteCount / 1000).toFixed(1) + "k";
  return String(voteCount);
};

const getImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : IMAGE_BASE_URL + path;
};

const getTrailerUrl = (videos) => {
  const trailer = videos?.results?.find(
    (video) =>
      video.site === "YouTube" &&
      video.type === "Trailer" &&
      video.official &&
      video.key,
  ) ??
    videos?.results?.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.key,
    );

  return trailer ? "https://www.youtube.com/watch?v=" + trailer.key : null;
};

const normalizeReviews = (reviews) =>
  (Array.isArray(reviews?.results) ? reviews.results : [])
    .filter((review) => review?.content)
    .slice(0, 2)
    .map((review) => ({
      id: review.id,
      author:
        review.author_details?.name ||
        review.author_details?.username ||
        review.author ||
        "TMDB member",
      rating: Number.isFinite(review.author_details?.rating)
        ? review.author_details.rating.toFixed(1)
        : null,
      content: review.content,
      date: review.created_at
        ? new Date(review.created_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : null,
      avatarUrl: getImageUrl(review.author_details?.avatar_path),
    }));

const normalizeRecommendations = (recommendations, mediaType) =>
  (Array.isArray(recommendations?.results) ? recommendations.results : [])
    .filter((title) => title?.id)
    .slice(0, 6)
    .map((title) => {
      const releaseDate = title.release_date || title.first_air_date;

      return {
        id: title.id,
        title: title.title || title.name || "Untitled movie",
        releaseYear: releaseDate ? releaseDate.slice(0, 4) : "TBA",
        posterUrl: getImageUrl(title.poster_path || title.backdrop_path),
        rating: Number.isFinite(title.vote_average)
          ? title.vote_average.toFixed(1)
          : "N/A",
        mediaType,
      };
    });

export const createMovieDetailsViewModel = (movie, mediaType) => {
  if (!movie) return null;

  const title = movie.title || movie.name || "Untitled movie";
  const releaseDate = movie.release_date || movie.first_air_date;
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : "TBA";
  const posterPath = movie.poster_path || movie.backdrop_path;
  const backdropPath = movie.backdrop_path || movie.poster_path;
  const rating = Number.isFinite(movie.vote_average)
    ? movie.vote_average.toFixed(1)
    : "N/A";

  return {
    raw: movie,
    title,
    tagline: movie.tagline,
    summary:
      movie.overview ||
      "The official storyline for this title is not available yet.",
    releaseYear,
    releaseDate,
    runtimeLabel: formatRuntime(movie.runtime),
    rating,
    audienceScore: Number.isFinite(movie.vote_average)
      ? Math.round(movie.vote_average * 10)
      : 0,
    voteCountLabel: formatVoteCount(movie.vote_count),
    director: movie.director,
    cast: Array.isArray(movie.cast) ? movie.cast : [],
    genres: Array.isArray(movie.genres) ? movie.genres : [],
    languageLabel: movie.original_language
      ? movie.original_language.toUpperCase()
      : "Not available",
    certification: movie.adult ? "18+" : null,
    mediaLabel: mediaType === "tv" ? "Series" : "Feature film",
    posterUrl: getImageUrl(posterPath),
    backdropUrl: getImageUrl(backdropPath),
    trailerUrl: getTrailerUrl(movie.videos),
    reviews: normalizeReviews(movie.reviews),
    reviewCount: Number(movie.reviews?.total_results) || 0,
    recommendations: normalizeRecommendations(movie.recommendations, mediaType),
  };
};
