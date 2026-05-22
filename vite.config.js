import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

function makeEndpoint(file) {
  return (req, res) => {
    if (req.method === "GET") {
      res.setHeader("Content-Type", "application/json");
      res.end(fs.readFileSync(file, "utf-8"));
      return;
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", () => {
        try {
          fs.writeFileSync(file, JSON.stringify(JSON.parse(body), null, 2));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }
    res.statusCode = 405;
    res.end();
  };
}

const dataPersistPlugin = () => ({
  name: "data-persist",
  configureServer(server) {
    server.middlewares.use("/api/matches", makeEndpoint(path.resolve("src/data/matches.json")));
    server.middlewares.use("/api/teams",   makeEndpoint(path.resolve("src/data/teams.json")));
  },
});

export default defineConfig({
  plugins: [react(), dataPersistPlugin()],
  server: {
    port: 5173,
    open: true,
    watch: {
      // Prevent HMR loop when the app writes back to matches.json
      ignored: ["**/src/data/matches.json", "**/src/data/teams.json"],
    },
  },
});
