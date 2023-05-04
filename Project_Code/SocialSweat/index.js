// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const multer = require('multer')
const app = express();
const fs = require('fs');
const path = require('path')
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.


// Define the folder where the images are located
const imgDir = path.join(__dirname, 'resources', 'img');

// Define the server endpoint to handle the GET request for a random image
app.get('/get-random-image', (req, res) => {
  // Read the files in the image folder
  fs.readdir(imgDir, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * files.length);
    const randomImg = files[randomIndex];
    const imgSrc = randomImg;
    
    // Send the image source URL as a response
    res.send(imgSrc);
    console.log('Random image selected:', randomImg);
  });
});

app.set('view engine', 'ejs'); // set the view engine to EJS
// app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
// console.log(path.join(__dirname,'/resources/img'));
app.use(express.static(path.join(__dirname,'/resources/img')));
app.use(express.static(__dirname + '/public'));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);



// console.log(path.join(__dirname,'/recources/img'));
// app.use(express.static(path.join(__dirname,'/recources/img')));

//or do this:
//import home from 'Project_Code\SocialSweat\recources\img\home.png' 

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************



// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);



app.get("/", (req, res) => {
  res.render("pages/login")
});


// Register

app.get("/register", (req, res) => {
  res.render("pages/register")
});

app.post("/register", async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  // To-DO: Insert username and hashed password into 'users' table
  let ins = `INSERT INTO users (username, password, sweats) VALUES ('${req.body.username}', '${hash}',0);`;
  let check = `SELECT * FROM users WHERE username = '${req.body.username}'`;
  db.any(check)
  .then((checkResult) => {
    console.log(checkResult);
    // This checks if any rows were returned
    if(checkResult.length < 1)
    {
      db.any(ins)
      .then(data => {
        res.render("pages/login", {
          message: 'User added successfully',
          color: 'green'
        });
      })
      .catch((error) => {
        console.log(error);
      });
    } 
    // This case means that there are not any users that match the friend use id
    else
    {
          res.render("pages/register", {
            message : 'Error, username already exists, pick a different one',
            color : 'red'
          });
    }
  })
  .catch( (err) => {
    console.log(err);
      res.redirect("/register");
  });
});

//LeaderBoard
app.get('/leaderboard', (req, res) => {
  try {let query = `SELECT users.user_id, sweats, username FROM users
  INNER JOIN friends
  ON friends.user_id = '${req.session.user.user_id}' AND users.user_id = friends.friend_id ORDER BY sweats LIMIT 6;`;

  db.any(query)
  .then(results => {
    res.render('pages/leaderboard', {
      friends : results,
      userID : req.session.user.user_id
    });
  })
  .catch( (err) => {
    console.log(err);
    res.redirect("/workouts");
  });} 
  catch (error) {
    console.error(error);
    //need message for error
    res.render("pages/login")
    // Expected output: ReferenceError: nonExistentFunction is not defined
    // (Note: the exact output may be browser-dependent)
  }
});


// Set up multer storage and limits
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'resources/img');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB
  }
});


app.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file);
  res.send('File uploaded successfully!');
});

//Home
app.get('/home', (req, res) => {
  res.render('pages/home.ejs');
});

//

// Login Routes
app.get("/login", (req, res) => {
  res.render("pages/login.ejs");
});

app.post("/login", async (req, res) => {

  const InputUser = req.body.username;
  const InputPass = req.body.password;
  

  const query = `SELECT * FROM users WHERE users.username = '${req.body.username}';`;
  
  db.one(query)
  .then( async (user) => {
    if(user.length)
    {
      res.render('pages/register', {
        message : 'User does not exist',
        color: 'red'
      });
    }
    
    // check if password from request matches with password in DB

    //For the purposes of lab 11 I am commenting this out
    const match = await bcrypt.compare(req.body.password, user.password);

    // This is also changed from if(match === true){}
    if(match === true){
      //save user details in session like in lab 8
      
      // Commented out because there is no discover page
      req.session.user = user;
      req.session.save();
      res.redirect('/workouts');
  
    }
    else{
      // res.render("partials/message", {
      //   message : 'Incorrect username or password',
      //   error : true
      // });
      // console.log('Incorrect username or password.');

      res.render('pages/login', {
        message: 'Incorrect username or password',
        color: 'red'
      });
      //work on getting modal to display, currently just reloads login page
      // res.status(200).json({
      //   message: 'Incorrect username or password'
      // });
      
    }
  })
  .catch((error) => {
    console.log(error)
    res.render('pages/register', {
      message : 'User does not exist',
      color: 'red'
    });
  })


});

