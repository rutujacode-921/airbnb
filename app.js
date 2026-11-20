if(process.env.NODE_ENV != "production"){
        require('dotenv').config()
};

console.log(`Hello ${process.env.HELLO}`)

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
const { MongoStore } = require("connect-mongo");

const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const DBurl = process.env.ATLASDB_URL;

async function main(){
    await mongoose.connect(DBurl);
}

if (!DBurl) {
    console.error("ATLASDB_URL is not set. Add it in your environment variables.");
    process.exit(1);
}
app.set("view engine" ,"ejs");
app.set("views" ,path.join(__dirname,"views"));
app.engine("ejs" , ejsMate);  
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl:DBurl,
    crypto:{
        secret :process.env.SECRET,

    },
    touchAfter :24*3600,
});

store.on("error" , (err) =>{
    console.log("error in mongo seesion store" , err );
});
const sessionOptions ={
    store,
    secret : process.env.SECRET,
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

// app.get("/", (req,res) =>{
//    res.send("successfully working");
// });

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
 
const port = process.env.PORT || 8080;

main()
    .then(() => {
        console.log("connected to DB");
        app.listen(port, () => {
            console.log(`server started successfully on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    });


