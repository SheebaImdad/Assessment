let express = require("express");
let router = express.Router();
const questionController = require("../controller/question.controller");
const constant = require("../config/constant");
const upload = require("../helper/readCSVFile");
const { checkToken } = require("../helper/middleware");

router.post(
  constant.ENDPOINTS.READ_CSV_FILE,
  checkToken,
  upload.upload.single("csvFile"),
  questionController.readQuesCSVFile
);

router.get(
  constant.ENDPOINTS.LIST_QUESTION_BY_CATEGORY_ID,
  checkToken,
  questionController.retrieveQuestionByCategoryId
);

router.post(
  constant.ENDPOINTS.TAKE_TEST,
  checkToken,
  questionController.takeTest
);

router.put(
  constant.ENDPOINTS.UPDATE_QUESTION,
  checkToken,
  questionController.updateQuestionById
);

module.exports = router;