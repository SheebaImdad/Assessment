const mongoose = require("mongoose");

const categoryModelSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ["BASIC", "ADVANCED", "MODERATE"],
    default: "BASIC",
  },
  created_By: {
    type: mongoose.Types.ObjectId,
  },
  updated_By: {
    type: mongoose.Types.ObjectId,
  },
  created_At: { type: Date, default: Date.now },
  updated_At: { type: Date, default: Date.now },
});

module.exports = {
  CategoryModel: mongoose.model("category", categoryModelSchema),
};
