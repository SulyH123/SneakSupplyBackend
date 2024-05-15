const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    price:{
        type:Number,
        required:true
    },
    deliveryTime:{
        type:Number,
        default:1
    },
    deliveryCharge:{
        type:Number,
        default:0
    },
    quantity:{
        type:Number,
        default:1
    },
    category:{
        type:String,
        default:"men",
        enum:["men","women","kids"]
    },
    subcategory:{
        type:String,
        default:"casual",
        enum:["designer","casual","worker","sports"]
    },
}, { timestamps: true });

const Product = mongoose.model("product", userSchema);

module.exports = Product;