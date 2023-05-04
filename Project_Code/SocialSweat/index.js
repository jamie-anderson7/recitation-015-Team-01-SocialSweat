// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.


const path = require('path')
console.log(path.join(__dirname,'/recources/img'));
app.use(express.static(path.join(__dirname,'/recources/img')));
app.use(express.static(__dirname + '/public'));



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

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
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
  db.any(ins)
  .then(data => {
    res.redirect("/login");
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
    if(user == '')
    {
      res.render('/register');
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
      // res.redirect("/discover");
      res.redirect('/workouts');
      res.status(200).json({
        message: 'Success'
      });
  
    }
    else{
      // res.render("partials/message", {
      //   message : 'Incorrect username or password',
      //   error : true
      // });
      // console.log('Incorrect username or password.');

      res.redirect('/login');
      //work on getting modal to display, currently just reloads login page
      res.status(200).json({
        message: 'Incorrect username or password'
      });
      
    }
  })
  .catch((error) => {
    console.log(error)
    res.render("pages/register")
  })


});

app.post('/addFriend', (req, res) => {
  let friend = req.body.friendID;
  let user = req.session.user.user_id;

  let addForward = `INSERT INTO friends (user_id, friend_id) VALUES ('${user}', '${friend}');`;
  let addReverse = `INSERT INTO friends (user_id, friend_id) VALUES ('${friend}', '${user}');`;
  let check = `SELECT * FROM users WHERE user_id = '${friend}';`;

  db.any(check)
  .then((checkResult) => {
    // This checks if any rows were returned
    if(checkResult.length > 0)
    {
      // Adds to friends table
      db.task('addFriend', (task) => {
        return task.batch([task.any(addForward), task.any(addReverse)]);
      })
      .then((data) => {
        res.render("partials/message", {
          message: 'Friend added successfully.'
        });
      })
      .catch((error) => {
        console.log(error);
      });
    } 
    // This case means that there are not any users that match the friend use id
    else
    {
      res.render("partials/message", {
        message : 'Cannot add friend, user ID does not exist.',
        error : true
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

app.get("/calendar", (req, res) => {
  res.render("pages/calendar")
});

//logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login");
});

  module.exports = app.listen(3000);