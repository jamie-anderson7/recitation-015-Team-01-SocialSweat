CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    sweats INT NOT NULL
);

CREATE TABLE IF NOT EXISTS friends (
    user_id INT NOT NULL,
    friend_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS users_to_workouts (
    user_id INT NOT NULL,
    workout_name TEXT,
    day INT,
    hour INT,
    minute INT
);

CREATE TABLE IF NOT EXISTS workouts (
    workout_id SERIAL PRIMARY KEY,
    name TEXT,
    difficulty TEXT,
    instructions TEXT
);

CREATE TABLE IF NOT EXISTS calendar_workouts (
    user_id INT,
    workout_id SERIAL PRIMARY KEY,
    workout TEXT NOT NULL,
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    CONSTRAINT foreign_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
);

/* Creating a valid user for lab 11, the big string is the bcrypt of 'password' */
INSERT INTO users (username, password, sweats) VALUES ('username', '$2b$10$RGXLdsgTg9A7aRnAB1ZRPuCAnvFAy5kgIKPJ115VeVFsYMLO5ClXK', 0);

INSERT INTO calendar_workouts (user_id, workout, day, time) VALUES (1, 'Squats', 'Tuesday', '12:30');
INSERT INTO calendar_workouts (user_id, workout, day, time) VALUES (1, 'Jumping Jacks', 'Friday', '09:30');
INSERT INTO calendar_workouts (user_id, workout, day, time) VALUES (1, 'Basketball', 'Monday', '10:30');
