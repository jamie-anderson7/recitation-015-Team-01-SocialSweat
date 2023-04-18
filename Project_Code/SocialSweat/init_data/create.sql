CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50),
    password VARCHAR(100)
);

/* Creating a valid user for lab 11 */
INSERT INTO users (username, password) VALUES ('username', 'password');