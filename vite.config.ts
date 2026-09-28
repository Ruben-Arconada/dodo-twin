import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages sirve el proyecto en https://ruben-arconada.github.io/dodo-twin/.
// En desarrollo se usa la raíz para que http://localhost:5173/ funcione tal cual.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/dodo-twin/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  build: {
    target: "es2022",
    // Three.js domina el paquete; se acepta un único chunk de ~1 MB (≈280 kB gzip).
    chunkSizeWarningLimit: 1400,
  },
}));
