const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let usersSchema = new Schema({
  fullName: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  countryCode: {
    type: String,
  },
  mobileNumber: {
    type: String,
  },
  password: {
    type: String,
    default: null,
  },
  profileImage: { type: String, default: null },
  permission: {
    type: [],
    default: null,
  },
  zipCode: {
    type: String,
    default: null,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    default: null,
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
module.exports = {
  UsersModel: mongoose.model("users", usersSchema),
};
