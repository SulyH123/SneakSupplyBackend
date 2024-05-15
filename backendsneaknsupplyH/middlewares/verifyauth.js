const jwt = require("jsonwebtoken");
const User = require("../model/user.js");
const ErrorHander = require("./errorhandler.js");
function isTokenExpired(req, res, next) {
  let token = req.header("Authentication");
  const decodedToken = jwt.decode(token);
  if (decodedToken && decodedToken.exp) {
    const currentTime = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
    if (decodedToken.exp < currentTime) {
      return next(new ErrorHander("Wrong OTp or OTP has expired", 404));
    }
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: err.message });
    }
    req.decoded = decoded;
    next();
  })
}


function verifyToken(req, res, next) {
  let token = req.header("Authentication");
  if (!token) {
    return res.status(403).send({ message: "Login to continue..." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: err.message });
    }
    req._id = decoded.id;
    req.otp = decoded.otp;
    next();
  });
};

async function isadmin(req, res, next) {
  const password=req.header("Password");
  if(password!==process.env.JWT_SECRET){
      return next(new ErrorHander("Wrong Credentials", 404));
  }
  next()
}


module.exports = { isadmin, verifyToken, isTokenExpired }