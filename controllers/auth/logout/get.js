module.exports = (req, res) => {
  req.session.destroy();
  return res.status(200).json({ message: "logout" });
};
