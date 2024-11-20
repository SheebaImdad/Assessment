const { Validator } = require("node-input-validator");
const message = require("../config/message");
const constant = require("../config/constant");
const { isPasswordStrong } = require("../helper/helperFunction");

module.exports = {
  validateRegisterUser: async function (dataObj) {
    const v = new Validator(dataObj, {
      fullName: "string|required|maxLength:30",
      email: "email",
      country: `string|required|in:${constant.ENUMVALUEOFCOUNTRY.join(",")}`,
      countryCode: "string|required",
      mobileNumber: "numeric|required|min:1",
      zipCode: "string|required",
    });

    v.addPostRule((provider) => {
      const { aadharNumber, zipCode, mobileNumber } = provider.validationRules;
      const isAadharValid = validator.isValidNumber(aadharNumber.value);
     

      if (mobileNumber.value) {
        !constant.REGEX.mobileRegex.test(mobileNumber.value)
          ? (() => {
              throw message.error.INVALID_MOBILE;
            })()
          : null;
      }
      if (zipCode.value) {
        !constant.REGEX.zipcodeRegex.test(zipCode.value)
          ? (() => {
              throw message.error.INVALID_ZIPCODE;
            })()
          : null;
      }
    });

    const matched = await v.check();

    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }

    return dataObj;
  },

  validateLoginUser: async function (dataObj) {
    const v = new Validator(dataObj, {
      email: "email|required",
      password: "string|required",
    });

    const matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }

    return dataObj;
  },

  validateSendOtp: async function (dataObj) {
    const v = new Validator(dataObj, {
      mobileNumber: "string|required",
      isLogin: "boolean|required",
    });

    const matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }

    return dataObj;
  },

  validateVerifyOtp: async function (dataObj) {
    const v = new Validator(dataObj, {
      mobileNumber: "string|required",
      otp: "string|required",
    });

    const matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }

    return dataObj;
  },

  validateForgetPassword: async function (dataObj) {
    const v = new Validator(dataObj, {
      email: "email|required",
    });
    const matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }

    return dataObj;
  },

  validateResetPassword: async function (dataObj) {
    const v = new Validator(dataObj, {
      newPassword: "string|required",
      confirmPassword: "string|required",
    });

    v.addPostRule((provider) => {
      const { newPassword, confirmPassword } = provider.validationRules;

      const isPasswordValid = newPassword.value
        ? isPasswordStrong(newPassword.value)
        : true;
      const doPasswordsMatch = newPassword.value === confirmPassword.value;
      !isPasswordValid
        ? (() => {
            throw message.error.VALIDATE_PASSWORD;
          })()
        : null;

      !doPasswordsMatch
        ? (() => {
            throw message.error.PASSWORD_CONFIRM_PASSWORD;
          })()
        : null;
    });
    const matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }
    return dataObj;
  },

  validateChangePassword: async function (dataObj) {
    const v = new Validator(dataObj, {
      oldPassword: "string|required",
      newPassword: "string|required",
      confirmPassword: "string|required",
    });

    v.addPostRule((provider) => {
      const { newPassword, confirmPassword } = provider.validationRules;

      const isPasswordValid = newPassword.value
        ? isPasswordStrong(newPassword.value)
        : true;
      const doPasswordsMatch = newPassword.value === confirmPassword.value;
      !isPasswordValid
        ? (() => {
            throw message.error.VALIDATE_PASSWORD;
          })()
        : null;

      !doPasswordsMatch
        ? (() => {
            throw message.error.PASSWORD_CONFIRM_PASSWORD;
          })()
        : null;
    });
    const matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }

    return dataObj;
  },

  validateUserLists: async function (dataObj) {
    let { pageNo, pageSize, department, role } = dataObj;
    const v = new Validator(dataObj, {
      role: `string|in:${constant.ENUM_VALUE.ROLE.join(",")}`,
      department: "string",
      fullName: "string",
      pageNo: "numeric|min:1",
      pageSize: "numeric|min:1",
    });
    const matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }

    return {
      pageNo: parseInt(pageNo),
      pageSize: parseInt(pageSize),
      role: role,
      department: department,
      // firstName: firstName,
    };
  },



  validateUpdateProfile: async function (dataObj) {
    const v = new Validator(dataObj, {
      fullName: "string|required|maxLength:30",
    });

    const matched = await v.check();

    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }

    return dataObj;
  },
};
