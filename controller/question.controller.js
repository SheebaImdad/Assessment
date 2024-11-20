const logger = require("loglevel");
const message = require("../config/message");
const fs = require("fs");
const question = require("../helper/question.helper");
const constant = require("../config/constant");
const dataValidator = require("../validator/question.validator");

let readQuesCSVFile = async (req, res) => {
  try {
    if (!req.file) {
      throw message.error.FILEISREQUIRED;
    }
    if (!constant.CSVFILEFORMATS.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      throw message.error.INVALID_MIME_TYPE;
    }
    if (req.file.size > constant.CSVFILESIZE) {
      throw message.error.FILESIZE;
    }
    const response = await question.readQuesCSVFile(req.file.path);
    return _handleResponseWithMessage(
      req,
      res,
      null,
      message.success.UPLOAD_SUCCESS,
      response
    );
  } catch (e) {
    logger.error("ERROR ::: readCSVFile ::: ", e);
    return _handleResponseWithMessage(req, res, e);
  }
};
const retrieveQuestionByCategoryId = async (req, res) => {
  try {
    const validateCategoryId = await dataValidator.validateCategoryId(req.params);
    const response = await question.retrieveQuestionByCategoryId(
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
const takeTest = async (req, res) => {
  try {
    const validateTestId = await dataValidator.validateTakeTest(req.body);
    validateTestId.user_id = req.user.userId;
    validateTestId.firstName = req.user.firstName;
    validateTestId.lastName = req.user.lastName;
    validateTestId.email = req.user.email;
    validateTestId.organization=req.user.organization;
    const response = await question.takeTest(validateTestId);
    return _handleResponseWithMessage(
      req,
      res,
      null,
      message.success.TEST_RESULT_SUBMITTED,
      response
    );
  } catch (e) {
    logger.error("ERROR ::: takeTest ::: ", e);
    return _handleResponseWithMessage(req, res, e);
  }
};
const updateQuestionById = async (req, res) => {
  try {
    const validateQuestionId = await dataValidator.validateQuestionId(
      req.params
    );
    const validateQuestion = await dataValidator.updateQuestionValidator(
      req.body
    );
    const response = await question.updateQuestionById({
      ...validateQuestionId,
      ...validateQuestion,
    });
    return _handleResponseWithMessage(
      req,
      res,
      null,
      message.success.List_QUESTION_SUCCESS,
      response
    );
  } catch (e) {
    logger.error("ERROR ::: updateQuestionById ::: ", e);
    return _handleResponseWithMessage(req, res, e);
  }
};
module.exports = {
  readQuesCSVFile,
  retrieveQuestionByCategoryId,
  takeTest,
  updateQuestionById,
};
