const logger = require("loglevel");
const message = require("../config/message");
const category = require("../helper/category.helper");
const dataValidator = require("../validator/question.validator");

const retrieveQuestionByCategoryId = async (req, res) => {
  try {
    const validateCategoryId = await dataValidator.validateCategoryId(req.params);
    const response = await category.retrieveQuestionByCategoryId(
      validateCategoryId
    );
    return _handleResponseWithMessage(
      req,
      res,
      null,
      message.success.List_QUESTION_SUCCESS,
      response
    );
  } catch (e) {
    logger.error("ERROR ::: retrieveQuestionByCategoryId ::: ", e);
    return _handleResponseWithMessage(req, res, e);
  }
};

const AllCategoriesAlongWithCount = async (req, res) => {
    try {
      const response = await category.AllCategoriesAlongWithCount(
      );
      return _handleResponseWithMessage(
        req,
        res,
        null,
        message.success.List_QUESTION_SUCCESS,
        response
      );
    } catch (e) {
      logger.error("ERROR ::: AllCategoriesAlongWithCount ::: ", e);
      return _handleResponseWithMessage(req, res, e);
    }
  };

module.exports = {

  retrieveQuestionByCategoryId,
  AllCategoriesAlongWithCount

};
