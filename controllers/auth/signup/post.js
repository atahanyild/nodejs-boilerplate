const User = require("../../../models/user/User");

module.exports = (req, res) => {
  User.createUser(req.body, (err, user) => {
    if (err) {
      if (err === "bad_request")
        return res.status(400).json({ error: "Bad request" });
      if (err === "database_error")
        return res.status(500).json({ error: "Database error" });
      if (err === "email_in_use")
        return res.status(400).json({ error: "Email in use" });
      return res.status(500).json({ error: "Internal server error" });
    }

    req.session.user = user;

    res.status(201).json({ user });
  });
};
