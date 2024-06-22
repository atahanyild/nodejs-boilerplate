module.exports = (user, callback) => {
  if (!user || !user._id) return callback("document_not_found");

  return callback(null, {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
  });
};
