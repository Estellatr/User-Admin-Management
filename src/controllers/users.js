const jwt = require("jsonwebtoken");
const fs = require("fs");

const { securePassword, comparePassword } = require("../helpers/bcryptPassword");
const User = require("../models/users");
const dev = require("../config");
const { sendEmailWithNodeMailer } = require("../helpers/email");
const { errorResponse, successResponse } = require("../helpers/responseHandler");


const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 2 } = req.query;
    const users = await User.find()
    .limit(limit)
    .skip((page - 1) * limit)
    return res.status(200).json({
      message: "All users returned:",
      users: users
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.fields;
    const { image } = req.files;
    if (!name || !email || !password || !phone) {
      errorResponse(res, 400, "Name, Email, Password or Phone Number are missing")
    }
    if (image && image.size > 5000000) {
      errorResponse(res, 400, "Image size too big - Images cannot be larger than 5mb")
    }

    const exists = await User.findOne({ email: email });
    if (exists) {
      errorResponse(res, 400, "User with this email already exists.")
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
        <p>Please click <a href="${dev.app.clientUrl}/api/users/activate/token=${token}" target="_blank">here</a> to activate your account. </p>    
        </html>
        `,
    };
    sendEmailWithNodeMailer(emailData);

    successResponse(res, 201, "A verification link has been sent to your provided email.", token);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
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
      console.log(name)
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
  try {
    const user = await User.findById( req.session.userID, { password: 0 } );
    return res.status(200).json({
      ok: true,
      user: user,
      message: "User returned"
    })
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
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

    req.session.userID = user._id;

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
    req.session.destroy();
    res.clearCookie('user_session');
    res.status(200).json({
      ok: true,
      message: "Logout successful!"
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    })
  }
}

const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.session.userID);
    res.status(200).json({
      ok: true,
      message: "User deleted",
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

const updateProfile = async (req, res) => {
  try {
    if (!req.fields.password) {
      res.status(500).json({
        message: 'Password missing'
      })
    } 
    const hashedPassword = await securePassword(req.fields.password);
    const updatedUser = await User.findByIdAndUpdate(req.session.userID, {
      ...req.fields, password: hashedPassword},
      {new: true},
    );

    if (!updatedUser) {
      res.status(400).json({
        ok: false,
        message: 'User was not updated'
      })
    };

    if (req.files.image) {
      const { image } = req.files;
      updatedUser.image.data = fs.readFileSync(image.path);
      updatedUser.image.contentType = image.type;
    }
    await updatedUser.save();

    res.status(200).json({
      message: 'User has been updated.'
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({
        message: 'Email or password missing'
      })
    }

    if (password.length < 6 && password.length > 18 ) {
      return res.status(404).json({
        message: 'Password must be a minimum of 6 characters and a maximum of 18 characters'
      })
    }

    const user = await User.findOne({email: email})
    if (!user) {
      return res.status(400).json({
        message: `No user found with an email of ${email}`
      })
    };

    const hashedPassword = await securePassword(password);

    const token = jwt.sign(
      { email, hashedPassword },
      dev.app.jwtSecretKey,
      { expiresIn: "10m" }
    );

    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
        <html>
        <h2>Hello ${user.name}!</h2>
        <p>Please click <a href="${dev.app.clientUrl}/api/users/reset-password/token=${token}" target="_blank">here</a> to reset your password. </p>    
        </html>
        `,
    };
    sendEmailWithNodeMailer(emailData);

    res.status(200).json({
      ok: true,
      message: 'An email has been sent for you to reset your password',
      token: token,
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token } = req.body;
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
      const { email, hashedPassword } = decoded;
      const exists = await User.findOne({ email: email });
      if (!exists) {
        return res.status(400).json({
          message: "User with this email does not exist.",
        });
      }

      const updateData = await User.updateOne(
        { email: email },
        {
          $set: {
            password: hashedPassword,
          }
        }
      )

      if (!updateData) {
        res.status(400).json({
          message: 'Reset password was not successful'
        })
      }

      return res.status(201).json({
        message: "Password has been reset",
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  getAllUsers,
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  userProfile,
  deleteProfile,
  updateProfile,
  forgotPassword,
  resetPassword
};
