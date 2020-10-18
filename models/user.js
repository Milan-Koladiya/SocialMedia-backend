const mongoose = require("mongoose");
const validator = require("validator");
const connection = require("../connection/connection");

const schema = new mongoose.Schema({
  Username: {
    type: String,
    trim: true,
    // unique: true,
  },
  Emailid: {
    type: String,
    trim: true,
    // validate(value) {
    //     if (!validator.isEmail(value)) {
    //         throw new Error()
    //     }
    // }
  },
  Password: {
    type: String,
    trim: true,
  },
  avtar: {
    type: String,
    default: "",
  },
  lastlogin: {
    type: Date,
    default: "",
  },
  Followers: [
    {
      request_by: {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
      accept: 0,
    },
  ],
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});

const model = mongoose.model("user", schema);

module.exports = model;
