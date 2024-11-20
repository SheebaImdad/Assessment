let express = require("express");
let router = express.Router();
const categoryController = require("../controller/category.controller");
const constant = require("../config/constant");
const { checkToken } = require("../helper/middleware");

router.get(
  constant.ENDPOINTS.LIST_QUESTION_BY_CATEGORY_ID,
  checkToken,
  categoryController.retrieveQuestionByCategoryId
);

router.get(
  constant.ENDPOINTS.LIST_QUESTIONS,
  checkToken,
  categoryController.AllCategoriesAlongWithCount
);

module.exports = router;
