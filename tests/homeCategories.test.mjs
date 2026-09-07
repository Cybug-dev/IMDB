import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

test("homepage genre fetching keeps category data, ordering and failures isolated", async () => {
  const server = await createServer({
    configFile: false,
    envFile: false,
    define: { "import.meta.env.VITE_API_TOKEN": JSON.stringify("test-token") },
    server: { middlewareMode: true, watch: null },
    logLevel: "silent",
  });
  const originalFetch = globalThis.fetch;
  let client;
  try {
    const queries = await server.ssrLoadModule("/src/queries/movieQueries.js");
    ({ queryClient: client } = await server.ssrLoadModule("/src/queries/queryClient.js"));
    client.setDefaultOptions({ queries: { retry: false } });
    const genres = ["Romance", "Adventure", "Thriller", "Comedy", "Science Fiction"]
      .map((name, index) => ({ name, id: index + 1 }));
    const requests = [];
    let failGenre = null;
    globalThis.fetch = async (url) => {
      const parsed = new URL(url);
      requests.push(parsed);
      if (parsed.pathname.endsWith("/genre/movie/list")) {
        return { ok: true, json: async () => ({ genres }) };
      }
      assert.equal(parsed.pathname, "/3/discover/movie");
      assert.equal(parsed.searchParams.get("page"), "1");
      assert.equal(parsed.searchParams.get("sort_by"), "popularity.desc");
      const genreId = Number(parsed.searchParams.get("with_genres"));
      if (genreId === failGenre) return { ok: false, status: 503, json: async () => ({ status_message: "Unavailable" }) };
      return { ok: true, json: async () => ({ results: [2, 1].map((id) => ({
        id: genreId * 100 + id, title: `Movie ${id}`, overview: "Overview",
        poster_path: "/poster.jpg", release_date: "2024-01-01", vote_average: 7,
        genre_ids: [genreId],
      })) }) };
    };
    for (const genre of genres) {
      const movies = await queries.fetchHomeCategoryMovies(genre.name);
      assert.deepEqual(movies.map((movie) => movie.id), [genre.id * 100 + 2, genre.id * 100 + 1]);
      assert.ok(movies.every((movie) => movie.media_type === "movie" && movie.genres[0].name === genre.name));
    }
    assert.equal(requests.filter((url) => url.pathname.endsWith("/genre/movie/list")).length, 1);
    assert.equal((await queries.fetchHomeCategoryMovies("Romance", 1)).length, 1);
    const requestCount = requests.length;
    assert.deepEqual(await queries.fetchHomeCategoryMovies("Missing genre"), []);
    assert.equal(requests.length, requestCount);
    client.clear();
    failGenre = 1;
    await assert.rejects(queries.fetchHomeCategoryMovies("Romance"), /Unavailable/);
    assert.equal((await queries.fetchHomeCategoryMovies("Comedy")).length, 2);
  } finally {
    globalThis.fetch = originalFetch;
    client?.clear();
    await server.close();
  }
});
