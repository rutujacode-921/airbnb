const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema = new Schema({
    title : {
        type : String,
        required : true,
    },

    description : String,

    image : {
        filename:{
            type:String,
            default:"listingimage",
        },

        url:{
            type : String,
            default:"https://www.dreamstime.com/photos-images/random-tree-picture.html ",
            set : (v) => v=== ""? "https://www.dreamstime.com/photos-images/random-tree-picture.html " : v,
        },
        
    },
    price : {
        type:Number,
    },
    location : String,
    country : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        },
    ],

    
});
listingSchema.post("findOneAndDelete" , async(Listin) =>{
    if(listing){
            await Review.deleteMany({_id : {$in :listing.reviews}})
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;