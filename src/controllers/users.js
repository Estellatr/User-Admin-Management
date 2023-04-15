const jwt = require("jsonwebtoken");
const fs = require("fs");

const nodemailer = require("nodemailer");
const { securePassword, comparePassword } = require("../helpers/bcryptPassword");
const User = require("../models/users");
const dev = require("../config");
const { sendEmailWithNodeMailer } = require("../helpers/email");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.fields;
    const { image } = req.files;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Name, Email, Password or Phone Number are missing",
      });
    }
    if (image && image.size > 5000000) {
      return res.status(400).json({
        message: "Image size too big - Images cannot be larger than 5mb",
      });
    }

    const exists = await User.findOne({ email: email });
    if (exists) {
      return res.status(400).json({
        message: "User with this email already exists.",
      });
    }

    const hashedPassword = await securePassword(password);

    const token = jwt.sign(
      { name, email, hashedPassword, phone, image },
      dev.app.jwtSecretKey,
      { expiresIn: "10m" }
    );

    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
        <html>
        <h2>Hello ${name}!</h2>
        <p>Please click <a href="${dev.app.clientUrl}/api/users/activate/${token}" target="_blank">here</a> to activate your account. </p>    
        </html>
        `,
    };
    sendEmailWithNodeMailer(emailData);

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

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    console.log(req.body);
    if (!token) {
      return res.status(404).json({
        message: "Token missing",
      });
    }
    jwt.verify(token, dev.app.jwtSecretKey, async function (err, decoded) {
      if (err) {
        return res.status(401).json({
          message: "Token has expired",
        });
      }
      const { name, email, hashedPassword, phone, image } = decoded;
      const exists = await User.findOne({ email: email });
      if (exists) {
        return res.status(400).json({
          message: "User with this email already exists.",
        });
      }
      const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone,
      });

      if (image) {
        newUser.image.data = fs.readFileSync(image.path);
        newUser.image.contentType = image.type;
      }

      const user = await newUser.save();
      if (!user) {
        return res.status(400).json({
          message: "User was not created",
        });
      }
      return res.status(201).json({
        message: "User was created and your account is now verified!",
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const userProfile = async (req, res) => {

}


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({
        message: "Both email and password are required to login!"
      })
    }
    const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({
          message: "User with this email does not exist.",
        });
      }

    const passwordMatched = await comparePassword(password, user.password);

    if (!passwordMatched) {
      return res.status(400).json({
        message: "Email or Password incorrect"
      })
    }

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image
      },
      message: "Login successful!"
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
};

const logoutUser = (req, res) => {
  try {
    res.status(200).json({
      message: "Logout successful!"
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}


module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  userProfile
};
