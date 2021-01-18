const jwt = require("jsonwebtoken");
const User = require("../db/userSchema");

// for editing using your account
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decode = jwt.verify(token, "-- add secret string key here --");

    // Checking if the user exists
    const user = await User.findOne({
      _id: decode._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }
    req.user = user;

    next();
  } catch {
    res
      .clearCookie("token", {
        path: "/",
        httpOnly: true,
        // sameSite: "strict",
      })
      .status(401)
      .send();
  }
};

module.exports = auth;
