 The Final – Quiz Game
 
 Created by Albert, Patience, Callum & Naimah


 Project Overview

The Final is an interactive trivia quiz game that challenges users’ general knowledge through multiple-choice questions sourced from a public API. The game includes lifelines, visual feedback, score tracking, and a competitive leaderboard to encourage engagement and replayability.

PROBLEM DOMAIN

Users want to play a quiz game with medium level difficulty and a classic gaming feel.

🕹️ Features

- API-driven trivia questions
- Multiple-choice answers with instant visual feedback
- Score and life tracking system
- Leaderboard displaying top scores
- Responsive, mobile-first design
- 
Lifelines:
- 50/50 – removes two incorrect answers
- Free Pass – skips a question without penalty

🧑‍💻 Technologies Used

- HTML
- CSS (mobile-first, media queries)
- JavaScript
- Open Trivia Database API
- Node.js & Express
- Supabase (PostgreSQL)
- Render (deployment)

🤝 Team Contributions
  
Front End Development
- Naimah
- Albert

Worked on:

- User interface and layout
- Quiz flow and game logic
- Lifelines functionality
- Visual feedback (correct/incorrect answers)
- Responsive design and mobile-first styling
- Single-page navigation and user experience

Back End Development
- Patience
- Callum

Worked on:

- Server-side logic using Node.js and Express
- API routes for leaderboard data
- Database integration using Supabase (PostgreSQL)
- Handling data persistence and retrieval
- Deployment configuration and server setup

Although roles were defined, all team members supported one another where needed and collaborated to solve problems throughout the project.

🛠️ Setup Instructions (New Users)

1) Clone the repository
   
git clone git@github.com:naimahchoudhury98-afk/Pancake.git

cd Pancake

2) Navigate to the server folder and install the necessary node modules:

cd server

npm install

3) Create a .env file inside the server folder and add:

DB_CONN=YOUR_SUPABASE_DATABASE_CONNECTION_STRING

4) Start the server:

node server.js

5) Create the database schema by running the SQL commands in leaderboard.sql in your database (eg. by running the commands in Supabase Query Editor)

6) Set up the client (frontend)

Open a new terminal window, then run:

cd client

npm install

npm run dev

7) View the app

Open your browser and go to:

http://localhost:5173

Deployment

This project is deployed using Render and follows a client–server architecture.

Front End (Client)

The front end of the application is deployed on Render and provides the user interface for the quiz game.
Users can access the live application at:

https://pancake-client.onrender.com

Back End (Server)

The back end is deployed separately on Render and handles API requests, leaderboard functionality, and database communication with Supabase.
The server API is available at:

https://pancake-tx1r.onrender.com

Client–Server Communication

The front end communicates with the back end via HTTP requests. For example, leaderboard data is fetched from the server using the /leaderboard endpoint. This separation improves scalability and allows the application to function reliably in a deployed environment.

 Credits
 
Trivia questions provided by the Open Trivia Database API.
