const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    product: {
        productid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        title: {
            type: String
        },
        price: {
            type: Number
        },
        size:{
            type:String
        },
        image: {
            type: String
        },
        quantity: {
            type: Number,
            default: 1
        },
        address: {
            type: String
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    DeliveryDate: {
        type: Date,
    },
    DeliveryAddress:{
        type:String,
        required:true
    },
    deliveryCharge: {
        type: Number
    },
    CompleteDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["processing", "shipped", "delivered", "cancelled"],
        default: "processing"
    }
}, { timestamps: true });

const BuyerModel = mongoose.model("productorder", userSchema);

module.exports = BuyerModel