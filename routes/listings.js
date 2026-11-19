const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
router.use(express.urlencoded({extended: true}));
const {isLoggedIn, isOwner, validateListing} =require("../middleware.js");
const listingController=require("../controller/listing.js");
const multer  = require('multer');
const {storage} =require("../cloudConfig.js");

const upload = multer({ storage})



// INDEX ROUTE
router.get("/", wrapAsync(listingController.index));

// NEW FORM ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

// CREATE ROUTE
router.post("/newadded", isLoggedIn, upload.single("listing[image]"), 
validateListing, wrapAsync(listingController.createForm));

// SHOW / UPDATE / DELETE ROUTES
router
    .route("/:id")
    .get(wrapAsync(listingController.showRoute))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateRoute))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteRoute));

// EDIT FORM ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editForm));

module.exports=router;
