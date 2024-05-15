const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    products: [{
        productid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        image: {
            type: String
        },
        title: {
            type: String
        },
        price: {
            type: Number
        },
        quantity: {
            type: Number,
            default: 1
        },
        address: {
            type: String
        },
        deliveryTime: {
            type: Number
        },
        size:{
            type:String
        }
    }],
    DeliveryAddress: {
        type: String,
        required:true
    },
    status: {
        type: String,
        default: "In Progress"
    },
    stripesessionid: {
        type: String,
        required: true
    },
    receiptNumber: {
        type: String,
    },
    totalAmount: {
        type: Number
    },
    currency: {
        type: String,
    }
}, { timestamps: true });

const SessionModal = mongoose.model("Session", userSchema);

module.exports = SessionModal;
