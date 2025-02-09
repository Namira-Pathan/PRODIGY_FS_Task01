//to load environment variables from a .env file 
//into process.env when the application is not in production mode.
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}


//Importing Libraries that is installed using npm
const express = require("express")
const app = express()
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

//The Passport.js instance.
//A function to find a user by their email.
//A function to find a user by their ID.
initializePassport(
    passport,
    email => users.find(user => user.email ===email),
    id => users.find(user =>user.id ===id)
)

//storing all the users data in array for this task
const users = []

//configuring various functionalities essential for handling form data, sessions, 
//authentication, and HTTP method overrides
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //Will not resave the session if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))


//Configuring the  login post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect:"/",
    failureRedirect: "/login",
    failureFlash: true
}))


//Configuring the register post functionality
app.post("/register",checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users); //Display newly registered users in the console
        res.redirect("/login")
        
    } catch (e) {
        console.log(e);
        res.redirect("/register")
        
    }
})

//Routes

app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs",{name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

//End Routes

//route to handle user logout in an Express.js application
app.delete('/logout', (req, res) => {
    req.logout(req.user, err => {
        if(err) return next (err)
        res.redirect("/")
    })
   
})

//ensuring that only authenticated users can access them
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect("/")
    }
    next()
}

app.listen(3000)

