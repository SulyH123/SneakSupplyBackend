const express = require('express');
const router = express.Router();
const asyncerror = require('../middlewares/catchasyncerror');
const { verifyToken, isadmin } = require('../middlewares/verifyauth');
const Order = require('../model/Order.js');

router.get('/', verifyToken, asyncerror(async (req, res, next) => {
    const data = await Order.find({ user: req._id }).sort({ createdAt: -1 })
    res.status(200).send({ success: true, data });
}));

router.put('/status', isadmin, asyncerror(async (req, res, next) => {
    const { status, id } = req.body;
    const data = await Order.findOne({
        _id: id
    })
    data.status = status;
    await data.save();
    res.status(200).send({ success: true });
}));


module.exports = router;