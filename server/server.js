import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
    
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const db = new pg.Pool({
    connectionString: process.env.DB_CONN
});

app.get('/', (req, res) => {
    res.send('Connected');
});

app.get('/leaderboard', async (req, res) => {
    try {
        const data = await db.query(`SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10`);
        res.status(200).json(data.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

app.post("/leaderboard", async (req, res) => {
    const { username, score } = req.body;
    try {
        await db.query(
            "INSERT INTO leaderboard (username, score) VALUES ($1, $2)",
            [username, score]
        );
        res.status(201).json({ message: "scores added" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add score" });
    }
});

app.listen(8080, () => {
    console.log(`Server started on http://localhost:8080`);
});
