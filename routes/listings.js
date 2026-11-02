const express=require("express");
const router=express.Router();
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema ,reviewSchema} =require("../schema.js");
const Review=require("../models/review.js");
router.use(express.urlencoded({extended: true}));

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(404,error);
    }else{
        next();
    }
};

// INDEX ROUTE
router.get("/",async (req,res) =>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

// NEW FORM ROUTE
router.get("/new",async (req,res) =>{
    res.render("listings/new.ejs");
});

// CREATE ROUTE
router.post("/newadded", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

// EDIT FORM ROUTE
router.get("/:id/edit",wrapAsync(async(req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

// UPDATE ROUTE
router.put("/:id",validateListing,wrapAsync(async(req,res) =>{
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
router.delete("/:id", wrapAsync(async (req, res) => {
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
    const listing=await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

module.exports=router;
