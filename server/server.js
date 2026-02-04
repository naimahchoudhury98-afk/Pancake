import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8080;

let leaderboard = [
  { username: "RetroKing", score: 1500 },
  { username: "PixelQueen", score: 1200 }
];

app.get("/", (req, res) => {
  res.send("Quiz server is running");
});


app.get("/leaderboard", (req, res) => {
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
  res.status(200).json(sorted);
});

app.post("/leaderboard", (req, res) => {
  const { username, score } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({ error: "Missing username or score" });
  }

  const entry = {
    username: String(username),
    score: Number(score)
  };

  if (Number.isNaN(entry.score)) {
    return res.status(400).json({ error: "Score must be a number" });
  }

  leaderboard.push(entry);

  console.log(`New score saved: ${entry.username} - ${entry.score}`);
  res.status(201).json(entry);
});


app.delete("/leaderboard", (req, res) => {
  leaderboard = [];
  res.status(200).json({ message: "Leaderboard cleared" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
