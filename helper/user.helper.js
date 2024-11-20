const { DbHelper } = require("./dbHelper");
const dbInstance = new DbHelper();
const { COLLECTIONS } = require("../config/constant");
const logger = require("loglevel");
const {
  generatePasswordHash,
  checkCountryAndCountryCode,
  sendOtpOnMobile,
  comparePasswordHash,
  generateOTP,
  checkImageFile,
  imageUpload,
  generateRandomPassword,
  verifyOTP,
} = require("./helperFunction");
const message = require("../config/message");
const { generateToken } = require("./tokenGenerator");
const constant = require("../config/constant");
const redis_client = require("../helper/redisHelper");
const { sendMail, sendForgetPasswordEmail } = require("./awsSES");
const { default: mongoose } = require("mongoose");
const { UsersModel } = require("../schema/user.schema");
let registerUser = async (options) => {
  try {

    let isUserRegistered = await dbInstance.getDocumentByQuery(
      COLLECTIONS.USER_COLLECTION,
      
        { email: options.email }
      
    );
    if (isUserRegistered) {
      throw "User already exist!";
    }
    if (options.profileImage) {
      await checkImageFile(options.profileImage.buffer)
        .then((isCorrupt) => {
          if (isCorrupt === true) {
            throw message.error.INVALID_FORMAT_OF_PROFILE_IMAGE;
          }
        })
        .catch((e) => {
          throw e;
        });
      const imageFileType = constant.ALLOWED_FILE_TYPE_FOR_USER_PROFILE;
      const sizeData = constant.ALLOWED_FILE_SIZE_FOR_USER_PROFILE;
      const convertedSize = [parseInt(sizeData)];

      const imageType = imageFileType.includes(options.profileImage.mimetype);
      imageType === false
        ? (() => {
            throw message.error.INVALID_FORMAT_OF_PROFILE_IMAGE;
          })()
        : options.profileImage.size > convertedSize
        ? (() => {
            throw message.error.INVALID_SIZE_OF_PROFILE_IMAGE;
          })()
        : null;
    }
    const image = await imageUpload(options.profileImage);

    await checkCountryAndCountryCode(options.country, options.countryCode);

    let randomPassword = await generateRandomPassword();
    let encryptedPassword = await generatePasswordHash(randomPassword);
    console.log("encryptedPassword===========>", encryptedPassword);

    const dbObj = {
      fullName: options.fullName,
      email: options.email,
      country: options.country,
      countryCode: options.countryCode,
      password: encryptedPassword,
      mobileNumber: options.mobileNumber,
      aadharNumber: options.aadharNumber,
      state: options.state,
      district: options.district,
      zipCode: options.zipCode,
      policeStation: options.policeStation,
      role: constant.ENUM_VALUE.OFFICERROLE,
      profileImage: image,
      position: options.position,
      batch: options.batch,
      createdBy: options.userInfo.userId,
    };

    let user = await dbInstance.insertDocument(
      COLLECTIONS.USER_COLLECTION,
      dbObj
    );

    await sendMail(
      options.email,
      "Account Access Information",
      `Hi ${options.fullName},`,
      randomPassword
    );

    return user;
  } catch (e) {
    logger.error("dbHelperUser ::::: registerUser", e);
    throw e;
  }
};

