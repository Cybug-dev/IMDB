import test from "node:test";
import assert from "node:assert/strict";
import { getMovieKey, getMoviePath, parseCollections, toggleMovie } from "../src/utils/movieCollections.js";

const movie = { id: 42, title: "A movie", poster_path: "/poster.jpg", media_type: "movie" };

test("toggle adds and removes without mutating the previous list", () => {
  const empty = [];
  const added = toggleMovie(empty, movie);
  assert.deepEqual(empty, []);
  assert.deepEqual(added, [movie]);
  assert.deepEqual(toggleMovie(added, movie), []);
  assert.equal(added.length, 1);
});

test("movie and TV titles with matching IDs remain independent", () => {
  const tv = { ...movie, media_type: "tv" };
  const items = toggleMovie(toggleMovie([], movie), tv);
  assert.equal(items.length, 2);
  assert.deepEqual(toggleMovie(items, movie), [tv]);
  assert.equal(getMoviePath(movie), "/movie/42");
  assert.equal(getMoviePath(tv), "/tv/42");
});

test("saved state survives serialization without large detail payloads", () => {
  const watchlist = toggleMovie([], { ...movie, credits: { cast: [1] }, reviews: { results: [1] } });
  const saved = parseCollections(JSON.stringify({ watchlist, favorites: [movie] }));
  assert.deepEqual(saved, { watchlist: [movie], favorites: [movie] });
  assert.deepEqual(toggleMovie(saved.favorites, movie), []);
  assert.deepEqual(saved.watchlist, [movie]);
});

test("invalid storage is safely ignored and records are validated/deduplicated", () => {
  for (const value of [null, "broken JSON", "null", "[]"]) {
    assert.deepEqual(parseCollections(value), { watchlist: [], favorites: [] });
  }
  const saved = parseCollections(JSON.stringify({ watchlist: [movie, movie, null, {}, { id: -1 }, { id: 9, media_type: "person" }], favorites: "invalid" }));
  assert.deepEqual(saved, { watchlist: [movie], favorites: [] });
});

test("numeric/string IDs match and TV type is inferred from API data", () => {
  assert.equal(getMovieKey({ ...movie, id: "42" }), getMovieKey(movie));
  assert.deepEqual(toggleMovie([movie], { ...movie, id: "42" }), []);
  assert.equal(getMovieKey({ id: 42, first_air_date: "2024-01-01" }), "tv:42");
});

test("invalid actions leave state unchanged", () => {
  const items = [movie];
  assert.equal(toggleMovie(items, null), items);
  assert.equal(toggleMovie(items, { id: "not-an-id" }), items);
});
