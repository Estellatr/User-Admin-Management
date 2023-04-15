const formidable = require("express-formidable");
const { registerUser } = require("../controllers/users");
const router = require("express").Router();

router.post("/register", formidable(), registerUser);

module.exports = router;