const userLogin = async (loginUserData) => {
  try {
    const userDetail = await dbInstance.getDocumentByQuery(
      COLLECTIONS.USER_COLLECTION,
      { email: loginUserData.email }
    );

    !userDetail
      ? (() => {
          throw message.error.USER_NOT_FOUND;
        })()
      : null;

    const passwordMatch = await comparePasswordHash(
      loginUserData?.password,
      userDetail?.password || ""
    );

    !passwordMatch
      ? (() => {
          throw message.error.INCORRECT_PASSWORD;
        })()
      : null;

    const data = {
      userId: userDetail._id.toString(),
      fullName: userDetail.fullName,
      email: userDetail.email,
      country: userDetail.country,
      countryCode: userDetail.countryCode,
      mobileNumber: userDetail.mobileNumber,
      role: userDetail.role,
      policeStation: userDetail.policeStation,
      profileImage: userDetail.profileImage || "",
      permission: userDetail.permission,
      zipCode: userDetail.zipCode,
      role: userDetail.role,
      aadharNumber: userDetail.aadharNumber,
      batch: userDetail.batch,
      position: userDetail.position,
    };

    const jsonToken = generateToken(data);
    const userId = userDetail._id.toString();
    const accessKeyName = `${userId}ACCESSTOKEN${constant.CACHESECRETKEY}`;
    const refreshKeyName = `${userId}REFRESHTOKEN${constant.CACHESECRETKEY}`;
    const redisAccessValue = JSON.stringify(jsonToken.accessToken);
    const redisRefreshValue = JSON.stringify(jsonToken.refreshToken);

    // Check if access token and refresh token already exist and delete them
    const existingAccessToken = await redis_client.get(accessKeyName);
    if (existingAccessToken) {
      await redis_client.del(existingAccessToken);
    }
    const existingRefreshToken = await redis_client.get(refreshKeyName);
    if (existingRefreshToken) {
      await redis_client.del(existingRefreshToken);
    }

    await redis_client.set(accessKeyName, redisAccessValue, {
      EX: 5 * 60 * 60, // Set expiration time for access token
    });
    await redis_client.set(refreshKeyName, redisRefreshValue, {
      EX: 24 * 60 * 60, // Set expiration time for refresh token
    });

    const accessToken = jsonToken.accessToken;
    const refreshToken = jsonToken.refreshToken;

    return { accessToken, refreshToken };
  } catch (e) {
    logger.error("userAuthHelper ------> userLogin", e);
    throw e;
  }
};

let generateNewTokens = async (options) => {
  try {
    let response = await dbInstance.getDocumentByQuery(
      COLLECTIONS.USER_COLLECTION,
      {
        _id: new mongoose.Types.ObjectId(options),
      }
    );
    !response
      ? (() => {
          throw message.error.USER_NOT_FOUND;
        })()
      : null;

    let jsonToken;
    let accessKeyName = `${options}ACCESSTOKEN${constant.CACHESECRETKEY}`;
    let refreshKeyName = `${options}REFRESHTOKEN${constant.CACHESECRETKEY}`;
    const tokenData = {
      userId: response._id.toString(),
      fullName: response.fullName,
      mobileNumber: response.mobileNumber,
      role: response.role,
      permission: response.permission,
      email: response.email,
      country: response.country,
      countryCode: response.countryCode,
      profileImage: response.profileImage,
      aadharNumber: response.aadharNumber,
      zipCode: response.zipCode,
      policeStation: response.policeStation,
      batch: response.batch,
      position: response.position,
    };
    jsonToken = generateToken(tokenData);
    const redisAccessValue = JSON.stringify(jsonToken.accessToken);
    const redisRefreshValue = JSON.stringify(jsonToken.refreshToken);
    await redis_client.set(accessKeyName, redisAccessValue, {
      EX: 5 * 60 * 60,
    });
    await redis_client.set(refreshKeyName, redisRefreshValue, {
      EX: 24 * 60 * 60,
    });
    const tokenAccessValue = await redis_client.get(accessKeyName);
    const tokenRefreshValue = await redis_client.get(refreshKeyName);
    const tokens = JSON.parse(tokenAccessValue);
    const tokensRefresh = JSON.parse(tokenRefreshValue);
    return {
      accessToken: tokens,
      refreshToken: tokensRefresh,
    };
  } catch (e) {
    logger.error("dbHelperUser------>generateNewTokens", e);
    throw e;
  }
};

const userLogout = async (options) => {
  try {
    let userId = options.toString();
    let accessKeyName = `${userId}ACCESSTOKEN${constant.CACHESECRETKEY}`;
    let refreshKeyName = `${userId}REFRESHTOKEN${constant.CACHESECRETKEY}`;

    const multi = redis_client.multi();

    multi.del(accessKeyName);
    multi.del(refreshKeyName);

    const replies = await multi.exec();
    const deletedKeysCount = replies.reduce(
      (total, reply) => total + (reply === 1),
      0
    );

    if (deletedKeysCount > 0) {
      return message.success.LOGGED_OUT;
    } else {
      throw { message: message.error.ALREADY_LOGGED_OUT };
    }
  } catch (e) {
    logger.error("userHelper------>userLogout", e);
    throw e;
  }
};

