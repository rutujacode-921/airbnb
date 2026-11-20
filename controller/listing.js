const Listing=require("../models/listing.js");
const geocode=require("../utils/geocode.js");

module.exports.index = async (req,res) =>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};
module.exports.renderNewForm = async (req,res) =>{
    res.render("listings/new.ejs");
};

module.exports.createForm= async (req, res) => {
    let url =req.file.path ;
    let filename = req.file.filename; 
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    const geometry = await geocode(newListing.location, newListing.country);
    if (geometry) {
        newListing.geometry = geometry;
    }
    await newListing.save();
    if (!geometry) {
        req.flash("error", "Listing created, but we couldn't find that location on the map.");
        return res.redirect("/listings");
    }
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};
module.exports.editForm = async(req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    let originalUrl = (listing.image && listing.image.url) || "";
    // Cloudinary: ask for a small (250px wide), automatically low-quality preview
    if (originalUrl.includes("res.cloudinary.com")) {
        originalUrl = originalUrl.replace("/upload", "/upload/w_250,q_auto:low");
    }
    res.render("listings/edit.ejs",{listing,originalUrl});
};
module.exports.updateRoute =  async(req,res) =>{
    let {id}=req.params;
    // returns the listing as it was BEFORE the update
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    const { location, country } = req.body.listing;
    let needsSave = false;
    // only replace the image if a new file was uploaded
    if (typeof req.file !== "undefined") {
        listing.image = { url: req.file.path, filename: req.file.filename };
        needsSave = true;
    }
    // re-geocode if the address changed, or if this listing has no coordinates yet
    const addressChanged = location !== listing.location || country !== listing.country;
    const hasCoords = listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length === 2;
    let geocodeFailed = false;
    if (addressChanged || !hasCoords) {
        const geometry = await geocode(location, country);
        if (geometry) {
            listing.geometry = geometry;
        } else {
            listing.geometry = undefined; // old coordinates no longer match the address
            geocodeFailed = true;
        }
        needsSave = true;
    }
    if (needsSave) {
        listing.location = location;
        listing.country = country;
        await listing.save();
    }
    if (geocodeFailed) {
        req.flash("error","Listing updated, but we couldn't find that location on the map.");
        return res.redirect(`/listings/${id}`);
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteRoute = async (req, res) => {
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
};

module.exports.showRoute = async (req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path :"reviews",
         populate : {path :"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};