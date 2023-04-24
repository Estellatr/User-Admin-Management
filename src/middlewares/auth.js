const dev = require("../config");
const { errorResponse } = require("../helpers/responseHandler");
const jwt = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
  try {
    // if (req.session.userID) {
    //     next()
    // } else {
    //     return res.status(400).json({
    //         message: "You need to login."
    //     })
    // }
    if (!req.headers.cookie) {
      return errorResponse(res, 404, "No cookie found");
    }

    const token = req.headers.cookie.split("=")[1];

    if (!token) {
      errorResponse(res, 400, "No token found.");
    }

    jwt.verify(
      String(dev.app.jwtAuthorizationKey),
      token,
      async (err, user) => {
        if (err) {
          errorResponse(res, 403, "Invalid token");
        }
        req.id = user.id;
        next();
      }
    );
  } catch (error) {
    res.send({
      message: error.message,
    });
  }
};

const isLoggedOut = (req, res, next) => {
  try {
    if (req.session.userID) {
      return res.status(400).json({
        message: "You need to logout",
      });
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { isLoggedIn, isLoggedOut };
