import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  base: "/",
  build: {
    outDir: "build/client",
    emptyOutDir: true,
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: false,
    allowedHosts: true
  },
  define: {
    global: 'window',
  },
});
