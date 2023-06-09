const jwt = require("jsonwebtoken");
const excelJS = require("exceljs");
const createError = require("http-errors");
const {
  securePassword,
  comparePassword,
} = require("../helpers/bcryptPassword");
const User = require("../models/users");
const dev = require("../config");
const { sendEmailWithNodeMailer } = require("../helpers/email");
const {
  errorResponse,
  successResponse,
} = require("../helpers/responseHandler");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      errorResponse(res, 400, "Email or Password missing.");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      errorResponse(res, 404, "User not found.");
    }

    if (user.is_admin === 0) {
      errorResponse(res, 400, "You must be an admin to access this page.");
    }

    const passwordMatched = await comparePassword(password, user.password);

    if (!passwordMatched) {
      return res.status(400).json({
        message: "Email or Password incorrect",
      });
    }

    const token = jwt.sign({ email }, dev.app.jwtAuthorizationKey, {
      expiresIn: "5m",
    });

    res.cookie("authToken", token, {
      expires: new Date(Date.now() + 1000 * 4 * 60),
      httpOnly: true,
      sameSite: "none",
      secure: false,
    });

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      },
      message: "Login successful!",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const logoutAdmin = (req, res) => {
  try {
    // req.session.destroy();
    // res.clearCookie('admin_session');
    res.clearCookie("authToken");
    res.status(200).json({
      ok: true,
      message: "Logout successful!",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find()
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await User.find({ is_admin: 0 }).countDocuments();
    successResponse(res, 200, "All Users Returned", { users: users, total: count});
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

const searchUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id });
    if (!user) throw createError(404, "No user found with this ID.");
    successResponse(res, 200, "User returned:", user);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

const deleteUserByAdmin = async (req, res) => {
  console.log("erg");
  try {
    const { id } = req.params;
    const foundUser = await User.findByIdAndDelete(id);
    if (!foundUser) {
      errorResponse(res, 400, "No user found with that ID");
    }
    await User.findByIdAndDelete(id);
    successResponse(res, 200, "User Deleted.");
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const hashedPassword = await securePassword(req.fields.password);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...req.fields,
        password: hashedPassword,
        image: req.files
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(400).json({
        ok: false,
        message: "User was not updated",
      });
    }

    await updatedUser.save();

    res.status(200).json({
      message: "User has been updated.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const exportUsers = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook();
    const workSheet = workbook.addWorksheet("Users");
    workSheet.columns = [
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Image", key: "image" },
      { header: "Phone", key: "phone" },
      { header: "Is Admin", key: "is_admin" },
      { header: "Is Verified", key: "is_verified" },
    ];
    const userData = await User.find({ is_admin: 0 });

    userData.map((user) => {
      workSheet.addRow(user);
    });

    workSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Decription", "attachment; filename=" + "users.xlsx");

    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  loginAdmin,
  logoutAdmin,
  deleteUserByAdmin,
  updateUserByAdmin,
  exportUsers,
  searchUser,
};
