import MovieCard from "../pages/Movies/MovieCard";
import { useMovieActions } from "../context/MovieCollectionsContext";

// Connect any presentational card without duplicating its markup or fetching data.
export default function MovieCardWithCollections({ movie, component = MovieCard, ...props }) {
  const Card = component;
  const actions = useMovieActions(movie);
  return <Card {...props} movie={movie} {...actions} />;
}