app.post('/addFriend', (req, res) => {
  let friend = req.body.friendID;
  let user = req.session.user.user_id;

  let addForward = `INSERT INTO friends (user_id, friend_id) VALUES ('${user}', '${friend}');`;
  let addReverse = `INSERT INTO friends (user_id, friend_id) VALUES ('${friend}', '${user}');`;
  let check = `SELECT * FROM users WHERE user_id = '${friend}';`;
  let checkAlreadyFriends = `SELECT * FROM friends WHERE friend_id = '${friend}' AND user_id = '${user}'`;
  // Required to render the leaderboard multiple times
  let query = `SELECT users.user_id, sweats, username FROM users
  INNER JOIN friends
  ON friends.user_id = '${req.session.user.user_id}' AND users.user_id = friends.friend_id ORDER BY sweats LIMIT 6;`;

  db.any(check)
  .then((checkResult) => {
    // This checks if any rows were returned
    if(checkResult.length > 0)
    {
      db.any(checkAlreadyFriends)
      .then((alreadyFriendsResult) => {
        if(alreadyFriendsResult.length > 0)
        {
          // Passes friends back to leaderboard
          db.any(query)
          .then(friendsResult => {
            // Renders leaderboard and message
            res.render("pages/leaderboard", {
              message: 'Cannot add, already friends with that user',
              friends: friendsResult,
              userID: req.session.user_id
            });
          })
          .catch( (err) => {
            console.log(err);
          });
        }
        else
        {
          // Adds to friends table
          db.task('addFriend', (task) => {
            return task.batch([task.any(addForward), task.any(addReverse)]);
          })
          .then((data) => {
            // Passes friends back to leaderboard
            db.any(query)
            .then(friendsResult => {
              // Renders leaderboard and message
              res.render("pages/leaderboard", {
                message: 'Friend added successfully.',
                friends: friendsResult,
                userID: req.session.user_id
              });
            })
            .catch( (err) => {
              console.log(err);
            });
            
          })
          .catch((error) => {
            console.log(error);
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    } 
    // This case means that there are not any users that match the friend use id
    else
    {
      
      // Passes friends back to leaderboard
      db.any(query)
      .then(friendsResult => {
        // Renders leaderboard and message
        res.render("pages/leaderboard", {
          message : 'Cannot add friend, user ID does not exist.',
          friends: friendsResult,
          userID: req.session.user_id
        });
      })
      .catch( (err) => {
        console.log(err);
      });
      
    }
  })
  .catch( (err) => {
    console.log(err);
  });
});


  app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  //   const options = {
  //     method: 'GET',
  //     url: 'https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises',
  //     params: {muscle: 'biceps'},
  //     headers: {
  //       'X-RapidAPI-Key': 'd118bffb72mshefac1d32ada5f14p1523e5jsnc3415735b0dc',
  //       'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com'
  //     }
  //   };g
  
  //   axios.request(options).then(function (response) {
  //     console.log(response.data);
  //   }).catch(function (error) {
  //     console.error(error);
  //   });
 });

// EXTERNAL API - WORKOUT SHOP
//Figure out how to make workout level update on button press

//let sweats = 180;
let diffVar = 'beginner';
// if (sweats >= 100) {
//   diffVar = 'intermediate';
// } else if (sweats >= 200) {
//   diffVar = 'expert';
// } 

app.get('/workouts', (req, res) => {
  try {
      let Value = Math.floor(Math.random()*200)
      let sweatVal = req.session.user.sweats;
      let diffVar = 'beginner';
      if (sweatVal >= 1000) {
        diffVar = 'intermediate';
      } else if (sweatVal >= 2000) {
        diffVar = 'expert';
      } 
      const options = {
        method: 'GET',
        url: 'https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises',
        params: {difficulty: diffVar, offset: Value},
  
        headers: {
          'X-RapidAPI-Key': 'd118bffb72mshefac1d32ada5f14p1523e5jsnc3415735b0dc',
          'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com'
        }
      };/* Deleted a 'g' here because it caused a syntax error */
      axios.request(options).then(function (response) {
        console.log(response.data)
        res.render('pages/workouts', {data: response.data, sweats: sweatVal})
      }).catch(function (error) {
        console.error(error);
      });

  } catch (error) {
    console.error(error);
    //need message for error
    res.render("pages/login")
    // Expected output: ReferenceError: nonExistentFunction is not defined
    // (Note: the exact output may be browser-dependent)
  }
  
});
app.post('/workouts', async(req, res) => {
  let sweatVal = req.session.user.sweats;
  sweatVal = sweatVal + 10
  req.session.user.sweats = sweatVal;
  let query = 'update users set sweats = $1 where username = $2 returning * ;';
  await db.any(query, [sweatVal, req.session.user.username])
 res.redirect('/workouts')
})


app.get('/workouts-shop', (req, res) => {
  try {
      let Value = Math.floor(Math.random()*10)
      let sweatVal = req.session.user.sweats;
      let diffVar = 'beginner';
      if (sweatVal >= 100) {
        diffVar = 'intermediate';
      } else if (sweatVal >= 200) {
        diffVar = 'expert';
      } 
      const options = {
        method: 'GET',
        url: 'https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises',
        params: {difficulty: diffVar, offset: Value},
  
        headers: {
          'X-RapidAPI-Key': 'd118bffb72mshefac1d32ada5f14p1523e5jsnc3415735b0dc',
          'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com'
        }
      };/* Deleted a 'g' here because it caused a syntax error */
      axios.request(options).then(function (response) {
        console.log(response.data)
        res.render('pages/workouts-shop', {data: response.data, sweats: sweatVal})
      }).catch(function (error) {
        console.error(error);
      });

  } catch (error) {
    console.error(error);
    //need message for error
    res.render("pages/login")
    // Expected output: ReferenceError: nonExistentFunction is not defined
    // (Note: the exact output may be browser-dependent)
  }
  
});

app.post('/workouts-shop', async(req, res) => {
  // let sweatVal = req.session.user.sweats;
  // sweatVal = sweatVal + 10
  // req.session.user.sweats = sweatVal;
  // let query = 'update users set sweats = $1 where username = $2 returning * ;';
  // await db.any(query, [sweatVal, req.session.user.username])
 res.redirect('/workouts-shop')
})
// app.put('/workouts', function (req, res) {
//   let sweatVal = req.session.user.sweats;
//   sweatVal = sweatVal + 10
//   const query =
//   'update users set sweats = $1 where username = $2 returning * ;';
//   // $1 and $2 will be replaced by req.body.name, req.body.username
//   db.any(query, [sweatVal, req.session.user.username])
//     // if query execution succeeds
//     // send success message
//     .then(function (data) {
//       res.status(201).json({
//         status: 'success',
//         data: data,
//         message: 'data updated successfully',
//       });
//     })
//     // if query execution fails
//     // send error message
//     .catch(function (err) {
//       return console.log(err);
//     });
// });

app.post("/saveWorkout", (req, res) => {
  let workoutID;
  // Checks if the workout is already in the database
  let findWorkout = `SELECT * FROM workouts WHERE name = '${req.body.workoutName}';`;
  // Inserts the workout into users_to_workouts, stores the user ID, workout ID, and time
  let addForCalendar = `INSERT INTO users_to_workouts (user_id, workout_name) VALUES ('${req.session.user.user_id}', '${req.body.workoutName}');`;
  // Inserts a new workout into the database
  let addWorkout = `INSERT INTO workouts (name, difficulty, instructions) VALUES ('${req.body.workoutName}', '${req.body.difficulty}', '${req.body.instructions}');`;

  

  // Checks if the workout is already in the database
  db.any(findWorkout)
  .then((foundWorkout) => {
    // This means that there is not something with the same name
    if(!(foundWorkout.length > 0))
    {
      db.any(addWorkout)
      .then((redundant) => {

      })
      .catch((err) => {
        console.log(err);
        // res.render("partials/message", {
        //   message: err
        // });
        res.redirect("/workouts");
      });
      
    }
    // Connects the user to the workout
    db.any(addForCalendar)
    .then((added) => {
      res.redirect("/calendar");
    })
    .catch((err) => {
      console.log(err);
      res.render("partials/message", {
        message: err
      });
      // res.redirect("/workouts");
    });

  })
  .catch((err) => {
    console.log(err);
    res.render("partials/message", {
      message: err
    });
    // res.redirect("/workouts");
  });
});




//logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login", {
    message : 'Logged out successfully',
    color : 'green'
  });
});


