import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Safe way to load your environment variables during the build phase
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    // Access your variable using the loaded env object instead of import.meta
    base: env.VITE_BASE_PATH || "/IMDB",
  };
});
