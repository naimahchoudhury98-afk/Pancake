import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = new pg.Pool({
  connectionString: process.env.DB_CONN
});

async function initDB() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        username TEXT NOT NULL,
        score INT NOT NULL
      );
    `);
    console.log("Leaderboard table ready");
  } catch (err) {
    console.error("DB init error:", err);
  }
}

initDB();

const PORT = 8080;

app.get("/", (req, res) => {
  res.send("Quiz server is running");
});

app.get("/leaderboard", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT username, score
       FROM leaderboard
       ORDER BY score DESC
       LIMIT 10`
    );



    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET /leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

app.post("/leaderboard", async (req, res) => {
  try {
    const { username, score } = req.body;

    if (!username || score === undefined) {
      return res.status(400).json({ error: "Missing username or score" });
    }

    const cleanUsername = String(username).trim();
    const cleanScore = Number(score);

    if (!cleanUsername) {
      return res.status(400).json({ error: "Username cannot be empty" });
    }

    if (Number.isNaN(cleanScore)) {
      return res.status(400).json({ error: "Score must be a number" });
    }

    const result = await db.query(
      `INSERT INTO leaderboard (username, score)
       VALUES ($1, $2)
       RETURNING username, score`,
      [cleanUsername, cleanScore]
    );

    console.log(`New score saved: ${cleanUsername} - ${cleanScore}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /leaderboard error:", err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});