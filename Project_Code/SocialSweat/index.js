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


// Login Routes
app.get("/login", (req, res) => {
    res.render("pages/login");
  });
  
  app.post("/login", (req, res) => {
    const InputUser = req.body.username;
    const InputPass = req.body.password;
    
  
    const query = `SELECT * FROM users WHERE users.username = '${req.body.username}';`;
    db.one(query)
    .then( async (user) => {
      if(user == '')
      {
        res.redirect("/register");
      }
      
      // check if password from request matches with password in DB
      // console.log(req.body.password);
      // console.log(req.body.username);
      // console.log(user.username);
      // console.log(user.password);
      const match = await bcrypt.compare(req.body.password, user.password);
  
      if(match === true){
        //save user details in session like in lab 8
        req.session.user = user;
        req.session.save();
        res.redirect("/discover");
      }
      else{
        res.render("partials/message", {
          message : 'Incorrect username or password',
          error : true
        });
      }
    });
  
  });

  app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
    const options = {
      method: 'GET',
      url: 'https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises',
      params: {muscle: 'biceps'},
      headers: {
        'X-RapidAPI-Key': 'd118bffb72mshefac1d32ada5f14p1523e5jsnc3415735b0dc',
        'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com'
      }
    };
  
    axios.request(options).then(function (response) {
      console.log(response.data);
    }).catch(function (error) {
      console.error(error);
    });
  });

// EXTERNAL API - WORKOUT SHOP

app.get('/workouts',(req, res) => {
  res.render('pages/workouts')
  const options = {
    method: 'GET',
    url: 'https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises',
    params: {muscle: 'biceps'},
    headers: {
      'X-RapidAPI-Key': 'd118bffb72mshefac1d32ada5f14p1523e5jsnc3415735b0dc',
      'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com'
    }
  };

  axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });
});


  

  module.exports = app.listen(3000);