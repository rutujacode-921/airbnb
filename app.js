const express=require("express");
const app=express();
const mongoose=require('mongoose');
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const ListingRouter=require("./routes/listings.js");
const ReviewRouter=require("./routes/reviews.js");
const UserRouter=require("./routes/user.js");

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust');
}
main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });
app.set("view engine" ,"ejs");
app.set("views" ,path.join(__dirname,"views"));
app.engine("ejs" , ejsMate);  
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"/public")))


const sessionOptions ={
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized:true,
    cookie :{
        expires :Date.now() + 7*24*60*60*1000,
        maxAge :7*24*60*60*1000,
        httpOnly : true,
    },
}
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
app.get("/demouser" , async(req,res) =>{
    let fakeUser= new User({
        email : "student123@gmail.com",
        username : "student",
    });
    let demo= await User.register(fakeUser ,"password123");
    res.send(demo);
});

app.get("/", (req,res) =>{
   res.send("successfully working");
});

app.use("/listings" , ListingRouter);

app.use("/listings/:id/reviews" , ReviewRouter);
app.use("/" , UserRouter);


app.all(/(.*)/ ,(req,res,next) =>{
    next(new ExpressError(404,"Page not found!!"));
})
app.use((err,req,res,next)=>{
    let {statusCode,message="something went wrong"} = err;
    res.render("listings/error.ejs" , {statusCode,message,listing: null});
});
 
app.listen(8080, () =>{
    console.log("server started successfully on port 8080");
});


