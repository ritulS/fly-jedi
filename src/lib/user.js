// file for exposing the DB user read and write functions
const { OAuth2Client } = require("google-auth-library");
const userDB_ = require("../db/userReadWrite");
const bookingDB_ = require("../db/bookingReadWrite");
const getRecom = require("./getRecom");
const { getAllBookingsByEmail } = require("../db/bookingReadWrite");

const client = new OAuth2Client("-- add google oauth2 client id here --");

// returns all booking that the user has reserved and past travels, removes cancelled bookings
async function getUserInfo(user_) {
  let user = user_.toJSON();
  user.bookings = [];
  const bookings = await getAllBookingsByEmail(user.email);
  for (let booking of bookings) {
    if (booking.status != "cancelled")
      user.bookings.push({
        dates: booking.dates,
        pnr: booking._id,
        status: booking.status,
        travelRoute: booking.travelRoute,
      });
  }
  return user;
}

async function getUserRecommendations(user) {
  let bookings = [];
  const bookings_ = await bookingDB_.getAllBookingsByEmail(user.email);
  for (let booking of bookings_) {
    if (booking.status != "cancelled")
      bookings.push({
        dates: booking.dates,
        pnr: booking._id,
        status: booking.status,
        travelRoute: booking.travelRoute,
      });
  }
  return getRecom(bookings);
}

async function googleUserSignIn(token_) {
  const ticket = await client.verifyIdToken({
    idToken: token_,
    audience: "-- add google client id here --",
  });
  const payload = ticket.getPayload();
  const email = payload["email"];
  let user = await userDB_.googleUserSignIn(email);

  // if the user doesn't exist create a new account using the google details
  if (!user) {
    user = await userDB_.newUser({
      email,
      firstName: payload["given_name"],
      lastName: payload["family_name"],
      password: String(Date.now()) + payload["name"],
    });
  }
  const token = await user.generateToken();
  return token;
}

async function newUser(userDetails) {
  const user = await userDB_.newUser(userDetails);
  const token = await user.generateToken();
  return token;
}

async function userSignIn(info) {
  let user = await userDB_.userSignIn(info);
  const token = await user.generateToken();
  return token;
}

async function userSignOut(user, token_) {
  user.tokens = user.tokens.filter((token) => token.token != token_);
  await user.save();
}

async function userSignOutAll(user) {
  user.tokens = [];
  await user.save();
}

async function userUpdate(user, updates) {
  for (i in updates) {
    user[i] = updates[i];
  }
  await user.save();
}

async function userUpdatePassword(user, updates) {
  user.password = updates.password;
  await user.save();
}

const userDB = {
  googleUserSignIn,
  getUserInfo,
  getUserRecommendations,
  newUser,
  userSignIn,
  userSignOut,
  userSignOutAll,
  userUpdate,
  userUpdatePassword,
};

module.exports = userDB;
