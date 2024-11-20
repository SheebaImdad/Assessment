let express = require("express");
let router = express.Router();
const userController = require("../controller/user.controller");
const constant = require("../config/constant");
const multer = require("multer");
const {
  verifyRefreshToken,
  checkToken,
  checkForgetPasswordToken,
} = require("../helper/middleware");
const upload = multer();

router.post(
  constant.ENDPOINTS.REGISTER,
  upload.any(),
  checkToken,
  userController.registerUser
);

router.post(constant.ENDPOINTS.USER_LOGIN, userController.userLogin);

router.put(
    constant.ENDPOINTS.UPDATEUSERINFO,
    checkToken,
    upload.any(),
    userController.updateProfile
  );
router.get(
  constant.ENDPOINTS.NEWTOKENS,
  verifyRefreshToken,
  userController.generateNewTokens
);
router.get(constant.ENDPOINTS.LOGOUT, checkToken, userController.logoutUser);
router.post(constant.ENDPOINTS.FORGOTPASSWORD, userController.forgetPassword);
router.put(
  constant.ENDPOINTS.RESETPASSWORD,
  checkForgetPasswordToken,
  userController.resetPassword
);
router.put(
  constant.ENDPOINTS.UPDATEPASSWORD,
  checkToken,
  userController.changePasswordHelper
);

router.get(
  constant.ENDPOINTS.GETUSERINFO,
  checkToken,
  userController.getUserInfo
);

router.get(constant.ENDPOINTS.USERS_LIST, checkToken, userController.userLists);

module.exports = router;
