const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/isAuth");

const placeholderGetController = require("../controllers/placeholder/get");
const placeholderPostController = require("../controllers/placeholder/post");

router.get("/get", isAuth, placeholderGetController);

router.post("/post", isAuth, placeholderPostController);

module.exports = router;
