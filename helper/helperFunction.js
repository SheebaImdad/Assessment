const AWS = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const bcrypt = require("bcryptjs");
const logger = require("loglevel");
const constant = require("../config/constant");
const passwordValidator = require("password-validator");
const { countries_list } = require("../config/constant");
const message = require("../config/message");
const sharp = require("sharp");

const generatePasswordHash = async (plainPassword) => {
  let salt = bcrypt.genSaltSync(11);
  return bcrypt.hashSync(plainPassword, salt);
};

const comparePasswordHash = async (plainPassword, hash) => {
  return bcrypt.compareSync(plainPassword, hash);
};


const checkCountryAndCountryCode = async (countries, countryCode) => {
  try {
    const matchingCountry = countries_list.find(
      (country) =>
        country.country === countries && country.countryCode === countryCode
    );

    !matchingCountry
      ? (() => {
          throw message.error.INVALID_COUNTRY_COUNTRYCODE;
        })()
      : null;

    return matchingCountry;
  } catch (e) {
    throw e;
  }
};

const isPasswordStrong = (password) => {
  const schema = new passwordValidator();

  schema
    .is()
    .min(8) // Minimum length 8
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols() // Must have symbols
    .not()
    .spaces(); // Cannot contain spaces

  return schema.validate(password);
};

const imageUpload = async (image) => {
  try {
    let myFile;
    let fileType;
    const s3 = new AWS.S3({
      accessKeyId: constant.AWS_CREDENTIALS.ACCESS_KEY_ID,
      secretAccessKey: constant.AWS_CREDENTIALS.SECRET_ACCESS_KEY,
    });
    if (image) {
      let splitted = image.mimetype.split("/")[1];

      myFile = image.originalname.split(".");
      fileType = myFile[myFile.length - 1];

      const updatedImageData = {
        ...image,
        buffer: Buffer.from(image.buffer),
      };
      const params = {
        Bucket: constant.AWS_CREDENTIALS.BUCKET,
        Key: `${myFile}.${splitted}`,
        Body: updatedImageData.buffer,
        ContentDisposition: "inline",
      };
      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            logger.warn("Error uploading to S3:", err);
            reject(err);
            return;
          }
          logger.info("S3 upload successful. Location:", data.Location);
          resolve(data.Location);
        });
      });
    }
  } catch (e) {
    logger.error(e);
  }
};

// Function to check if an image file is corrupt
const checkImageFile = async (filePath) => {
  try {
    await sharp(filePath).metadata();
    return false;
  } catch (err) {
    return true;
  }
};

const generateRandomPassword = async () => {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$%^&*()";

  let password = "";

  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numberChars[Math.floor(Math.random() * numberChars.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  for (let i = 4; i < 8; i++) {
    const randomIndex = Math.floor(
      Math.random() *
        (uppercaseChars + lowercaseChars + numberChars + specialChars).length
    );
    password += (uppercaseChars + lowercaseChars + numberChars + specialChars)[
      randomIndex
    ];
  }

  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return password;
};


const fileUpload = async (image) => {
  try {
    let myFile;
    let fileType;
    const s3 = new AWS.S3({
      accessKeyId: constant.AWS_CREDENTIALS.ACCESS_KEY_ID,
      secretAccessKey: constant.AWS_CREDENTIALS.SECRET_ACCESS_KEY,
    });
    if (image) {
      let splitted = image.mimetype.split("/")[1];

      myFile = image.originalname.split(".");
      fileType = myFile[myFile.length - 1];

      const updatedImageData = {
        ...image,
        buffer: Buffer.from(image.buffer),
      };
      const params = {
        Bucket: constant.AWS_CREDENTIALS.BUCKET,
        Key: `${myFile}.${splitted}`,
        Body: updatedImageData.buffer,
        ContentDisposition: "inline",
      };
      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            logger.warn("Error uploading to S3:", err);
            reject(err);
            return;
          }
          logger.info("S3 upload successful. Location:", data.Location);
          resolve(data.Location);
        });
      });
    }
  } catch (e) {
    logger.error(e);
  }
};

const isPositiveNumber = (value) => {
  const parsedValue = parseFloat(value);
  return !isNaN(parsedValue) && parsedValue > 0;
};




module.exports = {
  generatePasswordHash,
  comparePasswordHash,
  checkCountryAndCountryCode,
  isPasswordStrong,
  imageUpload,
  checkImageFile,
  generateRandomPassword,
  fileUpload,
  isPositiveNumber,
};
