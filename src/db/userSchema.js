// user schema

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      // for checking if the email entered is valid or not
      validate(email) {
        if (!validator.isEmail(email)) {
          throw new Error("email is not valid");
        }
      },
    },
    firstName: {
      required: true,
      type: String,
    },
    lastName: {
      required: true,
      type: String,
    },
    password: {
      // this data is hashed the first time it is stored and is hashed everytime it is changed
      required: true,
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    profilePic: {
      required: true,
      type: String,
    },
    tokens: [
      {
        // token for authentication, client can only make requests to the api through authentication
        token: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// function for generating a token for authentication
userSchema.methods.generateToken = async function () {
  const token = await jwt.sign(
    {
      _id: this._id.toString(),
      time: Date.now(),
    },
    "-- add your secret key here --"
  );
  this.tokens.push({
    token,
  });
  await this.save();
  return token;
};

// deleting critiacal data before sending back data to the user
userSchema.methods.toJSON = function () {
  let user = this.toObject();
  delete user._id;
  delete user.password;
  delete user.tokens;
  delete user.createdAt;
  delete user.updatedAt;
  delete user.__v;
  return user;
};

// function for hashing the password before saving it into the database
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8); // hashing this.password 8 times
  }
  next();
});

const User = mongoose.model("users", userSchema, "users");
module.exports = User;
