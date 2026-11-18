const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const Review=require("../models/review.js");
router.use(express.urlencoded({extended: true}));
const {isLoggedIn, isOwner,validateListing , validateReview} =require("../middleware.js");




// INDEX ROUTE
router.get("/",async (req,res) =>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

// NEW FORM ROUTE
router.get("/new",isLoggedIn,async (req,res) =>{
    res.render("listings/new.ejs");
});

// CREATE ROUTE
router.post("/newadded", isLoggedIn,validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

// EDIT FORM ROUTE
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async(req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

// UPDATE ROUTE
router.put("/:id",validateListing,isLoggedIn,isOwner,wrapAsync(async(req,res) =>{
    let {id}=req.params;
    let {title,description,price,country,location,image}=req.body.listing;
    await Listing.findByIdAndUpdate(id, {title,description,price,country,location,image:{
        filename:"listingimage",
        url:image
    } });
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// DELETE ROUTE
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    await Listing.findByIdAndDelete(id);
    console.log("deleted");
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

// SHOW ROUTE
router.get("/:id",wrapAsync(async (req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path :"reviews",
         populate : {path :"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

module.exports=router;
