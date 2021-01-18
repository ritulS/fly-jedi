// file for reading from user database

const bcrypt = require("bcryptjs");
const User = require("./userSchema");

//function for user sign in using google
async function googleUserSignIn(email) {
  return await User.findOne({
    email,
  });
}

// function for user sign in
async function userSignIn(info) {
  const user = await User.findOne({
    email: info.email,
  });
  if (!user) {
    throw new Error();
  }
  const validity = await bcrypt.compare(info.password, user.password);
  if (!validity) {
    throw new Error();
  }
  return user;
}

async function newUser(userDetails) {
  userDetails.profilePic =
    "/img/profilepic" + Math.ceil(Math.random() * 10) + ".jpg"; // assigning a random img to user
  const user = new User(userDetails);
  await user.save();
  return user;
}

userDB_ = {
  googleUserSignIn,
  userSignIn,
  newUser,
};

module.exports = userDB_;
