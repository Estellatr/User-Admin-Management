// const formidable = require("express-formidable");
// const session = require('express-session');
const { registerUser, verifyEmail, loginUser, logoutUser, userProfile, getAllUsers, deleteProfile, updateProfile, resetPassword, forgotPassword } = require("../controllers/users");
const userRouter = require("express").Router();
const dev = require("../config");
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");
const upload = require("../middlewares/fileUpload");

// userRouter.use(
//     session({
//         name: "user_session",
//         secret: dev.app.sessionSecretKey || 'jklaehrpue',
//         resave: 'false',
//         saveUninitialized: true,
//         cookie: { secure: false, maxAge: 10 * 6000 },
//     })
// )

userRouter.post("/register", upload.single("image"), registerUser);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/login", isLoggedOut, loginUser);
userRouter.post("/forgot-password", isLoggedOut, forgotPassword)
userRouter.post("/reset-password", isLoggedOut, resetPassword)

userRouter.get("/allUsers", getAllUsers);
userRouter.get("/logout", isLoggedIn, logoutUser);
userRouter.get("/:id", isLoggedIn, userProfile)


userRouter;

userRouter.route("/")
.delete(isLoggedIn, deleteProfile)
.put(isLoggedIn, upload.single("image"), updateProfile)

module.exports = userRouter;