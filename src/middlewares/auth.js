const dev = require("../config");
const { errorResponse } = require("../helpers/responseHandler");
const jwt = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
  try {
    const header = req.headers.cookie;
    // console.log(typeof(header))
    if (!header || header === undefined) {
      errorResponse(res, 401, "You need to login.")
    };
    const token = header.split("=")[1];
    console.log(header)
    console.log('1')
    console.log(token, dev.app.jwtAuthorizationKey)
    jwt.verify(token, dev.app.jwtAuthorizationKey);
    console.log('2')

    next();
  } catch (error) {
    next(error);
  }
};

const isLoggedOut = (req, res, next) => {
  try {
    const header = req.headers.cookie;
    if (header) {
      errorResponse(res, 401, "You need to logout.")
    };
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { isLoggedIn, isLoggedOut };
