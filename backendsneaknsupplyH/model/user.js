const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    default: "user"
  },
  profile_img: {
    url: {
      type: String
    },
    public_id: {
      type: String
    }
  },
  cartnumber: Number
}, {
  timestamps: true
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
