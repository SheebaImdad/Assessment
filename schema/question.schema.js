const mongoose = require("mongoose");

const questionModelSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  category_id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  test_id:{
    type: mongoose.Types.ObjectId,
    required: true,
  },
  options: [
    {
      option: {
        type: String,
        required: true,
      },
      option_id: {
        type: String,
        required: true,
      },
    },
  ],
  answer: [
    {
      answer: {
        type: String,
        required: true,
      },
      option_id: {
        type: String,
        required: true,
      },
    },
  ],
  hash: {
    type: String,
    required: true,
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
  QuestionModel: mongoose.model("Question", questionModelSchema),
};
