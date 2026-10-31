const express=require("express");
const app=express();
const mongoose=require('mongoose');
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema ,reviewSchema} =require("./schema.js");
const Review=require("./models/review.js");
const Listings=require("./routes/listings.js");
const reviews=require("./routes/reviews.js");



app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"/public")))

app.set("view engine" ,"ejs");
app.set("views" ,path.join(__dirname,"views"));
app.engine("ejs" , ejsMate);

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
app.get("/", (req,res) =>{
   res.send("successfully working");
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
 