//these are the API routes that edit the users list of workouts in the calendar ie "CALENDAR_WORKOUTS"

// app.get("/calendar", (req, res) => {
//   try{
//   const get_workouts = `SELECT workout_id, workout, day, time FROM calendar_workouts WHERE user_id = ${req.session.user.user_id};`;
//   const get_friends_workouts = `SELECT friend_id, workout_id, workout, day, time FROM friends INNER JOIN 
//   calendar_workouts ON friends.friend_id = calendar_workouts.user_id WHERE friends.user_id =  ${req.session.user.user_id}`;
//   db.task('addFriend', (task) => {
//     task.batch([task.any(get_workouts), task.any(get_friends_workouts)]);
//   })
//     .then((result) => {
//       console.log(result);
//       res.render('pages/calendar', { workouts: result[0], friends_workouts: result[1], sweats: req.session.user.sweats});
//     })
//     .catch((err) => {
//       console.error(err);
//       res.sendStatus(500); // internal server error
//     });
//   }
//   catch(error){
//     console.error(err);
//     res.render("pages/login");
//   }
// });

app.get("/calendar", async (req, res) => {
  try {
    const data = await db.task('getCalendarData', async (task) => {
      const get_workouts = `SELECT workout_id, workout, day, time FROM calendar_workouts WHERE user_id = ${req.session.user.user_id};`;
      const get_friends_workouts = `SELECT friend_id, workout_id, workout, day, time FROM friends INNER JOIN 
        calendar_workouts ON friends.friend_id = calendar_workouts.user_id WHERE friends.user_id =  ${req.session.user.user_id}`;
      const [workouts, friends_workouts] = await task.batch([task.any(get_workouts), task.any(get_friends_workouts)]);
      return { workouts, friends_workouts };
    });
    res.render('pages/calendar', { workouts: data.workouts, friends_workouts: data.friends_workouts, sweats: req.session.user.sweats });
  } catch (err) {
    console.error(err);
    res.render("pages/login"); // internal server error
  }
});




