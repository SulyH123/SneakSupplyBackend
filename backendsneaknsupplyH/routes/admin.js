const express = require('express');
const router = express.Router();
const asyncerror = require('../middlewares/catchasyncerror');
const Product = require('../model/Item.js');
const { isadmin } = require('../middlewares/verifyauth');


router.post('/product',isadmin, asyncerror(async (req, res, next) => {
  const data = await Product.create(req.body);
  res.status(200).send({ success: true, data });
}));

module.exports = router