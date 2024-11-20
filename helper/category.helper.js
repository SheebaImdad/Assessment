const logger = require("loglevel");
const mongoose = require("mongoose");
const message = require("../config/message");
const { CategoryModel } = require("../schema/category.schema");

const retrieveQuestionByCategoryId = async (options) => {
  try {
    let questionData = await CategoryModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(options.category_id),
        },
      },
      {
        $lookup: {
          from: "questions",
          localField: "category_id",
          foreignField: "_id",
          as: "data",
        },
      },
      { $unwind: { path: "$data" } },
      { $project: { questionData: "$data" } },
    ]);

    if (questionData.length === 0) {
      throw message.error.COURSE_NOT_FOUND;
    }
    return questionData;
  } catch (e) {
    logger.error("dbHelperCategory:::::::retrieveQuestionByCategoryId", e);
    throw e;
  }
};

const AllCategoriesAlongWithCount = async () => {
  try {
    await CategoryModel.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "_id",
          foreignField: "category_id",
          as: "questions",
        },
      },
      {
        $unwind: {
          path: "$questions",
        },
      },
      {
        $group: {
          _id: "$_id",
          totalQuestions: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          totalQuestions: 1,
          _id: 0,
        },
      },
      {
        $sort: { category: 1 },
      },
    ]);
  } catch (e) {
    logger.error("dbHelperCategory:::::::AllCategoriesAlongWithCount", e);
    throw e;
  }
};

module.exports = {
  retrieveQuestionByCategoryId,
  AllCategoriesAlongWithCount
};
