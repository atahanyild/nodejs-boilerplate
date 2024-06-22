const mongoose = require("mongoose");
const validator = require("validator");

const toMongoId = require("../../utils/toMongoId");

const formatUser = require("./functions/formatUser");
const hashPassword = require("./functions/hashPassword");
const verifyPassword = require("./functions/verifyPassword");

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MIN_PASSWORD_LENGTH = 8;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: MIN_PASSWORD_LENGTH,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  name: {
    type: String,
    required: false,
    trim: true,
    minlength: MIN_PASSWORD_LENGTH,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
});

UserSchema.pre("save", hashPassword);

UserSchema.statics.findUserByIdAndFormat = function (id, callback) {
  const User = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback("bad_request");

  User.findById(mongoose.Types.ObjectId(id.toString()), (err, user) => {
    if (err) return callback("database_error");
    if (!user) return callback("document_not_found");

    formatUser(user, (err, user) => {
      if (err) return callback(err);

      return callback(null, user);
    });
  });
};

UserSchema.statics.findUserByEmailAndVerifyPassword = function (
  data,
  callback
) {
  const User = this;

  if (!data || typeof data != "object") return callback("bad_request");

  if (
    !data.email ||
    typeof data.email != "string" ||
    !validator.isEmail(data.email)
  )
    return callback("bad_request");

  if (!data.password || typeof data.password != "string")
    return callback("bad_request");

  User.findOne(
    {
      email: data.email.trim(),
    },
    (err, user) => {
      if (err) return callback("database_error");
      if (!user) return callback("document_not_found");

      verifyPassword(data.password.trim(), user.password, (res) => {
        if (!res) return callback("password_verification");

        formatUser(user, (err, user) => {
          if (err) return callback(err);

          return callback(null, user);
        });
      });
    }
  );
};

UserSchema.statics.createUser = function (data, callback) {
  const User = this;

  if (!data || typeof data != "object") return callback("bad_request");
  if (
    !data.email ||
    typeof data.email != "string" ||
    !validator.isEmail(data.email) ||
    !data.email.trim().length ||
    data.email.length > MAX_DATABASE_TEXT_FIELD_LENGTH
  )
    return callback("bad_request");

  if (
    !data.password ||
    typeof data.password != "string" ||
    data.password.trim().length < MIN_PASSWORD_LENGTH ||
    data.password.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH
  )
    return callback("bad_request");

  const newUser = new User({
    email: data.email,
    password: data.password,
  });

  newUser.save((err, user) => {
    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      return callback("duplicated_unique_field");
    if (err) return callback("database_error");

    formatUser(user, (err, user) => {
      if (err) return callback(err);

      return callback(null, user);
    });
  });
};

UserSchema.statics.findUserByIdAndUpdatePassword = function (
  id,
  data,
  callback
) {
  const User = this;

  if (!id || !toMongoId(id)) return callback("bad_request");

  if (!data || typeof data != "object") return callback("bad_request");

  if (
    !data.password ||
    typeof data.password != "string" ||
    data.password.trim().length < MIN_PASSWORD_LENGTH ||
    data.password.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH
  )
    return callback("bad_request");

  User.findById(toMongoId(id), (err, user) => {
    if (err) return callback("database_error");
    if (!user) return callback("document_not_found");

    user.password = data.password.trim();

    user.save((err, user) => {
      if (err) return callback("database_error");

      formatUser(user, (err, user) => {
        if (err) return callback(err);

        return callback(null, user);
      });
    });
  });
};

module.exports = mongoose.model("User", UserSchema);
