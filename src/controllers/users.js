const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { securePassword } = require("../helpers/bcryptPassword");
const User = require("../models/users");
const dev = require("../config");
const { sendEmailWithNodeMailer } = require("../helpers/email");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.fields;
    const { image } = req.files;
    if (!name || !email || !password || !phone) {
        return res.status(400).json({
            message: "Name, Email, Password or Phone Number are missing"
        })
    }
    if (image && image.size > 5000000) {
        return res.status(400).json({
            message: "Image size too big - Images cannot be larger than 5mb"
        })
    }

    const exists = await User.findOne({email: email});
    if (exists) {
        return res.status(400).json({
            message: "User with this email already exists."
        })
    }

    const hashedPassword = await securePassword(password)

    const token = jwt.sign({ name, email, hashedPassword, phone, image }, dev.app.jwtSecretKey, {expiresIn: '10m'});

    const emailData = {
        email,
        subject: "Account Activation Email",
        html: `
        <div>
        <h2>Hello ${name}!</h2>
        <p>Please click here <a href="${dev.app.clientUrl}/api/users/activate/${token}" target="_blank"></a> to activate your account. </p>
        </div>
        `
    }
    sendEmailWithNodeMailer(emailData)

    res.status(201).json({
      token: token,
      message: "A verification link has been sent to your provided email.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
};
