const Listing = require("./models/listing");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema ,reviewSchema} =require("./schema.js");
const Review = require("./models/review.js");


module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        if(req.method === "GET"){
            req.session.redirectUrl = req.originalUrl;
        }
        req.flash("error" , "you must be logged in to do that");
        return res.redirect("/login");
    }
    next();
}
module.exports.saveredirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};
module.exports.isOwner = async(req,res,next) =>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
       req.flash("error" , "you are not the owner of this listing");
       return res.redirect(`/listings/${id}`)
    }

    next();
};

module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(404,error);
    }else{
        next();
    }
};

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(404,error);
    }else{
        next();
    }
}

module.exports.isAuthor = async(req,res,next) =>{
    let {id , reviewId}=req.params;
    let review = await Review.findById(reviewId);
    if(!review){
       req.flash("error" , "review you requested does not exist!");
       return res.redirect(`/listings/${id}`);
    }
    if(!review.author || !review.author.equals(res.locals.currUser._id)){
       req.flash("error" , "you are not the owner of this review");
       return res.redirect(`/listings/${id}`)
    }

    next();
};

