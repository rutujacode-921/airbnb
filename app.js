const express=require("express");
const app=express();
const mongoose=require('mongoose');
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");


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
app.get("/listings",async (req,res) =>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});

});
app.get("/listings/new",async (req,res) =>{
    res.render("listings/new.ejs");
});

app.post("/listings",wrapAsync(async (req,res,next)=> {
    
    const {title,description,price,country,location}=req.body;
    await Listing.insertOne({title,description,price,country,location});
    res.redirect("/listings");

}));
app.get("/listings/:id/edit",async(req,res) =>{
    let {id}=req.params;
    
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});
app.put("/listings/:id",async(req,res) =>{
    let {id}=req.params;
    let {title,description,price,country,location,image}=req.body;
    await Listing.findByIdAndUpdate(id, {title,description,price,country,location,image:{
        filename:"listingimage",
        url:image
    } });
    res.redirect(`/listings/${id}`);
});
app.delete("/listings/:id" , async(req,res) =>{
    const {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});
app.get("/listings/:id",async (req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

app.all(/(.*)/ ,(req,res,next) =>{
    next(new ExpressError(404,"Page not found!!"));
})
app.use((err,req,res,next)=>{
    let {statusCode,message} = err;
    res.status(statusCode).send(message);
});


