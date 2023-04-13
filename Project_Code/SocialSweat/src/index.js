
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