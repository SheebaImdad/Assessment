const jwt = require("jsonwebtoken");
const constant = require("../config/constant");
const message = require("../config/message");
const jwt_decoder = require("jwt-decode");
const logger = require("loglevel");
const redis_client = require("../helper/redisHelper");

let checkToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token || token.length === 0 || token === null) {
      return res.status(401).json(message.error.AccessTokenISNULL);
    }
    let decoded = jwt_decoder.jwtDecode(token);
    const userId = decoded.userId;
    let keyname = `${userId}ACCESSTOKEN${constant.CACHESECRETKEY}`;
    const tokenValue = await redis_client.get(keyname);
    const tokens = JSON.parse(tokenValue);
    if (!tokenValue || tokenValue === "") {
      return res.status(401).json(message.error.INVALID_TOKEN);
    }
    const tokenData = `Bearer ${tokens}`;
    if (token !== tokenData) {
      return res.status(401).json(message.error.AccessTokenISNULL);
    } else if (token) {
      // Remove Bearer from string
      (token = token.slice(7)), token.length;
      jwt.verify(token, constant.ACCESSTOKENSECRETKEY, (err, decoded) => {
        if (err) {
          return res.status(401).json(message.error.AccessTokenISNULL);
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(401).json(message.error.AccessTokenISNULL);
    }
  } catch (e) {
    logger.warn(e);
    return res.status(401).json(message.error.AccessTokenISNULL);
  }
};

let verifyRefreshToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token || token.length === 0 || token === null) {
      return res.status(401).json(message.error.AccessTokenISNULL);
    }
    let decoded = jwt_decoder.jwtDecode(token);
    const userId = decoded.userId;
    let keyname = `${userId}REFRESHTOKEN${constant.CACHESECRETKEY}`;
    const tokenValue = await redis_client.get(keyname);
    const tokens = JSON.parse(tokenValue);
    if (!tokenValue || tokenValue === "") {
      return res.status(401).json(message.error.INVALID_TOKEN);
    }
    const tokenData = `Bearer ${tokens}`;
    if (token !== tokenData) {
      return res.status(401).json(message.error.AccessTokenISNULL);
    } else if (token) {
      // Remove Bearer from string
      (token = token.slice(7)), token.length;
      jwt.verify(token, constant.REFRESHTOKENSECRETKEY, (err, decoded) => {
        if (err) {
          return res.status(401).json(message.error.AccessTokenISNULL);
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(401).json(message.error.AccessTokenISNULL);
    }
  } catch (e) {
    logger.warn(e);
    return res.status(401).json(message.error.AccessTokenISNULL);
  }
};
let checkForgetPasswordToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token || token.length === 0 || token === null) {
      return res.status(401).json(message.error.AccessTokenISNULL);
    }
    let decoded = jwt_decoder.jwtDecode(token);
    const userId = decoded.userId;
    let keyname = `${userId}FORGETPASSWORD${constant.CACHESECRETKEY}`;
    const tokenValue = await redis_client.get(keyname);
    const tokens = JSON.parse(tokenValue);
    if (!tokenValue || tokenValue === "") {
      return res.status(401).json(message.error.INVALID_TOKEN);
    }
    const tokenData = `Bearer ${tokens}`;
    if (token !== tokenData) {
      return res.status(401).json(message.error.AccessTokenISNULL);
    } else if (token) {
      // Remove Bearer from string
      (token = token.slice(7)), token.length;
      jwt.verify(token, constant.ACCESSTOKENSECRETKEY, (err, decoded) => {
        if (err) {
          return res.status(401).json(message.error.AccessTokenISNULL);
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(401).json(message.error.AccessTokenISNULL);
    }
  } catch (e) {
    logger.warn(e);
    return res.status(401).json(message.error.AccessTokenISNULL);
  }
};
let checkAuthorizedUser = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token || token.length === 0 || token === null) {
      next();
    } else {
      let decoded = jwt_decoder.jwtDecode(token);
      const userId = decoded.userId;
      let keyname = `${userId}ACCESSTOKEN${constant.CACHESECRETKEY}`;
      const tokenValue = await redis_client.get(keyname);
      const tokens = JSON.parse(tokenValue);
      if (!tokenValue || tokenValue === "") {
        return res.status(401).json(message.error.INVALID_TOKEN);
      }
      const tokenData = `Bearer ${tokens}`;
      if (token !== tokenData) {
        return res.status(401).json(message.error.AccessTokenISNULL);
      } else if (token) {
        // Remove Bearer from string
        (token = token.slice(7)), token.length;
        jwt.verify(token, constant.ACCESSTOKENSECRETKEY, (err, decoded) => {
          if (err) {
            return res.status(401).json(message.error.AccessTokenISNULL);
          } else {
            req.decoded = decoded;
            next();
          }
        });
      } else {
        return res.status(401).json(message.error.AccessTokenISNULL);
      }
    }
  } catch (e) {
    logger.warn(e);
    return res.status(401).json(message.error.AccessTokenISNULL);
  }
};
module.exports = {
  checkToken,
  verifyRefreshToken,
  checkForgetPasswordToken,
  checkAuthorizedUser,
};