let forgotPassword = async (options) => {
  try {
    let userDetail = await dbInstance.getDocumentByQuery(
      COLLECTIONS.USER_COLLECTION,
      {
        email: options.email,
      }
    );
    !userDetail
      ? (() => {
          throw message.error.USER_NOT_FOUND;
        })()
      : null;

    let userId = userDetail._id.toString();
    let keyname = `${userId}FORGETPASSWORD${constant.CACHESECRETKEY}`;
    let data = {
      userId: userDetail._id.toString(),
      fullName: userDetail.fullName,
      email: userDetail.email,
      country: userDetail.country,
      countryCode: userDetail.countryCode,
      mobileNumber: userDetail.mobileNumber,
      role: userDetail.role,
      policeStation: userDetail.policeStation,
      profileImage: userDetail.profileImage || "",
      permission: userDetail.permission,
      zipCode: userDetail.zipCode,
      role: userDetail.role,
      aadharNumber: userDetail.aadharNumber,
      batch: userDetail.batch,
      position: userDetail.position,
    };
    let jsonToken = generateToken(data);
    let accessToken = jsonToken.accessToken;
    await sendForgetPasswordEmail(
      userDetail.fullName,
      options.email,
      "http://15.206.124.114:3040/auth/jwt/new-password",
      accessToken
    );

    const redisValue = JSON.stringify(jsonToken.accessToken);
    await redis_client.set(keyname, redisValue, {
      EX: 60 * 60,
    });
    const tokenValue = await redis_client.get(keyname);
    const tokens = JSON.parse(tokenValue);

    let obj = {
      token: tokens,
      message: message.success.RESET_PASSWORD_LINK,
    };

    return obj;
  } catch (e) {
    logger.error("userAuthHelper------>forgotPassword", e);
    throw e;
  }
};

let resetPassword = async (options) => {
  try {
    let response = await dbInstance.getDocumentByQuery(
      COLLECTIONS.USER_COLLECTION,
      { _id: new mongoose.Types.ObjectId(options._id) }
    );

    let userId = response._id.toString();
    let keyname = `${userId}FORGETPASSWORD${constant.CACHESECRETKEY}`;

    let encryptedPassword = await generatePasswordHash(options.newPassword);
    await dbInstance.updateDocumentByQuery(
      COLLECTIONS.USER_COLLECTION,
      { _id: new mongoose.Types.ObjectId(options._id) },
      {
        password: encryptedPassword,
        updatedAt: Date.now(),
        updatedBy: new mongoose.Types.ObjectId(userId),
      }
    );

    await redis_client.del(keyname);

    return message.success.PASSWORD_RESET_SUCCESSFULLY;
  } catch (e) {
    logger.error("userAuthHelper------>changePassword", e);
    throw e;
  }
};

const changePasswordHelper = async (options) => {
  try {
    const userInfo = await dbInstance.getDocumentByQuery(
      COLLECTIONS.USER_COLLECTION,
      { _id: new mongoose.Types.ObjectId(options.userId) }
    );

    options.userId !== options.reqUserId
      ? (() => {
          throw message.error.INVALID_USER;
        })()
      : null;

    !userInfo
      ? (() => {
          throw message.error.USER_NOT_FOUND;
        })()
      : null;

    const password = await comparePasswordHash(
      options.oldPassword,
      userInfo.password
    );

    password === false
      ? (() => {
          throw message.error.INCORRECT_OLD_PASSWORD;
        })()
      : null;
    options.oldPassword === options.newPassword
      ? (() => {
          throw message.error.PASSWORD_ALREADY_USED;
        })()
      : null;

    const encryptedPassword = await generatePasswordHash(options.newPassword);
    const updatePassword = await dbInstance.updateDocument(
      COLLECTIONS.USER_COLLECTION,
      options.userId,
      { password: encryptedPassword }
    );

    return updatePassword
      ? message.success.PASSWORD_CHANGED
      : (() => {
          throw message.error.SOMETHING_WENT_WRONG;
        })();
  } catch (e) {
    logger.error("userAuthHelper ------> changePasswordHelper", e);
    throw e;
  }
};

