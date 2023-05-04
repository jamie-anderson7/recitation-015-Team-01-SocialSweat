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
INSERT INTO users (username, password, sweats) VALUES ('Other user 1', '$2b$10$RGXLdsgTg9A7aRnAB1ZRPuCAnvFAy5kgIKPJ115VeVFsYMLO5ClXK', 200);
INSERT INTO users (username, password, sweats) VALUES ('Other user 2', '$2b$10$RGXLdsgTg9A7aRnAB1ZRPuCAnvFAy5kgIKPJ115VeVFsYMLO5ClXK', 500);
INSERT INTO users (username, password, sweats) VALUES ('Other user 3', '$2b$10$RGXLdsgTg9A7aRnAB1ZRPuCAnvFAy5kgIKPJ115VeVFsYMLO5ClXK', 100);
INSERT INTO users (username, password, sweats) VALUES ('Other user 4', '$2b$10$RGXLdsgTg9A7aRnAB1ZRPuCAnvFAy5kgIKPJ115VeVFsYMLO5ClXK', 600);
INSERT INTO users (username, password, sweats) VALUES ('Other user 5', '$2b$10$RGXLdsgTg9A7aRnAB1ZRPuCAnvFAy5kgIKPJ115VeVFsYMLO5ClXK', 700);
INSERT INTO users (username, password, sweats) VALUES ('Other user 6', '$2b$10$RGXLdsgTg9A7aRnAB1ZRPuCAnvFAy5kgIKPJ115VeVFsYMLO5ClXK', 300);
INSERT INTO users (username, password, sweats) VALUES ('Other user 7', '$2b$10$RGXLdsgTg9A7aRnAB1ZRPuCAnvFAy5kgIKPJ115VeVFsYMLO5ClXK', 400);


INSERT INTO friends (user_id, friend_id) VALUES (1, 2);
INSERT INTO friends (user_id, friend_id) VALUES (2, 1);

INSERT INTO friends (user_id, friend_id) VALUES (1, 3);
INSERT INTO friends (user_id, friend_id) VALUES (3, 1);

INSERT INTO friends (user_id, friend_id) VALUES (1, 4);
INSERT INTO friends (user_id, friend_id) VALUES (4, 1);

INSERT INTO friends (user_id, friend_id) VALUES (1, 4);
INSERT INTO friends (user_id, friend_id) VALUES (4, 1);

INSERT INTO calendar_workouts (user_id, workout, day, time) VALUES (1, 'Squats', 'Tuesday', '12:30');
INSERT INTO calendar_workouts (user_id, workout, day, time) VALUES (1, 'Jumping Jacks', 'Friday', '09:30');
INSERT INTO calendar_workouts (user_id, workout, day, time) VALUES (1, 'Basketball', 'Monday', '10:30');
