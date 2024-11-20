const mongoose = require("mongoose");

const testModelSchema = new mongoose.Schema({
 test_name: {
    type: String,
    required: true,
  },
  passing_percentage: {
    type: Number,
    required: true,
  },
  organization: {
    type: String,
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
    TestModel: mongoose.model("Test", testModelSchema),
};
