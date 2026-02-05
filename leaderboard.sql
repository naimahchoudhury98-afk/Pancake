CREATE TABLE leaderboard (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT,
    score INT
);

INSERT INTO leaderboard (username, score) 
VALUES 
('Callum','500'),
('Albert', '1500'),
('Naimah', '200'),
('Patience', '800')
