import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];
  
  // Only include lovable-tagger if available
  try {
    const { componentTagger } = require("lovable-tagger");
    if (mode === "development") {
      plugins.push(componentTagger());
    }
  } catch (e) {
    // lovable-tagger not available, skip it
  }

  return {
    server: {
      host: "0.0.0.0", // Bind to all IPv4 interfaces - Chrome localhost fix
      port: 8080,
      strictPort: false,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
