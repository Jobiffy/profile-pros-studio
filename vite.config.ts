import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Production is served at https://dev.jobiffy.co/ai-resume-builder/.
  // Dev (npm run dev) keeps "/" so localhost works as before.
  // BrowserRouter reads import.meta.env.BASE_URL so this single switch
  // also fixes client-side routing.
  base: mode === "production" ? "/ai-resume-builder/" : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
