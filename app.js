// if(process.env.NODE_ENV != "production"){
//     require('dotenv').config();
// }
require('dotenv').config();
console.log("SECRET VALUE:", process.env.SECRET);

console.log("CLOUD NAME:", process.env.CLOUD_NAME);
console.log("CLOUD KEY:", process.env.CLOUD_API_KEY);
console.log("CLOUD SECRET:", process.env.CLOUD_API_SECRET);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash  = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = `mongodb+srv://vennapusaswetha:Swetha_Vennapusa@wanderlustproject.rxkzy4p.mongodb.net/?appName=WanderLustProject`
//`mongodb+srv://jyoshna1595:${process.env.CLOUD_DB_PASSWORD}@cluster0.lsx63.mongodb.net/`;
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() =>{
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret :  process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})

// store.on("error", () => {
//     console.log("ERROR in MONGO SESSION STORE",err);
// })
store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// app.get("/",(req,res) =>{
//     res.send("Hi,I am root");
// });



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// ✅ LOCALS FIRST
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null; // important
    next();
});

// ✅ ROUTES AFTER
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get("/demoUser",async(req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registeredUser= await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })



// app.get("/testListing",async (req,res) => {
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "By the beach",
//         price :1200,
//         location : "Calangute, Goa",
//         country : "India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful Testing");
// });
app.get("/favicon.ico", (req, res) => res.status(204));

app.all("*",(req,res,next) =>{
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next) => {
     console.log("====== ERROR START ======");
    console.log(err);
    console.log("====== ERROR END ======");
    let {statusCode=500,message="Something Went Wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
    //res.status(statusCode).send(message);
});

app.listen(8000, () =>{
    console.log("listening to port 8080");
});

