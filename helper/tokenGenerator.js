const tokenGenerator = require("jsonwebtoken");
const constant = require("../config/constant");

module.exports.generateToken = (options) => {
  const payload = options;

  const accessToken = tokenGenerator.sign(
    payload,
    constant.ACCESSTOKENSECRETKEY,
    {
      expiresIn: "5h", // Access token will be expired after
    }
  );

  const refreshToken = tokenGenerator.sign(
    payload,
    constant.REFRESHTOKENSECRETKEY,
    {
      expiresIn: "24h",
    }
  );

  return { accessToken, refreshToken };
};
