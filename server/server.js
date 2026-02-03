import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pg from "pg"
    
const app = express()
app.use(express.json())
app.use(cors())
dotenv.config()

    
const db = new pg.Pool({
    connectionString: process.env.DB_CONN
})

app.get('/', (req, res) => {
    res.send('Connected')
})

app.get('/leaderboard', async (req, res) => {
    const data = await db.query(`SELECT * FROM leaderboard`)
    const leaderboard = data.rows
    res.status(200).json(leaderboard)
})

app.post('/leaderboard', async (req, res) => {
    const userData = req.body
})

 const dbQuery = await db.query(`INSERT INTO leaderboard (username, score) VALUES ($1, $2)`, [userData.username, userData.score])

    res.status(200).json({message: "scores added"})

app.listen(1000, () => {
    console.log(`Server started on port http://localhost:1000`)
})