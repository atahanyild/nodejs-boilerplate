const User = require("../models/user/User");
const fs = require("fs");

module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    User.findUserByIdAndFormat(req.session.user._id, (err, user) => {
      if (err) return res.status(401).json({ err: err });

      req.session.user = user;
      return next();
    });
  } else {
    return res.status(401).json({ err: "unauthorized" });
  }
};
