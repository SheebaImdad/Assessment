const constant = require("./config/constant");

global._handleResponse = function (req, res, errors, response) {
  try {
    const origin = req.headers.origin;
    if (constant.ALLOWED_ORIGINS.indexOf(origin) > -1) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    if (errors) {
      return res
        .status(
          errors && errors.code && typeof errors.code === "number"
            ? errors.code
            : 400 || 400
        )
        .send({
          ok: errors.ok || false,
          code:
            errors && errors.code && typeof errors.code === "number"
              ? errors.code
              : 400 || 400,
          message:
            errors.errors && Object.values(errors.errors)[0]
              ? Object.values(errors.errors)[0].message
              : errors.message || errors || "Something went wrong!",
          data: [],
        });
    }
    return res.status(200).json({
      ok: true,
      code: 200,
      message: "",
      data: response,
    });
  } catch (e) {
    throw e;
  }
};

global._handleResponseWithMessage = function (
  req,
  res,
  errors,
  message,
  response,
  code
) {
  const origin = req.headers.origin;
  if (constant.ALLOWED_ORIGINS.indexOf(origin) > -1) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  if (errors) {
    return res.status(errors.code || 400).json({
      ok: errors.ok || false,
      code: errors.code || 400,
      message:
        errors.errors && Object.values(errors.errors)[0]
          ? Object.values(errors.errors)[0].message
          : errors.message || errors || "Something went wrong!",
      data: [],
    });
  }
  return res.status(code).json({
    ok: true,
    code: code,
    message: message,
    data: response,
  });
};
