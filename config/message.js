module.exports = {
  success: {
    List_QUESTION_SUCCESS:{
        ok: true,
        code: 200,
        message: "Question list retrieved successfully",
    },
    UPLOAD_SUCCESS:{
        ok: true,
        code: 200,
        message: "File uploaded successfully",
    }
  },
  error: {
    INSERT_MONGODB:"success",
    INVALID_COUNTRY_COUNTRYCODE: "Invalid country and countryCode combination",
    INVALID_COLLECTION_NAME:"Invalid collection",
    USER_NOT_FOUND:{
        ok: false,
        code: 404,
        message: "User not found",
    },
    AccessTokenISNULL: {
        ok: false,
        code: 401,
        message: "UnAuthorized",
      },
      RefreshTokenISNULL: {
        ok: false,
        code: 401,
        message: "UnAuthorized",
      },
      forbidden: {
        ok: false,
        code: 403,
        message: "You don't have access to this resource",
      },
      INVALID_TOKEN: {
        ok: false,
        code: 401,
        message: "Invalid token!",
      },
      USER_NOT_FOUND: {
        ok: false,
        code: 404,
        message: "User not found!",
      },
      INCORRECT_PASSWORD: {
        ok: false,
        code: 401,
        message: "Incorrect password!",
      },
      USER_ALREADY_LOGGED_IN: {
        ok: false,
        code: 409,
        message: "User already logged in",
      },
      ALREADY_LOGGED_OUT: {
        ok: false,
        code: 409,
        message: "User already logged out!",
      },
      INVALID_MOBILE:{
        ok: false,
        code: 400,
        message: "Invalid mobile number!",
      },
      INVALID_ZIPCODE:{
        ok: false,
        code: 400,
        message: "Invalid zip code!",
      },
      FILEISREQUIRED:{
        ok: false,
        code: 400,
        message: "File is required!",
      },
      COURSE_NOT_FOUND:{
        ok: false,
        code: 404,
        message: "Course not found!",
      },
      BadRequestValidation:{
        ok: false,
        code: 400,
        message: "Bad Request Validation Failed",
      }
  },
};
