import { Film } from "lucide-react";
import { useHomeCategoryMovies } from "../../queries/movieQueries";
import FeaturedMovies from "./FeatureMovies";

const CATEGORIES = ["Romance", "Adventure", "Thriller", "Comedy", "Science Fiction"];

function HomeMovieCategory({ genre }) {
  const { data = [], isPending, error, refetch } = useHomeCategoryMovies(genre);
  return (
    <FeaturedMovies
      title={`${genre} Movies`}
      movies={data}
      LeftIcon={Film}
      loading={isPending}
      error={error?.message}
      onRetry={refetch}
    />
  );
}

export default function HomeMovieCategories() {
  return CATEGORIES.map((genre) => <HomeMovieCategory key={genre} genre={genre} />);
}
