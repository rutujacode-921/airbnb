const express=require("express");
const router=express.Router();
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema ,reviewSchema} =require("../schema.js");
const Review=require("../models/review.js");


router.get("/",async (req,res) =>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

router.get("/new",async (req,res) =>{
res.render("listings/new.ejs");
});

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(404,error);
    }else{
        next();
    }
};


router.post("/",validateListing,wrapAsync(async (req,res,next)=> {
   
    const {title,description,price,country,location}=req.body;
    await Listing.insertOne({title,description,price,country,location});
    res.redirect("/listings");

}));

router.get("/:id/edit",validateListing,wrapAsync(async(req,res) =>{
    let {id}=req.params;
    
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));
router.put("/:id",validateListing,wrapAsync(async(req,res) =>{
    let {id}=req.params;
    let {title,description,price,country,location,image}=req.body.listing;
    await Listing.findByIdAndUpdate(id, {title,description,price,country,location,image:{
        filename:"listingimage",
        url:image
    } });
    res.redirect(`/listings/${id}`);
}));
router.delete("/:id" , validateListing, wrapAsync(async(req,res) =>{
    const {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

router.get("/:id",validateListing,wrapAsync(async (req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

module.exports=router;