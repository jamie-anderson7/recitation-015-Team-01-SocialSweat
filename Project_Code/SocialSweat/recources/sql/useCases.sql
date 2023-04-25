/*
* Makes the user with id 1 friends with user with id 2
*/
INSERT INTO friends (user_id, friend_id) VALUES (1, 2);

/*
* Finds the row where user_id = 1, should return 0 or 1 row because user_id is unique
*/
SELECT * FROM users WHERE user_id = 1;

/*
* Gets the sweats from a user with a user_id = 1
*/
SELECT sweats FROM users WHERE user_id = 1;

/*
* Gets all friend_id for a user with id 1
*/
SELECT friend_id FROM friends WHERE user_id = 1;

/*
* For leaderboard - gets the usernames and sweats of the top 5 users ordered by sweats
*/
SELECT username, sweats FROM users ORDER BY sweats DESC LIMIT 5;

