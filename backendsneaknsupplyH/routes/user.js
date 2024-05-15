const express = require('express');
const router = express.Router();
const asyncerror = require('../middlewares/catchasyncerror');
const ErrorHandler = require('../middlewares/errorhandler');
const User = require('../model/user.js');
const { verifyToken, isadmin } = require('../middlewares/verifyauth');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const Product = require('../model/Item.js');
const CartModel = require('../model/Cart.js');
const { sendcontact } = require('../middlewares/sendmsg.js');


router.post('/register', asyncerror(async (req, res, next) => {
    const userexist = await User.findOne({
        email: req.body.email
    }).select("_id");
    if (userexist) {
        return next(new ErrorHandler("User Already Registered", 405));
    };
    req.body.password = bcrypt.hashSync(req.body.password, 10)
    const user = await User.create(req.body);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({ success: true, token });
}));


router.post('/login', asyncerror(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email }).select("_id password")

    if (!user) {
        return next(new ErrorHandler("User not found"), 404)
    }
    const correctpassword = bcrypt.compareSync(req.body.password, user.password)
    if (!correctpassword) {
        return next(new ErrorHandler("Incorrect Email or Password."), 404)
    };

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({ success: true, token })
}));

router.get('/getme', verifyToken, asyncerror(async (req, res, next) => {
    const user = await User.findById(req._id).select('-customerId').lean()
    delete user?.password
    if (!user) {
        return next(new ErrorHandler("User not Found", 404))
    }
    const cart = await CartModel.findOne({ user: user._id });
    user.cartnumber = (cart?.courses?.length || 0) + (cart?.products?.length || 0);

    res.status(200).send({ success: true, user })
}));


// products


router.get('/products', asyncerror(async (req, res, next) => {
    let skip = parseInt(req.query.limit);
    let limit = 9;
    let searchQuery = req.query.search.trim();
    let categoryQuery = req.query.category
    let subcategoryQuery = req.query.subcategory
    let regexPattern = new RegExp(searchQuery, 'gi');
    const regexSearch = searchQuery ? {
        $or: [
            { title: { $regex: regexPattern } }
        ]
    } : {};
    const filter = { ...regexSearch };
    if(categoryQuery){
        filter.category=categoryQuery
    }
    if(subcategoryQuery){
        filter.subcategory= subcategoryQuery
    }
    console.log(filter)
    const data = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    const DataLength = await Product.countDocuments(filter);
    const hasMore = DataLength > (skip + limit);

    res.status(200).send({ success: true, data, hasMore });
}));

router.get('/product/:id', asyncerror(async (req, res, next) => {
    let id = req.params.id;
    const data = await Product.findById(id).lean();
    if (!data) {
        return next(new ErrorHandler("Product Not Found", 404));
    }
    res.status(200).send({ success: true, data });
}));


router.post('/contact', asyncerror(async (req, res, next) => {
    const response = await sendcontact(`Your Recieved a message from Name:${req.body.name} Email:${req.body.email} \nPhone:${req.body.phone} Address:${req.body.address}\nMessage:${req.body.message}`, "Contact Form Sneak n Supply")
    res.status(200).send({ success: true, response });
}));


module.exports = router;