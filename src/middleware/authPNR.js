// file for one cookie when user wants to change flight booking using PNR number
const jwt = require("jsonwebtoken");
const { findWithPNR } = require("../db/bookingReadWrite");

// on click change booking, the frontend should send a token request
const authPNR = async (req, res, next) => {
  try {
    const token = req.cookies.tokenPNR;

    const decode = jwt.verify(token, "-- add secret string key here --");

    const booking = await findWithPNR(decode._id);

    if (!booking) {
      throw new Error();
    }

    if (booking.status == "cancelled") {
      throw new Error();
    }

    req.booking = booking;
    next();
  } catch {
    res
      .clearCookie("tokenPNR", {
        path: "/",
        httpOnly: true,
        // sameSite: "strict",
      })
      .status(401)
      .send();
  }
};

module.exports = authPNR;
