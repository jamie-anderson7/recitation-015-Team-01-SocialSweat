const axios = require("axios");

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
    };g
  
    axios.request(options).then(function (response) {
      console.log(response.data);
    }).catch(function (error) {
      console.error(error);
    });
  });

// EXTERNAL API - WORKOUT SHOP

app.get('workouts',(req, res) => {
  res.render('views/pages/workouts')
  const options = {
    method: 'GET',
    url: 'https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises',
    params: {muscle: 'biceps'},
    headers: {
      'X-RapidAPI-Key': 'd118bffb72mshefac1d32ada5f14p1523e5jsnc3415735b0dc',
      'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com'
    }
  };g

  axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });
});


  

  module.exports = app.listen(3000);