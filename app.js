const express=require("express");
const app=express();
const mongoose=require('mongoose');
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

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
app.post("/listings",async (req,res)=> {
    const {title,description,price,country,location}=req.body;
    await Listing.insertOne({title,description,price,country,location});
    res.redirect("/listings");

});
app.get("/listings/:id/edit",async(req,res) =>{
    let {id}=req.params;
    
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});
app.put("/listings/:id",async(req,res) =>{
    let {id}=req.params;
    console.log(req.body);
    await Listing.findByIdAndUpdate(id, { ...req.body});
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


// app.get("/testListing",async (req,res) =>{
//     let samplelisting = new Listing({
//         title: "woderfull home",
//         description:"my first villa",
//         price:12000000,
//         location: "tokyoo",
//         contry:"spain",
//     });
//     await samplelisting.save();
//     res.send("sample added");
// });
