const express=require("express");
const router=express.Router();
router.get("/signup" , async(req,res) =>{
    res.send("form");
})
module.exports = router;