app.post('/calendar/add', (req, res) => {
  const { workout, day, time } = req.body;
  const user_id = req.session.user.user_id;

  const query = `INSERT INTO calendar_workouts (workout, day, time, user_id) 
                 VALUES ('${workout}', '${day}', '${time}', ${user_id})`;

  db.query(query)
    .then((result) => {
      res.redirect('/calendar');
      // res.render('pages/calendar', { workouts: result, sweats: req.session.user.sweats });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500); // internal server error
    });
});



app.post('/calendar/update', (req, res) => {
  const { workout_update, day_update, time_update} = req.body;
  const status = req.body.submit_button;
  const user_id = req.session.user.user_id;

  const update_workout = `UPDATE calendar_workouts SET workout = $1, day = $2, time = $3 WHERE workout_id = ${req.body.workout_id_update}`;
  const delete_workout = `DELETE FROM calendar_workouts WHERE workout_id = ${req.body.workout_id_update}`;

  if(status == 'update'){
  db.query(update_workout, [workout_update[0], day_update, workout_update[1]])
    .then((result) => {
      res.redirect('/calendar');
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500); // internal server error
    });
  }
  else {

  db.query(delete_workout)
    .then((result) => {
      res.redirect('/calendar');
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500); // internal server error
    });
  }
});


  module.exports = app.listen(3000);