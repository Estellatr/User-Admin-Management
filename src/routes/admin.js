const formidable = require("express-formidable");
const session = require('express-session');
const adminRouter = require("express").Router();

const dev = require('../config');
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");
const { loginAdmin, logoutAdmin, getAllUsers, deleteUserByAdmin, updateUserByAdmin, exportUsers } = require("../controllers/admin");
const { isAdmin } = require("../middlewares/isAdmin");

adminRouter.use(
    session({
        name: "admin_session",
        secret: dev.app.sessionSecretKey || 'jklaehrpue',
        resave: 'false',
        saveUninitialized: true,
        cookie: { secure: false, maxAge: 10 * 6000 },
    })
)

adminRouter.post("/login", isLoggedOut, loginAdmin);
// adminRouter.post("/dashboard", isLoggedIn, createUser);
adminRouter.put("/dashboard/:id", isLoggedIn, isAdmin, updateUserByAdmin);
adminRouter.get("/logout", isLoggedIn, logoutAdmin);
adminRouter.get("/dashboard/allUsers", isLoggedIn, getAllUsers);
adminRouter.get('/dashboard/export-users', exportUsers)
adminRouter.delete('dashboard/:id', isLoggedIn, isAdmin, deleteUserByAdmin);

module.exports = adminRouter;