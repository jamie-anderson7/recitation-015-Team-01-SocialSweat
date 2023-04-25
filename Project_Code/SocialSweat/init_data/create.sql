CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    sweats INT NOT NULL
);

CREATE TABLE IF NOT EXISTS friends (
    user_id INT NOT NULL,
    firend_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS users_to_workouts (
    user_id INT NOT NULL,
    workout_id INT
);

CREATE TABLE IF NOT EXISTS workouts (
    workout_id SERIAL PRIMARY KEY,
    name TEXT,
    level INT,
    sweats INT
);

/* Creating a valid user for lab 11, the big string is the bcrypt of 'password' */
INSERT INTO users (username, password, sweats) VALUES ('username', '$2b$10$RGXLdsgTg9A7aRnAB1ZRPuCAnvFAy5kgIKPJ115VeVFsYMLO5ClXK', 0);
