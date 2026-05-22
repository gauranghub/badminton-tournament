import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve built frontend
app.use(express.static(path.join(__dirname, "dist")));

// Generic JSON file endpoint factory
function jsonEndpoint(filename) {
  const file = path.join(__dirname, "src", "data", filename);
  return {
    get(req, res) {
      try {
        res.json(JSON.parse(fs.readFileSync(file, "utf-8")));
      } catch {
        res.json([]);
      }
    },
    post(req, res) {
      try {
        fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
        res.json({ ok: true });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    },
  };
}

const matchesApi = jsonEndpoint("matches.json");
const teamsApi   = jsonEndpoint("teams.json");

app.get("/api/matches",  matchesApi.get);
app.post("/api/matches", matchesApi.post);
app.get("/api/teams",    teamsApi.get);
app.post("/api/teams",   teamsApi.post);

// All other routes → serve the React app
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "dist", "index.html"))
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
