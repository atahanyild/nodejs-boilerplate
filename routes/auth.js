const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/isAuth");

const logoutGetController = require("../controllers/auth/logout/get");

const loginPostController = require("../controllers/auth/login/post");
const signupPostController = require("../controllers/auth/signup/post");

router.get("/logout", isAuth, logoutGetController);

router.post("/login", loginPostController);
router.post("/signup", signupPostController);

module.exports = router;