const getUserInfoHelper = async (token) => {
  try {
    token.userId !== token.reqUserId
      ? (() => {
          throw message.error.INVALID_USER;
        })()
      : null;
    const userInfo = await dbInstance.getDocumentByQuery(
      COLLECTIONS.USER_COLLECTION,
      { _id: new mongoose.Types.ObjectId(token.userId) }
    );

    !userInfo
      ? (() => {
          throw message.error.USER_NOT_FOUND;
        })()
      : null;

    return userInfo;
  } catch (e) {
    logger.error("userAuthHelper------>getUserInfoHelper", e);
    throw e;
  }
};

const userLists = async (options) => {
  try {
    let users = [];
    let totalCount;
    let pipeline = [];
    if (options.role) {
      return await UsersModel.find({ role: options.role });
    }
    if (constant.ENUM_VALUE.POSITION.includes(options.position)) {
      pipeline = [
        {
          $unwind: {
            path: "$assigneeDetails",
          },
        },
        {
          $match: {
            "assigneeDetails.assigneeId": new mongoose.Types.ObjectId(
              options.userId
            ),
          },
        },
        {
          $group: {
            _id: "$userId",
            grievanceId: {
              $first: "$grievanceId",
            },
            userId: {
              $first: "$userId",
            },
            fullName: {
              $first: "$fullName",
            },
            gender: {
              $first: "$gender",
            },
            age: {
              $first: "$age",
            },
            villageLocality: {
              $first: "$villageLocality",
            },
            addressLine1: {
              $first: "$addressLine1",
            },
            addressLine2: {
              $first: "$addressLine2",
            },
            mobileNumber: {
              $first: "$mobileNumber",
            },
            incidentDetails: {
              $first: "$incidentDetails",
            },
            complaintDetails: {
              $first: "$complaintDetails",
            },
            identityType: {
              $first: "$identityType",
            },
            identityDetail: {
              $first: "$identityDetail",
            },
            proofAttachmentFile: {
              $first: "$proofAttachmentFile",
            },
            complaintFile: {
              $first: "$complaintDetails",
            },
            uploadedDocuments: {
              $first: "$uploadedDocuments",
            },
            country: {
              $first: "$country",
            },
            email: {
              $first: "$email",
            },
            countryCode: {
              $first: "$countryCode",
            },
            userId: {
              $first: "$userId",
            },
            createdAt: {
              $first: "$createdAt",
            },
            updatedAt: {
              $first: "$updatedAt",
            },
            updatedBy: {
              $first: "$updatedBy",
            },
            status: {
              $first: "$status",
            },
            aadharNumber: {
              $first: "$aadharNumber",
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "data",
          },
        },
        {
          $unwind: {
            path: "$data",
          },
        },
        {
          $project: {
            _id: "$data._id",
            fullName: "$data.fullName",
            email: "$data.email",
            mobileNumber: "$data.mobileNumber",
            countryCode: "$data.countryCode",
            country: "$data.country",
            aadharNumber: "$data.aadharNumber",
            profileImage: "$data.profileImage",
            zipCode: "$data.zipCode",
          },
        },
      ];
      totalCount = (await GrievanceModel.aggregate(pipeline)).length;
      if (options.pageNo && options.pageSize) {
        pipeline.push({ $skip: options.pageSize * (options.pageNo - 1) });
        pipeline.push({ $limit: options.pageSize });
      }
      users = await GrievanceModel.aggregate(pipeline);
    } else if (options.role === constant.ENUM_VALUE.ROLE[1]) {
      pipeline = [
        {
          $match: {
            role: constant.ENUM_VALUE.ROLE[1],
          },
        },
      ];
      totalCount = (await UsersModel.aggregate(pipeline)).length;
      if (options.pageNo && options.pageSize) {
        pipeline.push({ $skip: options.pageSize * (options.pageNo - 1) });
        pipeline.push({ $limit: options.pageSize });
      }
      users = await UsersModel.aggregate(pipeline);
    } else {
      pipeline = [
        {
          $group: {
            _id: "$userId",
            grievanceId: {
              $first: "$grievanceId",
            },
            userId: {
              $first: "$userId",
            },
            fullName: {
              $first: "$fullName",
            },
            gender: {
              $first: "$gender",
            },
            age: {
              $first: "$age",
            },
            villageLocality: {
              $first: "$villageLocality",
            },
            addressLine1: {
              $first: "$addressLine1",
            },
            addressLine2: {
              $first: "$addressLine2",
            },
            mobileNumber: {
              $first: "$mobileNumber",
            },
            incidentDetails: {
              $first: "$incidentDetails",
            },
            complaintDetails: {
              $first: "$complaintDetails",
            },
            identityType: {
              $first: "$identityType",
            },
            identityDetail: {
              $first: "$identityDetail",
            },
            proofAttachmentFile: {
              $first: "$proofAttachmentFile",
            },
            complaintFile: {
              $first: "$complaintDetails",
            },
            uploadedDocuments: {
              $first: "$uploadedDocuments",
            },
            country: {
              $first: "$country",
            },
            email: {
              $first: "$email",
            },
            countryCode: {
              $first: "$countryCode",
            },
            userId: {
              $first: "$userId",
            },
            createdAt: {
              $first: "$createdAt",
            },
            updatedAt: {
              $first: "$updatedAt",
            },
            updatedBy: {
              $first: "$updatedBy",
            },
            status: {
              $first: "$status",
            },
            aadharNumber: {
              $first: "$aadharNumber",
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "data",
          },
        },
        {
          $unwind: {
            path: "$data",
          },
        },
        {
          $project: {
            _id: "$data._id",
            fullName: "$data.fullName",
            lastName: "$data.lastName",
            email: "$data.email",
            mobileNumber: "$data.mobileNumber",
            countryCode: "$data.countryCode",
            country: "$data.country",
            aadharNumber: "$data.aadharNumber",
            profileImage: "$data.profileImage",
            zipCode: "$data.zipCode",
          },
        },
      ];
      totalCount = (await GrievanceModel.aggregate(pipeline)).length;
      if (options.pageNo && options.pageSize) {
        pipeline.push({ $skip: options.pageSize * (options.pageNo - 1) });
        pipeline.push({ $limit: options.pageSize });
      }
      users = await GrievanceModel.aggregate(pipeline);
    }
    users.sort((a, b) => b.createdAt - a.createdAt);
    return { users, totalCount };
  } catch (err) {
    logger.error("Error fetching users:", err);
    throw err;
  }
};

const updateUserByUserId = async (userDoc, profileImage) => {
  try {
    if (userDoc._id !== userDoc.reqUserId) {
      throw "Invalid User!";
    }

    for (const key in userDoc) {
      if (
        Object.prototype.hasOwnProperty.call(userDoc, key) &&
        userDoc[key] === ""
      ) {
        throw `${key} should not be empty`;
      }
    }

    if (profileImage) {
      console.log("++++++++++++");
      await checkImageFile(profileImage.buffer)
        .then((isCorrupt) => {
          if (isCorrupt === true) {
            throw message.error.INVALID_FORMAT_OF_PROFILE_IMAGE;
          }
        })
        .catch((e) => {
          throw e;
        });
      const imageFileType = constant.ALLOWED_FILE_TYPE_FOR_USER_PROFILE;
      const sizeData = constant.ALLOWED_FILE_SIZE_FOR_USER_PROFILE;
      const convertedSize = [parseInt(sizeData)];

      const imageType = imageFileType.includes(profileImage.mimetype);
      imageType === false
        ? (() => {
            throw message.error.INVALID_FORMAT_OF_PROFILE_IMAGE;
          })()
        : profileImage.size > convertedSize
        ? (() => {
            throw message.error.INVALID_SIZE_OF_PROFILE_IMAGE;
          })()
        : null;
    }
    const image = await imageUpload(profileImage);
    console.log("image>", image);

    const updateProfile = await dbInstance.updateDocument(
      COLLECTIONS.USER_COLLECTION,
      userDoc._id,
      {
        fullName: userDoc.fullName,
        profileImage: image,
        updatedAt: Date.now(),
      }
    );

    return updateProfile;
  } catch (e) {
    logger.error("userAuthHelper------>updateUserByUserId", e);
    throw e;
  }
};

module.exports = {
  registerUser,
  userLogin,
  generateNewTokens,
  userLogout,
  forgotPassword,
  resetPassword,
  changePasswordHelper,
  getUserInfoHelper,
  userLists,
  updateUserByUserId,
};
