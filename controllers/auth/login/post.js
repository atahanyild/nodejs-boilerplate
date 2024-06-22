const User = require("../../../models/user/User");

module.exports = (req, res) => {
  User.findUserByEmailAndVerifyPassword(req.body, (err, user) => {
    if (err) {
      if (err === "bad_request")
        return res.status(400).json({ error: "bad_request" });

      if (err === "database_error")
        return res.status(500).json({ error: "database_error" });

      if (err === "document_not_found")
        return res.status(404).json({ error: "document_not_found" });

      if (err === "password_verification")
        return res.status(401).json({ error: "password_verification" });
    }

    req.session.user = user;

    return res.status(200).json({ user });
  });
};
