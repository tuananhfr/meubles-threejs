import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: "src/main.tsx",
      name: "Shelf3DBlock",
      fileName: "block",
      formats: ["iife"],
    },
    rollupOptions: {
      external: [],
      output: {
        // Expose global variable để Drupal có thể gọi
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
