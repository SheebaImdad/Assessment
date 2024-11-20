const dataValidator = require("../validator/user.validator");
const dbHelperUser = require("../helper/user.helper");
const logger = require("loglevel");
const jwt_decoder = require("jwt-decode");
const message = require("../config/message");
const registerUser = async (req, res) => {
  try {
    const userInfo = req.decoded;
    let options = await dataValidator.validateRegisterUser(req.body);
    req.files ? (options.profileImage = req.files[0]) : null;
    options.userInfo = userInfo;
    const response = await dbHelperUser.registerUser(options);

    return _handleResponseWithMessage(
      req,
      res,
      null,
      "User has been registered successfully",
      response,
      201
    );
  } catch (e) {
    logger.error("ERROR ::: register user ::: ", e);
    return _handleResponse(req, res, e, null);
  }
};
const userLogin = async (req, res) => {
    try {
      let userInformations = await dataValidator.validateLoginUser(req.body);
      const response = await dbHelperUser.userLogin(userInformations);
      return _handleResponseWithMessage(
        req,
        res,
        null,
        "You are successfully logged in",
        response,
        200
      );
    } catch (e) {
      logger.error("ERROR ::: login user ::: ", e);
      return _handleResponse(req, res, e, null);
    }
  };
const updateProfile = async (req, res) => {
    try {
      const tokenvalue = req.header("Authorization");
      const decoded = jwt_decoder.jwtDecode(tokenvalue);
      const userid = decoded.userId;
      let profileImage;
      let userInformations = await dataValidator.validateUpdateProfile(req.body);
      userInformations._id = userid;
      req.files ? (profileImage = req.files[0]) : null;
      userInformations.reqUserId = req.params.userId;
      const response = await dbHelperUser.updateUserByUserId(
        userInformations,
        profileImage
      );
      return _handleResponseWithMessage(req, res, null, "success", response, 200);
    } catch (e) {
      logger.error("ERROR ::: update profile ::: ", e);
      return _handleResponse(req, res, e, null);
    }
  };

let generateNewTokens = async (req, res) => {
  try {
    const tokenvalue = req.header("Authorization");
    const decoded = jwt_decoder.jwtDecode(tokenvalue);
    let response = await dbHelperUser.generateNewTokens(decoded.userId);
    return _handleResponseWithMessage(req, res, null, "Success", response, 200);
  } catch (e) {
    logger.error("ERROR ::: generateNewTokens ::: ", e);
    return _handleResponse(req, res, e, null);
  }
};

let logoutUser = async (req, res) => {
  try {
    const tokenvalue = req.header("Authorization");
    const decoded = jwt_decoder.jwtDecode(tokenvalue);
    let response = await dbHelperUser.userLogout(decoded.userId);
    return _handleResponseWithMessage(req, res, null, "Success", response, 200);
  } catch (e) {
    logger.error("ERROR ::: logoutUser ::: ", e);
    return _handleResponse(req, res, e, null);
  }
};

const forgetPassword = async (req, res) => {
  try {
    let options = await dataValidator.validateForgetPassword(req.body);
    const response = await dbHelperUser.forgotPassword(options);
    return _handleResponseWithMessage(
      req,
      res,
      null,
      "Mail sent to Email",
      response,
      200
    );
  } catch (e) {
    logger.error("ERROR ::: Forget password ::: ", e);
    return _handleResponse(req, res, e, null);
  }
};

const resetPassword = async (req, res) => {
  try {
    let options = await dataValidator.validateResetPassword(req.body);
    const tokenvalue = req.header("Authorization");
    const decoded = jwt_decoder.jwtDecode(tokenvalue);
    const userid = decoded.userId;
    options._id = userid;
    const response = await dbHelperUser.resetPassword(options);
    return _handleResponseWithMessage(
      req,
      res,
      null,
      "Password reset successfully",
      response,
      200
    );
  } catch (e) {
    logger.error("ERROR ::: Reset password ::: ", e);
    return _handleResponse(req, res, e, null);
  }
};

const changePasswordHelper = async (req, res) => {
  try {
    const tokenvalue = req.header("Authorization");
    const decoded = jwt_decoder.jwtDecode(tokenvalue);
    const userInformations = await dataValidator.validateChangePassword(
      req.body
    );
    userInformations.userId = decoded.userId;
    userInformations.reqUserId = req.params.userId;
    const response = await dbHelperUser.changePasswordHelper(userInformations);
    return _handleResponseWithMessage(req, res, null, "Success", response, 200);
  } catch (e) {
    logger.error("ERROR ::: update password ::: ", e);
    return _handleResponse(req, res, e, null);
  }
};
const getUserInfo = async (req, res) => {
  try {
    const tokenvalue = req.header("Authorization");
    const decoded = jwt_decoder.jwtDecode(tokenvalue);
    const data = { userId: decoded.userId, reqUserId: req.params.userId };
    const response = await dbHelperUser.getUserInfoHelper(data);
    return _handleResponseWithMessage(
      req,
      res,
      null,
      message.success.GET_USER_INFO,
      response,
      200
    );
  } catch (e) {
    logger.error("ERROR ::: get user info ::: ", e);
    return _handleResponse(req, res, e, null);
  }
};

const userLists = async (req, res) => {
  try {
    const tokenvalue = req.header("Authorization");
    const decoded = jwt_decoder.jwtDecode(tokenvalue);
    let options = await dataValidator.validateUserLists(req.query);
    options.userId=decoded.userId;
    options.position=decoded.position;
    const response = await dbHelperUser.userLists(options);
    return _handleResponseWithMessage(
      req,
      res,
      null,
      message.success.GET_USER_INFO,
      response,
      200
    );
  } catch (e) {
    logger.error("ERROR ::: userLists ::: ", e);
    return _handleResponse(req, res, e, null);
  }
};



module.exports = {
  registerUser,
  generateNewTokens,
  logoutUser,
  forgetPassword,
  resetPassword,
  changePasswordHelper,
  getUserInfo,
  userLists,
  updateProfile,
  userLogin
};
