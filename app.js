const express=require("express");
const app=express();
const mongoose=require('mongoose');
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const Listings=require("./routes/listings.js");
const reviews=require("./routes/reviews.js");
const session = require("express-session");
const flash = require("connect-flash");


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"/public")))






const sessionOptions ={
    secret : "mysupersecretcode",
    resave : false,
    saveUninitioalized:true,
    cookie :{
        expires :Date.now() + 7*24*60*60*1000,
        maxAge :7*24*60*60*1000,
        httpOnly : true,
    },
}
app.use(session(sessionOptions));
app.use(flash());
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    next();
});
app.set("view engine" ,"ejs");
app.set("views" ,path.join(__dirname,"views"));
app.engine("ejs" , ejsMate);

app.get("/", (req,res) =>{
   res.send("successfully working");
});


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

app.listen(8080, () =>{
    console.log("server started successfully on port 8080");
});

app.use("/listings" , Listings);

app.use("/listings/:id/reviews" , reviews);



app.all(/(.*)/ ,(req,res,next) =>{
    next(new ExpressError(404,"Page not found!!"));
})
app.use((err,req,res,next)=>{
    let {statusCode,message} = err;
    res.render("listings/error.ejs" , {statusCode,message});

});
 